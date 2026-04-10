/**
 * 미국 채권시장 상세 학습 뷰 페이지
 *
 * 3패널 레이아웃: 좌측(입력 슬라이더) / 중앙(3열 그래프) / 우측(설명+차트)
 * 기존 simulationStore를 공유하여 거시 뷰와 양방향 동기화한다.
 */

import { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { BondControlPanel } from '../components/bond/BondControlPanel';
import { BondFlowMap } from '../components/bond/BondFlowMap';
import { BondExplainPanel } from '../components/bond/BondExplainPanel';
import { useSimulationStore } from '../store/simulationStore';
import { useRuleTuningStore } from '../store/ruleTuningStore';
import { bondUsView } from '../domain/views/bondUsView';

export default function BondUsDetailPage() {
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
      left={<BondControlPanel viewDef={bondUsView} />}
      center={
        <BondFlowMap
          viewDef={bondUsView}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          onSelectNode={setSelectedNodeId}
          onHoverNode={setHoveredNodeId}
        />
      }
      right={
        <BondExplainPanel
          viewDef={bondUsView}
          selectedNodeId={hoveredNodeId ?? selectedNodeId}
        />
      }
    />
  );
}
