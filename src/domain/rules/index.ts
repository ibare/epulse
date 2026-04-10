import type { CausalRule } from '../types';
import { macroRules } from './macroRules';
import { conceptRules } from './conceptRules';

export { RULESET_VERSION } from './version';

export const rules: CausalRule[] = [...macroRules, ...conceptRules];

export const ruleMap: Record<string, CausalRule> = Object.fromEntries(
  rules.map((r) => [r.id, r]),
);
