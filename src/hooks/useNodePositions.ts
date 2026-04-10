import { useState, useCallback, useEffect, useRef } from 'react';
import { applyNodeChanges, type Node, type NodeChange } from '@xyflow/react';

const STORAGE_PREFIX = 'epulse:node-positions:';

type PositionMap = Record<string, { x: number; y: number }>;

function loadPositions(key: string): PositionMap {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw) return JSON.parse(raw) as PositionMap;
  } catch {
    // localStorage 접근 실패 시 무시
  }
  return {};
}

function savePositions(key: string, nodes: Node[]): void {
  try {
    const map: PositionMap = {};
    for (const n of nodes) {
      map[n.id] = n.position;
    }
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(map));
  } catch {
    // localStorage 접근 실패 시 무시
  }
}

/**
 * ReactFlow 노드의 위치를 localStorage에 저장/복원하고
 * 드래그 이벤트를 처리하는 공유 훅.
 *
 * @param storageKey - localStorage 키 구분자 (예: 'macro', 'rate')
 * @param computedNodes - 시뮬레이션 데이터로 계산된 노드 배열
 */
export function useNodePositions<T extends Record<string, unknown>>(
  storageKey: string,
  computedNodes: Node<T>[],
): {
  nodes: Node<T>[];
  onNodesChange: (changes: NodeChange[]) => void;
} {
  const savedRef = useRef<PositionMap>(loadPositions(storageKey));

  const [nodes, setNodes] = useState<Node<T>[]>(() =>
    applyPositions(computedNodes, savedRef.current),
  );

  useEffect(() => {
    setNodes((prev) => {
      const posMap: PositionMap = {};
      for (const n of prev) {
        posMap[n.id] = n.position;
      }
      return applyPositions(computedNodes, posMap);
    });
  }, [computedNodes]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const next = applyNodeChanges(changes, nds) as Node<T>[];
        // 드래그 종료 시 저장
        const hasDragStop = changes.some(
          (c) => c.type === 'position' && !c.dragging,
        );
        if (hasDragStop) {
          savedRef.current = Object.fromEntries(
            next.map((n) => [n.id, n.position]),
          );
          savePositions(storageKey, next);
        }
        return next;
      });
    },
    [storageKey],
  );

  return { nodes, onNodesChange };
}

function applyPositions<T extends Record<string, unknown>>(
  computedNodes: Node<T>[],
  posMap: PositionMap,
): Node<T>[] {
  return computedNodes.map((n) => {
    const saved = posMap[n.id];
    return saved ? { ...n, position: saved } : n;
  });
}
