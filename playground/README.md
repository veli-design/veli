# Router playgrounds

Local Next.js and TanStack Router apps for manually verifying Veli components
against real client-side routers and the workspace `@tradenetcorp/veli-ui` build.

These packages are excluded from root ESLint. They have no `build` script, so
`turbo build` skips them.

## Prerequisites

```bash
corepack pnpm install
corepack pnpm --filter @tradenetcorp/veli-ui build
```

## Next.js App Router

```bash
corepack pnpm --filter @tradenetcorp/veli-tabs-playground-next dev
```

Open http://localhost:3010

Current demo: Tabs under `/team/*` with `href` + `selectedKey={pathname}`, and
`VeliProvider.navigate` calling `router.push`. One tab uses `render` with
`next/link`.

Requires Tabs link props and `VeliProvider` `navigate` (tabs link-navigation
release or a local branch that includes them).

## TanStack Router

```bash
corepack pnpm --filter @tradenetcorp/veli-tabs-playground-tanstack dev
```

Open http://localhost:3011

Same `/team/*` shell with TanStack `navigate` / `useHref`, plus one tab using
`render` with TanStack `Link`.

## What to verify (Tabs link demo)

1. Clicking a tab updates the URL without a full reload
2. Arrow keys move focus without navigating (`keyboardActivation` is manual)
3. Enter/Space on a focused tab navigates
4. Refreshing a deep link selects the matching tab
5. Browser back/forward keeps tab selection in sync
