export function deltaToDisplayState(delta: number): string {
  if (delta >= 26) return '강한 상승 압력';
  if (delta >= 11) return '상승 압력';
  if (delta >= 4) return '약한 상승 압력';
  if (delta >= -3) return '중립';
  if (delta >= -10) return '약한 하락 압력';
  if (delta >= -25) return '하락 압력';
  return '강한 하락 압력';
}

export function deltaToIntensity(delta: number): number {
  if (delta >= 26) return 3;
  if (delta >= 11) return 2;
  if (delta >= 4) return 1;
  if (delta >= -3) return 0;
  if (delta >= -10) return -1;
  if (delta >= -25) return -2;
  return -3;
}

export function intensityToStrength(intensity: number): number {
  return Math.min(Math.abs(intensity) / 3, 1);
}
