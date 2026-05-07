# Coral Typography Alignment Plan

## Summary

Finalize Coral typography as a two-layer system:

- **Tailwind-native primitives** power normal utilities: `font-*`, `font-weight-*`, `text-*`, `leading-*`, and `tracking-*`.
- **Semantic Figma text styles** represent approved design intent: `Type/Heading/1/Semibold`, `Type/Body/md/Regular`, etc.
- **Generated semantic utilities** bridge Figma and code: `type-heading-1-semibold`, `type-body-md-regular`, `type-caption-12-medium`.

Keep `text-*` as Tailwind's primitive font-size namespace. Use `type-*` for composite typography classes.

## Key Decisions

- Current CDS Foundation typography styles are local to the CDS Foundation file, so they are safe to update.
- Existing remote/external text style references on canvas should be copied or recreated as local styles, then applied nodes should be switched to local CDS styles.
- Keep old `typography` variables as legacy for one migration cycle, but exclude them from canonical typography output.
- Figma `tracking/caption = 1%` should output to Tailwind as `--tracking-caption: 0.01em`; this scales with the element's own font size and matches Figma percent tracking.
- Prefer percentage line-height in Figma-facing styles, but normalize to valid CSS/Tailwind line-height values during build.

## Implementation Changes

- In Figma, rename/fix styles into a clean semantic namespace:
  - `Type/Display/1/Regular`
  - `Type/Heading/1/Semibold`
  - `Type/Title/2/Medium`
  - `Type/Body/md/Regular`
  - `Type/Caption/12/Regular`

- Fix current style naming issues:
  - `Display 2/Reguar` -> `Type/Display/2/Regular`
  - `Title2/*` -> `Type/Title/2/*`
  - `Semi bold` -> `Semibold`

- Keep primitive variable collections:
  - `font`
  - `font-weight`
  - `text`
  - `leading`
  - `tracking`

- Add `tracking/caption`:
  - Figma value: `1%`
  - WEB syntax/build output: `0.01em`

- Update token build:
  - Normalize exported `font-weight` values from dimension-like values to numbers.
  - Normalize tracking percent/px artifacts to `em`.
  - Normalize semantic line-height percentages to unitless ratios where needed.
  - Generate `@utility type-*` classes from exported typography composites.

- Update generated classes so each semantic utility sets:
  - `font-family`
  - `font-size`
  - `line-height`
  - `font-weight`
  - `letter-spacing`

## Migration

- Inspect applied text styles across the Figma file.
- For every remote text style still used on canvas, create or map to an equivalent local `Type/...` style.
- Switch applied text nodes/components from remote style IDs to local CDS style IDs.
- Preserve old local style names only if needed temporarily, but mark them deprecated.
- Update component examples and docs to use the new `type-*` classes instead of repeated arbitrary classes like `text-[12px] leading-[16px] tracking-[0.01em]`.

## Test Plan

- Figma verification:
  - All intended local `Type/...` styles exist.
  - No important CDS components still depend on remote typography styles.
  - Caption styles use `1%` tracking.
  - Style names are typo-free and stable.

- Token verification:
  - `--text-base` and `--text-base--line-height` are non-zero.
  - `--font-weight-semibold: 600`, not `600px`.
  - `--tracking-caption: 0.01em`.
  - Generated `type-*` utilities exist in `tailwind-theme.css`.

- Code verification:
  - `type-body-md-regular` matches Figma `Type/Body/md/Regular`.
  - `type-caption-12-regular` matches Figma `Type/Caption/12/Regular`.
  - Existing primitive utilities like `text-base`, `leading-tight`, and `tracking-wide` remain usable.

## Fresh Thread Kickoff

Start the next thread with:

"Please implement `docs/TYPOGRAPHY_ALIGNMENT_PLAN.md`. We are in `/Users/hussainfazaal/Code/coral`. First create the doc from the saved plan if it does not exist, then update Figma styles, migrate remote style references to local CDS styles, and update the token build to generate Coral `type-*` typography utilities."

## Assumptions

- Coral should stay Tailwind-aligned, not Tailwind-default-valued.
- Designers should use semantic Figma text styles, not raw primitive variables directly for final product design.
- Developers should be able to map a Figma style name directly to a generated Tailwind class.
- React Aria remains headless; Coral owns the visual typography class layer.
