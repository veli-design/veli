# Coral Token Architecture Notes

Working notes for aligning Coral Design System variables, DTCG tokens, and Tailwind CSS v4 theme variables.

Last updated: 2026-04-30

## Context

Coral currently exports variables from Figma through a forked TokensBruecke workflow into `packages/tokens/src/design.tokens.json`. Terrazzo then builds CSS outputs:

- `packages/tokens/dist/tokens.css`
- `packages/tokens/dist/tailwind-theme.css`

Consuming apps import the Tailwind theme CSS from `@tradenetcorp/coral-tokens/tailwind` after `@import "tailwindcss"`.

The current goal is to make Coral tokens feel native to Tailwind CSS v4 by aligning token names and output CSS variables with Tailwind's theme variable namespaces.

## Latest Decision

The team decided to keep the current Coral type scale values as-is and only rename the scale steps to Tailwind-compatible names.

Coral and Tailwind both use 13 text scale steps. Coral will keep its established font-size and line-height ramp, but map those steps onto Tailwind's names from `xs` through `9xl`.

This means Coral is not adopting Tailwind's default numeric values. It is adopting Tailwind's naming and variable structure.

| Tailwind-compatible name | Coral font size | Coral line-height | Previous CDS label |
| --- | ---: | ---: | --- |
| `xs` | `12px` | `16px` | Caption |
| `sm` | `14px` | `20px` | Body/sm |
| `base` | `16px` | `24px` | Body/md |
| `lg` | `18px` | `26px` | Body/Lg |
| `xl` | `20px` | `28px` | Subtitle |
| `2xl` | `24px` | `32px` | Title 2 |
| `3xl` | `28px` | `38px` | Title 1 |
| `4xl` | `32px` | `44px` | Heading 4 |
| `5xl` | `36px` | `48px` | Heading 3 |
| `6xl` | `40px` | `52px` | Heading 2 |
| `7xl` | `48px` | `68px` | Heading 1 |
| `8xl` | `56px` | `76px` | Display 2 |
| `9xl` | `64px` | `84px` | Display |

Figma update completed on 2026-04-30:

- Updated the original documentation frame `Type Scale EN` (`80:4725`) to use `xs` through `9xl` labels while preserving the existing Coral size/line-height pairs.
- Populated the Figma `text` variable collection with grouped variables such as `sm/font-size` and `sm/line-height`.
- Renamed the previous `md` step to `base` for Tailwind alignment.

Figma update completed on 2026-05-03:

- Populated the Figma `leading` variable collection with Tailwind default named line-height values.
- Populated the Figma `tracking` variable collection with Tailwind default named letter-spacing values:
  - `tighter = -0.05`
  - `tight = -0.025`
  - `normal = 0`
  - `wide = 0.025`
  - `wider = 0.05`
  - `widest = 0.1`
- Added WEB code syntax on the tracking variables to make the intended Tailwind units explicit for export tooling:
  - `tighter = -0.05em`
  - `tight = -0.025em`
  - `normal = 0em`
  - `wide = 0.025em`
  - `wider = 0.05em`
  - `widest = 0.1em`
- Updated scopes:
  - `leading/*` -> `LINE_HEIGHT`
  - `tracking/*` -> `LETTER_SPACING`

Figma leading update completed on 2026-05-05:

- Updated semantic `leading/*` variables to percentage-style values for designer-facing usage:
  - `none = 100`
  - `tight = 125`
  - `snug = 137.5`
  - `normal = 150`
  - `relaxed = 162.5`
  - `loose = 200`
- Added a curated fixed leading subset that mirrors useful Tailwind spacing-based utilities:
  - `4 = 16px`
  - `6 = 24px`
  - `8 = 32px`
  - `10 = 40px`
- Added WEB code syntax on the leading variables to make the intended units explicit for export tooling:
  - semantic leading variables use `100%`, `125%`, `137.5%`, `150%`, `162.5%`, and `200%`
  - fixed leading variables use `16px`, `24px`, `32px`, and `40px`
