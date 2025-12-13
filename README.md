# Coral Design System

A modern, accessible design system monorepo built with Turbo, React Aria, and Tailwind CSS v4.

## Structure

```
coral/
├── apps/
│   ├── web/              # Documentation website (Astro)
│   └── storybook/        # Component development (Storybook)
├── packages/
│   ├── ui/               # React component library (React Aria)
│   └── tokens/           # Design tokens (DTCG format)
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm 10.24.0

### Installation

```bash
pnpm install
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm --filter @coral/web dev
pnpm --filter @coral/storybook dev
```

### Build

```bash
# Build all packages and apps
pnpm build
```

## Packages

### @coral/ui

Primitive UI components built with React Aria for accessibility, styled with Tailwind CSS.

### @coral/tokens

Design tokens in DTCG format, built with Terrazo to generate CSS variables and Tailwind theme.

## Apps

### web

Marketing and documentation website built with Astro, featuring:

- Static site generation
- MDX support for component documentation
- Content collections
- Tailwind CSS v4

### storybook

Standalone Storybook app for component development and testing.
