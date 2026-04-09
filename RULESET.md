# ePulse 룰셋 레퍼런스

룰셋 정합성 검증용 문서. 코드 원본: `src/domain/`

---

## 1. 변수 목록

### Input 변수 (사용자 조작 가능)

| ID | 라벨 | 지역 | 레이어 | 기준값 |
|----|------|------|--------|--------|
| kr_growth | 경제성장률 | KR | cause | 50 |
| kr_inflation | 물가 | KR | cause | 50 |
| kr_rate | 기준금리 | KR | transmission | 50 |
| usdkrw | 원/달러 환율 | KR | transmission | 50 |
| us_rate | 기준금리 | US | transmission | 60 |
| us_inflation | 물가 | US | cause | 50 |
| us_growth | 성장률 | US | cause | 50 |
| oil | 유가 | GL | cause | 50 |
| risk | 위험회피 심리 | GL | cause | 30 |

### Derived 변수 (규칙에 의해 산출)

| ID | 라벨 | 지역 | 레이어 |
|----|------|------|--------|
| kr_rate_pressure | 시장금리 | KR | transmission |
| usd_strength | 달러 강세 지수 | GL | transmission |
| usdkrw_pressure | 시장환율 기대 | KR | transmission |
| kr_bond | 한국 채권 | KR | market |
| kr_stock | 한국 주식 | KR | market |
| kr_commodity | 한국 현물 | KR | market |
| foreign_flow | 외국인 자금 | KR | market |
| us_bond | 미국 채권 | US | market |
| us_stock | 미국 주식 | US | market |

---

## 2. 인과 규칙 (Causal Rules)

방향: `+` = positive (같은 방향), `-` = negative (반대 방향)
시차: `즉시` / `단기` / `중기`

### 물가 → 금리

| ID | Source → Target | 방향 | 가중치 | 시차 | 설명 |
|----|----------------|------|--------|------|------|
| r01 | kr_inflation → kr_rate_pressure | + | 0.6 | 즉시 | 한국 물가 상승 → 시장금리 인상 압력 |
| r02 | us_inflation → us_rate | + | 0.5 | 즉시 | 미국 물가 상승 → 연준 금리 인상 기대 |
| r31 | kr_inflation → kr_rate | + | 0.4 | 단기 | 한국 물가 상승 → 기준금리 인상 압력 |

### 성장률 → 금리/주식

| ID | Source → Target | 방향 | 가중치 | 시차 | 예외 조건 |
|----|----------------|------|--------|------|-----------|
| r04 | kr_growth → kr_rate_pressure | + | 0.3 | 단기 | |
| r05 | kr_growth → kr_stock | + | 0.5 | 단기 | kr_inflation > 20 → 효과 제한 |
| r06 | us_growth → us_stock | + | 0.5 | 단기 | |

### 금리 → 채권/주식/환율

| ID | Source → Target | 방향 | 가중치 | 시차 | 예외 조건 |
|----|----------------|------|--------|------|-----------|
| r08 | kr_rate_pressure → kr_bond | - | 0.8 | 즉시 | |
| r09 | kr_rate_pressure → kr_stock | - | 0.3 | 단기 | kr_growth > 15 → 부담 제한적 |
| r10 | us_rate → usd_strength | + | 0.7 | 즉시 | |
| r11 | us_rate → us_bond | - | 0.8 | 즉시 | |
| r32 | kr_rate → kr_bond | - | 0.5 | 즉시 | |
| r33 | kr_rate → kr_stock | - | 0.2 | 단기 | |
| r34 | kr_rate → usdkrw | - | 0.25 | 단기 | |
| r38 | us_rate → us_stock | - | 0.3 | 단기 | |

### 금리 → 물가 (긴축/완화 효과)

| ID | Source → Target | 방향 | 가중치 | 시차 | 설명 |
|----|----------------|------|--------|------|------|
| r39 | kr_rate → kr_inflation | - | 0.3 | 중기 | 한국 기준금리 인상 → 수요 억제 → 물가 하락 |
| r40 | us_rate → us_inflation | - | 0.3 | 중기 | 미국 금리 인상 → 수요 억제 → 물가 하락 |

### 달러/환율 → 한국 시장

| ID | Source → Target | 방향 | 가중치 | 시차 | 예외 조건 |
|----|----------------|------|--------|------|-----------|
| r13 | usd_strength → usdkrw_pressure | + | 0.6 | 즉시 | |
| r14 | usdkrw → usdkrw_pressure | + | 0.5 | 즉시 | |
| r15 | usdkrw_pressure → foreign_flow | - | 0.7 | 단기 | |
| r16 | usdkrw_pressure → kr_stock | - | 0.3 | 단기 | kr_growth > 10 → 수출주 우호 |
| r17 | usdkrw_pressure → kr_commodity | + | 0.3 | 중기 | |

