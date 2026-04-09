declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, string | number>) => void;
    };
  }
}

export function trackEvent(name: string, data?: Record<string, string | number>) {
  window.umami?.track(name, data);
}
