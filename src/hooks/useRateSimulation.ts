/**
 * 금리 상세 뷰 전용 시뮬레이션 훅
 *
 * 기존 simulationStore의 결과를 금리 관점으로 재해석한다.
 * - 중간 개념 노드 값 계산 (뷰 레이어 파생)
 * - 엣지 활성/강도 계산
 * - 설명 텍스트 생성
 * - 시계열 차트 데이터 생성
 */

import { useMemo } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { rateView } from '../domain/views/rateView';
import type { DetailViewDef, ViewEdgeDef } from '../domain/views/types';
import type { NodeState } from '../domain/types';
import {
  deltaToIntensity,
  intensityToStrength,
} from '../domain/simulation/stateMapper';
import type { Direction } from '../domain/types';

// ─── 타입 ────────────────────────────────────────────

export interface ConceptState {
  id: string;
  label: string;
  description: string;
  delta: number;
  displayState: string;
  intensity: number;
}

export interface ViewEdgeState {
  edgeId: string;
  active: boolean;
  strength: number;
  direction: Direction;
  explanation: string;
  order: number;
}

export interface TimeSeriesPoint {
  label: string;
  krRate: number;
  krRatePressure: number;
}

// ─── 범용 계산 함수 ─────────────────────────────────

export function computeConceptStates(
  viewDef: DetailViewDef,
  nodeStates: Record<string, NodeState>,
): ConceptState[] {
  return viewDef.conceptNodes.map((concept) => {
    const ns = nodeStates[concept.id];
    const delta = ns?.delta ?? 0;
    return {
      id: concept.id,
      label: concept.label,
      description: concept.description,
      delta,
      displayState: concept.labelFn
        ? concept.labelFn(delta)
        : ns?.displayState ?? '중립',
      intensity: ns?.intensity ?? 0,
    };
  });
}

export function computeEdgeStates(
  viewDef: DetailViewDef,
  nodeStates: Record<string, NodeState>,
  conceptStateMap: Record<string, ConceptState>,
): Record<string, ViewEdgeState> {
  // 동적 깊이 계산: 변화가 있는 입력 노드를 기점(depth 0)으로 BFS
  const dynamicDepth: Record<string, number> = {};
  for (const id of viewDef.inputNodeIds) {
    const delta = nodeStates[id]?.delta ?? 0;
    if (Math.abs(delta) >= 1) dynamicDepth[id] = 0;
  }

  let changed = true;
  let iter = 0;
  while (changed && iter < 10) {
    changed = false;
    iter++;
    for (const edge of viewDef.edges) {
      if (dynamicDepth[edge.source] === undefined) continue;
      const sourceDelta = getSourceDelta(edge, nodeStates, conceptStateMap);
      if (Math.abs(sourceDelta) < 1) continue;
      const newDepth = dynamicDepth[edge.source] + 1;
      if (dynamicDepth[edge.target] === undefined || newDepth < dynamicDepth[edge.target]) {
        dynamicDepth[edge.target] = newDepth;
        changed = true;
      }
    }
  }

  const states: Record<string, ViewEdgeState> = {};

  for (const edge of viewDef.edges) {
    const sourceDelta = getSourceDelta(edge, nodeStates, conceptStateMap);
    const targetDelta = getTargetDelta(edge, nodeStates, conceptStateMap);
    const absSource = Math.abs(sourceDelta);
    const active = absSource >= 4 || (absSource >= 1 && Math.abs(targetDelta) >= 4);

    const effectiveDirection: Direction =
      sourceDelta >= 0
        ? edge.direction
        : edge.direction === 'positive' ? 'negative' : 'positive';

    states[edge.id] = {
      edgeId: edge.id,
      active,
      strength: active ? Math.max(intensityToStrength(deltaToIntensity(sourceDelta)), 0.1) : 0,
      direction: effectiveDirection,
      explanation: edge.explanation,
      order: active ? (dynamicDepth[edge.source] ?? 0) + 1 : 0,
    };
  }

  return states;
}

function getSourceDelta(
  edge: ViewEdgeDef,
  nodeStates: Record<string, NodeState>,
  conceptStateMap: Record<string, ConceptState>,
): number {
  if (conceptStateMap[edge.source]) {
    return conceptStateMap[edge.source].delta;
  }
  return nodeStates[edge.source]?.delta ?? 0;
}

function getTargetDelta(
  edge: ViewEdgeDef,
  nodeStates: Record<string, NodeState>,
  conceptStateMap: Record<string, ConceptState>,
): number {
  if (conceptStateMap[edge.target]) {
    return conceptStateMap[edge.target].delta;
  }
  return nodeStates[edge.target]?.delta ?? 0;
}

// ─── 메인 훅 ─────────────────────────────────────────

