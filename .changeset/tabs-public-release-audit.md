---
'@tradenetcorp/veli-ui': minor
---

### Changed

- Make the Tabs underline hug the tab group width by default. Pass `tabListClassName="w-full"` to restore a full-width inactive border.

### Added

- Scroll the Tabs bar horizontally when tabs are wider than their container, and keep the selected tab in view.

### Fixed

- Align Tabs leading and trailing slot spacing with the design system, consolidate overflow mode into a single accessible tab tree, select the first enabled tab by default, localize the overflow More label from language, and gate color transitions with reduced-motion.