- Build output still normalizes semantic values to Tailwind's unitless CSS variables, while fixed numeric values remain px.

Terrazzo config update completed on 2026-04-30:

- Updated `packages/tokens/terrazzo.config.js` to map the canonical Tailwind namespaces with Terrazzo globs: `font`, `text`, `leading`, `tracking`, and `font-weight`.
- Updated `packages/tokens/postbuild.js` to normalize grouped DTCG text tokens into Tailwind v4's paired CSS variable shape.
- Expected text mapping after Terrazzo plus postbuild normalization:
  - `text.6xl.font-size` -> `--text-6xl`
  - `text.6xl.line-height` -> `--text-6xl--line-height`
- Updated font namespace mapping from `fontFamily` to Tailwind v4's native `font` namespace so generated variables become `--font-sans`, `--font-mono`, and `--font-dhivehi`.

## Current Figma State

Inspected file:

`CDS--Foundation`, file key `uqKWNjL7Bl3HEArKKU1suq`

Important Figma model detail:

- Figma has first-class variable collections and modes.
- Figma "groups" are represented by slash-delimited variable names, not separate group objects.
- A variable named `text/default/subtle` appears grouped in the UI, but structurally it is one variable name inside one collection.

Current local Figma variable collections include:

| Collection | Modes | Notes |
| --- | --- | --- |
| `color` | `Light`, `Dark` | Mature semantic and primitive color structure. Uses slash paths such as `text/default/subtle`, `bg/primary/default`, `button/primary/hover`. |
| `typography` | `Mode 1` | Legacy typography collection. Contains `text/display-1`, `text/heading-1`, `text/lg`, plus string `font-weight/*` values like `Semi Bold`. |
| `spacing` | `Mode 1` | Tailwind-like spacing scale. |
| `radius` | `Mode 1` | Tailwind-like radius scale. |
| `container` | `Mode 1` | Tailwind-like container scale. |
| `breakpoint` | `Mode 1` | Tailwind-like breakpoint scale. |
| `tracking` | `Mode 1` | Tailwind-aligned namespace. Populated with Tailwind default tracking values from `tighter=-0.05` through `widest=0.1`. |
| `leading` | `Mode 1` | Tailwind-aligned namespace. Populated with Tailwind default leading values from `none=1` through `loose=2`. |
| `font` | `Mode 1` | Newer Tailwind-aligned namespace: `sans`, `mono`, `dhivehi`. |
| `font-weight` | `Mode 1` | Newer Tailwind-aligned namespace: numeric weights `400`, `500`, `600`, `700`. |
| `text` | `Mode 1` | Tailwind-aligned namespace. Now populated as grouped primitive variables from `xs/font-size` and `xs/line-height` through `9xl/font-size` and `9xl/line-height`, using the existing Coral ramp values. |
| `blur` | `Mode 1` | Tailwind-like blur scale. |

Important drift found before the 2026-04-30 Figma update:

- Live Figma `text` variables have real values for `xs` through `2xl`.
- Checked-in DTCG `text` tokens currently have `0px` values.
- This suggests the latest Figma variable edits have not yet been exported, or the export pipeline is not preserving the intended values for the `text` collection.

Current expected next step:

- Re-export DTCG tokens from Figma so `packages/tokens/src/design.tokens.json` receives the updated `text/*/font-size` and `text/*/line-height` variable structure.

## Current DTCG Source State

Source file:

`packages/tokens/src/design.tokens.json`

Relevant typography-related structure:

