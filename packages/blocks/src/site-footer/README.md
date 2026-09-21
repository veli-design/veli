## Ownership and prerequisites

This experimental block is editable source for internal teams with access to Veli's restricted GitHub Packages. Install tokens and primitives through the existing [Veli setup guide](/docs/). Do not install the private blocks workspace. Applications own translations, URLs, and changes to their copy.

## Installation

Configure `@tradenetcorp:registry=https://npm.pkg.github.com` and use your existing package-read credentials. Never commit credentials.

```sh
corepack pnpm add @tradenetcorp/veli-ui@0.11.0 @tradenetcorp/veli-tokens@0.7.0 react@19.2.6 react-dom@19.2.6 react-aria-components@1.19.0
```

Use Tailwind 4 with your framework's integration. In your global stylesheet:

```css
@import 'tailwindcss';
@import '@tradenetcorp/veli-tokens/tailwind';
@import '@tradenetcorp/veli-ui/tailwind';
```

Copy `site-footer.tsx` into `src/components/blocks/site-footer/`. Import it directly from there. Download the complete archive to retain its original source and receipt under `.veli/blocks/site-footer/` before customizing your working copy. Commit the baseline and receipt alongside your adaptation. Files outside Tailwind's normal source tree require an explicit `@source` path relative to your stylesheet.

Wrap the application in `VeliProvider` with `language="en"` or `language="dv"`, and `colorScheme="light"`, `"dark"`, or `"system"`. Follow the [provider guide](/docs/provider/) for document direction, theme initialization, and font setup. The footer inherits its language and direction; it does not write document attributes or persist preferences.

## API

`startLinks` and `endLinks` are arrays of `{ id, label, href }`. IDs must be stable and unique within each group. Supply translated labels and fully resolved application URLs. Empty groups are omitted.

`startLabel` and `endLabel` optionally name the link lists. Translate these labels too. `className` customizes the root footer. `renderLink` has the same type as Veli Link's `render` prop; forward all supplied props, including the ref, to your router link. Ordinary anchors work without an adapter.

## Accessibility and responsive behavior

Use a single page-level footer landmark. Preserve link names, keyboard focus indicators, DOM reading order, and the Veli Link integration when adapting the block. Link groups wrap at narrow widths and use logical reading order for English/LTR and Dhivehi/RTL. Do not visually reorder links independently of their DOM order.

Validate your own labels, fonts, colors, routes, and surrounding page. The automated fixture covers both directions, light/dark modes, narrow screens, long labels, keyboard focus, hydration, and navigation; it is not a certification of downstream accessibility. Manual screen-reader and device testing remains part of adopting an experimental block.

## Updating your copy

1. Read the new block changelog and dependency requirements. Updating Veli UI alone does not update this source.
2. Compare your saved original, customized working file, and the new download. For example, `git diff --no-index .veli/blocks/site-footer/site-footer.tsx src/components/blocks/site-footer/site-footer.tsx` shows local adaptations; compare the same baseline against the new download to see upstream changes.
3. Apply relevant upstream changes without discarding local adaptations. Run your application's build, interaction, and accessibility checks.
4. After successful adoption, replace the baseline and receipt with the new originals. Keep customizations only in the working copy.

Each receipt records the source commit and SHA-256 hashes. Historical source is available at that commit to repository members. A receipt marked `dirty` represents a local preview, not a published release. Report critical composition fixes upstream; consuming teams own applying them.
