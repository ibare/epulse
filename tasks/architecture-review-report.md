# Architecture Review Report

## 프로젝트 개요

- **프로젝트**: epulse — 경제 인과관계 학습 시뮬레이터
- **언어**: TypeScript 6.0
- **프레임워크**: React 19 + Vite 8 + Tailwind 3 + @xyflow/react 12 + zustand 5
- **모노레포 여부**: 아니오
- **총 소스 파일**: 55개 (.ts 24, .tsx 31)
- **총 코드 라인**: 5,230줄
- **API 서버**: 없음 (순수 프론트엔드 SPA)
- **DB**: 없음 (localStorage만 사용)

---

## 요약

- **총 점검 항목**: 24개 (N/A 제외)
- **Critical**: 2건 / **High**: 6건 / **Medium**: 4건 / **Low**: 0건
- **아키텍처 건강도**: 32/100

---

## 카테고리별 결과

### 의존성 방향 (D-1 ~ D-4)

| # | 항목 | 판정 | Severity | 근거 (파일:줄) |
|---|------|:----:|:--------:|---------------|
| D-1 | 레이어 역전 | **FAIL** | High | `src/domain/resolveRules.ts:3` — domain이 `../store/ruleTuningStore`를 import. domain → store 역방향 의존 |
| D-2 | 순환 의존 | PASS | — | resolveRules→ruleTuningStore→domain/rules는 DAG. ruleTuningStore가 resolveRules를 import하지 않으므로 순환 아님. 전 파일 검증 완료 |
| D-3 | 우회 의존 | **FAIL** | High | `src/domain/resolveRules.ts:8` — `useRuleTuningStore.getState()`로 store 구현체 직접 접근. 인터페이스/타입 추상화 없이 zustand 내부 상태에 결합 |
| D-4 | 외부 노출 | PASS | — | barrel(index.ts) 파일이 없으나 모든 파일이 명시적 export를 사용. 55개 파일 전수 확인, 비공개 모듈 직접 접근 없음 |

### 단일 책임 (S-1 ~ S-5)

| # | 항목 | 판정 | Severity | 근거 (파일:줄) |
|---|------|:----:|:--------:|---------------|
| S-1 | 거대 파일 | **FAIL** | Medium | `src/domain/rules.ts` — 528줄. 순수 데이터 선언(규칙 배열)이므로 단일 책임이나 500줄 초과. 카테고리 분할로 개선 가능 |
| S-2 | 거대 함수 | **FAIL** | Medium | `src/domain/simulation/engine.ts:116-206` — `buildTimeline()` 90줄. 타임라인 생성, 예외 필터링, 시간대 정렬 3가지 책임 혼합 |
| S-3 | God 클래스 | **FAIL** | High | `src/store/simulationStore.ts:16-35` — 8개 public 메서드, 3가지 도메인 책임: (1) 시뮬레이션 제어(setInputValue/unpinInput/applyScenario/resetToBaseline/recompute) (2) UI 상호작용(selectNode/hoverNode) (3) 시각화 설정(toggleColorScheme) |
| S-4 | 혼합 레이어 | **FAIL** | High | `src/components/map/CausalMap.tsx:22-23,91-119` — 컴포넌트가 뷰 모델 변환(macroVariables/macroRules 필터링), 합성 엣지 생성, 활성화 판정 등 비즈니스 로직 직접 수행. `src/components/controls/SliderInput.tsx:38-61` — rulePressure 계산 로직이 UI에 침투 |
| S-5 | 유틸 덤프 | PASS | — | `src/utils/` 3개 파일 확인: formatters.ts(delta 변환 2개), analytics.ts(추적 1개), clamp.ts(범위 제한 1개). 각각 단일 책임 |

### 공유 자원 관리 (R-1 ~ R-4)

