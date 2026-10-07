## 0.1.0

### Added

- Experimental site header with official-website banner, scroll-aware floating pill, language menu, theme segmented control, mobile navigation, and an embedded app switcher with type-to-search.
- Optional switcher tile `badge: 'signin'` corner mark for destinations that require authentication.

### Fixed

- Site-tile and info-panel glow fallbacks include dark-mode values matching the gov.mv reference. Light and dark layers use `.dark` / `dark:` so the sidebar glow tracks document theme (including Storybook) without reading `useVeliColorScheme`.
- Floating header hide/show easing uses the block’s ease-out curve instead of Veli’s `--ease-out` token.
