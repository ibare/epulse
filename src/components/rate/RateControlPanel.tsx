/**
 * 금리 뷰 좌측 패널
 *
 * 5개 입력 슬라이더 + 뒤로가기 + 안내 텍스트
 */

import { useNavigate } from 'react-router-dom';
import { useSimulationStore } from '../../store/simulationStore';
import { variableMap } from '../../domain/nodes';
import { rateView } from '../../domain/views/rateView';
import { SliderInput } from '../controls/SliderInput';

export function RateControlPanel() {
  const navigate = useNavigate();
  const inputValues = useSimulationStore((s) => s.inputValues);
  const pinnedInputs = useSimulationStore((s) => s.pinnedInputs);
  const nodeStates = useSimulationStore((s) => s.result.nodeStates);
  const realismWarnings = useSimulationStore((s) => s.realismWarnings);
  const setInputValue = useSimulationStore((s) => s.setInputValue);
  const unpinInput = useSimulationStore((s) => s.unpinInput);

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-2 text-sm">
      {/* 뒤로가기 */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
      >
        <span>←</span>
        <span>거시 화면으로</span>
      </button>

      {/* 안내 */}
      <div className="rounded-lg border border-slate-700/30 px-3 py-2" style={{ backgroundColor: 'rgba(30,41,59,0.4)' }}>
        <p className="text-[11px] leading-relaxed text-slate-400">
          금리에 영향을 주는 변수를 조절하며 기준금리와 시장금리가 어떻게 결정되는지 살펴보세요.
        </p>
      </div>

      <div className="border-t border-white/[0.06]" />

      {/* 입력 슬라이더 */}
      <section className="flex flex-col gap-1.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          입력 변수
        </h3>
        <div className="flex flex-col gap-2.5">
          {rateView.inputNodeIds.map((id) => {
            const v = variableMap[id];
            if (!v) return null;

            const warningsForVar = realismWarnings.filter(
              (w) => w.variables[1] === id,
            );

            return (
              <SliderInput
                key={id}
                variableId={id}
                label={v.label}
                region={v.region}
                value={inputValues[id] ?? v.baseline}
                baseline={v.baseline}
                effectiveDelta={nodeStates[id]?.delta}
                isPinned={pinnedInputs.has(id)}
                onUnpin={() => unpinInput(id)}
                onChange={(val) => setInputValue(id, val)}
                warnings={warningsForVar.length > 0 ? warningsForVar : undefined}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
