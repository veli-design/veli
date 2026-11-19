import { useSyncExternalStore } from 'react';
import type { VeliColorScheme } from '@veli-design/react/provider';

function subscribe(onChange: () => void) {
  window.addEventListener('veli:color-scheme-change', onChange);
  return () => window.removeEventListener('veli:color-scheme-change', onChange);
}

function getSnapshot(): VeliColorScheme {
  const scheme = document.documentElement.dataset.colorScheme;
  return scheme === 'light' || scheme === 'dark' ? scheme : 'system';
}

function getServerSnapshot(): VeliColorScheme {
  return 'system';
}

/** Follows the docs site's theme so previews with their own VeliProvider stay in sync. */
export function useDocsColorScheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
