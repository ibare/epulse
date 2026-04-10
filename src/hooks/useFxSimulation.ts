/**
 * 환율 상세 뷰 전용 시뮬레이션 훅
 *
 * 기존 simulationStore의 결과를 환율 관점으로 재해석한다.
 * computeConceptStates/computeEdgeStates는 금리·주식·채권 뷰와 공유한다.
 */

import { useMemo } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import type { DetailViewDef } from '../domain/views/types';
import type { NodeState } from '../domain/types';
import {
  computeConceptStates,
  computeEdgeStates,
  type ConceptState,
  type ViewEdgeState,
} from './useRateSimulation';

// ─── 타입 ────────────────────────────────────────────

export interface FxTimeSeriesPoint {
  label: string;
  value: number;
}

// ─── 메인 훅 ─────────────────────────────────────────

export function useFxSimulation(viewDef: DetailViewDef) {
  const result = useSimulationStore((s) => s.result);

  const conceptStates = useMemo<ConceptState[]>(
    () => computeConceptStates(viewDef, result.nodeStates),
    [viewDef, result.nodeStates],
  );

  const conceptStateMap = useMemo(
    () => Object.fromEntries(conceptStates.map((c) => [c.id, c])),
    [conceptStates],
  );

  const edgeStates = useMemo<Record<string, ViewEdgeState>>(
    () => computeEdgeStates(viewDef, result.nodeStates, conceptStateMap),
    [viewDef, result.nodeStates, conceptStateMap],
  );

  const resultNodeId = viewDef.resultNodeIds[0];
  const resultState = result.nodeStates[resultNodeId];

  const explanationText = useMemo(
    () => generateFxExplanation(conceptStates, resultState),
    [conceptStates, resultState],
  );

  const timeSeriesData = useMemo(
    () => generateFxTimeSeries(conceptStates, resultState),
    [conceptStates, resultState],
  );

  return {
    conceptStates,
    conceptStateMap,
    edgeStates,
    resultState,
    explanationText,
    timeSeriesData,
  };
}

// ─── 환율 특화: 설명 텍스트 생성 ────────────────────

function generateFxExplanation(
  concepts: ConceptState[],
  resultState: NodeState | undefined,
): string[] {
  const sentences: string[] = [];

  if (!resultState) return sentences;

  sentences.push(
    `현재 환율은 ${resultState.displayState} 상태입니다.`,
  );

  // 지배적 개념
  const sorted = [...concepts].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const dominant = sorted[0];

  if (dominant && Math.abs(dominant.delta) >= 4) {
    const dirText = dominant.delta > 0 ? '상승' : '하락';
    sentences.push(
      `${dominant.label}이(가) ${dirText} 방향으로 가장 큰 영향을 주고 있습니다.`,
    );
  }

  // 달러 수요 특화
  const dollarDemand = concepts.find((c) => c.id === 'dollar_demand_fx');
  if (dollarDemand && dollarDemand.intensity >= 2) {
    sentences.push(
      '미국 금리와 유가 상승이 달러 수요를 키우며 환율 상승 압력이 높아지고 있습니다.',
    );
  } else if (dollarDemand && dollarDemand.intensity <= -2) {
    sentences.push(
      '달러 수요가 약해지며 환율 하락 압력이 커지고 있습니다.',
    );
  }

  // 원화 매력도 특화
  const krwAttract = concepts.find((c) => c.id === 'krw_attractiveness_fx');
  if (krwAttract && krwAttract.intensity >= 2) {
    sentences.push(
      '한국 금리와 성장률 개선이 원화 매력을 높여 환율 하락 압력으로 작용하고 있습니다.',
    );
  } else if (krwAttract && krwAttract.intensity <= -2) {
    sentences.push(
      '원화 매력도가 낮아지며 환율 상승 압력이 커지고 있습니다.',
    );
  }

  // 자본 이탈 특화
  const capitalFlight = concepts.find((c) => c.id === 'capital_flight_fx');
  if (capitalFlight && capitalFlight.intensity >= 2) {
    sentences.push(
      '위험회피 심리 확산으로 자본 이탈 압력이 환율 상승 요인이 되고 있습니다.',
    );
  }

  // 상승/하락 요인 요약
  const positive = concepts.filter((c) => c.delta >= 4);
  const negative = concepts.filter((c) => c.delta <= -4);
  if (positive.length > 0 && negative.length > 0) {
    sentences.push(
      `상승 요인(${positive.map((c) => c.label).join(', ')})과 하락 요인(${negative.map((c) => c.label).join(', ')})이 함께 작용하고 있습니다.`,
    );
  }

  sentences.push(
    '환율은 달러를 사고파는 힘의 균형, 그리고 두 통화의 상대적 매력에 의해 결정됩니다.',
  );

  return sentences;
}

// ─── 환율 특화: 시계열 데이터 생성 ──────────────────

function generateFxTimeSeries(
  concepts: ConceptState[],
  resultState: NodeState | undefined,
): FxTimeSeriesPoint[] {
  if (!resultState) {
    return [
      { label: '즉시', value: 0 },
      { label: '단기', value: 0 },
      { label: '중기', value: 0 },
    ];
  }

  // 즉시 반응하는 개념: 달러 수요 + 자본 유출
  const dollarDemand = concepts.find((c) => c.id === 'dollar_demand_fx');
  const capitalFlight = concepts.find((c) => c.id === 'capital_flight_fx');
  const demandDelta = dollarDemand?.delta ?? 0;
  const flightDelta = capitalFlight?.delta ?? 0;

  // 즉시: 금리 + 자본 반응 (환율의 가장 즉각적 반응)
  const immediate = demandDelta * 0.4 + flightDelta * 0.3;

  // 단기: 무역/성장 반영
  const short = resultState.delta * 0.7;

  // 중기: 최종값
  const medium = resultState.delta;

  return [
    { label: '즉시', value: immediate },
    { label: '단기', value: short },
    { label: '중기', value: medium },
  ];
}
