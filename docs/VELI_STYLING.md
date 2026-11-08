# Veli component styling contracts (PD-809)

Apps own outer layout; Veli owns appearance and internal behavior. All styling
findings are **warnings** for this [PD-809](https://linear.app/onegov/issue/PD-809/decide-where-well-expose-all-react-aria-apis-and-expose-required-one)
rollout. Findings stay visible without blocking existing consumer styling.

The source of truth is `scripts/lint/veli-contracts.mjs`: **97 current components
and parts**. All have class contracts; Button and nine reviewed complete fields
also have arbitrary-value and Tailwind v4 variable-shorthand coverage. The 10/87
split describes detection coverage, not blocking severity. Internal styling props,
inline styles and conservative icon-only review also warn. This changes no React
Aria or public component APIs.

## Commands and CI

```sh
# In a fresh local checkout, build public entries for compound-part resolution.
corepack pnpm --filter @veli-design/react build
corepack pnpm test:veli-lint
corepack pnpm lint:veli
```

`lint:veli` scans JSX/TSX in apps and application-owned Blocks source. Styling
warnings exit 0, including padding, arbitrary values and variable shorthand on
Button/fields. Syntax errors still exit 1; invalid configuration, missing plugins
and malformed upstream contracts still fail (the CLI tests expect exit 2). Both
the policy tests and command run in `check` and CI. CI runs them following the package build so local public exports, including compound parts,
resolve consistently. The normal code-quality lint retains its existing rules.

Keep styling lint separate from the existing `--max-warnings 0` invocation:
review-level warnings must remain non-blocking. Existing implementation and build
ignores are reused; `packages/react/**` owns its internals and is excluded. Public
examples and copied Blocks are checked, with reviewed local exceptions below.
Astro templates, MDX/code snippets, CSS and plain JS files are outside this scan.

## Final contract matrix

The following terms name **explicit class lists**, never the upstream broad
`layout` category:

- **Margin:** `m-*`, `mx-*`, `my-*`, `mt-*`, `mr-*`, `mb-*`, `ml-*`, `ms-*`, `me-*`.
- **Fill:** `w-full`, `min-w-0`.
- **Button placement:** `self-start/center/end/auto`,
  `justify-self-start/center/end/auto`, `order-*`.
- **Content layout:** enumerated flex/grid displays, directions, wrapping, gaps,
  grid tracks and child alignment; see the exact list in the contract module.
  Padding, typography and surface appearance remain owned by Veli.
  Upstream also interprets `flex` as the flex utility group, so `flex-1` and
  `flex-auto` pass on these content slots; `basis-1` and `shrink-0` still warn.

| Component / slot                                                                          | Allowed changes                                                                                                                                                 | Level                                                                |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Button                                                                                    | Margin, Fill, Button placement. Use `size`, `intent`, `appearance` for visual treatment. Icon-only dimensions remain defined by Veli.                           | Warn for disallowed/arbitrary classes and icon-only boundary review. |
| Input, PasswordInput, OTPInput, Search, TextArea, Select, ComboBox, DateField, DatePicker | Fill on the complete field. Parent handles placement. TextArea `rows`, `minHeight`, `maxHeight`, `isResizable` remain supported.                                | Warn for disallowed/arbitrary classes.                               |
| Checkbox, CheckboxGroup, Radio, RadioGroup, Switch                                        | Fill. Preserve control dimensions, label spacing and states; radio cards need a reviewed pattern.                                                               | Warn                                                                 |
| DropzoneField                                                                             | Fill on its complete field; other layout on a parent.                                                                                                           | Warn                                                                 |
| Dropzone                                                                                  | Margin + Fill. Use size/orientation/progress APIs.                                                                                                              | Warn                                                                 |
| DropzoneList, DropzoneItem                                                                | Fill.                                                                                                                                                           | Warn                                                                 |
| DropzoneTrigger, DropzoneClear                                                            | Button class allowances; no separate arbitrary-value check until separately audited.                                                                            | Warn                                                                 |
| DropzoneArea, ItemPreview, ItemMetadata, ItemProgress, ItemDelete                         | Supported APIs; direct styling requires review.                                                                                                                 | Warn                                                                 |
| Badge, Avatar                                                                             | Margin + `shrink-0`; use supported size/appearance/content APIs.                                                                                                | Warn                                                                 |
| Kbd, KbdGroup                                                                             | Margin; preserve key dimensions and group spacing.                                                                                                              | Warn                                                                 |
| Card, Alert                                                                               | Margin + Fill. Use Card spacing/elevation and Alert intent/appearance/layout APIs.                                                                              | Warn                                                                 |
| CardContent, ModalContent, PopoverContent                                                 | Content layout + Fill; preserve padding, typography and appearance.                                                                                             | Warn                                                                 |
| Card/Alert/Modal/Popover titles, descriptions, headers, footers and close controls        | Supported content/behavior APIs; direct styling requires review.                                                                                                | Warn                                                                 |
| AlertActions                                                                              | `justify-start`, `justify-center`, `justify-end`, `justify-between`, `flex-wrap`; preserve the action gap.                                                      | Warn                                                                 |
| Accordion, Tabs                                                                           | Margin + Fill on the whole component; arrange app-owned panel children.                                                                                         | Warn                                                                 |
| AccordionItem/Header/Panel, TabsOverflow                                                  | Internal trigger, tab and panel styling requires review.                                                                                                        | Warn                                                                 |
| Breadcrumbs, Pagination                                                                   | Margin + Fill. Pagination alignment depends on variant and requires review.                                                                                     | Warn                                                                 |
| Breadcrumb, BreadcrumbOverflow, Link, BreadcrumbBackLink                                  | Supported APIs and parent layout. Link/BackLink expose no public className/style.                                                                               | Warn; types remain the primary guard for unavailable props.          |
| Calendar, RangeCalendar                                                                   | Margin; preserve dimensions and grid. CalendarHeader/GridHeader styling requires review.                                                                        | Warn                                                                 |
| TagGroup, Tag                                                                             | Group: Fill; list wrapping/gap needs slot review. Tag: supported APIs.                                                                                          | Warn                                                                 |
| Table                                                                                     | `w-full` on inner table; put outer layout on the container.                                                                                                     | Warn                                                                 |
| TableResizableContainer                                                                   | Margin + Fill; preserve frame and resize behavior.                                                                                                              | Warn                                                                 |
| TableColumn, TableCell                                                                    | `text-start`, `text-center`, `text-end`, `whitespace-normal`, `whitespace-nowrap`; use column sizing APIs.                                                      | Warn                                                                 |
| Other table parts                                                                         | Preserve frame, padding, row state and resize treatment.                                                                                                        | Warn                                                                 |
| Modal                                                                                     | Supported size/behavior APIs; surface/backdrop/scroll changes require review.                                                                                   | Warn                                                                 |
| Popover, PopoverDialog, Tooltip, MenuPopover, Menu                                        | Width, viewport and scrolling changes require specific review. No general width/height, positioning, z-index or motion permission.                              | Warn                                                                 |
| Select/ComboBox items and sections; Menu items, sections and separators                   | Supported content/behavior APIs; preserve spacing, focus and selection treatment.                                                                               | Warn                                                                 |
| Skeleton                                                                                  | Width/height/min/max/size/aspect and radius needed to match loading content, including arbitrary dimensions. Preserve color and animation.                      | Warn                                                                 |
| Divider                                                                                   | Margin. Length changes require orientation/interactive-variant review because name-only contracts cannot determine the safe axis. Preserve thickness and color. | Warn                                                                 |
| ToastRegion, Toast, ToastContent, ToastActions, ToastTimeoutProgress, ToastCloseButton    | Supported placement/appearance/content APIs; direct styling needs review.                                                                                       | Warn                                                                 |

Two corrections to the September issue proposal follow current implementation:
**DropzoneField** now wraps the label, drop area/list and messages; its className
is a complete-field root. **CheckboxGroup** is a current export and is included.
**PageTab** is historical and has no current source/export, so no fictional rule
is configured. Behavioral trigger providers, hooks, composable Field primitives,
Spinner/LoadingText and provider APIs are outside the current named matrix.

A Veli token does not grant permission to restyle a component. Core Button and
field bracket arbitrary values receive separate warnings. The core contracts also
deny Tailwind v4 CSS-variable shorthand such as `mt-(--custom-gap)` and
`order-(--custom-order)`, which upstream’s arbitrary-value rule misses. For the
other 87 names,
`no-arbitrary-values` is intentionally not enabled: wildcard margin/content
allowances can therefore accept arbitrary values. This is not universal token-
scale validation, and Skeleton dimensions are deliberately flexible.

## Implementation and review-only paths

`veli-styling.mjs` uses one upstream namespace: `shadcn/no-restyle` reports all
97 class contracts as warnings. `shadcn/no-arbitrary-values` also warns, scoped
to Button and the nine fields. Classes outside a rule's named contracts remain
unaffected by that rule. The table's `coverage` field selects these extra checks;
it does not select severity. Repository exceptions retain warning severity.

A small compatibility adapter filters attribute sites when a direct Veli import
is lexically shadowed. Upstream 0.2.3 otherwise mistakes a local parameter named
`Button` (or `UI`) for the import. Class parsing, contract matching and diagnostics
still come from upstream. The adapter also makes pinned 0.2.3's dedicated
Program-only contract-configuration diagnostics fatal, so warning severity does
not hide malformed contract configuration. Keep these CLI regressions when
upgrading; ordinary styling reports remain warnings. The repository config also
registers its normal quality plugins without enabling their rules, so existing accessibility disable comments remain valid.

The small `veli/review-styling-boundaries` rule remains warning-only. It requests
review for internal `*ClassName` / `classNames` props and inline `style`/variables
on recognized direct imports, including compound parts. Root allowances never
imply that an internal slot can safely use the same styling. App-owned content
slots still need their own assessment. This warning is independent of the core
rules: readable forbidden classes still produce their own warnings on the same
element.
The guard resolves nested namespace compounds (`UI.Card.Content`), respects lexical
bindings (including a shadowed `undefined`), and unwraps erased TypeScript casts
before deciding whether a value is empty or `iconOnly` is explicitly false.

It also reviews every nonempty className on an `iconOnly` Button, conservatively
including margin-only classes. It cannot prove a dimension change from every
expression. Core height/size overrides are separately reported as warnings;
root `w-full`/`min-w-0` on iconOnly still need this review because upstream contracts cannot branch on a prop value.

## Repository-local exceptions

`scripts/lint/veli-exceptions.mjs` records **closed, exact-file Button contract
extensions** (six files). They keep the original Button contract, add only the listed tokens,
and preserve arbitrary-value enforcement and all other component contracts.

| File / pattern                                                | Added classes                                                                   | Decision                                                                                                                                                                                                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/storybook/src/tests/button.tsx`                         | `h-8`, `size-8`, `w-16`                                                         | Approved regression inputs; assertions verify 32px overrides and a 64px constrained pending width.                                                                                                                                                   |
| `packages/blocks/src/account-panel/account-panel.tsx`         | `ring-2`, `ring-border-focus`, `ring-offset-2`, `ring-offset-bg-surface-raised` | Approved documented persistent open-state indication; preserves avatar dimensions and normal focus behavior.                                                                                                                                         |
| `packages/blocks/src/notification-tray/notification-tray.tsx` | `relative`, `overflow-visible`                                                  | Temporary: preserve unread decoration until clipping/ripple/RTL comparison establishes safe cleanup or a supported pattern. `relative` is redundant, not generally permitted.                                                                        |
| `packages/blocks/src/service-detail/service-detail.tsx`       | `veli-service-detail-start-button`                                              | Reviewed alias for root `width:100%`; its descendant rule sizes an app-owned trailing-icon span. Changes to this CSS hook need renewed review.                                                                                                       |
| `packages/blocks/src/service-detail/guideline-sheet.tsx`      | `veli-service-detail-mobile-toc-button`                                         | Temporary: preserve the existing floating contents trigger. Reviewed CSS changes visibility, position, z-index and drop shadows; Button dimensions stay owned by `size="lg"`/`iconOnly`. Shadow treatment needs a supported floating-action pattern. |
| `apps/web/src/components/DocsSearch.tsx`                      | `docs-search-trigger`                                                           | Temporary: existing launcher significantly changes appearance and inner alignment; resolve a supported launcher treatment under PD-809. Custom CSS was manually reviewed.                                                                            |

The obsolete Toast reference-preview exception was removed after the upstream
story rewrite eliminated those Button classes.

These are **file-and-component** exceptions, covering every Button in that exact
file; they are not restricted to a single JSX occurrence. Upstream normalization
also admits responsive/state variants of allowed base tokens. Tests prove that
padding still warns on Button and Input in every exception file, arbitrary
core margins still warn, and exception classes warn outside their named file.

This preserves distributable Block source/versions and avoids file-wide rule
ignores or global custom-class permissions. Conservative boundary warnings can
still appear in exception files. Review changes to these registries as policy
changes, including any new Button usage in an excepted file. Temporary exceptions
remain accepted migration debt owned by the Veli maintainers under PD-809.

Preserve forced-colors and truncation repairs identified in the issue until their
Veli replacements are verified. This repository does not add consumer-wide
exceptions for govmv-web or one-fleet, or alter their code.

## Consumer opt-in

Installing Veli does **not** enable lint in an app. This work publishes no config
package and modifies no consumer repository. To opt in:

1. Copy `scripts/lint/veli-styling.mjs`, `veli-contracts.mjs` and this document.
   Keep `veli-exceptions.mjs` and repository-local overrides out of the consumer.
   Format the copied modules and new config with the app's formatter before its
   normal checks. Veli's formatting can differ (for example, semicolons versus
   govmv's Oxfmt settings); this is source adoption, not a drop-in formatted package.
   With Oxfmt, target only these files:
   `corepack pnpm exec oxfmt scripts/lint/veli-styling.mjs scripts/lint/veli-contracts.mjs eslint.veli.config.mjs`.
2. Install `@shadcn/lint@0.2.3`, ESLint >=9.30 and `typescript-eslint` >=8.40
   (the example below uses its parser export). Node must be >=20.19; Veli's checkout requires Node >=24.
3. Reuse the app's parser and ignores in a separate flat config. The following
   minimal example assumes no directives for unrelated lint plugins; if source
   contains those directives, also register their plugin definitions from the
   app's existing config without enabling its quality rules here:

   ```js
   import tseslint from 'typescript-eslint';
   import { veliStyling } from './scripts/lint/veli-styling.mjs';

   export default [
     { ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**'] },
     { files: ['**/*.{jsx,tsx}'], languageOptions: { parser: tseslint.parser } },
     veliStyling,
   ];
   ```

   An Oxlint-only app may have no ESLint plugin registry to reuse. If it retains
   `@next/next/no-img-element` directives, install a compatible
   `@next/eslint-plugin-next` dev dependency and register its definitions explicitly.
   For example, keep the minimal config above and add `eslint.veli.next.config.mjs`:

   ```js
   import nextPlugin from '@next/eslint-plugin-next';
   import base from './eslint.veli.config.mjs';

   export default [
     ...base,
     { plugins: { '@next/next': nextPlugin } },
     { linterOptions: { reportUnusedDisableDirectives: 'off' } },
   ];
   ```

   Use `eslint --config eslint.veli.next.config.mjs src` for this adaptation.
   It registers definitions without enabling Next quality rules in this separate
   styling pass. The app's existing quality command stays unchanged. Missing plugins
   still fail; do not discard errors or disable source directives wholesale.

4. Add an app-owned command such as
   `eslint --config eslint.veli.config.mjs src` (use that app’s source folders).
   Baseline the app's actual usages and preserve required accessibility/behavior
   repairs before adding the command to its CI. The copied configuration is already
   warning-only; do not override its severities or discard exit codes. Never add
   `--max-warnings 0`, blanket `|| true`, or catches that hide parse/configuration
   failures. Any future promotion to blocking requires a separate rollout decision.

Upstream documents Oxlint >=1.80, but this local boundary rule is an ESLint
integration. Verify adapter support independently before adopting it with Oxlint.
The copied policy modules pass an isolated Oxlint 1.72.0 quality smoke test using
the config preserved in the independent govmv source-copy review. Oxlint is pinned
as a Veli test dependency for that regression, not used to run the styling rules.
This does not establish installed govmv compatibility or a supported Oxlint adapter.
Current remote govmv-web/one-fleet reads returned 404. A local govmv snapshot
`b0215c3` uses Veli UI 0.14.0 and Oxlint `^1.72.0`, below upstream's documented
Oxlint minimum; this snapshot does not establish the current remote version.

An earlier mixed-severity, read-only source trial on 2026-10-22 linted 73
direct-importing files in that local govmv snapshot: 37 core errors and 224
warnings, plus two unresolved foreign lint directives in the Veli-only test config. OnePass snapshot `2788627` had seven
files, four Button `flex-1` errors and 14 warnings; login/OIDC fields passed.
Those class findings now warn under this rollout; the historical audit was not
rerun as an installed app integration. Source hashes were unchanged after the
audit. These trials run source in memory against this policy and current public Veli entries, not the apps' real installed
lint/config/import graphs. They are migration evidence, not production audits.
Web2's checked checkout imports Veli tokens but no Veli UI; its unrelated local
changes were preserved and no component-policy pass is claimed for it.

## Verified limits and sources

Pinned `@shadcn/lint` 0.2.3 was verified against official npm metadata/source;
its integrity and optional parser dependencies are locked. Current upstream main
may describe improvements absent from this release. Policy tests cover all 97
named contracts, warning severity, coverage separation, compound parts, direct
import aliases and namespaces, CLI exit behavior, exact-file exceptions and known blind spots.
The documented consumer config is also executed in a temporary project outside
the workspace using copied Veli public entries and no repository exceptions.
A separate clean install used actual packed UI/token tarballs, ESLint 9.39.4,
typescript-eslint 8.59.3 and React 19.2.8, with no workspace links. Allowed and
locally shadowed examples passed; protected Button/Input classes and a Badge
override warn and exit successfully under the refreshed warning-only policy.
All nine core public entries imported.
The earlier 2026-10-22 snapshot had an inherited peer mismatch: UI 0.16.0
required tokens `^0.10.0`, while the token source was 0.9.1. That historical
installation succeeded with a peer warning. The reviewed 2026-10-25 main baseline
(`a8eca75`), now integrated into this branch, contains UI 0.17.0 and tokens 0.10.0;
installed candidate fixtures with that pair pass `pnpm peers check`. Lint
validation does not approve package publication or consumer runtime upgrades.

This branch's policy targets `@veli-design/react` public imports and excludes
`packages/react/**` implementation files. Import matchers, test package paths,
implementation exclusions and setup commands use the same names. Historical
investigation excerpts above retain their original version context; package
publication and consumer upgrades remain separate from lint validation.

- Descendant selectors can bypass a root allowance: `[&_input]:w-full` can pass.
  Parent selectors, `*:`/`**:`, CSS files and ancestor variables are not traced to
  their affected components. Review these separately.
- Class callbacks, imported values and unknown props spreads can go unread.
  Generated `cva()` calls and array `.join()` expressions can also pass unread.
  Aliased helper names such as `mergeClasses` require explicit registration in
  `settings.shadcn.mergeFunctions`; canonical `cn`/`clsx` calls and readable
  conditional/template strings are covered. Upstream can follow forwarding
  wrappers from real source files; the boundary guard does not follow their props.
  Virtual `lintText` fixtures alone do not establish wrapper/import-graph coverage.
  Literal spreads can be read by upstream, but the boundary guard does not inspect
  `style` or internal props hidden inside spreads. `require-static-classes` is not
  enabled; unreadable does not mean permitted.
- Upstream inspects readable class sites conservatively rather than applying JSX
  last-write precedence across attributes/spreads. A forbidden class can still be
  reported when a later known prop replaces it. Prefer one final class prop or
  review the finding; this integration does not implement a new expression engine.
- Consumer re-export barrels are missed by the tested package-import setup.
  Prefer direct public imports for this rollout and verify application aliases.
- Compound-part resolution in this checkout requires built public UI entries.
  The local boundary guard handles direct named/namespace/compound imports and
  shadowing, not wrapper graphs, barrel exports or styling hidden inside spreads.
- A clean result establishes only that recognized, readable usages passed. Keep
  behavioral/a11y review and the upstream-gap tests when upgrading dependencies.

Official references: [upstream](https://github.com/shadcn-ui/lint),
[no-restyle contracts](https://github.com/shadcn-ui/lint/blob/main/docs/rules/no-restyle.md),
[configuration](https://github.com/shadcn-ui/lint/blob/main/docs/rules.md),
[analysis limits](https://github.com/shadcn-ui/lint/blob/main/docs/how-it-works.md),
[pinned registry release](https://registry.npmjs.org/@shadcn/lint/0.2.3).