```json
{
  "typography": {
    "text": {
      "display-1": { "$type": "dimension", "$value": "60px" },
      "display-2": { "$type": "dimension", "$value": "56px" },
      "heading-1": { "$type": "dimension", "$value": "48px" },
      "heading-2": { "$type": "dimension", "$value": "40px" },
      "heading-3": { "$type": "dimension", "$value": "36px" },
      "heading-4": { "$type": "dimension", "$value": "32px" },
      "title-1": { "$type": "dimension", "$value": "28px" },
      "title-2": { "$type": "dimension", "$value": "24px" },
      "subtitle-1": { "$type": "dimension", "$value": "20px" },
      "lg": { "$type": "dimension", "$value": "18px" },
      "md": { "$type": "dimension", "$value": "16px" },
      "sm": { "$type": "dimension", "$value": "14px" },
      "caption": { "$type": "dimension", "$value": "12px" },
      "xs": { "$type": "dimension", "$value": "12px" }
    },
    "font-weight": {
      "bold": { "$type": "string", "$value": "Bold" },
      "semibold": { "$type": "string", "$value": "Semi Bold" },
      "medium": { "$type": "string", "$value": "Medium" },
      "regular": { "$type": "string", "$value": "Regular" }
    }
  },
  "tracking": {
    "tighter": { "$type": "dimension", "$value": "0px" },
    "tight": { "$type": "dimension", "$value": "0px" },
    "normal": { "$type": "dimension", "$value": "0px" }
  },
  "leading": {
    "tight": { "$type": "dimension", "$value": "0px" },
    "snug": { "$type": "dimension", "$value": "0px" },
    "normal": { "$type": "dimension", "$value": "0px" }
  },
  "font": {
    "sans": { "$type": "string", "$value": "Inter" },
    "mono": { "$type": "string", "$value": "IBM Plex Mono" },
    "dhivehi": { "$type": "string", "$value": "MV Typewriter" }
  },
  "font-weight": {
    "regular": { "$type": "dimension", "$value": "400px" },
    "medium": { "$type": "dimension", "$value": "500px" },
    "semibold": { "$type": "dimension", "$value": "600px" },
    "bold": { "$type": "dimension", "$value": "700px" }
  },
  "text": {
    "xs": { "$type": "dimension", "$value": "0px" },
    "sm": { "$type": "dimension", "$value": "0px" },
    "md": { "$type": "dimension", "$value": "0px" },
    "lg": { "$type": "dimension", "$value": "0px" },
    "xl": { "$type": "dimension", "$value": "0px" },
    "2xl": { "$type": "dimension", "$value": "0px" }
  }
}
```

Observations:

- `typography.text.*` contains the older Coral naming scheme and usable size values.
- Top-level `text.*` is the correct Tailwind v4 namespace direction, but the checked-in values are invalid zeros.
- Top-level `leading.*` and `tracking.*` are structurally useful but currently invalid zeros.
- Top-level `font-weight.*` is conceptually right for Tailwind, but `$type: "dimension"` with values like `"400px"` is semantically wrong. Font weight should be numeric, not a pixel dimension.
- `typography.font-weight.*` string values are useful in Figma because Figma text variables bind to font style names like `Semi Bold`, but those should not be the tokens used for Tailwind CSS `font-weight` utilities.

## Current Terrazzo Build State

Config:

`packages/tokens/terrazzo.config.js`

Current Tailwind plugin mapping:

```js
tailwind({
  filename: 'tailwind-theme.css',
  theme: {
    color: ['color.*'],
    font: ['font.*'],
    text: ['text.*'],
    leading: ['leading.*'],
    tracking: ['tracking.*'],
    'font-weight': ['font-weight.*'],
  },
  modeVariants: [{ variant: 'dark', mode: 'Dark' }],
})
```

Current postbuild text normalization:

```js
tailwindTheme = tailwindTheme.replace(/--text-([a-z0-9]+(?:xl)?)-font-size:/g, '--text-$1:');
tailwindTheme = tailwindTheme.replace(/--text-([a-z0-9]+(?:xl)?)-line-height:/g, '--text-$1--line-height:');
```

Why this is needed:

- Terrazzo's Tailwind plugin maps token paths directly into CSS variable names.
- A grouped DTCG token like `text.6xl.font-size` naturally emits `--text-6xl-font-size`.
- Tailwind v4 expects the font-size variable to be `--text-6xl`, with the paired line-height at `--text-6xl--line-height`.
- The postbuild step performs that final Tailwind-specific naming normalization.

