import type { CausalRule } from '../../domain/types';
import { variableMap } from '../../domain/nodes';
import { trackEvent } from '../../utils/analytics';

interface RuleOverride {
  weight: number;
}

interface RuleRowProps {
  rule: CausalRule;
  override?: RuleOverride;
  onWeightChange: (weight: number) => void;
  onReset: () => void;
}

const directionLabel: Record<string, { text: string; className: string }> = {
  positive: { text: '+ 정방향', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  negative: { text: '- 역방향', className: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
};

const lagLabel: Record<string, { text: string; className: string }> = {
  immediate: { text: '즉시', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  short: { text: '단기', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  medium: { text: '중기', className: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
};

export function RuleRow({ rule, override, onWeightChange, onReset }: RuleRowProps) {
  const isModified = override !== undefined;
  const currentWeight = override?.weight ?? rule.weight;
  const sourceLabel = variableMap[rule.source]?.label ?? rule.source;
  const targetLabel = variableMap[rule.target]?.label ?? rule.target;
  const dir = directionLabel[rule.direction];
  const lag = lagLabel[rule.lag];
  const hasExceptions = rule.exceptions && rule.exceptions.length > 0;

  return (
    <div
      className={`rounded-lg border p-3 transition-colors duration-150 ${
        isModified
          ? 'border-amber-500/30 bg-amber-500/[0.03]'
          : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}
    >
      {/* 상단: source → target */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0 text-sm">
          <span className="text-slate-200 truncate">{sourceLabel}</span>
          <span className="text-slate-500 shrink-0">→</span>
          <span className="text-slate-200 truncate">{targetLabel}</span>
        </div>
        <span className="text-[10px] font-mono text-slate-600 shrink-0">{rule.id}</span>
      </div>

      {/* 배지 행 */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${dir.className}`}>
          {dir.text}
        </span>
        <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${lag.className}`}>
          {lag.text}
        </span>
        {hasExceptions && (
          <span className="inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium bg-slate-500/15 text-slate-400 border-slate-500/30">
            조건부
          </span>
        )}
      </div>

      {/* 설명 */}
      <p className="text-[11px] text-slate-500 mb-3 leading-relaxed line-clamp-2">
        {rule.explanation}
      </p>

      {/* weight 슬라이더 */}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={1.5}
          step={0.05}
          value={currentWeight}
          onChange={(e) => onWeightChange(Number(e.target.value))}
          onPointerUp={() => trackEvent('rule_weight_change', { rule: rule.id, weight: currentWeight })}
          className="flex-1 h-1 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-none
            [&::-webkit-slider-thumb]:shadow-md"
          style={{
            background: `linear-gradient(to right, ${isModified ? '#f59e0b' : '#64748b'} ${(currentWeight / 1.5) * 100}%, rgba(100,116,139,0.2) ${(currentWeight / 1.5) * 100}%)`,
          }}
          aria-label={`${sourceLabel} → ${targetLabel} 가중치 조절`}
        />
        <span className={`text-xs font-mono w-8 text-right ${isModified ? 'text-amber-400' : 'text-slate-300'}`}>
          {currentWeight.toFixed(2)}
        </span>
        {isModified && (
          <>
            <span className="text-[10px] text-slate-600">
              기본: {rule.weight.toFixed(2)}
            </span>
            <button
              type="button"
              onClick={() => { onReset(); trackEvent('rule_reset', { rule: rule.id }); }}
              className="text-slate-500 hover:text-amber-400 transition-colors cursor-pointer text-xs"
              title="기본값으로 복원"
              aria-label={`${rule.id} 기본값 복원`}
            >
              ↩
            </button>
          </>
        )}
      </div>
    </div>
  );
}
