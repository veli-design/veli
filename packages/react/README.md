# Veli Design React component library

Package: `@veli-design/react`.

Accessible React primitives for the Veli Design. Built on [React Aria Components](https://react-spectrum.adobe.com/react-aria/) and Tailwind v4, using tokens from [`@veli-design/tokens`](https://github.com/tradenetcorp/veli/tree/main/packages/tokens#readme).

## Install

These package names are prepared for public npm publication. Until
publication, use the local tarball rehearsal in the repository migration runbook.
After publication, the default npm registry needs no extra configuration. If your
application overrides registries, route the scope explicitly in `.npmrc`:

```ini
@veli-design:registry=https://registry.npmjs.org
```

Public npm installation needs no token. See the migration runbook before switching an existing application.

**Packages:**

```bash
pnpm add @veli-design/react @veli-design/tokens
```

Peers (`@veli-design/tokens`, `react`, `react-dom`, `react-aria-components`) are
required. The React package installs `@phosphor-icons/react` automatically for its internal icons. If your app imports icons directly, add the package as a direct dependency:

```bash
pnpm add @phosphor-icons/react@^2.1.10
```

## Tailwind setup

In your global CSS (import once from app entry):

```css
@import 'tailwindcss';
@import '@veli-design/tokens/tailwind';
@import '@veli-design/react/tailwind';
```

## Usage

```tsx
import { Button } from '@veli-design/react/button';
import { Tabs } from '@veli-design/react/tabs';
```

```tsx
import { Button } from '@veli-design/react/button';
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

- `AGENT_GUIDE.md` — setup, lookup order, and implementation rules for Veli Design
- `agent/manifest.json` — component discovery and links to semantic sidecars
- `agent/components/*.json` — when to use each component, limitations, and relationships
- `agent/recipes/` — type-checked integration examples

Use the published TypeScript declarations for props and variants. Use
`@veli-design/tokens/tokens`, `/tailwind`, and `/css` as the token authorities.
Do not infer unsupported Veli Design APIs from the metadata.

## Next.js and Vitest

The Veli Design React component library ships explicit `.js` relative imports. After migrating, remove `@veli-design/react` from Next.js `transpilePackages` and Vitest `test.server.deps.inline` if those entries were added to work around Veli Design module resolution. Keep entries required by other packages.

Pages Router production SSR on Next **15.5.18** and **16.2.6**, and Vitest **4.1.11** with jsdom, are tested against a packed package without those workarounds. Existing Next 16 App Router browser tests also consume packed packages. Older Veli Design releases still contain invalid native ESM; an App Router build can hide that defect by bundling the package.

See the [consumer investigation and reproduction matrix](https://github.com/tradenetcorp/veli/blob/main/docs/ESM_CONSUMER_COMPATIBILITY.md). The tests cover package compatibility; validate your application's own build and tests after updating its dependency and configuration.

## Troubleshooting

| Problem                            | Fix                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| Unstyled UI                        | Add `@import "@veli-design/react/tailwind"` (or equivalent `@source` to the package). |
| Can't resolve `@veli-design/react` | Use a subpath, e.g. `@veli-design/react/button`.                                      |
| Install 401/403                    | Check that the public npm registry is selected.                                       |
| Wrong colors / dark mode           | Keep token import after `tailwindcss`.                                                |

## Related

- [`@veli-design/tokens`](https://github.com/tradenetcorp/veli/tree/main/packages/tokens#readme) — design tokens

## Licence and assets

Original software and code examples use MIT; original non-software documentation
uses CC BY 4.0. Installed packages include the root `LICENSE` and
`licensing/LICENSING.md` with scope and attribution information, the complete
CC BY text, and applicable third-party notices. See the
[repository licensing map](https://github.com/tradenetcorp/veli/blob/main/LICENSING.md)
for source policy and asset details (repository access required).
Original project work is copyright © 2026 Government of the Republic of Maldives.
Developed by MINDCo.
Fonts, government/brand imagery and copied Block SVGs are not included or
licensed by these npm packages; registry/hosted-site assets are separate.
