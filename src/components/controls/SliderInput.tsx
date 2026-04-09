import { useRef } from 'react';
import type { Region, RealismWarning } from '../../domain/types';
import { regionColors } from '../../styles/tokens';
import { useStateColors } from '../../hooks/useStateColors';
import { WarningBubble } from './WarningBubble';

interface SliderInputProps {
  variableId: string;
  label: string;
  region: Region;
  value: number;
  baseline: number;
  effectiveDelta?: number;
  isPinned: boolean;
  onUnpin: () => void;
  onChange: (value: number) => void;
  warnings?: RealismWarning[];
}

export function SliderInput({
  label,
  region,
  value,
  baseline,
  effectiveDelta,
  isPinned,
  onUnpin,
  onChange,
  warnings,
}: SliderInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateColors = useStateColors();
  const userDelta = value - baseline;
  const color = regionColors[region];

  // 고정 상태에서만 규칙 압력 표시 (비고정 슬라이더는 이미 자동 조정됨)
  const rulePressure = isPinned && effectiveDelta !== undefined
    ? effectiveDelta - userDelta
    : 0;
  const hasRulePressure = isPinned && Math.abs(rulePressure) >= 2;

  const displayDelta = hasRulePressure ? (effectiveDelta ?? userDelta) : userDelta;

  const deltaColorValue =
    displayDelta > 0
      ? stateColors.positive
      : displayDelta < 0
        ? stateColors.negative
        : stateColors.neutral;

  // 규칙 압력 방향에 따른 glow 색상
  const pressureGlowColor = rulePressure > 0
    ? stateColors.positive
    : stateColors.negative;

  // 고정 상태에서 규칙 압력에 의한 가상 위치
  const effectivePosition = hasRulePressure
    ? Math.max(0, Math.min(100, value + rulePressure))
    : null;

  const hasWarnings = warnings && warnings.length > 0;

  return (
    <div className="flex flex-col gap-1">
      {/* 상단: 핀/라벨 + 값 + delta + 외부압력 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 min-w-0">
          {/* 고정 표시 (클릭으로 해제) */}
          {isPinned ? (
            <button
              type="button"
              onClick={onUnpin}
              className="text-[9px] text-amber-400/80 hover:text-amber-300 cursor-pointer shrink-0 w-3 text-center"
              title="고정 해제 — 다른 변수에 따라 자동 조정됩니다"
              aria-label={`${label} 고정 해제`}
            >
              ●
            </button>
          ) : (
            <span className="w-3 shrink-0" />
          )}
          <span className="text-xs text-slate-300 truncate">{label}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs font-mono text-slate-300">{value}</span>
          {displayDelta !== 0 && (
            <span
              className="text-[10px] font-mono"
              style={{ color: deltaColorValue }}
            >
              {displayDelta > 0 ? '+' : ''}{Math.round(displayDelta)}
            </span>
          )}
          {hasRulePressure && (
            <span
              className="text-[9px] font-mono"
              style={{ color: pressureGlowColor }}
              title={`무시 중인 압력 ${rulePressure > 0 ? '+' : ''}${Math.round(rulePressure)}`}
            >
              {rulePressure > 0 ? '▲' : '▼'}
            </span>
          )}
        </div>
      </div>

      {/* 슬라이더 */}
      <div ref={containerRef} className="relative">
        {hasWarnings && (
          <WarningBubble warnings={warnings} anchorRef={containerRef} />
        )}
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={`${label} 조절 슬라이더`}
          className="relative z-10 w-full h-1 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-none
            [&::-webkit-slider-thumb]:shadow-md"
          style={{
            accentColor: color.primary,
            background: `linear-gradient(to right, ${color.primary} ${value}%, rgba(100,116,139,0.3) ${value}%)`,
            // @ts-expect-error -- CSS 변수로 썸 색상 전달
            '--thumb-color': color.primary,
          }}
        />

        {/* 고정 상태에서 무시 중인 규칙 압력 위치 마커 */}
        {effectivePosition !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full z-0 transition-all duration-300"
            style={{
              left: `calc(${effectivePosition}% - 4px)`,
              backgroundColor: pressureGlowColor,
              boxShadow: `0 0 6px ${pressureGlowColor}`,
              opacity: 0.8,
            }}
          />
        )}
      </div>

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
