import type {
  CausalRule,
  SimulationResult,
  NodeState,
  EdgeState,
  RealismWarning,
} from '../types';
import { checkContradictions } from '../contradictions';
import { variables } from '../nodes';
import { getResolvedRules } from '../resolveRules';
import {
  propagate,
  computePropagationDepths,
  evaluateException,
} from './propagation';
import {
  deltaToDisplayState,
  deltaToIntensity,
  intensityToStrength,
} from './stateMapper';
import { buildTimeline, generateSummary } from './timeline';
import {
  EDGE_SIGNAL_THRESHOLD,
  INTENSITY_THRESHOLD,
  MAX_ITERATIONS,
} from './config';

const allVarIds = new Set(variables.map((v) => v.id));

function computeInputDeltas(
  inputValues: Record<string, number>,
): Record<string, number> {
  const deltas: Record<string, number> = {};
  for (const v of variables) {
    if (v.type === 'input') {
      deltas[v.id] = (inputValues[v.id] ?? v.baseline) - v.baseline;
    }
  }
  return deltas;
}

function buildNodeStates(
  inputValues: Record<string, number>,
  allDeltas: Record<string, number>,
): Record<string, NodeState> {
  const states: Record<string, NodeState> = {};

  for (const v of variables) {
    const delta = allDeltas[v.id] ?? 0;

    states[v.id] = {
      variableId: v.id,
      // input: 슬라이더 값 유지, derived: baseline + delta
      value: v.type === 'input'
        ? (inputValues[v.id] ?? v.baseline)
        : v.baseline + delta,
      // 모든 변수의 delta는 사용자 delta + 규칙 압력의 합산
      delta,
      displayState: deltaToDisplayState(delta),
      intensity: deltaToIntensity(delta),
    };
  }

  return states;
}

function buildEdgeStates(
  allDeltas: Record<string, number>,
  inputDeltas: Record<string, number>,
  rules: CausalRule[],
): Record<string, EdgeState> {
  // 실제 변경된 input을 기점(depth 0)으로 동적 순서 계산
  const dynamicDepth: Record<string, number> = {};
  for (const [id, delta] of Object.entries(inputDeltas)) {
    if (Math.abs(delta) >= EDGE_SIGNAL_THRESHOLD) dynamicDepth[id] = 0;
  }

  let changed = true;
  let iter = 0;
  while (changed && iter < MAX_ITERATIONS) {
    changed = false;
    iter++;
    for (const rule of rules) {
      if (dynamicDepth[rule.source] === undefined) continue;
      if (Math.abs(allDeltas[rule.source] ?? 0) < EDGE_SIGNAL_THRESHOLD) continue;
      const newDepth = dynamicDepth[rule.source] + 1;
      if (dynamicDepth[rule.target] === undefined || newDepth < dynamicDepth[rule.target]) {
        dynamicDepth[rule.target] = newDepth;
        changed = true;
      }
    }
  }

  const states: Record<string, EdgeState> = {};

  for (const rule of rules) {
    const sourceDelta = allDeltas[rule.source] ?? 0;
    const targetDelta = allDeltas[rule.target] ?? 0;
    const absSource = Math.abs(sourceDelta);
    const active = absSource >= INTENSITY_THRESHOLD || (absSource >= EDGE_SIGNAL_THRESHOLD && Math.abs(targetDelta) >= INTENSITY_THRESHOLD);
    const effectiveDirection =
      sourceDelta >= 0 ? rule.direction :
      rule.direction === 'positive' ? 'negative' : 'positive';

    states[rule.id] = {
      ruleId: rule.id,
      active,
      strength: active ? Math.max(intensityToStrength(deltaToIntensity(sourceDelta)), 0.1) : 0,
      direction: effectiveDirection,
      order: active ? (dynamicDepth[rule.source] ?? 0) + 1 : 0,
    };
  }

  return states;
}

function collectExceptions(
  allDeltas: Record<string, number>,
  rules: CausalRule[],
): Array<{ ruleId: string; text: string }> {
  const result: Array<{ ruleId: string; text: string }> = [];

  for (const rule of rules) {
    if (!rule.exceptions) continue;
    for (const exception of rule.exceptions) {
      if (evaluateException(exception, allDeltas)) {
        result.push({ ruleId: rule.id, text: exception.text });
      }
    }
  }

  return result;
}

export function runSimulation(
  inputValues: Record<string, number>,
  overrides: Record<string, { weight: number }> = {},
): SimulationResult {
  const rules = getResolvedRules(overrides);
  const depths = computePropagationDepths(rules, allVarIds);
  const inputDeltas = computeInputDeltas(inputValues);

  const allDeltas = propagate(inputDeltas, rules, depths);

  const nodeStates = buildNodeStates(inputValues, allDeltas);
  const edgeStates = buildEdgeStates(allDeltas, inputDeltas, rules);
  const timeline = buildTimeline(allDeltas, rules);
  const exceptions = collectExceptions(allDeltas, rules);
  const summary = generateSummary(allDeltas, inputDeltas);

  return {
    nodeStates,
    edgeStates,
    timeline,
    exceptions,
    warnings: [],
    summary,
  };
}

// 고정(pin) 메커니즘 적용 시뮬레이션
// - 고정 input을 target으로 삼는 규칙 제외 (고정 input은 외부 압력 차단)
// - 엣지 시각화는 전체 규칙 기준으로 평가
export function runSimulationWithPins(
  inputValues: Record<string, number>,
  pinnedInputs: Set<string>,
  warnings: RealismWarning[],
  overrides: Record<string, { weight: number }> = {},
): SimulationResult {
  const rules = getResolvedRules(overrides);
  const depths = computePropagationDepths(rules, allVarIds);
  const inputDeltas = computeInputDeltas(inputValues);

  // 고정 input을 target으로 삼는 규칙 필터링
  const activeRules = rules.filter((r) => !pinnedInputs.has(r.target));

  // 전파: 필터링된 규칙으로 실행
  const allDeltas = propagate(inputDeltas, activeRules, depths);

  const nodeStates = buildNodeStates(inputValues, allDeltas);
  // 엣지 상태는 전체 규칙으로 평가 (필터링된 규칙이라도 시각적으로 표시)
  const edgeStates = buildEdgeStates(allDeltas, inputDeltas, rules);
  // 타임라인도 전체 규칙으로 설명 텍스트 생성
  const timeline = buildTimeline(allDeltas, rules);
  const exceptions = collectExceptions(allDeltas, rules);
  const summary = generateSummary(allDeltas, inputDeltas);

  return {
    nodeStates,
    edgeStates,
    timeline,
    exceptions,
    warnings,
    summary,
  };
}

export { checkContradictions };
