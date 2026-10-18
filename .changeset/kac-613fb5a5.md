---
'@tradenetcorp/veli-ui': minor
---

### Added

- Add optional Toast close buttons and accent actions, and support state callbacks for Toast and ToastRegion styling and composition.

### Fixed

- Correct Toast semantic colors, long-message wrapping, RTL placement motion, action identity, numeric descriptions, and rapid queue updates. Respect reduced-motion preferences and custom queue update wrappers.
- Make keyboard focus visible when navigating to a ToastRegion with F6, and use the regular close icon from the design system.
- Keep document and portal themes in sync when the system color scheme changes, while preserving the initialized theme during hydration.
