# Veli Token Architecture

Working notes for aligning Veli Design System variables, DTCG tokens, Tailwind CSS v4 theme variables, and Figma text styles.

Last updated: 2026-05-07

## Summary

Veli uses Figma as the design authoring surface and `packages/tokens/src/design.tokens.json` as the raw exported token source. Tokens are exported from Figma through TokensBruecke as DTCG-compatible JSON, normalized locally where the export shape is not yet ideal, then built with Terrazzo into CSS outputs.

The target architecture is:

```text
Figma variables and styles
  -> TokensBruecke DTCG export
  -> packages/tokens/prebuild.js
  -> .cache/design.tokens.normalized.json
  -> Terrazzo
  -> packages/tokens/postbuild.js
  -> dist/tokens.css
  -> dist/tailwind-theme.css
```

Consuming apps import the Tailwind theme CSS from `@tradenetcorp/veli-tokens/tailwind` after `@import "tailwindcss"`.

Veli is Tailwind-aligned, not Tailwind-default-valued. We use Tailwind v4's native variable namespaces and utility model, while preserving Veli's government design system values and semantic design intent.

Dark mode is class-driven. Token CSS emits light variables by default and dark overrides under `:where(.dark, .dark *)`, and consuming apps should apply `.dark` to the document root or the relevant provider boundary. Veli supports `system`, `light`, and `dark` color scheme intents; `system` resolves from `prefers-color-scheme`.

Frameworks should own their own app-shell theme runtime. In Next.js, prefer `next-themes` with `attribute="class"` so Veli's Tailwind theme CSS responds to `<html class="dark">`. For React Router, TanStack Router, TanStack Start, Astro, and Vite-based apps, any runtime is compatible as long as it applies the same `.dark` contract before or during first paint.

## Current State

The typography alignment work was implemented on 2026-05-07.

- Tailwind-native primitive namespaces are canonical for CSS theme output: `font`, `font-weight`, `text`, `leading`, and `tracking`.
- Semantic Figma text styles are canonical for designer usage: `Type/Heading/1/Semibold`, `Type/Body/md/Regular`, `Type/Caption/12/Regular`, etc.
- Generated semantic utilities bridge Figma and code: `type-heading-1-semibold`, `type-body-md-regular`, `type-caption-12-regular`, etc.
- `text-*` remains Tailwind's primitive font-size namespace.
- `type-*` is Veli's composite typography utility namespace.
- The old Figma `typography` collection is legacy. It may remain for one migration cycle, but it is excluded from canonical typography output.

Build verification completed after a fresh Figma DTCG export:

- `pnpm build` in `packages/tokens` passes.
- `pnpm --filter @tradenetcorp/veli-ui lint` passes.
- `pnpm --filter @tradenetcorp/veli-web build` passes.
- `pnpm --filter @tradenetcorp/veli-storybook build` passes.
- `tailwind-theme.css` emits non-zero `--text-*` variables and paired `--text-*--line-height` variables.
- `--font-weight-semibold` emits `600`, not `600px`.
- `--tracking-caption` emits `0.01em`.
- 52 `@utility type-*` classes are generated from exported Figma typography composites.

Known non-blocking warning:

- Web and Storybook builds currently show an existing CSS optimizer warning near generated color token CSS around `--color-inputs-checkbox-container-*`. Generated CSS braces were checked and balanced, and the warning does not block builds.

## Figma Model

Inspected file:

`CDS--Foundation`, file key `uqKWNjL7Bl3HEArKKU1suq`

Important Figma model details:

- Figma variable collections and modes are first-class objects.
- Figma variable groups are slash-delimited names, not separate group objects.
- A variable named `text/base/font-size` appears grouped in the UI, but structurally it is one variable name inside the `text` collection.
- Figma variables do not store CSS units in the same way DTCG and Tailwind do. Typography fields can display percentages or pixels in the UI, while the variable value itself may still export as a number or a pixel dimension.

