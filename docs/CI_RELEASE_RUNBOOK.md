# CI and release operations

The normal release path is: validate and merge the Changesets release PR, publish
npm packages, then deploy Web and Storybook from the validated release source.
See [consumer CI](CONSUMER_CI.md) for candidate selection and validation evidence.

## Configure publication

Before enabling publication, verify the actual GitHub repository identity and npm
trusted publisher for `@veli-design/react`, `@veli-design/tokens` and
`@veli-design/cli`, using `release.yml`. Configure these repository variables only
after their prerequisites are satisfied:

- `VELI_RELEASE_BRANCH=main`
- `VELI_NPM_DIST_TAG`: the intended npm tag; there is no default
- `VELI_NPM_PUBLICATION_APPROVED=true`
- `VELI_NPM_TRUSTED_PUBLISHING_READY=true`
- `VELI_REGISTRY_TRANSITION_APPROVED=true` to enable production site delivery

Site deployment also requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
`VELI_WEB_ORIGIN` and `VELI_STORYBOOK_ORIGIN` default to `https://veli.design` and
`https://storybook.veli.design`. These values affect generated links, not routing
or access controls.

The release workflows are restricted to the repository's stable numeric ID; a fork
cannot publish by copying the workflows. After a repository transfer, verify that
ID, repository permissions, branch rules, Actions policies, retained artifacts,
deployment secrets and npm publisher mappings. Regenerate and validate the release
PR under the actual repository identity; old-name CI evidence is rejected. Update
current package metadata without rewriting immutable published artifacts.

## Publish a release

1. **Prepare release** (`prepare-release.yml`) creates or refreshes the Changesets
   PR on main pushes. It versions packages but never publishes. Freshness checks
   before and after preparation reject obsolete events and queue current-main
   preparation when necessary. Only the dependency-free catch-up job can dispatch
   another workflow.
2. Approve the bot PR's native GitHub Actions run when requested. Wait for **Build
   and Test** and all release consumers to pass against the final head and main
   base, then merge. If either changes, regenerate and validate the candidate first.
   Normal reviews and branch protection still apply; no special approval comment
   is required.
3. **Release** (`release.yml`) authenticates the merged Changesets PR. Under the
   shared `Release-Publish` lock it selects the newest authenticated release in
   current main history, checks out that immutable source, and verifies its native
   CI evidence before installing publishing dependencies and again before publish.
   Pending Changesets, a dirty checkout or invalid evidence block publication.
4. Immediately before publication, the workflow anonymously reads the configured
   npm dist-tag for all three packages. Failed reads, invalid versions and version
   regressions block publication. Do not publish concurrently outside this workflow.
5. After publishing, the workflow verifies exact public npm versions and tarball
   bytes. It retains `publication.json`, `release-manifest.json` and package tarballs
   for 90 days; the two JSON descriptors are also GitHub release assets. Successful
   publication hands off to the site workflow when the registry transition gate is
   enabled.

The publication lock prevents a delayed event from publishing an older release
last. The triggering workflow commit and validated source commit may differ; both
are recorded. Changesets uses Git CLI commit mode so package tags identify the
selected checkout. Only the publish step sets `HUSKY=0`, preventing concurrent tag
pushes from racing local builds; local hooks and release validation remain enabled.
The workflow currently sets `NPM_CONFIG_PROVENANCE=false`. Review repository
visibility and source/controller identity before enabling npm provenance.

If publication fails, inspect npm and the retained artifacts before retrying:
immutable versions may already exist. A registry-recording failure can be recovered
read-only from the exact released checkout with `release-sites.mjs manifest` and
`published-packages.mjs record`. Do not republish to retry recording or deployment.
Missing or expired CI evidence requires a newly approved release candidate, not a
bypass of the publication guard.

## Automatic site delivery

**Deploy site changes** (`deploy-site-changes.yml`) evaluates main pushes and
completion of release/recovery workflows. After obtaining the shared
`veli-public-release-sites` lock, it resolves current main and compares cumulative
changes with the latest verified successful paired-deployment receipt. Changes in
`apps/web`, `apps/storybook` or `packages/blocks`, or a newer published package
baseline, can select delivery. Contributor prose alone does not select delivery or
clear earlier outstanding site changes.

Automatic delivery requires:

- No pending Changesets or unpublished package/build dependency changes. Only
  package-root `README.md` prose is excluded from the package-source hold.
