# Contributing to Veli

Thank you for contributing to Veli. This guide explains how to set up the
repository, follow the commit convention CI enforces, add changesets, and
prepare a focused pull request that works for both the Studio's Linear
workflow and external GitHub contributions.

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Development setup

### Prerequisites

- Node.js >= 24
- pnpm, managed by Corepack, matching the `packageManager` field in
  `package.json` (currently `pnpm@11.18.0`)

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
pnpm build
```

### Quality checks

```bash
# Format the repository
pnpm format

# Check formatting without writing changes
pnpm format:check

# Run ESLint
pnpm lint

# Run UI package tests
pnpm test:ui

# Run the same quality gates used before pushing
pnpm check
```

Husky installs Git hooks during `pnpm install`. Commits run `lint-staged` so
staged files are formatted and lint-fixed before they land. Pushes run
`pnpm check` to verify changesets, tests, formatting, linting, and builds
across the monorepo. Contributors can bypass local hooks with `--no-verify`,
but CI runs the same checks and blocks invalid PRs.

## Commit and pull request titles

Veli uses squash merge, so the pull request title becomes the commit message
on `main`. The `PR Title` workflow validates titles against Conventional
Commits:

```text
type(optional-scope)!: description
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
`build`, `ci`, `chore`, `revert`.

An optional scope must be lowercase alphanumeric with hyphens, for example
`ui`, `tokens`, `web`, `storybook`, or `ci`. Add `!` immediately before the
colon for a breaking change. The description must follow `: ` (colon and
space).

```text
feat(ui): add segmented control
fix(tokens): normalize OKLCH output
docs: document release workflow
chore: release packages
```

CI checks the **PR title**, not local feature-branch commits. Those commits
can stay informal because squash merge discards them. Keep `main` releasable
and land changes through reviewed pull requests. Use squash merge for normal
feature and fix PRs; use rebase merge only for an intentional sequence of
commits. Avoid merge commits, and delete feature branches after merging. See the
[Git workflow](docs/GIT_WORKFLOW.md) for repository maintenance and release guidance.

## Interactive cursor

Read [Cursor affordances](docs/CURSOR_AFFORDANCES.md) before you add or change an interactive host in `@veli-design/react`.

## Changesets

Changes that affect a published Veli package (`@veli-design/react` or
`@veli-design/tokens`) must include a changeset. Documentation-only
and internal-only changes do not.

Create one with:

```bash
pnpm changeset
```

Then validate it before opening the pull request:

```bash
pnpm changeset:check
```

Follow the [changelog authoring guide](docs/CHANGELOG_AUTHORING.md) for Keep
a Changelog categories and SemVer bump rules.

## Before opening a pull request

- Branch from the latest `main` and keep the change focused on one coherent
  outcome.
- Use a descriptive, short-lived branch name, such as `fix/button-focus`.
- Rebase on `main` before review if the branch has drifted.
- Reference a GitHub issue when one exists.

## Pull request format

GitHub pre-fills [the PR template](.github/PULL_REQUEST_TEMPLATE.md). Keep its
`Summary`, `Issues`, and `Validation` sections, and replace its comments with
the relevant information.

### Issue links

Use a GitHub closing keyword only when this pull request should close the issue:

```text
Closes #123
```

Otherwise mention `#123` with no closing keyword. For untracked
maintenance work, write `N/A` in the `Issues` section and briefly explain
why no issue is linked.

### Validation

Record the automated and manual checks you ran in `Validation`, including any
checks you intentionally skipped and why. Run the relevant quality checks
before requesting review.
