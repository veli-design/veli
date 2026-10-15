# Veli Token Architecture

Architecture and historical typography notes for Veli Design System variables, DTCG tokens, Tailwind CSS v4, and Figma text styles.

Last updated: 2026-10-16

## Summary

Veli uses Figma as the design authoring surface. TokensBruecke's untouched export lives in `packages/tokens/src/figma.tokens.json`. The normalization boundary merges code-owned motion tokens, resolves exporter-specific shapes and aliases, and writes the validated canonical DTCG graph to `packages/tokens/src/design.tokens.json`. Terrazzo's CSS plugin and Veli adapter build all published outputs from that graph.

The current architecture was implemented in [PR #248](https://github.com/tradenetcorp/veli/pull/248) and released as tokens 0.9.0 in [PR #249](https://github.com/tradenetcorp/veli/pull/249):

```text
Figma variables and styles
  -> TokensBruecke DTCG export
  -> src/figma.tokens.json + src/motion.tokens.json
  -> lib/normalize.mjs (tokens:sync)
  -> src/design.tokens.json (validated canonical DTCG)
  -> Terrazzo CSS plugin + lib/adapter.mjs
  -> dist/tokens.css, dist/tailwind-theme.css, dist/tokens.json,
     dist/motion.tokens.json, dist/coverage.json
```

Consuming apps import the Tailwind theme CSS from `@tradenetcorp/veli-tokens/tailwind` after `@import "tailwindcss"`.

Veli is Tailwind-aligned, not Tailwind-default-valued. We use Tailwind v4's native variable namespaces and utility model, while preserving Veli's government design system values and semantic design intent.

Dark mode is class-driven. Token CSS emits light variables by default and dark overrides under `.dark`; the Tailwind adapter adds `@custom-variant dark (&:where(.dark, .dark *))`. Consuming apps should apply `.dark` to the document root or a theme boundary. Veli supports `system`, `light`, and `dark` color scheme intents; `system` resolves from `prefers-color-scheme`.

`VeliProvider` injects a parser-blocking inline script and syncs `.dark`, `data-theme`, and `color-scheme` to `document.documentElement`. Portaled components (modals, popovers, tooltips, menus) then match `:where(.dark, .dark *)` even though they render under `document.body`.

Put `suppressHydrationWarning` on `<html>`. Key canvas colours off `html` / `html.dark` — do not transition `body { background: white }` or the first paint will flash.

```tsx
// Next.js App Router: app/layout.tsx
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <VeliProvider>{children}</VeliProvider>
      </body>
    </html>
  );
}
```

If `VeliProvider` is not the first node in `<body>`, inline the script in `<head>` with `getVeliThemeScript()` from `@tradenetcorp/veli-ui/theme-script`.

```astro
---
import { getVeliThemeScript } from '@tradenetcorp/veli-ui/theme-script';
---

<head>
  <script is:inline set:html={getVeliThemeScript()} />
</head>
```

Frameworks that manage their own theme persistence (e.g. `next-themes`) can continue to do so. When using `next-themes`, set `attribute="class"` and `storageKey="veli-color-scheme"` so that Veli's Tailwind theme CSS responds to `<html class="dark">` and the storage key stays consistent.

## Current State

The typography alignment work was implemented on 2026-05-07.

- Tailwind-native primitive namespaces are canonical for CSS theme output: `font`, `font-weight`, `text`, `leading`, `tracking`, `spacing`, `radius`, `blur`, `breakpoint`, and `container`.
- Semantic Figma text styles are canonical for designer usage: `Type/Heading/1/Semibold`, `Type/Body/md/Regular`, `Type/Caption/12/Regular`, etc.
- Generated semantic utilities bridge Figma and code: `type-heading-1-semibold`, `type-body-md-regular`, `type-caption-12-regular`, etc.
- Dhivehi text styles are emitted as `:lang(dv)` overrides for the same `type-*` utilities, so consumers switch typography by changing the inherited `lang` value through `VeliProvider`.
- `text-*` remains Tailwind's primitive font-size namespace.
- `type-*` is Veli's composite typography utility namespace.
- Motion primitives now map to Tailwind-aligned `ease-*`, `duration-*`, and `delay-*` utility names. `ease-*` is native Tailwind theme output, while Veli generates named `duration-*` and `delay-*` utilities that reference token CSS variables.
- Foundation groups `radius`, `spacing`, `blur`, `breakpoints`, and `container` map into the Tailwind theme so utilities use Veli tokens instead of Tailwind defaults. The DTCG `breakpoints` collection remaps to Tailwind's singular `--breakpoint-*` namespace.
- The former Figma `typography` variable collection is not present in the checked-in export; font families now live under `font/sans`, `font/mono`, and `font/dhivehi`.

The following build verification was recorded after the May 2026 typography alignment export:

- `pnpm build` in `packages/tokens` passes.
- `pnpm --filter @tradenetcorp/veli-ui lint` passes.
- `pnpm --filter @tradenetcorp/veli-web build` passes.
- `pnpm --filter @tradenetcorp/veli-storybook build` passes.
- `tailwind-theme.css` emits non-zero `--text-*` variables and paired `--text-*--line-height` variables.
- `tailwind-theme.css` emits motion primitives and named duration/delay utilities. Composite `animate-*` recipes are intentionally deferred until designers finalize motion aliases.
- `--font-weight-semibold` emits `600`, not `600px`.
- `--tracking-caption` emits `0.01em`.
- 52 `@utility type-*` classes are generated from exported Figma typography composites.
- 52 Dhivehi `:lang(dv)` typography overrides are generated from exported `Typography-styles/Dhivehi` composites.

Warning recorded during that verification:

- Web and Storybook builds showed a CSS optimizer warning near generated color token CSS around `--color-inputs-checkbox-container-*`. Generated CSS braces were checked and balanced at the time.

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

Former Figma collection:

| Collection   | Status                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| `typography` | Replaced by `font`, `font-weight`, `text`, `leading`, and `tracking`; absent from the current checked-in export. |

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

Cleanup recorded during the May 2026 alignment:

- Remote Dhivehi style references included the following because the required fonts were unavailable to the Figma automation:
  - `Dhivehi/button/Waheed 19`
  - `Dhivehi/Inputs/Faruma 17`

The current export uses `{font.sans}` for the display style that once pointed to the former `typography` collection. The old font alias is no longer supported by the pipeline.

## Generated Tailwind v4 shape

Tailwind v4 theme variables are CSS custom properties under native namespaces.

```css
@theme inline static {
  --font-sans: var(--veli-font-sans);
  --font-mono: var(--veli-font-mono);

  --text-base: var(--veli-typography-en-body-md-regular-font-size);
  --text-base--line-height: var(--veli-typography-en-body-md-regular-line-height);

  --font-weight-regular: var(--veli-font-weight-regular);
  --font-weight-medium: var(--veli-font-weight-medium);
  --font-weight-semibold: var(--veli-font-weight-semibold);
  --font-weight-bold: var(--veli-font-weight-bold);

  --tracking-normal: var(--veli-tracking-normal);
  --tracking-caption: var(--veli-tracking-caption);

  --leading-tight: var(--veli-leading-tight);
  --leading-normal: var(--veli-leading-normal);
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
  font-family: var(--veli-font-sans);
  font-size: var(--veli-typography-en-body-md-regular-font-size);
  font-weight: var(--veli-typography-en-body-md-regular-font-weight);
  line-height: var(--veli-typography-en-body-md-regular-line-height);
  letter-spacing: var(--veli-typography-en-body-md-regular-letter-spacing);
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

## Export refreshes

Replace `packages/tokens/src/figma.tokens.json` with the fresh TokensBruecke DTCG export, including typography, grid, effect, and color styles. Keep its Figma names and metadata intact. Then run `corepack pnpm --filter @tradenetcorp/veli-tokens tokens:sync` and review the generated changes to `src/design.tokens.json`. Run `tokens:check`, `test`, and `build` before publishing. Do not edit generated CSS.

`lib/normalize.mjs` excludes Figma-only `_docs` annotations, converts `Grid-styles` to standard number and dimension tokens, and validates product colors. Code-owned motion primitives live in `src/motion.tokens.json` and are merged into the canonical graph; Figma wins if it supplies the same key. The public `/tokens` and `/motion-tokens` entries expose generated JSON from that graph. A normal package build reads the committed canonical file; it does not rewrite either source file.

## Motion Values

Veli keeps motion primitives tokenized before any CSS transition, CSS keyframe, or Motion for React configuration is composed from them.

Easing values:

| Token           | CSS value                              | Tailwind utility |
| --------------- | -------------------------------------- | ---------------- |
| `ease/out`      | `cubic-bezier(0.00, 0.00, 0.20, 1.00)` | `ease-out`       |
| `ease/out-quad` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `ease-out-quad`  |
| `ease/in`       | `cubic-bezier(0.40, 0.00, 1.00, 1.00)` | `ease-in`        |
| `ease/in-out`   | `cubic-bezier(0.40, 0.00, 0.20, 1.00)` | `ease-in-out`    |
| `ease/spring`   | `cubic-bezier(0.34, 1.56, 0.64, 1.00)` | `ease-spring`    |
| `ease/linear`   | `linear`                               | `ease-linear`    |

Duration values:

| Token              | CSS value | Tailwind utility   |
| ------------------ | --------: | ------------------ |
| `duration/instant` |     `0ms` | `duration-instant` |
| `duration/fast`    |    `80ms` | `duration-fast`    |
| `duration/normal`  |   `200ms` | `duration-normal`  |
| `duration/slow`    |   `350ms` | `duration-slow`    |
| `duration/slower`  |   `500ms` | `duration-slower`  |
| `duration/slowest` |  `1200ms` | `duration-slowest` |

Delay values:

| Token          | CSS value | Tailwind utility |
| -------------- | --------: | ---------------- |
| `delay/none`   |     `0ms` | `delay-none`     |
| `delay/fast`   |    `40ms` | `delay-fast`     |
| `delay/normal` |    `80ms` | `delay-normal`   |
| `delay/slow`   |   `120ms` | `delay-slow`     |

Composite `animate-*` recipes and Motion for React transition helpers are intentionally not shipped in this update. The research and implementation notes for that follow-up are captured in `docs/MOTION_COMPOSITE_RESEARCH.md`.

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
      "font-size": { "$type": "dimension", "$value": { "value": 16, "unit": "px" } },
      "line-height": { "$type": "dimension", "$value": { "value": 24, "unit": "px" } }
    }
  }
}
```

The Veli adapter maps the validated English typography graph to Tailwind's paired text variables:

```text
typography.en.body.md.regular.fontSize   -> --veli-typography-en-body-md-regular-font-size   -> --text-base
typography.en.body.md.regular.lineHeight -> --veli-typography-en-body-md-regular-line-height -> --text-base--line-height
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

## Normalization and generation

`build.mjs sync` runs `lib/normalize.mjs` on the raw Figma export and code-owned motion input, validates the result with Terrazzo, and writes the canonical `src/design.tokens.json`. `tokens:check` verifies that the committed canonical file matches its inputs. Ordinary `build` reads that committed file and does not normalize or rewrite it.

The normalizer:

- Converts Figma names into canonical DTCG paths, including color tiers, typography language groups, grids, effects, and fractional spacing names.
- Maps the supported older color source aliases to current paths. Font-family aliases must reference the current `font` collection.
- Promotes exported `font/*` strings to `$type: "fontFamily"`, so typography composites can retain valid aliases instead of flattening them to literal family names.
- Converts exporter-specific typography fields, font weights, leading, tracking, colors, and motion into typed canonical values while retaining relevant provenance in `org.veli` metadata.
- Excludes Figma-only `_docs` annotations from published output and rejects unresolved aliases, invalid types, collisions, and inconsistent authored colors.

`lib/pipeline.mjs` configures Terrazzo's CSS plugin to emit canonical `--veli-*` variables, preserve aliases and authored OKLCH, and emit Light/Dark rules. It also emits a low-specificity default `--veli-font-sans` so host apps can bind their loaded font at the root. `lib/adapter.mjs` uses Terrazzo's validated transforms to emit the Tailwind theme, paired text variables, color and foundation mappings, `type-*` and other utilities, DTCG JSON, motion JSON, and coverage data. The adapter writes the required import and dark variant directly; there is no generated CSS postprocessing step.

During local development, the shared Vite playground plugin regenerates ignored CSS for Astro and Storybook when token inputs change. It does not replace the committed canonical file or the published build.

## TokensBruecke exporter considerations

The normalization boundary remains useful if the exporter improves because it defines canonical paths, validates input, and preserves the few explicitly supported older color aliases.

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
- The raw export currently types `font.sans` as `string`. Normalization promotes it to `fontFamily` before Terrazzo parses the canonical graph, so `{font.sans}` is valid in the generated tokens.

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
- Keep using the same `type-*` utility names in English and Dhivehi surfaces; `lang="dv"` switches those utilities to the exported Dhivehi composite values.
- Keep using primitive utilities such as `text-base`, `leading-tight`, and `tracking-wide` when the design intentionally calls for a local override.
- Do not use the deprecated `typography` token namespace for new code.

## Future Work

Near-term cleanup:

- Recheck the remote Dhivehi text style references recorded in the May 2026 Figma inspection when the required fonts are available.
- Recheck the old CSS optimizer warning if it recurs in a current build.

Exporter/build improvements:

- Update the TokensBruecke fork so font-family variables export as `$type: "fontFamily"` when scoped as `FONT_FAMILY`.
- Move exporter-specific unit interpretation into TokensBruecke when its output can satisfy the canonical DTCG contract directly. Keep normalization and generated-output tests as the validation boundary.

System questions:

- Decide whether Dhivehi fonts should eventually be bundled with licensed `@font-face` assets instead of referenced by family name only.
- Decide whether typography CSS output should eventually convert px values to rem values.
- Decide how long to retain support for older color source aliases at the normalization boundary.
