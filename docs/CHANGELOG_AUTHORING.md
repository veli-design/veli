# Changelog authoring

Veli uses [Changesets](https://github.com/changesets/changesets) for package
versioning and publishing, and [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/)
for release-note authoring. Changeset entries are public release notes: write
for package consumers, not for the commit log.

## Create a changeset

Run `pnpm changeset` and select every published package affected by the
consumer-facing change. The guided command asks for the SemVer bump, one or more
Keep a Changelog categories, and user-facing bullets. It writes a standard Changesets
Markdown file in `.changeset/`.

Use `pnpm changeset:raw` only when the stock Changesets CLI is required. Edit
the resulting file into the format below before committing it.

```markdown
---
'@veli-design/react': minor
---

### Added

- Add a `CommandMenu` component for searchable application actions.
```

Every releasing changeset must have one or more of these headings. A heading may
appear at most once in a file, and each heading needs at least one bullet:

- `### Added` — new, backwards-compatible functionality.
- `### Changed` — a meaningful change to existing behaviour.
- `### Deprecated` — functionality that remains available but is planned for removal.
- `### Removed` — functionality removed in this release.
- `### Fixed` — a user-observable defect correction.
- `### Security` — a vulnerability or security-hardening change relevant to consumers.

Write one concise bullet that states what changed and, when useful, how a
consumer should adapt. Do not use commit hashes, issue IDs, internal process
notes, or vague text such as “miscellaneous updates”. A single changeset may
contain every category relevant to its package and SemVer decision. Create
another changeset only when a pull request needs a different package set or
independent SemVer bump decision.

## Choose the version bump independently

The changelog category describes the kind of user-visible change; the Changeset
bump describes its SemVer impact.

- Use `patch` for backwards-compatible fixes and small compatible corrections.
- Use `minor` for backwards-compatible additions and meaningful compatible changes. While a
  package is below `1.0.0`, also use `minor` for breaking changes so the package remains on the
  explicitly pre-stable `0.x` line.
- Use `major` when a package is already stable and consumers must change code, imports,
  configuration, tokens, or behaviour to upgrade safely.

The changeset tooling prevents `major` bumps for `0.x` packages because that would promote the
package to the stable `1.0.0` release. Preparing `1.0.0` requires an intentional, separately
reviewed update to this policy and its validation guardrail.

Documentation-only, tooling-only, and internal refactors that do not change a
published package do not need a changeset. An empty Changeset is allowed only
for an explicit no-release marker and must have no changelog body.

## Validation and release output

Run `pnpm changeset:check` before opening a pull request. CI blocks malformed
changesets. During the release workflow, `pnpm version-packages` keeps
Changesets' release plan and publishing behaviour, then writes dated Keep a
Changelog sections to each published package's `CHANGELOG.md`. Existing legacy
entries are intentionally preserved.

Release headings use the exact form `## <version>`, with the release date on the
following line. `changesets/action@v1` requires that exact heading to isolate one
version for release pull requests and GitHub Releases. This intentionally favors
Changesets compatibility over Keep a Changelog's optional bracketed version-link
convention. During publishing, the same version section is temporarily prepended to
the package README in the package artifact to include release-specific notes
without hiding setup and usage guidance. The source package
README is restored after publishing.
