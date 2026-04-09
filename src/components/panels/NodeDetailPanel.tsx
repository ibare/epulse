/** 선택된 노드의 상세 정보 및 연결된 인과 규칙을 표시하는 패널 */

import { useNodeInteraction } from '../../hooks/useNodeInteraction';
import { useSimulationStore } from '../../store/simulationStore';
import { variableMap } from '../../domain/nodes';
import { GlassPanel } from '../ui/GlassPanel';
import { RegionBadge } from '../ui/RegionBadge';
import { IntensityDots } from '../ui/IntensityDots';

export function NodeDetailPanel() {
  const { selectedNodeId, connectedRules } = useNodeInteraction();
  const result = useSimulationStore((s) => s.result);

  if (!selectedNodeId) return null;

  const nodeState = result.nodeStates[selectedNodeId];
  const variable = variableMap[selectedNodeId];

  if (!nodeState || !variable) return null;

  return (
    <GlassPanel className="rounded-xl border border-slate-700/50 p-4">
      {/* 노드 헤더: 라벨 + 지역 배지 */}
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-200">
          {variable.label}
        </h3>
        <RegionBadge region={variable.region} />
      </div>

      {/* 현재 상태 */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs text-slate-400">현재 상태</span>
        <span className="text-xs font-medium text-slate-300">
          {nodeState.displayState}
        </span>
        <IntensityDots intensity={nodeState.intensity} />
      </div>

      {/* 연결된 규칙 목록 */}
      {connectedRules.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            연결된 인과 규칙
          </h4>
          {connectedRules.map((rule) => {
            const sourceVar = variableMap[rule.source];
            const targetVar = variableMap[rule.target];
            const isSource = rule.source === selectedNodeId;

            return (
              <div
                key={rule.id}
                className="rounded-lg border border-slate-700/30 px-3 py-2"
                style={{ backgroundColor: 'rgba(30,41,59,0.5)' }}
              >
                {/* source → target 표시 */}
                <div className="mb-1 flex items-center gap-1 text-xs">
                  <span
                    className={
                      isSource
                        ? 'font-medium text-slate-200'
                        : 'text-slate-400'
                    }
                  >
                    {sourceVar?.label ?? rule.source}
                  </span>
                  <span className="text-slate-600">→</span>
                  <span
                    className={
                      !isSource
                        ? 'font-medium text-slate-200'
                        : 'text-slate-400'
                    }
                  >
                    {targetVar?.label ?? rule.target}
                  </span>
                </div>
                {/* 설명 */}
                <p className="text-xs leading-relaxed text-slate-400">
                  {rule.explanation}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </GlassPanel>
  );
}
