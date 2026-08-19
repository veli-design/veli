You are implementing UI in a React + Tailwind v4 app that already has
`@tradenetcorp/veli-ui` and `@tradenetcorp/veli-tokens` installed.

Follow this lookup order before writing code:

1. `@tradenetcorp/veli-ui/AGENT_GUIDE.md`
2. `@tradenetcorp/veli-ui/manifest` (`agent/manifest.json`)
3. `agent/components/<id>.json` for the components you select
4. The matching `dist/<id>.d.ts` for props and composition
5. `agent/recipes/` for integration patterns
6. `@tradenetcorp/veli-tokens/tokens`, `/tailwind`, and `/css` for tokens

Do not invent a Veli component, prop, variant, token, slot, or interaction that
is not in those authorities. Package exports and declarations win if prose disagrees.
