import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { CausalRule, Region } from '../../domain/types';
import { regionColors } from '../../styles/tokens';
import { useRuleTuningStore } from '../../store/ruleTuningStore';
import { RuleRow } from './RuleRow';

interface RuleGroupProps {
  sourceId: string;
  sourceLabel: string;
  sourceRegion: Region;
  rules: CausalRule[];
}

export function RuleGroup({ sourceLabel, sourceRegion, rules }: RuleGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const overrides = useRuleTuningStore((s) => s.overrides);
  const setWeight = useRuleTuningStore((s) => s.setWeight);
  const resetRule = useRuleTuningStore((s) => s.resetRule);

  const color = regionColors[sourceRegion];
  const modifiedCount = rules.filter((r) => overrides[r.id]).length;

  return (
    <div
      className={`rounded-lg border transition-colors duration-150 ${
        modifiedCount > 0
          ? 'border-amber-500/20'
          : 'border-white/[0.06]'
      }`}
    >
      {/* 아코디언 헤더 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-2.5 cursor-pointer
          hover:bg-white/[0.03] transition-colors duration-150 rounded-lg"
      >
        <div className="flex items-center gap-2">
          {/* Region 배지 */}
          <span
            className="inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold"
            style={{
              backgroundColor: color.bg,
              color: color.primary,
              border: `1px solid ${color.border}`,
            }}
          >
            {color.label}
          </span>
          <span className="text-sm font-medium text-slate-200">{sourceLabel}</span>
          <span className="text-[11px] text-slate-500">{rules.length}개 규칙</span>
          {modifiedCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
              {modifiedCount}개 수정됨
            </span>
          )}
        </div>
        <span className={`text-slate-500 text-xs transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
          ▶
        </span>
      </button>

      {/* 아코디언 본문 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-3 pb-3">
              {rules.map((rule) => (
                <RuleRow
                  key={rule.id}
                  rule={rule}
                  override={overrides[rule.id]}
                  onWeightChange={(weight) => setWeight(rule.id, weight)}
                  onReset={() => resetRule(rule.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
