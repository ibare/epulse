import { useSimulationStore } from '../../store/simulationStore';
import { useRuleTuningStore } from '../../store/ruleTuningStore';

interface HeaderProps {
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
  onToggleRules?: () => void;
}

export function Header({ onToggleLeft, onToggleRight, onToggleRules }: HeaderProps) {
  const colorScheme = useSimulationStore((s) => s.colorScheme);
  const toggleColorScheme = useSimulationStore((s) => s.toggleColorScheme);
  const modifiedCount = useRuleTuningStore((s) => Object.keys(s.overrides).length);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-800/50 px-4">
      <div className="flex items-center gap-3">
        {/* 모바일 좌측 패널 토글 */}
        <button
          type="button"
          onClick={onToggleLeft}
          className="cursor-pointer p-1 text-slate-400 hover:text-slate-200 lg:hidden"
          aria-label="조작 패널 열기/닫기"
        >
          ☰
        </button>
        <h1 className="text-base font-bold tracking-tight text-slate-100">
          <span className="text-emerald-400">e</span>Pulse
        </h1>
        <span className="hidden text-xs text-slate-500 sm:inline">
          경제 인과관계 학습 시뮬레이터
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-[10px] text-slate-600 sm:inline">
          학습 도구 · 투자 예측 아님
        </span>
        {/* 규칙 튜닝 버튼 */}
        <button
          type="button"
          onClick={onToggleRules}
          className="flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.03]
            px-2 py-1 text-[10px] text-slate-400 transition-all duration-150
            hover:border-white/[0.12] hover:text-slate-300 cursor-pointer"
          aria-label="규칙 튜닝 화면 열기"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
            <path d="M9.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM1 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm11 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zM4.5 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM1 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm6 0a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1-.5-.5zm-5 5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1-.5-.5zm12.5-.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-2 1.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5z" />
          </svg>
          <span className="hidden sm:inline">규칙 튜닝</span>
          {modifiedCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-bold min-w-[14px] h-[14px] px-1">
              {modifiedCount}
            </span>
          )}
        </button>
        {/* 색상 스킴 토글 */}
        <button
          type="button"
          onClick={toggleColorScheme}
          className="flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.03]
            px-2 py-1 text-[10px] text-slate-400 transition-all duration-150
            hover:border-white/[0.12] hover:text-slate-300 cursor-pointer"
          aria-label="색상 스킴 전환"
          title={colorScheme === 'korean' ? '한국식: 상승=빨강, 하락=파랑' : '국제식: 상승=초록, 하락=빨강'}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: colorScheme === 'korean' ? '#ef4444' : '#10b981',
            }}
          />
          <span
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: colorScheme === 'korean' ? '#3b82f6' : '#f43f5e',
            }}
          />
          <span className="ml-0.5">
            {colorScheme === 'korean' ? 'KR' : 'INT'}
          </span>
        </button>
        {/* 모바일 우측 패널 토글 */}
        <button
          type="button"
          onClick={onToggleRight}
          className="cursor-pointer p-1 text-slate-400 hover:text-slate-200 lg:hidden"
          aria-label="타임라인 패널 열기/닫기"
        >
          ≡
        </button>
      </div>
    </header>
  );
}
