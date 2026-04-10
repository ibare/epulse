import type {
  CausalRule,
  SimulationResult,
  NodeState,
  EdgeState,
  TimelineItem,
  RealismWarning,
} from '../types';
import { checkContradictions } from '../contradictions';
import { variables, variableMap } from '../nodes';
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

const allVarIds = new Set(variables.map((v) => v.id));

const inputIds = new Set(
  variables.filter((v) => v.type === 'input').map((v) => v.id),
);

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
    if (Math.abs(delta) >= 1) dynamicDepth[id] = 0;
  }

  let changed = true;
  let iter = 0;
  while (changed && iter < 30) {
    changed = false;
    iter++;
    for (const rule of rules) {
      if (dynamicDepth[rule.source] === undefined) continue;
      if (Math.abs(allDeltas[rule.source] ?? 0) < 4) continue;
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
    const absDelta = Math.abs(sourceDelta);
    const active = absDelta >= 4;
    const effectiveDirection =
      sourceDelta >= 0 ? rule.direction :
      rule.direction === 'positive' ? 'negative' : 'positive';

    states[rule.id] = {
      ruleId: rule.id,
      active,
      strength: intensityToStrength(deltaToIntensity(sourceDelta)),
      direction: effectiveDirection,
      order: active ? (dynamicDepth[rule.source] ?? 0) + 1 : 0,
    };
  }

  return states;
}

function buildTimeline(
  allDeltas: Record<string, number>,
  allRules: CausalRule[],
): {
  immediate: TimelineItem[];
  short: TimelineItem[];
  medium: TimelineItem[];
} {
  const timeline: Record<string, TimelineItem[]> = {
    immediate: [],
    short: [],
    medium: [],
  };

  // 변수별로 관련 규칙 그룹핑 (target 기준)
  const targetRuleMap: Record<string, CausalRule[]> = {};
  for (const rule of allRules) {
    if (!targetRuleMap[rule.target]) targetRuleMap[rule.target] = [];
    targetRuleMap[rule.target].push(rule);
  }

  // 유의미한 delta가 있는 변수에 대해 타임라인 항목 생성
  for (const [targetId, targetRules] of Object.entries(targetRuleMap)) {
    const delta = allDeltas[targetId] ?? 0;

    // input 변수의 경우: 규칙에 의한 압력만 있을 때 표시
    // (사용자가 직접 변경한 것은 "원인"이므로 타임라인에 안 넣음)
    const isInput = inputIds.has(targetId);
    if (isInput) {
      // 이 input에 영향을 주는 규칙의 실제 효과 합산
      const rulePressure = targetRules.reduce((sum, rule) => {
        const sourceDelta = allDeltas[rule.source] ?? 0;
        if (Math.abs(sourceDelta) < 1) return sum;
        const dir = rule.direction === 'positive' ? 1 : -1;
        return sum + sourceDelta * rule.weight * dir;
      }, 0);
      if (Math.abs(rulePressure) < 2) continue;
    } else {
      if (Math.abs(delta) < 1) continue;
    }

    const variable = variableMap[targetId];
    if (!variable) continue;

    const lagPriority: Record<string, number> = {
      immediate: 0,
      short: 1,
      medium: 2,
    };
    const primaryLag = targetRules
      .filter((r) => Math.abs(allDeltas[r.source] ?? 0) >= 1)
      .sort((a, b) => lagPriority[a.lag] - lagPriority[b.lag])[0]?.lag ?? 'medium';

    const activeExplanations = targetRules
      .filter((r) => Math.abs(allDeltas[r.source] ?? 0) >= 1)
      .map((r) => r.explanation);

    const exceptionTexts: string[] = [];
    for (const rule of targetRules) {
      if (!rule.exceptions) continue;
      for (const exception of rule.exceptions) {
        if (evaluateException(exception, allDeltas)) {
          exceptionTexts.push(exception.text);
        }
      }
    }

    const item: TimelineItem = {
      variableId: targetId,
      label: variable.label,
      region: variable.region,
      delta,
      displayState: deltaToDisplayState(delta),
      explanation: activeExplanations.join(' '),
      exceptions: exceptionTexts,
    };

    timeline[primaryLag].push(item);
  }

  for (const items of Object.values(timeline)) {
    items.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  }

  return timeline as {
    immediate: TimelineItem[];
    short: TimelineItem[];
    medium: TimelineItem[];
  };
}

function generateSummary(
  allDeltas: Record<string, number>,
  inputDeltas: Record<string, number>,
): string {
  // 파생 변수 + 규칙으로 영향받은 input 변수 중 유의미한 것
  const significant = Object.entries(allDeltas)
    .filter(([id, d]) => {
      if (inputIds.has(id)) {
        // input의 경우: 사용자 delta와 다르면 규칙 영향이 있다는 뜻
        const userDelta = inputDeltas[id] ?? 0;
        return Math.abs(d) >= 4 && Math.abs(d - userDelta) >= 2;
      }
      return Math.abs(d) >= 4;
    })
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));

  if (significant.length === 0) {
    const hasInputChange = Object.values(inputDeltas).some((d) => Math.abs(d) >= 4);
    if (!hasInputChange) {
      return '현재 모든 경제 변수가 기준 수준에 있습니다. 좌측 패널에서 변수를 조작하거나 프리셋 시나리오를 선택해보세요.';
    }
    return '현재 입력 변화에 의한 유의미한 시장 영향이 제한적입니다.';
  }

  const top = significant.slice(0, 3);
  const descriptions = top.map(([id, delta]) => {
    const v = variableMap[id];
    if (!v) return '';
    const state = deltaToDisplayState(delta);
    return `${v.label}에 ${state}이 형성되고 있습니다`;
  });

  return `현재 시나리오에서 ${descriptions.join(', ')}.`;
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
): SimulationResult {
  const rules = getResolvedRules();
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
): SimulationResult {
  const rules = getResolvedRules();
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
