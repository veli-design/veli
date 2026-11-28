## 0.19.0

### Changed

- Require Veli React ^0.21.0 and record the exact 0.21.0 candidate baseline. The copied-source rendering API and token baseline are unchanged; previous block archives retain their existing requirements.

## 0.18.0

### Added

- Add an optional `search` prop (`SiteHeaderSearchConfig`) that renders a header search trigger button and morphs it along a GPU-composited quadratic-Bézier arc into the gov.mv Figma search dialog (`696×76` pill with `border-primary-emphasis` stroke, `20px` search icon, `type-body-lg-regular` input, and trailing primary-subtle submit arrow button over a dimmed `2px`-blurred backdrop) with a separate `24px`-radius suggestions card (`suggestions` with matched-text emphasis and arrow-key navigation, or custom `renderResults`), optional controlled `open`/`query` state, instant `Cmd/Ctrl+K` & Escape keyboard handling, focus trap & restoration, RTL support, and reduced-motion fades.
- Report `searchOpen` and `searchRendered` in `onOverlayChange` and close the search dialog from `SiteHeaderHandle.closeOverlays()` and when opening the app switcher or mobile menu.

- Place the built-in search action in the mobile menu below 640px. Opening it closes the menu and uses the fallback fade; closing restores focus to the menu button.

## 0.17.1

### Fixed

- Show a focus ring on app switcher tiles when focus arrives by Tab, for example from the Filter button. Arrow-key navigation and hover keep the ring-less highlight.

## 0.17.0

### Added

- Add `mobileActions` for actions inside the mobile menu below 640px. A function receives `{ closeMenu }`. Pass `null` to show no actions in the menu.
- Add `barActions` for compact controls that stay in the header bar at every width, such as signed-in notification and account triggers.

### Changed

- Show `actions` in the header bar from the `sm` breakpoint (640px) up.
- Below 640px, do not render `actions` in the header bar. Render them in the mobile menu while it is open, unless `mobileActions` is set.
- Do not render mobile-menu actions from 640px up, so an open menu does not repeat the bar actions between 640px and 1120px. Each action mounts once.

### Fixed

- Close the mobile menu when a static `actions` or `mobileActions` button or link is activated. The menu stays open for disabled controls, pending controls, and popup triggers. A `mobileActions` function closes the menu only when it calls `closeMenu`.
- Return focus to the menu button when a mobile-menu action closes the menu, so keyboard users keep their place. Focus stays where an action moves it, such as a dialog.
- Keep `layoutSpacerHeight` at the full header height when the mobile menu opens at the top of the page. Page content stays in place.
- Unmount the mobile menu's copy of `actions` as the menu closes when the viewport reaches 640px. Resizing during the close animation no longer shows two copies of an action, so consumer effects and IDs keep a single instance.

## 0.16.0

### Added

- Match app switcher search to the active UI language through host-supplied `searchNames` on each tile. Dhivehi mode searches only the Dhivehi entry and does not fall back to the English `name` when that entry is missing. Intentionally Latin labels shown in Dhivehi (for example `Gov.mv`) remain searchable when listed under the `dv` entry.
- Force Thaana phonetic input while the switcher is in Dhivehi mode, including type-to-search from the dialog surface. Paste still accepts Latin text so intentionally Latin labels can be entered without remapping. Thaana input goes through the browser's editing pipeline, so the caret and native undo history keep working, including when a replacement leaves the value unchanged.

### Changed

- Forward `language` from `SiteHeader` into the app switcher so changing language while the panel is open immediately updates matching rules and keyboard translation.
- Dhivehi result counts put digits before the noun (`13 ނަތީޖާ`, `1 އެޕް އަދި 14 ސައިޓް`). Host `searchSummary` labels must follow this order.

### Migration

- Hosts that show tiles in Dhivehi must add `searchNames.dv` to every app and site that should be discoverable in Dhivehi. A tile without a `dv` entry no longer matches its English name in Dhivehi mode.

## 0.15.0

### Added

