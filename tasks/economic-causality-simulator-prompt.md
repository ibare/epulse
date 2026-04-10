# 경제 인과관계 학습 시뮬레이터 구현 프롬프트 v2

당신은 숙련된 프론트엔드/인터랙션 엔지니어이자 정보 시각화 디자이너입니다.
아래 요구사항을 충실히 반영하여 **React 기반 정적 웹앱**을 구현하세요. 결과물은 **GitHub Pages에 배포 가능한 정적 번들**이어야 하며, 서버 없이 동작해야 합니다.

이 도구의 목적은 **실전 투자 예측기**가 아니라 **거시경제 핵심 개념의 인과관계 학습 도구**입니다.
정확한 현실 복제보다, 학습자에게 "어떤 요소가 다른 요소에 어떤 방향으로 영향을 주는지"를 직관적으로 이해시키는 것이 더 중요합니다.

---

## 1. 제품 목표

이 앱은 사용자가 특정 경제 요소를 조작하면, 다른 요소들이 **즉시 / 단기 / 중기**에 걸쳐 어떻게 반응하는지를 **시각적으로 이해**할 수 있게 해야 합니다.

핵심 철학:

1. **복잡한 현실을 교육적으로 추상화**한다.
2. **정답을 단정하지 않고 방향성과 연결성**을 보여준다.
3. **숫자보다 관계**, **관계보다 직관**, **직관보다 학습 몰입감**을 우선한다.
4. 학습 도구인 만큼 **아름답고 조작하고 싶은 인터페이스**가 매우 중요하다.

---

## 2. 반드시 지켜야 할 제품 원칙

### 2.1 이것은 예측기가 아니다
- 사용자가 값을 바꾸면 "향후 주식은 몇 % 오른다/내린다"처럼 단정하지 말 것.
- 대신 아래와 같은 상태 표현을 사용할 것:
  - 상승 압력 / 하락 압력
  - 인상 가능성 / 인하 가능성
  - 약세 압력 / 강세 압력
  - 자금 유입 가능성 / 자금 유출 가능성
  - 물가 압력 증가 / 경기 둔화 우려

### 2.2 시뮬레이션은 방향성과 강도 중심
- 정밀한 경제 모델이 아니라 **학습용 룰 기반 causal simulator**로 구현할 것.
- 출력은 절대값보다 **기준 상태 대비 변화량** 중심으로 표현할 것.
- 예: `+`, `++`, `+++`, `-`, `--`, `---` 또는 0~100 스코어.

### 2.3 예외를 보여줘야 한다
- 단일 방향 설명만 주면 오해를 낳는다.
- 모든 주요 시뮬레이션 결과에는 아래 2가지가 함께 보여야 한다:
  - 기본 해석
  - 예외/주의 포인트

### 2.4 시각적 아름다움은 기능과 동등하게 중요
- 이 도구는 학습자가 반복적으로 만지고 싶어야 한다.
- 차가운 데이터 대시보드가 아니라, **고급스럽고 몰입감 있는 인터랙티브 시뮬레이터**여야 한다.
- 다크 테마를 기본으로 하고, 경제 시스템이 살아 움직이는 듯한 애니메이션과 반응성을 제공할 것.

### 2.5 온보딩에서 포지셔닝을 명확히 할 것
- 앱 최초 진입 시 "이 도구는 방향성 학습 도구이며, 투자 예측기가 아닙니다"를 명확하게 안내할 것.
- 페이지 하단 또는 접근 가능한 위치에 면책 문구가 아닌 **학습 도구 포지셔닝 설명**을 배치할 것.
- 톤 예시: "이 시뮬레이터는 거시경제 변수 간의 인과관계를 직관적으로 학습하기 위한 도구입니다. 실제 시장의 움직임은 여기에 표현된 것보다 훨씬 복잡하며, 이 도구의 출력은 투자 의사결정에 사용하기 위한 것이 아닙니다."

---

## 3. 기술 스택 요구사항

### 3.1 기본 스택
- **React 18+**
- **Vite** 기반 빌드
- **TypeScript** (strict mode)
- **GitHub Pages 배포 가능 정적 번들**

