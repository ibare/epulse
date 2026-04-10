---
version: 1
last_verified: 2026-04-10
---

# Config Centralization (C2)

## When to Apply
- domain/ 또는 utils/formatters.ts에서 수치 상수를 도입하거나 변경할 때

## MUST
- 시뮬레이션 임계값, 감쇠 계수, 클램핑 범위, 반복 횟수 제한은 domain/simulation/config.ts에서 정의한다
- 모순 검사 임계값(contradictions.ts의 >= / <= 값)도 config.ts에서 정의한다
- 표시 임계값을 사용하는 formatters.ts는 config.ts 상수를 참조한다

## MUST NOT
- domain/ 파일에서 시뮬레이션 동작을 제어하는 새로운 숫자 리터럴을 config.ts 등록 없이 도입하지 않는다
- config.ts에 이미 정의된 상수 값을 다른 파일에서 인라인 리터럴로 중복 사용하지 않는다

## PREFER
- config.ts에 새 상수를 추가할 때 기존 섹션 주석 패턴(예: "--- 상태 분류 임계값 ---")을 따른다
- 관련 상수는 같은 섹션에 그룹핑한다