| # | 항목 | 판정 | Severity | 근거 (파일:줄) |
|---|------|:----:|:--------:|---------------|
| R-1 | DB 클라이언트 | N/A | — | DB 사용 없음 |
| R-2 | HTTP 클라이언트 | PASS | — | HTTP 호출 없음. `src/utils/analytics.ts` — window.umami 선택적 접근만 |
| R-3 | 환경 변수 | PASS | — | process.env/import.meta.env 사용 없음. 55개 파일 전수 확인 |
| R-4 | 캐시/큐 | N/A | — | 해당 없음 |

### 에러 처리 (E-1 ~ E-5)

| # | 항목 | 판정 | Severity | 근거 (파일:줄) |
|---|------|:----:|:--------:|---------------|
| E-1 | 삼킨 에러 | **FAIL** | Medium | `src/store/ruleTuningStore.ts:33-35` — catch 블록에서 에러 로깅 없이 `return {}` 반환. localStorage 접근 실패 시 원인 추적 불가 |
| E-2 | 빈 catch | **FAIL** | Medium | `src/store/ruleTuningStore.ts:33` — `catch { return {}; }` 에러 변수 바인딩조차 없음 |
| E-3 | 비일관 응답 | N/A | — | API 서버 없음 |
| E-4 | 미처리 Promise | PASS | — | async/await, Promise 체인 사용 없음. 모든 I/O가 동기적 localStorage |
| E-5 | 에러 타입 | PASS | — | throw 문 사용 없음. 에러 발생 지점 자체가 최소화되어 있음 |

### 하드코딩 (H-1 ~ H-4)

| # | 항목 | 판정 | Severity | 근거 (파일:줄) |
|---|------|:----:|:--------:|---------------|
| H-1 | 매직 넘버 | **FAIL** | High | 아래 상세 참조 — 시뮬레이션 핵심 임계값이 코드 전역에 산재 |
| H-2 | 하드코딩 URL | N/A | — | URL 사용 없음 |
| H-3 | 문자열 상수 | PASS | — | displayState 문자열은 `deltaToDisplayState()`에서만 정의되고 참조는 nodeState.displayState로 통일 |
| H-4 | 설정값 | PASS | — | 슬라이더 범위(0-100) clamp 처리, 시나리오 프리셋 선언형 정의 |

**H-1 매직 넘버 상세:**

| 위치 | 값 | 용도 |
|------|-----|------|
| `stateMapper.ts:2-8,12-18` | 26, 11, 4, -3, -10, -25 | 상태 분류 임계값 — 상수 미추출 |
| `engine.ts:74,84,99` | 4, 1 | 엣지 활성화 임계값 — 코드 4곳에 산재 |
| `engine.ts:79`, `propagation.ts:68` | 30 | BFS 최대 반복 — 동일 값 2곳 중복 |
| `propagation.ts:138` | 2 | 감쇠 적용 깊이 — DAMPING_FACTOR는 상수이나 적용 조건은 하드코딩 |
| `contradictions.ts:15-55` | 65, 40, 70, 35, 20, 75, 55 | 비현실성 판정 임계값 — 설정값 미분리 |
| `formatters.ts:8-9` | 4 | 화살표 표시 임계값 — stateMapper의 4와 동기화 필요하나 별도 정의 |
| `stateMapper.ts:22` | 3 | 강도 정규화 — intensity 최대값이지만 상수 미추출 |

### API 설계 (A-1 ~ A-5)

N/A — API 서버 없음 (순수 프론트엔드 SPA)

### 테스트 (T-1 ~ T-4)

| # | 항목 | 판정 | Severity | 근거 (파일:줄) |
|---|------|:----:|:--------:|---------------|
| T-1 | 테스트 부재 | **FAIL** | Critical | 테스트 파일 0개. 핵심 비즈니스 로직 미검증: `propagation.ts`(DAG 전파), `engine.ts`(시뮬레이션 실행), `stateMapper.ts`(상태 분류 경계값) |
| T-2 | 테스트 비율 | **FAIL** | Critical | 소스 55파일(5,230줄) 대비 테스트 0파일(0줄). 비율 **0%** (기준: 20% 이상) |
| T-3 | 모킹 과다 | N/A | — | 테스트 파일 없음 |
| T-4 | 통합 테스트 | **FAIL** | High | 시뮬레이션→스토어→컴포넌트 통합 플로우 검증 전무 |

