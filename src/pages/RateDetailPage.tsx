/**
 * 금리 상세 학습 뷰 페이지
 *
 * 3패널 레이아웃: 좌측(입력 슬라이더) / 중앙(3열 그래프) / 우측(설명+차트)
 * 기존 simulationStore를 공유하여 거시 뷰와 양방향 동기화한다.
 */

import { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { RateControlPanel } from '../components/rate/RateControlPanel';
import { RateFlowMap } from '../components/rate/RateFlowMap';
import { RateExplainPanel } from '../components/rate/RateExplainPanel';
import { useSimulationStore } from '../store/simulationStore';
import { useRuleTuningStore } from '../store/ruleTuningStore';

export default function RateDetailPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // 금리 뷰 진입 시 kr_rate를 unpin → 규칙 기반 결과로 전환
  useEffect(() => {
    const store = useSimulationStore.getState();
    if (store.pinnedInputs.has('kr_rate')) {
      store.unpinInput('kr_rate');
    }
  }, []);

  // 룰 오버라이드 변경 시 시뮬레이션 재계산 (App.tsx와 동일 패턴)
  useEffect(() => {
    return useRuleTuningStore.subscribe(() => {
      useSimulationStore.getState().recompute();
    });
  }, []);

  return (
    <AppLayout
      left={<RateControlPanel />}
      center={
        <RateFlowMap
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          onSelectNode={setSelectedNodeId}
          onHoverNode={setHoveredNodeId}
        />
      }
      right={<RateExplainPanel selectedNodeId={hoveredNodeId ?? selectedNodeId} />}
    />
  );
}
