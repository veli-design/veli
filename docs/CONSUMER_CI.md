# Published-package consumer CI

Ordinary pull requests run the fast source, type, unit and package-contract checks
plus the selected Next and packaged-site consumers. Exhaustive Playwright block
regressions and cold source hot-reload checks run on the Changesets release PR.
The release PR always selects **all** consumers, even when its only changes are
versions, changelogs and removed changesets.

Release coverage requires the PR author `github-actions[bot]`, both repositories
matching this repository, head `changeset-release/main`, base `main`, and the event
actor `github-actions[bot]`. A title or label never establishes release identity.
Keep the Changesets action on `GITHUB_TOKEN`: GitHub's native approval of workflows
created/updated by that token is the existing human gate. Do not replace it with a
PAT or App token that bypasses that approval. A human push to the release branch
does not qualify as an approved bot event; let Changesets regenerate the candidate.

The aggregate check remains **Published-package block consumer**. It always runs
and accepts only successful selected jobs or explicitly unselected, skipped jobs.
A failed build, selector, failed/cancelled job, missing result or unexpected skip
fails it. Check names are unchanged. Current repository rules do not require
Actions success; this implementation does not change those rules or enforce a
pre-merge check requirement.

The selector diffs the PR head against `git merge-base <PR base SHA> <PR head SHA>`.
It uses the event head SHA even when checkout is GitHub’s synthetic merge commit.
Renames include both old and new paths. Selection is a union across all changed
paths, and unknown paths run the full suite.

| Changed inputs                                                                             | Checks                                      |
| ------------------------------------------------------------------------------------------ | ------------------------------------------- |
| UI implementation, providers, CSS, tokens, package metadata and build inputs               | All                                         |
| Shared scripts/configuration, root metadata, workspace config, lockfile, CI, unknown files | All                                         |
| Blocks, examples, fixtures, Storybook source/config/assets                                 | Block browsers, packaged sites, cold reload |
| Web docs, executable Markdown/MDX, styles, assets, site config                             | Packaged sites, cold reload                 |
| Next consumer script                                                                       | Both Next versions                          |
| Packaged-site script                                                                       | Packaged sites                              |
| Cold playground scripts                                                                    | Cold reload                                 |
| Known root contributor prose, `docs/*.md`, changeset Markdown                              | None                                        |

The table describes dependency selection. Ordinary PRs suppress its block-browser
and cold-reload jobs; the approved release PR overrides every selection to run all
jobs. Source block contract tests and types still run on ordinary PRs. Browser
behavior regressions are intentionally deferred to the approved release candidate.

Package README changes still run full checks because they affect the tarballs.
Markdown under applications remains a build input. New executable documentation
outside applications must remain unknown or be added to the appropriate check;
never add a broad Markdown exclusion.

One job builds and packs the UI and token packages. The immutable artifact is named
with the exact checkout SHA and run attempt. Dependents download its numeric
artifact ID from the producer output, so rerunning failed jobs can reuse the
original successful producer. Each consumer verifies the SHA and SHA-256 digest of
both tarballs, then reconstructs absolute local paths. There is no cross-run
candidate cache or new secret. The release job adds `actions: read` to verify
validation evidence; write permissions are unchanged.

Next 15 and 16, block browsers, packaged sites and cold reload run independently.
Installed-package resolution checks and both Storybook builds are retained.
The block suite retains one worker and Chromium plus Firefox/WebKit token tests.
The cold check installs only its isolated Chromium runtime and starts with no UI
or token `dist` directories. Source and token mutation checks remain sequential
inside that isolated job. Superseded runs are cancelled by PR number.

The existing pnpm dependency cache is retained. No build-output/browser cache is
added: runner fan-out is measured first, and the cold check must not restore
package outputs. CI-only tooling does not require a package changeset.

## Approval, candidate freshness and publication

Approve the bot release workflows when the batch is ready for release. Wait for
all checks to pass before merging. Routine Update branch clicks on waiting feature
PRs are unnecessary unless repository rules or integration risks require an update;
resolve conflicts and test affected integration behavior when needed. Textual merge
compatibility does not prove semantic compatibility.

After every selected job **and Build and Test** succeeds, the aggregate records
the exact synthetic merge commit, its tree, both parents (main base and release
head), repository, PR number, run ID and attempt. A 30-day, JSON-only validation
artifact belongs to that exact attempt. Failed or cancelled workflows cannot
authorize publication. Evidence issuance independently requires every release job
to succeed and every release selector to be enabled; an accidentally unselected
suite cannot authorize publication. This evidence does not reuse browser or
package build output.

Main pushes with pending changesets only prepare/update the bot release PR: they
install tooling and version packages without building the workspace or publishing.
Without changesets, only an actual merged bot release PR can enter publication;
unrelated main pushes skip dependency installation and Changesets work.

Before installing publishing dependencies, the release job verifies a successful
CI run from the bot PR and reads its evidence artifact. It checks the actual merged
commit's tree and first parent against the tested tree and base, then independently
checks the candidate commit's tree and both parents through GitHub. The publisher
rechecks this gate before building distributable packages or calling Changesets.
API failures, missing/expired evidence, wrong workflows/attempts, changed heads,
changed bases or changed trees fail closed. Squash and ordinary merge commits are
supported; a multi-commit rebase whose first parent is not the tested base fails
closed. Publication retains package checks, release README generation and the
durable manifest used for published-package site deployment.

If either release head or main changes, regenerate the bot PR, approve its new
workflow and validate the new merge candidate before merging. Even if a newer base
produces identical file contents, old-base evidence cannot authorize publication.
An already green PR check does not automatically become stale in GitHub's UI when
main moves. With current rules this guard blocks **publication**, not the merge:
enforcing checks/up-to-date candidates at merge would require a separate rules
change. Never merge early expecting a post-merge rerun to substitute for the
approved release candidate. If an unvalidated candidate is merged, publication
stops; prepare a newly approved bot release candidate rather than bypassing the
guard. No automatic dispatch, workflow approval or extra nightly runs are added.

The existing concurrency group retains only the newest pending main run. A later
main push can replace a queued release-merge run. Monitor publication after merging
the release PR; if that exact run was replaced or hit a transient error, rerun the
original release-merge workflow, not the newer feature-push workflow. The original
run still verifies its exact merged tree/base and successful release evidence.
This recovery does not permit stale or expired evidence; those cases need a newly
approved release candidate. Subsequent feature pushes never opportunistically
publish an unvalidated newer main tree.

## Follow-on provisioning measurements

PD-1251 also tracks browser and system-library download time. The suite uses
Playwright, not Puppeteer. Time workspace/fixture installs, builds, browser
downloads, apt dependencies and test execution separately. Compare supported,
Playwright-version-matched images with scoped installs and caches, including image
pull/cache restoration time. That independent optimisation must preserve browser
coverage and does not gate this frequency change.

Run `corepack pnpm test:changesets` for classification, merge-base, artifact
identity, workflow wiring and all 16 selection/aggregation combinations. Validate
Actions expressions with `actionlint .github/workflows/ci.yml .github/workflows/release.yml`.
Release evidence and publication guards are covered by `scripts/release-ci.test.mjs`.
Live GitHub approval/artifact/API behavior must be reviewed on the first approved
release candidate; local tests use fixtures and never dispatch or publish.
