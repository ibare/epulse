import type { CausalRule } from '../types';

// 거시경제 규칙 (r02~r44)
export const macroRules: CausalRule[] = [
  // ──────────────────────────────────────────────
  // 물가 → 금리
  // ──────────────────────────────────────────────
  {
    id: 'r02',
    source: 'us_inflation',
    target: 'us_rate',
    weight: 0.5,
    direction: 'positive',
    lag: 'immediate',
    explanation: '미국 물가 상승은 연준의 금리 인상 기대를 높일 수 있습니다.',
  },

  // ──────────────────────────────────────────────
  // 성장률 → 금리/주식
  // ──────────────────────────────────────────────
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

  // ──────────────────────────────────────────────
  // 금리 → 채권/주식/환율
  // ──────────────────────────────────────────────
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

  // ──────────────────────────────────────────────
  // 달러/환율 → 한국 시장
  // ──────────────────────────────────────────────
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

  // ──────────────────────────────────────────────
  // 유가 → 전방위 영향
  // ──────────────────────────────────────────────
  {
    id: 'r18',
    source: 'oil',
    target: 'kr_inflation',
    weight: 0.4,
    direction: 'positive',
    lag: 'short',
    explanation: '유가 상승은 한국 물가 상승 압력을 높일 수 있습니다.',
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
    id: 'r23',
    source: 'oil',
    target: 'us_inflation',
    weight: 0.3,
    direction: 'positive',
    lag: 'short',
    explanation: '유가 상승은 미국 물가 상승 압력을 높일 수 있습니다.',
  },
  {
    id: 'r25',
    source: 'oil',
    target: 'kr_stock',
    weight: 0.2,
    direction: 'negative',
    lag: 'short',
    explanation: '유가 상승은 에너지 수입 비용 증가로 한국 주식시장에 부담이 될 수 있습니다.',
  },
  {
    id: 'r26',
    source: 'oil',
    target: 'us_stock',
    weight: 0.15,
    direction: 'negative',
    lag: 'short',
    explanation: '유가 상승은 기업 비용 부담을 높여 미국 주식시장에 압력을 줄 수 있습니다.',
  },
  {
    id: 'r27',
    source: 'oil',
    target: 'risk',
    weight: 0.2,
    direction: 'positive',
    lag: 'medium',
    explanation: '유가 급등은 경제 불확실성을 높여 위험회피 심리를 자극할 수 있습니다.',
  },

  // ──────────────────────────────────────────────
  // 위험회피 심리 → 글로벌 시장
  // ──────────────────────────────────────────────
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
    id: 'r28',
    source: 'risk',
    target: 'us_stock',
    weight: 0.25,
    direction: 'negative',
    lag: 'immediate',
    explanation: '위험회피 심리 확산은 미국 주식시장에도 부담을 줍니다.',
  },

  // ──────────────────────────────────────────────
  // 외국인 자금 → 주식
  // ──────────────────────────────────────────────
  {
    id: 'r22',
    source: 'foreign_flow',
    target: 'kr_stock',
    weight: 0.4,
    direction: 'positive',
    lag: 'short',
    explanation: '외국인 자금 유입은 한국 주식시장에 긍정적 영향을 줍니다.',
  },

  // ──────────────────────────────────────────────
  // 한국 금리(input) 직접 효과
  // ──────────────────────────────────────────────
  {
    id: 'r32',
    source: 'kr_rate',
    target: 'kr_bond',
    weight: 0.5,
    direction: 'negative',
    lag: 'immediate',
    explanation: '한국 금리 상승은 채권 가격 하락 압력으로 이어집니다.',
  },
  {
    id: 'r33',
    source: 'kr_rate',
    target: 'kr_stock',
    weight: 0.2,
    direction: 'negative',
    lag: 'short',
    explanation: '한국 금리 상승은 기업 자금 조달 비용을 높여 주식시장에 부담이 될 수 있습니다.',
  },
  {
    id: 'r34',
    source: 'kr_rate',
    target: 'usdkrw',
    weight: 0.25,
    direction: 'negative',
    lag: 'short',
    explanation: '한국 금리 인상은 원화 강세(환율 하락) 압력을 줄 수 있습니다.',
  },

  // ──────────────────────────────────────────────
  // 성장률 크로스
  // ──────────────────────────────────────────────
  {
    id: 'r35',
    source: 'us_growth',
    target: 'kr_stock',
    weight: 0.2,
    direction: 'positive',
    lag: 'short',
    explanation: '미국 경제 성장은 한국 수출 기업에 긍정적 영향을 줄 수 있습니다.',
  },
  {
    id: 'r36',
    source: 'kr_growth',
    target: 'usdkrw',
    weight: 0.2,
    direction: 'negative',
    lag: 'short',
    explanation: '한국 경제 성장은 원화 강세(환율 하락) 압력을 줄 수 있습니다.',
  },

  // ──────────────────────────────────────────────
  // 미국 금리 → 주식
  // ──────────────────────────────────────────────
  {
    id: 'r38',
    source: 'us_rate',
    target: 'us_stock',
    weight: 0.3,
    direction: 'negative',
    lag: 'short',
    explanation: '미국 금리 인상은 밸류에이션 부담으로 주식시장에 압력을 줄 수 있습니다.',
  },

  // ──────────────────────────────────────────────
  // 금리 → 물가 (긴축/완화 효과)
  // ──────────────────────────────────────────────
  {
    id: 'r39',
    source: 'kr_rate',
    target: 'kr_inflation',
    weight: 0.3,
    direction: 'negative',
    lag: 'medium',
    explanation: '한국 기준금리 인상은 수요 억제를 통해 물가 하락 압력을 줄 수 있습니다.',
  },
  {
    id: 'r40',
    source: 'us_rate',
    target: 'us_inflation',
    weight: 0.3,
    direction: 'negative',
    lag: 'medium',
    explanation: '미국 금리 인상은 수요 억제를 통해 물가 하락 압력을 줄 수 있습니다.',
  },

  // ──────────────────────────────────────────────
  // 금 (안전자산)
  // ──────────────────────────────────────────────
  {
    id: 'r41',
    source: 'kr_inflation',
    target: 'gold',
    weight: 0.35,
    direction: 'positive',
    lag: 'short',
    explanation: '물가 상승은 인플레이션 헤지 수요를 자극해 금에 상승 압력으로 작용할 수 있습니다.',
  },
  {
    id: 'r42',
    source: 'us_rate',
    target: 'gold',
    weight: 0.3,
    direction: 'negative',
    lag: 'immediate',
    explanation: '미국 금리 인상은 이자가 없는 금의 상대 매력을 낮춰 하락 압력이 될 수 있습니다.',
  },
  {
    id: 'r43',
    source: 'usd_strength',
    target: 'gold',
    weight: 0.4,
    direction: 'negative',
    lag: 'immediate',
    explanation: '달러 강세는 금 가격에 하락 압력으로 작용하는 경향이 있습니다.',
  },
  {
    id: 'r44',
    source: 'risk',
    target: 'gold',
    weight: 0.35,
    direction: 'positive',
    lag: 'immediate',
    explanation: '위험회피 심리가 확산되면 안전자산인 금에 대한 선호가 높아질 수 있습니다.',
  },
];