Token build verification completed on 2026-05-03 after refreshing `design.tokens.json` from Figma:

- `pnpm --filter @tradenetcorp/coral-tokens build` passes.
- `packages/tokens/dist/tailwind-theme.css` now emits the expected Tailwind v4 typography namespace variables:
  - `--font-sans`, `--font-mono`, `--font-dhivehi`
  - `--text-xs` through `--text-9xl`
  - paired `--text-xs--line-height` through `--text-9xl--line-height`
  - `--leading-none`, `--leading-tight`, `--leading-snug`, `--leading-normal`, `--leading-relaxed`, `--leading-loose`
  - `--tracking-tighter`, `--tracking-tight`, `--tracking-normal`, `--tracking-wide`, `--tracking-wider`, `--tracking-widest`
  - `--font-weight-regular`, `--font-weight-medium`, `--font-weight-semibold`, `--font-weight-bold`
- Figma/TokensBruecke exports typography-related numeric variables as px dimensions by default. `leading` semantic variables are intended to export as percent strings, while fixed `leading` variables remain px dimensions. `postbuild.js` normalizes Tailwind theme output:
  - `--leading-tight: 125%` -> `--leading-tight: 1.25`
  - `--tracking-tight: -0.4px` -> `--tracking-tight: -0.025em`
  - `--font-weight-semibold: 600px` -> `--font-weight-semibold: 600`
- Multi-word font family values are quoted in postbuild:
  - `--font-mono: "IBM Plex Mono"`
  - `--font-dhivehi: "MV Typewriter"`

Figma Typography styles export state on 2026-05-03:

- The refreshed DTCG source includes `Typography-styles` as composite tokens with `$type: "typography"`.
- 52 typography style composites were exported: 13 type sizes times 4 weights.
- Current style composites are hardcoded:
  - `fontFamily: "Inter"`
  - `fontWeight: 400 | 500 | 600 | 700`
  - `fontSize: "64px"` etc.
  - `lineHeight: "84px"` etc.
  - `letterSpacing: "0%"`, except caption styles at approximately `0.12px`
- They are flattened into `packages/tokens/dist/tokens.css` as variables such as `--typography-styles-body-md-regular-font-size`.
- They are not currently mapped into `tailwind-theme.css`, and Tailwind does not have a native composite typography style namespace that would automatically create utilities from these tokens.
- To make Typography styles more maintainable, bind Figma text styles to primitive variables where possible:
  - font size -> `text/{step}/font-size`
  - line height -> `text/{step}/line-height`
  - letter spacing -> `tracking/normal` or a dedicated caption tracking token
  - font weight -> `font-weight/{weight}`
- Note: Terrazzo expects `fontFamily` aliases inside `$type: "typography"` composites to point to tokens with `$type: "fontFamily"`. The current Figma-exported `font/*` tokens are `$type: "string"`, so hardcoded `Inter` is currently safer unless the export/postprocess layer converts font tokens to `fontFamily`.

## Further Alignment Work

### Figma Units vs Tailwind Units

Figma variables are not unit-aware in the same way Tailwind theme variables are. Numeric Figma variables exported from typography-related scopes currently arrive in DTCG as `$type: "dimension"` with `px` values.

For `leading`, the chosen Figma representation is now a two-tier model:

- Semantic relative leading values are stored as percentage-style numbers, matching Figma's percent line-height model.
- A curated fixed subset is stored as px values for Tailwind's spacing-derived numeric leading utilities.
- Because Figma variable values themselves are FLOAT values and do not carry a `%` unit, semantic `leading/*` variables also carry WEB code syntax such as `125%`. TokensBruecke or a pre-Terrazzo normalization step should prefer that explicit unit metadata if available.

For `tracking`, the current Figma variable values remain 16px-base px presentation values, but the variables carry WEB code syntax with Tailwind's intended `em` values. TokensBruecke or a pre-Terrazzo normalization step should prefer that explicit code syntax where available.

This affects:

