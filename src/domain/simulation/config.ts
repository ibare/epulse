/**
 * 시뮬레이션 엔진 설정 상수
 *
 * 매직 넘버를 한 곳에서 관리하여 동기화 위험을 제거한다.
 */

// ─── 상태 분류 임계값 ──────────────────────────────────
// deltaToDisplayState / deltaToIntensity에서 공유
export const STATE_THRESHOLDS = [
  { min: 26,  label: '강한 상승 압력', intensity: 3 },
  { min: 11,  label: '상승 압력',     intensity: 2 },
  { min: 4,   label: '약한 상승 압력', intensity: 1 },
  { min: -3,  label: '중립',         intensity: 0 },
  { min: -10, label: '약한 하락 압력', intensity: -1 },
  { min: -25, label: '하락 압력',     intensity: -2 },
] as const;

export const DEFAULT_DISPLAY_STATE = '강한 하락 압력';
export const DEFAULT_INTENSITY = -3;

// 시각적 변화 최소 임계값 (|delta| >= 이 값이면 intensity != 0)
export const INTENSITY_THRESHOLD = 4;

// ─── 엣지 활성화 ───────────────────────────────────────
export const EDGE_SIGNAL_THRESHOLD = 1;

// ─── 전파 엔진 ─────────────────────────────────────────
export const DAMPING_FACTOR = 0.7;
export const DAMPING_MIN_DEPTH = 2;
export const MAX_ITERATIONS = 30;
export const DELTA_CLAMP_MIN = -50;
export const DELTA_CLAMP_MAX = 50;

// ─── 강도 정규화 ───────────────────────────────────────
export const MAX_INTENSITY = 3;

// ─── 모순 검사 임계값 ─────────────────────────────────
export const CT_INFLATION_HIGH = 65;       // c01, c02: 물가 과열 기준
export const CT_KR_RATE_LOW = 40;          // c01: 한국 기준금리 저금리 기준
export const CT_US_RATE_LOW = 45;          // c02: 미국 금리 저금리 기준
export const CT_GROWTH_HIGH = 70;          // c03: 경기 과열 기준
export const CT_INFLATION_LOW_GROWTH = 35; // c03: 성장 대비 물가 안정 기준
export const CT_OIL_HIGH = 70;             // c04: 유가 급등 기준
export const CT_INFLATION_LOW_OIL = 40;    // c04: 유가 대비 물가 안정 기준
export const CT_US_RATE_HIGH = 75;         // c05: 미국 고금리 기준
export const CT_USDKRW_LOW = 40;           // c05: 원화 강세 기준
export const CT_RISK_LOW = 20;             // c06: 위험회피 낮음 기준
export const CT_USDKRW_HIGH = 70;          // c06: 원화 약세 기준

// ─── 타임라인 / 요약 ──────────────────────────────────
export const MIN_RULE_PRESSURE = 2;
export const MIN_DELTA_FOR_TIMELINE = 1;
export const SIGNIFICANT_DELTA = 4;
export const TOP_SUMMARY_COUNT = 3;