### 3.2 UI / 스타일링
- **Tailwind CSS v3** 사용
- CSS 변수로 테마 토큰 관리
- 폰트, 간격, 그림자, 글래스모피즘, 미세한 블러, 그라디언트를 적극 활용

### 3.3 시각화 / 그래프
- **React Flow v11+**를 주 시각화 엔진으로 사용
- 핵심은 **노드-엣지 기반 인과관계 맵** 구현
- 노드 간 연결선은 상태 변화에 따라 색, 두께, 글로우, 애니메이션이 변해야 함

### 3.4 애니메이션
- **Motion for React (framer-motion 후속)** 사용
- 값 변경 시 자연스러운 트랜지션, 상태 변화, 패널 진입/이탈, 강조 효과 구현
- 과장된 애니메이션보다 **부드럽고 세련된 반응**을 목표로 할 것

### 3.5 상태 관리
- **Zustand**로 글로벌 시뮬레이션 상태 관리
- 시뮬레이션 입력값, 파생값, UI 상태를 분리된 슬라이스로 관리

### 3.6 배포
- GitHub Pages에서 동작해야 하므로 **정적 export/build 결과만으로 완전 동작**해야 함
- 해시 라우팅 또는 단일 페이지 구조로 설계할 것
- `vite.config.ts`에 `base` 옵션 설정 포함

---

## 4. 제품 구조 개요

앱은 세 레이어의 경제 요소를 시각화한다.

### 4.1 원인 레이어 (Cause Layer)
- 경제성장률
- 물가(인플레이션)

### 4.2 매개 레이어 (Transmission Layer)
- 금리
- 환율

### 4.3 결과 레이어 (Market Layer)
- 채권
- 주식
- 현물(상품)

사용자가 아래 흐름을 자연스럽게 이해하도록 돕기 위함이다:
- 성장률/물가가 변한다 → 금리/환율이 반응한다 → 채권/주식/현물이 따라 움직인다

---

## 5. 국가 범위

3개 권역을 반영한다:
- **한국** (MVP 중심 국가)
- **미국** (외부 영향 요인)
- **EU** (비교 축)

첫 화면은 한국 중심 시야를 제공하되, 미국 금리/물가/성장률 변화, EU 성장률 변화가 한국의 환율/금리/주식/채권에 어떤 압력을 주는지 보여줘야 한다.

---

## 6. 핵심 UI 컨셉

### 6.1 전체 분위기
- 고급스러운 다크 테마
- 정보 시각화 + 실험실 + 미래형 경제 콘솔 느낌
- "경제 시스템을 조작하는 인터랙티브 컨트롤 룸" 같은 인상

### 6.2 시각 스타일 키워드
- Dark graphite / deep navy 배경
- Emerald / cyan / amber / rose 계열 강조색
- 유리 패널(Glass panels)
- 약한 그리드 배경
- 미세한 파티클 또는 흐르는 라인
- 섬세한 glow / shadow / blur
- 둥근 코너 (16px~24px)
- 너무 많은 텍스트보다 상태와 흐름 중심의 시각적 전달

### 6.3 정보 전달 방식
- 숫자 자체보다 상태 변화가 더 먼저 눈에 들어와야 함
- 각 노드는 아래 요소를 포함:
  - 현재 상태명
  - 변화 방향 (↑ ↓ →)
  - 변화 강도 (인디케이터)
  - 관련 국가 (배지)
  - 간단한 요약 설명 (1줄)

---

## 7. 화면 구성

### 7.1 기본 레이아웃: 3열 구조

#### 좌측: 조작 패널 (Control Panel) — 너비 260~280px
사용자가 시뮬레이션 입력값을 조절하는 영역.

포함 요소:
- 프리셋 시나리오 버튼 영역 (상단)
- 국가별 그룹 구분된 슬라이더
- 각 입력은 슬라이더 + 현재값 + delta 표시

#### 중앙: 인과관계 맵 (Causal Map) — 나머지 공간
앱의 핵심 시각화 영역.

