---
'@tradenetcorp/veli-tokens': minor
---

### Added

- Map `radius`, `spacing`, `blur`, `breakpoints` (as `breakpoint`), and `container` tokens into the Tailwind theme so those utilities use Veli values instead of Tailwind defaults.

### Changed

- Emit `--radius` and `--radius-md` from `radius.DEFAULT` (6px) so bare `rounded` and `rounded-md` track the design token.
- Normalize Figma fractional spacing keys such as `0,5` to Tailwind underscore CSS names (`--spacing-0_5`) for `p-0.5` and related utilities.
