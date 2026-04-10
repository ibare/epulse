---
version: 1
last_verified: 2026-04-10
---

# React Component Conventions (C4)

## When to Apply
- src/components/ 내 .tsx 파일을 추가하거나 수정할 때

## MUST
- ReactFlow 노드 컴포넌트(EconomicNode, ConceptNode 등)는 `memo()`로 래핑한다
- 컴포넌트는 props/store 데이터의 렌더링에만 책임진다 (P5 참조)
- 비즈니스 로직이 필요하면 custom hook으로 추출한다

## MUST NOT
- 컴포넌트에서 domain/simulation/engine.ts의 함수(runSimulation 등)를 직접 호출하지 않는다
- useMemo 내에서 domain 계산 로직을 인라인으로 실행하지 않는다
- 컴포넌트 파일에서 Zustand `create()`를 호출하지 않는다

## PREFER
- ReactFlow 엣지 컴포넌트도 `memo()`로 래핑한다
- 컴포넌트의 스타일 상수(색상, 크기)는 styles/tokens 또는 TailwindCSS 클래스를 사용한다
- 복잡한 이벤트 핸들러 로직은 custom hook으로 분리한다
- components/에서 domain/simulation/config.ts의 display 상수를 직접 import하는 것은 허용한다 (C1 PREFER 참조)
