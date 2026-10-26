# Packages-first npm migration (PD-595)

This branch prepares public `@veli-design/react`, `@veli-design/tokens`, and
`@veli-design/cli` from the private `tradenetcorp/veli` repository. The `veli`
executable and package versions remain continuous. Blocks stay a private
copy-source workspace. No package has been published by this implementation.

## Name mapping

| Previous package            | Prepared public npm package             |
| --------------------------- | --------------------------------------- |
| `@tradenetcorp/veli-ui`     | `@veli-design/react`                    |
| `@tradenetcorp/veli-tokens` | `@veli-design/tokens`                   |
| `@tradenetcorp/veli`        | `@veli-design/cli` (executable: `veli`) |

The source directory moves from `packages/ui` to `packages/react`. The Blocks,
web and Storybook private workspace names do not change. Old names in this table
are migration inputs, not installation instructions for the new package set.

## Bundled release preparation

PD-574 supplies proposed code licensing and scoped asset/third-party notices;
PD-573 covers mixed MIT/CC BY workspace metadata and MIT fixture metadata across the eleven tracked manifests (seven
workspaces including the root and four fixtures/samples); PD-582 covers package
discovery metadata for all seven workspaces. Fixture/sample manifests remain
private test inputs. PD-592 public installation guidance is covered by the React,
tokens and CLI READMEs and the existing website/Storybook migration guidance.

The CTO's conditional go-ahead permits preparation with appropriate notices;
legal review is expected before public announcement. This is not evidence of a
particular legal entity owning the code or rights to every asset. The MIT files
are explicitly unresolved copyright templates. Publication rejects these through
`assertReleaseLegal`; packing for local review remains available. See
[release readiness](RELEASE_READINESS.md) for the inventory and outstanding decisions.

## Publication hold

Release is manual and requires `VELI_NPM_PUBLICATION_APPROVED=true` as a repository
variable and in the publishing process. It also requires an explicitly approved
`VELI_RELEASE_BRANCH` repository variable and a manual `dist-tag` input (passed
as `VELI_NPM_DIST_TAG` locally); neither has a default. Keep this unset until the license and
artifact contents are approved, npm organization roles and all three names are
verified, bootstrap authentication is provisioned separately, and maintainers
choose the release branch, exact versions and dist-tag. The existing supported
versions are React 0.17.0, tokens 0.10.0 and CLI 0.1.1; pending Changesets describe
subsequent releases without applying version changes here. The React tokens peer
accepts both the retained 0.10 line and the planned 0.11 line. If maintainers
apply the migration Changeset before first publication, refresh Block dependency
ranges and tested versions against those versioned tarballs before activation;
the current fixtures deliberately test the retained versions.

`NPM_TOKEN` authenticates npm publication only. `GITHUB_TOKEN` remains responsible
for release PRs, tags and assets. No credentials or persistent trust were created.
There is no provenance claim: the source repository remains private. A future
trusted publisher configuration and first-publication bootstrap need separate
authorization. Public npm package installation requires no token.

## Registry and deployment transition

The live docs Worker also serves the Blocks catalog and source archives. Leave
its existing deployment running for old-scope consumers. The release-site deploy
workflow requires `VELI_REGISTRY_TRANSITION_APPROVED=true`; do not enable this
until an independently hosted new-scope registry URL and the old registry support
period are approved. Any manual deployment of this branch to the existing Workers
would replace their catalogs, so it must remain on hold as well.

New CLI consumers must explicitly configure the new compatible registry URL via
`veli init`; npm access does not bypass MINDCo access controls. Validate retrieval
and application builds before activating a public endpoint. This branch changes
local catalog output only, and does not provision a new endpoint.

## Consumer migration

Change dependencies, application imports, token CSS and copied Block imports as
one migration. Remove old packages and obsolete private-registry npmrc entries,
then regenerate the application lockfile. Avoid installing both React package
names (separate contexts) or loading both token stylesheets. Existing `.veli`
receipts and baseline source must remain byte-for-byte intact; do not rewrite
hashes to disguise changed source. Review CLI three-way merges when updating
Blocks to the new minor versions, keeping application customizations. A rollback
restores the old dependency graph, lockfile and registry URL together.

## Rehearsal

Run `node scripts/check-npm-migration.mjs <new-consumer-directory> <tarball-directory>`
with `ui.tgz`, `tokens.tgz`, and `cli.tgz`. CI packs all three once and runs this
check against the same immutable candidate artifact.

Use `corepack pnpm` throughout. Build and pack all three packages to temporary
files, install them in a consumer outside this repository, resolve public exports,
compile tokens/Tailwind CSS, run the installed `veli` executable and retrieve a
Block against a local catalog fixture. Existing CLI tests exercise archive receipts
and updates; package consumer checks must also use the tarballs. Do not run
`pnpm release` as a test. Publication and live retrieval verification remain
separate approval gates, and PD-595 stays In progress.
