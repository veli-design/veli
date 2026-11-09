# Published-package consumer CI

[CI](../.github/workflows/ci.yml) runs source, type, unit and package-contract checks
on every pull request. Ordinary PRs additionally run selected installed-package
consumers for Next 15/16 and the documentation sites. Exhaustive block-browser
regressions and cold source hot-reload checks run on the Changesets release PR,
which always selects every consumer.

## Check selection

The selector compares the event head SHA with its merge base against the event
base SHA, including both paths for renames. Selections are combined across changed
files; unknown paths select all ordinary consumers.

| Changed inputs                                           | Ordinary PR consumers |
| -------------------------------------------------------- | --------------------- |
| UI, tokens, package metadata, shared tooling or lockfile | Next 15/16 and sites  |
| Blocks or Storybook                                      | Sites                 |
| Web source, Markdown/MDX, assets or configuration        | Sites                 |
| `scripts/check-ui-consumer.mjs`                          | Next 15/16            |
| `scripts/release-sites.mjs`                              | Sites                 |
| Cold playground check/verification scripts               | None                  |
| Known contributor prose and Changeset Markdown           | None                  |

Package READMEs remain package inputs. Application Markdown remains a build input;
do not introduce a broad Markdown exclusion. Source block checks still run on
ordinary PRs even though browser regressions are deferred to release validation.

The always-running **Published-package block consumer** aggregate requires **Build
and Test**, selection and all selected jobs to succeed. Only explicitly unselected
jobs may be skipped. Failed, cancelled, missing or unexpectedly skipped jobs fail
the aggregate. Configure GitHub branch rules separately if checks must block merges.

## Candidate artifacts

One job builds and packs React, tokens and CLI, then rehearses installed npm
packages and CLI Blocks. Its artifact includes the exact checkout SHA and run
attempt. Consumers download by the producer's numeric artifact ID and verify SHA
and SHA-256 hashes before use. A failed-job rerun can reuse that successful producer;
there is no cross-run candidate cache.

Next 15/16, block browsers, packaged sites and cold reload run independently. The
cold job starts without package `dist` directories and installs an isolated Chromium
runtime; do not restore build outputs into it. Superseded PR runs are cancelled.

## Release approval and freshness

Release coverage requires `github-actions[bot]` as both PR author and event actor,
head `changeset-release/main`, base `main`, and both repositories matching the
current repository. Titles and labels do not establish release identity. Keep
Changesets on `GITHUB_TOKEN` so native GitHub workflow approval remains in place;
do not substitute a PAT/App token to bypass it. Let Changesets regenerate a
candidate after a human push rather than treating that push as an approved bot event.

Approve the bot workflow when ready, then wait for all release jobs before merging.
Successful validation records the synthetic merge commit, tree, both parents,
repository, PR, run and attempt in a 30-day JSON artifact. Every release selector
must be enabled and every job successful; failed/cancelled runs cannot authorize
publication.

The publisher independently verifies that evidence against the actual merged tree
and base, including the tested candidate's two parents. Missing/expired evidence,
API failures or changed heads, bases or trees block publication. Squash and ordinary
merge commits are supported; a multi-commit rebase with a different first parent
is rejected.

If the release head or main base changes, regenerate and validate a new candidate
before merging, even if file contents are identical. GitHub may still display an
older green check; the publication guard does not itself prevent merging. A
post-merge rerun cannot replace approved candidate evidence. See the
[release runbook](CI_RELEASE_RUNBOOK.md) for publication ordering and recovery.

## Validate CI changes

Run `corepack pnpm test:changesets` for selector, artifact, aggregation and release
guard tests. Use `actionlint .github/workflows/ci.yml .github/workflows/release.yml`
when changing those workflows. Fixture tests do not dispatch workflows or publish;
verify GitHub approval and artifact behavior on the actual release candidate.
