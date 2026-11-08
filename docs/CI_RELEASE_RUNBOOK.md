# CI and release operations

Routine flow: merge the validated Changesets release PR, automatically publish new npm
versions, then deploy Web and Storybook from that same release snapshot. The first
account-authenticated bootstrap publication was a one-time prerequisite.

## Package preparation and publication

Every main push runs **Prepare release PR** with versioning-only Changesets actions.
It creates or refreshes the bot release PR; it never publishes. Approve the native
GitHub Actions run for a bot-created PR when requested. Existing exact-head release
validation, required reviews and branch protections still apply. Preparation checks
that the immutable event SHA is still main before invoking Changesets (which resets
to that SHA internally). An obsolete event never versions or pushes the bot branch.
It checks freshness again after preparation; a small dependency-free catch-up job
can dispatch preparation of current main. Only that job has `actions: write`; the
job installing project dependencies retains no workflow-dispatch permission.

Before publication, complete PD-1289: verify the actual repository identity and npm
trusted-publisher mapping for all three `@veli-design` packages and `release.yml`.
Do not configure trust for a speculative repository move. The existing publication,
release-branch and trusted-publishing repository-variable gates remain required.

Before merging the final bot release PR, approve its native CI run and wait for the
full exact-head/base consumer validation. Normal repository reviews and branch
protections still apply, but publication does not require special review text or
an additional visual-approval comment. Merge then
triggers **Release**. The publisher revalidates the actual selected merged release commit. Ordinary main pushes and pending
Changesets are handled by preparation only and cannot publish. Set the separately
approved repository variables `VELI_RELEASE_BRANCH=main`, `VELI_NPM_DIST_TAG`
(for example `latest` only when authorized), `VELI_NPM_PUBLICATION_APPROVED=true`
and `VELI_NPM_TRUSTED_PUBLISHING_READY=true` after completing their prerequisites.
No default dist-tag is assumed. No npm environment identity changes are introduced.
The read-only event plan is separate from the privileged publisher. One shared
`Release-Publish` lock serializes all release commits. After acquiring it, the
publisher selects the newest authenticated merged Changesets PR in current main
history, checks out that immutable commit, rejects remaining Changesets/dirty source,
and verifies its full native CI evidence. A delayed older event
therefore services the latest release instead of publishing an older version last.
Immediately before the publication command, all three public npm dist-tags are read
anonymously; a failed registry read, invalid existing tag or version regression fails closed.
Only the approved configured tag is considered. Do not publish concurrently outside
this controlled workflow.

The action is explicitly pinned to Git CLI commit mode so locally created package
tags reference the selected checkout, rather than an older triggering event. The
publication descriptor records both the triggering controller commit and validated
source commit/run/attempt; they may differ. The private repository still disables
npm source provenance. Reassess that identity distinction before enabling provenance.
Published baseline selection follows immutable tag ancestry on main, never GitHub
release creation timestamps, so a later backfill cannot displace a newer baseline.

After successful publication, the workflow anonymously verifies each exact npm
version and tarball, retaining `publication.json`, `release-manifest.json` and the
three package tarballs. The first two descriptors are also GitHub release assets.
The existing registry transition gate controls the site handoff.

A registry-recording failure after publication must be investigated before rerunning
Release: packages may already exist. Recording is read-only and can be recovered
from the exact released checkout with `release-sites.mjs manifest` followed by
`published-packages.mjs record`; never republish merely to retry deployment.

## Independent site changes

Site builds default to `https://veli.design` and `https://storybook.veli.design`.
`VELI_WEB_ORIGIN` and `VELI_STORYBOOK_ORIGIN` remain explicit overrides. These
settings control generated links and origins, not Cloudflare routing or access.

