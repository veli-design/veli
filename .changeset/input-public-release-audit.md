---
'@tradenetcorp/veli-ui': minor
---

### Added

- Add `isOptional` to `Input` to show a localized Optional caption beside the label. The caption is hidden when the field is required.

### Changed

- Show a warning icon in place of `endContent` on an invalid `Input`, matching the Figma error state.
- Render entered `Input` values in the strong text colour, and use 8px gaps between the header, field content, and slots, with 4px above the helper text.

### Removed

- Remove `labelSupplementary` from `Input`. Replace `labelSupplementary="Optional"` with `isOptional`; put other header text in `description`, `infoTooltip`, or `action`.

### Fixed

- Draw outline `Input` strokes inside the field so hover, focus, and error states no longer shift the layout.
- Show disabled `Input` fields as a flat fill with no underline or outline.
- Remove `Input` state transitions when users prefer reduced motion.
- Keep Dhivehi placeholders right-aligned in RTL `email`, `url`, `tel`, and `password` inputs, and render their entered values in the Latin font instead of a system fallback.
