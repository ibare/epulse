import { useMemo } from 'react';
import { rules, RULESET_VERSION } from '../../domain/rules';
import { variableMap } from '../../domain/nodes';
import { useRuleTuningStore } from '../../store/ruleTuningStore';
import { RuleGroup } from './RuleGroup';
import type { CausalRule, Region } from '../../domain/types';

interface SourceGroup {
  sourceId: string;
  sourceLabel: string;
  sourceRegion: Region;
  rules: CausalRule[];
}

interface RuleTuningPanelProps {
  onClose: () => void;
}

export function RuleTuningPanel({ onClose }: RuleTuningPanelProps) {
  const overrides = useRuleTuningStore((s) => s.overrides);
  const resetAll = useRuleTuningStore((s) => s.resetAll);
  const modifiedCount = Object.keys(overrides).length;

  const groups = useMemo(() => {
    const groupMap = new Map<string, SourceGroup>();

    for (const rule of rules) {
      let group = groupMap.get(rule.source);
      if (!group) {
        const variable = variableMap[rule.source];
        group = {
          sourceId: rule.source,
          sourceLabel: variable?.label ?? rule.source,
          sourceRegion: variable?.region ?? 'GL',
          rules: [],
        };
        groupMap.set(rule.source, group);
      }
      group.rules.push(rule);
    }

    return Array.from(groupMap.values());
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* 패널 헤더 */}
      <div className="flex items-center justify-between border-b border-slate-800/50 px-3 py-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-200">모델 파라미터</h2>
          <span className="rounded border border-slate-700 bg-slate-800/50 px-1.5 py-0.5 text-[9px] font-mono text-slate-500">
            v{RULESET_VERSION}
          </span>
          {modifiedCount > 0 && (
            <span className="text-[10px] text-amber-400">{modifiedCount}개 수정됨</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {modifiedCount > 0 && (
            <button
              type="button"
              onClick={resetAll}
              className="rounded px-1.5 py-0.5 text-[10px] text-slate-500
                hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
            >
              전체 복원
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer text-sm leading-none"
            aria-label="패널 닫기"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 패널 본문 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <p className="text-[10px] text-slate-500 mb-2">
          가중치를 조절하면 시뮬레이션에 즉시 반영됩니다.
        </p>
        {groups.map((g) => (
          <RuleGroup
            key={g.sourceId}
            sourceId={g.sourceId}
            sourceLabel={g.sourceLabel}
            sourceRegion={g.sourceRegion}
            rules={g.rules}
          />
        ))}
      </div>
    </div>
  );
}
