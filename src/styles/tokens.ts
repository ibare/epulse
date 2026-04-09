import type { Region } from '../domain/types';

export const regionColors: Record<Region, {
  primary: string;
  bg: string;
  border: string;
  label: string;
}> = {
  KR: {
    primary: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.3)',
    label: 'KR',
  },
  US: {
    primary: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.3)',
    label: 'US',
  },
  EU: {
    primary: '#a855f7',
    bg: 'rgba(168,85,247,0.1)',
    border: 'rgba(168,85,247,0.3)',
    label: 'EU',
  },
  GL: {
    primary: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
    label: 'GL',
  },
};

export const stateColors = {
  positive: '#10b981',
  negative: '#f43f5e',
  neutral: '#64748b',
} as const;
