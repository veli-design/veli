# @tradenetcorp/coral-ui

Accessible React primitives for the Coral Design System. Built on [React Aria Components](https://react-spectrum.adobe.com/react-aria/) and Tailwind v4, using tokens from [`@tradenetcorp/coral-tokens`](../tokens).

## Install

**Registry** — add `.npmrc` in your app:

```ini
@tradenetcorp:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` needs `read:packages` (CI env var or user `~/.npmrc` locally).

**Packages:**

```bash
pnpm add @tradenetcorp/coral-ui
```

Peers (`react`, `react-dom`, `react-aria-components`) are required. `phosphor-react` is optional but used in docs/examples.

## Tailwind setup

In your global CSS (import once from app entry):

```css
@import 'tailwindcss';
@import '@tradenetcorp/coral-tokens/tailwind';
@import '@tradenetcorp/coral-ui/tailwind';
```

## Usage

```tsx
import { Button } from '@tradenetcorp/coral-ui/button';
import { Tabs, TabList, Tab, TabPanel } from '@tradenetcorp/coral-ui/tabs';
```

```tsx
import { Button } from '@tradenetcorp/coral-ui/button';
import { Plus } from 'phosphor-react';

export function CreateAction() {
  return (
    <Button variant="primary" style="fill" size="md" onPress={() => {}}>
      <Plus size={16} weight="bold" />
      <span>Create</span>
    </Button>
  );
}
```

## Troubleshooting

| Problem                                | Fix                                                                                       |
| -------------------------------------- | ----------------------------------------------------------------------------------------- |
| Unstyled UI                            | Add `@import "@tradenetcorp/coral-ui/tailwind"` (or equivalent `@source` to the package). |
| Can't resolve `@tradenetcorp/coral-ui` | Use a subpath, e.g. `@tradenetcorp/coral-ui/button`.                                      |
| Install 401/403                        | Check registry + `read:packages` on `GITHUB_TOKEN`.                                       |
| Wrong colors / dark mode               | Keep token import after `tailwindcss`.                                                    |

## Related

- [`@tradenetcorp/coral-tokens`](../tokens) — design tokens