요구사항:
- React Flow 기반 노드-엣지 인터랙션 맵
- **좌 → 우 흐름**: 원인 레이어(좌) → 매개 레이어(중앙) → 결과 레이어(우)
- **국가별 수직 그룹핑**: 각 레이어 안에서 한국 노드는 상단, 미국 중간, EU 하단, 글로벌은 최하단에 배치
- 국가별 색상/배지 구분
- 연결선 애니메이션: 상태 변화 시 색/두께/글로우 반응
- 노드 클릭 시 상세 정보 패널 또는 툴팁 표시
- 비활성 연결은 투명도 낮추기

#### 우측: 시간 흐름 패널 (Timeline / Impact Panel) — 너비 280~300px
어떤 변화가 언제 나타나는지를 보여줌.

반드시 3개 구간으로 나눌 것:
- **즉시** (수시간~수일)
- **단기** (수주~수개월)
- **중기** (수개월~1년)

각 구간마다:
- 어떤 시장이 먼저 반응하는지
- 어떤 압력이 강화되는지
- 예외 또는 반대 가능성이 무엇인지

---

## 8. MVP 변수 목록

### 8.1 입력 변수

| ID | 라벨 | 국가 | 기준값 | 범위 |
|---|---|---|---|---|
| `kr_growth` | 경제성장률 | KR | 50 | 0~100 |
| `kr_inflation` | 물가 | KR | 50 | 0~100 |
| `kr_rate` | 기준금리 | KR | 50 | 0~100 |
| `usdkrw` | 원/달러 환율 | KR | 50 | 0~100 |
| `us_rate` | 기준금리 | US | 60 | 0~100 |
| `us_inflation` | 물가 | US | 50 | 0~100 |
| `us_growth` | 성장률 | US | 50 | 0~100 |
| `eu_rate` | 기준금리 | EU | 50 | 0~100 |
| `eu_inflation` | 물가 | EU | 50 | 0~100 |
| `eu_growth` | 성장률 | EU | 50 | 0~100 |
| `oil` | 유가 | GL | 50 | 0~100 |
| `risk` | 위험회피 심리 | GL | 30 | 0~100 |

### 8.2 출력(파생) 변수

| ID | 라벨 | 국가 | 설명 |
|---|---|---|---|
| `kr_rate_pressure` | 한국 금리 압력 | KR | 금리 인상/인하 방향 압력 |
| `usd_strength` | 달러 강세 압력 | GL | 달러 인덱스 방향 |
| `usdkrw_pressure` | 원/달러 환율 압력 | KR | 환율 상승/하락 방향 |
| `kr_bond` | 한국 채권 가격 압력 | KR | 채권 가격 방향 |
| `kr_stock` | 한국 주식시장 압력 | KR | 주식시장 방향 |
| `kr_commodity` | 한국 현물 부담 | KR | 수입물가/원자재 부담 |
| `foreign_flow` | 외국인 자금 흐름 | KR | 유입/유출 방향 |
| `us_bond` | 미국 채권 압력 | US | 채권 가격 방향 |
| `us_stock` | 미국 주식 압력 | US | 주식시장 방향 |
| `eu_bond` | EU 채권 압력 | EU | 채권 가격 방향 |
| `eu_stock` | EU 주식 압력 | EU | 주식시장 방향 |

---

## 9. 데이터 모델

### 9.1 변수 구조

```ts
interface EconomicVariable {
  id: string;
  label: string;
  region: 'KR' | 'US' | 'EU' | 'GL';
  type: 'input' | 'derived';
  layer: 'cause' | 'transmission' | 'market';
  value: number;        // 0~100 현재값
  baseline: number;     // 0~100 기준값
  delta: number;        // value - baseline
  displayState: string; // '상승 압력', '중립' 등
}
```

### 9.2 상태 라벨 매핑

| delta 범위 | 상태 라벨 | 시각 강도 |
|---|---|---|
| +26 이상 | 강한 상승 압력 | ●●● (emerald glow) |
| +11 ~ +25 | 상승 압력 | ●●○ |
| +4 ~ +10 | 약한 상승 압력 | ●○○ |
| -3 ~ +3 | 중립 | ○○○ (slate) |
| -10 ~ -4 | 약한 하락 압력 | ●○○ (rose) |
| -25 ~ -11 | 하락 압력 | ●●○ |
| -26 이하 | 강한 하락 압력 | ●●● (rose glow) |

---

## 10. 룰 엔진 설계

### 10.1 규칙 구조

