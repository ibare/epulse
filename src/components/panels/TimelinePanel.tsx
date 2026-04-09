/** 시뮬레이션 결과의 시간대별 타임라인 + 예외 + 노드 상세를 표시하는 우측 패널 */

import type { TimelineItem } from '../../domain/types';
import { useSimulationStore } from '../../store/simulationStore';
import { RegionBadge } from '../ui/RegionBadge';
import { IntensityDots } from '../ui/IntensityDots';
import { deltaToArrow } from '../../utils/formatters';
import { ExceptionCard } from './ExceptionCard';
import { NodeDetailPanel } from './NodeDetailPanel';

/** 시간 구간 정의 */
const SECTIONS = [
  { key: 'immediate', title: '즉시 반응', subtitle: '수시간~수일' },
  { key: 'short', title: '단기 반응', subtitle: '수주~수개월' },
  { key: 'medium', title: '중기 반응', subtitle: '수개월~1년' },
] as const;

/** 개별 타임라인 항목 렌더링 */
function TimelineEntry({ item }: { item: TimelineItem }) {
  const deltaColor = item.delta > 0
    ? 'text-emerald-400'
    : item.delta < 0
      ? 'text-rose-400'
      : 'text-slate-400';

  return (
    <div className="space-y-1.5 py-2">
      {/* 변수 라벨 + 지역 배지 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-300">
          {item.label}
        </span>
        <RegionBadge region={item.region} />
      </div>

      {/* 상태 + 방향 화살표 + 강도 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-300">{item.displayState}</span>
        <span className={`text-xs font-semibold ${deltaColor}`}>
          {deltaToArrow(item.delta)}
        </span>
        <IntensityDots intensity={item.delta > 0 ? Math.min(Math.ceil(Math.abs(item.delta) / 5), 3) : item.delta < 0 ? -Math.min(Math.ceil(Math.abs(item.delta) / 5), 3) : 0} />
      </div>

      {/* 인과 설명 */}
      <p className="text-xs leading-relaxed text-slate-400">
        {item.explanation}
      </p>

      {/* 항목별 예외 사항 */}
      {item.exceptions.length > 0 && (
        <div className="mt-1 space-y-1">
          {item.exceptions.map((ex, i) => (
            <ExceptionCard key={i} text={ex} />
          ))}
        </div>
      )}
    </div>
  );
}

/** 시간 구간 섹션 렌더링 */
function TimelineSection({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: TimelineItem[];
}) {
  return (
    <div className="space-y-2">
      {/* 구간 제목 */}
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
        <span className="ml-1.5 font-normal normal-case tracking-normal text-slate-600">
          ({subtitle})
        </span>
      </h3>

      {items.length === 0 ? (
        <p className="py-2 text-xs text-slate-600">변화 없음</p>
      ) : (
        <div className="divide-y divide-slate-800/50">
          {items.map((item) => (
            <TimelineEntry key={item.variableId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TimelinePanel() {
  const result = useSimulationStore((s) => s.result);

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
      {/* 시나리오 요약 */}
      <div
        className="rounded-lg px-4 py-3"
        style={{ backgroundColor: 'rgba(30,41,59,0.4)' }}
      >
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          현재 시나리오 요약
        </h3>
        <p className="text-sm leading-relaxed text-slate-300">
          {result.summary}
        </p>
      </div>

      {/* 시간대별 타임라인 섹션 */}
      {SECTIONS.map((section) => (
        <TimelineSection
          key={section.key}
          title={section.title}
          subtitle={section.subtitle}
          items={result.timeline[section.key]}
        />
      ))}

      {/* 예외/주의 포인트 */}
      {result.exceptions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            예외/주의 포인트
          </h3>
          <div className="space-y-1.5">
            {result.exceptions.map((ex) => (
              <ExceptionCard key={ex.ruleId} text={ex.text} />
            ))}
          </div>
        </div>
      )}

      {/* 노드 상세 패널 */}
      <NodeDetailPanel />
    </div>
  );
}
