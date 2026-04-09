import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import { RegionBadge } from '../ui/RegionBadge';
import { IntensityDots } from '../ui/IntensityDots';
import { regionColors } from '../../styles/tokens';
import { useStateColors } from '../../hooks/useStateColors';
import { deltaToArrow } from '../../utils/formatters';
import type { Region } from '../../domain/types';

export type EconomicNodeData = Record<string, unknown> & {
  label: string;
  region: Region;
  delta: number;
  displayState: string;
  intensity: number;
  variableType: 'input' | 'derived';
  layer: 'cause' | 'transmission' | 'market';
  isSelected: boolean;
  isConnected: boolean;
  isDimmed: boolean;
};

type EconomicNodeType = Node<EconomicNodeData, 'economic'>;

function EconomicNodeComponent({ data }: NodeProps<EconomicNodeType>) {
  const {
    label,
    region,
    delta,
    displayState,
    intensity,
    layer,
    isSelected,
    isDimmed,
  } = data;

  const stateColors = useStateColors();
  const regionColor = regionColors[region];
  const absIntensity = Math.abs(intensity);

  // 상태에 따른 glow 색상
  const glowColor = intensity > 0
    ? stateColors.positive
    : intensity < 0
      ? stateColors.negative
      : stateColors.neutral;

  // 노드 테두리/배경 스타일
  const borderColor = absIntensity >= 2
    ? glowColor
    : absIntensity >= 1
      ? `${glowColor}80`
      : 'rgba(148,163,184,0.15)';

  const bgColor = absIntensity >= 1
    ? `${glowColor}08`
    : 'rgba(30,41,59,0.8)';

  const boxShadow = absIntensity >= 2
    ? `0 0 12px ${glowColor}40, 0 0 4px ${glowColor}20`
    : absIntensity >= 1
      ? `0 0 6px ${glowColor}20`
      : 'none';

  const opacity = isDimmed ? 0.15 : 1;

  return (
    <div
      className="relative transition-all duration-300"
      style={{ opacity }}
    >
      {/* 연결 핸들 */}
      {layer !== 'cause' && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-1.5 !h-1.5 !border-0 !bg-slate-600"
        />
      )}
      {layer !== 'market' && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-1.5 !h-1.5 !border-0 !bg-slate-600"
        />
      )}

      <div
        className={`
          w-[160px] rounded-xl px-3 py-2.5
          backdrop-blur-sm
          transition-all duration-300
          ${isSelected ? 'ring-1 ring-white/20' : ''}
          ${absIntensity >= 3 ? 'animate-pulse-glow' : ''}
        `}
        style={{
          backgroundColor: bgColor,
          border: `1px solid ${borderColor}`,
          boxShadow,
        }}
        aria-label={`${label}: ${displayState}`}
      >
        {/* 상단: 라벨 + 배지 */}
        <div className="mb-1.5 flex items-start justify-between gap-1">
          <span className="text-xs font-semibold leading-tight text-slate-200">
            {label}
          </span>
          <RegionBadge region={region} size="sm" />
        </div>

        {/* 중단: 상태 + 방향 + 강도 */}
        <div className="flex items-center gap-1.5">
          <span
            className="text-sm font-bold"
            style={{
              color: absIntensity >= 1
                ? glowColor
                : regionColor.primary,
            }}
          >
            {deltaToArrow(delta)}
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

export const EconomicNode = memo(EconomicNodeComponent);
