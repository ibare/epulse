import { create } from 'zustand';
import { RULESET_VERSION } from '../domain/rules';

const STORAGE_KEY = 'epulse.ruleset.tuning';

interface RuleOverride {
  weight: number;
}

interface PersistedData {
  version: string;
  updatedAt: string;
  rules: Record<string, RuleOverride>;
}

interface RuleTuningState {
  overrides: Record<string, RuleOverride>;
  setWeight: (ruleId: string, weight: number) => void;
  resetRule: (ruleId: string) => void;
  resetAll: () => void;
}

function loadFromStorage(): Record<string, RuleOverride> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data: PersistedData = JSON.parse(raw);
    if (data.version !== RULESET_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return {};
    }
    return data.rules;
  } catch (error) {
    console.warn('[epulse] localStorage 읽기 실패:', error);
    return {};
  }
}

function saveToStorage(overrides: Record<string, RuleOverride>): void {
  try {
    const data: PersistedData = {
      version: RULESET_VERSION,
      updatedAt: new Date().toISOString(),
      rules: overrides,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('[epulse] localStorage 저장 실패:', error);
  }
}

export const useRuleTuningStore = create<RuleTuningState>((set) => ({
  overrides: loadFromStorage(),

  setWeight: (ruleId, weight) =>
    set((state) => {
      const next = { ...state.overrides, [ruleId]: { weight } };
      saveToStorage(next);
      return { overrides: next };
    }),

  resetRule: (ruleId) =>
    set((state) => {
      const { [ruleId]: _, ...rest } = state.overrides;
      saveToStorage(rest);
      return { overrides: rest };
    }),

  resetAll: () => {
    localStorage.removeItem(STORAGE_KEY);
    return set({ overrides: {} });
  },
}));