**Deploy site changes** evaluates every main push under the shared deployment lock.
It checks out current main only after obtaining that lock, then compares against the
latest verified successful paired-deployment receipt in main history. Outstanding
changes under `apps/web`, `apps/storybook` and `packages/blocks` select delivery. This includes deployed MDX/docs,
website design, Storybook stories and the Blocks registry. Contributor-only prose
under `docs/` or root contributor Markdown does not independently select delivery,
but carries forward any earlier undeployed site update. There is no additional
post-merge approval input: a real human write-access approval of the final source PR
head supplies the normal pre-merge review. The exact merged source runs the full
check command and builds both isolated consumers against anonymously verified npm
packages, including the catalog's exact tested-version compatibility contract.

Pending Changesets hold delivery. A merged release PR without a publication record
for its exact source cannot use this path as an implicit publication retry. If a
late queued event displaces the publication handoff, site-only catch-up can recover
the already published release: it requires that exact publication record, verified
npm artifacts and the original full release CI evidence again. It never invokes publication. Failed/no-op publication without a
matching existing record remains blocked. The newest
non-draft/non-prerelease durable publication record supplies the package baseline;
until one exists, the retained verified bootstrap record is used. Source package
versions, package source, shared package build configuration and the package build
dependency closure must match that baseline. Only package-root `README.md` prose
is excluded from the source-change hold; nested Markdown, executable docs, build
files and dependency changes still fail closed. App-only lock entries may change.
Missing Changesets therefore cannot quietly ship unpublished package source.
Shared build-tool changes conservatively wait for publication too.

Standalone automatic delivery also verifies the exact merged PR against GitHub.
It accepts either a final-head approval from a human with current repository
write/maintain/admin permission, or a merge performed by a human account with
current repository admin permission. The latter supports a sole admin's own PR
and deliberate admin review bypass without self-approval or a special comment.
PR author, commit author, workflow actor, rerun actor and organization membership
are not merge authorization. Direct pushes, mismatched merge sources and missing
or failed permission evidence remain blocked. This alternative does not bypass
pending Changesets, unpublished-package checks or release publication evidence.
Repository branch rules still govern whether GitHub permits the merge itself.

Publication handoff, ordinary site delivery and deployment recovery share a single
non-cancelling deployment lock. Immediately before deployment, the workflow checks
current main and successful paired-deployment receipts. A newer executable/site or
release change supersedes the old source; a contributor-prose-only successor may
safely let it finish. Duplicate/stale automatic handoffs skip. Whichever queued run survives resolves
latest main rather than reusing its event SHA, so an older event queued late cannot
lose work from a newer main commit. A final cumulative selection also skips changes
already delivered by a preceding run. Receipt sources bind the actual checked-out
commit; for ordinary site runs the trigger commit must be that source or its ancestor.
The latest successful receipt is selected by promotion timestamp (artifact creation
after both deployments under the shared lock), with source ancestry checked against
main. Missing timestamps or conflicting sources at the same latest timestamp fail
closed; selecting the greatest historical commit would miss a later rollback.

Completing Release, reviewed snapshot recovery, published-site rebuild or the
temporary bootstrap catch-up triggers another evaluation. This recovers a site job
displaced in the shared queue by those workflows. The site workflow does not trigger
itself. A newer verified package baseline also selects delivery even if app files
are unchanged. Without a valid recurring receipt, the published source is the diff
base; a non-bootstrap publication is treated as not yet delivered. Expired, failed,
foreign-branch and unrelated-workflow receipts cannot suppress delivery. Evidence
pagination is bounded and fails closed if incomplete. New pending Changesets still
hold every catch-up. Recovery does not clear outstanding main changes; automatic
delivery can resume those changes after recovery completes.
Receipts are written only after both sites deploy. Snapshots are retained before
either deployment, so a partial failure can use deployment-only recovery.

GitHub merges and the two Cloudflare deploy calls are not one atomic transaction:
a merge after the final guard can arrive during deployment, and a second-site
failure can temporarily split the rollout. No running deployment is cancelled;
the newer eligible run converges both sites after validation. Failed publication
or pending package work continues to hold automatic site delivery.

## Manual site-only override while a release is pending

