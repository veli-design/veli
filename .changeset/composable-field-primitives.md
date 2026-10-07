---
'@tradenetcorp/veli-ui': minor
---

### Added

- Add `@tradenetcorp/veli-ui/field` with composable `Field`, `FieldSet`, `FieldLegend`, `FieldGroup`, `FieldContent`, `FieldLabel`, `FieldTitle`, `FieldDescription`, `FieldError`, `FieldSeparator`, `FieldControl`, and `useFieldControlProps` for labeling and validating native or custom controls that do not ship with built-in label and error slots.

### Fixed

- Keep Checkbox and Radio visually-hidden inputs positioned against their own control so focus and clicks no longer jump the page inside nested scroll containers such as the docs site.
