# Veli Design System

A modern, accessible design system monorepo built with Turbo, React Aria, and Tailwind CSS v4.

## Published packages

| Package                                                  | Purpose                                                              | Install                              | Release history                           |
| -------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------- |
| [`@tradenetcorp/veli-ui`](packages/ui/README.md)         | Accessible React primitives styled with Tailwind CSS.                | `pnpm add @tradenetcorp/veli-ui`     | [Changelog](packages/ui/CHANGELOG.md)     |
| [`@tradenetcorp/veli-tokens`](packages/tokens/README.md) | Veli design tokens exported as CSS, Tailwind theme, and DTCG source. | `pnpm add @tradenetcorp/veli-tokens` | [Changelog](packages/tokens/CHANGELOG.md) |
| [`@tradenetcorp/veli`](packages/cli/README.md)           | CLI for installing and managing application-owned Veli Blocks.       | `pnpm dlx @tradenetcorp/veli`        | [Changelog](packages/cli/CHANGELOG.md)    |

GitHub shows this repository README on each connected package's landing page. Follow the
package links above for package-specific installation and usage documentation. Under a
package's **Recent versions**, **About this version** contains only that version's release
notes; the same notes are used for the corresponding repository release.

## Structure

```
veli/
├── apps/
│   ├── web/              # Documentation website (Astro)
│   └── storybook/        # Component development (Storybook)
├── packages/
│   ├── ui/               # React component library (React Aria)
│   ├── tokens/           # Design tokens (DTCG format)
│   ├── blocks/           # Canonical application-owned block source
│   └── cli/              # Veli Blocks CLI
```

## Getting Started

### Prerequisites

- Node.js >= 24
- pnpm, managed by Corepack, matching the `packageManager` field in `package.json`
  (currently `pnpm@11.18.0`)

### Installation

```bash
corepack enable pnpm
corepack install

pnpm install
```

Confirm both commands resolve the repository-pinned version:

```bash
pnpm --version
corepack pnpm --version
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

# Enforce reviewed Button/field contracts and report other styling findings (PD-809)
corepack pnpm lint:veli

# Run the same quality gates used before pushing
pnpm check
```

Husky installs Git hooks during `pnpm install`. Commits run `lint-staged` so staged
files are formatted and lint-fixed before they land. Pushes run `pnpm check` to
verify formatting, linting, and builds across the monorepo. Contributors can bypass
local hooks with `--no-verify`, but CI runs the same checks and blocks invalid PRs.

The [Veli component contracts](docs/VELI_STYLING.md) block reviewed Button/field
violations and report advisory findings for the remaining matrix. The separate
command and policy tests run in `check` and CI. The guide documents consumer opt-in,
explicit allowances, repository-local exceptions and coverage limits; installing
Veli does not enable lint in consuming apps.

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

- [Contributing Guide](CONTRIBUTING.md) - Development setup, changesets, commit convention, and pull request format
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community standards and reporting
- [Release Setup Guide](docs/RELEASE_SETUP.md) - Architecture, workflow, and troubleshooting
- [Changelog Authoring Guide](docs/CHANGELOG_AUTHORING.md) - Public release-note categories and Changeset workflow
- [Git Workflow](docs/GIT_WORKFLOW.md) - Branching, merge strategy, and trunk-based development conventions