Current canonical Figma variable collections:

| Collection    | Purpose                                                                                              |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| `font`        | Tailwind-aligned font family namespace: `sans`, `mono`, `dhivehi`.                                   |
| `font-weight` | CSS numeric font weights: `regular`, `medium`, `semibold`, `bold`.                                   |
| `text`        | Tailwind-aligned type ramp with `font-size` and paired `line-height` values from `xs` through `9xl`. |
| `leading`     | Standalone line-height utilities, including relative semantic values and a curated fixed subset.     |
| `tracking`    | Standalone letter-spacing utilities, including Tailwind-style tracking values and `caption`.         |

Current legacy Figma collection:

| Collection   | Status                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| `typography` | Deprecated. Kept temporarily for migration context and older references. Do not treat as canonical for new output. |

Current semantic Figma text styles:

```text
Type/Display/1/Regular
Type/Display/2/Regular
Type/Heading/1/Semibold
Type/Title/2/Medium
Type/Body/md/Regular
Type/Caption/12/Regular
```

The full style set contains 52 `Type/...` styles: 13 type sizes times 4 weights. These are local CDS Foundation styles and are safe to update.

Completed Figma cleanup:

- Renamed local typography styles into the `Type/...` namespace.
- Fixed naming issues such as `Display 2/Reguar`, `Title2/*`, and `Semi bold`.
- Migrated 4,619 remote-style text node references to local `Type/...` styles.
- Created 3 `Legacy Remote/...` local text styles for unmapped copyable remote styles.
- Added `tracking/caption` with Figma value `1%` and WEB syntax `0.01em`.
- Updated caption styles to use `1%` letter spacing.
- Updated semantic line heights to use percentage units in Figma-facing styles.

Remaining Figma cleanup:

- Three remote Dhivehi style references remain because the required fonts were unavailable to the Figma automation:
  - `Dhivehi/button/Waheed 19`
  - `Dhivehi/Inputs/Faruma 17`
- One stale font-family variable binding remains on `Type/Display/1/Regular`. It visually resolves to Inter, but TokensBruecke exports it as `{typography.font.sans}`. Remove that binding or rebind it to canonical `font/sans` after the exporter supports `fontFamily` token typing.

## Tailwind V4 Target Shape

Tailwind v4 theme variables are CSS custom properties under native namespaces.

```css
@theme {
  --font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;

  --text-base: 16px;
  --text-base--line-height: 24px;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --tracking-normal: 0em;
  --tracking-caption: 0.01em;

  --leading-tight: 1.25;
  --leading-normal: 1.5;
}
```

Important behavior:

- `text-base` applies both `font-size` and its paired default `line-height`.
- The paired line-height token is `--text-base--line-height`.
- Standalone `--leading-*` tokens power explicit override utilities such as `leading-tight`.
- Standalone `--tracking-*` tokens power explicit override utilities such as `tracking-wide`.
- Veli semantic `type-*` utilities are generated composites, not native Tailwind primitives.

Example generated utility:

```css
@utility type-body-md-regular {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--text-base--line-height);
  font-weight: var(--font-weight-regular);
  letter-spacing: var(--tracking-normal);
}
```

## Typography Values

Veli keeps its established type scale values while mapping the primitive ramp onto Tailwind-compatible names.

| Tailwind-compatible name | Veli font size | Veli line-height | CDS semantic label |
| ------------------------ | -------------: | ---------------: | ------------------ |
| `xs`                     |         `12px` |           `16px` | Caption            |
| `sm`                     |         `14px` |           `20px` | Body/sm            |
| `base`                   |         `16px` |           `24px` | Body/md            |
| `lg`                     |         `18px` |           `26px` | Body/lg            |
| `xl`                     |         `20px` |           `28px` | Subtitle           |
| `2xl`                    |         `24px` |           `32px` | Title 2            |
| `3xl`                    |         `28px` |           `38px` | Title 1            |
| `4xl`                    |         `32px` |           `44px` | Heading 4          |
| `5xl`                    |         `36px` |           `48px` | Heading 3          |
| `6xl`                    |         `40px` |           `52px` | Heading 2          |
| `7xl`                    |         `48px` |           `68px` | Heading 1          |
| `8xl`                    |         `56px` |           `76px` | Display 2          |
| `9xl`                    |         `64px` |           `84px` | Display 1          |

