/**
 * 상세 뷰 등록소
 *
 * 모든 상세 뷰를 등록하고, 거시 뷰 노드 → 상세 뷰 경로 매핑,
 * 개념 노드 필터, 합성 엣지를 제공한다.
 */

import type { DetailViewDef, MacroCollapsedEdge } from './types';
import { rateView } from './rateView';

const views: DetailViewDef[] = [rateView];

// 거시 뷰 노드 ID → 상세 뷰 경로 (CausalMap에서 클릭 시 이동)
export const entryNodeToPath: Record<string, string> = {};
for (const view of views) {
  for (const nodeId of view.entryNodeIds) {
    entryNodeToPath[nodeId] = view.routePath;
  }
}

// 경로 → 뷰 정의 (Header 등에서 사용)
export const viewByPath: Record<string, DetailViewDef> = {};
for (const view of views) {
  viewByPath[view.routePath] = view;
}

// 모든 뷰의 개념 노드 ID 집합 (거시 뷰 필터용)
export const conceptNodeIds = new Set<string>();
for (const view of views) {
  for (const concept of view.conceptNodes) {
    conceptNodeIds.add(concept.id);
  }
}

// 모든 뷰의 합성 엣지 (거시 뷰에서 개념 노드 축약 표시)
export const allMacroCollapsedEdges: MacroCollapsedEdge[] = [];
for (const view of views) {
  allMacroCollapsedEdges.push(...view.macroCollapsedEdges);
}
