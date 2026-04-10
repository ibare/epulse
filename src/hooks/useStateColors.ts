import { useUIStore } from '../store/uiStore';

const colorSets = {
  international: {
    positive: '#10b981',
    negative: '#f43f5e',
    neutral: '#64748b',
  },
  korean: {
    positive: '#ef4444',
    negative: '#3b82f6',
    neutral: '#64748b',
  },
} as const;

export type StateColors = (typeof colorSets)[keyof typeof colorSets];

export function useStateColors(): StateColors {
  const colorScheme = useUIStore((s) => s.colorScheme);
  return colorSets[colorScheme];
}
