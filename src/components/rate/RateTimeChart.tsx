/**
 * 금리 시계열 차트 (SVG)
 *
 * 시장금리가 기준금리보다 먼저 반응하는 패턴을 보여준다.
 * x축: 즉시 / 단기 / 중기
 * 두 선: 시장금리(실선) vs 기준금리(점선)
 */

import { useStateColors } from '../../hooks/useStateColors';
import type { TimeSeriesPoint } from '../../hooks/useRateSimulation';

interface RateTimeChartProps {
  data: TimeSeriesPoint[];
}

const W = 260;
const H = 130;
const PAD_L = 30;
const PAD_R = 10;
const PAD_T = 15;
const PAD_B = 30;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

export function RateTimeChart({ data }: RateTimeChartProps) {
  const stateColors = useStateColors();

  if (data.length === 0) return null;

  // y축 범위: 데이터 기반 대칭
  const allVals = data.flatMap((d) => [d.krRate, d.krRatePressure]);
  const maxAbs = Math.max(Math.abs(Math.min(...allVals)), Math.abs(Math.max(...allVals)), 5);
  const yMin = -maxAbs;
  const yMax = maxAbs;

  const toX = (i: number) => PAD_L + (i / (data.length - 1)) * PLOT_W;
  const toY = (v: number) => PAD_T + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H;

  const pressureLine = data.map((d, i) => `${toX(i)},${toY(d.krRatePressure)}`).join(' ');
  const rateLine = data.map((d, i) => `${toX(i)},${toY(d.krRate)}`).join(' ');

  const zeroY = toY(0);

  // 시장금리가 먼저/더 크게 움직이면 positive 색, 아니면 neutral
  const hasMovement = allVals.some((v) => Math.abs(v) >= 2);

  return (
    <div className="rounded-lg border border-slate-700/30 p-3" style={{ backgroundColor: 'rgba(30,41,59,0.4)' }}>
      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        시간에 따른 반응
      </h4>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 130 }}>
        {/* 제로 라인 */}
        <line
          x1={PAD_L} y1={zeroY} x2={W - PAD_R} y2={zeroY}
          stroke="rgba(148,163,184,0.15)"
          strokeWidth={0.5}
        />

        {/* x축 라벨 */}
        {data.map((d, i) => (
          <text
            key={d.label}
            x={toX(i)}
            y={H - 5}
            textAnchor="middle"
            className="fill-slate-500"
            fontSize={9}
          >
            {d.label}
          </text>
        ))}

        {/* y축 라벨 (중립) */}
        <text x={PAD_L - 4} y={zeroY + 3} textAnchor="end" className="fill-slate-600" fontSize={8}>
          0
        </text>

        {hasMovement && (
          <>
            {/* 기준금리 선 (점선, 느리게) */}
            <polyline
              points={rateLine}
              fill="none"
              stroke="rgba(148,163,184,0.5)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 시장금리 선 (실선, 빠르게) */}
            <polyline
              points={pressureLine}
              fill="none"
              stroke={stateColors.positive}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.8}
            />

            {/* 데이터 포인트 */}
            {data.map((d, i) => (
              <g key={d.label}>
                <circle cx={toX(i)} cy={toY(d.krRatePressure)} r={2.5} fill={stateColors.positive} opacity={0.8} />
                <circle cx={toX(i)} cy={toY(d.krRate)} r={2} fill="rgba(148,163,184,0.6)" />
              </g>
            ))}
          </>
        )}

        {!hasMovement && (
          <text x={W / 2} y={H / 2} textAnchor="middle" className="fill-slate-600" fontSize={10}>
            변화 없음
          </text>
        )}
      </svg>

      {/* 범례 */}
      <div className="mt-1.5 flex items-center gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 rounded-full" style={{ backgroundColor: stateColors.positive, opacity: 0.8 }} />
          시장금리
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-0.5 w-4 rounded-full"
            style={{
              backgroundColor: 'rgba(148,163,184,0.5)',
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(30,41,59,1) 2px, rgba(30,41,59,1) 4px)',
            }}
          />
          기준금리
        </span>
      </div>
    </div>
  );
}
