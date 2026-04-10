/**
 * 상세 뷰 등록소
 *
 * 모든 상세 뷰를 등록하고, 거시 뷰 노드 → 상세 뷰 경로 매핑을 제공한다.
 * 새 상세 뷰 추가 시 views 배열에 push만 하면 된다.
 */

import type { DetailViewDef } from './types';
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
