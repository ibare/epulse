/**
 * 한국 채권시장 상세 뷰 정의
 *
 * 개념 노드는 엔진 변수로 등록되어 conceptRules.ts의 rbk01~rbk09에서 계산된다.
 * 이 파일은 뷰의 노드 구성, 좌표, 특화 라벨, 합성 엣지를 정의한다.
 */

import type { DetailViewDef } from './types';

// ─── 특화 라벨 함수 ─────────────────────────────────

function rateBurdenLabel(delta: number): string {
  if (delta >= 20) return '강한 금리 부담';
  if (delta >= 8) return '금리 부담';
  if (delta >= -7) return '중립';
  if (delta >= -19) return '금리 완화';
  return '강한 금리 완화';
}

function creditLabel(delta: number): string {
  if (delta >= 20) return '강한 신용 양호';
  if (delta >= 8) return '신용 양호';
  if (delta >= -7) return '중립';
  if (delta >= -19) return '신용 악화';
  return '강한 신용 악화';
}

function foreignBondLabel(delta: number): string {
  if (delta >= 20) return '강한 유입';
  if (delta >= 8) return '유입';
  if (delta >= -7) return '중립';
  if (delta >= -19) return '유출';
  return '강한 유출';
}

// ─── 한국 채권 뷰 정의 ─────────────────────────────

export const bondKrView: DetailViewDef = {
  id: 'bond-kr',
  label: '한국 채권시장 상세',
  routePath: '/bond-kr',

  inputNodeIds: ['kr_rate', 'kr_inflation', 'kr_growth', 'usdkrw', 'us_rate'],

  conceptNodes: [
    {
      id: 'rate_burden_kr',
      label: '금리 부담',
      description: '기준금리와 물가가 높으면 채권 금리가 올라가고, 기존 채권의 가격은 떨어진다. 채권의 가장 기본적인 메커니즘이다.',
      targets: [
        {
          targetId: 'kr_bond',
          direction: 'negative',
          description: '금리 부담은 채권 가격 하락 압력을 만듭니다.',
        },
      ],
      labelFn: rateBurdenLabel,
    },
    {
      id: 'credit_condition_kr',
      label: '신용 상태',
      description: '경제성장률이 높으면 기업·국가의 채무 상환 능력이 좋아져 신용이 개선된다. 물가가 과도하면 재정 부담이 커져 신용이 악화된다.',
      targets: [
        {
          targetId: 'kr_bond',
          direction: 'positive',
          description: '신용 상태 개선은 채권 가격 상승 압력을 줍니다.',
        },
      ],
      labelFn: creditLabel,
    },
    {
      id: 'foreign_bond_demand_kr',
      label: '외국인 수요',
      description: '환율과 미국 금리가 외국인 투자자의 한국 채권 참여에 영향을 준다. 원화 약세나 미국 금리 상승 시 자금 이탈 압력이 커진다.',
      targets: [
        {
          targetId: 'kr_bond',
          direction: 'positive',
          description: '외국인 채권 수요 증가는 가격 상승 압력을 줍니다.',
        },
      ],
      labelFn: foreignBondLabel,
    },
  ],

  resultNodeIds: ['kr_bond'],

  edges: [
    // 1열 → 2열: 입력 → 개념
    {
      id: 'bke01',
      source: 'kr_rate',
      target: 'rate_burden_kr',
      direction: 'positive',
      ruleIds: ['rbk01'],
      explanation: '기준금리 상승은 채권 금리 부담을 높입니다.',
    },
    {
      id: 'bke02',
      source: 'kr_inflation',
      target: 'rate_burden_kr',
      direction: 'positive',
      ruleIds: ['rbk02'],
      explanation: '물가 상승은 금리 인상 기대를 통해 금리 부담을 높입니다.',
    },
    {
      id: 'bke03',
      source: 'kr_growth',
      target: 'credit_condition_kr',
      direction: 'positive',
      ruleIds: ['rbk03'],
      explanation: '경제성장률 상승은 기업·국가 신용을 개선합니다.',
    },
    {
      id: 'bke04',
      source: 'kr_inflation',
      target: 'credit_condition_kr',
      direction: 'negative',
      ruleIds: ['rbk04'],
      explanation: '과도한 물가 상승은 재정 부담으로 신용을 악화시킵니다.',
    },
    {
      id: 'bke05',
      source: 'usdkrw',
      target: 'foreign_bond_demand_kr',
      direction: 'negative',
      ruleIds: ['rbk05'],
      explanation: '원화 약세는 외국인 채권 투자 매력을 낮춥니다.',
    },
    {
      id: 'bke06',
      source: 'us_rate',
      target: 'foreign_bond_demand_kr',
      direction: 'negative',
      ruleIds: ['rbk06'],
      explanation: '미국 금리 인상은 외국인 자금을 미국으로 끌어갑니다.',
    },
    // 2열 → 3열: 개념 → 결과
    {
      id: 'bke07',
      source: 'rate_burden_kr',
      target: 'kr_bond',
      direction: 'negative',
      ruleIds: ['rbk07'],
      explanation: '금리 부담은 채권 가격 하락 압력을 만듭니다.',
    },
    {
      id: 'bke08',
      source: 'credit_condition_kr',
      target: 'kr_bond',
      direction: 'positive',
      ruleIds: ['rbk08'],
      explanation: '신용 상태 개선은 채권 가격 상승 압력을 줍니다.',
    },
    {
      id: 'bke09',
      source: 'foreign_bond_demand_kr',
      target: 'kr_bond',
      direction: 'positive',
      ruleIds: ['rbk09'],
      explanation: '외국인 채권 수요 증가는 가격 상승 압력을 줍니다.',
    },
  ],

  positions: {
    // 1열: 입력 (x=0)
    kr_rate:      { x: 0, y: 0 },
    kr_inflation: { x: 0, y: 120 },
    kr_growth:    { x: 0, y: 240 },
    usdkrw:       { x: 0, y: 360 },
    us_rate:      { x: 0, y: 480 },
    // 2열: 중간 개념 (x=350)
    rate_burden_kr:         { x: 350, y: 60 },
    credit_condition_kr:    { x: 350, y: 240 },
    foreign_bond_demand_kr: { x: 350, y: 420 },
    // 3열: 결과 (x=700)
    kr_bond: { x: 700, y: 240 },
  },

  entryNodeIds: ['kr_bond'],

  macroCollapsedEdges: [
    {
      id: 'mbk01',
      source: 'kr_inflation',
      target: 'kr_bond',
      direction: 'negative',
      lag: 'medium',
      explanation: '물가 상승이 금리 부담과 신용 악화를 통해 채권에 하락 압력을 줍니다.',
    },
    {
      id: 'mbk02',
      source: 'usdkrw',
      target: 'kr_bond',
      direction: 'negative',
      lag: 'short',
      explanation: '원화 약세가 외국인 채권 투자 이탈을 통해 채권에 하락 압력을 줍니다.',
    },
  ],
};

// ─── 편의 파생값 ────────────────────────────────────

export const bondKrConceptMap = Object.fromEntries(
  bondKrView.conceptNodes.map((c) => [c.id, c]),
);