```ts
interface CausalRule {
  id: string;
  source: string;           // 입력 변수 ID
  target: string;           // 대상 변수 ID
  weight: number;           // 영향 강도 (0.0 ~ 1.0)
  direction: 'positive' | 'negative';  // source↑ → target↑ 또는 target↓
  lag: 'immediate' | 'short' | 'medium';
  explanation: string;      // 한국어 설명문
  exceptions?: ConditionalException[];
}

interface ConditionalException {
  condition: {
    variable: string;       // 조건 변수 ID
    operator: 'gt' | 'lt';  // 기준값 대비 비교
    threshold: number;       // delta 기준값
  };
  text: string;             // 예외 설명문
}
```

### 10.2 전파 알고리즘

룰 엔진은 다음 순서로 파생값을 계산한다:

```
1. 모든 입력 변수의 delta를 계산한다 (value - baseline)
2. 모든 규칙을 lag 순서(immediate → short → medium)로 정렬한다
3. 각 규칙에 대해:
   a. source의 delta를 가져온다
   b. target의 누적 압력에 (delta × weight × direction)을 합산한다
4. 동일 target에 상충되는 압력이 들어올 경우 단순 합산한다
   (양의 압력 +15, 음의 압력 -8이면 최종 +7)
5. 최종 값은 -50 ~ +50 범위로 클램핑한다
6. 감쇠: 2단계 이상 전파(A→B→C)에서 B→C 규칙 적용 시
   B의 delta에 감쇠 계수 0.7을 곱한다
   (3단계 전파 시 0.7 × 0.7 = 0.49)
7. 순환 참조 방지: 한 계산 사이클에서 이미 계산된 변수를
   다시 source로 사용하지 않는다 (DAG 보장)
```

### 10.3 핵심 규칙 목록

아래 규칙은 반드시 구현해야 한다. `direction: positive`는 source↑ → target↑, `negative`는 source↑ → target↓를 의미한다.

#### 물가 → 금리

| source | target | weight | direction | lag | explanation |
|---|---|---|---|---|---|
| `kr_inflation` | `kr_rate_pressure` | 0.6 | positive | immediate | 한국 물가 상승은 한국 금리 인상 압력으로 이어질 수 있습니다. |
| `us_inflation` | `us_rate` | 0.5 | positive | immediate | 미국 물가 상승은 연준의 금리 인상 기대를 높일 수 있습니다. |
| `eu_inflation` | `eu_rate` | 0.5 | positive | immediate | EU 물가 상승은 ECB 금리 인상 기대를 높일 수 있습니다. |

#### 성장률 → 금리/주식

| source | target | weight | direction | lag | explanation |
|---|---|---|---|---|---|
| `kr_growth` | `kr_rate_pressure` | 0.3 | positive | short | 경기 과열 시 금리 인상 압력이 추가될 수 있습니다. |
| `kr_growth` | `kr_stock` | 0.5 | positive | short | 성장률 상승은 기업 실적 기대를 높여 주식에 긍정적입니다. |
| `us_growth` | `us_stock` | 0.5 | positive | short | 미국 경제 성장은 미국 주식시장에 긍정적입니다. |
| `eu_growth` | `eu_stock` | 0.5 | positive | short | EU 경제 성장은 유럽 주식시장에 긍정적입니다. |

#### 금리 → 채권/주식/환율

| source | target | weight | direction | lag | explanation |
|---|---|---|---|---|---|
| `kr_rate_pressure` | `kr_bond` | 0.8 | negative | immediate | 금리 인상 압력은 채권 가격 하락 압력으로 직결됩니다. |
| `kr_rate_pressure` | `kr_stock` | 0.3 | negative | short | 금리 상승은 기업 밸류에이션 부담을 높일 수 있습니다. |
| `us_rate` | `usd_strength` | 0.7 | positive | immediate | 미국 금리 상승은 달러 강세 압력을 키웁니다. |
| `us_rate` | `us_bond` | 0.8 | negative | immediate | 미국 금리 상승은 미국 채권 가격 하락 압력입니다. |
| `eu_rate` | `eu_bond` | 0.8 | negative | immediate | EU 금리 상승은 유럽 채권 가격 하락 압력입니다. |

#### 달러/환율 → 한국 시장

