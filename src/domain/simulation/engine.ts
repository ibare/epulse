import type {
  CausalRule,
  SimulationResult,
  NodeState,
  EdgeState,
  TimelineItem,
} from '../types';
import { variables, variableMap } from '../nodes';
import { rules } from '../rules';
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

// 전파 깊이를 앱 초기화 시 캐싱
const depths = computePropagationDepths(rules);

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
  inputDeltas: Record<string, number>,
  derivedDeltas: Record<string, number>,
): Record<string, NodeState> {
  const states: Record<string, NodeState> = {};

  for (const v of variables) {
    if (v.type === 'input') {
      const value = inputValues[v.id] ?? v.baseline;
      const delta = inputDeltas[v.id] ?? 0;
      states[v.id] = {
        variableId: v.id,
        value,
        delta,
        displayState: deltaToDisplayState(delta),
        intensity: deltaToIntensity(delta),
      };
    } else {
      const delta = derivedDeltas[v.id] ?? 0;
      states[v.id] = {
        variableId: v.id,
        value: v.baseline + delta,
        delta,
        displayState: deltaToDisplayState(delta),
        intensity: deltaToIntensity(delta),
      };
    }
  }

  return states;
}

function buildEdgeStates(
  allDeltas: Record<string, number>,
): Record<string, EdgeState> {
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
    };
  }

  return states;
}

function buildTimeline(
  derivedDeltas: Record<string, number>,
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

  // 파생 변수별로 관련 규칙 그룹핑
  const targetRuleMap: Record<string, CausalRule[]> = {};
  for (const rule of allRules) {
    if (inputIds.has(rule.target)) continue;
    if (!targetRuleMap[rule.target]) targetRuleMap[rule.target] = [];
    targetRuleMap[rule.target].push(rule);
  }

  // 각 파생 변수에 대해 타임라인 항목 생성
  for (const [targetId, targetRules] of Object.entries(targetRuleMap)) {
    const delta = derivedDeltas[targetId] ?? 0;
    if (Math.abs(delta) < 1) continue;

    const variable = variableMap[targetId];
    if (!variable) continue;

    // 해당 target에 영향을 주는 규칙 중 가장 빠른 lag 결정
    const lagPriority: Record<string, number> = {
      immediate: 0,
      short: 1,
      medium: 2,
    };
    const primaryLag = targetRules
      .filter((r) => Math.abs(allDeltas[r.source] ?? 0) >= 1)
      .sort((a, b) => lagPriority[a.lag] - lagPriority[b.lag])[0]?.lag ?? 'medium';

    // 활성 규칙의 설명 수집
    const activeExplanations = targetRules
      .filter((r) => Math.abs(allDeltas[r.source] ?? 0) >= 1)
      .map((r) => r.explanation);

    // 예외 수집
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

  // 각 구간 내에서 delta 절대값 기준 내림차순 정렬
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
  derivedDeltas: Record<string, number>,
  inputDeltas: Record<string, number>,
): string {
  const significantDerived = Object.entries(derivedDeltas)
    .filter(([, d]) => Math.abs(d) >= 4)
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));

  if (significantDerived.length === 0) {
    // 입력 변경이 있는지 확인
    const hasInputChange = Object.values(inputDeltas).some((d) => Math.abs(d) >= 4);
    if (!hasInputChange) {
      return '현재 모든 경제 변수가 기준 수준에 있습니다. 좌측 패널에서 변수를 조작하거나 프리셋 시나리오를 선택해보세요.';
    }
    return '현재 입력 변화에 의한 유의미한 시장 영향이 제한적입니다.';
  }

  const top = significantDerived.slice(0, 2);
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
  // 1. 입력 delta 계산
  const inputDeltas = computeInputDeltas(inputValues);

  // 2. DAG 전파 실행
  const derivedDeltas = propagate(inputDeltas, rules, depths);

  // 3. 모든 delta 합침 (입력 + 파생)
  const allDeltas: Record<string, number> = { ...inputDeltas, ...derivedDeltas };

  // 4. 노드 상태 생성
  const nodeStates = buildNodeStates(inputValues, inputDeltas, derivedDeltas);

  // 5. 엣지 상태 생성
  const edgeStates = buildEdgeStates(allDeltas);

  // 6. 타임라인 생성
  const timeline = buildTimeline(derivedDeltas, allDeltas, rules);

  // 7. 예외 수집
  const exceptions = collectExceptions(allDeltas);

  // 8. 요약 생성
  const summary = generateSummary(derivedDeltas, inputDeltas);

  return {
    nodeStates,
    edgeStates,
    timeline,
    exceptions,
    summary,
  };
}
