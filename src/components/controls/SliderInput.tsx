import type { Region } from '../../domain/types';
import { RegionBadge } from '../ui/RegionBadge';
import { regionColors } from '../../styles/tokens';

interface SliderInputProps {
  variableId: string;
  label: string;
  region: Region;
  value: number;
  baseline: number;
  onChange: (value: number) => void;
}

export function SliderInput({
  label,
  region,
  value,
  baseline,
  onChange,
}: SliderInputProps) {
  const delta = value - baseline;
  const color = regionColors[region];

  // delta 부호에 따른 색상
  const deltaColor =
    delta > 0
      ? 'text-emerald-400'
      : delta < 0
        ? 'text-rose-400'
        : 'text-slate-500';

  return (
    <div className="flex flex-col gap-1">
      {/* 상단: 라벨 + 배지 + 값 표시 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <RegionBadge region={region} size="sm" />
          <span className="text-xs text-slate-300 truncate">{label}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-mono text-slate-300">{value}</span>
          {delta !== 0 && (
            <span className={`text-[10px] font-mono ${deltaColor}`}>
              {delta > 0 ? '+' : ''}{delta}
            </span>
          )}
        </div>
      </div>

      {/* 슬라이더 */}
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} 조절 슬라이더`}
        className="w-full h-1 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:border-none
          [&::-webkit-slider-thumb]:shadow-md"
        style={{
          accentColor: color.primary,
          background: `linear-gradient(to right, ${color.primary} ${value}%, rgba(100,116,139,0.3) ${value}%)`,
          // 썸 색상도 국가 색상으로 설정
          // @ts-expect-error -- CSS 변수로 썸 색상 전달
          '--thumb-color': color.primary,
        }}
      />

      <style>{`
        input[type="range"][aria-label="${label} 조절 슬라이더"]::-webkit-slider-thumb {
          background-color: ${color.primary};
        }
        input[type="range"][aria-label="${label} 조절 슬라이더"]::-moz-range-thumb {
          background-color: ${color.primary};
          border: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
