import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { EconomicNode, type EconomicNodeData } from './EconomicNode';
import { CausalEdge, type CausalEdgeData } from './CausalEdge';
import { useSimulationStore } from '../../store/simulationStore';
import { useNodeInteraction } from '../../hooks/useNodeInteraction';
import { variables, nodePositions } from '../../domain/nodes';
import { rules } from '../../domain/rules';

import { entryNodeToPath, conceptNodeIds, allMacroCollapsedEdges } from '../../domain/views/registry';
import { deltaToIntensity, intensityToStrength } from '../../domain/simulation/stateMapper';

// 거시 뷰: 개념 노드 및 개념 노드 관련 규칙 필터
const macroVariables = variables.filter((v) => v.layer !== 'concept');
const macroRules = rules.filter((r) => !conceptNodeIds.has(r.source) && !conceptNodeIds.has(r.target));

const nodeTypes = { economic: EconomicNode };
const edgeTypes = { causal: CausalEdge };

export function CausalMap() {
  const navigate = useNavigate();
  const result = useSimulationStore((s) => s.result);
  const pinnedInputs = useSimulationStore((s) => s.pinnedInputs);
  const { activeNodeId, connectedEdgeIds, connectedNodeIds, selectNode, hoverNode } =
    useNodeInteraction();

  const hasActiveNode = activeNodeId !== null;

  const nodes = useMemo<Node<EconomicNodeData, 'economic'>[]>(() => {
    return macroVariables.map((v) => {
      const nodeState = result.nodeStates[v.id];
      const pos = nodePositions[v.id] ?? { x: 0, y: 0 };
      const isSelected = activeNodeId === v.id;
      const isConnected = hasActiveNode && connectedNodeIds.has(v.id);
      const isDimmed = hasActiveNode && !isConnected;

      return {
        id: v.id,
        type: 'economic' as const,
        position: pos,
        draggable: false,
        data: {
          label: v.label,
          region: v.region,
          delta: nodeState?.delta ?? 0,
          displayState: nodeState?.displayState ?? '중립',
          intensity: nodeState?.intensity ?? 0,
          variableType: v.type,
          layer: v.layer,
          isSelected,
          isConnected,
          isDimmed,
          isPinned: pinnedInputs.has(v.id),
          hasDetailView: v.id in entryNodeToPath,
        },
      };
    });
  }, [result.nodeStates, activeNodeId, hasActiveNode, connectedNodeIds, pinnedInputs]);

  const edges = useMemo<Edge<CausalEdgeData>[]>(() => {
    // 실제 엔진 규칙 (개념 노드 제외)
    const ruleEdges: Edge<CausalEdgeData>[] = macroRules.map((rule) => {
      const edgeState = result.edgeStates[rule.id];
      const isDimmed = hasActiveNode && !connectedEdgeIds.has(rule.id);

      return {
        id: rule.id,
        source: rule.source,
        target: rule.target,
        type: 'causal' as const,
        data: {
          active: edgeState?.active ?? false,
          strength: edgeState?.strength ?? 0,
          direction: edgeState?.direction ?? rule.direction,
          explanation: rule.explanation,
          isDimmed,
          lag: rule.lag,
          order: edgeState?.order ?? 0,
        },
      };
    });

    // 합성 엣지 (개념 노드 경유 경로를 축약)
    const collapsedEdges: Edge<CausalEdgeData>[] = allMacroCollapsedEdges.map((edge) => {
      const sourceDelta = result.nodeStates[edge.source]?.delta ?? 0;
      const targetDelta = result.nodeStates[edge.target]?.delta ?? 0;
      const absSource = Math.abs(sourceDelta);
      const active = absSource >= 4 || (absSource >= 1 && Math.abs(targetDelta) >= 4);
      const effectiveDirection = sourceDelta >= 0
        ? edge.direction
        : edge.direction === 'positive' ? 'negative' : 'positive';
      const isDimmed = hasActiveNode
        && !connectedNodeIds.has(edge.source)
        && !connectedNodeIds.has(edge.target);

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'causal' as const,
        data: {
          active,
          strength: active ? Math.max(intensityToStrength(deltaToIntensity(sourceDelta)), 0.1) : 0,
          direction: effectiveDirection,
          explanation: edge.explanation,
          isDimmed,
          lag: edge.lag,
          order: 0,
        },
      };
    });

    return [...ruleEdges, ...collapsedEdges];
  }, [result.edgeStates, result.nodeStates, hasActiveNode, connectedEdgeIds, connectedNodeIds]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const detailPath = entryNodeToPath[node.id];
      if (detailPath) {
        navigate(detailPath);
        return;
      }
      selectNode(activeNodeId === node.id ? null : node.id);
    },
    [activeNodeId, selectNode, navigate],
  );

  const onNodeMouseEnter = useCallback(
    (_: React.MouseEvent, node: Node) => {
      hoverNode(node.id);
    },
    [hoverNode],
  );

  const onNodeMouseLeave = useCallback(() => {
    hoverNode(null);
  }, [hoverNode]);

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(148,163,184,0.08)"
        />
      </ReactFlow>
    </div>
  );
}
