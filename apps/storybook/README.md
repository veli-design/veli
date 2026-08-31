# @tradenetcorp/veli-storybook

The local component workbench for the Veli Design System. It renders the
components from [`@tradenetcorp/veli-ui`](../../packages/ui) with the shared
styles and design tokens from [`@tradenetcorp/veli-tokens`](../../packages/tokens).

## Prerequisites

Install the repository dependencies from the repository root:

```bash
corepack pnpm install
```

## Develop

Start Storybook at [http://localhost:6006](http://localhost:6006):

```bash
corepack pnpm --filter @tradenetcorp/veli-storybook dev
```

Stories live in [`src/stories`](./src/stories). Shared Storybook configuration
is in [`.storybook`](./.storybook), and global styles are in
[`src/global.css`](./src/global.css).

## Build

Create the static Storybook site:

```bash
corepack pnpm --filter @tradenetcorp/veli-storybook build
```

The generated files are written to `storybook-static/` and are not committed.
