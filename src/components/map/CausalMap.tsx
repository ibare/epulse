import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Node } from '@xyflow/react';
import { EconomicNode } from './EconomicNode';
import { CausalEdge } from './CausalEdge';
import { FlowCanvas } from '../flow/FlowCanvas';
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
    />
  );
}
