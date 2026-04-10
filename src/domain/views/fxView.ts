/**
 * 환율 상세 뷰 정의
 *
 * 개념 노드는 엔진 변수로 등록되어 conceptRules.ts의 rfx01~rfx09에서 계산된다.
 * 이 파일은 뷰의 노드 구성, 좌표, 특화 라벨, 합성 엣지를 정의한다.
 */

import type { DetailViewDef } from './types';

// ─── 특화 라벨 함수 ─────────────────────────────────

function dollarDemandLabel(delta: number): string {
  if (delta >= 11) return '강한 수요';
  if (delta >= 4) return '수요 증가';
  if (delta >= -3) return '중립';
  if (delta >= -10) return '수요 감소';
  return '강한 수요 감소';
}

function krwAttractivenessLabel(delta: number): string {
  if (delta >= 11) return '매우 높음';
  if (delta >= 4) return '높음';
  if (delta >= -3) return '중립';
  if (delta >= -10) return '낮음';
  return '매우 낮음';
}

function capitalFlightLabel(delta: number): string {
  if (delta >= 11) return '강한 이탈 압력';
  if (delta >= 4) return '이탈 압력';
  if (delta >= -3) return '중립';
  if (delta >= -10) return '유입 압력';
  return '강한 유입 압력';
}

// ─── 환율 뷰 정의 ──────────────────────────────────

