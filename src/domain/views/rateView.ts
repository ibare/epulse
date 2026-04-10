/**
 * 금리 상세 뷰 정의
 *
 * 기존 rateMapping.ts의 데이터를 DetailViewDef 형태로 재구성.
 * 중간 개념 노드, 엣지, 좌표, 특화 라벨 함수를 포함한다.
 */

import type { DetailViewDef } from './types';

// ─── 특화 라벨 함수 ─────────────────────────────────

function stanceLabel(delta: number): string {
  if (delta >= 20) return '강한 긴축';
  if (delta >= 8) return '긴축';
  if (delta >= -7) return '중립';
  if (delta >= -19) return '완화';
  return '강한 완화';
}

function expectationLabel(delta: number): string {
  if (delta >= 20) return '강한 인상 기대';
  if (delta >= 8) return '인상 기대';
  if (delta >= -7) return '중립';
  if (delta >= -19) return '인하 기대';
  return '강한 인하 기대';
}

// ─── 금리 뷰 정의 ───────────────────────────────────

export const rateView: DetailViewDef = {
  id: 'rate',
  label: '금리 상세',
  routePath: '/rate',

  inputNodeIds: ['kr_inflation', 'kr_growth', 'usdkrw', 'oil', 'us_rate'],

  conceptNodes: [
    {
      id: 'inflation_pressure',
      label: '인플레이션 압력',
      description: '물가 상승과 수입물가(유가) 상승이 만드는 금리 인상 압력',
      contributions: [
        { sourceId: 'kr_inflation', weight: 1.0, ruleIds: ['r01', 'r31'] },
        { sourceId: 'oil', weight: 0.4, ruleIds: ['r18'] },
      ],
      targets: [
        {
          targetId: 'kr_rate_pressure',
          direction: 'positive',
          description: '인플레이션 압력은 시장금리 상승으로 이어집니다.',
        },
      ],
    },
    {
      id: 'growth_pressure',
      label: '경기 압력',
      description: '경제성장률이 만드는 금리 방향 압력. 성장이 높으면 긴축, 낮으면 완화 방향.',
      contributions: [
        { sourceId: 'kr_growth', weight: 1.0, ruleIds: ['r04'] },
      ],
      targets: [
        {
          targetId: 'kr_rate_pressure',
          direction: 'positive',
          description: '경기 과열은 시장금리 상승 압력을 만듭니다.',
        },
      ],
    },
    {
      id: 'bok_stance',
      label: '중앙은행 스탠스',
      description: '한국은행이 물가·성장·외부 환경을 종합해 결정하는 기준금리 방향',
      contributions: [
        { sourceId: 'kr_inflation', weight: 0.4, ruleIds: ['r31'] },
        { sourceId: 'us_rate', weight: 0.3, ruleIds: ['r30'] },
        { sourceId: 'kr_growth', weight: 0.15, ruleIds: [] },
      ],
      targets: [
        {
          targetId: 'kr_rate',
          direction: 'positive',
          description: '매파적 스탠스는 기준금리 인상으로 이어집니다.',
        },
      ],
      labelFn: stanceLabel,
    },
    {
      id: 'market_expectation',
      label: '시장 기대',
      description: '시장 참여자들이 미래 금리를 어떻게 예상하는지. 시장금리에 선반영됨.',
      contributions: [
        { sourceId: 'kr_inflation', weight: 0.6, ruleIds: ['r01'] },
        { sourceId: 'kr_growth', weight: 0.3, ruleIds: ['r04'] },
        { sourceId: 'usdkrw', weight: 0.15, ruleIds: [] },
      ],
      targets: [
        {
          targetId: 'kr_rate_pressure',
          direction: 'positive',
          description: '인상 기대가 강할수록 시장금리가 먼저 오릅니다.',
        },
      ],
      labelFn: expectationLabel,
    },
  ],

  resultNodeIds: ['kr_rate', 'kr_rate_pressure'],

  edges: [
    // 1열 → 2열: 입력 → 개념
    {
      id: 're01',
      source: 'kr_inflation',
      target: 'inflation_pressure',
      direction: 'positive',
      ruleIds: ['r01', 'r31'],
      explanation: '물가 상승은 인플레이션 압력을 높입니다.',
    },
    {
      id: 're02',
      source: 'oil',
      target: 'inflation_pressure',
      direction: 'positive',
      ruleIds: ['r18'],
      explanation: '유가 상승은 수입물가를 통해 인플레이션 압력을 높입니다.',
    },
    {
      id: 're03',
      source: 'kr_growth',
      target: 'growth_pressure',
      direction: 'positive',
      ruleIds: ['r04'],
      explanation: '경제성장률 상승은 경기 과열 압력을 높입니다.',
    },
    {
      id: 're04',
      source: 'kr_inflation',
      target: 'bok_stance',
      direction: 'positive',
      ruleIds: ['r31'],
      explanation: '물가 상승은 중앙은행의 긴축 성향을 강화합니다.',
    },
    {
      id: 're05',
      source: 'us_rate',
      target: 'bok_stance',
      direction: 'positive',
      ruleIds: ['r30'],
      explanation: '미국 금리 인상은 한국 금리 인상 압력으로 파급됩니다.',
    },
    {
      id: 're06',
      source: 'kr_inflation',
      target: 'market_expectation',
      direction: 'positive',
      ruleIds: ['r01'],
      explanation: '물가 상승은 시장의 금리 인상 기대를 강화합니다.',
    },
    {
      id: 're07',
      source: 'kr_growth',
      target: 'market_expectation',
      direction: 'positive',
      ruleIds: ['r04'],
      explanation: '경기 과열은 시장의 금리 인상 기대를 높입니다.',
    },
    {
      id: 're08',
      source: 'usdkrw',
      target: 'market_expectation',
      direction: 'positive',
      ruleIds: [],
      explanation: '환율 불안은 시장의 금리 인상 기대를 자극합니다.',
    },
    // 2열 → 3열: 개념 → 결과
    {
      id: 're09',
      source: 'bok_stance',
      target: 'kr_rate',
      direction: 'positive',
      ruleIds: ['r30', 'r31'],
      explanation: '중앙은행의 긴축 스탠스는 기준금리 인상으로 이어집니다.',
    },
    {
      id: 're10',
      source: 'market_expectation',
      target: 'kr_rate_pressure',
      direction: 'positive',
      ruleIds: ['r01', 'r04'],
      explanation: '시장의 금리 인상 기대는 시장금리를 먼저 끌어올립니다.',
    },
    {
      id: 're11',
      source: 'inflation_pressure',
      target: 'kr_rate_pressure',
      direction: 'positive',
      ruleIds: ['r01'],
      explanation: '인플레이션 압력은 시장금리 상승으로 이어집니다.',
    },
    {
      id: 're12',
      source: 'growth_pressure',
      target: 'kr_rate_pressure',
      direction: 'positive',
      ruleIds: ['r04'],
      explanation: '경기 압력은 시장금리 상승 압력을 만듭니다.',
    },
  ],

  positions: {
    // 1열: 입력 (x=0)
    kr_inflation: { x: 0, y: 0 },
    kr_growth:    { x: 0, y: 120 },
    usdkrw:       { x: 0, y: 240 },
    oil:          { x: 0, y: 360 },
    us_rate:      { x: 0, y: 480 },
    // 2열: 중간 개념 (x=350)
    inflation_pressure:  { x: 350, y: 30 },
    growth_pressure:     { x: 350, y: 170 },
    bok_stance:          { x: 350, y: 310 },
    market_expectation:  { x: 350, y: 450 },
    // 3열: 결과 (x=700)
    kr_rate:          { x: 700, y: 170 },
    kr_rate_pressure: { x: 700, y: 370 },
  },

  entryNodeIds: ['kr_rate', 'kr_rate_pressure'],
};

// ─── 편의 파생값 ────────────────────────────────────

export const rateConceptMap = Object.fromEntries(
  rateView.conceptNodes.map((c) => [c.id, c]),
);
