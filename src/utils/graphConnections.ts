/** 그래프 노드/엣지 연결 관계 계산 유틸 */

export interface GraphEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
}

export interface ConnectionResult {
  readonly connectedEdgeIds: Set<string>;
  readonly connectedNodeIds: Set<string>;
}

export interface NodeHighlight {
  readonly isSelected: boolean;
  readonly isConnected: boolean;
  readonly isDimmed: boolean;
}

/**
 * activeNodeId에 연결된 엣지/노드 집합을 계산한다.
 * 엣지의 source 또는 target이 activeNodeId인 경우 연결로 판정.
 */
export function computeConnections(
  activeNodeId: string | null,
  edges: readonly GraphEdge[],
): ConnectionResult {
  if (!activeNodeId) {
    return { connectedEdgeIds: new Set(), connectedNodeIds: new Set() };
  }

  const edgeIds = new Set<string>();
  const nodeIds = new Set<string>([activeNodeId]);

  for (const edge of edges) {
    if (edge.source === activeNodeId || edge.target === activeNodeId) {
      edgeIds.add(edge.id);
      nodeIds.add(edge.source);
      nodeIds.add(edge.target);
    }
  }

  return { connectedEdgeIds: edgeIds, connectedNodeIds: nodeIds };
}

/**
 * 노드의 선택/연결/흐림 상태를 계산한다.
 */
export function computeNodeHighlight(
  nodeId: string,
  activeNodeId: string | null,
  connectedNodeIds: Set<string>,
): NodeHighlight {
  const hasActiveNode = activeNodeId !== null;
  const isSelected = activeNodeId === nodeId;
  const isConnected = hasActiveNode && connectedNodeIds.has(nodeId);
  const isDimmed = hasActiveNode && !isConnected;

  return { isSelected, isConnected, isDimmed };
}
