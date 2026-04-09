import { memo } from 'react';
import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
  type Edge,
} from '@xyflow/react';
import { stateColors } from '../../styles/tokens';
import type { Direction } from '../../domain/types';

export type CausalEdgeData = Record<string, unknown> & {
  active: boolean;
  strength: number;
  direction: Direction;
  explanation: string;
  isDimmed: boolean;
  lag: 'immediate' | 'short' | 'medium';
};

type CausalEdgeType = Edge<CausalEdgeData, 'causal'>;

function CausalEdgeComponent({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<CausalEdgeType>) {
  const {
    active = false,
    strength = 0,
    direction = 'positive',
    isDimmed = false,
  } = data ?? {};

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const color = !active
    ? stateColors.neutral
    : direction === 'positive'
      ? stateColors.positive
      : stateColors.negative;

  const strokeWidth = active ? 0.5 + strength * 2.5 : 0.5;
  const opacity = isDimmed ? 0.06 : active ? 0.8 : 0.15;

  return (
    <g className="transition-opacity duration-300" style={{ opacity }}>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth,
          fill: 'none',
        }}
      />
      {/* 애니메이션 오버레이 */}
      {active && !isDimmed && (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray="6 6"
          className="animate-flow"
          style={{ opacity: 0.6 }}
        />
      )}
      {/* glow 효과 */}
      {active && strength >= 0.5 && !isDimmed && (
        <BaseEdge
          path={edgePath}
          style={{
            stroke: color,
            strokeWidth: strokeWidth + 4,
            fill: 'none',
            opacity: 0.1,
            filter: 'blur(3px)',
          }}
        />
      )}
    </g>
  );
}

export const CausalEdge = memo(CausalEdgeComponent);
