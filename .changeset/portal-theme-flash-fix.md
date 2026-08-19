---
'@tradenetcorp/veli-ui': minor
---

### Fixed

- `VeliProvider` syncs the resolved color scheme (`.dark` class, `data-theme`, `color-scheme`) to `document.documentElement` so portaled components — modals, popovers, tooltips, menus — inherit dark mode tokens.
- Stored and system dark preferences no longer flash white on load. A parser-blocking inline script applies the theme before first paint, and document sync reads `localStorage` / `matchMedia` in `useLayoutEffect` instead of the SSR `light` snapshot.

### Added

- `VeliProvider` accepts a `disableTransitionOnChange` prop (default `false`) that suppresses CSS transitions for one frame while the theme changes.
- `getVeliThemeScript(storageKey?)` and `VELI_COLOR_SCHEME_STORAGE_KEY` are exported from `@tradenetcorp/veli-ui/theme-script` for apps that need the blocking script in `<head>` because `VeliProvider` is not the first body child.
