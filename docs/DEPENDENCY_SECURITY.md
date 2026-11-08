# Dependency security maintenance

Earlier scans reported the dependency groups below. These versions remain in the
lockfile, but their current advisory applicability has not been independently
rescanned. Run a fresh vulnerability scan before asserting resolution, selecting
patched versions or accepting an exception. This guide does not renew historical
risk approvals or suppress scanner findings.

- **Astro and web build tools:** Astro 5.18.2, esbuild 0.27.7 and sharp 0.34.5.
  Previously reported advisories: GHSA-2pvr-wf23-7pc7, GHSA-4g3v-8h47-v7g6,
  GHSA-7pw4-f3q4-r2p2, GHSA-8hv8-536x-4wqp, GHSA-f48w-9m4c-m7f5,
  GHSA-j687-52p2-xcff, GHSA-jrpj-wcv7-9fh9, GHSA-xr5h-phrj-8vxv,
  GHSA-g7r4-m6w7-qqqr and GHSA-f88m-g3jw-g9cj.
- **Storybook:** Storybook 8 and uuid 9.0.1. Previously reported advisory:
  GHSA-w5hq-g745-h8pq.
- **Glob and lint tooling:** brace-expansion 1.1.18 and 2.1.4. Previously reported
  advisory: GHSA-mh99-v99m-4gvg. Check the complete dependency paths before
  overriding a transitive major version.

Keep major toolchain migrations focused. Validate app behavior and static builds
for Astro/Storybook updates, lint behavior for lint-tool updates, and generated
token artifacts for token-toolchain updates. Do not assume that a development
only dependency is harmless or force a patched major beneath incompatible
consumers. Record the current scan and any approved exception in the owning
security task rather than committing one-off audit evidence here.
