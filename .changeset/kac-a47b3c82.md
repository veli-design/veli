---
'@tradenetcorp/veli-ui': minor
---

### Added

- Add an explicit localized `isOptional` marker to ComboBox; required fields suppress the marker.

### Deprecated

- Use `ComboBox isOptional` instead of `labelSupplementary` for localized optional labels. Custom supplementary content remains supported.

### Fixed

- Keep ComboBox outline content stable on hover and focus, align disabled and read-only fills, and use the specified helper and option treatments.
- Isolate the info tooltip from suggestion disclosure and apply local language overrides consistently to field copy, filtering, tooltip, and popup content.
- Respect reduced motion for ComboBox feedback and wrap long option text within narrow popups.

- Preserve numeric zero labels and their accessible input association.
