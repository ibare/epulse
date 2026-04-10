---
version: 1
last_verified: 2026-04-10
---

# Principles

## P1. Domain Purity
- domain/ 디렉터리는 순수 함수와 타입 선언으로만 구성한다
- React, Zustand, 라우터, 브라우저 API(localStorage, window 등)를 import하지 않는다

## P2. Unidirectional Data Flow
- 데이터 흐름은 components -> hooks -> store -> domain 단방향을 유지한다
- domain이 store를 참조하지 않고, store가 component를 참조하지 않는다

## P3. Single Source of Truth for Constants
- 시뮬레이션 동작에 영향을 주는 모든 수치(임계값, 가중치, 감쇠 계수 등)는 domain/simulation/config.ts에서 정의하고, 사용처에서 import한다
- 동일한 의미의 숫자를 여러 파일에 독립 정의하지 않는다

## P4. Declarative Rule/View Definitions
- 인과 규칙(CausalRule[])과 상세 뷰(DetailViewDef)는 선언형 데이터 구조로 정의한다
- 절차적 코드로 규칙이나 뷰를 생성하지 않는다
- 규칙/뷰 정의에 런타임 의존성(store state, API 응답 등)을 포함하지 않는다

## P5. Minimal Component Responsibility
- React 컴포넌트는 props/store 데이터의 렌더링에만 책임진다
- 비즈니스 로직(전파 계산, 활성화 판정, 뷰 모델 변환)은 hooks 또는 domain에 위치한다
- 컴포넌트 내 useMemo에서 domain 로직을 직접 실행하지 않는다

## P6. Test Coverage for Domain Logic
- domain/ 디렉터리에 새 함수를 추가하거나 기존 함수의 시그니처를 변경할 때는 해당 함수의 테스트를 작성한다
- 테스트는 domain/__tests__/ 또는 해당 모듈의 __tests__/에 위치한다
