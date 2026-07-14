# Veli Design System

A modern, accessible design system monorepo built with Turbo, React Aria, and Tailwind CSS v4.

## Structure

```
veli/
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
pnpm --filter @tradenetcorp/veli-web dev
pnpm --filter @tradenetcorp/veli-storybook dev
```

### Build

```bash
# Build all packages and apps
pnpm build
```

### Code Quality

```bash
# Format the repository
pnpm format

# Check formatting without writing changes
pnpm format:check

# Run ESLint
pnpm lint

# Run the same quality gates used before pushing
pnpm check
```

Husky installs Git hooks during `pnpm install`. Commits run `lint-staged` so staged
files are formatted and lint-fixed before they land. Pushes run `pnpm check` to
verify formatting, linting, and builds across the monorepo. Contributors can bypass
local hooks with `--no-verify`, but CI runs the same checks and blocks invalid PRs.

## Packages

### @tradenetcorp/veli-ui

Primitive UI components built with React Aria for accessibility, styled with Tailwind CSS.

### @tradenetcorp/veli-tokens

Design tokens in DTCG format, built with Terrazzo to generate CSS variables and Tailwind theme.

## Apps

### @tradenetcorp/veli-web

Marketing and documentation website built with Astro, featuring:

- Static site generation
- MDX support for component documentation
- Content collections
- Tailwind CSS v4

### @tradenetcorp/veli-storybook

Standalone Storybook app for component development and testing.

## Releases & Publishing

This monorepo uses [Changesets](https://github.com/changesets/changesets) for automated versioning and releases to GitHub Packages. Design tokens are synced from Figma via Veli Bridge (Figma Plugin) and Veli Bridge Bot (GitHub App).

**Documentation:**

- [Release Setup Guide](docs/RELEASE_SETUP.md) - Architecture, workflow, and troubleshooting
- [Changelog Authoring Guide](docs/CHANGELOG_AUTHORING.md) - Public release-note categories and Changeset workflow
- [Git Workflow](docs/GIT_WORKFLOW.md) - Branching, merge strategy, and trunk-based development conventions
