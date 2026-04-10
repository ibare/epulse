import type { CausalRule, ConditionalException } from '../types';
import { clamp } from '../../utils/clamp';
import {
  DAMPING_FACTOR,
  DAMPING_MIN_DEPTH,
  MAX_ITERATIONS,
  DELTA_CLAMP_MIN,
  DELTA_CLAMP_MAX,
} from './config';

// 위상 정렬 (Kahn's algorithm)
function topologicalSort(
  varIds: Set<string>,
  rules: CausalRule[],
): string[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const id of varIds) {
    inDegree.set(id, 0);
    adjacency.set(id, []);
  }

  for (const rule of rules) {
    adjacency.get(rule.source)?.push(rule.target);
    inDegree.set(rule.target, (inDegree.get(rule.target) ?? 0) + 1);
  }

  // 루트 노드 (incoming 없음)부터 시작
  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);

    for (const neighbor of adjacency.get(current) ?? []) {
      const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  // 순환이 있으면 누락된 변수 추가 (방어적)
  for (const id of varIds) {
    if (!order.includes(id)) order.push(id);
  }

  return order;
}

// 그래프에서 루트(incoming 규칙 없음)로부터의 최소 깊이 계산
export function computePropagationDepths(
  rules: CausalRule[],
  allVarIds: Set<string>,
): Record<string, number> {
  const depths: Record<string, number> = {};
  const incomingTargets = new Set(rules.map((r) => r.target));

  // 루트 = incoming 규칙이 없는 변수
  for (const id of allVarIds) {
    if (!incomingTargets.has(id)) {
      depths[id] = 0;
    }
  }

  // BFS로 깊이 계산
  let changed = true;
  let iterations = 0;
  while (changed && iterations < MAX_ITERATIONS) {
    changed = false;
    iterations++;

    for (const rule of rules) {
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

// DAG 전파 실행 — 위상 정렬 기반, input 변수도 target 허용
export function propagate(
  inputDeltas: Record<string, number>,
  rules: CausalRule[],
  depths: Record<string, number>,
): Record<string, number> {
  // 모든 변수 ID 수집
  const allVarIds = new Set<string>(Object.keys(inputDeltas));
  for (const rule of rules) {
    allVarIds.add(rule.source);
    allVarIds.add(rule.target);
  }

  // 위상 정렬
  const order = topologicalSort(allVarIds, rules);

  // 누적값 초기화 (사용자 입력 delta)
  const accumulated: Record<string, number> = {};
  for (const [id, delta] of Object.entries(inputDeltas)) {
    accumulated[id] = delta;
  }

  // 규칙을 source별로 그룹핑
  const rulesBySource = new Map<string, CausalRule[]>();
  for (const rule of rules) {
    if (!rulesBySource.has(rule.source)) rulesBySource.set(rule.source, []);
    rulesBySource.get(rule.source)!.push(rule);
  }

  // 위상 순서대로 처리
  for (const varId of order) {
    const sourceDelta = accumulated[varId] ?? 0;
    if (sourceDelta === 0) continue;

    const outRules = rulesBySource.get(varId) ?? [];
    for (const rule of outRules) {
      const directionMultiplier = rule.direction === 'positive' ? 1 : -1;

      // 감쇠: source의 깊이가 DAMPING_MIN_DEPTH 이상이면 적용
      const sourceDepth = depths[rule.source] ?? 0;
      const damping = sourceDepth >= DAMPING_MIN_DEPTH
        ? Math.pow(DAMPING_FACTOR, sourceDepth - 1)
        : 1;

      const effect = sourceDelta * rule.weight * directionMultiplier * damping;
      accumulated[rule.target] = (accumulated[rule.target] ?? 0) + effect;
    }
  }

  // 모든 변수의 최종 delta를 클램핑하여 반환
  const result: Record<string, number> = {};
  for (const [id, value] of Object.entries(accumulated)) {
    result[id] = clamp(Math.round(value * 10) / 10, DELTA_CLAMP_MIN, DELTA_CLAMP_MAX);
  }

  return result;
}
