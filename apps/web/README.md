# Veli documentation website

The public website uses Astro, MDX, and React. Component documentation lives in
`src/content/docs/`; foundation documentation lives in `src/content/foundations/`.
Reusable interactive examples live in `src/components/`.

## Package references

Website code examples use `@veli-design/react` and `@veli-design/tokens`;
React source lives in `packages/react`. Both packages are available on public npm.
Coordinate application and copied-Block imports with the matching registry; see the
[package migration notes](../../README.md#migrating-from-private-package-names).

`@tradenetcorp/veli-web` remains the private documentation workspace name.

## Code blocks

Write fenced code directly in MDX. The site adds syntax highlighting for light and
dark themes, a copy button, and line numbers for multiline highlighted code.
No component import is required for code blocks.

````mdx
```tsx
import { Button } from '@veli-design/react/button';
```
````

Blocks with **24 or more lines** start collapsed with an **Expand (N lines)** button.
Expanded code areas have a **480px maximum height** and scroll vertically;
long lines scroll horizontally. Copy includes the complete source, without line
numbers. **Collapse** collapses the block and resets its vertical scroll position.

### Install commands

A single-line `pnpm add …` command in a `bash`, `sh`, or `shell` fence automatically
gets pnpm, npm, yarn, and bun tabs. Copy uses the selected package manager's command.

````mdx
```bash
pnpm add @veli-design/react
```
````

Use package names for these examples. The tabs replace the command prefix; they
do not translate package-manager-specific flags. Other shell commands and
multiline shell scripts remain ordinary code blocks.

### Filename headers

Add a double-quoted `title` to show a filename header and copy control:

````mdx
```tsx title="app/page.tsx"
import { Button } from '@veli-design/react/button';

export default function Page() {
  return <Button>Continue</Button>;
}
```
````

Long filenames truncate within the header. The title is display metadata; it does
not load or import that file.

## Interactive previews

Import a React demo into MDX, place it inside a `div` with `className="preview"`,
and put its source fence immediately after the wrapper:

````mdx
import { ButtonUsageDemo } from '../../components/DocsExamples';

<div className="preview">
  <ButtonUsageDemo client:visible />
</div>

```tsx
<Button>Click me</Button>
```
````

The build joins the preview and adjacent code block into one card. Blank lines
are allowed between them; a paragraph, heading, or other element breaks the pair.
A preview without an adjacent code fence renders by itself.

The React demo supplies the working UI. The code fence supplies the displayed
source; it is **not extracted from the demo**. Keep both in sync when changing an
example.

### Expansion controls

Set these classes on the preview wrapper to control the adjacent source block:

| Wrapper class                  | Initial source state                             |
| ------------------------------ | ------------------------------------------------ |
| `preview`                      | Expanded below 24 lines; collapsed at 24 or more |
| `preview preview--collapsible` | Collapsed, including short examples              |
| `preview preview--expanded`    | Expanded, including long examples                |

Choose one modifier. The 480px scrolling limit still applies to expanded code.
These modifiers belong on the preview wrapper, not on the code fence.

### Demo structure and hydration

The Markdown export validates preview markup. Use:

- One `div` with a static `className` attribute containing `preview`.
- Exactly one imported, self-closing component whose name ends in `Demo`.
- Only `client:visible` or `client:load` on that component; no additional props.

Prefer `client:visible` for examples that can hydrate when they enter the viewport.
Use `client:load` when interaction must be ready on page load. Put state, props,
additional markup, and configuration inside the React demo. If an example needs
fixed props, export a small `*Demo` wrapper that supplies them.

### Previews with options

Use `DocsPreview` and `DocsPreviewOption` from `src/components/DocsPreview.tsx`
inside a React demo. `DocsPreview` supplies the surface-base options header and
raised canvas; `DocsPreviewOption` supplies the dropdown with Veli menu items.
Controls wrap on narrow screens. Keep selection state in the demo:

```tsx
import { useState } from 'react';
import { Button } from '@veli-design/react/button';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';

export function ButtonOptionsDemo() {
  const [label, setLabel] = useState('Continue');

  return (
    <DocsPreview
      controls={
        <DocsPreviewOption
          label="Button label"
          value={label}
          options={['Continue', 'Save']}
          onChange={setLabel}
        />
      }
    >
      <Button>{label}</Button>
    </DocsPreview>
  );
}
```

Place the demo in an MDX wrapper with `className="preview"`, followed by its source
fence. `DocsPreview` automatically applies the options layout to that wrapper,
including before hydration; no extra styling prop or class is needed. The old
`preview--options` class remains supported for compatibility. Add
`preview--expanded` or `preview--collapsible` as needed. For multiple controls,
pass a fragment of `DocsPreviewOption` components to `controls`, each with its
own state. Changing controls updates the live demo, not the source fence.

The site's plain Markdown export replaces interactive previews with a link to the
rendered page and preserves the source fences. Unsupported preview JSX fails the
build rather than being silently omitted.

## Local development and validation

Run these commands from the repository root:

```sh
corepack pnpm --filter @tradenetcorp/veli-web dev
corepack pnpm --filter @tradenetcorp/veli-web test
corepack pnpm --filter @tradenetcorp/veli-web build
corepack pnpm --filter @tradenetcorp/veli-web preview
```

`build` runs tests, Astro synchronization and typechecking, the production build,
and Markdown/`llms.txt` validation. `preview` serves the latest production build;
use `dev` for live edits.

When adding a public docs page, update navigation in `src/lib/site.ts` and the
expected page counts in `scripts/validate-docs-artifacts.mjs`.

Check examples in both themes and at a narrow viewport. Verify keyboard access,
copying the complete source, long-line scrolling, and expansion/collapse behavior.

## Implementation

- [Astro configuration](astro.config.mjs): highlighting themes and filename metadata.
- [Code-block transform](src/lib/rehype-code-blocks.mjs): variants, controls, and preview pairing.
- [Code-block component](src/components/DocsCodeBlocks.astro): browser behavior and styling.
- [Global styles](src/styles/global.css): shared preview containers.
- [Markdown export](src/lib/remark-docs-markdown.mjs): supported MDX authoring structure.
