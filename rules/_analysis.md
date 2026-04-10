## 프로젝트 구조 분석

### 기본 정보
- 언어: TypeScript 6.0
- 주요 프레임워크/라이브러리: React 19, Vite 8, Zustand 5, @xyflow/react 12, TailwindCSS 3, Motion.js 12
- 모노레포 여부: 아니오
- 빌드 시스템: Vite 8
- 테스트 프레임워크: Vitest 4 (4 test suites, domain only)
- 사용 중인 정적 분석 도구: ESLint 9 (recommended + TS + react-hooks + react-refresh), TypeScript strict

### 규모
- 소스 파일 수: 65개
- 대략적 코드 라인 수: ~5,700
- DB 모델/테이블 수: 없음 (localStorage only)
- API 엔드포인트 수: 없음 (SPA)

### 핵심 도메인
- 시뮬레이션 엔진: DAG 기반 거시경제 인과 전파 (domain/simulation/)
- 시각화 시스템: ReactFlow 기반 인과관계 맵 + 상세 뷰 (domain/views/, components/map/, components/rate/)

### 정적 분석이 커버하는 영역
- unused variables/imports (TS noUnusedLocals, noUnusedParameters)
- type safety (TS strict mode)
- React hooks rules (eslint-plugin-react-hooks)
- Fast refresh compliance (eslint-plugin-react-refresh)
- basic JS/TS issues (eslint:recommended + typescript-eslint:recommended)

### 정적 분석이 커버하지 못하는 영역 (Rules 대상)
- 레이어 간 의존성 방향 (domain -> store 역전 감지)
- 매직 넘버의 의미적 중복 (config.ts 상수와 동일 값의 인라인 리터럴)
- DAG 순환 감지 (컴파일 타임 불가)
- CausalRule의 source/target이 유효한 변수 ID인지
- 컴포넌트가 도메인 엔진을 직접 호출하는지
- ReactFlow 노드 컴포넌트의 memo 래핑 여부
- store 간 cross-access 패턴의 적절성

### 발견된 공통 패턴
- 상대 경로 import 사용 (vite.config.ts에 @/ alias 정의되어 있으나 미사용)
- Zustand selector 패턴으로 store 접근 (useStore(s => s.field))
- 선언형 규칙/뷰 정의 (CausalRule[], DetailViewDef)
- config.ts 중앙 상수 관리
- domain 레이어 순수성 (React/store 무의존)

### 발견된 안티패턴
- ~~contradictions.ts 임계값 6개 하드코딩 (config.ts 미사용)~~ → 해결됨 (2026-04-10)

### 현재 알려진 위반 사항
없음
