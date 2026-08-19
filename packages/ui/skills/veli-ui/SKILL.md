---
name: veli-ui
description: >
  Implements React interfaces with @tradenetcorp/veli-ui and
  @tradenetcorp/veli-tokens. Use when setting up Veli, selecting or composing
  Veli components, applying Veli tokens, preserving accessibility or Dhivehi
  RTL behavior, or troubleshooting Veli imports and styling.
metadata:
  type: core
  library: '@tradenetcorp/veli-ui'
  framework: react
sources:
  - 'tradenetcorp/veli:packages/ui/AGENT_GUIDE.md'
  - 'tradenetcorp/veli:packages/ui/agent/manifest.json'
  - 'tradenetcorp/veli:packages/ui/package.json'
---

# Veli UI

## Start here

1. Read `../../AGENT_GUIDE.md` for setup, lookup order, and system-wide rules.
2. Read `../../agent/manifest.json` to discover available components and exact import paths.
3. Read only the referenced component sidecars needed for the task.
4. Inspect the installed `dist/*.d.ts` declarations before selecting props or variants.
5. Use the installed token package exports rather than guessing token values or utility names.

## Decision rules

- Choose components by purpose, not appearance.
- Use the manifest and declarations as an allowlist. Never claim an unsupported component, prop,
  variant, slot, token, or interaction is part of Veli.
- Prefer a documented Veli composition. If none fits, identify the gap and keep application-owned
  code distinct from Veli APIs.
- Preserve accessible names, keyboard behavior, focus, form errors, reduced motion, responsive
  layout, dark mode, and English/Dhivehi direction.

## Finish

Typecheck generated code and follow the verification checklist in `../../AGENT_GUIDE.md` before
presenting the implementation as complete.
