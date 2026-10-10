# Veli UI ESM consumer compatibility

PD-1041 belongs with the token/package refactor because the same release must work through native Node, framework bundlers and isolated package consumers. The source imports in this PR use explicit `.js` specifiers, which TypeScript preserves in emitted JavaScript.

## Why OnePass and govmv-web behave differently

The following configurations and installed dependencies were checked on 2026-10-09. Neither consumer repository was modified.

| Consumer  | Next.js | Router | Installed Veli UI | Vitest coverage                                                                  |
| --------- | ------- | ------ | ----------------- | -------------------------------------------------------------------------------- |
| OnePass   | 15.5.18 | Pages  | 0.13.0            | 4.1.11, jsdom, UI tests, Veli dependency inlining                                |
| govmv-web | 16.2.6  | App    | 0.10.0            | 4.0.18, Node, Payload integration tests; search regression mocks Veli pagination |

Both installed Veli versions fail `import('@tradenetcorp/veli-ui/modal')` in native Node with `ERR_MODULE_NOT_FOUND` for the extensionless `dist/a11y` import. govmv-web therefore has the same invalid package graph even though its bundler accepts it.

OnePass explicitly transpiles Veli in `next.config.ts` and inlines it in `vitest.config.mts`. Its production `next build` uses webpack. govmv-web uses client Veli components inside App Router, has no explicit Veli transpilation entry, and uses Next 16's default Turbopack build. Its Payload wrapper does not explicitly configure Veli transpilation. The webpack `extensionAlias` configuration maps explicit extensions; it does not repair extensionless ESM for native Node.

Next defaults to bundling App Router dependencies. Pages Router dependencies are externalized unless selected for bundling/transpilation. This explains why a broken relative import reaches Node in OnePass while govmv-web's bundled client graph resolves it. The isolated tests below establish that changing the Next major version alone is insufficient.

Primary references: [Next Pages dependency bundling](https://nextjs.org/docs/pages/api-reference/config/next-config-js/bundlePagesRouterDependencies), [Next transpilePackages](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages), [Next 16 Turbopack defaults](https://nextjs.org/docs/app/guides/upgrading/version-16), [Node mandatory ESM extensions](https://nodejs.org/api/esm.html#mandatory-file-extensions).

## Controlled reproduction

React/React DOM **19.2.6** and React Aria Components **1.18.0** were held constant. The old control was a copied installed UI **0.13.0** tarball. The fixed candidate was packed from this PR (manifest still 0.14.0 before Changesets applies the planned 0.15.0 release). No source aliases or workspace UI links were used.

| Package         | Next/router/bundler            | No-workaround result                                                                             |
| --------------- | ------------------------------ | ------------------------------------------------------------------------------------------------ |
| Old UI 0.13.0   | 15.5.18 Pages / webpack        | Expected failure during page-data collection: missing `dist/field-shared` imported by `input.js` |
| Old UI 0.13.0   | 16.2.6 Pages / webpack         | Same expected native ESM failure                                                                 |
| Old UI 0.13.0   | 15.5.18 App / webpack          | Build and prerender pass; bundling masks the defect                                              |
| Old UI 0.13.0   | 16.2.6 App / webpack           | Build and prerender pass                                                                         |
| Old UI 0.13.0   | 16.2.6 App / default Turbopack | Build and prerender pass                                                                         |
| Fixed packed UI | 15.5.18 Pages / webpack        | Build and production HTTP SSR pass without `transpilePackages`                                   |
| Fixed packed UI | 16.2.6 Pages / webpack         | Build and production HTTP SSR pass without `transpilePackages`                                   |
| Old UI 0.13.0   | Vitest 4.1.11 / jsdom 30.0.1   | Expected import failure without dependency inlining                                              |
| Fixed packed UI | Vitest 4.1.11 / jsdom 30.0.1   | Unmocked Input, PasswordInput and Modal imports/render pass without inlining                     |

The Pages fixture uses `getServerSideProps`, so the HTTP check exercises production request-time server rendering. Vitest renders actual inputs and loads the closed Modal. The App controls exercise production build/prerender; this investigation does not claim a complete test of either consumer application, its Cloudflare deployment, or its Payload database integration. Existing copied-block consumer browser tests separately cover the fixed package on Next 16 App Router.

## Permanent verification and migration

`packages/ui/scripts/check-esm.mjs` parses every emitted `dist/**/*.js` file, including files outside the package export map. Static imports, reexports and literal dynamic imports must use `.js` relative specifiers whose targets exist. Fixtures verify extensionless imports, missing targets and empty output fail. Native Node tests independently import all 38 public JavaScript entries.

UI `prepublishOnly` builds and runs `package:check`. The repository release command also rebuilds UI and runs that check before invoking Changesets, so publication does not depend on lifecycle hook behavior. The normal UI suite runs the all-output guard in CI.

CI also runs the isolated packed-package Pages/Vitest fixture on both Next versions:

```sh
corepack pnpm --filter @tradenetcorp/veli-ui build
corepack pnpm --filter @tradenetcorp/veli-ui pack --out /tmp/ui.tgz
node scripts/check-ui-consumer.mjs /tmp/veli-next15 /tmp/ui.tgz 15.5.18
node scripts/check-ui-consumer.mjs /tmp/veli-next16 /tmp/ui.tgz 16.2.6
```

Use new output directories. These fixtures install only public dependencies and the local UI tarball, without Veli transpilation, dependency inlining, aliases or mocks. Both use webpack to hold the bundler constant.

After upgrading to the release containing this fix (planned UI **0.15.0**), OnePass can remove only its Veli entry from `transpilePackages` and Vitest `server.deps.inline`. Keep the separate `osm-ws-client` transpilation entry and other application-specific configuration. govmv-web needs no Veli-specific workaround. Removing the existing workarounds before upgrading still leaves the old package broken.
