import { describe, it, expect } from 'vitest';
import { computeConnections, computeNodeHighlight } from '../graphConnections';

const edges = [
  { id: 'e1', source: 'A', target: 'B' },
  { id: 'e2', source: 'B', target: 'C' },
  { id: 'e3', source: 'A', target: 'C' },
] as const;

describe('computeConnections', () => {
  it('activeNodeId가 null이면 빈 Set을 반환한다', () => {
    const result = computeConnections(null, edges);
    expect(result.connectedEdgeIds.size).toBe(0);
    expect(result.connectedNodeIds.size).toBe(0);
  });

  it('연결된 엣지와 노드를 정확히 반환한다', () => {
    const result = computeConnections('A', edges);
    expect(result.connectedEdgeIds).toEqual(new Set(['e1', 'e3']));
    expect(result.connectedNodeIds).toEqual(new Set(['A', 'B', 'C']));
  });

  it('중간 노드의 연결도 정확히 계산한다', () => {
    const result = computeConnections('B', edges);
    expect(result.connectedEdgeIds).toEqual(new Set(['e1', 'e2']));
    expect(result.connectedNodeIds).toEqual(new Set(['A', 'B', 'C']));
  });

  it('연결 없는 노드는 자기 자신만 포함한다', () => {
    const result = computeConnections('Z', edges);
    expect(result.connectedEdgeIds.size).toBe(0);
    expect(result.connectedNodeIds).toEqual(new Set(['Z']));
  });

  it('빈 엣지 배열에서도 정상 동작한다', () => {
    const result = computeConnections('A', []);
    expect(result.connectedEdgeIds.size).toBe(0);
    expect(result.connectedNodeIds).toEqual(new Set(['A']));
  });
});

describe('computeNodeHighlight', () => {
  const connected = new Set(['A', 'B']);

  it('activeNodeId가 null이면 모두 false다', () => {
    const result = computeNodeHighlight('A', null, connected);
    expect(result).toEqual({ isSelected: false, isConnected: false, isDimmed: false });
  });

  it('선택된 노드는 isSelected=true, isConnected=true, isDimmed=false', () => {
    const result = computeNodeHighlight('A', 'A', connected);
    expect(result).toEqual({ isSelected: true, isConnected: true, isDimmed: false });
  });

  it('연결된 노드는 isConnected=true, isDimmed=false', () => {
    const result = computeNodeHighlight('B', 'A', connected);
    expect(result).toEqual({ isSelected: false, isConnected: true, isDimmed: false });
  });

  it('연결되지 않은 노드는 isDimmed=true', () => {
    const result = computeNodeHighlight('C', 'A', connected);
    expect(result).toEqual({ isSelected: false, isConnected: false, isDimmed: true });
  });
});