| source | target | weight | direction | lag | explanation |
|---|---|---|---|---|---|
| `usd_strength` | `usdkrw_pressure` | 0.6 | positive | immediate | 달러 강세는 원/달러 환율 상승(원화 약세) 압력입니다. |
| `usdkrw` | `usdkrw_pressure` | 0.5 | positive | immediate | 환율 직접 변동이 반영됩니다. |
| `usdkrw_pressure` | `foreign_flow` | 0.7 | negative | short | 원화 약세는 외국인 자금 유출 압력을 높입니다. |
| `usdkrw_pressure` | `kr_stock` | 0.3 | negative | short | 원화 약세는 한국 증시에 부담 요인입니다. |
| `usdkrw_pressure` | `kr_commodity` | 0.3 | positive | medium | 원화 약세는 수입물가 상승 압력으로 이어집니다. |

#### 유가/리스크 → 시장

| source | target | weight | direction | lag | explanation |
|---|---|---|---|---|---|
| `oil` | `kr_inflation` | 0.4 | positive | short | 유가 상승은 물가 상승 압력을 키웁니다. |
| `oil` | `kr_commodity` | 0.7 | positive | immediate | 유가 상승은 현물/원자재 부담을 직접 높입니다. |
| `risk` | `foreign_flow` | 0.5 | negative | immediate | 위험회피 심리 상승 시 외국인 자금 유출 압력이 커집니다. |
| `risk` | `kr_stock` | 0.3 | negative | immediate | 위험회피 심리는 주식시장에 부담입니다. |
| `foreign_flow` | `kr_stock` | 0.4 | positive | short | 외국인 자금 유입은 주식시장 지지 요인입니다. |

### 10.4 예외 규칙 목록

아래 예외는 `ConditionalException` 구조로 구현한다:

| 대상 규칙 | 조건 | 예외 설명 |
|---|---|---|
| `usdkrw_pressure` → `kr_stock` (negative) | `kr_growth` delta > +10 | 원화 약세에도 불구하고 수출주 일부에는 우호적 환경이 형성될 수 있습니다. |
| `kr_rate_pressure` → `kr_stock` (negative) | `kr_growth` delta > +15 | 성장률이 견조한 상태에서의 금리 인상은 주식시장 부담이 제한적일 수 있습니다. |
| `risk` → `kr_stock` (negative) | `kr_growth` delta > +10 AND `us_growth` delta > +5 | 글로벌 성장이 동반되면 위험회피 심리의 주식 부담이 완화될 수 있습니다. |
| `oil` → `kr_commodity` (positive) | `usdkrw_pressure` delta < -5 | 원화 강세가 동반되면 유가 상승의 수입물가 부담이 일부 상쇄될 수 있습니다. |
| `kr_growth` → `kr_stock` (positive) | `kr_inflation` delta > +20 | 성장이 과도한 물가 상승과 동반되면 주식 긍정 효과가 제한될 수 있습니다. |

---

## 11. 프리셋 시나리오

각 시나리오는 누르면 해당 입력값이 동시에 변경되고, 결과가 맵과 패널에 즉시 반영되어야 한다.

| ID | 라벨 | 변경할 입력값 |
|---|---|---|
| `us_hike` | 미국 금리 인상 | `us_rate: 85`, `usdkrw: 72`, `risk: 45` |
| `kr_inflation_surge` | 한국 물가 급등 | `kr_inflation: 82`, `kr_rate: 70`, `oil: 65` |
| `krw_weakness` | 원화 급약세 | `usdkrw: 85`, `risk: 55`, `us_rate: 70` |
| `oil_surge` | 유가 급등 | `oil: 88`, `kr_inflation: 68`, `risk: 50` |
| `slowdown` | 경기 둔화 우려 | `kr_growth: 25`, `us_growth: 30`, `eu_growth: 28`, `risk: 65` |
| `export_boom` | 수출 호조 | `kr_growth: 75`, `usdkrw: 58`, `us_growth: 65` |
| `risk_on` | 위험자산 선호 회복 | `risk: 10`, `kr_growth: 62`, `us_growth: 60` |

나머지 명시되지 않은 입력값은 baseline으로 리셋한다.

---

## 12. 인과관계 맵 노드 목록

