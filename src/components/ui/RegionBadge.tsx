import type { Region } from '../../domain/types';
import { regionColors } from '../../styles/tokens';

interface RegionBadgeProps {
  region: Region;
  size?: 'sm' | 'md';
}

export function RegionBadge({ region, size = 'sm' }: RegionBadgeProps) {
  const color = regionColors[region];
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 ${textSize} font-medium`}
      style={{
        backgroundColor: color.bg,
        color: color.primary,
        border: `1px solid ${color.border}`,
      }}
    >
      <span
        className={`${dotSize} rounded-full`}
        style={{ backgroundColor: color.primary }}
      />
      {color.label}
    </span>
  );
}
