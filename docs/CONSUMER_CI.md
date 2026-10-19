# Published-package consumer CI

The required check remains **Published-package block consumer**. It always runs
and accepts only successful selected jobs or explicitly unselected, skipped jobs.
A failed selector, failed/cancelled job, missing result or unexpected skip fails it.
Branch protection does not need new check names.

The selector diffs the PR checkout against `git merge-base <PR base SHA> HEAD`.
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

Package README changes still run full checks because they affect the tarballs.
Markdown under applications remains a build input. New executable documentation
outside applications must remain unknown or be added to the appropriate check;
never add a broad Markdown exclusion.

One job builds and packs the UI and token packages. The immutable artifact is named
with the exact checkout SHA and run attempt. Dependents download its numeric
artifact ID from the producer output, so rerunning failed jobs can reuse the
original successful producer. Each consumer verifies the SHA and SHA-256 digest of
both tarballs, then reconstructs absolute local paths. There is no cross-run
candidate cache, new secret or permission expansion.

Next 15 and 16, block browsers, packaged sites and cold reload run independently.
Installed-package resolution checks and both Storybook builds are retained.
The block suite retains one worker and Chromium plus Firefox/WebKit token tests.
The cold check installs only its isolated Chromium runtime and starts with no UI
or token `dist` directories. Source and token mutation checks remain sequential
inside that isolated job. Superseded runs are cancelled by PR number.

The existing pnpm dependency cache is retained. No build-output/browser cache is
added: runner fan-out is measured first, and the cold check must not restore
package outputs. CI-only tooling does not require a package changeset.

Run `corepack pnpm test:changesets` for classification, merge-base, artifact
identity, workflow wiring and all 16 selection/aggregation combinations. Validate
Actions expressions with `actionlint .github/workflows/ci.yml`. Full integration
coverage runs when this workflow or its helper changes.
