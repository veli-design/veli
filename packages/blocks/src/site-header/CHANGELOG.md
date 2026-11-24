## 0.13.0

### Added

- Add `scrollToViewMore`. The app switcher shows that control at the bottom of the card while the list is at the top and more tiles sit below. Choosing it scrolls the card by 60% of the visible height.
- Add a search empty state with the stacked tile illustration, title, and `searchEmptyHint` copy when a query matches nothing. The illustration uses brand neutral and surface-raised tokens from the Figma frame.

### Changed

- Show every app and site in one scrolling grid. Apps only and Sites only keep that grid and a result line such as "Showing all Sites: 17 results". Tiles stay 165px wide from 600px up and use two columns below that. Names wrap instead of truncating.
- Let the entity name wrap inside 320px, and let the header bar grow with that name. Desktop navigation shows from 1121px. The mobile menu is used at 1120px and below.
- Fade the top and bottom edges of the scrolling card. The bottom fade is 96px behind the scroll control and 32px at 60% opacity after that control hides.

### Fixed

- Match the docked nav bar to the Figma frame: 32px page inset, 32px/40px logo-to-nav gap, body-sm title below 1121px, and regular-weight switcher/menu icons.
- Use the filled Bank and LockSimple icons in the official-website banner details, matching the directory frame.
- Hold the search result line at the top of the card when a new query resets the scroll position.
- Match the desktop directory frame. Tile names wrap in a 133px box, the "You are here" pill hugs its label, and five 165px tiles in the 920px card keep a 24px gutter. A divider separates Apps and Sites. The current tile's ring sits outside the icon, with a 2px gap and a 5px teal stroke. The info card icon is 88px, and its light fallback fade is a linear green wash that ends at 32.5% of the card height.

### Removed

- Remove View more, View less, and the list layout for filtered apps and sites. Pass `scrollToViewMore` instead of `viewMore` and `viewLess`.

## 0.12.2

### Fixed

- Refresh the exact tested dependency baseline to Veli React 0.20.2. Copied source, supported dependency ranges and previous block archives are unchanged.

## 0.12.1

### Fixed

- Refresh the exact tested dependency baseline to Veli React 0.20.1 and tokens 0.11.1 for the repository-transfer metadata release. Copied source and supported dependency ranges are unchanged; previous block archives retain their existing baselines.

## 0.12.0

### Changed

- Require Veli React ^0.20.0 and record the exact 0.20.0 candidate baseline. The copied-source rendering API and token baseline are unchanged; previous block archives retain their existing requirements.

## 0.11.1

### Fixed

- Keep the filter menu's keyboard controls available when React Aria renders its trigger with `aria-haspopup="true"`.

## 0.11.0

### Added

- Filter the app switcher with Show all, Apps only, or Sites only. Show all keeps the grid. Apps only and Sites only switch to a list, with a result count and a dot on the filter when a subset is active.
- Move through the visible apps and sites with the arrow keys and open the highlighted item with Enter. The highlight uses the hover treatment. Apps and sites render as a React Aria listbox (grid for Show all, stack for Apps only and Sites only).

### Changed

- Supply `showAll`, `appsOnly`, `sitesOnly`, `showingApps`, and `showingSites` on switcher labels. Sites stay in the order the application provides.

## 0.10.0

### Changed

- Require Veli React ^0.19.0 and record the exact 0.19.0 candidate baseline. The copied-source rendering API and token baseline are unchanged; previous block archives retain their existing requirements.

## 0.9.0

### Changed

- Support the verified public package baseline: @veli-design/react@^0.18.0, react-aria-components@^1.22.0, @veli-design/tokens@^0.11.0. The copied-source rendering API is unchanged.

## 0.8.0

### Changed

- Use the public @veli-design React and tokens package names. Migrate application and copied source imports together.

## 0.7.0

### Changed

- Official-banner language control shows the other language as a direct caption-medium text switch (no caret or dropdown), matching the gov.mv two-language Figma. The banner control renders only when exactly two languages are supplied.

## 0.6.0

### Changed

- Adopt Veli UI 0.17.x and tokens 0.10.x as the supported core package baseline. Upgrade the applicable core packages together before adding or updating this copied block; earlier block versions retain their previous dependency contracts.
- Record the tested core candidate versions for the bilingual typography and subtle-button color update. Block APIs and authored source are unchanged.

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
