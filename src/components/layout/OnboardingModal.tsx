import { useState, useEffect } from 'react';

const STORAGE_KEY = 'epulse_onboarding_seen';

export function OnboardingModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setIsVisible(true);
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // localStorage 접근 불가 시 무시
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="mx-4 max-w-md rounded-2xl border border-slate-700/50 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
        <h2 className="mb-3 text-lg font-bold text-slate-100">
          경제 인과관계 학습 시뮬레이터
        </h2>

        <p className="mb-4 text-sm leading-relaxed text-slate-300">
          이 시뮬레이터는 거시경제 변수 간의 인과관계를 직관적으로 학습하기 위한
          도구입니다. 실제 시장의 움직임은 여기에 표현된 것보다 훨씬 복잡하며,
          이 도구의 출력은 투자 의사결정에 사용하기 위한 것이 아닙니다.
        </p>

        <p className="mb-6 text-sm leading-relaxed text-slate-400">
          좌측 패널에서 경제 변수를 조절하거나 프리셋 시나리오를 선택하면,
          중앙 맵에서 인과관계가 시각적으로 반응합니다.
        </p>

        <button
          type="button"
          onClick={handleClose}
          className="w-full cursor-pointer rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
