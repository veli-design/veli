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

- Node.js >= 24
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
pnpm --filter @tradenetcorp/coral-web dev
pnpm --filter @tradenetcorp/coral-storybook dev
```

### Build

```bash
# Build all packages and apps
pnpm build
```

## Packages

### @tradenetcorp/coral-ui

Primitive UI components built with React Aria for accessibility, styled with Tailwind CSS.

### @tradenetcorp/coral-tokens

Design tokens in DTCG format, built with Terrazzo to generate CSS variables and Tailwind theme.

## Apps

### @tradenetcorp/coral-web

Marketing and documentation website built with Astro, featuring:

- Static site generation
- MDX support for component documentation
- Content collections
- Tailwind CSS v4

### @tradenetcorp/coral-storybook

Standalone Storybook app for component development and testing.

## Releases & Publishing

This monorepo uses [Changesets](https://github.com/changesets/changesets) for automated versioning and releases to GitHub Packages. Design tokens are synced from Figma via Coral Bridge (Figma Plugin) and Coral Bridge Bot (GitHub App).

**Documentation:**

- 📚 [Release Setup Guide](docs/RELEASE_SETUP.md) - Architecture, workflow, and troubleshooting
