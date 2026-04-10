/**
 * 상세 뷰 공유 타입
 *
 * 거시 뷰에서 특정 주제(금리, 채권, 주가 등)로 드릴다운하는
 * 상세 뷰의 노드/엣지 구성을 정의하는 범용 타입.
 */

import type { Direction } from '../types';

// ─── 개념 노드 정의 ─────────────────────────────────

export interface ConceptContribution {
  sourceId: string;
  weight: number;
  ruleIds: string[];
}

export interface ConceptTarget {
  targetId: string;
  direction: Direction;
  description: string;
}

export interface ConceptNodeDef {
  id: string;
  label: string;
  description: string;
  contributions: ConceptContribution[];
  targets: ConceptTarget[];
  labelFn?: (delta: number) => string;
}

// ─── 뷰 엣지 정의 ──────────────────────────────────

export interface ViewEdgeDef {
  id: string;
  source: string;
  target: string;
  direction: Direction;
  ruleIds: string[];
  explanation: string;
}

// ─── 상세 뷰 정의 ──────────────────────────────────

export interface DetailViewDef {
  id: string;
  label: string;
  routePath: string;
  inputNodeIds: string[];
  conceptNodes: ConceptNodeDef[];
  resultNodeIds: string[];
  edges: ViewEdgeDef[];
  positions: Record<string, { x: number; y: number }>;
  entryNodeIds: string[];
}
