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

export type ColorScheme = 'international' | 'korean';

const inputVariables = variables.filter((v) => v.type === 'input');

interface SimulationState {
  inputValues: Record<string, number>;
  previousValues: Record<string, number>;
  pinnedInputs: Set<string>;
  realismWarnings: RealismWarning[];
  result: SimulationResult;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  activeScenarioId: string | null;
  colorScheme: ColorScheme;

  setInputValue: (variableId: string, value: number) => void;
  unpinInput: (variableId: string) => void;
  applyScenario: (scenarioId: string) => void;
  resetToBaseline: () => void;
  selectNode: (nodeId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
  toggleColorScheme: () => void;
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

// 소프트 커플링 시뮬레이션 실행 헬퍼
// 고정 input은 사용자 값, 비고정 input은 baseline → 전파 → 비고정 슬라이더 자동 조정
function computeWithPins(
  pinnedInputs: Set<string>,
  pinnedValues: Record<string, number>,
): {
  inputValues: Record<string, number>;
  result: SimulationResult;
  realismWarnings: RealismWarning[];
} {
  // 시뮬레이션 입력: 고정=사용자값, 비고정=baseline
  const simInputs: Record<string, number> = {};
  for (const v of inputVariables) {
    simInputs[v.id] = pinnedInputs.has(v.id)
      ? (pinnedValues[v.id] ?? v.baseline)
      : v.baseline;
  }

  // 모순 체크 (고정 입력값 기준)
  const warnings = checkContradictions(simInputs, pinnedInputs);

  // 고정 input을 target으로 삼는 규칙 제외하고 시뮬레이션
  const result = runSimulationWithPins(simInputs, pinnedInputs, warnings);

  // 비고정 input의 표시값: baseline + 규칙에 의한 delta
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

  // 비고정 input의 nodeState.value도 표시값으로 보정
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
  selectedNodeId: null,
  hoveredNodeId: null,
  activeScenarioId: null,
  colorScheme: (localStorage.getItem('epulse_color_scheme') as ColorScheme) ?? 'international',

  setInputValue: (variableId, value) =>
    set((state) => {
      const newPinned = new Set(state.pinnedInputs);
      newPinned.add(variableId);

      // 고정 입력값 모음: 기존 고정 + 새로 변경된 값
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

      // 나머지 고정값 유지
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

      // 시나리오가 변경하는 input만 고정
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
      result: initialResult,
      realismWarnings: [],
      activeScenarioId: null,
    })),

  selectNode: (nodeId) =>
    set({ selectedNodeId: nodeId }),

  hoverNode: (nodeId) =>
    set({ hoveredNodeId: nodeId }),

  toggleColorScheme: () =>
    set((state) => {
      const next = state.colorScheme === 'international' ? 'korean' : 'international';
      localStorage.setItem('epulse_color_scheme', next);
      return { colorScheme: next };
    }),
}));
