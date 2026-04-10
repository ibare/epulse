/**
 * 금리 뷰 우측 설명 패널
 *
 * 금리 구조 요약 + 선택 노드 설명 + 시계열 차트
 */

import { useSimulationStore } from '../../store/simulationStore';
import { useStateColors } from '../../hooks/useStateColors';
import { useRateSimulation } from '../../hooks/useRateSimulation';
import { rateConceptMap } from '../../domain/views/rateView';
import { variableMap } from '../../domain/nodes';
import { GlassPanel } from '../ui/GlassPanel';
import { IntensityDots } from '../ui/IntensityDots';
import { RegionBadge } from '../ui/RegionBadge';
import { RateTimeChart } from './RateTimeChart';

interface RateExplainPanelProps {
  selectedNodeId: string | null;
}

export function RateExplainPanel({ selectedNodeId }: RateExplainPanelProps) {
  const result = useSimulationStore((s) => s.result);
  const stateColors = useStateColors();
  const {
    conceptStates,
    explanationText,
    timeSeriesData,
  } = useRateSimulation();

  const krRate = result.nodeStates['kr_rate'];
  const krRatePressure = result.nodeStates['kr_rate_pressure'];

  // 선택된 노드 정보
  const selectedConcept = selectedNodeId ? rateConceptMap[selectedNodeId] : null;
  const selectedConceptState = conceptStates.find((c) => c.id === selectedNodeId);
  const selectedVariable = selectedNodeId ? variableMap[selectedNodeId] : null;
  const selectedNodeState = selectedNodeId ? result.nodeStates[selectedNodeId] : null;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      {/* 금리 상태 요약 */}
      <div className="rounded-lg px-4 py-3" style={{ backgroundColor: 'rgba(30,41,59,0.4)' }}>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          금리 구조 요약
        </h3>

        {krRate && krRatePressure && (
          <div className="mb-3 flex gap-3">
            <RateIndicator
              label="기준금리"
              displayState={krRate.displayState}
              intensity={krRate.intensity}
              color={stateColors}
            />
            <RateIndicator
              label="시장금리"
              displayState={krRatePressure.displayState}
              intensity={krRatePressure.intensity}
              color={stateColors}
            />
          </div>
        )}

        <div className="space-y-1">
          {explanationText.map((text, i) => (
            <p key={i} className="text-xs leading-relaxed text-slate-400">
              {text}
            </p>
          ))}
        </div>
      </div>

      {/* 선택 노드 상세 */}
      {selectedConcept && selectedConceptState && (
        <GlassPanel className="rounded-xl border border-slate-700/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-200">
              {selectedConcept.label}
            </h3>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-slate-400">
            {selectedConcept.description}
          </p>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-slate-400">현재 상태</span>
            <span className="text-xs font-medium text-slate-300">
              {selectedConceptState.displayState}
            </span>
            <IntensityDots intensity={selectedConceptState.intensity} />
          </div>

          {/* 이 개념의 결과 영향 */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              결과 영향
            </h4>
            {selectedConcept.targets.map((t) => (
              <p key={t.targetId} className="text-xs leading-relaxed text-slate-400">
                {t.description}
              </p>
            ))}
          </div>
        </GlassPanel>
      )}

      {/* 기존 엔진 노드 선택 시 */}
      {!selectedConcept && selectedVariable && selectedNodeState && (
        <GlassPanel className="rounded-xl border border-slate-700/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-200">
              {selectedVariable.label}
            </h3>
            <RegionBadge region={selectedVariable.region} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">현재 상태</span>
            <span className="text-xs font-medium text-slate-300">
              {selectedNodeState.displayState}
            </span>
            <IntensityDots intensity={selectedNodeState.intensity} />
          </div>
        </GlassPanel>
      )}

      {/* 시계열 차트 */}
      <RateTimeChart data={timeSeriesData} />
    </div>
  );
}

// ─── 금리 지표 카드 ──────────────────────────────────

function RateIndicator({
  label,
  displayState,
  intensity,
  color,
}: {
  label: string;
  displayState: string;
  intensity: number;
  color: { positive: string; negative: string; neutral: string };
}) {
  const indicatorColor = intensity > 0
    ? color.positive
    : intensity < 0
      ? color.negative
      : color.neutral;

  return (
    <div
      className="flex-1 rounded-lg border px-2.5 py-2"
      style={{
        borderColor: `${indicatorColor}30`,
        backgroundColor: `${indicatorColor}08`,
      }}
    >
      <div className="mb-1 text-[10px] font-medium text-slate-500">{label}</div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-slate-300">{displayState}</span>
        <IntensityDots intensity={intensity} />
      </div>
    </div>
  );
}
