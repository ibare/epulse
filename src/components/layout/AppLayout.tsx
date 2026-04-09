import { useState, type ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { OnboardingModal } from './OnboardingModal';

interface AppLayoutProps {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}

export function AppLayout({ left, center, right }: AppLayoutProps) {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  return (
    <div className="flex h-full flex-col bg-surface-primary">
      <OnboardingModal />
      <Header
        onToggleLeft={() => { setShowLeft(!showLeft); setShowRight(false); }}
        onToggleRight={() => { setShowRight(!showRight); setShowLeft(false); }}
      />
      <div className="relative flex min-h-0 flex-1">
        {/* 좌측 조작 패널 - 데스크톱 */}
        <aside className="hidden w-[270px] shrink-0 overflow-y-auto border-r border-slate-800/50 p-3 lg:block">
          {left}
        </aside>

        {/* 좌측 조작 패널 - 모바일 오버레이 */}
        {showLeft && (
          <aside className="absolute inset-y-0 left-0 z-40 w-[280px] overflow-y-auto border-r border-slate-800/50 bg-surface-primary p-3 lg:hidden">
            {left}
          </aside>
        )}

        {/* 중앙 인과관계 맵 */}
        <main className="min-w-0 flex-1">
          {center}
        </main>

        {/* 우측 타임라인 패널 - 데스크톱 */}
        <aside className="hidden w-[290px] shrink-0 overflow-y-auto border-l border-slate-800/50 p-3 lg:block">
          {right}
        </aside>

        {/* 우측 타임라인 패널 - 모바일 오버레이 */}
        {showRight && (
          <aside className="absolute inset-y-0 right-0 z-40 w-[300px] overflow-y-auto border-l border-slate-800/50 bg-surface-primary p-3 lg:hidden">
            {right}
          </aside>
        )}
      </div>
      <Footer />
    </div>
  );
}
