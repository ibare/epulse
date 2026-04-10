/**
 * 미국 주식시장 상세 뷰 정의
 *
 * 개념 노드는 엔진 변수로 등록되어 conceptRules.ts의 rsu01~rsu10에서 계산된다.
 * 이 파일은 뷰의 노드 구성, 좌표, 특화 라벨, 합성 엣지를 정의한다.
 */

import type { DetailViewDef } from './types';

// ─── 특화 라벨 함수 ─────────────────────────────────

function earningsLabel(delta: number): string {
  if (delta >= 20) return '강한 이익 개선';
  if (delta >= 8) return '이익 개선';
  if (delta >= -7) return '중립';
  if (delta >= -19) return '이익 악화';
  return '강한 이익 악화';
}

function discountLabel(delta: number): string {
  if (delta >= 20) return '강한 부담';
  if (delta >= 8) return '부담';
  if (delta >= -7) return '중립';
  if (delta >= -19) return '부담 완화';
  return '강한 완화';
}

function sentimentLabel(delta: number): string {
  if (delta >= 20) return '강한 낙관';
  if (delta >= 8) return '낙관';
  if (delta >= -7) return '중립';
  if (delta >= -19) return '비관';
  return '강한 비관';
}

// ─── 미국 주식 뷰 정의 ─────────────────────────────

export const stockUsView: DetailViewDef = {
  id: 'stock-us',
  label: '미국 주식시장 상세',
  routePath: '/stock-us',

  inputNodeIds: ['us_growth', 'us_inflation', 'us_rate', 'oil', 'risk'],

  conceptNodes: [
    {
      id: 'earnings_outlook_us',
      label: '기업 실적 기대',
      description: '미국 경제성장률과 기업 비용 환경이 만드는 실적 전망. 성장이 높고 비용이 낮으면 실적 기대가 올라간다.',
      targets: [
        {
          targetId: 'us_stock',
          direction: 'positive',
          description: '실적 기대 개선은 주가 상승 압력을 만듭니다.',
        },
      ],
      labelFn: earningsLabel,
    },
    {
      id: 'discount_burden_us',
      label: '할인율 부담',
      description: '금리와 물가가 높으면 미래 기업 수익의 현재 가치가 줄어든다. 주가에 하락 압력으로 작용한다.',
      targets: [
        {
          targetId: 'us_stock',
          direction: 'negative',
          description: '할인율 부담은 주가 하락 압력을 만듭니다.',
        },
      ],
      labelFn: discountLabel,
    },
    {
      id: 'sentiment_us',
      label: '투자 심리',
      description: '위험회피 심리, 실적 기대, 할인율 부담이 종합되어 형성되는 시장 참여자들의 심리. 즉시 주가에 반영된다.',
      targets: [
        {
          targetId: 'us_stock',
          direction: 'positive',
          description: '투자 심리 개선은 즉시 주가에 반영됩니다.',
        },
      ],
      labelFn: sentimentLabel,
    },
  ],

  resultNodeIds: ['us_stock'],

  edges: [
    // 1열 → 2열: 입력 → 개념
    {
      id: 'sue01',
      source: 'us_growth',
      target: 'earnings_outlook_us',
      direction: 'positive',
      ruleIds: ['rsu01'],
      explanation: '미국 경제성장률 상승은 기업 실적 기대를 높입니다.',
    },
    {
      id: 'sue02',
      source: 'oil',
      target: 'earnings_outlook_us',
      direction: 'negative',
      ruleIds: ['rsu02'],
      explanation: '유가 상승은 기업 비용 부담을 높입니다.',
    },
    {
      id: 'sue03',
      source: 'us_rate',
      target: 'discount_burden_us',
      direction: 'positive',
      ruleIds: ['rsu03'],
      explanation: '미국 금리 인상은 할인율 부담을 키웁니다.',
    },
    {
      id: 'sue04',
      source: 'us_inflation',
      target: 'discount_burden_us',
      direction: 'positive',
      ruleIds: ['rsu04'],
      explanation: '물가 상승은 금리 인상 기대를 통해 할인율 부담을 높입니다.',
    },
    {
      id: 'sue05',
      source: 'risk',
      target: 'sentiment_us',
      direction: 'negative',
      ruleIds: ['rsu05'],
      explanation: '위험회피 심리 확산은 투자 심리를 위축시킵니다.',
    },
    // 2열 → 2열: 개념 → 개념
    {
      id: 'sue06',
      source: 'earnings_outlook_us',
      target: 'sentiment_us',
      direction: 'positive',
      ruleIds: ['rsu06'],
      explanation: '실적 기대 개선은 투자 심리를 높입니다.',
    },
    {
      id: 'sue07',
      source: 'discount_burden_us',
      target: 'sentiment_us',
      direction: 'negative',
      ruleIds: ['rsu07'],
      explanation: '할인율 부담은 투자 심리를 위축시킵니다.',
    },
    // 2열 → 3열: 개념 → 결과
    {
      id: 'sue08',
      source: 'earnings_outlook_us',
      target: 'us_stock',
      direction: 'positive',
      ruleIds: ['rsu08'],
      explanation: '기업 실적 기대 개선은 주가 상승 압력을 만듭니다.',
    },
    {
      id: 'sue09',
      source: 'discount_burden_us',
      target: 'us_stock',
      direction: 'negative',
      ruleIds: ['rsu09'],
      explanation: '할인율 부담은 주가 하락 압력을 만듭니다.',
    },
    {
      id: 'sue10',
      source: 'sentiment_us',
      target: 'us_stock',
      direction: 'positive',
      ruleIds: ['rsu10'],
      explanation: '투자 심리 개선은 즉시 주가에 반영됩니다.',
    },
  ],

  positions: {
    // 1열: 입력 (x=0)
    us_growth:    { x: 0, y: 0 },
    us_inflation: { x: 0, y: 120 },
    us_rate:      { x: 0, y: 240 },
    oil:          { x: 0, y: 360 },
    risk:         { x: 0, y: 480 },
    // 2열: 중간 개념 (x=350)
    earnings_outlook_us: { x: 350, y: 60 },
    discount_burden_us:  { x: 350, y: 240 },
    sentiment_us:        { x: 350, y: 420 },
    // 3열: 결과 (x=700)
    us_stock: { x: 700, y: 240 },
  },

  entryNodeIds: ['us_stock'],

  macroCollapsedEdges: [
    {
      id: 'msu01',
      source: 'us_inflation',
      target: 'us_stock',
      direction: 'negative',
      lag: 'medium',
      explanation: '물가 상승이 할인율 부담을 통해 주가에 하락 압력을 줍니다.',
    },
  ],
};

// ─── 편의 파생값 ────────────────────────────────────

export const stockUsConceptMap = Object.fromEntries(
  stockUsView.conceptNodes.map((c) => [c.id, c]),
);
