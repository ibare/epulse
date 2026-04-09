import { useSimulationStore } from '../../store/simulationStore';

interface HeaderProps {
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
}

export function Header({ onToggleLeft, onToggleRight }: HeaderProps) {
  const colorScheme = useSimulationStore((s) => s.colorScheme);
  const toggleColorScheme = useSimulationStore((s) => s.toggleColorScheme);

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
        <span className="text-[10px] text-slate-600">
          학습 도구 · 투자 예측 아님
        </span>
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