The automatic global hold is intentional. Maintainers may use the manual path when
they have determined the entire selected Web/Storybook snapshot is independent of
unpublished packages. Automated builds cannot prove that documentation prose or
story descriptions describe released behavior. This path does not filter held
content out of main or compose independent PR patches; choose a reviewed compatible
source, or wait if that whole source contains dependent content.

Dispatch **Prepare site-only release snapshot** on main with a full reviewed source
commit already on main and an explicit package release tag containing
`publication.json`. The temporary `bootstrap-2026-11-01` baseline is supported from
its retained reviewed record. Old scoped release assets cannot be selected silently.
Preparation is allowed with pending Changesets. It never publishes npm packages,
uses no local candidate tarballs, and does not substitute unpublished workspace UI.
It verifies anonymous npm metadata and tarball bytes, stages isolated
published-package consumers and builds both sites. The plan marks this as a manual
override; that metadata is not approval. Source and package-release
commits may differ; both are retained in the plan.

Catalog declarations must satisfy the selected versions and `testedDependencies`
must record those exact versions. A new React minor therefore requires a separately
rehearsed and reviewed catalog baseline. Do not widen ranges to bypass this check.
Include the catalog baseline rehearsed against the release PR's actual selected
React/token versions when refreshing that PR. Older tested-version declarations
cannot authorize a newer output. The manual override does not bypass this
safeguard: a catalog requiring a newer React minor cannot deploy with an older
published version, even when the intended design edit is unrelated. Recompute the
pending Changesets plan and verify each Block's supported ranges and exact
`testedDependencies`; do not assume an earlier rehearsal covers later releases.
The manual workflow builds the whole selected source, not just the independent
edit, so not every source can use an older retained package baseline.

Preparation uploads an immutable bundle with static outputs, Wrangler configuration,
source and consumer lockfiles, installed versions, tool versions and file hashes.
The plan retains the full verified publication record. Record the external snapshot
SHA-256 from the producer summary. Download and preview the exact outputs; check
navigation, responsive/RTL behavior and relevant interaction/accessibility flows.
Preparation is not a production deploy; maintainers still assess the whole selected
source, including prose, before choosing a manual override. No comment, phrase or
visual-review workflow input is required.
Read-only hosted smoke tooling and the [protected preview rehearsal runbook](SITE_HOSTED_REHEARSAL.md) are available. Protected hosted execution and production browser verification remain PD-1121 work.

## Deployment-only retry and rollback

Dispatch **Deploy reviewed site snapshot** on main with the producer run ID and
independently recorded snapshot digest. GitHub restricts workflow dispatch to
repository writers; normal branch protection and repository access remain the
permission boundary. No GitHub approval comment, numeric comment ID or special
review phrase is required. The retained workflow display name is unchanged so
existing catch-up subscriptions continue to work.

For an independent override, the maintainer chooses a source whose whole content
is appropriate for the published package baseline. Automated compatibility checks
do not establish that documentation describes released behavior. This remains a
maintainer decision, not a replacement checkbox or scripted approval gate.

The workflow authenticates
the producer workflow, branch, event and completed state before downloading. It
checks all retained bytes and installed versions before using deployment secrets.
It deploys the retained outputs without rebuilding or publishing. A failed Release
or redeploy producer is accepted only if it already retained a complete valid bundle;
a failed preparation, cancelled run or unrelated workflow cannot supply one.

After both deployments succeed, recovery uploads a verified paired-delivery receipt
binding the actual deployed source, controller commit, snapshot digest, originating
run and successful attempt. New schema-3 receipts contain no comment metadata.
Historical schema-2 receipts are validated in their original form, without fetching
the old comment, so successful prior deployments and rollbacks remain recognized. It never acknowledges newer main commits as delivered. Delivery order is
based on successful receipt creation under the shared deployment lock, including
restoration of an older source after a newer deployment. Automatic catch-up can
therefore promote outstanding eligible main work after a recovery or rollback.
Manual dispatch does not suppress that work. An intentional rollback
hold requires separate explicit maintainer authorization and coordination of
automatic delivery and pending release handoffs; this workflow does not implicitly
pause either. Failed or partial recovery never records success. Receipt names include the recovery
attempt; old receipts are not overwritten. Historical successful attempts remain
recognized even if a later rerun fails. Snapshot bundles retain their original names;
start a fresh preparation dispatch rather than overwrite a retained bundle.

