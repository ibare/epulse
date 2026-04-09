import type { Scenario } from './types';

export const scenarios: Scenario[] = [
  {
    id: 'us_hike',
    label: '미국 금리 인상',
    description: '미국 금리 인상이 글로벌 시장에 미치는 영향',
    changes: { us_rate: 85, usdkrw: 72, risk: 45 },
  },
  {
    id: 'kr_inflation_surge',
    label: '한국 물가 급등',
    description: '한국 물가 급등이 금리와 시장에 미치는 영향',
    changes: { kr_inflation: 82, kr_rate: 70, oil: 65 },
  },
  {
    id: 'krw_weakness',
    label: '원화 급약세',
    description: '원화 약세가 한국 시장에 미치는 영향',
    changes: { usdkrw: 85, risk: 55, us_rate: 70 },
  },
  {
    id: 'oil_surge',
    label: '유가 급등',
    description: '유가 급등이 물가와 시장에 미치는 영향',
    changes: { oil: 88, kr_inflation: 68, risk: 50 },
  },
  {
    id: 'slowdown',
    label: '경기 둔화 우려',
    description: '글로벌 경기 둔화 시나리오',
    changes: { kr_growth: 25, us_growth: 30, risk: 65 },
  },
  {
    id: 'export_boom',
    label: '수출 호조',
    description: '한국 수출 호조 시나리오',
    changes: { kr_growth: 75, usdkrw: 58, us_growth: 65 },
  },
];

export const scenarioMap: Record<string, Scenario> = Object.fromEntries(
  scenarios.map((s) => [s.id, s]),
);
