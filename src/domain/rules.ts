import type { CausalRule } from './types';

export const rules: CausalRule[] = [
  // 물가 → 금리
  {
    id: 'r01',
    source: 'kr_inflation',
    target: 'kr_rate_pressure',
    weight: 0.6,
    direction: 'positive',
    lag: 'immediate',
    explanation: '한국 물가 상승은 한국 금리 인상 압력으로 이어질 수 있습니다.',
  },
  {
    id: 'r02',
    source: 'us_inflation',
    target: 'us_rate',
    weight: 0.5,
    direction: 'positive',
    lag: 'immediate',
    explanation: '미국 물가 상승은 연준의 금리 인상 기대를 높일 수 있습니다.',
    // 표시 전용: us_rate는 input이므로 엔진에서 값 변경 없음
  },
  {
    id: 'r03',
    source: 'eu_inflation',
    target: 'eu_rate',
    weight: 0.5,
    direction: 'positive',
    lag: 'immediate',
    explanation: 'EU 물가 상승은 ECB의 금리 인상 기대를 높일 수 있습니다.',
    // 표시 전용: eu_rate는 input이므로 엔진에서 값 변경 없음
  },

  // 성장률 → 금리/주식
  {
    id: 'r04',
    source: 'kr_growth',
    target: 'kr_rate_pressure',
    weight: 0.3,
    direction: 'positive',
    lag: 'short',
    explanation: '한국 경제성장률 상승은 금리 인상 압력을 높일 수 있습니다.',
  },
  {
    id: 'r05',
    source: 'kr_growth',
    target: 'kr_stock',
    weight: 0.5,
    direction: 'positive',
    lag: 'short',
    explanation: '한국 경제성장률 상승은 주식시장에 긍정적 영향을 줄 수 있습니다.',
    exceptions: [
      {
        conditions: [{ variable: 'kr_inflation', operator: 'gt', threshold: 20 }],
        text: '성장이 과도한 물가 상승과 동반되면 주식 긍정 효과가 제한될 수 있습니다.',
      },
    ],
  },
  {
    id: 'r06',
    source: 'us_growth',
    target: 'us_stock',
    weight: 0.5,
    direction: 'positive',
    lag: 'short',
    explanation: '미국 성장률 상승은 미국 주식시장에 긍정적 영향을 줄 수 있습니다.',
  },
  {
    id: 'r07',
    source: 'eu_growth',
    target: 'eu_stock',
    weight: 0.5,
    direction: 'positive',
    lag: 'short',
    explanation: 'EU 성장률 상승은 EU 주식시장에 긍정적 영향을 줄 수 있습니다.',
  },

  // 금리 → 채권/주식/환율
  {
    id: 'r08',
    source: 'kr_rate_pressure',
    target: 'kr_bond',
    weight: 0.8,
    direction: 'negative',
    lag: 'immediate',
    explanation: '한국 금리 인상 압력은 채권 가격 하락 압력으로 이어집니다.',
  },
  {
    id: 'r09',
    source: 'kr_rate_pressure',
    target: 'kr_stock',
    weight: 0.3,
    direction: 'negative',
    lag: 'short',
    explanation: '한국 금리 인상 압력은 주식시장에 부담을 줄 수 있습니다.',
    exceptions: [
      {
        conditions: [{ variable: 'kr_growth', operator: 'gt', threshold: 15 }],
        text: '성장률이 견조한 상태에서의 금리 인상은 주식시장 부담이 제한적일 수 있습니다.',
      },
    ],
  },
  {
    id: 'r10',
    source: 'us_rate',
    target: 'usd_strength',
    weight: 0.7,
    direction: 'positive',
    lag: 'immediate',
    explanation: '미국 금리 인상은 달러 강세 압력을 높입니다.',
  },
  {
    id: 'r11',
    source: 'us_rate',
    target: 'us_bond',
    weight: 0.8,
    direction: 'negative',
    lag: 'immediate',
    explanation: '미국 금리 인상은 미국 채권 가격 하락 압력으로 이어집니다.',
  },
  {
    id: 'r12',
    source: 'eu_rate',
    target: 'eu_bond',
    weight: 0.8,
    direction: 'negative',
    lag: 'immediate',
    explanation: 'EU 금리 인상은 EU 채권 가격 하락 압력으로 이어집니다.',
  },

  // 달러/환율 → 한국 시장
  {
    id: 'r13',
    source: 'usd_strength',
    target: 'usdkrw_pressure',
    weight: 0.6,
    direction: 'positive',
    lag: 'immediate',
    explanation: '달러 강세는 원/달러 환율 상승 압력으로 이어집니다.',
  },
  {
    id: 'r14',
    source: 'usdkrw',
    target: 'usdkrw_pressure',
    weight: 0.5,
    direction: 'positive',
    lag: 'immediate',
    explanation: '원/달러 환율 상승은 환율 압력을 높입니다.',
  },
  {
    id: 'r15',
    source: 'usdkrw_pressure',
    target: 'foreign_flow',
    weight: 0.7,
    direction: 'negative',
    lag: 'short',
    explanation: '원화 약세 압력은 외국인 자금 유출을 유발할 수 있습니다.',
  },
  {
    id: 'r16',
    source: 'usdkrw_pressure',
    target: 'kr_stock',
    weight: 0.3,
    direction: 'negative',
    lag: 'short',
    explanation: '원화 약세 압력은 한국 주식시장에 부담을 줄 수 있습니다.',
    exceptions: [
      {
        conditions: [{ variable: 'kr_growth', operator: 'gt', threshold: 10 }],
        text: '원화 약세에도 불구하고 수출주 일부에는 우호적 환경이 형성될 수 있습니다.',
      },
    ],
  },
  {
    id: 'r17',
    source: 'usdkrw_pressure',
    target: 'kr_commodity',
    weight: 0.3,
    direction: 'positive',
    lag: 'medium',
    explanation: '원화 약세는 수입 원자재 비용 부담을 증가시킵니다.',
  },

  // 유가/리스크 → 시장
  {
    id: 'r18',
    source: 'oil',
    target: 'kr_inflation',
    weight: 0.4,
    direction: 'positive',
    lag: 'short',
    explanation: '유가 상승은 한국 물가 상승 압력을 높일 수 있습니다.',
    // 표시 전용: kr_inflation은 input이므로 엔진에서 값 변경 없음
  },
  {
    id: 'r19',
    source: 'oil',
    target: 'kr_commodity',
    weight: 0.7,
    direction: 'positive',
    lag: 'immediate',
    explanation: '유가 상승은 한국 현물 비용 부담을 직접적으로 증가시킵니다.',
    exceptions: [
      {
        conditions: [{ variable: 'usdkrw_pressure', operator: 'lt', threshold: -5 }],
        text: '원화 강세가 동반되면 유가 상승의 수입물가 부담이 일부 상쇄될 수 있습니다.',
      },
    ],
  },
  {
    id: 'r20',
    source: 'risk',
    target: 'foreign_flow',
    weight: 0.5,
    direction: 'negative',
    lag: 'immediate',
    explanation: '위험회피 심리 확산은 외국인 자금 유출을 유발합니다.',
  },
  {
    id: 'r21',
    source: 'risk',
    target: 'kr_stock',
    weight: 0.3,
    direction: 'negative',
    lag: 'immediate',
    explanation: '위험회피 심리 확산은 한국 주식시장에 부담을 줍니다.',
    exceptions: [
      {
        conditions: [
          { variable: 'kr_growth', operator: 'gt', threshold: 10 },
          { variable: 'us_growth', operator: 'gt', threshold: 5 },
        ],
        text: '글로벌 성장이 동반되면 위험회피 심리의 주식 부담이 완화될 수 있습니다.',
      },
    ],
  },
  {
    id: 'r22',
    source: 'foreign_flow',
    target: 'kr_stock',
    weight: 0.4,
    direction: 'positive',
    lag: 'short',
    explanation: '외국인 자금 유입은 한국 주식시장에 긍정적 영향을 줍니다.',
  },
];

export const ruleMap: Record<string, CausalRule> = Object.fromEntries(
  rules.map((r) => [r.id, r]),
);
