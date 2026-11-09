# Veli agent instructions

## Package manager

Use `corepack pnpm …` for repository commands. Do not assume a globally
resolved bare `pnpm` matches the version declared in `packageManager`.

## Pull request authoring

When opening or updating a pull request, use
[`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md) and
keep its `Summary`, `Issues`, and `Validation` sections.

- Use a Conventional Commits PR title, such as `feat(ui): add segmented
control`; squash merge uses it as the commit message on `main`.
- For a GitHub issue, add `Closes #123` only when the PR should
  close it; otherwise mention `#123` without a closing keyword. For
  untracked maintenance work, write `N/A` with a brief reason.
- List every automated and manual check run in `Validation`, and state any
  intentionally skipped check and why.

## Changesets and public release notes

For a change that affects a published Veli package, create a changeset with
`pnpm changeset` and follow [the changelog authoring guide](docs/CHANGELOG_AUTHORING.md).
Each releasing changeset must contain one or more approved Keep a Changelog
categories, with at least one user-facing Markdown bullet per category. Use a
separate changeset only when the package set or SemVer bump decision differs,
then run `pnpm changeset:check` before handoff. Do not add a changeset for
non-published, documentation-only, or internal-only work.

## Blocks versioning and lifecycle

`packages/blocks` is a private authoring workspace for copied source, so do
not create a Changeset for it. Version each distributable block in its
`manifest.json` and add its release notes to that block's `CHANGELOG.md`.
Follow [the Blocks versioning and lifecycle guide](docs/BLOCKS_VERSIONING.md):
new blocks are `experimental`; only a deliberate approval may promote a block
to `stable` and its first stable release is `1.0.0`; `deprecated` blocks must
name a replacement or migration path. Do not invent other status values.
