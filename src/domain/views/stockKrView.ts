/**
 * 한국 주식시장 상세 뷰 정의
 *
 * 개념 노드는 엔진 변수로 등록되어 conceptRules.ts의 rsk01~rsk13에서 계산된다.
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

function foreignLabel(delta: number): string {
  if (delta >= 20) return '강한 유입';
  if (delta >= 8) return '유입';
  if (delta >= -7) return '중립';
  if (delta >= -19) return '유출';
  return '강한 유출';
}

function sentimentLabel(delta: number): string {
  if (delta >= 20) return '강한 낙관';
  if (delta >= 8) return '낙관';
  if (delta >= -7) return '중립';
  if (delta >= -19) return '비관';
  return '강한 비관';
}

// ─── 한국 주식 뷰 정의 ─────────────────────────────

export const stockKrView: DetailViewDef = {
  id: 'stock-kr',
  label: '한국 주식시장 상세',
  routePath: '/stock-kr',

  inputNodeIds: ['kr_growth', 'kr_inflation', 'kr_rate', 'usdkrw', 'us_rate', 'oil'],

  conceptNodes: [
    {
      id: 'earnings_outlook_kr',
      label: '기업 실적 기대',
      description: '경제성장률과 기업 비용 환경이 만드는 실적 전망. 성장이 높고 비용이 낮으면 실적 기대가 올라간다.',
      targets: [
        {
          targetId: 'kr_stock',
          direction: 'positive',
          description: '실적 기대 개선은 주가 상승 압력을 만듭니다.',
        },
      ],
      labelFn: earningsLabel,
    },
    {
      id: 'discount_burden_kr',
      label: '할인율 부담',
      description: '금리와 물가가 높으면 미래 기업 수익의 현재 가치가 줄어든다. 주가에 하락 압력으로 작용한다.',
      targets: [
        {
          targetId: 'kr_stock',
          direction: 'negative',
          description: '할인율 부담은 주가 하락 압력을 만듭니다.',
        },
      ],
      labelFn: discountLabel,
    },
    {
      id: 'foreign_demand_kr',
      label: '외국인 수급',
      description: '환율과 미국 금리가 외국인 투자자의 한국 시장 참여에 영향을 준다. 원화 약세나 미국 금리 상승 시 자금 이탈 압력이 커진다.',
      targets: [
        {
          targetId: 'kr_stock',
          direction: 'positive',
          description: '외국인 수급 개선은 주가에 긍정적입니다.',
        },
      ],
      labelFn: foreignLabel,
    },
    {
      id: 'sentiment_kr',
      label: '투자 심리',
      description: '실적 기대, 외국인 수급, 할인율 부담이 종합되어 형성되는 시장 참여자들의 심리. 즉시 주가에 반영된다.',
      targets: [
        {
          targetId: 'kr_stock',
          direction: 'positive',
          description: '투자 심리 개선은 즉시 주가에 반영됩니다.',
        },
      ],
      labelFn: sentimentLabel,
    },
  ],

  resultNodeIds: ['kr_stock'],

  edges: [
    // 1열 → 2열: 입력 → 개념
    {
      id: 'ske01',
      source: 'kr_growth',
      target: 'earnings_outlook_kr',
      direction: 'positive',
      ruleIds: ['rsk01'],
      explanation: '경제성장률 상승은 기업 실적 기대를 높입니다.',
    },
    {
      id: 'ske02',
      source: 'oil',
      target: 'earnings_outlook_kr',
      direction: 'negative',
      ruleIds: ['rsk02'],
      explanation: '유가 상승은 기업 비용 부담을 높여 실적 기대를 낮춥니다.',
    },
    {
      id: 'ske03',
      source: 'kr_rate',
      target: 'discount_burden_kr',
      direction: 'positive',
      ruleIds: ['rsk03'],
      explanation: '기준금리 상승은 할인율 부담을 키웁니다.',
    },
    {
      id: 'ske04',
      source: 'kr_inflation',
      target: 'discount_burden_kr',
      direction: 'positive',
      ruleIds: ['rsk04'],
      explanation: '물가 상승은 금리 인상 기대를 통해 할인율 부담을 높입니다.',
    },
    {
      id: 'ske05',
      source: 'usdkrw',
      target: 'foreign_demand_kr',
      direction: 'negative',
      ruleIds: ['rsk05'],
      explanation: '원화 약세는 외국인 투자자의 이탈 압력을 높입니다.',
    },
    {
      id: 'ske06',
      source: 'us_rate',
      target: 'foreign_demand_kr',
      direction: 'negative',
      ruleIds: ['rsk06'],
      explanation: '미국 금리 인상은 외국인 자금을 미국으로 끌어갑니다.',
    },
    // 2열 → 2열: 개념 → 개념
    {
      id: 'ske07',
      source: 'earnings_outlook_kr',
      target: 'sentiment_kr',
      direction: 'positive',
      ruleIds: ['rsk07'],
      explanation: '실적 기대 개선은 투자 심리를 높입니다.',
    },
    {
      id: 'ske08',
      source: 'foreign_demand_kr',
      target: 'sentiment_kr',
      direction: 'positive',
      ruleIds: ['rsk08'],
      explanation: '외국인 매수는 투자 심리를 개선합니다.',
    },
    {
      id: 'ske09',
      source: 'discount_burden_kr',
      target: 'sentiment_kr',
      direction: 'negative',
      ruleIds: ['rsk09'],
      explanation: '할인율 부담은 투자 심리를 위축시킵니다.',
    },
    // 2열 → 3열: 개념 → 결과
    {
      id: 'ske10',
      source: 'earnings_outlook_kr',
      target: 'kr_stock',
      direction: 'positive',
      ruleIds: ['rsk10'],
      explanation: '기업 실적 기대 개선은 주가 상승 압력을 만듭니다.',
    },
    {
      id: 'ske11',
      source: 'discount_burden_kr',
      target: 'kr_stock',
      direction: 'negative',
      ruleIds: ['rsk11'],
      explanation: '할인율 부담은 주가 하락 압력을 만듭니다.',
    },
    {
      id: 'ske12',
      source: 'foreign_demand_kr',
      target: 'kr_stock',
      direction: 'positive',
      ruleIds: ['rsk12'],
      explanation: '외국인 수급 개선은 주가에 긍정적입니다.',
    },
    {
      id: 'ske13',
      source: 'sentiment_kr',
      target: 'kr_stock',
      direction: 'positive',
      ruleIds: ['rsk13'],
      explanation: '투자 심리 개선은 즉시 주가에 반영됩니다.',
    },
  ],

  positions: {
    // 1열: 입력 (x=0)
    kr_growth:    { x: 0, y: 0 },
    kr_inflation: { x: 0, y: 100 },
    kr_rate:      { x: 0, y: 200 },
    usdkrw:       { x: 0, y: 300 },
    us_rate:      { x: 0, y: 400 },
    oil:          { x: 0, y: 500 },
    // 2열: 중간 개념 (x=350)
    earnings_outlook_kr: { x: 350, y: 50 },
    discount_burden_kr:  { x: 350, y: 175 },
    foreign_demand_kr:   { x: 350, y: 325 },
    sentiment_kr:        { x: 350, y: 475 },
    // 3열: 결과 (x=700)
    kr_stock: { x: 700, y: 250 },
  },

  entryNodeIds: ['kr_stock'],

  macroCollapsedEdges: [
    {
      id: 'msk01',
      source: 'kr_inflation',
      target: 'kr_stock',
      direction: 'negative',
      lag: 'medium',
      explanation: '물가 상승이 할인율 부담을 통해 주가에 하락 압력을 줍니다.',
    },
    {
      id: 'msk02',
      source: 'us_rate',
      target: 'kr_stock',
      direction: 'negative',
      lag: 'short',
      explanation: '미국 금리 인상이 외국인 자금 이탈을 통해 주가에 부담을 줍니다.',
    },
  ],
};

// ─── 편의 파생값 ────────────────────────────────────

export const stockKrConceptMap = Object.fromEntries(
  stockKrView.conceptNodes.map((c) => [c.id, c]),
);
