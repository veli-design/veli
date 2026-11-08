# Veli Design

A modern, accessible design system monorepo built with Turbo, React Aria, and Tailwind CSS v4.

## Packages

The `@veli-design` packages below are available on public npm without a package-read token.
The repository remains private under `tradenetcorp`; hosted documentation, Storybook
and the Blocks registry require WFA access. For a new application, follow the
[React package setup](https://www.npmjs.com/package/@veli-design/react).
Existing applications should consult [the migration runbook](docs/NPM_MIGRATION.md).

| Package                                            | Purpose                                                               | Install                        | Release history                           |
| -------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------ | ----------------------------------------- |
| [`@veli-design/react`](packages/react/README.md)   | Accessible React primitives styled with Tailwind CSS.                 | `pnpm add @veli-design/react`  | [Changelog](packages/react/CHANGELOG.md)  |
| [`@veli-design/tokens`](packages/tokens/README.md) | Veli Design tokens exported as CSS, Tailwind theme, and DTCG source.  | `pnpm add @veli-design/tokens` | [Changelog](packages/tokens/CHANGELOG.md) |
| [`@veli-design/cli`](packages/cli/README.md)       | CLI for installing and managing application-owned Veli Design Blocks. | `pnpm dlx @veli-design/cli`    | [Changelog](packages/cli/CHANGELOG.md)    |

Follow the package links above for package-specific installation and usage. Release
artifacts include the matching changelog notes in their README; the same notes
are used for the corresponding GitHub Release. The repository remains under
`tradenetcorp` during this packages-first migration.

To copy Blocks into an application, run `pnpm dlx @veli-design/cli init` from its
package directory, then `pnpm dlx @veli-design/cli add`. New CLI setups default to
`https://veli.design`; existing project registry configuration is preserved.
See the [CLI guide](packages/cli/README.md) for URL overrides, access requirements
and instructions for CLI 0.2.0 or older.

## Structure

```
veli/
├── apps/
│   ├── web/              # Documentation website (Astro)
│   └── storybook/        # Component development (Storybook)
├── packages/
│   ├── react/            # React component library (React Aria)
│   ├── tokens/           # Design tokens (DTCG format)
│   ├── blocks/           # Canonical application-owned block source
│   └── cli/              # Veli Design CLI
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

# Report warning-only Veli styling findings (PD-809)
corepack pnpm lint:veli

# Run the same quality gates used before pushing
pnpm check
```

Husky installs Git hooks during `pnpm install`. Commits run `lint-staged` so staged
files are formatted and lint-fixed before they land. Pushes run `pnpm check` to
verify formatting, linting, and builds across the monorepo. Contributors can bypass
local hooks with `--no-verify`, but CI runs the same checks and blocks invalid PRs.

The [Veli component contracts](docs/VELI_STYLING.md) report styling warnings for
all 96 component/part contracts, including Button/field arbitrary-value checks.
Styling findings stay non-blocking; parse/configuration failures still fail. The separate
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

This monorepo uses [Changesets](https://github.com/changesets/changesets) for versioning and gated releases to public npm. See [the migration runbook](docs/NPM_MIGRATION.md) for release procedures and migration checks. Design tokens are synced from Figma via Veli Bridge (Figma Plugin) and Veli Bridge Bot (GitHub App).

**Documentation:**

- [Contributing Guide](CONTRIBUTING.md) - Development setup, changesets, commit convention, and pull request format
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community standards and reporting
- [Release Setup Guide](docs/RELEASE_SETUP.md) - Architecture, workflow, and troubleshooting
- [Changelog Authoring Guide](docs/CHANGELOG_AUTHORING.md) - Public release-note categories and Changeset workflow
- [Git Workflow](docs/GIT_WORKFLOW.md) - Branching, merge strategy, and trunk-based development conventions

## Licensing

Original software and code examples use the standard MIT licence in `LICENSE`;
original non-software documentation uses CC BY 4.0 in `LICENSES/CC-BY-4.0.txt`.
[LICENSING.md](LICENSING.md) maps the scopes and attribution information.
[BRAND_POLICY.md](BRAND_POLICY.md), [ASSET_LICENSES.md](ASSET_LICENSES.md) and
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) keep excluded assets and upstream
rights separate. Original project work is copyright © 2026 Government of the
Republic of Maldives. Developed by MINDCo. Brand permission contact and applicable asset permissions
remain unresolved. See [release readiness](docs/RELEASE_READINESS.md).
