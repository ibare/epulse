/**
 * 미국 주식시장 상세 학습 뷰 페이지
 *
 * 3패널 레이아웃: 좌측(입력 슬라이더) / 중앙(3열 그래프) / 우측(설명+차트)
 * 기존 simulationStore를 공유하여 거시 뷰와 양방향 동기화한다.
 */

import { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { StockControlPanel } from '../components/stock/StockControlPanel';
import { StockFlowMap } from '../components/stock/StockFlowMap';
import { StockExplainPanel } from '../components/stock/StockExplainPanel';
import { useSimulationStore } from '../store/simulationStore';
import { useRuleTuningStore } from '../store/ruleTuningStore';
import { stockUsView } from '../domain/views/stockUsView';

export default function StockUsDetailPage() {
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
      left={<StockControlPanel viewDef={stockUsView} />}
      center={
        <StockFlowMap
          viewDef={stockUsView}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          onSelectNode={setSelectedNodeId}
          onHoverNode={setHoveredNodeId}
        />
      }
      right={
        <StockExplainPanel
          viewDef={stockUsView}
          selectedNodeId={hoveredNodeId ?? selectedNodeId}
        />
      }
    />
  );
}
