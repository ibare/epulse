import { AppLayout } from '../components/layout/AppLayout';
import { ControlPanel } from '../components/controls/ControlPanel';
import { CausalMap } from '../components/map/CausalMap';
import { TimelinePanel } from '../components/panels/TimelinePanel';

export default function App() {
  return (
    <AppLayout
      left={<ControlPanel />}
      center={<CausalMap />}
      right={<TimelinePanel />}
    />
  );
}
