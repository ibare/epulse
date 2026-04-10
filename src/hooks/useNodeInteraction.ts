import { useMemo } from 'react';
import { useUIStore } from '../store/uiStore';
import { rules } from '../domain/rules';
import { computeConnections } from '../utils/graphConnections';

export function useNodeInteraction() {
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const hoveredNodeId = useUIStore((s) => s.hoveredNodeId);
  const selectNode = useUIStore((s) => s.selectNode);
  const hoverNode = useUIStore((s) => s.hoverNode);

  const activeNodeId = hoveredNodeId ?? selectedNodeId;

  const { connectedEdgeIds, connectedNodeIds } = useMemo(
    () => computeConnections(activeNodeId, rules),
    [activeNodeId],
  );

  // NodeDetailPanel에서 규칙 목록 표시에 사용
  const connectedRules = useMemo(() => {
    if (!activeNodeId) return [];
    return rules.filter(
      (r) => r.source === activeNodeId || r.target === activeNodeId,
    );
  }, [activeNodeId]);

  return {
    selectedNodeId,
    hoveredNodeId,
    activeNodeId,
    selectNode,
    hoverNode,
    connectedRules,
    connectedEdgeIds,
    connectedNodeIds,
  };
}
