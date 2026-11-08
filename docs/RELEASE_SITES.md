# Deployment hold

The migration branch changes catalog imports. Production deployment is gated by
`VELI_REGISTRY_TRANSITION_APPROVED`; keep the existing old-compatible Worker
running until a separate new registry destination and support plan are validated.
See [the migration runbook](NPM_MIGRATION.md).

# Release-consistent documentation sites

The public web docs and Storybook describe the latest successfully published release snapshot. Main-only component or token changes appear locally and in CI evidence before they appear publicly.

After Changesets publication, the release workflow records an immutable source commit and exact React/token/CLI package versions. It retains the manifest both as a workflow artifact and as a GitHub release asset. A reusable workflow checks out that commit, installs locked staging tools, and builds both sites in an isolated consumer outside the repository. UI and token packages come from the registry. The consumer has no UI/token source checkout or source aliases; copied block sources, historical block archives, documentation, examples, Markdown, search indexes and `llms.txt` come from the same snapshot.

Both builds must pass before deployment starts. Registry authentication or package installation failures leave the current public sites intact. Each Cloudflare deployment is independent, so a deployment failure after the first site updates can temporarily leave the sites on different releases; use the redeployment workflow to restore consistency. No repository workflow can make the two independent Worker deployments atomic.

Use **Redeploy public release sites** to redeploy the latest manifest retained as a GitHub release asset, including after workflow artifacts expire. There is no push-to-main site deployment.

Local `corepack pnpm --filter @tradenetcorp/veli-storybook dev` and `corepack pnpm --filter @tradenetcorp/veli-web dev` use UI source modules and automatic token CSS regeneration. Source and token updates retain the local feedback loop without manual package builds.

For candidate validation, pack UI and token artifacts, set `VELI_TARBALLS` to a JSON map from package names to absolute tarball paths, then run the isolated site builder or block consumer. Overrides ensure transitive imports use those exact artifacts too. CI validates candidates this way without publishing packages or deploying a preview.

## Temporary catch-up for the already published npm bootstrap

The first account-authenticated npm publication did not run the recurring release
workflow, so it did not create that workflow's deployment output or GitHub release
asset. Do not republish packages or use an older release snapshot to trigger sites.

**Temporary bootstrap site catch-up** (`deploy-bootstrap-sites.yml`) bridges that
handoff. It runs only from `main` and accepts the exact release source commit
`c36ca062456bbaeddb2a45a48954ebaaec637c1b`. The tracked
`releases/npm-bootstrap-2026-11-01.json` records its tree, package versions and
reviewed public tarball SHA-256/SHA-512 values. The workflow anonymously downloads
those exact artifacts, rejects changed source/identity/bytes, runs the strict
installed-package and all-Block rehearsal, and calls the existing `deploy-release-sites.yml` for both site builds and
deployment using the verified tarballs. The shared checkout, builder, historical
archives, production Worker configurations and destinations are unchanged. It never publishes npm packages and needs no npm token or OIDC.

With **deploy-sites** unchecked (the default), dispatch performs verification and
builds only. To deploy the existing internal Web, Storybook and current Blocks
catalog, first obtain the deployment approval, set the existing repository variable
`VELI_REGISTRY_TRANSITION_APPROVED=true`, then dispatch with **deploy-sites** checked.
That variable is a rollout gate, not an access-control or credential setting. The
workflow uses the existing Cloudflare deployment secrets; no new credentials,
public domain, repository transfer or public registry endpoint are required.
WFA and existing domain/access settings are unchanged.

Current Blocks are validated against React 0.18.0/tokens 0.11.0 and their declared
peers. Historical versioned source URLs are built from full Git history; the latest
catalog advertises the new package scope, so existing applications must coordinate
package/import updates before requesting those newer Block versions. Installed
source and receipts are not rewritten by deploying a catalog.

The exact manifest, downloaded tarballs and verification record are retained as a
90-day Actions artifact. After successful deployment, check the internal catalog
and both sites at their existing URLs before describing the new catalog as live.
Then remove this temporary workflow, its verifier, dedicated tests, bootstrap
record and the shared workflow’s temporary bootstrap/verification-only inputs, and replace this section with the completed handoff note. Keep the run
and artifact evidence; this is not a permanent redeployment path. No deployment
occurs merely by merging this workflow PR.

For later approved releases, the existing `Release` workflow already calls site
deployment after successful publication when the registry rollout gate is enabled.
This temporary bootstrap path does not publish. Routine publication is triggered by
merging the validated release PR; exact-tree validation, normal repository review requirements
and trusted-publisher prerequisites still apply.

For the current release preparation, publication approval, site snapshot and
deployment-only recovery procedures, see [CI release operations](CI_RELEASE_RUNBOOK.md).

Eligible Web/docs, Storybook and Blocks-only merges also use **Deploy site changes**
without waiting for npm version bumps. Pending Changesets and unpublished package
source/build dependencies hold that path. Ordinary pre-merge approval and exact
merged-source checks apply; recovery still uses an explicitly reviewed retained
bundle. See [CI release operations](CI_RELEASE_RUNBOOK.md#independent-site-changes).

Maintainers can override the automatic pending-release hold through **Prepare
site-only release snapshot**, then **Deploy reviewed site snapshot**. The selected
whole source must be independent of unpublished package changes; CI cannot establish
that for prose. Published npm identity/bytes and exact Block compatibility remain
mandatory. The maintainer assesses the whole snapshot's independence before dispatch;
no approval comment or special review phrase is required. See the runbook for the
retained snapshot and digest inputs. No package publication occurs on this path.