```json
{
  "leading": {
    "tight": {
      "$type": "string",
      "$value": "125%"
    },
    "6": {
      "$type": "dimension",
      "$value": "24px"
    }
  },
  "tracking": {
    "tight": {
      "$type": "dimension",
      "$value": "-0.4px"
    }
  },
  "font-weight": {
    "semibold": {
      "$type": "dimension",
      "$value": "600px"
    }
  }
}
```

Tailwind expects:

```css
@theme {
  --leading-tight: 1.25;
  --tracking-tight: -0.025em;
  --font-weight-semibold: 600;
}
```

Figma does not currently give us a clean way to define a FLOAT variable as `em`, `%`, or unitless at the variable-value level. Figma text fields can display line-height and letter-spacing in different UI units, but FLOAT variables exported through the current TokensBruecke path can still serialize as dimensions unless the exporter reads scope/code-syntax metadata and rewrites them.

Terrazzo validation detail:

- `$type: "dimension"` accepts `px`, `em`, and `rem`, but not `%`.
- Therefore semantic percent leading tokens must be exported or normalized as `$type: "string"` with values like `"125%"`, or converted to unitless numbers before Terrazzo.
- Fixed numeric leading tokens should remain `$type: "dimension"` with px values like `"24px"`.

Current Figma leading presentation values:

| Token | Tailwind value | Figma value |
| --- | ---: | ---: |
| `leading/none` | `1` | `100%` |
| `leading/tight` | `1.25` | `125%` |
| `leading/snug` | `1.375` | `137.5%` |
| `leading/normal` | `1.5` | `150%` |
| `leading/relaxed` | `1.625` | `162.5%` |
| `leading/loose` | `2` | `200%` |
| `leading/4` | `16px` | `16px` |
| `leading/6` | `24px` | `24px` |
| `leading/8` | `32px` | `32px` |
| `leading/10` | `40px` | `40px` |

Current Figma tracking presentation values:

| Token | Tailwind value | Figma value at 16px base |
| --- | ---: | ---: |
| `tracking/tighter` | `-0.05em` | `-0.8px` |
| `tracking/tight` | `-0.025em` | `-0.4px` |
| `tracking/normal` | `0em` | `0px` |
| `tracking/wide` | `0.025em` | `0.4px` |
| `tracking/wider` | `0.05em` | `0.8px` |
| `tracking/widest` | `0.1em` | `1.6px` |

Current solution:

- Keep designer-facing Figma variables ergonomic.
- Normalize Tailwind-specific units in `packages/tokens/postbuild.js`.

Current postbuild conversions:

```text
--leading-tight: 125%          -> --leading-tight: 1.25
--leading-tight: 125px         -> --leading-tight: 1.25
--leading-6: 24px              -> --leading-6: 24px
--tracking-tight: -0.4px       -> --tracking-tight: -0.025em
--font-weight-semibold: 600px  -> --font-weight-semibold: 600
```

Potential future improvement:

- Add a pre-Terrazzo token normalization step that rewrites DTCG token types/units before Terrazzo runs.
- Or update the TokensBruecke fork so selected collections export with Tailwind-aware units:
  - `leading/*` as number tokens
  - `tracking/*` as dimension/string tokens with `em`
  - `font-weight/*` as number tokens

Preferred long-term architecture:

```text
Figma export
  -> raw DTCG from TokensBruecke
  -> normalize-token-units script
  -> Terrazzo build
  -> minimal postbuild formatting only
```

The current postbuild approach is acceptable for now because it is explicit, small, and limited to Tailwind theme output.

### Typography Style Representation

The current `Typography-styles` export is useful because it captures Figma text styles as DTCG composite typography tokens. However, the composites are mostly hardcoded. For example:

```json
{
  "$type": "typography",
  "$value": {
    "fontFamily": "Inter",
    "fontWeight": 400,
    "fontSize": "16px",
    "lineHeight": "24px",
    "letterSpacing": "0%"
  }
}
```

Better target shape:

