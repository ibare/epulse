import { useMemo, useCallback } from 'react';
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

const nodeTypes = { economic: EconomicNode };
const edgeTypes = { causal: CausalEdge };

export function CausalMap() {
  const result = useSimulationStore((s) => s.result);
  const { activeNodeId, connectedEdgeIds, connectedNodeIds, selectNode, hoverNode } =
    useNodeInteraction();

  const hasActiveNode = activeNodeId !== null;

  const nodes = useMemo<Node<EconomicNodeData, 'economic'>[]>(() => {
    return variables.map((v) => {
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
        },
      };
    });
  }, [result.nodeStates, activeNodeId, hasActiveNode, connectedNodeIds]);

  const edges = useMemo<Edge<CausalEdgeData>[]>(() => {
    return rules.map((rule) => {
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
        },
      };
    });
  }, [result.edgeStates, hasActiveNode, connectedEdgeIds]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(activeNodeId === node.id ? null : node.id);
    },
    [activeNodeId, selectNode],
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
