import { useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { ControlPanel } from '../components/controls/ControlPanel';
import { CausalMap } from '../components/map/CausalMap';
import { TimelinePanel } from '../components/panels/TimelinePanel';
import { useRuleTuningStore } from '../store/ruleTuningStore';
import { useSimulationStore } from '../store/simulationStore';

export default function App() {
  // 룰 오버라이드 변경 시 시뮬레이션 즉시 재계산
  useEffect(() => {
    return useRuleTuningStore.subscribe(() => {
      useSimulationStore.getState().recompute();
    });
  }, []);

  return (
    <AppLayout
      left={<ControlPanel />}
      center={<CausalMap />}
      right={<TimelinePanel />}
    />
  );
}
