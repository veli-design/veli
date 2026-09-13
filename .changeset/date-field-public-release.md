---
'@tradenetcorp/veli-ui': minor
---

### Added

- Align `DateField` with Input `appearance` (`default` | `outline`) and `size` (`sm` | `md` | `lg`) for segment-based date entry.

### Fixed

- Stop outline `DateField` / `DatePicker` shells from shifting layout on hover and focus by painting the stroke with an inset box-shadow.
- Use `bg-text-input-bg-hover` for disabled and read-only `DateField` / `DatePicker` shells so they match Figma and TextArea in light and dark.
