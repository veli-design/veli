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
corepack pnpm --filter @tradenetcorp/veli-playground-next dev
```

Open http://localhost:3010

## TanStack Router

```bash
corepack pnpm --filter @tradenetcorp/veli-playground-tanstack dev
```

Open http://localhost:3011
