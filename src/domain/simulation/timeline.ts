import type { CausalRule, TimelineItem } from '../types';
import { variableMap } from '../nodes';
import { evaluateException } from './propagation';
import { deltaToDisplayState } from './stateMapper';
import {
  EDGE_SIGNAL_THRESHOLD,
  MIN_RULE_PRESSURE,
  MIN_DELTA_FOR_TIMELINE,
  SIGNIFICANT_DELTA,
  TOP_SUMMARY_COUNT,
} from './config';

const inputIds = new Set(
  Object.values(variableMap)
    .filter((v) => v.type === 'input')
    .map((v) => v.id),
);

export function buildTimeline(
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
    const isInput = inputIds.has(targetId);
    if (isInput) {
      const rulePressure = targetRules.reduce((sum, rule) => {
        const sourceDelta = allDeltas[rule.source] ?? 0;
        if (Math.abs(sourceDelta) < EDGE_SIGNAL_THRESHOLD) return sum;
        const dir = rule.direction === 'positive' ? 1 : -1;
        return sum + sourceDelta * rule.weight * dir;
      }, 0);
      if (Math.abs(rulePressure) < MIN_RULE_PRESSURE) continue;
    } else {
      if (Math.abs(delta) < MIN_DELTA_FOR_TIMELINE) continue;
    }

    const variable = variableMap[targetId];
    if (!variable) continue;
    if (variable.layer === 'concept') continue;

    const lagPriority: Record<string, number> = {
      immediate: 0,
      short: 1,
      medium: 2,
    };
    const primaryLag = targetRules
      .filter((r) => Math.abs(allDeltas[r.source] ?? 0) >= EDGE_SIGNAL_THRESHOLD)
      .sort((a, b) => lagPriority[a.lag] - lagPriority[b.lag])[0]?.lag ?? 'medium';

    const activeExplanations = targetRules
      .filter((r) => Math.abs(allDeltas[r.source] ?? 0) >= EDGE_SIGNAL_THRESHOLD)
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

export function generateSummary(
  allDeltas: Record<string, number>,
  inputDeltas: Record<string, number>,
): string {
  const significant = Object.entries(allDeltas)
    .filter(([id, d]) => {
      if (inputIds.has(id)) {
        const userDelta = inputDeltas[id] ?? 0;
        return Math.abs(d) >= SIGNIFICANT_DELTA && Math.abs(d - userDelta) >= MIN_RULE_PRESSURE;
      }
      return Math.abs(d) >= SIGNIFICANT_DELTA;
    })
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));

  if (significant.length === 0) {
    const hasInputChange = Object.values(inputDeltas).some((d) => Math.abs(d) >= SIGNIFICANT_DELTA);
    if (!hasInputChange) {
      return '현재 모든 경제 변수가 기준 수준에 있습니다. 좌측 패널에서 변수를 조작하거나 프리셋 시나리오를 선택해보세요.';
    }
    return '현재 입력 변화에 의한 유의미한 시장 영향이 제한적입니다.';
  }

  const top = significant.slice(0, TOP_SUMMARY_COUNT);
  const descriptions = top.map(([id, delta]) => {
    const v = variableMap[id];
    if (!v) return '';
    const state = deltaToDisplayState(delta);
    return `${v.label}에 ${state}이 형성되고 있습니다`;
  });

  return `현재 시나리오에서 ${descriptions.join(', ')}.`;
}
