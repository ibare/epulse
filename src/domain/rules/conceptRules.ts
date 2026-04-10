import type { CausalRule } from '../types';

// 개념 노드 규칙 (rc01~rc13)
export const conceptRules: CausalRule[] = [
  // ──────────────────────────────────────────────
  // 개념 노드: 입력 → 개념
  // ──────────────────────────────────────────────
  {
    id: 'rc01',
    source: 'kr_inflation',
    target: 'inflation_pressure',
    weight: 1.0,
    direction: 'positive',
    lag: 'immediate',
    explanation: '물가 상승은 인플레이션 압력을 높입니다.',
  },
  {
    id: 'rc02',
    source: 'oil',
    target: 'inflation_pressure',
    weight: 0.4,
    direction: 'positive',
    lag: 'immediate',
    explanation: '유가 상승은 수입물가를 통해 인플레이션 압력을 높입니다.',
  },
  {
    id: 'rc03',
    source: 'kr_growth',
    target: 'growth_pressure',
    weight: 1.0,
    direction: 'positive',
    lag: 'immediate',
    explanation: '경제성장률 상승은 경기 과열 압력을 높입니다.',
  },
  {
    id: 'rc04',
    source: 'kr_inflation',
    target: 'bok_stance',
    weight: 0.4,
    direction: 'positive',
    lag: 'immediate',
    explanation: '물가 상승은 중앙은행의 긴축 성향을 강화합니다.',
  },
  {
    id: 'rc05',
    source: 'us_rate',
    target: 'bok_stance',
    weight: 0.3,
    direction: 'positive',
    lag: 'immediate',
    explanation: '미국 금리 인상은 한국 금리 인상 압력으로 파급됩니다.',
  },
  {
    id: 'rc06',
    source: 'kr_growth',
    target: 'bok_stance',
    weight: 0.15,
    direction: 'positive',
    lag: 'immediate',
    explanation: '경기 과열은 중앙은행의 긴축 스탠스를 강화합니다.',
  },
  {
    id: 'rc07',
    source: 'kr_inflation',
    target: 'market_expectation',
    weight: 0.6,
    direction: 'positive',
    lag: 'immediate',
    explanation: '물가 상승은 시장의 금리 인상 기대를 강화합니다.',
  },
  {
    id: 'rc08',
    source: 'kr_growth',
    target: 'market_expectation',
    weight: 0.3,
    direction: 'positive',
    lag: 'immediate',
    explanation: '경기 과열은 시장의 금리 인상 기대를 높입니다.',
  },
  {
    id: 'rc09',
    source: 'usdkrw',
    target: 'market_expectation',
    weight: 0.15,
    direction: 'positive',
    lag: 'immediate',
    explanation: '환율 불안은 시장의 금리 인상 기대를 자극합니다.',
  },

  // ──────────────────────────────────────────────
  // 개념 노드: 개념 → 결과
  // ──────────────────────────────────────────────
  {
    id: 'rc10',
    source: 'bok_stance',
    target: 'kr_rate',
    weight: 1.0,
    direction: 'positive',
    lag: 'short',
    explanation: '중앙은행의 긴축 스탠스는 기준금리 인상으로 이어집니다.',
  },
  {
    id: 'rc11',
    source: 'inflation_pressure',
    target: 'kr_rate_pressure',
    weight: 0.42,
    direction: 'positive',
    lag: 'immediate',
    explanation: '인플레이션 압력은 시장금리 상승으로 이어집니다.',
  },
  {
    id: 'rc12',
    source: 'growth_pressure',
    target: 'kr_rate_pressure',
    weight: 0.21,
    direction: 'positive',
    lag: 'short',
    explanation: '경기 압력은 시장금리 상승 압력을 만듭니다.',
  },
  {
    id: 'rc13',
    source: 'market_expectation',
    target: 'kr_rate_pressure',
    weight: 0.3,
    direction: 'positive',
    lag: 'immediate',
    explanation: '시장의 금리 인상 기대는 시장금리를 먼저 끌어올립니다.',
  },
];
