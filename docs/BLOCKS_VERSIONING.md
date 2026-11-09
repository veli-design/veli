# Veli Blocks versioning and lifecycle

Blocks are copied source, not npm packages. The private `packages/blocks`
workspace is not published and therefore does not use Changesets. Every block
has its own version in `manifest.json` and release notes in its `CHANGELOG.md`.

Increase the version and add release notes when downloadable source or its
dependency contract changes. On the pre-stable `0.x` line, use a patch for a
compatible fix and a minor for additions or breaking changes. Promotion to
`1.0.0` is a deliberate maintainer decision. After that, use normal SemVer.

Allowed manifest statuses are:

- `experimental`: the default for a new block; it may change as internal teams
  adopt it.
- `stable`: approved for broad use after source, accessibility, and consumer
  integration review; it must be version `1.0.0` or later.
- `deprecated`: still available temporarily; its README and changelog must
  name a replacement or migration path.

Do not introduce other status values. Before changing a block, ensure its
version, changelog, and status still describe the source contract.