### 12.1 노드 배치 전략

맵은 **좌 → 우 흐름**으로 3개 열을 구성한다:

```
[원인 레이어]  →  [매개 레이어]  →  [결과 레이어]
  x ≈ 0~150       x ≈ 250~400      x ≈ 500~650
```

각 열 안에서 수직 배치는 **국가별 그룹핑**을 따른다:
- 상단: 한국 (KR) — emerald 계열
- 중간: 미국 (US) — blue 계열
- 하단: EU — purple 계열
- 최하단: 글로벌 (GL) — amber 계열

### 12.2 전체 노드 목록

**원인 레이어 (7개)**
- 한국 성장률 (KR), 한국 물가 (KR)
- 미국 성장률 (US), 미국 물가 (US)
- EU 성장률 (EU)
- 유가 (GL), 위험회피 심리 (GL)

**매개 레이어 (5개)**
- 한국 금리 (KR)
- 미국 금리 (US)
- EU 금리 (EU)
- 달러 강세 압력 (GL)
- 원/달러 환율 (KR)

**결과 레이어 (8개)**
- 한국 채권 (KR), 한국 주식 (KR), 외국인 자금흐름 (KR), 한국 현물부담 (KR)
- 미국 채권 (US), 미국 주식 (US)
- EU 채권 (EU), EU 주식 (EU)

---

## 13. 노드 시각화 가이드

각 노드는 단순 카드가 아니라 "상태를 가진 생물체"처럼 보여야 한다.

### 노드 내부 구성
- 라벨 (12~14px, bold)
- 국가 배지 (컬러 도트 + 약어)
- 방향 표시 (↑ ↓ →)
- 강도 인디케이터 (●○○ 형태)
- 간단한 설명 1줄 (hover 또는 상시)

### 상태에 따른 시각 반응
- 상승 압력: 청록/에메랄드 계열 glow
- 하락 압력: 로즈/앰버 계열 glow
- 중립: 차분한 slate 계열
- 강한 변화: pulse 애니메이션 또는 outline flare

### 상호작용
- hover: 요약 툴팁 (연결된 규칙 설명 포함)
- click: 상세 정보 패널 오픈 (관련 규칙, 예외, 영향받는 변수 목록)
- 키보드 접근성 지원

---

## 14. 엣지(연결선) 시각화 가이드

연결선은 이 앱의 핵심이다.
단순 선이 아니라 **원인→결과의 에너지 흐름**처럼 보여야 한다.

### 요구사항
- positive/상승 방향: 에메랄드 계열
- negative/하락 방향: 로즈 계열
- 중립(영향 미미): 반투명 slate
- 두께로 강도 표현 (delta 기반 0.5px ~ 3px)
- animated stroke-dashoffset으로 인과 흐름 표현
- 선택된 노드와 관련된 엣지만 강조, 나머지 투명도 0.1로 낮추기
- 마우스 호버 시 해당 엣지의 규칙 설명 툴팁

---

## 15. 우측 패널 상세 요구사항

### 섹션 구성
1. **현재 시나리오 요약** — 1~2문장으로 현재 상태의 핵심을 설명
2. **즉시 반응** — 수시간~수일 내 반응
3. **단기 반응** — 수주~수개월 반응
4. **중기 반응** — 수개월~1년 반응
5. **예외/주의 포인트** — amber 배경으로 구분
6. **규칙 설명** — 어떤 규칙이 작동해서 이 결과가 나왔는지

### 톤 가이드
- 좋은 예: "미국 금리 상승은 달러 강세 압력을 높여 원/달러 환율 상승 압력으로 이어질 수 있습니다."
- 나쁜 예: "원달러 환율이 1,400원을 돌파할 것으로 예상됩니다."
- 모든 문장에 "~할 수 있습니다", "~가능성이 있습니다", "~압력이 형성됩니다" 등 비단정적 표현을 사용할 것.

---

## 16. 인터랙션 디테일

### 16.1 슬라이더 조작
- 값이 바뀌는 동안 중앙 맵이 실시간으로 반응
- 수치 입력 후 150~300ms 정도의 부드러운 트랜지션
- 변화 전/후 차이를 컬러와 미세한 모션으로 전달

