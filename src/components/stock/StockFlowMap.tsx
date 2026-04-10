/**
 * 주식 뷰 중앙 3열 React Flow 그래프
 *
 * 1열: 입력 노드 (EconomicNode 재사용)
 * 2열: 중간 개념 노드 (RateConceptNode 재사용)
 * 3열: 결과 노드 (EconomicNode 재사용)
 */

import { useMemo, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';

import { EconomicNode, type EconomicNodeData } from '../map/EconomicNode';
import { RateConceptNode, type RateConceptNodeData } from '../rate/RateConceptNode';
import { CausalEdge, type CausalEdgeData } from '../map/CausalEdge';
import { FlowCanvas } from '../flow/FlowCanvas';
import { useSimulationStore } from '../../store/simulationStore';
import { useStockSimulation } from '../../hooks/useStockSimulation';
import { useNodePositions } from '../../hooks/useNodePositions';
import { computeConnections, computeNodeHighlight } from '../../utils/graphConnections';
import { variableMap } from '../../domain/nodes';
import type { DetailViewDef } from '../../domain/views/types';

const nodeTypes = {
  economic: EconomicNode,
  rateConcept: RateConceptNode,
};
const edgeTypes = { causal: CausalEdge };

interface StockFlowMapProps {
  viewDef: DetailViewDef;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onHoverNode: (id: string | null) => void;
}

export function StockFlowMap({
  viewDef,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
}: StockFlowMapProps) {
  const result = useSimulationStore((s) => s.result);
  const pinnedInputs = useSimulationStore((s) => s.pinnedInputs);
  const { conceptStates, edgeStates } = useStockSimulation(viewDef);

  const activeNodeId = hoveredNodeId ?? selectedNodeId;

  const { connectedEdgeIds, connectedNodeIds } = useMemo(
    () => computeConnections(activeNodeId, viewDef.edges),
    [activeNodeId, viewDef.edges],
  );

  const hasActiveNode = activeNodeId !== null;

  // ─── 노드 생성 ──────────────────────────────

  const computedNodes = useMemo(() => {
    const result_: (Node<EconomicNodeData, 'economic'> | Node<RateConceptNodeData, 'rateConcept'>)[] = [];

    // 1열: 입력 노드
    for (const id of viewDef.inputNodeIds) {
      const v = variableMap[id];
      if (!v) continue;
      const ns = result.nodeStates[id];
      const pos = viewDef.positions[id];
      const highlight = computeNodeHighlight(id, activeNodeId, connectedNodeIds);

      result_.push({
        id,
        type: 'economic' as const,
        position: pos,
        draggable: true,
        data: {
          label: v.label,
          region: v.region,
          delta: ns?.delta ?? 0,
          displayState: ns?.displayState ?? '중립',
          intensity: ns?.intensity ?? 0,
          variableType: 'input',
          layer: 'cause',
          ...highlight,
          isPinned: pinnedInputs.has(id),
        },
      });
    }

    // 2열: 중간 개념 노드
    for (const cs of conceptStates) {
      const pos = viewDef.positions[cs.id];
      const highlight = computeNodeHighlight(cs.id, activeNodeId, connectedNodeIds);

      result_.push({
        id: cs.id,
        type: 'rateConcept' as const,
        position: pos,
        draggable: true,
        data: {
          label: cs.label,
          description: cs.description,
          delta: cs.delta,
          displayState: cs.displayState,
          intensity: cs.intensity,
          ...highlight,
        },
      });
    }

    // 3열: 결과 노드
    for (const id of viewDef.resultNodeIds) {
      const v = variableMap[id];
      if (!v) continue;
      const ns = result.nodeStates[id];
      const pos = viewDef.positions[id];
      const highlight = computeNodeHighlight(id, activeNodeId, connectedNodeIds);

      result_.push({
        id,
        type: 'economic' as const,
        position: pos,
        draggable: true,
        data: {
          label: v.label,
          region: v.region,
          delta: ns?.delta ?? 0,
          displayState: ns?.displayState ?? '중립',
          intensity: ns?.intensity ?? 0,
          variableType: 'derived',
          layer: 'market',
          ...highlight,
          isPinned: false,
        },
      });
    }

    return result_;
  }, [viewDef, result.nodeStates, pinnedInputs, conceptStates, activeNodeId, connectedNodeIds]);

  const { nodes, onNodesChange } = useNodePositions<Record<string, unknown>>(viewDef.id, computedNodes);

  // ─── 엣지 생성 ──────────────────────────────

  const edges = useMemo<Edge<CausalEdgeData>[]>(() => {
    return viewDef.edges.map((edge) => {
      const es = edgeStates[edge.id];
      const isDimmed = hasActiveNode && !connectedEdgeIds.has(edge.id);

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'causal' as const,
        data: {
          active: es?.active ?? false,
          strength: es?.strength ?? 0,
          direction: es?.direction ?? edge.direction,
          explanation: edge.explanation,
          isDimmed,
          lag: 'immediate' as const,
          order: es?.order ?? 0,
        },
      };
    });
  }, [viewDef.edges, edgeStates, hasActiveNode, connectedEdgeIds]);

  // ─── 이벤트 핸들러 ─────────────────────────

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectNode(activeNodeId === node.id ? null : node.id);
    },
    [activeNodeId, onSelectNode],
  );

  const onNodeMouseEnter = useCallback(
    (_: React.MouseEvent, node: Node) => onHoverNode(node.id),
    [onHoverNode],
  );

  const onNodeMouseLeave = useCallback(
    () => onHoverNode(null),
    [onHoverNode],
  );

  const onPaneClick = useCallback(
    () => onSelectNode(null),
    [onSelectNode],
  );

  return (
    <FlowCanvas
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onNodeClick={onNodeClick}
      onNodeMouseEnter={onNodeMouseEnter}
      onNodeMouseLeave={onNodeMouseLeave}
      onPaneClick={onPaneClick}
      fitViewPadding={0.2}
    />
  );
}
