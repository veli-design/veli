## Astro 7 preview regression checks

The CI source and installed-package jobs both run `scripts/check-site-previews.mjs`
against local Wrangler static assets. The checks use the current route contract
(including `/design/`, `/docs/` and all generated legacy redirects), rather than
restoring the obsolete pre-migration URL fixture. They check representative
mobile/desktop pages in light/dark preferences, load-island hydration, canonical
paths, browser runtime errors, and the Storybook Button playground. Screenshots
and a JSON report are written to the supplied evidence directory. This smoke
suite does not replace review of visual parity or the hosted rollback rehearsal.

After building both sites, run it locally with an isolated browser runtime:

```sh
node scripts/prepare-playground-browser.mjs /tmp/veli-site-browser
node scripts/check-site-previews.mjs /tmp/veli-site-browser "$PWD" /tmp/veli-site-evidence source
```

For installed packages, pass the staged and built consumer directory instead of
`$PWD` and omit `source`. Set `PUBLIC_SITE_URL` to the intended origin before the
build (CI uses `https://veli-preview.invalid`). The runner owns and shuts down
its loopback-only Wrangler subprocesses; it does not deploy or use remote bindings.
The current publication provenance, exact-package checks, protected-preview and
rollback workflows remain authoritative and unchanged by the Astro migration.