```json
{
  "$type": "typography",
  "$value": {
    "fontFamily": "{font.sans}",
    "fontWeight": "{font-weight.regular}",
    "fontSize": "{text.base.font-size}",
    "lineHeight": "{text.base.line-height}",
    "letterSpacing": "{tracking.normal}"
  }
}
```

Important nuance for style binding:

- `text/{step}/line-height` tokens are absolute line-height values paired to each text size, so they are safe to bind directly in Figma styles.
- `leading/*` tokens represent Tailwind override ratios. In Figma they are stored as 16px-base px presentation values for export ergonomics. Do not assume `leading/tight = 20px` is the correct line height for every text size; for `20px` type, Tailwind `leading-tight` resolves visually to `25px`.
- `tracking/*` tokens represent Tailwind `em` values. In Figma they are stored as 16px-base px presentation values. For non-16px styles, the exact Figma value should be computed per style unless Figma percentage letter-spacing binding/export can preserve the relative value cleanly.

Work needed in Figma:

- Bind Figma text styles to primitive variables where Figma supports binding:
  - font size -> `text/{step}/font-size`
  - line height -> `text/{step}/line-height`
  - letter spacing -> `tracking/normal` for zero tracking, or style-specific computed tracking values for non-zero tracking until relative `em`/percentage export is proven
  - font weight/style -> appropriate `font-weight/*` or Figma font-style token, depending on what Figma allows for the field
- Rename inconsistent style labels before export:
  - `Display 2/Reguar` -> `Display 2/Regular`
  - `Title2` -> `Title 2`
  - consider whether `Body/md` should become `Body/base` for Tailwind alignment
- Decide whether style tokens should remain CDS semantic labels (`Display 1`, `Heading 1`, `Body/md`) or move to Tailwind-compatible semantic labels (`type/display/1`, `type/body/base`).

Build/output work needed:

- Decide whether composite typography tokens should remain only in `tokens.css`, or whether we want generated semantic CSS classes.
- Tailwind does not automatically turn composite typography tokens into utilities.
- If semantic classes are desired, add a custom generator that emits something like:

```css
@utility type-body-base-regular {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--text-base--line-height);
  font-weight: var(--font-weight-regular);
  letter-spacing: var(--tracking-normal);
}
```

Recommended next step:

1. Keep primitive Tailwind namespace generation as the first priority.
2. Improve Figma text styles so composites reference primitives where possible.
3. Later, decide whether CDS needs semantic typography utility classes, or whether product code should compose Tailwind primitives directly.

Postbuild:

`packages/tokens/postbuild.js`

Current postbuild behavior:

- Removes `@import "tailwindcss";` from generated `tailwind-theme.css`.
- Adds `--spacing: 4px;` inside `@theme`.

Current output issue:

```css
@theme {
  --spacing: 4px;
  --fontFamily-sans-: Inter;
  --fontFamily-mono-: IBM Plex Mono;
  --text-xs: 0;
  --text-sm: 0;
  --text-md: 0;
  --text-lg: 0;
  --text-xl: 0;
  --text-2xl: 0;
}
```

This means `text-sm` in consuming Tailwind v4 projects resolves to a zero font size from the current generated Coral theme output.

Before the 2026-04-30 config update, there was also a naming mismatch:

- Generated: `--fontFamily-sans-`
- Tailwind v4 native namespace: `--font-sans`

The consuming apps currently patch around this with:

```css
@theme {
  --font-sans: var(--fontFamily-sans-), ui-sans-serif, system-ui, sans-serif;
}
```

The token package config now targets `--font-sans` directly. After the next successful token build, consuming apps should no longer need to repair this namespace locally.

## Tailwind CSS v4 Target Shape

Tailwind v4 theme variables are CSS custom properties under namespaces. For typography, the important namespaces are:

```css
@theme {
  --font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;

  --text-sm: 0.875rem;
  --text-sm--line-height: 1.25rem;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --tracking-normal: 0em;

  --leading-tight: 1.25;
  --leading-normal: 1.5;
}
```

Important Tailwind behavior:

