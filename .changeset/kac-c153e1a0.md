---
'@tradenetcorp/veli-tokens': minor
'@tradenetcorp/veli-ui': minor
---

### Changed

- Unify CSS and Tailwind on canonical namespaced DTCG tokens; migrate plain CSS references to `--veli-*` and use Figma typography values.

- Align generic Tailwind font-size utilities with canonical English typography size, leading and tracking; use `type-*` for automatic Dhivehi styles.

### Added

- Expose normalized DTCG and motion data, complete Light/Dark CSS variables, grid utilities and retained focus effects.

### Fixed

- Reserve `text-base` for font size; use `text-base-default` for the default text color instead of the conflicting shorthand.

- Make all UI entry points importable during Node server rendering and reject invalid relative ESM imports before publishing. Veli no longer requires Next.js `transpilePackages` or Vitest dependency inlining to resolve its JavaScript.
