import { INTENSITY_THRESHOLD } from '../domain/simulation/config';

export function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta.toFixed(0)}`;
  if (delta < 0) return delta.toFixed(0);
  return '0';
}

export function deltaToArrow(delta: number): string {
  if (delta >= INTENSITY_THRESHOLD) return '↑';
  if (delta <= -INTENSITY_THRESHOLD) return '↓';
  return '→';
}
