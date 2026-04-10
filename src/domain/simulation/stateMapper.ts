import {
  STATE_THRESHOLDS,
  DEFAULT_DISPLAY_STATE,
  DEFAULT_INTENSITY,
  MAX_INTENSITY,
} from './config';

export function deltaToDisplayState(delta: number): string {
  for (const t of STATE_THRESHOLDS) {
    if (delta >= t.min) return t.label;
  }
  return DEFAULT_DISPLAY_STATE;
}

export function deltaToIntensity(delta: number): number {
  for (const t of STATE_THRESHOLDS) {
    if (delta >= t.min) return t.intensity;
  }
  return DEFAULT_INTENSITY;
}

export function intensityToStrength(intensity: number): number {
  return Math.min(Math.abs(intensity) / MAX_INTENSITY, 1);
}
