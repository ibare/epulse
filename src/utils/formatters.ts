export function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta.toFixed(0)}`;
  if (delta < 0) return delta.toFixed(0);
  return '0';
}

export function deltaToArrow(delta: number): string {
  if (delta >= 4) return '↑';
  if (delta <= -4) return '↓';
  return '→';
}
