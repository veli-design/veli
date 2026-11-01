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

To create or refresh the bot's `changeset-release/main` PR without enabling
publication, run **Prepare release** (`prepare-release.yml`) manually on `main`.
The workflow must first exist on the default branch. It runs Changesets versioning
only, with no publish command, npm credentials, OIDC permission or dist-tag input.
It uses the repository token so the PR retains the authenticated bot identity;
approve its pending CI workflows and require fresh validation of the final head.
Do not manually merge stale versioning output or add human commits to the bot PR.
This preparation does not change the publication or registry-transition gates below.

Release is manual and requires `VELI_NPM_PUBLICATION_APPROVED=true` as a repository
variable and in the publishing process. It also requires an explicit
`VELI_RELEASE_BRANCH` repository variable and a manual `dist-tag` input (passed
as `VELI_NPM_DIST_TAG` locally); neither has a default. Keep this unset until the
licence and artifact requirements are satisfied, npm namespace/publish permissions
are verified, bootstrap authentication is available, and the release branch,
exact versions and dist-tag are configured. The existing supported
versions are React 0.17.0, tokens 0.10.0 and CLI 0.1.1; pending Changesets describe
subsequent releases without applying version changes here. Main's React changes require the planned tokens 0.11 line. Pending Changesets
remain unapplied in this PR. Before the package release, locally test the real
unreleased packages and review a separate Block preparation PR. Update only the
affected supported ranges and tested versions, with Block version/changelog bumps
when its distributed source or dependency contract changes. Include visual and
interaction validation in that review; a successful version bump is not proof of
compatibility.

CI recognizes a preparation PR when Block tested package versions point forward
from the checkout's package versions. They must exactly match the Changesets
plan. It clones the committed source into a disposable checkout, installs the
locked tools, applies `version-packages`, builds and packs the actual prospective
packages, then runs the same strict installed-package rehearsal. It neither edits
Block declarations nor widens supported ranges. Partial or incompatible
preparation fails. Ordinary PRs without forward declarations test current versions.

The authenticated bot release PR always tests its already-versioned exact tree;
it never reapplies pending Changesets. Its final full consumer checks and
release-validation artifact remain mandatory. Preparation inventory and tests
cannot authorize publication, and edits after final validation require fresh
bot-triggered validation of the final head. Do not put human Block preparation
commits into the final release PR or reuse stale validation. Do not rewrite
historical archive hashes.

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

The live docs Worker also serves the Blocks catalog and source archives. The
release-site deployment requires `VELI_REGISTRY_TRANSITION_APPROVED=true` after
explicit approval to roll out the current catalog. Current Blocks have been tested
with the published React 0.18.0/tokens 0.11.0 baseline; no new public endpoint,
public domain or repository transfer is required for an approved internal rollout.
Deploying the current catalog advertises new-scope dependencies. Applications
must coordinate package/import updates before requesting those newer versions;
existing installed source and receipts are not rewritten by a site deployment.
Full-history builds retain earlier versioned archive URLs.

The initial account-authenticated publication does not trigger the recurring CI
release handoff. Use the [deployment-only bootstrap path](RELEASE_SITES.md#deploy-the-already-published-npm-bootstrap)
to verify the exact published artifacts, build and deploy both internal sites
without republishing. It requires a separate explicit deployment option as well
as the rollout flag. Keep existing internal domain and WFA access settings.
CLI consumers still configure their compatible Veli Web URL through `veli init`;
public npm installation does not bypass registry access controls. A later public
endpoint or domain transition remains a separate decision.

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
check against the same immutable candidate artifact. For a committed local
preparation branch, run `node scripts/prepare-consumer-candidate.mjs <new-tarball-directory> false`
first. `preparation.json` records source, mode and actual package versions; it is
inventory, not a test-success or release-authorization record. Candidate digests
bind that inventory and every tarball to the checked source. Packaged docs use
the actual candidate versions, including in preparation mode.

Use `corepack pnpm` throughout. Build and pack all three packages to temporary
files, install them in a consumer outside this repository, resolve public exports,
compile tokens/Tailwind CSS, run the installed `veli` executable and retrieve a
Block against a local catalog fixture. Existing CLI tests exercise archive receipts
and updates; package consumer checks must also use the tarballs. Do not run
`pnpm release` as a test. Publication and live retrieval verification remain
separate operational gates.
