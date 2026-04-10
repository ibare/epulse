/**
 * 금리 뷰 중간 개념 노드
 *
 * 가상 노드(인플레이션 압력, 경기 압력, 중앙은행 스탠스, 시장 기대)를
 * dashed border로 시각 구분하여 렌더링한다.
 */

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import { IntensityDots } from '../ui/IntensityDots';
import { useStateColors } from '../../hooks/useStateColors';

export type RateConceptNodeData = Record<string, unknown> & {
  label: string;
  description: string;
  delta: number;
  displayState: string;
  intensity: number;
  isSelected: boolean;
  isConnected: boolean;
  isDimmed: boolean;
};

type RateConceptNodeType = Node<RateConceptNodeData, 'rateConcept'>;

function RateConceptNodeComponent({ data }: NodeProps<RateConceptNodeType>) {
  const {
    label,
    delta,
    displayState,
    intensity,
    isSelected,
    isDimmed,
  } = data;

  const stateColors = useStateColors();
  const absIntensity = Math.abs(intensity);

  const glowColor = intensity > 0
    ? stateColors.positive
    : intensity < 0
      ? stateColors.negative
      : stateColors.neutral;

  const borderColor = absIntensity >= 2
    ? glowColor
    : absIntensity >= 1
      ? `${glowColor}60`
      : 'rgba(148,163,184,0.2)';

  const boxShadow = absIntensity >= 2
    ? `0 0 10px ${glowColor}30, 0 0 3px ${glowColor}15`
    : 'none';

  const opacity = isDimmed ? 0.15 : 1;

  const arrow = delta >= 4 ? '↑' : delta <= -4 ? '↓' : '→';

  return (
    <div
      className="relative transition-all duration-300"
      style={{ opacity }}
    >
      {/* 연결 핸들 — 4방향, source+target 겸용 */}
      <Handle type="target" id="top"    position={Position.Top}    className="!w-0 !h-0 !border-0 !bg-transparent" />
      <Handle type="target" id="right"  position={Position.Right}  className="!w-0 !h-0 !border-0 !bg-transparent" />
      <Handle type="target" id="bottom" position={Position.Bottom} className="!w-0 !h-0 !border-0 !bg-transparent" />
      <Handle type="target" id="left"   position={Position.Left}   className="!w-0 !h-0 !border-0 !bg-transparent" />
      <Handle type="source" id="top"    position={Position.Top}    className="!w-0 !h-0 !border-0 !bg-transparent" />
      <Handle type="source" id="right"  position={Position.Right}  className="!w-0 !h-0 !border-0 !bg-transparent" />
      <Handle type="source" id="bottom" position={Position.Bottom} className="!w-0 !h-0 !border-0 !bg-transparent" />
      <Handle type="source" id="left"   position={Position.Left}   className="!w-0 !h-0 !border-0 !bg-transparent" />

      <div
        className={`
          w-[170px] rounded-xl px-3 py-2.5
          backdrop-blur-sm border-dashed
          transition-all duration-300
          ${isSelected ? 'ring-1 ring-white/20' : ''}
        `}
        style={{
          backgroundColor: absIntensity >= 1
            ? `${glowColor}06`
            : 'rgba(30,41,59,0.6)',
          borderWidth: '1.5px',
          borderColor,
          boxShadow,
        }}
        aria-label={`${label}: ${displayState}`}
      >
        {/* 상단: 라벨 + 개념 태그 */}
        <div className="mb-1.5 flex items-start justify-between gap-1">
          <span className="text-xs font-semibold leading-tight text-slate-200">
            {label}
          </span>
          <span className="shrink-0 rounded-full bg-slate-700/60 px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
            개념
          </span>
        </div>

        {/* 하단: 상태 + 방향 + 강도 */}
        <div className="flex items-center gap-1.5">
          <span
            className="text-sm font-bold"
            style={{ color: absIntensity >= 1 ? glowColor : 'rgb(148,163,184)' }}
          >
            {arrow}
          </span>
          <span className="text-[11px] text-slate-400">
            {displayState}
          </span>
          <div className="ml-auto">
            <IntensityDots intensity={intensity} />
          </div>
        </div>
      </div>
    </div>
  );
}

export const RateConceptNode = memo(RateConceptNodeComponent);
