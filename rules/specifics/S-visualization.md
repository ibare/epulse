---
version: 1
last_verified: 2026-04-10
---

# Visualization Specifics (S-visualization)

## When to Apply
- domain/views/, components/map/, components/rate/, hooks/useMacroViewData.ts, hooks/useNodeInteraction.ts 수정 시

## Rules

### DetailViewDef 구조
- 상세 뷰는 domain/views/ 내 선언형 객체(DetailViewDef)로 정의한다 (P4 참조)
- DetailViewDef는 inputNodeIds, conceptNodes, resultNodeIds, edges로 구성한다
- conceptNodes의 labelFn은 순수 함수여야 한다
- edges의 ruleIds는 유효한 CausalRule ID를 참조해야 한다
- 새 상세 뷰 추가 시 registry.ts에 등록한다

### ReactFlow 노드/엣지
- 노드 컴포넌트(EconomicNode 등)는 반드시 `<Handle type="target">`, `<Handle type="source">`를 모두 렌더링한다
- Handle을 조건부로 생략하면 연결된 엣지에서 경고가 발생한다
- 노드/엣지 컴포넌트는 memo()로 래핑한다 (C4 참조)

### 매크로 뷰 데이터
- 시뮬레이션 결과 → ReactFlow 노드/엣지 변환은 useMacroViewData hook에서 수행한다
- 필터링 임계값(INTENSITY_THRESHOLD, EDGE_SIGNAL_THRESHOLD)은 config.ts에서 import한다 (C2 참조)
- 노드 위치 계산과 엣지 스타일링 로직은 hook 내부에 유지한다

### 인터랙션
- 노드 선택/호버 상태는 uiStore에서 관리한다
- 컴포넌트는 useNodeInteraction hook을 통해 인터랙션을 처리한다
