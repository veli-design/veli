# Veli Blocks

Private authoring workspace for editable React source. Consumers install Veli tokens and primitives, then use the `@veli-design/cli` CLI to copy blocks into their application. Blocks are not published to npm and Veli does not operate a third-party or shadcn-compatible registry.

## Authoring

Create `src/<id>/manifest.json`, distributable files, `README.md`, and `CHANGELOG.md`. Keep examples and tests outside the distributable inventory. Declare all runtime imports and setup dependencies, and record exact tested versions. Use public Veli subpaths and relative imports within the inventory; no app aliases, framework imports, private primitive internals, or undeclared assets.

Preview canonical source in Astro and Storybook. Never duplicate implementation snippets. Keep labels, routing, authentication, API calls, account permissions, and persistence in the app. Local presentation state may live in blocks. Client components accept serializable data from servers; router render callbacks belong inside a client adapter.

## Versions and provenance

Every source or dependency-contract change needs a block version increase and an entry in its changelog. Identify breaking changes explicitly. CI compares against the pull request base; local authors can run `BLOCKS_BASE_REF=origin/main corepack pnpm --filter @tradenetcorp/veli-blocks build`.

Veli Web serves a versioned catalog and deterministic source archives. CLI installs contain working source plus `.veli/blocks/<id>/` originals and a receipt with source commit and byte hashes. Production builds must use a clean, committed block tree. Local artifacts mark uncommitted block changes as dirty. Source history is retained in Git so previously released archive URLs remain available.

Use block changelogs, not npm changesets, for this private workspace. Published primitive changes still follow the repository changeset policy.

## Checks

- `corepack pnpm test:blocks`: source/manifest validation, archives, and update rehearsal.
- `corepack pnpm --filter @tradenetcorp/veli-blocks build`: source checks and TypeScript.
- `corepack pnpm test:blocks:consumer`: materialize and build an isolated Next.js app against published packages, then run browser checks. Use `VELI_TARBALLS` for unpublished candidate packages; public npm installation requires network access but no package-read credentials. Set `BLOCKS_CONSUMER_DIR` to retain the fixture in a chosen empty directory.

See `docs/BLOCKS_ARCHITECTURE.md` for scope and follow-up boundaries.
