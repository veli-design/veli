---
'@tradenetcorp/veli-tokens': minor
'@tradenetcorp/veli-ui': minor
---

### Added

- Add explicit `default`, `stacked`, and `compact` Alert layouts and semantic Alert colour tokens for Light and Dark modes.

### Changed

- Refresh the Figma variable and style export while preserving existing motion paths in the public DTCG JSON bundle and generated CSS utilities. Motion primitives are also available separately from `@tradenetcorp/veli-tokens/motion-tokens`.

- Align Alert spacing, typography, icon placement, and action treatments with the revised design. Default actions stay on one row; choose `stacked` for vertically arranged full-width actions. For `compact`, omit the description and use at most one action.

### Removed

- Replace the legacy Alert appearances: migrate `subtle` to `light` and `emphasis` to `highContrast`. Replace `outline` by choosing either new treatment; it has no direct equivalent.

### Fixed

- Mirror Alert layouts for RTL and use Dhivehi typography and localized dismissal names. Reserve space around the close control and keep high-contrast ghost actions readable on hover and press.
