## Ownership and prerequisites

This experimental block is editable source for internal teams with access to Veli's restricted GitHub Packages. Install tokens and primitives through the existing [Veli setup guide](/docs/). Do not install the private blocks workspace. Applications own translations, URLs, and changes to their copy.

## Installation

Configure `@tradenetcorp:registry=https://npm.pkg.github.com` and use your existing package-read credentials. Never commit credentials.

```sh
corepack pnpm add @tradenetcorp/veli-ui@0.16.0 @tradenetcorp/veli-tokens@0.9.1 react@19.2.6 react-dom@19.2.6 react-aria-components@1.19.0
```

Use Tailwind 4 with your framework's integration. In your global stylesheet:

```css
@import 'tailwindcss';
@import '@tradenetcorp/veli-tokens/tailwind';
@import '@tradenetcorp/veli-ui/tailwind';
```

Initialize Veli Blocks and add the footer:

```sh
corepack pnpm dlx @tradenetcorp/veli init
corepack pnpm dlx @tradenetcorp/veli add site-footer
```

The CLI copies `site-footer.tsx` into the configured Blocks directory and retains its exact original source and receipt under `.veli/blocks/site-footer/`. Import the editable working copy directly from your application and commit both it and `.veli`. Files outside Tailwind's normal source tree require an explicit `@source` path relative to your stylesheet.

Wrap the application in `VeliProvider` with `language="en"` or `language="dv"`, and `colorScheme="light"`, `"dark"`, or `"system"`. Follow the [provider guide](/docs/provider/) for document direction, theme initialization, and font setup. The footer inherits its language and direction; it does not write document attributes or persist preferences.

## API

`startLinks` and `endLinks` are arrays of `{ id, label, href }`. IDs must be stable and unique within each group. Supply translated labels and fully resolved application URLs. Empty groups are omitted.

`startLabel` and `endLabel` optionally name the link groups. Translate these labels too. `className` customizes the root footer; `startGroupClassName` and `endGroupClassName` adjust one group when the application needs a different gap or alignment. `renderLink` has the same type as Veli Link's `render` prop; forward all supplied props, including the ref, to your router link. Ordinary anchors work without an adapter.

## Accessibility and responsive behavior

Use a single page-level footer landmark. Preserve link names, keyboard focus indicators, DOM reading order, and the Veli Link integration when adapting the block. The default compact link rows do not wrap, matching the established footer baseline; choose a wrapping group class only after documenting and approving that accessibility-driven change. Link groups use logical reading order for English/LTR and Dhivehi/RTL. Do not visually reorder links independently of their DOM order.

Validate your own labels, fonts, colors, routes, and surrounding page. The automated fixture covers both directions, light/dark modes, narrow screens, long labels, keyboard focus, hydration, and navigation; it is not a certification of downstream accessibility. Manual screen-reader and device testing remains part of adopting an experimental block.

## Updating your copy

1. Run `veli status` and read the new block changelog and dependency requirements. Updating Veli UI alone does not update this source.
2. Run `veli update site-footer`. The CLI verifies both releases and performs a three-way merge using your saved original, customized working file, and the new canonical source.
3. Resolve any labelled conflicts, then run `veli update --continue site-footer`; use `--abort` to restore the pre-update working copy.
4. Run your application's build, interaction, and accessibility checks and commit the updated working copy and baseline together.

Each receipt records the source commit and SHA-256 hashes. Historical source is available at that commit to repository members. A receipt marked `dirty` represents a local preview, not a published release. Report critical composition fixes upstream; consuming teams own applying them.
