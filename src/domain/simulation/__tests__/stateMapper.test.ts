import { describe, it, expect } from 'vitest';
import {
  deltaToDisplayState,
  deltaToIntensity,
  intensityToStrength,
} from '../stateMapper';

describe('deltaToDisplayState', () => {
  it.each([
    [30, '강한 상승 압력'],
    [26, '강한 상승 압력'],
    [25, '상승 압력'],
    [11, '상승 압력'],
    [10, '약한 상승 압력'],
    [4, '약한 상승 압력'],
    [3, '중립'],
    [0, '중립'],
    [-3, '중립'],
    [-4, '약한 하락 압력'],
    [-10, '약한 하락 압력'],
    [-11, '하락 압력'],
    [-25, '하락 압력'],
    [-26, '강한 하락 압력'],
    [-50, '강한 하락 압력'],
  ])('delta %d → %s', (delta, expected) => {
    expect(deltaToDisplayState(delta)).toBe(expected);
  });
});

describe('deltaToIntensity', () => {
  it.each([
    [30, 3],
    [26, 3],
    [25, 2],
    [11, 2],
    [10, 1],
    [4, 1],
    [0, 0],
    [-3, 0],
    [-4, -1],
    [-10, -1],
    [-11, -2],
    [-25, -2],
    [-26, -3],
  ])('delta %d → intensity %d', (delta, expected) => {
    expect(deltaToIntensity(delta)).toBe(expected);
  });
});

describe('intensityToStrength', () => {
  it('intensity 0 → strength 0', () => {
    expect(intensityToStrength(0)).toBe(0);
  });

  it('intensity 3 → strength 1', () => {
    expect(intensityToStrength(3)).toBe(1);
  });

  it('intensity -3 → strength 1', () => {
    expect(intensityToStrength(-3)).toBe(1);
  });

  it('intensity 1 → strength 1/3', () => {
    expect(intensityToStrength(1)).toBeCloseTo(1 / 3);
  });

  it('intensity 5 → strength 1 (clamped)', () => {
    expect(intensityToStrength(5)).toBe(1);
  });
});
