import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { EconomicNode } from './EconomicNode';
import { CausalEdge } from './CausalEdge';
import { useSimulationStore } from '../../store/simulationStore';
import { useNodeInteraction } from '../../hooks/useNodeInteraction';
import { useMacroViewData } from '../../hooks/useMacroViewData';
import { useNodePositions } from '../../hooks/useNodePositions';
import { entryNodeToPath } from '../../domain/views/registry';

const nodeTypes = { economic: EconomicNode };
const edgeTypes = { causal: CausalEdge };

export function CausalMap() {
  const navigate = useNavigate();
  const result = useSimulationStore((s) => s.result);
  const pinnedInputs = useSimulationStore((s) => s.pinnedInputs);
  const { activeNodeId, connectedEdgeIds, connectedNodeIds, selectNode, hoverNode } =
    useNodeInteraction();

  const { nodes: computedNodes, edges } = useMacroViewData(
    result,
    pinnedInputs,
    activeNodeId,
    connectedNodeIds,
    connectedEdgeIds,
  );

  const { nodes, onNodesChange } = useNodePositions('macro', computedNodes);

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
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={1.5}
        nodesDraggable={true}
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
