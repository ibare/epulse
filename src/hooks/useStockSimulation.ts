/**
 * 주식 상세 뷰 전용 시뮬레이션 훅
 *
 * 기존 simulationStore의 결과를 주식 관점으로 재해석한다.
 * computeConceptStates/computeEdgeStates는 금리 뷰와 공유한다.
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

export interface StockTimeSeriesPoint {
  label: string;
  value: number;
}

// ─── 메인 훅 ─────────────────────────────────────────

export function useStockSimulation(viewDef: DetailViewDef) {
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
    () => generateStockExplanation(viewDef, conceptStates, resultState),
    [viewDef, conceptStates, resultState],
  );

  const timeSeriesData = useMemo(
    () => generateStockTimeSeries(viewDef, conceptStates, resultState),
    [viewDef, conceptStates, resultState],
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

// ─── 주식 특화: 설명 텍스트 생성 ────────────────────

function generateStockExplanation(
  viewDef: DetailViewDef,
  concepts: ConceptState[],
  resultState: NodeState | undefined,
): string[] {
  const sentences: string[] = [];

  if (!resultState) return sentences;

  const label = viewDef.id === 'stock-kr' ? '한국 주가' : '미국 주가';
  sentences.push(
    `현재 ${label}는 ${resultState.displayState} 상태입니다.`,
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

  // 한국 주식: 외국인 수급 특화
  if (viewDef.id === 'stock-kr') {
    const foreign = concepts.find((c) => c.id === 'foreign_demand_kr');
    if (foreign && foreign.intensity >= 2) {
      sentences.push(
        '외국인 자금 유입이 강해 주가에 상승 압력을 주고 있습니다.',
      );
    } else if (foreign && foreign.intensity <= -2) {
      sentences.push(
        '외국인 자금 이탈이 진행되며 주가에 하락 압력을 주고 있습니다.',
      );
    }
  }

  // 미국 주식: 위험회피 심리 특화
  if (viewDef.id === 'stock-us') {
    const sentiment = concepts.find((c) => c.id === 'sentiment_us');
    if (sentiment && sentiment.intensity <= -2) {
      sentences.push(
        '위험회피 심리 확산으로 투자 심리가 위축되어 있습니다.',
      );
    }
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
    '주가는 기업 실적, 금리, 자금 흐름, 심리가 종합된 결과입니다.',
  );

  return sentences;
}

// ─── 주식 특화: 시계열 데이터 생성 ──────────────────

function generateStockTimeSeries(
  viewDef: DetailViewDef,
  concepts: ConceptState[],
  resultState: NodeState | undefined,
): StockTimeSeriesPoint[] {
  if (!resultState) {
    return [
      { label: '즉시', value: 0 },
      { label: '단기', value: 0 },
      { label: '중기', value: 0 },
    ];
  }

  // 심리가 즉시 반응하는 개념
  const sentimentId = viewDef.id === 'stock-kr' ? 'sentiment_kr' : 'sentiment_us';
  const sentiment = concepts.find((c) => c.id === sentimentId);
  const sentimentDelta = sentiment?.delta ?? 0;

  // 즉시: 심리 중심 (즉시 반영)
  const immediate = sentimentDelta * 0.6;

  // 단기: 실적 + 할인율 + 외국인 일부 반영
  const short = resultState.delta * 0.7;

  // 중기: 최종 값
  const medium = resultState.delta;

  return [
    { label: '즉시', value: immediate },
    { label: '단기', value: short },
    { label: '중기', value: medium },
  ];
}
