import type { CausalRule, ConditionalException } from '../types';
import { variables } from '../nodes';
import { clamp } from '../../utils/clamp';

const DAMPING_FACTOR = 0.7;

const inputIds = new Set(
  variables.filter((v) => v.type === 'input').map((v) => v.id),
);

// BFS로 각 변수의 입력으로부터의 최소 전파 깊이를 계산
export function computePropagationDepths(
  rules: CausalRule[],
): Record<string, number> {
  const depths: Record<string, number> = {};

  // 입력 변수의 깊이는 0
  for (const id of inputIds) {
    depths[id] = 0;
  }

  // 파생 변수만 대상으로 하는 규칙 필터링
  const effectiveRules = rules.filter((r) => !inputIds.has(r.target));

  // 반복적으로 깊이 계산 (위상 정렬 대용)
  let changed = true;
  let iterations = 0;
  const maxIterations = 20;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (const rule of effectiveRules) {
      if (depths[rule.source] === undefined) continue;

      const newDepth = depths[rule.source] + 1;
      if (depths[rule.target] === undefined || newDepth < depths[rule.target]) {
        depths[rule.target] = newDepth;
        changed = true;
      }
    }
  }

  return depths;
}

// 예외 조건 평가
export function evaluateException(
  exception: ConditionalException,
  deltas: Record<string, number>,
): boolean {
  return exception.conditions.every((cond) => {
    const delta = deltas[cond.variable] ?? 0;
    if (cond.operator === 'gt') return delta > cond.threshold;
    return delta < cond.threshold;
  });
}

// DAG 전파 실행
export function propagate(
  inputDeltas: Record<string, number>,
  rules: CausalRule[],
  depths: Record<string, number>,
): Record<string, number> {
  const accumulated: Record<string, number> = {};

  // 입력 변수의 delta를 초기화
  for (const [id, delta] of Object.entries(inputDeltas)) {
    accumulated[id] = delta;
  }

  // 규칙을 lag 순서로 정렬
  const lagOrder: Record<string, number> = {
    immediate: 0,
    short: 1,
    medium: 2,
  };
  const sortedRules = [...rules]
    .filter((r) => !inputIds.has(r.target))
    .sort((a, b) => lagOrder[a.lag] - lagOrder[b.lag]);

  // 각 규칙 적용
  for (const rule of sortedRules) {
    const sourceDelta = accumulated[rule.source] ?? 0;
    if (sourceDelta === 0) continue;

    const directionMultiplier = rule.direction === 'positive' ? 1 : -1;

    // 감쇠 계수: source의 깊이가 1 이상이면 적용
    const sourceDepth = depths[rule.source] ?? 0;
    const damping = sourceDepth >= 1 ? Math.pow(DAMPING_FACTOR, sourceDepth) : 1;

    const effect = sourceDelta * rule.weight * directionMultiplier * damping;

    accumulated[rule.target] = (accumulated[rule.target] ?? 0) + effect;
  }

  // 파생 변수만 추출하고 클램핑 적용
  const result: Record<string, number> = {};
  for (const [id, value] of Object.entries(accumulated)) {
    if (!inputIds.has(id)) {
      result[id] = clamp(Math.round(value * 10) / 10, -50, 50);
    }
  }

  return result;
}
