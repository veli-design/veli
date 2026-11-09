## 0.10.0

### Changed

- Require Veli React ^0.20.0 and record the exact 0.20.0 candidate baseline. The copied-source rendering API and token baseline are unchanged; previous block archives retain their existing requirements.

## 0.9.0

### Changed

- Use Veli Sheet for the mobile notification tray, sharing its native swipe, motion, dismissal and focus management. Preserve the title, options and close controls, 40px grabber, notification states, scrolling list and desktop popover.
- Require `@veli-design/react@^0.19.0`. Notification data, rendering props and host callbacks are unchanged.

## 0.8.0

### Changed

- Require Veli React ^0.19.0 and record the exact 0.19.0 candidate baseline. The copied-source rendering API and token baseline are unchanged; previous block archives retain their existing requirements.

## 0.7.0

### Changed

- Support the verified public package baseline: @veli-design/react@^0.18.0, react-aria-components@^1.22.0, @veli-design/tokens@^0.11.0. The copied-source rendering API is unchanged.

## 0.6.2

### Fixed

- Include the merged numeric unread counter and total-count documentation in the public-package source archive.

## 0.6.1

### Changed

- Render decorative icons from the declared Phosphor library dependency instead of copied SVG files, preserving their weights and accessible semantics.

## 0.6.0

### Changed

- Use the public @veli-design React and tokens package names. Migrate application and copied source imports together.

## 0.5.2

### Fixed

- Include the total unread-count property documentation in the downloadable source and CLI archive.

## 0.5.1

### Fixed

- Show the total unread count on the default bell trigger using the numeric header badge. Hide it at zero, use the standard `99+` overflow display, and keep the full total in the accessible name.
- Align the 20px counter and 16px bell with the header reference, keeping the counter centered on its anchor as counts widen and mirroring its placement in RTL.

## 0.5.0

### Changed

- Adopt Veli UI 0.17.x and tokens 0.10.x as the supported core package baseline. Upgrade the applicable core packages together before adding or updating this copied block; earlier block versions retain their previous dependency contracts.
- Record the tested core candidate versions for the bilingual typography and subtle-button color update. Block APIs and authored source are unchanged.

## 0.4.0

### Changed

- Require Veli tokens 0.9.1 or later in the 0.9 line for the complete eight-block CLI installation. Applications using older token versions must upgrade before adding or updating this block; earlier versions are not claimed to be broken in isolation. Validated with UI 0.16.0 and tokens 0.9.1 release candidates; repeat a clean registry install after publication.

## 0.3.3

### Fixed

- Restore the loading rows' 8px padding, 8px text-bar gaps, and 96px timestamp placeholder to match the supplied reference geometry.

## 0.3.2

### Fixed

- Keep placeholder heights and avatar sizes consistent across tray widths, and resolve the highlight from the local colour scheme on nested surfaces.

## 0.3.1

### Changed

- Align the initial-loading highlight across each notification row with a 1500ms sweep and 500ms rest. Respect light and dark themes, RTL, and reduced motion.

## 0.3.0

### Changed

- Show Veli Skeleton placeholders during initial loading, shared spinners for pending retry/paging actions, and settling text while marking all notifications as read. Upgrade `@veli-design/react` to `^0.16.0` when updating copied source.

### Fixed

- Align warning icons and empty-state text with their design color tokens.
- Correct notification row spacing, divider placement, desktop bottom padding and options menu geometry while allowing longer content to grow.
- Slide unread indicators away with their timestamps when notifications are marked as read, with mirrored RTL motion and reduced-motion support.

## 0.2.0

### Changed

- Use the maintained `@phosphor-icons/react` package for icons. When upgrading a copied block, install `@phosphor-icons/react@^2.1.10` as a direct dependency. Icon size, color, weight and behavior are retained with the maintained artwork.

## 0.1.2

### Fixed

- Include the empty-state icon in copied source and use filled retry and paging actions.
- Align CLI installation with the current notification tray source and its downloadable assets.

## 0.1.1

### Fixed

- Let scrolling rows reach the tray edge and retain existing notifications after refresh errors.
- Make the mobile sheet follow downward drags and return after short or cancelled drags.

## 0.1.0

### Added

- Added a notification tray with a desktop popover, independently scrolling list and mobile bottom sheet with drag dismissal and reduced-motion support.
- Added unread indicators, filtering, app-owned actions, loading, empty, error and pending states, and visible retry and paging buttons.
- Added an embeddable content component, router integration, translated-label overrides and source-copy documentation.
