import { create } from 'zustand';
import type { SimulationResult, RealismWarning } from '../domain/types';
import { variables } from '../domain/nodes';
import { scenarios } from '../domain/scenarios';
import {
  runSimulation,
  runSimulationWithPins,
  checkContradictions,
} from '../domain/simulation/engine';
import { clamp } from '../utils/clamp';
import { useRuleTuningStore } from './ruleTuningStore';

const inputVariables = variables.filter((v) => v.type === 'input');

interface SimulationState {
  inputValues: Record<string, number>;
  previousValues: Record<string, number>;
  pinnedInputs: Set<string>;
  realismWarnings: RealismWarning[];
  result: SimulationResult;
  activeScenarioId: string | null;

  setInputValue: (variableId: string, value: number) => void;
  unpinInput: (variableId: string) => void;
  applyScenario: (scenarioId: string) => void;
  resetToBaseline: () => void;
  recompute: () => void;
}

function getBaselineValues(): Record<string, number> {
  const values: Record<string, number> = {};
  for (const v of variables) {
    if (v.type === 'input') {
      values[v.id] = v.baseline;
    }
  }
  return values;
}

const baselineValues = getBaselineValues();
const initialResult = runSimulation(baselineValues);

function getOverrides() {
  return useRuleTuningStore.getState().overrides;
}

function computeWithPins(
  pinnedInputs: Set<string>,
  pinnedValues: Record<string, number>,
): {
  inputValues: Record<string, number>;
  result: SimulationResult;
  realismWarnings: RealismWarning[];
} {
  const simInputs: Record<string, number> = {};
  for (const v of inputVariables) {
    simInputs[v.id] = pinnedInputs.has(v.id)
      ? (pinnedValues[v.id] ?? v.baseline)
      : v.baseline;
  }

  const warnings = checkContradictions(simInputs, pinnedInputs);
  const result = runSimulationWithPins(simInputs, pinnedInputs, warnings, getOverrides());

  const finalInputValues: Record<string, number> = {};
  for (const v of inputVariables) {
    if (pinnedInputs.has(v.id)) {
      finalInputValues[v.id] = simInputs[v.id];
    } else {
      const delta = result.nodeStates[v.id]?.delta ?? 0;
      finalInputValues[v.id] = clamp(
        Math.round(v.baseline + delta),
        0,
        100,
      );
    }
  }

  for (const v of inputVariables) {
    if (!pinnedInputs.has(v.id) && result.nodeStates[v.id]) {
      result.nodeStates[v.id].value = finalInputValues[v.id];
    }
  }

  return { inputValues: finalInputValues, result, realismWarnings: warnings };
}

export const useSimulationStore = create<SimulationState>((set) => ({
  inputValues: { ...baselineValues },
  previousValues: { ...baselineValues },
  pinnedInputs: new Set<string>(),
  realismWarnings: [],
  result: initialResult,
  activeScenarioId: null,

  setInputValue: (variableId, value) =>
    set((state) => {
      const newPinned = new Set(state.pinnedInputs);
      newPinned.add(variableId);

      const pinnedValues: Record<string, number> = {};
      for (const v of inputVariables) {
        if (v.id === variableId) {
          pinnedValues[v.id] = value;
        } else if (newPinned.has(v.id)) {
          pinnedValues[v.id] = state.inputValues[v.id];
        }
      }

      const computed = computeWithPins(newPinned, pinnedValues);

      return {
        pinnedInputs: newPinned,
        inputValues: computed.inputValues,
        result: computed.result,
        realismWarnings: computed.realismWarnings,
        activeScenarioId: null,
      };
    }),

  unpinInput: (variableId) =>
    set((state) => {
      const newPinned = new Set(state.pinnedInputs);
      newPinned.delete(variableId);

      const pinnedValues: Record<string, number> = {};
      for (const v of inputVariables) {
        if (newPinned.has(v.id)) {
          pinnedValues[v.id] = state.inputValues[v.id];
        }
      }

      const computed = computeWithPins(newPinned, pinnedValues);

      return {
        pinnedInputs: newPinned,
        inputValues: computed.inputValues,
        result: computed.result,
        realismWarnings: computed.realismWarnings,
      };
    }),

  applyScenario: (scenarioId) =>
    set((state) => {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      if (!scenario) return state;

      const newPinned = new Set(Object.keys(scenario.changes));

      const pinnedValues: Record<string, number> = {};
      for (const key of Object.keys(scenario.changes)) {
        pinnedValues[key] = scenario.changes[key];
      }

      const computed = computeWithPins(newPinned, pinnedValues);

      return {
        previousValues: { ...state.inputValues },
        pinnedInputs: newPinned,
        inputValues: computed.inputValues,
        result: computed.result,
        realismWarnings: computed.realismWarnings,
        activeScenarioId: scenarioId,
      };
    }),

  resetToBaseline: () =>
    set((state) => ({
      previousValues: { ...state.inputValues },
      pinnedInputs: new Set<string>(),
      inputValues: { ...baselineValues },
      result: runSimulation(baselineValues, getOverrides()),
      realismWarnings: [],
      activeScenarioId: null,
    })),

  recompute: () =>
    set((state) => {
      if (state.pinnedInputs.size === 0) {
        return { result: runSimulation(state.inputValues, getOverrides()) };
      }
      const pinnedValues: Record<string, number> = {};
      for (const v of inputVariables) {
        if (state.pinnedInputs.has(v.id)) {
          pinnedValues[v.id] = state.inputValues[v.id];
        }
      }
      const computed = computeWithPins(state.pinnedInputs, pinnedValues);
      return {
        inputValues: computed.inputValues,
        result: computed.result,
        realismWarnings: computed.realismWarnings,
      };
    }),
}));
