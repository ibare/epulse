# ePulse - 경제 인과관계 학습 시뮬레이터

거시경제 변수 간의 인과관계를 직관적으로 학습하기 위한 인터랙티브 시뮬레이터입니다.

> 이 도구는 학습 목적으로 제작되었으며, 투자 의사결정에 사용하기 위한 것이 아닙니다.

## 주요 기능

- 12개 입력 변수(금리, 물가, 성장률, 유가 등)를 슬라이더로 조절
- 22개 인과관계 규칙에 따른 실시간 전파 시뮬레이션
- React Flow 기반 인과관계 맵 시각화
- 7개 프리셋 시나리오 (미국 금리 인상, 한국 물가 급등, 유가 급등 등)
- 시간 지연(즉시/단기/중기)에 따른 타임라인 표시
- 조건부 예외 규칙 표시

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 19, TypeScript 6 (strict mode) |
| 상태 관리 | Zustand |
| 시각화 | React Flow (@xyflow/react) |
| 애니메이션 | Motion (Framer Motion) |
| 스타일링 | Tailwind CSS 3 |
| 번들러 | Vite 8 |
| 패키지 매니저 | pnpm |

## 실행 방법

```bash
pnpm install
pnpm dev
```

## 빌드

```bash
pnpm build
```

빌드 결과물은 `dist/` 디렉터리에 생성됩니다.

## 배포

GitHub Pages로 자동 배포됩니다. `main` 브랜치에 푸시하면 `.github/workflows/deploy.yml` 워크플로우가 실행됩니다.

```bash
# 수동 배포 (로컬)
pnpm build
# dist/ 디렉터리를 정적 호스팅에 업로드
```

## 아키텍처

```
src/
├── domain/           # 도메인 계층
│   ├── types.ts      # 타입 정의
│   ├── nodes.ts      # 경제 변수 정의 (입력 12개 + 파생 11개)
│   ├── rules.ts      # 인과관계 규칙 22개
│   ├── scenarios.ts  # 프리셋 시나리오 7개
│   └── simulation/   # 시뮬레이션 엔진
│       ├── engine.ts       # 메인 시뮬레이션 실행
│       ├── propagation.ts  # DAG 전파 알고리즘
│       └── stateMapper.ts  # delta -> 상태 라벨 매핑
├── store/            # Zustand 상태 관리
├── hooks/            # 커스텀 훅
├── components/       # UI 계층
│   ├── layout/       # 레이아웃 (헤더, 푸터, 온보딩)
│   ├── controls/     # 조작 패널 (슬라이더, 프리셋)
│   ├── map/          # React Flow 맵 (노드, 엣지)
│   ├── panels/       # 타임라인, 상세 패널
│   └── ui/           # 공통 UI (GlassPanel, Badge 등)
├── styles/           # 디자인 토큰
└── utils/            # 유틸리티
```

핵심 설계:
- **도메인/엔진/UI 분리**: 도메인 로직은 React에 의존하지 않음
- **DAG 전파**: 규칙을 위상 순서로 정렬 후 한 방향으로 전파, 감쇠 계수(0.7) 적용
- **순수 함수 엔진**: `runSimulation(inputValues)` -> `SimulationResult`
- **반응형 상태**: Zustand 셀렉터를 통한 세밀한 리렌더링 제어