### 보안 (SEC-1 ~ SEC-4)

| # | 항목 | 판정 | Severity | 근거 (파일:줄) |
|---|------|:----:|:--------:|---------------|
| SEC-1 | 시크릿 노출 | PASS | — | 코드 전수 검색 결과 API 키, 토큰, 비밀번호 없음. 모든 데이터가 클라이언트 상태 |
| SEC-2 | .env 추적 | PASS | — | `git ls-files` 결과 .env 파일 없음. `.gitignore`에 `*.local` 포함 |
| SEC-3 | SQL 인젝션 | N/A | — | DB 사용 없음 |
| SEC-4 | 의존성 취약점 | PASS | — | 의존성 6개(react, react-dom, react-router-dom, zustand, @xyflow/react, motion). 민감한 서버사이드 의존성 없음 |

---

## Critical/High 위반 상세

### [Critical] T-1: 핵심 비즈니스 로직 테스트 부재

- **위치**: 프로젝트 전체 (테스트 파일 0개)
- **위반 이유**: DAG 전파 알고리즘(`propagation.ts`), 시뮬레이션 엔진(`engine.ts`), 상태 분류(`stateMapper.ts`)에 자동화된 검증이 없음
- **영향 범위**: 임계값 변경, 가중치 캘리브레이션, 새 규칙 추가 시 회귀 감지 불가. 현재 13개 개념 노드 규칙(rc01-rc13)의 정확성이 수동 검증에만 의존
- **권장 수정**: vitest 도입 후 propagation.ts, engine.ts, stateMapper.ts 단위 테스트 우선 작성

### [Critical] T-2: 테스트 비율 0%

- **위치**: 프로젝트 전체
- **위반 이유**: 소스 55파일 대비 테스트 0파일. 기준(20%) 대비 0%
- **영향 범위**: 모든 리팩토링/기능 추가의 안전성 보장 불가
- **권장 수정**: vitest.config.ts 설정 후 domain/ 디렉터리부터 테스트 추가

### [High] D-1: 레이어 역전

- **위치**: `src/domain/resolveRules.ts:3`
  ```typescript
  import { useRuleTuningStore } from '../store/ruleTuningStore';
  ```
- **위반 이유**: domain 레이어가 store(상위 레이어)를 import. domain은 순수 비즈니스 로직이어야 하며 UI 상태 관리에 의존하면 안 됨
- **영향 범위**: domain 로직의 독립 테스트 불가. zustand 없이는 `getResolvedRules()` 호출 불가
- **권장 수정**: `getResolvedRules(overrides)` 형태로 overrides를 인자로 받도록 변경. 호출부(store/hooks)에서 overrides를 주입

### [High] D-3: 우회 의존

- **위치**: `src/domain/resolveRules.ts:8`
  ```typescript
  const { overrides } = useRuleTuningStore.getState();
  ```
- **위반 이유**: domain이 zustand store의 `.getState()` 구현체에 직접 결합. 추상화(인터페이스/콜백) 없이 구현 상세 의존
- **영향 범위**: D-1과 동일 근본 원인. store 구조 변경 시 domain 코드도 수정 필요
- **권장 수정**: D-1 수정으로 함께 해결됨

### [High] S-3: God 클래스 (simulationStore)

- **위치**: `src/store/simulationStore.ts:16-35` (인터페이스), `:99-225` (구현)
- **위반 이유**: 8개 public 메서드가 3가지 도메인 책임 수행:
  1. 시뮬레이션 제어 (setInputValue, unpinInput, applyScenario, resetToBaseline, recompute)
  2. UI 상호작용 상태 (selectNode, hoverNode)
  3. 시각화 설정 (toggleColorScheme)
