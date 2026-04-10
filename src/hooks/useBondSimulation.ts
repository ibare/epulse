/**
 * 채권 상세 뷰 전용 시뮬레이션 훅
 *
 * 기존 simulationStore의 결과를 채권 관점으로 재해석한다.
 * computeConceptStates/computeEdgeStates는 금리·주식 뷰와 공유한다.
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

export interface BondTimeSeriesPoint {
  label: string;
  value: number;
}

// ─── 메인 훅 ─────────────────────────────────────────

export function useBondSimulation(viewDef: DetailViewDef) {
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
    () => generateBondExplanation(viewDef, conceptStates, resultState),
    [viewDef, conceptStates, resultState],
  );

  const timeSeriesData = useMemo(
    () => generateBondTimeSeries(viewDef, conceptStates, resultState),
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

// ─── 채권 특화: 설명 텍스트 생성 ────────────────────

function generateBondExplanation(
  viewDef: DetailViewDef,
  concepts: ConceptState[],
  resultState: NodeState | undefined,
): string[] {
  const sentences: string[] = [];

  if (!resultState) return sentences;

  const label = viewDef.id === 'bond-kr' ? '한국 채권' : '미국 채권';
  sentences.push(
    `현재 ${label} 가격은 ${resultState.displayState} 상태입니다.`,
  );

  // 지배적 개념
  const sorted = [...concepts].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const dominant = sorted[0];

  if (dominant && Math.abs(dominant.delta) >= 4) {
    const dirText = dominant.delta > 0
      ? dominant.id.startsWith('rate_burden') ? '상승' : '개선'
      : dominant.id.startsWith('rate_burden') ? '완화' : '악화';
    sentences.push(
      `${dominant.label}이(가) ${dirText} 방향으로 가장 큰 영향을 주고 있습니다.`,
    );
  }

  // 한국 채권: 외국인 수요 특화
  if (viewDef.id === 'bond-kr') {
    const foreign = concepts.find((c) => c.id === 'foreign_bond_demand_kr');
    if (foreign && foreign.intensity >= 2) {
      sentences.push(
        '외국인 채권 투자 유입이 강해 가격에 상승 압력을 주고 있습니다.',
      );
    } else if (foreign && foreign.intensity <= -2) {
      sentences.push(
        '외국인 채권 투자 이탈이 진행되며 가격에 하락 압력을 주고 있습니다.',
      );
    }
  }

  // 미국 채권: 안전자산 수요 특화
  if (viewDef.id === 'bond-us') {
    const safeHaven = concepts.find((c) => c.id === 'safe_haven_demand');
    if (safeHaven && safeHaven.intensity >= 2) {
      sentences.push(
        '위험회피 심리 확산으로 미국 국채에 대한 안전자산 수요가 증가하고 있습니다.',
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
    '채권 가격은 금리 수준, 신용 상태, 자금 수요가 종합된 결과입니다.',
  );

  return sentences;
}

// ─── 채권 특화: 시계열 데이터 생성 ──────────────────

function generateBondTimeSeries(
  viewDef: DetailViewDef,
  concepts: ConceptState[],
  resultState: NodeState | undefined,
): BondTimeSeriesPoint[] {
  if (!resultState) {
    return [
      { label: '즉시', value: 0 },
      { label: '단기', value: 0 },
      { label: '중기', value: 0 },
    ];
  }

  // 금리 부담이 즉시 반응하는 개념
  const rateBurdenId = viewDef.id === 'bond-kr' ? 'rate_burden_kr' : 'rate_burden_us';
  const rateBurden = concepts.find((c) => c.id === rateBurdenId);
  const rateBurdenDelta = rateBurden?.delta ?? 0;

  // 즉시: 금리 반응 중심 (채권의 가장 즉각적 반응)
  const immediate = rateBurdenDelta * -0.6;

  // 단기: 신용 + 수요 반영
  const short = resultState.delta * 0.7;

  // 중기: 최종 값
  const medium = resultState.delta;

  return [
    { label: '즉시', value: immediate },
    { label: '단기', value: short },
    { label: '중기', value: medium },
  ];
}
