export const VELI_COLOR_SCHEME_STORAGE_KEY = 'veli-color-scheme';

/**
 * Free function (no closure) so it can be stringified into a parser-blocking
 * inline script, the same way next-themes stringifies its theme init.
 */
function applyVeliTheme(storageKey: string) {
  const root = document.documentElement;
  try {
    const stored = localStorage.getItem(storageKey);
    const isDark =
      stored === 'dark' ||
      (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const theme = isDark ? 'dark' : 'light';
    root.classList.toggle('dark', isDark);
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
  } catch {
    // localStorage or matchMedia can throw in restricted contexts
  }
}

/** Inline script for `<head>` when `VeliProvider` is not the first body child. */
export function getVeliThemeScript(storageKey = VELI_COLOR_SCHEME_STORAGE_KEY): string {
  return `(${applyVeliTheme.toString()})(${JSON.stringify(storageKey)})`;
}
