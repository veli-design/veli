---
'@tradenetcorp/veli-ui': minor
---

### Added

- Align `DateField` with Input `appearance` (`default` | `outline`) and `size` (`sm` | `md` | `lg`) for segment-based date entry.
- Add `isOptional`, `infoTooltip`, and `infoTooltipAriaLabel` to `DateField`, matching the TextArea label pattern.

### Fixed

- Stop outline `DateField` shells from shifting layout on hover and focus by painting the stroke with an inset box-shadow.
- Use `bg-text-input-bg-hover` for disabled and read-only `DateField` shells so they match Figma and TextArea in light and dark.
