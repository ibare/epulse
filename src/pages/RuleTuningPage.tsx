import { useMemo } from 'react';
import { rules } from '../domain/rules';
import { variableMap } from '../domain/nodes';
import { RuleTuningHeader } from '../components/rules/RuleTuningHeader';
import { RuleGroup } from '../components/rules/RuleGroup';
import { Footer } from '../components/layout/Footer';
import type { CausalRule, Region } from '../domain/types';

interface SourceGroup {
  sourceId: string;
  sourceLabel: string;
  sourceRegion: Region;
  rules: CausalRule[];
}

export function RuleTuningPage() {
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
    <div className="flex h-screen flex-col bg-surface-primary">
      <RuleTuningHeader />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-2">
          <p className="text-[11px] text-slate-500 mb-4">
            각 규칙의 가중치(weight)를 조절하여 변수 간 영향력을 튜닝할 수 있습니다.
            수정된 값은 자동으로 저장되며 시뮬레이션에 즉시 반영됩니다.
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
      </main>
      <Footer />
    </div>
  );
}
