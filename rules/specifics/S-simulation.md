---
version: 1
last_verified: 2026-04-10
---

# Simulation Engine Specifics (S-simulation)

## When to Apply
- domain/simulation/, domain/rules/, domain/nodes.ts, domain/contradictions.ts, domain/resolveRules.ts 수정 시

## Rules

### DAG 무결성
- CausalRule의 source와 target은 nodes.ts에 정의된 유효한 변수 ID여야 한다
- 규칙 집합에 순환(cycle)이 없어야 한다 — propagation.ts의 topologicalSort가 실패하면 DAG가 깨진 것이다
- 새 규칙 추가 시 기존 DAG 구조와의 호환성을 확인한다

### 전파 계산
- 전파 깊이 계산은 Kahn 알고리즘 기반 topologicalSort를 사용한다
- 감쇠(damping)는 config.ts의 DAMPING_FACTOR, DAMPING_MIN_DEPTH를 따른다
- delta 값은 config.ts의 DELTA_CLAMP_MIN/MAX 범위로 클램핑한다
- 최대 반복 횟수는 config.ts의 MAX_ITERATIONS를 초과하지 않는다

### 규칙 정의
- CausalRule은 선언형 배열로 정의한다 (P4 참조)
- 규칙에 런타임 의존성(store state, API 응답)을 포함하지 않는다
- weight 오버라이드는 resolveRules.ts의 getResolvedRules()를 통해 적용한다 (의존성 주입 패턴)
- 규칙 파일 분할 시 barrel export(index.ts)를 유지한다

### 상태 매핑
- stateMapper는 config.ts의 STATE_THRESHOLDS를 사용하여 delta → displayState를 결정한다
- intensity는 MAX_INTENSITY로 클램핑한다

### 테스트
- engine, propagation, stateMapper 함수 변경 시 domain/__tests__/ 또는 domain/simulation/__tests__/ 테스트를 업데이트한다 (P6 참조)
