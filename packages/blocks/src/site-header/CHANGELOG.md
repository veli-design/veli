## 0.3.1

### Fixed

- Use Search’s `appearance` prop in the app switcher for compatibility with Veli UI 0.15.

## 0.3.0

### Changed

- Reference canonical Veli CSS variables. Require tokens 0.9 and UI 0.15 for the unified token architecture. Restore app-switcher focus independently of transition completion.

## 0.2.0

### Added

- Optional switcher tile `badge: 'signin'` corner mark for destinations that require authentication.

### Fixed

- Site-tile and info-panel glow fallbacks include dark-mode values matching the gov.mv reference. Light and dark layers use `.dark` / `dark:` so the sidebar glow tracks document theme (including Storybook) without reading `useVeliColorScheme`.
- Floating header hide/show easing uses the block’s ease-out curve instead of Veli’s `--ease-out` token.

### Changed

- Documented `--veli-header-*` CSS variables with aliases from the older gov.mv names (`--ease-drawer`, `--site-tile-gradient`, `--info-panel-glow`).
- Raised the tested Veli UI / tokens baseline to `0.13.0` / `0.7.1`.

## 0.1.0

### Added

- Experimental site header with official-website banner, scroll-aware floating pill, language menu, theme segmented control, mobile navigation, and an embedded app switcher with type-to-search.
