import { describe, it, expect } from 'vitest';
import { checkContradictions } from '../contradictions';

function makeValues(overrides: Record<string, number> = {}): Record<string, number> {
  return {
    kr_inflation: 50,
    kr_rate: 50,
    us_inflation: 50,
    us_rate: 50,
    kr_growth: 50,
    oil: 50,
    usdkrw: 50,
    risk: 50,
    ...overrides,
  };
}

function makePinned(...ids: string[]): Set<string> {
  return new Set(ids);
}

describe('checkContradictions', () => {
  it('모든 값이 정상이면 경고 없음', () => {
    const warnings = checkContradictions(
      makeValues(),
      makePinned('kr_inflation', 'kr_rate', 'us_inflation', 'us_rate', 'kr_growth', 'oil', 'usdkrw', 'risk'),
    );
    expect(warnings).toHaveLength(0);
  });

  describe('c01: 한국 물가↑ + 금리↓', () => {
    it('조건 충족 + 둘 다 pinned → 경고 발생', () => {
      const warnings = checkContradictions(
        makeValues({ kr_inflation: 70, kr_rate: 30 }),
        makePinned('kr_inflation', 'kr_rate'),
      );
      expect(warnings).toHaveLength(1);
      expect(warnings[0].id).toBe('c01');
      expect(warnings[0].severity).toBe('critical');
    });

    it('경계값: kr_inflation=65, kr_rate=40 → 경고 발생', () => {
      const warnings = checkContradictions(
        makeValues({ kr_inflation: 65, kr_rate: 40 }),
        makePinned('kr_inflation', 'kr_rate'),
      );
      expect(warnings.some((w) => w.id === 'c01')).toBe(true);
    });

    it('경계 미달: kr_inflation=64 → 경고 없음', () => {
      const warnings = checkContradictions(
        makeValues({ kr_inflation: 64, kr_rate: 30 }),
        makePinned('kr_inflation', 'kr_rate'),
      );
      expect(warnings.some((w) => w.id === 'c01')).toBe(false);
    });

    it('하나만 pinned → 경고 없음', () => {
      const warnings = checkContradictions(
        makeValues({ kr_inflation: 70, kr_rate: 30 }),
        makePinned('kr_inflation'),
      );
      expect(warnings).toHaveLength(0);
    });
  });

  describe('c02: 미국 물가↑ + 금리↓', () => {
    it('조건 충족 시 경고 발생', () => {
      const warnings = checkContradictions(
        makeValues({ us_inflation: 70, us_rate: 40 }),
        makePinned('us_inflation', 'us_rate'),
      );
      expect(warnings.some((w) => w.id === 'c02')).toBe(true);
    });
  });

  describe('c03: 성장↑ + 물가↓', () => {
    it('조건 충족 시 warning 발생', () => {
      const warnings = checkContradictions(
        makeValues({ kr_growth: 75, kr_inflation: 30 }),
        makePinned('kr_growth', 'kr_inflation'),
      );
      const w = warnings.find((w) => w.id === 'c03');
      expect(w).toBeDefined();
      expect(w!.severity).toBe('warning');
    });
  });

  describe('c05: 미국 금리↑ + 원화 강세', () => {
    it('조건 충족 시 critical', () => {
      const warnings = checkContradictions(
        makeValues({ us_rate: 80, usdkrw: 30 }),
        makePinned('us_rate', 'usdkrw'),
      );
      const w = warnings.find((w) => w.id === 'c05');
      expect(w).toBeDefined();
      expect(w!.severity).toBe('critical');
    });
  });

  describe('c06: 위험↓ + 원화 약세', () => {
    it('조건 충족 시 warning', () => {
      const warnings = checkContradictions(
        makeValues({ risk: 15, usdkrw: 75 }),
        makePinned('risk', 'usdkrw'),
      );
      const w = warnings.find((w) => w.id === 'c06');
      expect(w).toBeDefined();
      expect(w!.severity).toBe('warning');
    });
  });

  it('pinned가 비어있으면 경고 없음', () => {
    const warnings = checkContradictions(
      makeValues({ kr_inflation: 100, kr_rate: 0 }),
      new Set<string>(),
    );
    expect(warnings).toHaveLength(0);
  });
});
