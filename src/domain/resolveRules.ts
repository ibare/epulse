import type { CausalRule } from './types';
import { rules, RULESET_VERSION } from './rules';

export { RULESET_VERSION };

export function getResolvedRules(
  overrides: Record<string, { weight: number }> = {},
): CausalRule[] {
  if (Object.keys(overrides).length === 0) return rules;

  return rules.map((r) => {
    const override = overrides[r.id];
    if (!override) return r;
    return { ...r, weight: override.weight };
  });
}
