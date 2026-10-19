## 0.4.0

### Changed

- Require Veli tokens 0.9.1 or later in the 0.9 line for the validated five-block CLI installation. Applications using older token versions must upgrade before adding or updating this block; earlier versions are not claimed to be broken in isolation. Tested with UI 0.16.0 and tokens 0.9.1.

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

- Show Veli Skeleton placeholders during initial loading, shared spinners for pending retry/paging actions, and settling text while marking all notifications as read. Upgrade `@tradenetcorp/veli-ui` to `^0.16.0` when updating copied source.

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