export function useRateSimulation() {
  const result = useSimulationStore((s) => s.result);

  const conceptStates = useMemo<ConceptState[]>(
    () => computeConceptStates(rateView, result.nodeStates),
    [result.nodeStates],
  );

  const conceptStateMap = useMemo(
    () => Object.fromEntries(conceptStates.map((c) => [c.id, c])),
    [conceptStates],
  );

  const edgeStates = useMemo<Record<string, ViewEdgeState>>(
    () => computeEdgeStates(rateView, result.nodeStates, conceptStateMap),
    [result.nodeStates, conceptStateMap],
  );

  // 결과 노드 상태
  const krRateState = result.nodeStates['kr_rate'];
  const krRatePressureState = result.nodeStates['kr_rate_pressure'];

  // 설명 텍스트 생성
  const explanationText = useMemo(
    () => generateExplanation(conceptStates, krRateState, krRatePressureState),
    [conceptStates, krRateState, krRatePressureState],
  );

  // 시계열 차트 데이터
  const timeSeriesData = useMemo(
    () => generateTimeSeries(conceptStates, krRateState, krRatePressureState),
    [conceptStates, krRateState, krRatePressureState],
  );

  return {
    conceptStates,
    conceptStateMap,
    edgeStates,
    krRateState,
    krRatePressureState,
    explanationText,
    timeSeriesData,
  };
}

// ─── 금리 특화: 설명 텍스트 생성 ────────────────────

function generateExplanation(
  concepts: ConceptState[],
  krRate: { delta: number; displayState: string } | undefined,
  krRatePressure: { delta: number; displayState: string } | undefined,
): string[] {
  const sentences: string[] = [];

  if (!krRate || !krRatePressure) return sentences;

  sentences.push(
    `현재 기준금리는 ${krRate.displayState}, 시장금리는 ${krRatePressure.displayState} 상태입니다.`,
  );

  const sorted = [...concepts].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const dominant = sorted[0];

  if (dominant && Math.abs(dominant.delta) >= 4) {
    const dirText = dominant.delta > 0 ? '상승' : '하락';
    sentences.push(
      `${dominant.label}이(가) ${dirText} 방향으로 가장 큰 영향을 주고 있습니다.`,
    );
  }

  const inflation = concepts.find((c) => c.id === 'inflation_pressure');
  if (inflation && inflation.intensity >= 2) {
    sentences.push(
      '물가와 유가 상승이 인플레이션 압력을 키우며 금리 인상 압력을 높이고 있습니다.',
    );
  } else if (inflation && inflation.intensity <= -2) {
    sentences.push(
      '물가 안정으로 금리 인하 여지가 생기고 있습니다.',
    );
  }

  const rateDiff = krRatePressure.delta - krRate.delta;
  if (rateDiff > 5) {
    sentences.push(
      '시장에서는 금리 인상을 선반영하여 시장금리가 기준금리보다 먼저 상승하고 있습니다.',
    );
  } else if (rateDiff < -5) {
    sentences.push(
      '시장은 금리 인하를 기대하여 시장금리가 기준금리보다 먼저 하락하고 있습니다.',
    );
  } else if (Math.abs(krRate.delta) >= 4 || Math.abs(krRatePressure.delta) >= 4) {
    sentences.push(
      '기준금리와 시장금리가 비슷한 수준으로 움직이고 있습니다.',
    );
  }

  sentences.push(
    '기준금리는 중앙은행의 결정값이고, 시장금리는 미래 기대가 먼저 반영된 결과입니다.',
  );

  return sentences;
}

// ─── 금리 특화: 시계열 데이터 생성 ──────────────────

function generateTimeSeries(
  concepts: ConceptState[],
  krRate: { delta: number } | undefined,
  krRatePressure: { delta: number } | undefined,
): TimeSeriesPoint[] {
  if (!krRate || !krRatePressure) {
    return [
      { label: '즉시', krRate: 0, krRatePressure: 0 },
      { label: '단기', krRate: 0, krRatePressure: 0 },
      { label: '중기', krRate: 0, krRatePressure: 0 },
    ];
  }

  const marketExpect = concepts.find((c) => c.id === 'market_expectation');
  const bokStance = concepts.find((c) => c.id === 'bok_stance');

  const marketDelta = marketExpect?.delta ?? 0;
  const stanceDelta = bokStance?.delta ?? 0;

  return [
    {
      label: '즉시',
      krRate: stanceDelta * 0.1,
      krRatePressure: marketDelta * 0.6,
    },
    {
      label: '단기',
      krRate: stanceDelta * 0.4,
      krRatePressure: marketDelta * 0.85,
    },
    {
      label: '중기',
      krRate: krRate.delta,
      krRatePressure: krRatePressure.delta,
    },
  ];
}