### 유가 → 전방위

| ID | Source → Target | 방향 | 가중치 | 시차 | 예외 조건 |
|----|----------------|------|--------|------|-----------|
| r18 | oil → kr_inflation | + | 0.4 | 단기 | |
| r19 | oil → kr_commodity | + | 0.7 | 즉시 | usdkrw_pressure < -5 → 원화 강세 시 상쇄 |
| r23 | oil → us_inflation | + | 0.3 | 단기 | |
| r25 | oil → kr_stock | - | 0.2 | 단기 | |
| r26 | oil → us_stock | - | 0.15 | 단기 | |
| r27 | oil → risk | + | 0.2 | 중기 | |

### 위험회피 심리 → 시장

| ID | Source → Target | 방향 | 가중치 | 시차 | 예외 조건 |
|----|----------------|------|--------|------|-----------|
| r20 | risk → foreign_flow | - | 0.5 | 즉시 | |
| r21 | risk → kr_stock | - | 0.3 | 즉시 | kr_growth > 10 & us_growth > 5 → 완화 |
| r28 | risk → us_stock | - | 0.25 | 즉시 | |

### 외국인 자금 → 주식

| ID | Source → Target | 방향 | 가중치 | 시차 |
|----|----------------|------|--------|------|
| r22 | foreign_flow → kr_stock | + | 0.4 | 단기 |

### Input 간 크로스 전파

| ID | Source → Target | 방향 | 가중치 | 시차 | 설명 |
|----|----------------|------|--------|------|------|
| r30 | us_rate → kr_rate | + | 0.3 | 단기 | 미국 금리 → 한국 금리 압력 파급 |
| r36 | kr_growth → usdkrw | - | 0.2 | 단기 | 한국 성장 → 원화 강세 |

### 성장률 크로스

| ID | Source → Target | 방향 | 가중치 | 시차 |
|----|----------------|------|--------|------|
| r35 | us_growth → kr_stock | + | 0.2 | 단기 |

---

## 3. 모순 규칙 (Contradiction Rules)

두 변수가 모두 사용자에 의해 고정(pinned)된 경우에만 발동.

| ID | 조건 | 심각도 | 설명 |
|----|------|--------|------|
| c01 | kr_inflation >= 65 && kr_rate <= 40 | critical | 고물가 + 저금리 비현실적 |
| c02 | us_inflation >= 65 && us_rate <= 45 | critical | 미국 고물가 + 저금리 비현실적 |
| c03 | kr_growth >= 70 && kr_inflation <= 35 | warning | 경기 과열 + 저물가 비현실적 |
| c04 | oil >= 70 && kr_inflation <= 40 | warning | 고유가 + 저물가 비현실적 |
| c05 | us_rate >= 75 && usdkrw <= 40 | critical | 미국 고금리 + 원화 강세 비현실적 |
| c06 | risk <= 20 && usdkrw >= 70 | warning | 안정 심리 + 원화 약세 비현실적 |

---

## 4. 시나리오 프리셋

| ID | 라벨 | 변경 입력값 |
|----|------|------------|
| us_hike | 미국 금리 인상 | us_rate=85, usdkrw=72, risk=45 |
| kr_inflation_surge | 한국 물가 급등 | kr_inflation=82, kr_rate=70, oil=65 |
| krw_weakness | 원화 급약세 | usdkrw=85, risk=55, us_rate=70 |
| oil_surge | 유가 급등 | oil=88, kr_inflation=68, risk=50 |
| slowdown | 경기 둔화 우려 | kr_growth=25, us_growth=30, risk=65 |
| export_boom | 수출 호조 | kr_growth=75, usdkrw=58, us_growth=65 |

---

## 5. 전파 메커니즘

- **위상 정렬**: Kahn's algorithm으로 DAG 순서 결정
- **감쇠**: depth >= 2인 source에서 `0.7^(depth-1)` 적용
- **활성화 임계값**: |sourceDelta| >= 4 → 엣지 활성
- **소프트 커플링**: 고정(pinned) input을 target으로 삼는 규칙 제외, 비고정 input은 baseline + 규칙 delta로 자동 조정
- **전파 순서 레이블**: `depths[source] + 1`로 엣지에 표시
