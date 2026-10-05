## 0.1.0

### Added

- Experimental site header with official-website banner, scroll-aware floating pill, language menu, theme segmented control, mobile navigation, and an embedded app switcher with type-to-search.

### Fixed

- Site-tile and info-panel glow fallbacks now include dark-mode values matching the gov.mv reference, resolved from `useVeliColorScheme` so the sidebar glow tracks dark mode without relying on host CSS alone.
- Floating header hide/show easing uses the block’s ease-out curve instead of Veli’s `--ease-out` token.
