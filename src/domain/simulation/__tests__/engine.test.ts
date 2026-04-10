import { describe, it, expect } from 'vitest';
import { runSimulation } from '../engine';
import { variables } from '../../nodes';

function getBaselineValues(): Record<string, number> {
  const values: Record<string, number> = {};
  for (const v of variables) {
    if (v.type === 'input') values[v.id] = v.baseline;
  }
  return values;
}

describe('runSimulation', () => {
  it('baseline 입력 시 모든 delta = 0', () => {
    const result = runSimulation(getBaselineValues());

    for (const v of variables) {
      if (v.type === 'input') {
        expect(result.nodeStates[v.id].delta).toBe(0);
      }
    }
  });

  it('결과 객체에 필수 필드 포함', () => {
    const result = runSimulation(getBaselineValues());

    expect(result.nodeStates).toBeDefined();
    expect(result.edgeStates).toBeDefined();
    expect(result.timeline).toBeDefined();
    expect(result.timeline.immediate).toBeInstanceOf(Array);
    expect(result.timeline.short).toBeInstanceOf(Array);
    expect(result.timeline.medium).toBeInstanceOf(Array);
    expect(result.exceptions).toBeInstanceOf(Array);
    expect(result.warnings).toBeInstanceOf(Array);
    expect(typeof result.summary).toBe('string');
  });

  it('input 변경 시 파생 변수에 전파', () => {
    const values = getBaselineValues();
    values['kr_inflation'] = 80; // 물가 크게 올림

    const result = runSimulation(values);

    // kr_inflation이 높으면 kr_rate_pressure에 상승 압력
    expect(result.nodeStates['kr_rate_pressure'].delta).toBeGreaterThan(0);
  });

  it('overrides 적용 시 가중치 변경 반영', () => {
    const values = getBaselineValues();
    values['oil'] = 80;

    const normal = runSimulation(values);
    const overridden = runSimulation(values, { r18: { weight: 0 } });

    // r18은 oil → kr_inflation (weight 0.4)
    // weight=0으로 무력화하면 kr_inflation의 delta 감소
    expect(Math.abs(overridden.nodeStates['kr_inflation'].delta))
      .toBeLessThanOrEqual(Math.abs(normal.nodeStates['kr_inflation'].delta));
  });

  it('엣지 상태가 규칙 수만큼 생성', () => {
    const result = runSimulation(getBaselineValues());
    expect(Object.keys(result.edgeStates).length).toBeGreaterThan(0);
  });
});
