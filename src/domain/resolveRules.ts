import type { CausalRule } from './types';
import { rules, RULESET_VERSION } from './rules';
import { useRuleTuningStore } from '../store/ruleTuningStore';

export { RULESET_VERSION };

export function getResolvedRules(): CausalRule[] {
  const { overrides } = useRuleTuningStore.getState();
  if (Object.keys(overrides).length === 0) return rules;

  return rules.map((r) => {
    const override = overrides[r.id];
    if (!override) return r;
    return { ...r, weight: override.weight };
  });
}