- An authenticated merged PR with a final-head approval by a human with current
  write/maintain/admin permission, or a merge by a human with current admin
  permission. Direct pushes and missing permission evidence are blocked.
- A verified publication baseline selected by immutable tag ancestry on main, not
  release creation time. A merged release without its exact publication record
  cannot use site delivery as a publication retry. Catch-up for an already
  published release rechecks its original full release CI evidence.
- A passing `corepack pnpm check` on the selected source and isolated site builds
  using anonymously verified npm artifacts. Blocks compatibility ranges and exact
  `testedDependencies` must match the selected package versions.

The workflow retains a hashed snapshot before deploying and rechecks current main
and prior delivery immediately before deployment. Superseded or duplicate runs
skip; a contributor-prose-only successor can allow the selected source to finish.
A receipt is uploaded only after both sites deploy, binding the actual source and
run. Receipt ordering uses successful promotion time, including rollbacks; missing
or conflicting evidence fails closed. The receipt writer needs the built-in
`GITHUB_TOKEN` with read-only permissions.

Deployment is sequential, not atomic. A main merge during deployment or failure of
the second site can temporarily split the rollout. Running deployments are not
cancelled; a later eligible run or snapshot recovery converges both sites.

## Prepare and inspect a manual snapshot

Use **Prepare site-only release snapshot** (`prepare-site-release.yml`) on main
with a full source commit already in main history and an explicit package release
tag containing `publication.json`. It builds the entire selected source with
verified published packages, never unpublished workspace substitutes or new npm
publication. Pending Changesets do not block this manual preparation.

The maintainer must determine that the whole source, including documentation and
stories, is appropriate for the published package baseline. Automated compatibility
checks cannot establish that prose describes released behavior. Do not widen Blocks
ranges or reuse outdated `testedDependencies` to bypass compatibility checks.

Record the run ID and snapshot SHA-256 from the producer summary. Download and
preview the exact retained outputs, checking navigation, responsive and RTL layout,
interactions and accessibility. The bundle includes output hashes, configuration,
lockfiles and installed/tool versions. Preparation is not deployment.

For protected-preview or local-fixture validation, `scripts/site-hosted-smoke.mjs`
verifies the retained bundle, served assets and browser behavior. It rejects the
canonical production origins. It accepts the snapshot directory, expected
digest, target JSON, producer-run JSON, Playwright installation directory and output
file, in that order. Keep access credentials out of artifacts and logs. Its smoke
report is separate from a production delivery receipt and does not authorize or
perform deployment.

**Prepare published site rebuild** (`deploy-web.yml`) rebuilds an original published
release source without deploying. Supply an explicit release tag to select the
intended version; without one it selects the most recently published non-prerelease
with both provenance descriptors. Inspect its retained bundle before recovery.

## Retry or roll back deployment

Dispatch **Deploy reviewed site snapshot** (`deploy-site-snapshot.yml`) on main
with the producer run ID and independently recorded snapshot SHA-256. Repository
write access and normal branch protections remain the permission boundary; no
special approval comment is required.

The workflow authenticates the producer, branch, event and completed state before
downloading, then verifies retained bytes and versions before using deployment
secrets. A failed release, automatic site run or published rebuild can supply a
complete retained bundle; failed preparation, cancelled runs and unrelated
workflows cannot. Recovery deploys those exact outputs without rebuilding or
publishing and records success only after both sites deploy.

For partial deployment, retry the same bundle. To roll back, select a compatible
retained older bundle. Recovery records the actual restored source, never newer
main commits. Automatic catch-up may then deploy outstanding eligible main work;
a rollback does not pause automatic delivery or pending release handoffs. Coordinate
any intentional rollback hold separately. Artifacts expire after 90 days, so do not
rely on them as an unlimited rollback archive or delete them prematurely.

If only receipt creation/upload failed, paired delivery is not established and a
catch-up may redeploy. Recover with the retained snapshot, not npm publication.
Start a new preparation run rather than overwrite an existing snapshot bundle.

## Bootstrap compatibility

The retained `bootstrap-2026-11-01` record is supported as an explicit manual
baseline and an automatic fallback until a recurring publication exists. The
bootstrap production workflow refuses deployment once any recurring publication
record or site-delivery receipt exists, including expired receipt metadata. Its
guard runs under the shared deployment lock and fails closed on API errors or
incomplete history. Use snapshot recovery after retirement; verification-only
bootstrap checks do not restore production eligibility.