Standalone leading values:

| Token             | Tailwind output | Figma value |
| ----------------- | --------------: | ----------: |
| `leading/none`    |             `1` |      `100%` |
| `leading/tight`   |          `1.25` |      `125%` |
| `leading/snug`    |         `1.375` |    `137.5%` |
| `leading/normal`  |           `1.5` |      `150%` |
| `leading/relaxed` |         `1.625` |    `162.5%` |
| `leading/loose`   |             `2` |      `200%` |
| `leading/4`       |          `16px` |      `16px` |
| `leading/6`       |          `24px` |      `24px` |
| `leading/8`       |          `32px` |      `32px` |
| `leading/10`      |          `40px` |      `40px` |

Standalone tracking values:

| Token              | Tailwind output | Figma presentation at 16px |
| ------------------ | --------------: | -------------------------: |
| `tracking/tighter` |       `-0.05em` |                   `-0.8px` |
| `tracking/tight`   |      `-0.025em` |                   `-0.4px` |
| `tracking/normal`  |           `0em` |                      `0px` |
| `tracking/wide`    |       `0.025em` |                    `0.4px` |
| `tracking/wider`   |        `0.05em` |                    `0.8px` |
| `tracking/widest`  |         `0.1em` |                    `1.6px` |
| `tracking/caption` |        `0.01em` |                       `1%` |

Figma `1%` letter spacing and CSS `0.01em` both scale against the element's own font size. There is no base-16 discrepancy for `0.01em`; it is not fixed to 16px. For 12px caption text, both resolve to `0.12px`.

## DTCG Source Shape

Figma variable names use slash paths that export cleanly to grouped DTCG tokens:

```text
Collection: text
  xs/font-size
  xs/line-height
  sm/font-size
  sm/line-height
  base/font-size
  base/line-height
```

Expected exported shape:

```json
{
  "text": {
    "base": {
      "font-size": { "$type": "dimension", "$value": "16px" },
      "line-height": { "$type": "dimension", "$value": "24px" }
    }
  }
}
```

Postbuild converts Terrazzo's direct variable names into Tailwind's paired shape:

```text
text.base.font-size    -> --text-base
text.base.line-height  -> --text-base--line-height
```

Typography style composites export under `Typography-styles`:

```json
{
  "$type": "typography",
  "$value": {
    "fontFamily": "Inter",
    "fontWeight": 400,
    "fontSize": "16px",
    "lineHeight": "150%",
    "letterSpacing": "0%"
  }
}
```

These composites are used to generate semantic `type-*` utilities.

## Build Normalization

`packages/tokens/prebuild.js` normalizes raw DTCG before Terrazzo. It exists because current TokensBruecke output is close, but not perfectly typed for Terrazzo validation.

Current prebuild responsibilities:

- Writes `.cache/design.tokens.normalized.json`.
- Keeps `packages/tokens/src/design.tokens.json` as the untouched raw Figma export.
- Rewrites stale aliases such as `{typography.font.sans}` to the canonical namespace.
- Resolves typography composite `fontFamily` aliases to literal font family values before Terrazzo, because current `font/*` tokens export as `$type: "string"` rather than `$type: "fontFamily"`.

`packages/tokens/postbuild.js` normalizes final CSS output.

Current postbuild responsibilities:

