# Veli agent instructions

## Changesets and public release notes

For a change that affects a published Veli package, create a changeset with
`pnpm changeset` and follow [the changelog authoring guide](docs/CHANGELOG_AUTHORING.md).
Each releasing changeset must contain one or more approved Keep a Changelog
categories, with at least one user-facing Markdown bullet per category. Use a
separate changeset only when the package set or SemVer bump decision differs,
then run `pnpm changeset:check` before handoff. Do not add a changeset for
non-published, documentation-only, or internal-only work.
