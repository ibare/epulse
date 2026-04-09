import { useSimulationStore } from '../../store/simulationStore';
import { variables, variableMap } from '../../domain/nodes';
import { scenarios } from '../../domain/scenarios';
import { regionColors } from '../../styles/tokens';
import { SliderInput } from './SliderInput';
import { PresetButton } from './PresetButton';
import type { Region } from '../../domain/types';

// 국가별 슬라이더 그룹 정의
const groups: { region: Region; label: string; ids: string[] }[] = [
  { region: 'KR', label: '한국', ids: ['kr_growth', 'kr_inflation', 'kr_rate', 'usdkrw'] },
  { region: 'US', label: '미국', ids: ['us_growth', 'us_inflation', 'us_rate'] },
  { region: 'GL', label: '글로벌', ids: ['oil', 'risk'] },
];

// input 변수만 필터링
const inputVariableIds = new Set(
  variables.filter((v) => v.type === 'input').map((v) => v.id),
);

export function ControlPanel() {
  const inputValues = useSimulationStore((s) => s.inputValues);
  const activeScenarioId = useSimulationStore((s) => s.activeScenarioId);
  const nodeStates = useSimulationStore((s) => s.result.nodeStates);
  const pinnedInputs = useSimulationStore((s) => s.pinnedInputs);
  const realismWarnings = useSimulationStore((s) => s.realismWarnings);
  const setInputValue = useSimulationStore((s) => s.setInputValue);
  const unpinInput = useSimulationStore((s) => s.unpinInput);
  const applyScenario = useSimulationStore((s) => s.applyScenario);
  const resetToBaseline = useSimulationStore((s) => s.resetToBaseline);

  return (
    <div className="flex flex-col gap-3 p-2 overflow-y-auto h-full text-sm">
      {/* 프리셋 시나리오 */}
      <section className="flex flex-col gap-1.5">
        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          시나리오 프리셋
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {scenarios.map((s) => (
            <PresetButton
              key={s.id}
              scenario={s}
              isActive={activeScenarioId === s.id}
              onClick={() => applyScenario(s.id)}
            />
          ))}
        </div>
      </section>

      {/* 리셋 버튼 */}
      <button
        type="button"
        onClick={resetToBaseline}
        className="w-full h-7 rounded-md text-xs font-medium
          border border-white/[0.06] bg-white/[0.03] text-slate-500
          hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30
          transition-all duration-150 cursor-pointer"
      >
        기준값으로 리셋
      </button>

      {/* 현실성 경고 */}
      {realismWarnings.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {realismWarnings.map((w) => (
            <div
              key={w.id}
              className="rounded-md px-2.5 py-2 text-[11px] leading-relaxed"
              style={{
                backgroundColor: w.severity === 'critical'
                  ? 'rgba(239,68,68,0.08)'
                  : 'rgba(245,158,11,0.08)',
                borderLeft: `2px solid ${w.severity === 'critical' ? '#ef4444' : '#f59e0b'}`,
                color: w.severity === 'critical'
                  ? 'rgba(239,68,68,0.9)'
                  : 'rgba(245,158,11,0.9)',
              }}
            >
              {w.message}
            </div>
          ))}
        </div>
      )}

      {/* 구분선 */}
      <div className="border-t border-white/[0.06]" />

      {/* 국가별 슬라이더 그룹 */}
      {groups.map((group, groupIdx) => {
        const color = regionColors[group.region];
        // 그룹 내 유효한 input 변수만 필터링
        const groupVars = group.ids
          .filter((id) => inputVariableIds.has(id))
          .map((id) => variableMap[id])
          .filter(Boolean);

        if (groupVars.length === 0) return null;

        return (
          <section key={group.region} className="flex flex-col gap-2">
            {/* 그룹 간 구분선 (첫 그룹 제외) */}
            {groupIdx > 0 && (
              <div className="border-t border-white/[0.04]" />
            )}

            {/* 그룹 제목 */}
            <h3
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: color.primary }}
            >
              {group.label}
            </h3>

            {/* 슬라이더 목록 */}
            <div className="flex flex-col gap-2.5">
              {groupVars.map((v) => (
                <SliderInput
                  key={v.id}
                  variableId={v.id}
                  label={v.label}
                  region={v.region}
                  value={inputValues[v.id] ?? v.baseline}
                  baseline={v.baseline}
                  effectiveDelta={nodeStates[v.id]?.delta}
                  isPinned={pinnedInputs.has(v.id)}
                  onUnpin={() => unpinInput(v.id)}
                  onChange={(val) => setInputValue(v.id, val)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