Web and Storybook deploy sequentially. A second-site failure can leave a partial
rollout; retry the same reviewed bundle to converge both sites. A previously approved
bundle can similarly restore both sites. Artifacts expire after 90 days; this is not
an unlimited rollback archive. Do not delete successful run artifacts prematurely.

**Prepare published site rebuild** (`deploy-web.yml`) accepts an explicit release
tag, or selects the latest non-prerelease with both new provenance assets. It only
rebuilds and retains the original release source, with `verification-only: true`;
it does not deploy. Inspect the resulting bundle, then use **Deploy reviewed site
snapshot** with its run ID and digest. Successful new package publication still
hands off automatically to both sites through the original reusable workflow.

## Repository transfer

Release planning, preparation and the temporary bootstrap entry are bound to the
stable repository ID `1115705061`, not the current owner string. A fork or separately
created lookalike repository cannot pass these guards. API calls, bot PR identity,
review permissions and snapshot producer checks use the actual runtime repository.

Before transferring `tradenetcorp/veli` to `veli-design/veli`, pause publication.
After the real transfer, verify the repository ID, access, branch rules, Actions
policies, retained artifacts, Cloudflare secrets and rollout variables. Configure
npm trusted publishers for the actual new owner/repository, workflow `release.yml`,
for each package before its next publication; no publishing Environment is added.
Do not assume a redirect authorizes npm publishing. Refresh the bot release PR and
run new approved full CI in the new repository identity: old-name validation JSON
is deliberately rejected, even when commit IDs are unchanged.

Coordinate PD-1291 to update package repository/homepage/bugs metadata, tooling
links and new catalog provenance URLs while preserving already published historical
archive hashes and receipts. Do not globally rewrite immutable historical evidence.
This local change does not transfer the repository or configure publisher trust.

## Temporary bridge and completion gates

The bootstrap catch-up workflow remains until the permanent path has been exercised
successfully. Its historical tarball and approval checks are preserved. Remove it
only after verifying recurring release preparation, approved exact-head publication,
retained publication evidence, both deployed sites, a deployment-only retry and an
independent source snapshot against a reviewed compatible catalog baseline.

Account trust setup and repository settings remain separate operations. Automatic
publication is the agreed routine flow. PD-1121 tracks the remaining hosted
smoke/rollback evidence; gate removal alone does not establish those results.

The temporary bootstrap deployment is retired as soon as any recurring publication
record or site-delivery receipt exists. Its read-only guard runs immediately before
production deployment under the shared site lock, using code retained from the
workflow controller rather than the frozen bootstrap source. Even expired receipt
metadata retires it; API failures and incomplete pagination fail closed. Verification-
only bootstrap rehearsals remain available. Use reviewed snapshot recovery after
retirement; the bootstrap entry cannot override newer delivery.

### Release handoff receipt token

The successful paired-deployment receipt step requires the built-in `GITHUB_TOKEN`:
`site-auto.mjs` initializes its shared read-only GitHub client before dispatching
commands, including the local receipt writer. Supply the token only to that step;
keep `contents`, `actions` and `packages` read-only. No new secret or write permission
is needed.

Keep receipt creation and upload after both production deployments. A failed or
missing receipt does not establish successful paired delivery, so a later catch-up
may redeploy the retained compatible source. A valid matching release receipt skips
that duplicate; mismatched source identity cannot authorize the skip. Never recover
this bookkeeping failure by republishing immutable npm versions. Partial deployment
and receipt-upload failures retain the existing reviewed-snapshot recovery path.

Mandatory visual-approval comments have been removed under PD-1121;
publication variables and exact-artifact safety checks remain unchanged.
