# @veli-design/tokens

Veli tokens for plain CSS, Tailwind v4 and DTCG integrations. All artifacts come from one normalized graph.

## Installation

After public npm publication, install with `pnpm add @veli-design/tokens`.
The default npm registry requires no package-read token. Before release, use the
local tarball rehearsal in the repository migration runbook.

## Consumption

```css
/* Plain CSS */
@import '@veli-design/tokens/css';

.card {
  background: var(--veli-color-bg-surface-raised);
  color: var(--veli-color-text-base-default);
  border-radius: var(--veli-radius-default);
}
```

```css
/* Tailwind v4: import Tailwind first. */
@import 'tailwindcss';
@import '@veli-design/tokens/tailwind';
```

The Tailwind adapter imports `tokens.css` and references its variables. Existing Tailwind utility names remain available, including `text-base-default`, `type-body-sm-regular`, `duration-fast`, and property-specific background/border/ring aliases. `grid-style-xs` through `grid-style-2xl` reproduce Figma columns, gaps and inner margins; responsive variants such as `md:grid-style-md` work normally.

Generic font-size utilities `text-xs` through `text-9xl` follow Figma's `text` collection for size, line height and letter spacing. That collection aliases English `type-metrics`: xs → caption, sm/base/lg → body sm/md/lg, xl → subtitle, 2xl/3xl → title 2/1, 4xl/5xl/6xl/7xl → heading 4/3/2/1, and 8xl/9xl → display md/lg. Font family and weight remain independently composable; explicit leading and tracking utilities override the companions. These generic utilities do not switch typography with language. Use `type-*` for complete bilingual Figma styles, which switch all five properties under `:lang(dv)` (set `lang="dv"`, not only `dir="rtl"`).

### Loading the Latin font

The host app loads Inter; Veli supplies the family choice and a system sans fallback through `--veli-font-sans`. This one token drives `font-sans`, English `type-*` utilities, and the English typography CSS variables. Dhivehi styles continue to use their own font tokens.

Dhivehi styles use the Figma font roles `--veli-font-dhivehi-regular`, `--veli-font-dhivehi-medium`, and `--veli-font-dhivehi-bold`. The older `--veli-font-dhivehi-faseyha`, `--veli-font-dhivehi-waheed`, and `--veli-font-dhivehi-aaamu` variables remain as aliases for existing consumers.

Figma's `font-weight/dhivehi-regular` stores the MV Faseyha style name `Regular`; its CSS token `--veli-font-weight-dhivehi-regular` aliases numeric weight 400. The export also provides `--veli-radius-field` (10px) for field controls.

Apps that load an `Inter`-named face with `@font-face` or a font package need no font token setup. This applies to Vite + React, TanStack Start, and React Router; import the font CSS and Veli CSS from the app entry or root route so they are available on the first render. For a locally hosted font, the CSS can look like this:

```css
@font-face {
  font-family: Inter;
  src: url('./Inter.woff2') format('woff2');
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
}
```

When a loader gives the font a generated family name, bind that name to `--veli-font-sans` on the document root. For example, with Next.js App Router:

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--veli-font-sans' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

Apply the variable class to `<html>`, where the plain CSS typography tokens resolve. A loader in any framework can use the same root token; there is no `@theme` font reassignment. The font file or font package must provide the weights and scripts the app uses.

Fractional spacing classes such as `gap-1.5` and `p-1.5` remain available. In plain CSS, use `var(--veli-spacing-1-5)` (6px); canonical variable names use dashes instead of decimal points or underscores.

Set `.light` or `.dark` on the root or a theme boundary. Plain CSS and Tailwind share this contract. A host that offers system preference should resolve that preference to one of these classes; `VeliProvider` handles this for React applications. Tokens use native OKLCH without gamut clipping or legacy fallbacks, matching Tailwind v4's modern browser baseline: Chrome 111+, Safari 16.4+, Firefox 128+.

`@veli-design/tokens/tokens` exports normalized DTCG JSON. `/motion-tokens` exports its duration, delay and easing subset. Aliases reference canonical paths; consumers can resolve them with a DTCG parser. `$extensions.mode.Dark` provides the alternate value; the default `$value` is Light. `org.veli` extensions retain source/style provenance and relative CSS intent that cannot be expressed with DTCG's px/rem dimensions.

## Authoring and build

1. Export Variables and Typography/Grid/Effect/Color Styles with TokensBruecke into `src/figma.tokens.json`.
2. Keep authored `OKLCH light: oklch(...)` and `OKLCH dark: oklch(...)` descriptions in Figma. The pipeline promotes these values, validates their fallback colors and preserves their exact CSS spelling. It rejects missing chromatic descriptions; achromatic fallback values use a proper color-space conversion.
3. Maintain code-owned motion primitives in `src/motion.tokens.json` using typed duration values and cubic Bézier arrays. Figma wins if it later supplies the same motion key.
4. Run `corepack pnpm --filter @veli-design/tokens tokens:sync` and review both input and canonical `src/design.tokens.json` changes.
5. Run `tokens:check`, `test` and `build` through the same package filter.

Normal package builds read committed canonical data and never rewrite source. Terrazzo 2.7.1 validates the graph and its CSS plugin generates canonical declarations. The Veli adapter plugin generates Tailwind mappings, utilities, JSON exports and coverage. There are no prebuild/postbuild hooks or generated CSS rewrites. Query thresholds are the deliberate exception to variable references: viewport/container conditions use literals generated from the same graph because CSS variables cannot supply their query values.

Storybook and Astro development use the shared Vite playground plugin. It regenerates ignored CSS automatically and watches token inputs; UI changes use source modules. No manual package build or release is necessary. Invalid input produces a Vite error overlay while retaining the last successful output.

## Migration from tokens 0.8

Plain CSS variables use the `--veli-*` namespace. Tailwind's own `--color-*`, `--text-*` and other theme variables remain adapter interfaces; use canonical variables in authored CSS. For example, `--text-sm--line-height` references `--veli-text-sm-line-height`, which aliases the English body/sm metric (`20px`).

Public JSON now contains normalized DTCG rather than the raw exporter file. Color tiers are flattened (`color.primitives.blue.800` becomes `color.blue.800`); case twins become one lowercase `default`; hybrid value/group nodes become explicit `default` leaves. Typography lives under `typography.en`, `typography.dv` and auxiliary groups. Grids use standard number/dimension leaves under `grid`; effects include all shadows and focus rings. Exporter-only typography details are retained as namespaced metadata, not invalid composite properties. Documentation-only `_docs` colors are excluded explicitly.

Type utilities now follow Figma composite line heights and letter spacing rather than approximating them through the text ramp. These are intentional visual corrections: review wrapping and alignment when upgrading.

Generic `text-*` leading and tracking follow the Figma text ramp. Semantic `type-*` styles use the corresponding English or Dhivehi metrics, including their authored pixel line height and letter spacing. Review text wrapping when upgrading.

The conflicting shorthand color alias `text-base` is reserved for font size. Use `text-base-default` for the default text color.

## Licence and assets

Original software and code examples use MIT; original non-software documentation
uses CC BY 4.0. Installed packages include the root `LICENSE` and
`licensing/LICENSING.md` with scope and attribution information, the complete
CC BY text, and applicable third-party notices. See the
[repository licensing map](https://github.com/tradenetcorp/veli/blob/main/LICENSING.md)
for source policy and asset details (repository access required).
Copyright/attribution identities remain unresolved and block publication.
Fonts, government/brand imagery and copied Block SVGs are not included or
licensed by these npm packages; registry/hosted-site assets are separate.
