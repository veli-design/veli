'use client';
import { useSyncExternalStore } from 'react';
const query = '(max-width: 600px)';
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
/** Hydration-safe shared breakpoint for the toolbar and its overlay surfaces. */
export function useFilterBarMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
