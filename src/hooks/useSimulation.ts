import { useSimulationStore } from '../store/simulationStore';

export function useSimulation() {
  const result = useSimulationStore((s) => s.result);
  const inputValues = useSimulationStore((s) => s.inputValues);
  const setInputValue = useSimulationStore((s) => s.setInputValue);
  const applyScenario = useSimulationStore((s) => s.applyScenario);
  const resetToBaseline = useSimulationStore((s) => s.resetToBaseline);
  const activeScenarioId = useSimulationStore((s) => s.activeScenarioId);

  return {
    result,
    inputValues,
    setInputValue,
    applyScenario,
    resetToBaseline,
    activeScenarioId,
  };
}