- **영향 범위**: 어떤 메서드 호출이든 전체 store 구독자에게 리렌더 유발 가능
- **권장 수정**: `useUIStore`(selectNode, hoverNode, colorScheme) 분리

### [High] S-4: 혼합 레이어

- **위치**:
  - `src/components/map/CausalMap.tsx:22-23` — 모듈 수준 규칙 필터링
  - `src/components/map/CausalMap.tsx:91-119` — 합성 엣지 생성 + 활성화 판정
  - `src/components/controls/SliderInput.tsx:38-61` — rulePressure 계산
- **위반 이유**: UI 컴포넌트가 뷰 모델 변환, 엣지 활성화 판정 등 비즈니스 로직을 직접 수행
- **영향 범위**: 컴포넌트 테스트 시 도메인 로직도 함께 검증해야 함. 로직 변경이 UI 파일 수정을 강제
- **권장 수정**: CausalMap의 노드/엣지 변환 로직을 `useMacroViewData()` 커스텀 훅으로 추출

### [High] H-1: 매직 넘버

- **위치**: stateMapper.ts(6개), engine.ts(5개), propagation.ts(2개), contradictions.ts(7개), formatters.ts(1개)
- **위반 이유**: 시뮬레이션의 핵심 임계값(상태 경계, 활성화 조건, 감쇠 적용 깊이)이 상수로 추출되지 않고 코드에 산재. 특히 `4`라는 값이 stateMapper, engine, formatters 3곳에서 독립적으로 정의되어 동기화 위험
- **영향 범위**: 임계값 조정 시 여러 파일을 동시에 수정해야 하며 누락 시 불일치 발생
- **권장 수정**: `src/domain/simulation/config.ts`에 임계값 상수 객체 정의 후 전역 참조

### [High] T-4: 통합 테스트 부재

- **위치**: 프로젝트 전체
- **위반 이유**: 시나리오 적용 → 시뮬레이션 실행 → 스토어 업데이트 → 노드/엣지 상태 반영 전체 플로우 검증 없음
- **영향 범위**: 시뮬레이션 결과가 UI에 정확히 반영되는지 자동 확인 불가
- **권장 수정**: T-1 해결 후 스토어 수준 통합 테스트 추가

---

## 아키텍처 건강도 산출

```
기본: 100점
Critical  2건 × -15 = -30
High      6건 ×  -5 = -30
Medium    4건 ×  -2 =  -8
Low       0건 × -0.5 =  0
────────────────────────
합계: 32/100
```

---

## 우선순위 액션 플랜

### P0: Critical — 즉시

| 액션 | 영향 범위 | 난이도 |
|------|----------|--------|
| vitest 도입 + domain/simulation 단위 테스트 작성 | propagation.ts, engine.ts, stateMapper.ts | 중 |
| stateMapper 경계값 테스트 (7개 구간 × 양방향) | stateMapper.ts | 하 |
| 규칙 가중치 캘리브레이션 회귀 테스트 | rules.ts + engine.ts | 중 |

### P1: High — 단기

| 액션 | 영향 범위 | 난이도 |
|------|----------|--------|
| resolveRules.ts에서 store 의존 제거 (D-1, D-3) | resolveRules.ts, 호출부 2곳 | 하 |
| simulationStore에서 UI 상태 분리 (S-3) | simulationStore.ts, 구독 컴포넌트 | 중 |
| 시뮬레이션 임계값 상수 객체 추출 (H-1) | config.ts 신규, stateMapper/engine/formatters 수정 | 중 |
| CausalMap 뷰 모델 변환 훅 추출 (S-4) | CausalMap.tsx → useMacroViewData.ts | 중 |

### P2: Medium — 중기

| 액션 | 영향 범위 | 난이도 |
|------|----------|--------|
| buildTimeline 함수 분리 (S-2) | engine.ts | 하 |
| rules.ts 카테고리 분할 검토 (S-1) | rules/ 디렉터리 | 하 |
| localStorage 에러 처리 보강 (E-1, E-2) | ruleTuningStore.ts, simulationStore.ts | 하 |
