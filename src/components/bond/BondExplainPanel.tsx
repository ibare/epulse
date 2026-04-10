/**
 * 채권 뷰 우측 설명 패널
 *
 * 채권 상태 요약 + 선택 노드 설명 + 시계열 차트
 */

import { useSimulationStore } from '../../store/simulationStore';
import { useStateColors } from '../../hooks/useStateColors';
import { useBondSimulation } from '../../hooks/useBondSimulation';
import { variableMap } from '../../domain/nodes';
import { GlassPanel } from '../ui/GlassPanel';
import { IntensityDots } from '../ui/IntensityDots';
import { RegionBadge } from '../ui/RegionBadge';
import { BondTimeChart } from './BondTimeChart';
import type { DetailViewDef } from '../../domain/views/types';

interface BondExplainPanelProps {
  viewDef: DetailViewDef;
  selectedNodeId: string | null;
}

export function BondExplainPanel({ viewDef, selectedNodeId }: BondExplainPanelProps) {
  const result = useSimulationStore((s) => s.result);
  const stateColors = useStateColors();
  const {
    conceptStates,
    resultState,
    explanationText,
    timeSeriesData,
  } = useBondSimulation(viewDef);

  const conceptMap = Object.fromEntries(
    viewDef.conceptNodes.map((c) => [c.id, c]),
  );

  // 선택된 노드 정보
  const selectedConcept = selectedNodeId ? conceptMap[selectedNodeId] : null;
  const selectedConceptState = conceptStates.find((c) => c.id === selectedNodeId);
  const selectedVariable = selectedNodeId ? variableMap[selectedNodeId] : null;
  const selectedNodeState = selectedNodeId ? result.nodeStates[selectedNodeId] : null;

  const resultLabel = viewDef.id === 'bond-kr' ? '한국 채권 가격' : '미국 채권 가격';
  const chartLabel = viewDef.id === 'bond-kr' ? '한국 채권 압력' : '미국 채권 압력';

  const indicatorColor = resultState
    ? resultState.intensity > 0
      ? stateColors.positive
      : resultState.intensity < 0
        ? stateColors.negative
        : stateColors.neutral
    : stateColors.neutral;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      {/* 채권 상태 요약 */}
      <div className="rounded-lg px-4 py-3" style={{ backgroundColor: 'rgba(30,41,59,0.4)' }}>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          채권 상태 요약
        </h3>

        {resultState && (
          <div className="mb-3">
            <div
              className="rounded-lg border px-2.5 py-2"
              style={{
                borderColor: `${indicatorColor}30`,
                backgroundColor: `${indicatorColor}08`,
              }}
            >
              <div className="mb-1 text-[10px] font-medium text-slate-500">{resultLabel}</div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-300">{resultState.displayState}</span>
                <IntensityDots intensity={resultState.intensity} />
              </div>
            </div>
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

      {/* 선택 노드 상세: 개념 노드 */}
      {selectedConcept && selectedConceptState && (
        <GlassPanel className="rounded-xl border border-slate-700/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-200">
              {selectedConcept.label}
            </h3>
            <span className="rounded-full bg-slate-700/60 px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
              개념
            </span>
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

          {/* 결과 영향 */}
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

      {/* 선택 노드 상세: 엔진 변수 노드 */}
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
      <BondTimeChart data={timeSeriesData} label={chartLabel} />
    </div>
  );
}
