---
'@tradenetcorp/veli-ui': minor
---

### Added

- Add `isOptional` to `Select` to show a localized Optional caption beside the label. The caption is hidden when the field is required.

### Changed

- Align `Select` options with the Figma menu: 16px inline padding, menu hover and pressed fills, a trailing check instead of a tinted selected row, sentence-case section headers, dividers between sections, and a 0.5px muted popover border.
- Render the selected `Select` value in the strong text colour, and use 8px gaps between the header, field content, and slots, with 4px above the helper text.

### Removed

- Remove `labelSupplementary` from `Select`. Replace `labelSupplementary="Optional"` with `isOptional`; put other header text in `description`, `infoTooltip`, or `action`.

### Fixed

- Draw outline `Select` strokes inside the field so hover, focus, and error states no longer shift the layout.
- Show disabled `Select` fields as a flat fill with no underline or outline, and dim the caret and option icons.
- Remove `Select` state transitions when users prefer reduced motion.
- Show only the selected option's label in the `Select` trigger, so option descriptions and `startContent` no longer overflow the field.
