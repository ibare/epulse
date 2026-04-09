import { create } from 'zustand';
import type { SimulationResult } from '../domain/types';
import { variables } from '../domain/nodes';
import { scenarios } from '../domain/scenarios';
import { runSimulation } from '../domain/simulation/engine';

interface SimulationState {
  inputValues: Record<string, number>;
  previousValues: Record<string, number>;
  result: SimulationResult;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  activeScenarioId: string | null;

  setInputValue: (variableId: string, value: number) => void;
  applyScenario: (scenarioId: string) => void;
  resetToBaseline: () => void;
  selectNode: (nodeId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
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

export const useSimulationStore = create<SimulationState>((set) => ({
  inputValues: { ...baselineValues },
  previousValues: { ...baselineValues },
  result: initialResult,
  selectedNodeId: null,
  hoveredNodeId: null,
  activeScenarioId: null,

  setInputValue: (variableId, value) =>
    set((state) => {
      const newValues = { ...state.inputValues, [variableId]: value };
      return {
        inputValues: newValues,
        result: runSimulation(newValues),
        activeScenarioId: null,
      };
    }),

  applyScenario: (scenarioId) =>
    set((state) => {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      if (!scenario) return state;

      const newValues = { ...baselineValues, ...scenario.changes };
      return {
        previousValues: { ...state.inputValues },
        inputValues: newValues,
        result: runSimulation(newValues),
        activeScenarioId: scenarioId,
      };
    }),

  resetToBaseline: () =>
    set((state) => ({
      previousValues: { ...state.inputValues },
      inputValues: { ...baselineValues },
      result: initialResult,
      activeScenarioId: null,
    })),

  selectNode: (nodeId) =>
    set({ selectedNodeId: nodeId }),

  hoverNode: (nodeId) =>
    set({ hoveredNodeId: nodeId }),
}));
