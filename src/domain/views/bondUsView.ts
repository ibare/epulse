/**
 * 미국 채권시장 상세 뷰 정의
 *
 * 개념 노드는 엔진 변수로 등록되어 conceptRules.ts의 rbu01~rbu08에서 계산된다.
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

function safeHavenLabel(delta: number): string {
  if (delta >= 20) return '강한 안전 수요';
  if (delta >= 8) return '안전 수요';
  if (delta >= -7) return '중립';
  if (delta >= -19) return '수요 감소';
  return '강한 수요 감소';
}

// ─── 미국 채권 뷰 정의 ─────────────────────────────

export const bondUsView: DetailViewDef = {
  id: 'bond-us',
  label: '미국 채권시장 상세',
  routePath: '/bond-us',

  inputNodeIds: ['us_rate', 'us_inflation', 'us_growth', 'oil', 'risk'],

  conceptNodes: [
    {
      id: 'rate_burden_us',
      label: '금리 부담',
      description: '연준 금리와 물가가 높으면 채권 금리가 올라가고, 기존 채권의 가격은 떨어진다. 금리와 채권의 역관계는 채권의 가장 기본적인 메커니즘이다.',
      targets: [
        {
          targetId: 'us_bond',
          direction: 'negative',
          description: '금리 부담은 채권 가격 하락 압력을 만듭니다.',
        },
      ],
      labelFn: rateBurdenLabel,
    },
    {
      id: 'credit_condition_us',
      label: '신용 상태',
      description: '경제성장률이 높으면 기업의 채무 상환 능력이 좋아져 신용이 개선된다. 유가 상승은 비용 부담을 통해 신용을 악화시킨다.',
      targets: [
        {
          targetId: 'us_bond',
          direction: 'positive',
          description: '신용 상태 개선은 채권 가격 상승 압력을 줍니다.',
        },
      ],
      labelFn: creditLabel,
    },
    {
      id: 'safe_haven_demand',
      label: '안전자산 수요',
      description: '글로벌 불안이 커지면 투자자들이 안전한 미국 국채로 자금을 이동시킨다. 미국 국채만의 독특한 안전자산 지위이다.',
      targets: [
        {
          targetId: 'us_bond',
          direction: 'positive',
          description: '안전자산 수요 증가는 미국 국채 가격 상승 압력을 줍니다.',
        },
      ],
      labelFn: safeHavenLabel,
    },
  ],

  resultNodeIds: ['us_bond'],

  edges: [
    // 1열 → 2열: 입력 → 개념
    {
      id: 'bue01',
      source: 'us_rate',
      target: 'rate_burden_us',
      direction: 'positive',
      ruleIds: ['rbu01'],
      explanation: '미국 금리 인상은 채권 금리 부담을 높입니다.',
    },
    {
      id: 'bue02',
      source: 'us_inflation',
      target: 'rate_burden_us',
      direction: 'positive',
      ruleIds: ['rbu02'],
      explanation: '물가 상승은 금리 인상 기대를 통해 금리 부담을 높입니다.',
    },
    {
      id: 'bue03',
      source: 'us_growth',
      target: 'credit_condition_us',
      direction: 'positive',
      ruleIds: ['rbu03'],
      explanation: '경제성장률 상승은 기업 신용을 개선합니다.',
    },
    {
      id: 'bue04',
      source: 'oil',
      target: 'credit_condition_us',
      direction: 'negative',
      ruleIds: ['rbu04'],
      explanation: '유가 상승은 기업 비용 부담을 통해 신용을 악화시킵니다.',
    },
    {
      id: 'bue05',
      source: 'risk',
      target: 'safe_haven_demand',
      direction: 'positive',
      ruleIds: ['rbu05'],
      explanation: '위험회피 심리 확산은 미국 국채 안전자산 수요를 높입니다.',
    },
    // 2열 → 3열: 개념 → 결과
    {
      id: 'bue06',
      source: 'rate_burden_us',
      target: 'us_bond',
      direction: 'negative',
      ruleIds: ['rbu06'],
      explanation: '금리 부담은 채권 가격 하락 압력을 만듭니다.',
    },
    {
      id: 'bue07',
      source: 'credit_condition_us',
      target: 'us_bond',
      direction: 'positive',
      ruleIds: ['rbu07'],
      explanation: '신용 상태 개선은 채권 가격 상승 압력을 줍니다.',
    },
    {
      id: 'bue08',
      source: 'safe_haven_demand',
      target: 'us_bond',
      direction: 'positive',
      ruleIds: ['rbu08'],
      explanation: '안전자산 수요 증가는 미국 국채 가격 상승 압력을 줍니다.',
    },
  ],

  positions: {
    // 1열: 입력 (x=0)
    us_rate:      { x: 0, y: 0 },
    us_inflation: { x: 0, y: 120 },
    us_growth:    { x: 0, y: 240 },
    oil:          { x: 0, y: 360 },
    risk:         { x: 0, y: 480 },
    // 2열: 중간 개념 (x=350)
    rate_burden_us:      { x: 350, y: 60 },
    credit_condition_us: { x: 350, y: 240 },
    safe_haven_demand:   { x: 350, y: 420 },
    // 3열: 결과 (x=700)
    us_bond: { x: 700, y: 240 },
  },

  entryNodeIds: ['us_bond'],

  macroCollapsedEdges: [
    {
      id: 'mbu01',
      source: 'us_inflation',
      target: 'us_bond',
      direction: 'negative',
      lag: 'medium',
      explanation: '물가 상승이 금리 부담을 통해 채권에 하락 압력을 줍니다.',
    },
    {
      id: 'mbu02',
      source: 'risk',
      target: 'us_bond',
      direction: 'positive',
      lag: 'immediate',
      explanation: '위험회피 심리가 안전자산 수요를 통해 채권에 상승 압력을 줍니다.',
    },
  ],
};

// ─── 편의 파생값 ────────────────────────────────────

export const bondUsConceptMap = Object.fromEntries(
  bondUsView.conceptNodes.map((c) => [c.id, c]),
);
