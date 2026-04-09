import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { RealismWarning } from '../../domain/types';

interface Props {
  warnings: RealismWarning[];
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

export function WarningBubble({ warnings, anchorRef }: Props) {
  const [top, setTop] = useState<number | null>(null);
  const rafRef = useRef(0);

  useLayoutEffect(() => {
    const tick = () => {
      const el = anchorRef.current;
      const sidebar = el?.closest('aside');
      if (!el || !sidebar) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const elRect = el.getBoundingClientRect();
      const sidebarRect = sidebar.getBoundingClientRect();

      // 슬라이더가 사이드바 뷰포트 밖이면 숨기기
      if (elRect.bottom < sidebarRect.top || elRect.top > sidebarRect.bottom) {
        setTop((prev) => (prev === null ? prev : null));
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // 사이드바 기준 상대 Y 좌표
      const newTop = Math.round(elRect.top - sidebarRect.top + elRect.height / 2);

      setTop((prev) => (prev === newTop ? prev : newTop));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [anchorRef]);

  if (top === null) return null;

  const sidebar = anchorRef.current?.closest('aside');
  if (!sidebar) return null;

  const isCritical = warnings.some((w) => w.severity === 'critical');
  const borderColor = isCritical ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)';
  const bgColor = isCritical ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)';
  const textColor = isCritical ? 'rgba(239,68,68,0.9)' : 'rgba(245,158,11,0.9)';

  return createPortal(
    <div
      className="pointer-events-none"
      style={{
        position: 'absolute',
        top,
        left: '100%',
        paddingLeft: 12,
        transform: 'translateY(-50%)',
        zIndex: 50,
        width: 'max-content',
        maxWidth: 280,
      }}
    >
      {/* 왼쪽 화살표 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderRight: `6px solid ${borderColor}`,
        }}
      />
      <div
        className="rounded-lg backdrop-blur-sm"
        style={{
          backgroundColor: bgColor,
          border: `1px solid ${borderColor}`,
          color: textColor,
          padding: '8px 12px',
          fontSize: 11,
          lineHeight: 1.5,
        }}
      >
        {warnings.map((w, i) => (
          <p key={w.id} className={i > 0 ? 'mt-1.5 border-t border-white/5 pt-1.5' : ''}>
            {w.message}
          </p>
        ))}
      </div>
    </div>,
    sidebar,
  );
}