### 16.2 리셋 기능
- Baseline으로 되돌리는 버튼 제공
- 모든 노드/엣지가 동시에 중립으로 돌아가는 애니메이션

### 16.3 비교 기능 (Phase 2 대비 구조만 준비)
- 구조적으로 `previousValues` 상태를 유지할 수 있게 설계
- MVP에서는 delta badge 표시만 구현

### 16.4 학습 모드 (Phase 2 대비 구조만 준비)
- 노드/규칙 데이터에 `difficulty: 'basic' | 'advanced'` 필드를 포함
- MVP에서는 모드 토글 UI 없이 전체 노드 표시

---

## 17. 정보 설계 원칙

### 17.1 숫자보다 상태 언어 우선
- 강세 압력 확대, 채권 가격 부담 심화, 외국인 유출 가능성 증가, 인플레이션 압력 완화

### 17.2 맥락형 설명 우선
- 나쁜 예: "채권은 금리와 반대로 움직입니다."
- 좋은 예: "현재 시나리오에서는 금리 인상 압력이 커지면서 채권 가격에 하락 압력이 형성됩니다."

### 17.3 텍스트 양 제한
- 한 패널에 텍스트가 과도하게 많지 않게 할 것
- 단계적 공개(요약 → 펼치기)를 사용

---

## 18. 반응형 요구사항

### 데스크톱 우선 (1280px+)
3열 구조 그대로 유지.

### 태블릿 (768~1279px)
- 좌측 패널을 상단 접이식으로 이동
- 중앙 맵 + 우측 패널 2열

### 모바일 (~767px)
- 상단: 조작 패널 접이식
- 중단: 핵심 맵 (축약 레이아웃, 핀치 줌 지원)
- 하단: 설명 패널

---

## 19. 접근성

- 슬라이더와 버튼은 키보드로 조작 가능 (Tab, Arrow keys)
- 컬러만으로 상태를 구분하지 말고 아이콘/텍스트/인디케이터 병행
- 다크 배경에서 WCAG AA 대비 확보 (4.5:1 이상)
- `prefers-reduced-motion` 미디어 쿼리 지원: 모션 강도 낮추기
- 노드에 `aria-label` 부여

---

## 20. 코드 아키텍처

### 20.1 디렉터리 구조

```
src/
  app/
    App.tsx
    main.tsx
  components/
    controls/
      ControlPanel.tsx
      SliderInput.tsx
      PresetButton.tsx
    map/
      CausalMap.tsx
      EconomicNode.tsx
      CausalEdge.tsx
    panels/
      TimelinePanel.tsx
      NodeDetailPanel.tsx
      ExceptionCard.tsx
    layout/
      AppLayout.tsx
      Header.tsx
    ui/
      GlassPanel.tsx
      RegionBadge.tsx
      IntensityDots.tsx
  domain/
    types.ts              // EconomicVariable, CausalRule, etc.
    nodes.ts              // 노드 정의 데이터
    rules.ts              // 규칙 정의 데이터
    scenarios.ts          // 프리셋 시나리오 데이터
    exceptions.ts         // 예외 규칙 데이터
    simulation/
      engine.ts           // 전파 알고리즘 (순수 함수)
      propagation.ts      // DAG 기반 전파 로직
      stateMapper.ts      // delta → displayState 변환
  store/
    simulationStore.ts    // Zustand 스토어
  hooks/
    useSimulation.ts
    useNodeInteraction.ts
  styles/
    tokens.ts             // 디자인 토큰 (색상, 간격 등)
    theme.css             // CSS 변수, 글로벌 스타일
  utils/
    clamp.ts
    formatters.ts
```

