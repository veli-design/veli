# Astro 7 reconciliation with the current website

The website changes in PR #347 are the presentation and route source of truth.
The earlier migration ending at `542b4d2` never reached `main`; this reconciliation
ports its framework work onto `6b32a34d`, rather than reverting the later site.

## Retained migration work

- Astro 7.4.12 (manifest range `^7.4.7`) with React integration 7.1.9,
  MDX 8.1.6, Markdown Remark 7.3.4, Tailwind 4.3,
  and Astro formatter 1 integrations. Only the root and web lockfile importers
  change; the existing package, registry and supply-chain policies remain.
- Explicit Content Layer glob loaders and `astro/zod` for all **four** current
  collections: docs, foundations, patterns, and the later Get Started guides.
- Serializable IDs, `render(entry)`, and a supplied search renderer rather than
  legacy `slug`/entry-method APIs. Public URLs remain unchanged.
- The explicit unified Markdown processor, current custom remark/rehype plugins,
  Shiki's supported import, HTML-aware whitespace, and filesystem block catalog
  externalization in both SSR and prerender environments.
- Component-owned example modules without losing intervening OTP, Tags dropdown,
  public package naming, locale, or accessibility improvements.
- Source/installed-package browser gates, content freshness checks, and Git hook
  subprocess environment isolation, adapted to the current release tooling.

## Later work preserved

Marketing homepage, `/design/`, unified `/docs/` hierarchy, Get Started, current
component tabs/previews, all 194 redirects, public package imports, current block
registry/archive and release safeguards are retained. Existing design/route code
was reformatted only where the Astro 7 formatter requires it.

The old migration's later Tailwind redesign, sectioned `/docs/[slug]/[section]`
route experiment, removed tuning controls, and old fixtures are not reintroduced:
those are superseded by #347's newer design and routes, not Astro 7 prerequisites.
The contemporary release pipeline is preserved instead of restoring the obsolete
PD-1121 workflow verbatim.

## Verification

Use Node 24 and `corepack pnpm` (the repository's pinned package manager).

```sh
corepack pnpm install --frozen-lockfile --strict-peer-dependencies
corepack pnpm --filter @tradenetcorp/veli-web exec astro sync --force
corepack pnpm check
```

The first combined build produced 65 pages, 63 Markdown exports, 194 permanent
redirects, and 610 search records with zero Astro diagnostics. All 63 Markdown
exports, `llms.txt`, `_redirects`, and `search-index.json` were byte-identical to
the clean #347 build at `6b32a34d`. This is the current route/content baseline,
not the obsolete October migration counts.

The dedicated `docs-search.test.mjs` verifies serializable entries, supplied
rendering, repeat heading IDs, Unicode, ordering, excerpts, failure on missing
metadata, and the Get Started landing URL override.

Full `corepack pnpm check` passed on Node 24.22.2, including all workspace
tests, format, lint, and all six build targets.

Source browser validation passed all 194 HTTP redirects and destination types,
20 page/viewport/theme combinations (home, Design, Get Started, Button, Textarea),
client hydration, and Storybook controls/tokens with zero browser errors. Native
content edit/restoration refreshed HTML, Markdown and search correctly. On this
Mac, the dev server required execution outside the task sandbox for filesystem
notifications; no production or development configuration workaround was added.

The installed-package browser gate is wired into CI; its result must be checked
for the new commit before merge.

Full final validation results are recorded in the pull request, including any
blocked or skipped checks. Earlier #347 approvals do not cover the new major
framework migration; the combined head needs fresh review before merge.
