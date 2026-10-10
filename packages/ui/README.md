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
pnpm add @tradenetcorp/veli-ui @tradenetcorp/veli-tokens
```

Peers (`@tradenetcorp/veli-tokens`, `react`, `react-dom`, `react-aria-components`) are
required. Veli UI installs `@phosphor-icons/react` automatically for its internal icons. If your app imports icons directly, add the package as a direct dependency:

```bash
pnpm add @phosphor-icons/react@^2.1.10
```

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
import { Tabs } from '@tradenetcorp/veli-ui/tabs';
```

```tsx
import { Button } from '@tradenetcorp/veli-ui/button';
import { PlusIcon } from '@phosphor-icons/react';

export function CreateAction() {
  return (
    <Button intent="primary" appearance="fill" size="md" onPress={() => {}}>
      <PlusIcon size={16} weight="bold" />
      <span>Create</span>
    </Button>
  );
}
```

## AI assistants

The installed package includes version-matched guidance and semantic component metadata:

- `AGENT_GUIDE.md` — setup, lookup order, and Veli-wide implementation rules
- `agent/manifest.json` — component discovery and links to semantic sidecars
- `agent/components/*.json` — when to use each component, limitations, and relationships
- `agent/recipes/` — type-checked integration examples
- `skills/veli-ui/SKILL.md` — optional Agent Skill for automatic or manual loading

Use the published TypeScript declarations for props and variants. Use
`@tradenetcorp/veli-tokens/tokens`, `/tailwind`, and `/css` as the token authorities.
Do not infer unsupported Veli APIs from the metadata.

Agents that support project skills can copy `skills/veli-ui/` into their project skill
directory. [TanStack Intent](https://tanstack.com/intent/latest) users can opt in after
installing Veli:

```bash
npx @tanstack/intent@latest install
```

Intent discovers the version-matched skill from installed dependencies and adds loading
guidance to the consuming project.

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
