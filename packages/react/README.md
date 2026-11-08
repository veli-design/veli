# Veli Design React component library

Package: `@veli-design/react`.

Accessible React primitives for the Veli Design. Built on [React Aria Components](https://react-spectrum.adobe.com/react-aria/) and Tailwind v4, using tokens from [`@veli-design/tokens`](https://www.npmjs.com/package/@veli-design/tokens).

## Install

The packages are available on the public npm registry. Installation needs no
package-read token or repository access. If your application overrides registries,
route the scope explicitly in `.npmrc`:

```ini
@veli-design:registry=https://registry.npmjs.org
```

```bash
npm install @veli-design/react @veli-design/tokens react-aria-components
```

Peers (`@veli-design/tokens`, `react`, `react-dom`, `react-aria-components`) are
required. The React package installs `@phosphor-icons/react` automatically for its internal icons. If your app imports icons directly, add the package as a direct dependency:

```bash
npm install @phosphor-icons/react@^2.1.10
```

## Fresh Vite + React + TypeScript app

Use Node.js 24 or newer. Create the React/TypeScript template and install the
public packages and Tailwind v4 Vite integration:

```bash
npm create vite@latest my-veli-app -- --template react-ts
cd my-veli-app
npm install
npm install @veli-design/react @veli-design/tokens react-aria-components
npm install -D tailwindcss@^4 @tailwindcss/vite@^4
```

In `vite.config.ts`, register Tailwind alongside React:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

Replace the template's `src/index.css` with these imports, in this order. The
token adapter includes the CSS variables; the React adapter registers component
sources for Tailwind. No extra `@source` directive is needed.

```css
@import 'tailwindcss';
@import '@veli-design/tokens/tailwind';
@import '@veli-design/react/tailwind';
```

Keep `import './index.css'` in `src/main.tsx`. Replace `src/App.tsx` with:

```tsx
import { useState } from 'react';
import { Button } from '@veli-design/react/button';
import { VeliProvider } from '@veli-design/react/provider';

export default function App() {
  const [dark, setDark] = useState(false);

  return (
    <VeliProvider language="en" colorScheme={dark ? 'dark' : 'light'}>
      <main className="min-h-screen bg-bg-surface-base p-6 text-base-default">
        <h1 className="type-heading-3-bold mb-4">Hello Veli</h1>
        <Button onPress={() => setDark((value) => !value)}>
          Switch to {dark ? 'light' : 'dark'} mode
        </Button>
      </main>
    </VeliProvider>
  );
}
```

Remove the template's `import './App.css'` if retaining your own `App.tsx`.
Those starter styles constrain the page and can override the intended layout.

```bash
npm run build
npm run dev
```

Check that the button is styled and switches the page between light and dark.
`VeliProvider` synchronizes the theme on the document root. Use
`colorScheme="system"` to follow the system preference (or the saved Veli theme),
and `language="dv"` for Dhivehi language and RTL direction. Fonts are host-owned:
the app must load Inter for the intended Latin typography and its licensed
Dhivehi fonts when needed; system fallbacks work without font downloads.

For existing apps, apply the same Tailwind plugin, CSS imports and provider setup.
See the public [Vite guide](https://vite.dev/guide/) and
[Tailwind Vite guide](https://tailwindcss.com/docs/installation/using-vite)
for framework prerequisites.

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

These checks cover package compatibility; validate your application's own build and tests after updating its dependency and configuration. No private repository guide is needed for this setup.

## Troubleshooting

| Problem                            | Fix                                                                        |
| ---------------------------------- | -------------------------------------------------------------------------- |
| Unstyled UI                        | Register the Tailwind Vite plugin and include all three CSS imports above. |
| Can't resolve `@veli-design/react` | Use a subpath, e.g. `@veli-design/react/button`.                           |
| Install 401/403                    | Check that the public npm registry is selected.                            |
| Wrong colors / dark mode           | Keep the CSS import order above and wrap the app in `VeliProvider`.        |

## Related

The token reference is also included locally at
`node_modules/@veli-design/tokens/README.md`; the setup above is self-contained
and does not require hosted documentation. Hosted Web/Storybook and the Blocks
registry require WFA access and are not part of this anonymous npm setup.

- [`@veli-design/tokens`](https://www.npmjs.com/package/@veli-design/tokens) — design tokens

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
