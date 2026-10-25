import { useCallback, useSyncExternalStore } from 'react';

/**
 * Hydration-safe media query: the server snapshot is `false`, so the first
 * client render matches the HTML and React re-renders afterwards.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
