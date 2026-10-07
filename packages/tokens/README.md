# @tradenetcorp/veli-tokens

Design tokens package for the Veli Design System, built with Terrazo and DTCG specification.

## Structure

\`\`\`
packages/tokens/
├── src/
│ └── design.tokens.json # Source of truth (DTCG tokens from Figma)
├── dist/ # Generated outputs (built automatically)
│ ├── tokens.css # CSS variables
│ └── tailwind-theme.css # Tailwind v4 theme with dark mode support
├── terrazzo.config.js
└── package.json
\`\`\`

## Usage

### In a Tailwind v4 Project

\`\`\`bash
npm install @tradenetcorp/veli-tokens

# or

pnpm add @tradenetcorp/veli-tokens
\`\`\`

Import the Tailwind theme in your CSS:

\`\`\`css
@import "@tradenetcorp/veli-tokens/tailwind";

@tailwind base;
@tailwind components;
@tailwind utilities;
\`\`\`

This automatically includes:

- ✅ All color tokens (gray, blue, green, orange, red, bg, fg)
- ✅ Typography tokens (font families, type scale)
- ✅ Dark mode support via \`dark:\` variant

Or use specific exports:

\`\`\`javascript
// Import the Tailwind theme CSS
import '@tradenetcorp/veli-tokens/tailwind';

// Import CSS variables
import '@tradenetcorp/veli-tokens/css';

// Access raw DTCG tokens
import tokens from '@tradenetcorp/veli-tokens/tokens';
\`\`\`

### Available Tokens

Your design tokens include:

**Colors:**

- Base colors: \`gray\`, \`blue\`, \`green\`, \`orange\`, \`red\` (100-1200 scale + alpha variants)
- Semantic colors: \`bg\` (surface, button, status, input, primary, secondary, danger, success)
- Text/Icon colors: \`fg\` (text, icons, border with multiple contrast levels)

**Typography:**

- Font families: \`Sans-serif\` (Inter), \`Monospace\` (IBM Plex Mono), \`Dhivehi\` (MV Typewriter plus generated Dhivehi family stacks)
- Type scale: Display, Heading, Body, etc.
- Semantic \`type-\*\` utilities with \`:lang(dv)\` overrides for exported Dhivehi typography styles

**Dark Mode:**
All tokens include Light and Dark mode values, automatically handled via \`dark:\` variant.

## Development

\`\`\`bash

# Build tokens

pnpm build

# Watch mode (rebuilds on changes)

pnpm dev
\`\`\`

## Refreshing from Figma

Replace `src/design.tokens.json` with the fresh Tokens Bruecke DTCG export, including styles. Run `corepack pnpm --filter @tradenetcorp/veli-tokens build` from the repository root. Generated CSS must not be edited manually.

The build keeps the export intact, excludes Figma-only annotations and grid composites from CSS, and normalizes `highContrast` to `high-contrast` in generated Alert utility names. Existing code-owned motion primitives are supplied by `src/motion.tokens.json`; raw consumers can import them from `@tradenetcorp/veli-tokens/motion-tokens`.

## Token Source

The source of truth is \`src/design.tokens.json\` in DTCG format, exported from Figma.

Generated files in \`dist/\` are automatically built on publish via the \`prepublishOnly\` hook.

## Configuration

The \`terrazzo.config.js\` maps your DTCG tokens to Tailwind v4 theme CSS. The current configuration:

- Maps \`color.\*\` tokens to Tailwind color variables
- Maps \`font.\*\`, \`font-weight.\*\`, \`text.\*\`, \`leading.\*\`, and \`tracking.\*\` to typography theme variables
- Maps \`shadow.\*\`, \`ease.\*\`, \`duration.\*\`, and \`delay.\*\` to effect and motion theme variables
- Maps \`spacing.\*\`, \`radius.\*\`, \`blur.\*\`, \`breakpoints.\*\` (as \`breakpoint\`), and \`container.\*\` to layout and shape theme variables
- Generates dark mode variants from your token's \`Dark\` mode values