- Add a "Skip to main content" link as the first tab stop, before the official-website banner. It is visible only while focused, sits at the inline start edge in LTR and RTL, and is removed from the tab order while the app switcher or mobile menu is open. Pass `labels.skipToMain` and, for a custom target, `skipToMainHref` (default `#main-content`). A standalone host gives its `main` `id="main-content"` and `tabIndex={-1}`.

## 0.14.1

### Fixed

- In RTL, reduce the ministry logo button's vertical padding so a two-line name sits inside the header bar. A one-line name keeps the same button height.

## 0.14.0

### Added

- Add a search empty state with the stacked tile illustration, title, and `searchEmptyHint` copy when a query matches nothing. The illustration uses brand neutral and surface-raised tokens from the Figma frame.

### Changed

- Use two fluid columns below sm and three fluid columns from sm until xl. The xl card keeps 165px tiles. Let the entity name wrap inside 320px, and let the header bar grow with that name. Desktop navigation shows from 1121px. The mobile menu is used at 1120px and below.

### Fixed

- Line the open app switcher logo up with the panel content. While the switcher is open, the logo button shifts left by its start padding so the mark shares the title inset and the hover fill keeps that padding. Below xl that inset is also the search field and the tile grid. The closed bar keeps its logo padding.
- Match switcher app artwork and ministry emblems to the directory frame: site tiles use the soft alpha radial wash with a 36×42 emblem, app tiles render full-bleed icons without a default border, and `kind: 'site'` keeps the site shell when `emblemSrc` is omitted.
- Match the info card glow to the Figma linear green-200 wash that fades out at 32.5% height in light and dark.
- Match the docked nav bar to the Figma frame: 32px page inset, 32px/40px logo-to-nav gap, body-sm title below 1121px, and regular-weight switcher/menu icons.
- Use the filled Bank and LockSimple icons in the official-website banner details, matching the directory frame.
- Hold the search result line at the top of the card when a new query resets the scroll position.
- Match the desktop directory handoff. Tile names wrap in a 141px box, the "You are here" pill hugs its label, and five 165px tiles in the 920px card keep a 24px gutter. A divider separates Apps and Sites. The current tile ring is a 3px primary/700 stroke with no white gap. The Gov.mv info card can use `infoParagraphs` (bold lead-in + body). The info card icon is 88px, and its light fallback fade is a linear green wash that ends at 32.5% of the card height.
- Drop the baked-in white stroke from the Gov.mv demo tile artwork so only the current-app CSS ring draws focus chrome.
- Smooth the app switcher entrance and exit motion: morph the opaque docked header directly into the card on Frame 0 (removing the multi-frame gap), delay the switcher chrome shadow until halfway through entrance, fade expanded official-banner details in place without height/divider clipping across banner or nav content, and return the official banner in lockstep with the switcher closing.
- Use `primary-alpha-200` (teal/alpha/200) for the active desktop nav link background instead of `primary-subtle`.
- Restore search result layout animations for app switcher groups (`layout="position"` + `AnimatePresence`) and `ListBox` tiles (FLIP position glide + fade-in when typing or clearing search).
- Keep a 16px gap above the “No apps match” / “No sites match” divider when search returns only one group, so the last tiles are not flush against that line.
- Clear the desktop info panel when search or filter leaves no navigable tiles, instead of keeping a stale selection preview.
- Remove the border around the apps and sites list below 1280px. The desktop card keeps that border.
- Stretch switcher tiles across the two-column and three-column grids. The 165px tile width, 141px name box, and wide gutters start at xl, so resizing through the two-column range no longer leaves short left-aligned tiles.

## 0.13.0

### Added

- Add `scrollToViewMore`. The app switcher shows that control at the bottom of the card while the list is at the top and more tiles sit below. Choosing it scrolls the card by 60% of the visible height.

### Changed

- Show every app and site in one scrolling grid. Apps only and Sites only keep that grid and a result line such as "Showing all Sites: 17 results". Tiles stay 165px wide from 600px up and use two columns below that. Names wrap instead of truncating.
- Fade the top and bottom edges of the scrolling card. The bottom fade is 96px behind the scroll control and 32px at 60% opacity after that control hides.

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
