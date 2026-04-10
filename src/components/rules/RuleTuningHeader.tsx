import { useNavigate } from 'react-router-dom';
import { useRuleTuningStore } from '../../store/ruleTuningStore';
import { useSimulationStore } from '../../store/simulationStore';
import { RULESET_VERSION } from '../../domain/rules';

export function RuleTuningHeader() {
  const navigate = useNavigate();
  const overrides = useRuleTuningStore((s) => s.overrides);
  const resetAll = useRuleTuningStore((s) => s.resetAll);
  const recompute = useSimulationStore((s) => s.recompute);

  const modifiedCount = Object.keys(overrides).length;

  const handleBack = () => {
    recompute();
    navigate('/');
  };

  const handleResetAll = () => {
    resetAll();
  };

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-800/50 px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="cursor-pointer text-slate-400 hover:text-slate-200 transition-colors text-sm"
          aria-label="메인 화면으로 돌아가기"
        >
          ← 돌아가기
        </button>
        <div className="h-4 w-px bg-slate-700" />
        <h1 className="text-base font-bold tracking-tight text-slate-100">
          <span className="text-emerald-400">e</span>Pulse
        </h1>
        <span className="text-xs text-slate-400">모델 파라미터</span>
        <span className="rounded border border-slate-700 bg-slate-800/50 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
          v{RULESET_VERSION}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {modifiedCount > 0 && (
          <span className="text-[11px] text-amber-400">
            {modifiedCount}개 수정됨
          </span>
        )}
        <button
          type="button"
          onClick={handleResetAll}
          disabled={modifiedCount === 0}
          className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1
            text-xs text-slate-400 transition-all duration-150 cursor-pointer
            hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400
            disabled:opacity-30 disabled:cursor-default disabled:hover:border-white/[0.06]
            disabled:hover:bg-white/[0.03] disabled:hover:text-slate-400"
        >
          모두 기본값 복원
        </button>
      </div>
    </header>
  );
}
