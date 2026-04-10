---
version: 1
last_verified: 2026-04-10
---

# Store Patterns (C3)

## When to Apply
- src/store/ 파일을 수정하거나 새로 생성할 때
- store를 사용하는 hooks/, components/ 코드를 변경할 때

## MUST
- Zustand store는 `create<T>()(set => ({ ... }))` 패턴으로 생성한다
- store에서 다른 store를 읽을 때는 `useOtherStore.getState()`를 사용한다 (구독 아님)
- 컴포넌트에서 store를 사용할 때는 `useStore(s => s.field)` selector 패턴으로 필요한 값만 구독한다
- localStorage 접근(loadFromStorage, saveToStorage)에는 try-catch를 감싼다

## MUST NOT
- store 파일에서 components/, pages/, hooks/를 import하지 않는다 (C1 참조)
- store action 내에서 React API(setState, useEffect 등)를 호출하지 않는다
- 두 store가 서로의 action을 호출하는 순환 의존을 만들지 않는다

## PREFER
- cross-store 접근은 action 내부의 `getState()`로 한정하고, 최소한으로 유지한다
- store의 상태와 액션은 단일 책임에 맞게 분리한다 (예: UI 상태 → uiStore, 시뮬레이션 → simulationStore)
- 파생 값은 store에 저장하지 말고 hooks에서 계산한다