- `text-sm` applies both `font-size` and its paired default `line-height`.
- The paired line-height token is `--text-sm--line-height`.
- Standalone `--leading-*` tokens power explicit override utilities such as `leading-tight`.
- Therefore Coral should model both paired text line-height tokens and standalone leading tokens.

## Recommended Token Architecture

### 1. Keep Tailwind-native primitive collections

Use these as the source for generated Tailwind theme variables:

```text
font
  sans
  mono
  dhivehi

font-weight
  regular
  medium
  semibold
  bold

text
  xs
  xs/line-height
  sm
  sm/line-height
  base
  base/line-height
  lg
  lg/line-height
  xl
  xl/line-height
  2xl
  2xl/line-height
  3xl
  3xl/line-height
  4xl
  4xl/line-height
  5xl
  5xl/line-height
  6xl
  6xl/line-height
  7xl
  7xl/line-height
  8xl
  8xl/line-height
  9xl
  9xl/line-height

leading
  none
  tight
  snug
  normal
  relaxed
  loose

tracking
  tighter
  tight
  normal
  wide
  wider
  widest
```

Coral values for the initial `text` ramp:

| Token | Font size | Paired line-height |
| --- | ---: | ---: |
| `xs` | `12px` | `16px` |
| `sm` | `14px` | `20px` |
| `base` | `16px` | `24px` |
| `lg` | `18px` | `26px` |
| `xl` | `20px` | `28px` |
| `2xl` | `24px` | `32px` |
| `3xl` | `28px` | `38px` |
| `4xl` | `32px` | `44px` |
| `5xl` | `36px` | `48px` |
| `6xl` | `40px` | `52px` |
| `7xl` | `48px` | `68px` |
| `8xl` | `56px` | `76px` |
| `9xl` | `64px` | `84px` |

These intentionally differ from Tailwind's default numeric ramp. The exported shape should stay Tailwind-native even when Coral's values are custom.

### 2. Keep semantic type styles separate from primitives

Use composite type styles for design intent:

```text
type-style
  display/1
  display/2
  heading/1
  heading/2
  title/1
  body/lg
  body/md
  body/sm
  caption
```

These should reference primitives:

```json
{
  "type-style": {
    "body": {
      "sm": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{font.sans}",
          "fontWeight": "{font-weight.regular}",
          "fontSize": "{text.sm}",
          "lineHeight": "{text.sm.line-height}",
          "letterSpacing": "{tracking.normal}"
        }
      }
    }
  }
}
```

Use these for Figma text styles and documentation. Do not use them as the primary source for Tailwind utilities.

### 3. Preserve Figma-only font style names if needed

Figma needs string style names such as `Regular`, `Medium`, `Semi Bold`, and `Bold` for binding font style variables.

Keep those separate from CSS numeric weights:

```text
figma-font-style
  regular = "Regular"
  medium = "Medium"
  semibold = "Semi Bold"
  bold = "Bold"

font-weight
  regular = 400
  medium = 500
  semibold = 600
  bold = 700
```

Avoid using `typography/font-weight` string tokens as Tailwind font-weight tokens.

### 4. Prefer `base` over `md` for Tailwind alignment

Tailwind's default text scale uses `base`, not `md`.

Current CDS has both older `md` and newer `text/md`. For Tailwind-native output, prefer:

```text
text/base -> --text-base -> class text-base
```

If CDS still wants `text-md`, treat it as a CDS alias or compatibility token, not the canonical Tailwind-aligned primitive.

## Proposed DTCG Shape

Naive text primitive nesting is awkward because DTCG cannot have both a token and a group at the same path. In other words, `text.sm` cannot be both the font-size token and the parent for `text.sm.line-height`.

Therefore, prefer one of these export strategies:

### Option A: DTCG source optimized for Tailwind output

```json
{
  "text": {
    "sm": {
      "font-size": {
        "$type": "dimension",
        "$value": "0.875rem"
      },
      "line-height": {
        "$type": "dimension",
        "$value": "1.25rem"
      }
    }
  }
}
```

