---
'@tradenetcorp/veli-tokens': minor
'@tradenetcorp/veli-ui': minor
---

### Changed

- Unify CSS and Tailwind on canonical namespaced DTCG tokens; migrate plain CSS references to `--veli-*` and use Figma typography values.

### Added

- Expose normalized DTCG and motion data, complete Light/Dark CSS variables, grid utilities and retained focus effects.

### Fixed

- Make all UI entry points importable during Node server rendering.
