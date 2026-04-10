/**
 * 입력 변수의 실제 단위 표시 스케일
 *
 * 내부값(0~100)을 실제 경제 단위(%, 원, $ 등)로 변환한다.
 * 변환 공식: displayValue = displayMin + (internalValue / 100) * (displayMax - displayMin)
 */

export interface DisplayScale {
  displayMin: number;
  displayMax: number;
  unit: string;
  precision: number;
  prefix?: string;
  suffix?: string;
  showSign?: boolean;
}

export const displayScales: Record<string, DisplayScale> = {
  kr_growth:     { displayMin: -3,   displayMax: 8,    unit: '%',  precision: 1, suffix: '%', showSign: true },
  kr_inflation:  { displayMin: -1,   displayMax: 5,    unit: '%',  precision: 1, suffix: '%' },
  kr_rate:       { displayMin: 0.5,  displayMax: 5.5,  unit: '%',  precision: 2, suffix: '%' },
  usdkrw:        { displayMin: 800,  displayMax: 1800, unit: '원', precision: 0, suffix: '원' },
  us_growth:     { displayMin: -3,   displayMax: 8,    unit: '%',  precision: 1, suffix: '%', showSign: true },
  us_inflation:  { displayMin: -1,   displayMax: 5,    unit: '%',  precision: 1, suffix: '%' },
  us_rate:       { displayMin: 0,    displayMax: 7,    unit: '%',  precision: 2, suffix: '%' },
  oil:           { displayMin: 20,   displayMax: 160,  unit: '$',  precision: 0, prefix: '$' },
  risk:          { displayMin: 8,    displayMax: 52,   unit: 'VIX', precision: 0 },
};

export function toDisplayValue(variableId: string, internalValue: number): number {
  const scale = displayScales[variableId];
  if (!scale) return internalValue;
  return scale.displayMin + (internalValue / 100) * (scale.displayMax - scale.displayMin);
}

export function formatDisplayValue(variableId: string, internalValue: number): string {
  const scale = displayScales[variableId];
  if (!scale) return String(internalValue);

  const val = toDisplayValue(variableId, internalValue);
  let str: string;

  if (scale.precision === 0) {
    const rounded = Math.round(val);
    str = scale.suffix === '원' ? rounded.toLocaleString('ko-KR') : String(rounded);
  } else {
    str = val.toFixed(scale.precision);
  }

  if (scale.showSign && val > 0) str = '+' + str;
  if (scale.prefix) str = scale.prefix + str;
  if (scale.suffix) str = str + scale.suffix;

  return str;
}

export function formatDisplayDelta(variableId: string, internalDelta: number): string {
  const scale = displayScales[variableId];
  if (!scale) return `${internalDelta > 0 ? '+' : ''}${Math.round(internalDelta)}`;

  const range = scale.displayMax - scale.displayMin;
  const val = (internalDelta / 100) * range;
  const sign = val > 0 ? '+' : '';

  if (scale.precision === 0) {
    const rounded = Math.round(val);
    if (rounded === 0 && internalDelta !== 0) {
      return val > 0 ? '+1' : '-1';
    }
    return `${sign}${rounded}`;
  }
  return `${sign}${val.toFixed(scale.precision)}`;
}
