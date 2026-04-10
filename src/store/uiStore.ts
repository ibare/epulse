import { create } from 'zustand';

export type ColorScheme = 'international' | 'korean';

interface UIState {
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  colorScheme: ColorScheme;
  selectNode: (nodeId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
  toggleColorScheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedNodeId: null,
  hoveredNodeId: null,
  colorScheme: (() => {
    try {
      return (localStorage.getItem('epulse_color_scheme') as ColorScheme) ?? 'international';
    } catch {
      return 'international' as ColorScheme;
    }
  })(),

  selectNode: (nodeId) =>
    set({ selectedNodeId: nodeId }),

  hoverNode: (nodeId) =>
    set({ hoveredNodeId: nodeId }),

  toggleColorScheme: () =>
    set((state) => {
      const next = state.colorScheme === 'international' ? 'korean' : 'international';
      try {
        localStorage.setItem('epulse_color_scheme', next);
      } catch (error) {
        console.warn('[epulse] localStorage 저장 실패:', error);
      }
      return { colorScheme: next };
    }),
}));
