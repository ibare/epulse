import { useMemo } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { EconomicNodeData } from '../components/map/EconomicNode';
import type { CausalEdgeData } from '../components/map/CausalEdge';
import type { SimulationResult } from '../domain/types';
import { variables, nodePositions } from '../domain/nodes';
import { rules } from '../domain/rules';
import { entryNodeToPath, conceptNodeIds, allMacroCollapsedEdges } from '../domain/views/registry';
import { deltaToIntensity, intensityToStrength } from '../domain/simulation/stateMapper';
import { INTENSITY_THRESHOLD, EDGE_SIGNAL_THRESHOLD } from '../domain/simulation/config';

const macroVariables = variables.filter((v) => v.layer !== 'concept');
const macroRules = rules.filter((r) => !conceptNodeIds.has(r.source) && !conceptNodeIds.has(r.target));

export function useMacroViewData(
  result: SimulationResult,
  pinnedInputs: Set<string>,
  activeNodeId: string | null,
  connectedNodeIds: Set<string>,
  connectedEdgeIds: Set<string>,
) {
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
        draggable: true,
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

    const collapsedEdges: Edge<CausalEdgeData>[] = allMacroCollapsedEdges.map((edge) => {
      const sourceDelta = result.nodeStates[edge.source]?.delta ?? 0;
      const targetDelta = result.nodeStates[edge.target]?.delta ?? 0;
      const absSource = Math.abs(sourceDelta);
      const active = absSource >= INTENSITY_THRESHOLD || (absSource >= EDGE_SIGNAL_THRESHOLD && Math.abs(targetDelta) >= INTENSITY_THRESHOLD);
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

  return { nodes, edges, hasActiveNode };
}
