import type { Scenario } from '../../domain/types';

interface PresetButtonProps {
  scenario: Scenario;
  isActive: boolean;
  onClick: () => void;
}

export function PresetButton({ scenario, isActive, onClick }: PresetButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full h-8 px-3 rounded-md text-xs font-medium
        transition-all duration-150 cursor-pointer
        border backdrop-blur-sm
        ${
          isActive
            ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
            : 'border-white/[0.06] bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-slate-300'
        }
      `}
      title={scenario.description}
    >
      {scenario.label}
    </button>
  );
}
