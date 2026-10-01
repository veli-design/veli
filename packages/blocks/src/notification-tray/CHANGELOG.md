## 0.1.1

### Fixed

- Removed the fixed bottom gutter so scrolling notification rows clip at the tray edge, and aligned empty-state spacing with the reference design.
- Gave notification errors a centered state layout with Veli danger tokens and a retry action while retaining existing notifications after refresh failures.
- Made the mobile sheet follow downward drags from its handle or header, return after short or cancelled drags, and close with token-based slide motion.
- Softened the mobile sheet opening to a short rise and fade, with slower, coordinated drawer and backdrop transitions.

## 0.1.0

### Added

- Added a notification tray with a responsive popover and bottom sheet, unread presentation, filtering, app-owned actions, loading, empty, error and pending states.
- Added an embeddable content component, router integration, translated-label overrides and source-copy documentation.
