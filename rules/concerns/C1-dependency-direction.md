---
version: 1
last_verified: 2026-04-10
---

# Dependency Direction (C1)

## When to Apply
- import 문을 추가하거나 변경하는 모든 파일
- src/ 내 새 파일 생성 시

## MUST
- domain/ 파일은 다른 domain/ 파일 또는 utils/만 import할 수 있다
- store/ 파일은 domain/, utils/, 다른 store/ 파일만 import할 수 있다
- hooks/ 파일은 store/, domain/, utils/를 import할 수 있다
- components/ 파일은 hooks/, domain/types, utils/, styles/, 다른 components/를 import할 수 있다
- pages/ 파일은 components/, hooks/, store/를 import할 수 있다

## MUST NOT
- domain/ 파일에서 store/, hooks/, components/, pages/, React, Zustand을 import하지 않는다
- store/ 파일에서 components/, pages/, hooks/를 import하지 않는다
- 두 파일 간 순환 import를 만들지 않는다

## PREFER
- 컴포넌트가 domain 계산을 필요로 할 때, domain 함수를 직접 호출하지 말고 custom hook을 추출한다
- components/에서 domain/simulation/config.ts의 display 상수(INTENSITY_THRESHOLD 등)를 직접 import하는 것은 허용한다