Then transform:

```text
text.sm.font-size    -> --text-sm
text.sm.line-height  -> --text-sm--line-height
```

### Option B: DTCG source optimized for flat Tailwind variable names

```json
{
  "text": {
    "sm": {
      "$type": "dimension",
      "$value": "0.875rem"
    },
    "sm--line-height": {
      "$type": "dimension",
      "$value": "1.25rem"
    }
  }
}
```

Then transform:

```text
text.sm                -> --text-sm
text.sm--line-height   -> --text-sm--line-height
```

Recommendation:

- Use Option A for cleaner DTCG semantics.
- Add a Tailwind-specific transform that emits Tailwind's double-hyphen modifier variables.

## Figma Naming Recommendation

Because Figma variable names are slash paths, use names that export cleanly:

```text
Collection: text
  xs/font-size
  xs/line-height
  sm/font-size
  sm/line-height
  base/font-size
  base/line-height
```

Then export to DTCG:

```json
{
  "text": {
    "sm": {
      "font-size": { "$value": "14px" },
      "line-height": { "$value": "20px" }
    }
  }
}
```

And generate Tailwind:

```css
@theme {
  --text-sm: 0.875rem;
  --text-sm--line-height: 1.25rem;
}
```

## Migration Plan

1. [ ] Re-export current Figma variables to DTCG and confirm whether live `text` values replace the checked-in zero values.
2. [x] Populate `text` fully from `xs` through `9xl`, including paired `line-height` values in Figma.
3. [x] Rename or alias `text/md` to `text/base` for Tailwind alignment in Figma.
4. [x] Populate `leading` with semantic percentage-style values and a curated fixed subset in Figma:
   - semantic: `none = 100`, `tight = 125`, `snug = 137.5`, `normal = 150`, `relaxed = 162.5`, `loose = 200`
   - fixed: `4 = 16px`, `6 = 24px`, `8 = 32px`, `10 = 40px`
5. [x] Populate `tracking` with real Tailwind-compatible values in Figma:
   - `tighter = -0.05em`
   - `tight = -0.025em`
   - `normal = 0em`
   - `wide = 0.025em`
   - `wider = 0.05em`
   - `widest = 0.1em`
6. [ ] Change CSS font-weight tokens to numeric values without `px`.
7. [x] Configure the token package to emit native Tailwind variables:
   - `--font-sans`, not `--fontFamily-sans-`
   - `--font-mono`, not `--fontFamily-mono-`
   - `--text-sm` plus `--text-sm--line-height`
   - `--leading-tight`
   - `--tracking-normal`
   - `--font-weight-semibold`
   - Final output verification is still pending the refreshed Figma DTCG export.
8. [ ] Move app-level font namespace patching out of consuming apps and into the token package output.
9. [ ] Mark the old `typography` collection as legacy, or migrate it to `type-style` composite tokens.
10. [ ] Add a small verification fixture that checks generated `tailwind-theme.css` includes non-zero `--text-*` variables and paired `--text-*--line-height` variables.

## Open Questions

- Resolved: CDS will use CDS-specific values while preserving Tailwind namespaces.
- Should Dhivehi have its own typography mode or separate token namespace?
- Should typography values be stored in Figma as pixels for designer ergonomics and converted to rem at build time?
- Can the current Terrazzo Tailwind plugin emit Tailwind's paired `--text-*--line-height` variables directly, or do we need a custom postbuild transform?
- Should `typography` remain published for backward compatibility while new `text`, `leading`, `tracking`, `font`, and `font-weight` namespaces become canonical?

## Current Risk Summary

The highest-risk issue is that current generated Tailwind typography variables are invalid:

```css
--text-sm: 0;
```

If this package is consumed as-is, Tailwind utilities such as `text-sm`, `text-lg`, and `text-2xl` may produce zero-sized text once Coral's theme variables override Tailwind defaults.

The next improvement should be to fix the DTCG `text` source and generated Tailwind text output before relying on Coral typography utilities in product code.
