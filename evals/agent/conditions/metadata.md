You are working in a Vite + React 19 + Tailwind v4 app that uses Veli
(`@veli-design/react` and `@veli-design/tokens`). If those packages
are not installed yet, install them from the local tarballs in `vendor/`.

Put new components in `src/`. Do not create a separate project.

Follow this lookup order before writing code:

1. `@veli-design/react/AGENT_GUIDE.md`
2. `@veli-design/react/manifest` (`agent/manifest.json`)
3. `agent/components/<id>.json` for the components you select
4. The matching `dist/<id>.d.ts` for props and composition
5. `agent/recipes/` for integration patterns
6. `@veli-design/tokens/tokens`, `/tailwind`, and `/css` for tokens

Do not invent a Veli component, prop, variant, token, slot, or interaction that
is not in those authorities. Package exports and declarations win if prose disagrees.
