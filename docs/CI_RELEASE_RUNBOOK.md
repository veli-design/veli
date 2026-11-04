# CI and release operations

Ref [PD-1318](https://linear.app/onegov/issue/PD-1318/restore-veli-ci-and-release-workflows).
This orchestration change retains manual publication. Choosing automatic publication
on release-PR merge is a separate decision.

## Package preparation and publication

Every main push runs **Prepare release PR** with versioning-only Changesets actions.
It creates or refreshes the bot release PR; it never publishes. Approve the native
GitHub Actions run for a bot-created PR when requested. Existing exact-head release
validation, required reviews and branch protections still apply.

Before publication, complete PD-1289: verify the actual repository identity and npm
trusted-publisher mapping for all three `@veli-design` packages and `release.yml`.
Do not configure trust for a speculative repository move. The existing publication,
release-branch and trusted-publishing repository-variable gates remain required.

Merge the validated release PR, record its full merge commit, review the candidate
visually, then explicitly dispatch **Release** on that exact commit with the reviewed
commit and visual approval inputs. A moved dispatch HEAD fails closed. Publication
still requires the existing exact release validation and publication approval.
After successful publication, the workflow anonymously verifies each exact npm
version and tarball, retaining `publication.json`, `release-manifest.json` and the
three package tarballs. The first two descriptors are also GitHub release assets.
The existing registry transition gate controls the site handoff.

A registry-recording failure after publication must be investigated before rerunning
Release: packages may already exist. Recording is read-only and can be recovered
from the exact released checkout with `release-sites.mjs manifest` followed by
`published-packages.mjs record`; never republish merely to retry deployment.

## Independent site changes

Dispatch **Prepare site-only release snapshot** on main with a full reviewed source
commit already on main and an explicit package release tag containing
`publication.json`. The temporary `bootstrap-2026-11-01` baseline is supported from
its retained reviewed record. Old scoped release assets cannot be selected silently.
Preparation verifies anonymous npm metadata and tarball bytes, stages isolated
published-package consumers and builds both sites. Source and package-release
commits may differ; both are retained in the plan.

Catalog declarations must satisfy the selected versions and `testedDependencies`
must record those exact versions. A new React minor therefore requires a separately
rehearsed and reviewed catalog baseline. Do not widen ranges to bypass this check.
The current React 0.18 catalog baseline cannot authorize React 0.19 site output.

Preparation uploads an immutable bundle with static outputs, Wrangler configuration,
source and consumer lockfiles, installed versions, tool versions and file hashes.
The plan retains the full verified publication record. Record the external snapshot
SHA-256 from the producer summary. Download and preview the exact outputs; check
navigation, responsive/RTL behavior and relevant interaction/accessibility flows.
Preparation does not constitute human visual approval or a production deploy.
Automated hosted browser smoke and production verification remain PD-1121 work.

## Deployment-only retry and rollback

Dispatch **Deploy reviewed site snapshot** with the producer run ID, independently
recorded snapshot digest and explicit visual/production approval. It authenticates
the producer workflow, branch, event and completed state before downloading. It
checks all retained bytes and installed versions before using deployment secrets.
It deploys the retained outputs without rebuilding or publishing. A failed Release
or redeploy producer is accepted only if it already retained a complete valid bundle;
a failed preparation, cancelled run or unrelated workflow cannot supply one.

Web and Storybook deploy sequentially. A second-site failure can leave a partial
rollout; retry the same reviewed bundle to converge both sites. A previously approved
bundle can similarly restore both sites. Artifacts expire after 90 days; this is not
an unlimited rollback archive. Do not delete successful run artifacts prematurely.

**Redeploy release sites** accepts an explicit release tag, or selects the latest
non-prerelease with both new provenance assets. It rebuilds the original release
source and captures a bundle before deployment. Use the snapshot workflow for a
retry that must preserve already reviewed bytes.

## Temporary bridge and completion gates

The bootstrap catch-up workflow remains until the permanent path has been exercised
successfully. Its historical tarball and approval checks are preserved. Remove it
only after verifying recurring release preparation, approved exact-head publication,
retained publication evidence, both deployed sites, a deployment-only retry and an
independent source snapshot against a reviewed compatible catalog baseline.

This PR cannot finish account trust setup, authorize publication/deployment, choose
automatic publishing, approve visual output, or manufacture a catalog baseline.
Keep PD-1318 open until those operational checks and the PD-1121 follow-up are done.
