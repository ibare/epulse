import type { RealismWarning } from './types';

interface ContradictionRule {
  id: string;
  variables: [string, string];
  check: (values: Record<string, number>) => boolean;
  severity: 'warning' | 'critical';
  message: string;
}

const contradictionRules: ContradictionRule[] = [
  {
    id: 'c01',
    variables: ['kr_inflation', 'kr_rate'],
    check: (v) => v['kr_inflation'] >= 65 && v['kr_rate'] <= 40,
    severity: 'critical',
    message:
      '물가가 높은 상황에서 기준금리가 낮게 유지되는 것은 비현실적입니다. 중앙은행은 물가 안정을 위해 금리를 인상합니다.',
  },
  {
    id: 'c02',
    variables: ['us_inflation', 'us_rate'],
    check: (v) => v['us_inflation'] >= 65 && v['us_rate'] <= 45,
    severity: 'critical',
    message:
      '미국 물가가 높은 상황에서 연준이 금리를 낮게 유지하는 것은 통상적이지 않습니다.',
  },
  {
    id: 'c03',
    variables: ['kr_growth', 'kr_inflation'],
    check: (v) => v['kr_growth'] >= 70 && v['kr_inflation'] <= 35,
    severity: 'warning',
    message:
      '경기 과열 상태에서 물가가 낮게 유지되는 것은 드문 상황입니다. 높은 성장률은 수요를 자극해 물가 상승으로 이어지는 것이 일반적입니다.',
  },
  {
    id: 'c04',
    variables: ['oil', 'kr_inflation'],
    check: (v) => v['oil'] >= 70 && v['kr_inflation'] <= 40,
    severity: 'warning',
    message:
      '유가가 크게 오른 상황에서 한국 물가가 안정적인 것은 비현실적입니다. 유가는 수입물가를 통해 전반적 물가 상승을 유발합니다.',
  },
  {
    id: 'c05',
    variables: ['us_rate', 'usdkrw'],
    check: (v) => v['us_rate'] >= 75 && v['usdkrw'] <= 40,
    severity: 'critical',
    message:
      '미국 금리가 높은 상황에서 원화가 강세를 보이는 것은 통상적이지 않습니다. 높은 미국 금리는 달러 강세와 원화 약세를 유발합니다.',
  },
  {
    id: 'c06',
    variables: ['risk', 'usdkrw'],
    check: (v) => v['risk'] <= 20 && v['usdkrw'] >= 70,
    severity: 'warning',
    message:
      '위험회피 심리가 낮은 안정적 환경에서 원화가 약세를 보이는 것은 비일반적입니다.',
  },
];

// 모순 체크: 관련 변수가 모두 고정(pinned)인 경우에만 발동
export function checkContradictions(
  inputValues: Record<string, number>,
  pinnedInputs: Set<string>,
): RealismWarning[] {
  const warnings: RealismWarning[] = [];

  for (const rule of contradictionRules) {
    const [a, b] = rule.variables;
    if (!pinnedInputs.has(a) || !pinnedInputs.has(b)) continue;
    if (!rule.check(inputValues)) continue;

    warnings.push({
      id: rule.id,
      severity: rule.severity,
      message: rule.message,
    });
  }

  return warnings;
}
