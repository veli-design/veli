## 0.6.0

### Changed

- Official-banner language control shows the other language as a direct caption-medium text switch (no caret or dropdown), matching the gov.mv two-language Figma. The banner control renders only when exactly two languages are supplied.

## 0.5.0

### Changed

- Require Veli UI 0.16.0 or later in the 0.16 line and tokens 0.9.1 or later in the 0.9 line for the complete eight-block CLI installation and current Search usage. Applications using older UI versions must upgrade before adding or updating this block. Validated with UI 0.16.0 and tokens 0.9.1 release candidates; repeat a clean registry install after publication.

## 0.4.5

### Fixed

- Align the official banner expanded panel with Figma: Body/md strong copy, 24px header-to-details gap, primary/accent detail icons, and a bottom subtle divider.

## 0.4.4

### Fixed

- Match ministry logo-trigger spacing and title type to Figma: 12/16px gaps, caption on small screens and Body/md at 242px on desktop.
- Use teal-500 for the “You are here” tile ring, add the idle tile subtle border, set the info-panel title to default text color, and tighten the switcher content gap/padding to 16px.

## 0.4.3

### Fixed

- Align the app-switcher trigger caret to the wordmark x-height (not the full glyph box), so descenders like in gov.mv do not pull the caret low.

## 0.4.2

### Fixed

- Vertically center the app-switcher trigger caret with the logo instead of using floating-only optical offsets.

## 0.4.1

### Fixed

- Clear `switcherRendered` after the collapse duration even when the surface never emits `transitionend`, so host shells can restore notices in headless browsers.

## 0.4.0

### Added

- Optional `onOverlayChange` reports switcher open/rendered and mobile-menu visibility so a page shell can fade chrome and hide notices.
- Optional ref handle with `closeOverlays()` and `focusLogo()` for host adapters that coordinate search and other overlays.

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
