# Canonical token architecture validation

Validated on Node 24.11.0 against `origin/main` commit `dd1e433c7d5267dad6e16f0bcb994c9d870d28e0`. Changesets plans tokens 0.9.0 and UI 0.15.0; copied account-panel and site-header blocks require those versions and advance to experimental 0.3.0.

## Intentional changes

- Authored CSS references use `--veli-*`. Tailwind utility names remain stable. Fractional DTCG names retain underscores, while canonical CSS names use hyphens (for example, `spacing.0_5` becomes `--veli-spacing-0-5`).
- Typography follows Figma composite values, including relative line height and letter spacing. English body-sm is 14px × 145% = 20.3px rather than the previous 20px approximation; display-lg is 64px × 132% with -3% tracking. Dhivehi overrides use their own Figma styles.
- Public JSON is normalized DTCG. Motion durations are typed objects and easing is cubic Bézier data. Exporter input moves to `src/figma.tokens.json`.
- Public sites advance only after publication and use the matching source snapshot and exact package versions. Local development continues to use source with automatic regeneration.

The normalized graph contains 1,109 tokens, all represented in canonical CSS. Coverage includes all 73 typography styles (52 English, 19 Dhivehi and 2 auxiliary styles), six grids and nine effects, including both focus effects. Documentation-only `_docs` colors are explicitly excluded. Authored variable-description OKLCH values are preserved exactly; native Color Style literals are converted with Color.js.

## Automated checks

- `corepack pnpm check`: Changesets validation, release tooling, token/UI/block/CLI tests, formatting, lint, type checks and all six workspace builds.
- Token tests: freshness, deterministic output, no source mutation, source coverage, valid types and aliases, Light/Dark behavior, exact authored OKLCH, typography/grid values, invalid input, naming collisions and every emitted CSS variable reference. Tailwind compilation uses the workspace's 4.1.17; the isolated consumer uses 4.3.2.
- UI tests include Node imports of all 38 public JavaScript entry points. Explicit `.js` relative imports make built ESM entry points usable in server rendering.
- Isolated Next consumer: 106 passing browser checks. Chromium covers interaction, keyboard focus, portals, reflow, axe, motion and copied-block behavior in English/Dhivehi and Light/Dark. Chromium, Firefox and WebKit each check plain CSS/Tailwind parity, responsive grids, typography and theme switching.
- Isolated Astro and Storybook production builds use tarballs at the planned 0.9.0/0.15.0 versions, verify installed versions, and contain no token/UI source checkout. Documentation Markdown, search, block archives and `llms.txt` are validated.
- `node scripts/check-playground.mjs <isolated-consumer-directory>` removes built token/UI outputs temporarily, starts both local playgrounds, edits token and UI source, verifies live browser updates without package builds, then restores source and build outputs. CI runs this check.

The browser checks caught and drove fixes for fractional CSS naming, the Tailwind spacing scale and header focus restoration. Canonical reference validation now guards the fractional naming regression directly.

## Visual evidence

A fresh main checkout was built with its original token pipeline and UI/Storybook source. The candidate gallery uses isolated packed packages. Capture with:

```sh
node scripts/capture-token-gallery.mjs <playwright-consumer-directory> <output-directory> <baseline-storybook-url> <candidate-storybook-url>
```

The validation run captured 576 screenshots: 36 component/foundation titles × two widths (390/1280) × two languages × two themes × before/after. No page runtime errors occurred. Representative Alert, Button, Field, Table and Shadow pairs were inspected manually. Existing story-specific wide layouts remain visible in narrow captures; these captures are evidence, not assertions that every story layout fits a narrow viewport. Typography differences are intentional and covered by computed-style assertions.

## Artifact size and limits

| Artifact         | Main bytes / gzip | Candidate bytes / gzip |
| ---------------- | ----------------: | ---------------------: |
| Canonical CSS    |  254,119 / 33,388 |       324,238 / 44,918 |
| Tailwind adapter |  162,579 / 22,694 |       127,510 / 10,319 |

Canonical CSS grows because it now exposes the complete graph and composites in both modes; the adapter becomes smaller through shared references. Sizes are raw artifacts, before application bundling/minification.

No packages or sites were published during validation. Candidate tarballs validate upcoming package contents; registry authentication and Cloudflare deployment execute in the release workflow. The two Cloudflare deployments are independent and cannot be atomic; see [release-site operations](RELEASE_SITES.md).
