import { useMemo } from 'react';
import { useUIStore } from '../store/uiStore';
import { rules } from '../domain/rules';

export function useNodeInteraction() {
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const hoveredNodeId = useUIStore((s) => s.hoveredNodeId);
  const selectNode = useUIStore((s) => s.selectNode);
  const hoverNode = useUIStore((s) => s.hoverNode);

  const activeNodeId = hoveredNodeId ?? selectedNodeId;

  const connectedRules = useMemo(() => {
    if (!activeNodeId) return [];
    return rules.filter(
      (r) => r.source === activeNodeId || r.target === activeNodeId,
    );
  }, [activeNodeId]);

  const connectedEdgeIds = useMemo(() => {
    return new Set(connectedRules.map((r) => r.id));
  }, [connectedRules]);

  const connectedNodeIds = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    const ids = new Set<string>();
    ids.add(activeNodeId);
    for (const r of connectedRules) {
      ids.add(r.source);
      ids.add(r.target);
    }
    return ids;
  }, [activeNodeId, connectedRules]);

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
