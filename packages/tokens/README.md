# @coral/tokens

Design tokens package for the Coral Design System, built with Terrazo and DTCG specification.

## Structure

\`\`\`
packages/tokens/
├── src/
│   └── design.tokens.json   # Source of truth (DTCG tokens from Figma)
├── dist/                     # Generated outputs (built automatically)
│   ├── tokens.css           # CSS variables
│   └── tailwind-theme.css   # Tailwind v4 theme with dark mode support
├── terrazzo.config.js
└── package.json
\`\`\`

## Usage

### In a Tailwind v4 Project

\`\`\`bash
npm install @coral/tokens
# or
pnpm add @coral/tokens
\`\`\`

Import the Tailwind theme in your CSS:

\`\`\`css
@import "@coral/tokens/tailwind";

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
import '@coral/tokens/tailwind';

// Import CSS variables
import '@coral/tokens/css';

// Access raw DTCG tokens
import tokens from '@coral/tokens/tokens';
\`\`\`

### Available Tokens

Your design tokens include:

**Colors:**
- Base colors: \`gray\`, \`blue\`, \`green\`, \`orange\`, \`red\` (100-1200 scale + alpha variants)
- Semantic colors: \`bg\` (surface, button, status, input, primary, secondary, danger, success)
- Text/Icon colors: \`fg\` (text, icons, border with multiple contrast levels)

**Typography:**
- Font families: \`San-serif\` (Inter), \`Monospace\` (IBM Plex Mono), \`Dhivehi\` (MV Typewriter)
- Type scale: Display, Heading, Body, etc.

**Dark Mode:**
All tokens include Light and Dark mode values, automatically handled via \`dark:\` variant.

## Development

\`\`\`bash
# Build tokens
pnpm build

# Watch mode (rebuilds on changes)
pnpm dev
\`\`\`

## Token Source

The source of truth is \`src/design.tokens.json\` in DTCG format, exported from Figma.

Generated files in \`dist/\` are automatically built on publish via the \`prepublishOnly\` hook.

## Configuration

The \`terrazzo.config.js\` maps your DTCG tokens to Tailwind v4 theme CSS. The current configuration:

- Maps all \`colors.*\` tokens to Tailwind color variables
- Maps \`typography.font-stack.*\` to font families
- Maps \`typography.type-scale.*\` to font sizes
- Generates dark mode variants from your token's \`Dark\` mode values