### 20.2 핵심 분리 원칙
- **domain/simulation/**: 순수 함수로만 구성. React 의존성 없음. 단독 테스트 가능.
- **domain/**: 모든 경제 데이터(노드, 규칙, 시나리오)는 코드와 분리된 데이터 파일로 관리.
- **components/**: 순수 렌더링만 담당. 시뮬레이션 로직을 직접 호출하지 않음.
- **store/**: Zustand로 입력값 → engine.ts 호출 → 파생값 저장 → 컴포넌트 구독.

---

## 21. 시뮬레이션 루프

```
1. Zustand 스토어에서 현재 입력값(inputs) 가져오기
2. 각 입력의 delta 계산 (value - baseline)
3. rules 배열을 lag 순서로 정렬
4. propagation.ts에서 DAG 순서대로 전파 실행
   - 감쇠 계수 적용 (2단계 이상 전파)
   - 동일 target 합산
   - 클램핑 (-50 ~ +50)
5. stateMapper.ts에서 각 파생값을 displayState로 변환
6. 예외 규칙 평가 (conditions 체크)
7. 시간 구간별(immediate/short/medium) 영향 그룹 생성
8. 스토어에 결과 저장 → 컴포넌트 자동 리렌더
```

### 출력 구조

```ts
interface SimulationResult {
  nodeStates: Record<string, NodeState>;
  edgeStates: Record<string, EdgeState>;
  timeline: {
    immediate: TimelineItem[];
    short: TimelineItem[];
    medium: TimelineItem[];
  };
  exceptions: ExceptionItem[];
  summary: string;
}
```

---

## 22. 구현 우선순위

### Phase 1: MVP
- 단일 페이지 앱
- 조작 패널 (슬라이더 + 프리셋)
- React Flow 기반 인과관계 맵
- 타임라인/설명 패널
- 룰 엔진 + 전파 알고리즘
- 예외 규칙 표시
- 다크 테마 + 고급 UI
- 온보딩/포지셔닝 안내
- GitHub Pages 배포

### Phase 2: 개선
- 비교 모드 (이전 상태와 delta 비교)
- 국가별 보기 전환
- 노드 상세 패널 고도화
- 저장 가능한 시나리오 (localStorage)
- URL state 공유 (query params)

### Phase 3: 확장
- 모바일 최적화 강화
- 학습 퀴즈 모드
- guided tour (step-by-step 온보딩)
- 실시간 뉴스 연동 (RSS 등 정적 가능한 방식)
- 더 많은 자산/국가 추가

---

## 23. 피해야 할 것

- 과도한 실제 시장 수치 집착
- 예측기로 오해될 만한 UI 문구
- 지나치게 복잡한 경제 모형
- 너무 많은 노드와 텍스트
- 평범한 관리형 대시보드 느낌
- 미적 완성도 없는 기술 데모 느낌
- 블랙박스 시뮬레이션 (모든 규칙은 설명 가능해야 함)

---

## 24. 성공 기준

1. 사용자가 **"금리, 환율, 채권, 주식, 현물"의 관계를 직관적으로 느낀다.**
2. 사용자가 **왜 미국 금리가 한국 환율과 증시에 영향을 줄 수 있는지** 설명할 수 있게 된다.
3. 사용자가 **원인 → 매개 → 결과** 구조를 시각적으로 기억하게 된다.
4. 사용자가 **더 깊은 공부를 하고 싶어지는 학습 촉매**를 경험한다.
5. 앱을 처음 열었을 때 **"예쁘다, 만져보고 싶다"**는 인상을 준다.

---

## 25. 최종 산출물

1. 실행 가능한 React + TypeScript 프로젝트 전체 코드
2. GitHub Pages 배포 설정 포함 (`vite.config.ts` base 설정, GitHub Actions workflow)
3. README.md
   - 실행 방법 (`pnpm install && pnpm dev`)
   - 빌드 방법 (`pnpm build`)
   - 배포 방법
   - 아키텍처 설명
4. `docs/RULES.md` — 전체 룰셋 및 전파 알고리즘 설명
5. `docs/DESIGN.md` — 디자인 결정 요약 및 시각 구조 선택 이유

---

## 26. 구현 톤에 대한 최종 지시

이 프로젝트는 "경제 데이터를 보여주는 사이트"가 아니라,
**경제 인과관계를 만지며 이해하는 시각적 학습 도구**다.

구현 우선순위:
1. 학습 직관성
2. 시각적 아름다움
3. 인과관계의 명확성
4. 과도하지 않은 추상화
5. 확장 가능한 코드 구조

> 사용자가 경제 변수 하나를 움직여 보면, 다른 변수들이 시간축 위에서 어떻게 반응하는지 아름답고 직관적으로 이해할 수 있는 인과관계 학습 시뮬레이터.