- Removes generated `@import "tailwindcss";` from `tailwind-theme.css`.
- Adds Tailwind v4's `.dark` custom variant and base `color-scheme` rules.
- Adds `--spacing: 4px;` inside `@theme`.
- Converts grouped text variables to Tailwind's paired font-size and line-height syntax.
- Converts font weight artifacts such as `600px` to numeric CSS values.
- Converts tracking artifacts to `em`, including `--tracking-caption: 0.01em`.
- Converts semantic leading percentages to unitless Tailwind values.
- Quotes multi-word font family values.
- Generates Veli `@utility type-*` classes from `Typography-styles`.

## TokensBruecke Fork Recommendations

Keep the local prebuild guard even if the exporter is improved. The guard makes the package resilient to stale Figma bindings and older exports.

Recommended exporter improvements:

- When exporting Figma variables scoped as `FONT_FAMILY`, emit DTCG `$type: "fontFamily"` instead of generic `$type: "string"`.
- Keep `FONT_STYLE` variables as `$type: "string"`, because values like `Semi Bold` are Figma font style names, not CSS font weights.
- Export `FONT_WEIGHT` variables as numeric tokens, not dimension tokens like `600px`.
- Prefer WEB code syntax when exporting scoped typography variables where Figma's raw variable value cannot carry the intended unit:
  - `tracking/*` should export as `em` values.
  - semantic `leading/*` should export as unitless numbers or strings that can be normalized predictably.
- When exporting typography composites, only emit aliases if the target token type is valid for the composite property; otherwise resolve to a literal.

Why this matters:

- Figma font-family variables are internally string-like values, so a generic exporter naturally serializes `font/sans` as `$type: "string"`.
- Terrazzo's DTCG typography parser requires a `fontFamily` alias inside a typography composite to point to a `$type: "fontFamily"` token.
- This is why `{font.sans}` is currently invalid inside exported typography composites even though the human meaning is correct.

## Developer Usage

Use primitive Tailwind utilities when styling needs are intentionally local:

```tsx
<p className="text-base leading-normal tracking-normal">Body copy</p>
```

Use Veli semantic utilities when matching a Figma text style:

```tsx
<h1 className="type-heading-1-semibold">
  Page title
</h1>

<p className="type-caption-12-regular">
  Supporting caption
</p>
```

The mapping rule is direct:

```text
Figma style: Type/Body/md/Regular
Code class:  type-body-md-regular
```

## Migration Guidance

For designers:

- Use local CDS `Type/...` text styles for final product design.
- Avoid using raw primitive variables directly for final typography decisions unless documenting the type ramp.
- Treat the old `typography` collection as deprecated.

For developers:

- Replace repeated arbitrary typography combinations with generated `type-*` utilities when they correspond to a Figma text style.
- Keep using primitive utilities such as `text-base`, `leading-tight`, and `tracking-wide` when the design intentionally calls for a local override.
- Do not use the deprecated `typography` token namespace for new code.

## Future Work

Near-term cleanup:

- Remove or rebind the stale Figma font-family binding on `Type/Display/1/Regular`.
- Resolve the three remaining remote Dhivehi text style references once the required fonts are available in Figma automation.
- Remove or fully deprecate the old `typography` Figma collection after one migration cycle.
- Investigate the existing CSS optimizer warning around generated color token CSS.

Exporter/build improvements:

- Update the TokensBruecke fork so font-family variables export as `$type: "fontFamily"` when scoped as `FONT_FAMILY`.
- Move more unit normalization from `postbuild.js` into either TokensBruecke or `prebuild.js` over time.
- Add a small automated fixture that asserts key generated CSS output:
  - `--text-base` is non-zero.
  - `--text-base--line-height` is non-zero.
  - `--font-weight-semibold: 600`.
  - `--tracking-caption: 0.01em`.
  - representative `@utility type-*` classes exist.

System questions:

- Decide whether Dhivehi typography should have a separate type style namespace, mode, or documented font strategy.
- Decide whether typography CSS output should eventually convert px values to rem values.
- Decide how long to publish legacy typography tokens for downstream compatibility.
