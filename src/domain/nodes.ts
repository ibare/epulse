import type { EconomicVariable } from './types';

// 입력 변수 12개
const inputVariables: EconomicVariable[] = [
  // 한국 - 원인 레이어
  { id: 'kr_growth', label: '경제성장률', region: 'KR', type: 'input', layer: 'cause', baseline: 50 },
  { id: 'kr_inflation', label: '물가', region: 'KR', type: 'input', layer: 'cause', baseline: 50 },

  // 한국 - 매개 레이어 (input이지만 매개 레이어에 표시)
  { id: 'kr_rate', label: '기준금리', region: 'KR', type: 'input', layer: 'transmission', baseline: 50 },
  { id: 'usdkrw', label: '원/달러 환율', region: 'KR', type: 'input', layer: 'transmission', baseline: 50 },

  // 미국
  { id: 'us_rate', label: '기준금리', region: 'US', type: 'input', layer: 'transmission', baseline: 60 },
  { id: 'us_inflation', label: '물가', region: 'US', type: 'input', layer: 'cause', baseline: 50 },
  { id: 'us_growth', label: '성장률', region: 'US', type: 'input', layer: 'cause', baseline: 50 },

  // 글로벌
  { id: 'oil', label: '유가', region: 'GL', type: 'input', layer: 'cause', baseline: 50 },
  { id: 'risk', label: '위험회피 심리', region: 'GL', type: 'input', layer: 'cause', baseline: 30 },
];

// 파생 변수 11개
const derivedVariables: EconomicVariable[] = [
  // 한국 - 매개 레이어
  { id: 'kr_rate_pressure', label: '시장금리', region: 'KR', type: 'derived', layer: 'transmission', baseline: 0 },

  // 글로벌 - 매개 레이어
  { id: 'usd_strength', label: '달러 지수', region: 'GL', type: 'derived', layer: 'market', baseline: 0 },

  // 한국 - 매개 레이어
  { id: 'usdkrw_pressure', label: '시장환율 기대', region: 'KR', type: 'derived', layer: 'transmission', baseline: 0 },

  // 한국 - 시장 레이어
  { id: 'kr_bond', label: '한국 채권', region: 'KR', type: 'derived', layer: 'market', baseline: 0 },
  { id: 'kr_stock', label: '한국 주식', region: 'KR', type: 'derived', layer: 'market', baseline: 0 },
  { id: 'kr_commodity', label: '한국 현물', region: 'KR', type: 'derived', layer: 'market', baseline: 0 },
  { id: 'foreign_flow', label: '외국인 자금', region: 'KR', type: 'derived', layer: 'market', baseline: 0 },

  // 미국 - 시장 레이어
  { id: 'us_bond', label: '미국 채권', region: 'US', type: 'derived', layer: 'market', baseline: 0 },
  { id: 'us_stock', label: '미국 주식', region: 'US', type: 'derived', layer: 'market', baseline: 0 },

  // 글로벌 - 시장 레이어
  { id: 'gold', label: '금(안전자산시장)', region: 'GL', type: 'derived', layer: 'market', baseline: 0 },

  // 개념 노드 — 상세 뷰 전용 (거시 뷰에서 필터됨)
  { id: 'inflation_pressure', label: '인플레이션 압력', region: 'KR', type: 'derived', layer: 'concept', baseline: 0 },
  { id: 'growth_pressure',    label: '경기 압력',       region: 'KR', type: 'derived', layer: 'concept', baseline: 0 },
  { id: 'bok_stance',         label: '중앙은행 스탠스', region: 'KR', type: 'derived', layer: 'concept', baseline: 0 },
  { id: 'market_expectation', label: '시장 기대',       region: 'KR', type: 'derived', layer: 'concept', baseline: 0 },
];

export const variables: EconomicVariable[] = [
  ...inputVariables,
  ...derivedVariables,
];

export const variableMap: Record<string, EconomicVariable> = Object.fromEntries(
  variables.map((v) => [v.id, v]),
);

// React Flow 노드 위치 좌표
// 3열 배치: 원인(x=0) → 매개(x=350) → 시장(x=700)
// 국가별 그룹핑: KR 상단, US 중간, GL 하단
export const nodePositions: Record<string, { x: number; y: number }> = {
  // 원인 레이어 (x=0) — KR
  kr_growth:     { x: 0, y: 0 },
  kr_inflation:  { x: 0, y: 100 },

  // 원인 레이어 — US
  us_inflation:  { x: 0, y: 240 },
  us_growth:     { x: 0, y: 340 },

  // 원인 레이어 — GL
  oil:           { x: 0, y: 480 },
  risk:          { x: 0, y: 580 },

  // 매개 레이어 (x=350) — KR
  kr_rate:           { x: 350, y: 0 },
  usdkrw:            { x: 350, y: 100 },
  kr_rate_pressure:  { x: 350, y: 200 },
  usdkrw_pressure:   { x: 350, y: 300 },

  // 매개 레이어 — US
  us_rate:       { x: 350, y: 440 },

  // 시장 레이어 (x=700) — KR
  kr_bond:       { x: 700, y: 0 },
  kr_stock:      { x: 700, y: 100 },
  kr_commodity:  { x: 700, y: 200 },
  foreign_flow:  { x: 700, y: 300 },

  // 시장 레이어 — US
  us_bond:       { x: 700, y: 440 },
  us_stock:      { x: 700, y: 540 },

  // 시장 레이어 — GL
  usd_strength:  { x: 700, y: 640 },
  gold:          { x: 700, y: 740 },
};
