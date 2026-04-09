import { memo, useMemo } from 'react';
import {
  EdgeLabelRenderer,
  getBezierPath,
  Position,
  type EdgeProps,
  type Edge,
} from '@xyflow/react';
import { useStateColors } from '../../hooks/useStateColors';
import type { Direction } from '../../domain/types';

export type CausalEdgeData = Record<string, unknown> & {
  active: boolean;
  strength: number;
  direction: Direction;
  explanation: string;
  isDimmed: boolean;
  lag: 'immediate' | 'short' | 'medium';
  order: number;
};

type CausalEdgeType = Edge<CausalEdgeData, 'causal'>;

const CURVATURE = 0.25;
const SAMPLES = 24;

function calcOffset(distance: number): number {
  return Math.abs(distance) >= 0.5
    ? 0.5 * distance
    : CURVATURE * 25 * Math.sqrt(Math.abs(distance));
}

function getControlPoint(
  pos: Position,
  x1: number, y1: number,
  x2: number, y2: number,
): [number, number] {
  switch (pos) {
    case Position.Right:  return [x1 + calcOffset(x2 - x1), y1];
    case Position.Left:   return [x1 - calcOffset(x1 - x2), y1];
    case Position.Bottom: return [x1, y1 + calcOffset(y2 - y1)];
    case Position.Top:    return [x1, y1 - calcOffset(y1 - y2)];
  }
}

function buildTaperedPath(
  sx: number, sy: number,
  tx: number, ty: number,
  sPos: Position, tPos: Position,
  width: number,
): string {
  const [cp1x, cp1y] = getControlPoint(sPos, sx, sy, tx, ty);
  const [cp2x, cp2y] = getControlPoint(tPos, tx, ty, sx, sy);

  const upper: string[] = [];
  const lower: string[] = [];

  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const u = 1 - t;

    const x = u*u*u*sx + 3*u*u*t*cp1x + 3*u*t*t*cp2x + t*t*t*tx;
    const y = u*u*u*sy + 3*u*u*t*cp1y + 3*u*t*t*cp2y + t*t*t*ty;

    const dx = 3*u*u*(cp1x-sx) + 6*u*t*(cp2x-cp1x) + 3*t*t*(tx-cp2x);
    const dy = 3*u*u*(cp1y-sy) + 6*u*t*(cp2y-cp1y) + 3*t*t*(ty-cp2y);

    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const hw = (width / 2) * (1 - t);
    upper.push(`${x + nx * hw},${y + ny * hw}`);
    lower.unshift(`${x - nx * hw},${y - ny * hw}`);
  }

  return `M ${upper[0]} L ${upper.slice(1).join(' L ')} L ${lower.join(' L ')} Z`;
}

const ARROW_SIZE = 5;
const ARROW_ANGLE = Math.tan(Math.PI / 6);

function CausalEdgeComponent({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<CausalEdgeType>) {
  const stateColors = useStateColors();
  const {
    active = false,
    strength = 0,
    direction = 'positive',
    isDimmed = false,
    order = 0,
  } = data ?? {};

  const [, labelX, labelY] = getBezierPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
  });

  const color = !active
    ? stateColors.neutral
    : direction === 'positive'
      ? stateColors.positive
      : stateColors.negative;

  const strokeWidth = active ? 0.5 + strength * 9.5 : 0.5;
  const opacity = isDimmed ? 0.06 : active ? 0.8 : 0.15;

  const taperedPath = useMemo(
    () => buildTaperedPath(
      sourceX, sourceY, targetX, targetY,
      sourcePosition, targetPosition,
      strokeWidth,
    ),
    [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, strokeWidth],
  );

  const arrowPath = useMemo(() => {
    const [cp2x, cp2y] = getControlPoint(targetPosition, targetX, targetY, sourceX, sourceY);
    const dx = targetX - cp2x;
    const dy = targetY - cp2y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;

    const w1x = targetX - ux * ARROW_SIZE + nx * ARROW_SIZE * ARROW_ANGLE;
    const w1y = targetY - uy * ARROW_SIZE + ny * ARROW_SIZE * ARROW_ANGLE;
    const w2x = targetX - ux * ARROW_SIZE - nx * ARROW_SIZE * ARROW_ANGLE;
    const w2y = targetY - uy * ARROW_SIZE - ny * ARROW_SIZE * ARROW_ANGLE;

    return `M ${w1x},${w1y} L ${targetX},${targetY} L ${w2x},${w2y}`;
  }, [targetX, targetY, sourceX, sourceY, targetPosition]);

  return (
    <>
    <g className="transition-opacity duration-300" style={{ opacity }}>
      <path d={taperedPath} fill={color} stroke="none" />
      <path
        d={arrowPath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* glow 효과 */}
      {active && strength >= 0.5 && !isDimmed && (
        <path
          d={taperedPath}
          fill={color}
          stroke="none"
          style={{ opacity: 0.15, filter: 'blur(4px)' }}
        />
      )}
    </g>
    {active && !isDimmed && order > 0 && (
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'none',
            width: 18,
            height: 18,
            borderRadius: '50%',
            backgroundColor: `${color}cc`,
            border: `1px solid ${color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          {order}
        </div>
      </EdgeLabelRenderer>
    )}
  </>
  );
}

export const CausalEdge = memo(CausalEdgeComponent);