export const fxView: DetailViewDef = {
  id: 'fx',
  label: '환율 상세',
  routePath: '/fx',

  inputNodeIds: ['us_rate', 'kr_rate', 'kr_growth', 'oil', 'risk'],

  conceptNodes: [
    {
      id: 'dollar_demand_fx',
      label: '달러 수요',
      description: '미국 금리 상승, 유가 상승, 위험회피 심리가 달러를 사려는 힘을 키운다. 달러 수요가 강할수록 환율 상승(원화 약세) 압력이 커진다.',
      targets: [
        {
          targetId: 'usdkrw_pressure',
          direction: 'positive',
          description: '달러 수요 증가는 환율 상승 압력을 만듭니다.',
        },
      ],
      labelFn: dollarDemandLabel,
    },
    {
      id: 'krw_attractiveness_fx',
      label: '원화 매력도',
      description: '한국 금리가 높고 경제성장이 견조하면 원화 자산의 보유 매력이 높아진다. 원화 매력이 높을수록 환율 하락(원화 강세) 압력이 커진다.',
      targets: [
        {
          targetId: 'usdkrw_pressure',
          direction: 'negative',
          description: '원화 매력도 상승은 환율 하락 압력을 만듭니다.',
        },
      ],
      labelFn: krwAttractivenessLabel,
    },
    {
      id: 'capital_flight_fx',
      label: '자본 유출 압력',
      description: '위험회피 심리가 확산되면 신흥국에서 자본이 빠져나간다. 자본 유출이 강할수록 환율 상승(원화 약세) 압력이 커진다.',
      targets: [
        {
          targetId: 'usdkrw_pressure',
          direction: 'positive',
          description: '자본 이탈 압력은 환율 상승 압력을 만듭니다.',
        },
      ],
      labelFn: capitalFlightLabel,
    },
  ],

  resultNodeIds: ['usdkrw_pressure'],

  edges: [
    // 1열 → 2열: 입력 → 개념
    {
      id: 'fxe01',
      source: 'us_rate',
      target: 'dollar_demand_fx',
      direction: 'positive',
      ruleIds: ['rfx01'],
      explanation: '미국 금리 상승은 달러 자산 수익률을 높여 달러 수요를 증가시킵니다.',
    },
    {
      id: 'fxe02',
      source: 'oil',
      target: 'dollar_demand_fx',
      direction: 'positive',
      ruleIds: ['rfx02'],
      explanation: '유가 상승은 수입 대금 결제를 위한 달러 수요를 늘립니다.',
    },
    {
      id: 'fxe03',
      source: 'risk',
      target: 'dollar_demand_fx',
      direction: 'positive',
      ruleIds: ['rfx03'],
      explanation: '위험회피 심리 확산은 안전통화인 달러에 대한 수요를 높입니다.',
    },
    {
      id: 'fxe04',
      source: 'kr_rate',
      target: 'krw_attractiveness_fx',
      direction: 'positive',
      ruleIds: ['rfx04'],
      explanation: '한국 금리 상승은 원화 자산의 보유 매력을 높입니다.',
    },
    {
      id: 'fxe05',
      source: 'kr_growth',
      target: 'krw_attractiveness_fx',
      direction: 'positive',
      ruleIds: ['rfx05'],
      explanation: '한국 경제성장률 상승은 원화 가치를 높이는 요인입니다.',
    },
    {
      id: 'fxe06',
      source: 'risk',
      target: 'capital_flight_fx',
      direction: 'positive',
      ruleIds: ['rfx06'],
      explanation: '위험회피 심리 확산은 신흥국에서 자본이 빠져나가는 압력을 높입니다.',
    },
    // 2열 → 3열: 개념 → 결과
    {
      id: 'fxe07',
      source: 'dollar_demand_fx',
      target: 'usdkrw_pressure',
      direction: 'positive',
      ruleIds: ['rfx07'],
      explanation: '달러 수요 증가는 환율 상승 압력을 만듭니다.',
    },
    {
      id: 'fxe08',
      source: 'krw_attractiveness_fx',
      target: 'usdkrw_pressure',
      direction: 'negative',
      ruleIds: ['rfx08'],
      explanation: '원화 매력도 상승은 환율 하락 압력을 만듭니다.',
    },
    {
      id: 'fxe09',
      source: 'capital_flight_fx',
      target: 'usdkrw_pressure',
      direction: 'positive',
      ruleIds: ['rfx09'],
      explanation: '자본 이탈 압력은 환율 상승 압력을 만듭니다.',
    },
  ],

  positions: {
    // 1열: 입력 (x=0)
    us_rate:   { x: 0, y: 0 },
    kr_rate:   { x: 0, y: 120 },
    kr_growth: { x: 0, y: 240 },
    oil:       { x: 0, y: 360 },
    risk:      { x: 0, y: 480 },
    // 2열: 중간 개념 (x=350)
    dollar_demand_fx:       { x: 350, y: 60 },
    krw_attractiveness_fx:  { x: 350, y: 240 },
    capital_flight_fx:      { x: 350, y: 420 },
    // 3열: 결과 (x=700)
    usdkrw_pressure: { x: 700, y: 240 },
  },

  entryNodeIds: ['usdkrw', 'usdkrw_pressure'],

  macroCollapsedEdges: [
    {
      id: 'mfx01',
      source: 'oil',
      target: 'usdkrw_pressure',
      direction: 'positive',
      lag: 'short',
      explanation: '유가 상승이 달러 수요를 통해 환율 상승 압력을 줍니다.',
    },
    {
      id: 'mfx02',
      source: 'risk',
      target: 'usdkrw_pressure',
      direction: 'positive',
      lag: 'immediate',
      explanation: '위험회피 심리가 달러 수요와 자본 이탈을 통해 환율 상승 압력을 줍니다.',
    },
    {
      id: 'mfx03',
      source: 'kr_growth',
      target: 'usdkrw_pressure',
      direction: 'negative',
      lag: 'short',
      explanation: '한국 경제성장이 원화 매력도를 통해 환율 하락 압력을 줍니다.',
    },
    {
      id: 'mfx04',
      source: 'kr_rate',
      target: 'usdkrw_pressure',
      direction: 'negative',
      lag: 'short',
      explanation: '한국 금리 상승이 원화 매력도를 통해 환율 하락 압력을 줍니다.',
    },
  ],
};

// ─── 편의 파생값 ────────────────────────────────────

export const fxConceptMap = Object.fromEntries(
  fxView.conceptNodes.map((c) => [c.id, c]),
);
