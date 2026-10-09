# @tradenetcorp/veli-ui

Accessible React primitives for the Veli Design System. Built on [React Aria Components](https://react-spectrum.adobe.com/react-aria/) and Tailwind v4, using tokens from [`@tradenetcorp/veli-tokens`](../tokens).

## Install

**Registry** — add `.npmrc` in your app:

```ini
@tradenetcorp:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` needs `read:packages` (CI env var or user `~/.npmrc` locally).

**Packages:**

```bash
pnpm add @tradenetcorp/veli-ui
```

Peers (`react`, `react-dom`, `react-aria-components`) are required. `phosphor-react` is optional but used in docs/examples.

## Tailwind setup

In your global CSS (import once from app entry):

```css
@import 'tailwindcss';
@import '@tradenetcorp/veli-tokens/tailwind';
@import '@tradenetcorp/veli-ui/tailwind';
```

## Usage

```tsx
import { Button } from '@tradenetcorp/veli-ui/button';
import { Tabs, TabList, Tab, TabPanel } from '@tradenetcorp/veli-ui/tabs';
```

```tsx
import { Button } from '@tradenetcorp/veli-ui/button';
import { Plus } from 'phosphor-react';

export function CreateAction() {
  return (
    <Button intent="primary" appearance="fill" size="md" onPress={() => {}}>
      <Plus size={16} weight="bold" />
      <span>Create</span>
    </Button>
  );
}
```

## Next.js and Vitest

The release containing the ESM packaging fix (planned UI **0.15.0**) ships explicit `.js` relative imports. After upgrading, remove `@tradenetcorp/veli-ui` from Next.js `transpilePackages` and Vitest `test.server.deps.inline` if those entries were added to work around Veli module resolution. Keep entries required by other packages.

Pages Router production SSR on Next **15.5.18** and **16.2.6**, and Vitest **4.1.11** with jsdom, are tested against a packed package without those workarounds. Existing Next 16 App Router browser tests also consume packed packages. Older Veli releases still contain invalid native ESM; an App Router build can hide that defect by bundling the package.

See the [consumer investigation and reproduction matrix](../../docs/ESM_CONSUMER_COMPATIBILITY.md). The tests cover package compatibility; validate your application's own build and tests after updating its dependency and configuration.

## Troubleshooting

| Problem                               | Fix                                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| Unstyled UI                           | Add `@import "@tradenetcorp/veli-ui/tailwind"` (or equivalent `@source` to the package). |
| Can't resolve `@tradenetcorp/veli-ui` | Use a subpath, e.g. `@tradenetcorp/veli-ui/button`.                                      |
| Install 401/403                       | Check registry + `read:packages` on `GITHUB_TOKEN`.                                      |
| Wrong colors / dark mode              | Keep token import after `tailwindcss`.                                                   |

## Related

- [`@tradenetcorp/veli-tokens`](../tokens) — design tokens
