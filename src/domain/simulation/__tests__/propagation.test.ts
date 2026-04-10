import { describe, it, expect } from 'vitest';
import type { CausalRule, ConditionalException } from '../../types';
import {
  computePropagationDepths,
  evaluateException,
  propagate,
} from '../propagation';

function makeRule(overrides: Partial<CausalRule> & Pick<CausalRule, 'id' | 'source' | 'target'>): CausalRule {
  return {
    weight: 0.5,
    direction: 'positive',
    lag: 'immediate',
    explanation: '',
    ...overrides,
  };
}

describe('computePropagationDepths', () => {
  it('루트 노드는 깊이 0', () => {
    const rules = [makeRule({ id: 'r1', source: 'A', target: 'B' })];
    const depths = computePropagationDepths(rules, new Set(['A', 'B']));
    expect(depths['A']).toBe(0);
    expect(depths['B']).toBe(1);
  });

  it('체인 A→B→C 에서 깊이 순차 증가', () => {
    const rules = [
      makeRule({ id: 'r1', source: 'A', target: 'B' }),
      makeRule({ id: 'r2', source: 'B', target: 'C' }),
    ];
    const depths = computePropagationDepths(rules, new Set(['A', 'B', 'C']));
    expect(depths['A']).toBe(0);
    expect(depths['B']).toBe(1);
    expect(depths['C']).toBe(2);
  });
});

describe('evaluateException', () => {
  it('gt 조건 충족 시 true', () => {
    const exception: ConditionalException = {
      conditions: [{ variable: 'x', operator: 'gt', threshold: 10 }],
      text: '',
    };
    expect(evaluateException(exception, { x: 15 })).toBe(true);
  });

  it('gt 조건 미충족 시 false', () => {
    const exception: ConditionalException = {
      conditions: [{ variable: 'x', operator: 'gt', threshold: 10 }],
      text: '',
    };
    expect(evaluateException(exception, { x: 5 })).toBe(false);
  });

  it('lt 조건 충족 시 true', () => {
    const exception: ConditionalException = {
      conditions: [{ variable: 'x', operator: 'lt', threshold: -5 }],
      text: '',
    };
    expect(evaluateException(exception, { x: -10 })).toBe(true);
  });

  it('복합 조건 모두 충족해야 true', () => {
    const exception: ConditionalException = {
      conditions: [
        { variable: 'x', operator: 'gt', threshold: 10 },
        { variable: 'y', operator: 'lt', threshold: 0 },
      ],
      text: '',
    };
    expect(evaluateException(exception, { x: 15, y: -5 })).toBe(true);
    expect(evaluateException(exception, { x: 15, y: 5 })).toBe(false);
  });
});

describe('propagate', () => {
  it('단일 규칙에서 positive 방향 전파', () => {
    const rules = [makeRule({ id: 'r1', source: 'A', target: 'B', weight: 0.5, direction: 'positive' })];
    const depths = computePropagationDepths(rules, new Set(['A', 'B']));
    const result = propagate({ A: 10 }, rules, depths);

    expect(result['A']).toBe(10);
    expect(result['B']).toBe(5); // 10 * 0.5 * 1 (no damping at depth 1)
  });

  it('negative 방향은 부호 반전', () => {
    const rules = [makeRule({ id: 'r1', source: 'A', target: 'B', weight: 0.5, direction: 'negative' })];
    const depths = computePropagationDepths(rules, new Set(['A', 'B']));
    const result = propagate({ A: 10 }, rules, depths);

    expect(result['B']).toBe(-5); // 10 * 0.5 * (-1)
  });

  it('감쇠는 depth >= 2 에서 적용', () => {
    const rules = [
      makeRule({ id: 'r1', source: 'A', target: 'B', weight: 1.0 }),
      makeRule({ id: 'r2', source: 'B', target: 'C', weight: 1.0 }),
    ];
    const depths = computePropagationDepths(rules, new Set(['A', 'B', 'C']));

    // B: depth 1 → 감쇠 없음 → B = 10
    // C: source(B) depth 1 → 감쇠 없음... 아니, B의 depth=1 < 2이므로 damping=1
    // C: depth 2, source depth=1 → damping = 1 (sourceDepth=1 < 2)
    const result = propagate({ A: 10 }, rules, depths);

    expect(result['A']).toBe(10);
    expect(result['B']).toBe(10); // depth 1, no damping
    expect(result['C']).toBe(10); // source(B) depth 1 < DAMPING_MIN_DEPTH(2), no damping
  });

  it('depth >= DAMPING_MIN_DEPTH 인 source에서 감쇠 적용', () => {
    const rules = [
      makeRule({ id: 'r1', source: 'A', target: 'B', weight: 1.0 }),
      makeRule({ id: 'r2', source: 'B', target: 'C', weight: 1.0 }),
      makeRule({ id: 'r3', source: 'C', target: 'D', weight: 1.0 }),
    ];
    const depths = computePropagationDepths(rules, new Set(['A', 'B', 'C', 'D']));

    // A: depth 0, B: depth 1, C: depth 2, D: depth 3
    // A→B: sourceDepth=0 < 2 → damping=1 → B=10
    // B→C: sourceDepth=1 < 2 → damping=1 → C=10
    // C→D: sourceDepth=2 >= 2 → damping=0.7^(2-1)=0.7 → D=10*0.7=7
    const result = propagate({ A: 10 }, rules, depths);

    expect(result['D']).toBe(7); // 10 * 1.0 * 0.7
  });

  it('클램핑: -50 ~ 50 범위 제한', () => {
    const rules = [makeRule({ id: 'r1', source: 'A', target: 'B', weight: 1.0 })];
    const depths = computePropagationDepths(rules, new Set(['A', 'B']));
    const result = propagate({ A: 100 }, rules, depths);

    expect(result['A']).toBe(50); // clamped
    expect(result['B']).toBe(50); // clamped
  });
});
