# Packages-first npm migration

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

## Licensing and package metadata

The three npm packages include standard software/documentation licence texts,
a concise scope/attribution notice and applicable third-party notices.
The full brand and asset policies remain root-only. Seven workspaces
contain discovery and mixed licence metadata; four fixture/sample manifests
remain private software inputs. The React, tokens and CLI READMEs document
public npm installation and the website/Storybook examples use the same names.

The copyright year is 2026. Brand permission contact and remaining asset
permissions are unresolved. The publication
script rejects incomplete legal templates through `assertReleaseLegal`;
packing for local validation remains available. See
[release readiness](RELEASE_READINESS.md) for artifact requirements.

## Publication hold

Release is manual and requires `VELI_NPM_PUBLICATION_APPROVED=true` as a repository
variable and in the publishing process. It also requires an explicit
`VELI_RELEASE_BRANCH` repository variable and a manual `dist-tag` input (passed
as `VELI_NPM_DIST_TAG` locally); neither has a default. Keep this unset until the
licence and artifact requirements are satisfied, npm namespace/publish permissions
are verified, bootstrap authentication is available, and the release branch,
exact versions and dist-tag are configured. The existing supported
versions are React 0.17.0, tokens 0.10.0 and CLI 0.1.1; pending Changesets describe
subsequent releases without applying version changes here. The React tokens peer
accepts both the retained 0.10 line and the planned 0.11 line. If the migration Changeset is applied before first publication, refresh Block dependency
ranges and tested versions against those versioned tarballs before activation;
the current fixtures deliberately test the retained versions. The rehearsal reads
actual installed tarball versions, checks every Block runtime/setup range and
requires its tested versions to match. It also rejects missing or incompatible
dependencies reported by the installed CLI. After versioning, update affected
Block ranges and tested versions with the required Block version/changelog bumps
in the release PR, then rerun the same tarball rehearsal; do not relax the gate
or rewrite historical archive hashes.

The recurring release workflow uses GitHub Actions OIDC with `id-token: write`;
no npm publish token is passed. Changesets 2.31.1 selects `pnpm publish` in this
workspace, and pinned pnpm 11.18.0 implements the npm OIDC token exchange.
`GITHUB_TOKEN` remains responsible for release PRs, tags, assets and validation.
The private source repository cannot produce public-source provenance, so the
workflow explicitly disables it.

Before recurring OIDC publication, publish the first audited release using an
authenticated npm account with permission for `veli-design`. Do not create empty
placeholder versions. Configure a trusted publisher separately for each of
`@veli-design/react`, `@veli-design/tokens` and `@veli-design/cli`: GitHub owner
`tradenetcorp`, repository `veli`, workflow filename `release.yml`. Permit direct
publication for the Changesets flow. This does not require a repository move.
Set `VELI_NPM_TRUSTED_PUBLISHING_READY=true` only after all three first
publications and trusted publishers are verified. Until then, CI can prepare a
release PR but refuses the publication path before attempting OIDC. Bootstrap
uses the same audited local publication script with account authentication; it
does not use the recurring CI workflow.

The publication entry point rejects any other public package or registry,
including personal scopes. Public npm installation requires no token.

## Registry and deployment transition

The live docs Worker also serves the Blocks catalog and source archives. Leave
its existing deployment running for old-scope consumers. The release-site deploy
workflow requires `VELI_REGISTRY_TRANSITION_APPROVED=true`; do not enable this
until an independently hosted new-scope registry URL and the old registry support
period are configured and validated. Any manual deployment of this branch to the existing Workers
would replace their catalogs, so it must remain on hold as well.

New CLI consumers must explicitly configure the new compatible registry URL via
`veli init`; npm access does not bypass registry access controls. Validate retrieval
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
separate operational gates.
