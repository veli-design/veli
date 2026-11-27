import { useCallback, useSyncExternalStore } from 'react';

/** Header actions move into the bar at this width (`sm`) and out of the mobile menu. */
export const ACTIONS_IN_BAR_QUERY = '(min-width: 640px)';

/** Subscribes to a media query and returns whether it currently matches. */
export function useMinWidthMatch(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
