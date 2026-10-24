# Deployment hold

The migration branch changes catalog imports. Production deployment is gated by
`VELI_REGISTRY_TRANSITION_APPROVED`; keep the existing old-compatible Worker
running until a separate new registry destination and support plan are approved.
See [the migration runbook](NPM_MIGRATION.md).

# Release-consistent documentation sites

The public web docs and Storybook describe the latest successfully published release snapshot. Main-only component or token changes appear locally and in CI evidence before they appear publicly.

After separately approved Changesets publication, the release workflow records an immutable source commit and exact React/token/CLI package versions. It retains the manifest both as a workflow artifact and as a GitHub release asset. A reusable workflow checks out that commit, installs locked staging tools, and builds both sites in an isolated consumer outside the repository. UI and token packages come from the registry. The consumer has no UI/token source checkout or source aliases; copied block sources, historical block archives, documentation, examples, Markdown, search indexes and `llms.txt` come from the same snapshot.

Both builds must pass before deployment starts. Registry authentication or package installation failures leave the current public sites intact. Each Cloudflare deployment is independent, so a deployment failure after the first site updates can temporarily leave the sites on different releases; use the redeployment workflow to restore consistency. No repository workflow can make the two independent Worker deployments atomic.

Use **Redeploy public release sites** to redeploy the latest manifest retained as a GitHub release asset, including after workflow artifacts expire. There is no push-to-main site deployment.

Local `corepack pnpm --filter @tradenetcorp/veli-storybook dev` and `corepack pnpm --filter @tradenetcorp/veli-web dev` use UI source modules and automatic token CSS regeneration. Source and token updates retain the local feedback loop without manual package builds.

For candidate validation, pack UI and token artifacts, set `VELI_TARBALLS` to a JSON map from package names to absolute tarball paths, then run the isolated site builder or block consumer. Overrides ensure transitive imports use those exact artifacts too. CI validates candidates this way without publishing packages or deploying a preview.
