/**
 * 환율 상세 학습 뷰 페이지
 *
 * 3패널 레이아웃: 좌측(입력 슬라이더) / 중앙(3열 그래프) / 우측(설명+차트)
 * 기존 simulationStore를 공유하여 거시 뷰와 양방향 동기화한다.
 */

import { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { FxControlPanel } from '../components/fx/FxControlPanel';
import { FxFlowMap } from '../components/fx/FxFlowMap';
import { FxExplainPanel } from '../components/fx/FxExplainPanel';
import { useSimulationStore } from '../store/simulationStore';
import { useRuleTuningStore } from '../store/ruleTuningStore';
import { fxView } from '../domain/views/fxView';

export default function FxDetailPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // 룰 오버라이드 변경 시 시뮬레이션 재계산
  useEffect(() => {
    return useRuleTuningStore.subscribe(() => {
      useSimulationStore.getState().recompute();
    });
  }, []);

  return (
    <AppLayout
      left={<FxControlPanel viewDef={fxView} />}
      center={
        <FxFlowMap
          viewDef={fxView}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          onSelectNode={setSelectedNodeId}
          onHoverNode={setHoveredNodeId}
        />
      }
      right={
        <FxExplainPanel
          viewDef={fxView}
          selectedNodeId={hoveredNodeId ?? selectedNodeId}
        />
      }
    />
  );
}
