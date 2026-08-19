# Using Veli with coding agents

This guide applies to the installed versions of `@tradenetcorp/veli-ui` and
`@tradenetcorp/veli-tokens`.

## Lookup order

1. Read `agent/manifest.json` to discover public components and their import paths.
2. Read the referenced `agent/components/<id>.json` sidecar to decide whether the component fits
   the task.
3. Read the public declaration under `dist/<id>.d.ts` for props, variants, events, and exported
   composition parts.
4. Use the token package exports as styling authorities:
   - `@tradenetcorp/veli-tokens/tokens` for raw DTCG definitions
   - `@tradenetcorp/veli-tokens/tailwind` for Tailwind theme utilities
   - `@tradenetcorp/veli-tokens/css` for CSS custom properties
5. Use `agent/recipes/` for shared integration patterns.

Package exports and declarations override prose when they disagree. Do not invent a Veli component,
prop, variant, token, slot, or interaction that is not present in those authorities.

## Setup

Install both packages and the React Aria peer:

```bash
pnpm add @tradenetcorp/veli-ui @tradenetcorp/veli-tokens react-aria-components
```

Import Tailwind and Veli sources once in the application stylesheet:

```css
@import 'tailwindcss';
@import '@tradenetcorp/veli-tokens/tailwind';
@import '@tradenetcorp/veli-ui/tailwind';
```

Wrap the application or Veli subtree with `VeliProvider` when language, direction, or color scheme
must be coordinated:

```tsx
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <VeliProvider language="en" colorScheme="system">
      {children}
    </VeliProvider>
  );
}
```

All interactive Veli modules are client components. Keep the provider and interactive imports below
the client boundary in React Server Component applications.

## Implementation rules

- Import every component from its documented subpath. There is no root component barrel.
- Use `onPress` for Veli and React Aria actions in approved examples.
- Choose components by semantics before appearance. Use `Button` for actions and `Link` for
  navigation.
- Prefer `Select` for fixed choices and `ComboBox` when users need to search choices.
- Use `Alert` for persistent inline feedback and `Toast` for transient queued feedback.
- Use `Tooltip` for non-interactive hints, `Popover` for anchored interactive content, and `Modal`
  for blocking work.
- Use semantic token utilities. Do not substitute raw palette values or guess class names from token
  paths.
- Treat `className` as a layout escape hatch unless the component documentation explicitly permits
  visual customization.

## Accessibility and language

- Preserve the accessible labels required by the public types and component sidecar.
- Give icon-only controls and unnamed regions an explicit accessible name.
- Give complex collection items a `textValue` or `aria-label`.
- Keep visible focus, keyboard operation, error associations, and reduced-motion behavior intact.
- Test both `language="en"` and `language="dv"`.
- Use logical layout and `start`/`end` placement. Do not hard-code left/right for directional UI.
- Keep credentials, URLs, telephone numbers, file sizes, and similar values LTR where the component
  contract requires it.
- Synchronize document-level dark mode when portaled overlays render outside the provider wrapper.

## Responsive behavior

Veli components generally size within their container; responsive page composition belongs to the
consumer. Do not invent responsive component props. Use documented component behavior and semantic
layout utilities, then verify narrow and wide viewports.

## Verification

Before presenting generated code as complete:

1. Confirm every Veli import exists in `agent/manifest.json`.
2. Typecheck against the installed declarations.
3. Confirm token utilities exist in the installed token output.
4. Check accessible names, keyboard behavior, loading/disabled behavior, and form errors.
5. Check narrow layout, dark mode, English LTR, and Dhivehi RTL where relevant.
6. If Veli does not support the requested capability, say so and suggest the nearest documented
   component or an application-owned composition.

## Optional skill loading

The package ships `skills/veli-ui/SKILL.md`. Consumers may copy that directory into their agent's
project skill directory or use TanStack Intent's opt-in dependency discovery. The skill routes agents
to this guide and the version-matched manifest; it does not replace either source.
