# Veli component styling contracts (PD-809)

Apps own outer layout; Veli owns appearance and internal behavior. This repository
uses two enforcement tiers for [PD-809](https://linear.app/onegov/issue/PD-809/decide-where-well-expose-all-react-aria-apis-and-expose-required-one):

- **Block:** statically resolved disallowed/arbitrary classes on Button and the
  eight reviewed complete fields.
- **Warn:** the remaining component matrix, internal styling props, inline styles,
  CSS variables and conservative icon-only review. These need more usage audits.

The source of truth is `scripts/lint/veli-contracts.mjs`: **96 current components
and parts**, with 9 blocking contracts and 87 advisory contracts. This implements
consumer styling guardrails; it changes no React Aria or public component APIs.

## Commands and CI

```sh
# In a fresh local checkout, build public entries for compound-part resolution.
corepack pnpm --filter @tradenetcorp/veli-ui build
corepack pnpm test:veli-lint
corepack pnpm lint:veli
```

`lint:veli` scans JSX/TSX in apps and application-owned Blocks source. It exits 1
for core violations and 0 for advisory-only findings. Syntax/configuration errors
also fail. Both the policy tests and command run in `check` and CI. CI runs them
following the package build so local public exports, including compound parts,
resolve consistently. The normal code-quality lint retains its existing rules.

Keep styling lint separate from the existing `--max-warnings 0` invocation:
review-level warnings must remain non-blocking. Existing implementation and build
ignores are reused; `packages/ui/**` owns its internals and is excluded. Public
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

| Component / slot                                                                       | Allowed changes                                                                                                                                                 | Level                                                                    |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Button                                                                                 | Margin, Fill, Button placement. Use `size`, `intent`, `appearance` for visual treatment. Icon-only dimensions remain defined by Veli.                           | **Block** disallowed/arbitrary classes; icon-only boundary review warns. |
| Input, PasswordInput, Search, TextArea, Select, ComboBox, DateField, DatePicker        | Fill on the complete field. Parent handles placement. TextArea `rows`, `minHeight`, `maxHeight`, `isResizable` remain supported.                                | **Block** disallowed/arbitrary classes.                                  |
| Checkbox, CheckboxGroup, Radio, RadioGroup, Switch                                     | Fill. Preserve control dimensions, label spacing and states; radio cards need a reviewed pattern.                                                               | Warn                                                                     |
| DropzoneField                                                                          | Fill on its complete field; other layout on a parent.                                                                                                           | Warn                                                                     |
| Dropzone                                                                               | Margin + Fill. Use size/orientation/progress APIs.                                                                                                              | Warn                                                                     |
| DropzoneList, DropzoneItem                                                             | Fill.                                                                                                                                                           | Warn                                                                     |
| DropzoneTrigger, DropzoneClear                                                         | Button allowances, with advisory enforcement until separately audited.                                                                                          | Warn                                                                     |
| DropzoneArea, ItemPreview, ItemMetadata, ItemProgress, ItemDelete                      | Supported APIs; direct styling requires review.                                                                                                                 | Warn                                                                     |
| Badge, Avatar                                                                          | Margin + `shrink-0`; use supported size/appearance/content APIs.                                                                                                | Warn                                                                     |
| Kbd, KbdGroup                                                                          | Margin; preserve key dimensions and group spacing.                                                                                                              | Warn                                                                     |
| Card, Alert                                                                            | Margin + Fill. Use Card spacing/elevation and Alert intent/appearance/layout APIs.                                                                              | Warn                                                                     |
| CardContent, ModalContent, PopoverContent                                              | Content layout + Fill; preserve padding, typography and appearance.                                                                                             | Warn                                                                     |
| Card/Alert/Modal/Popover titles, descriptions, headers, footers and close controls     | Supported content/behavior APIs; direct styling requires review.                                                                                                | Warn                                                                     |
| AlertActions                                                                           | `justify-start`, `justify-center`, `justify-end`, `justify-between`, `flex-wrap`; preserve the action gap.                                                      | Warn                                                                     |
| Accordion, Tabs                                                                        | Margin + Fill on the whole component; arrange app-owned panel children.                                                                                         | Warn                                                                     |
| AccordionItem/Header/Panel, TabsOverflow                                               | Internal trigger, tab and panel styling requires review.                                                                                                        | Warn                                                                     |
| Breadcrumbs, Pagination                                                                | Margin + Fill. Pagination alignment depends on variant and requires review.                                                                                     | Warn                                                                     |
| Breadcrumb, BreadcrumbOverflow, Link, BreadcrumbBackLink                               | Supported APIs and parent layout. Link/BackLink expose no public className/style.                                                                               | Warn; types remain the primary guard for unavailable props.              |
| Calendar, RangeCalendar                                                                | Margin; preserve dimensions and grid. CalendarHeader/GridHeader styling requires review.                                                                        | Warn                                                                     |
| TagGroup, Tag                                                                          | Group: Fill; list wrapping/gap needs slot review. Tag: supported APIs.                                                                                          | Warn                                                                     |
| Table                                                                                  | `w-full` on inner table; put outer layout on the container.                                                                                                     | Warn                                                                     |
| TableResizableContainer                                                                | Margin + Fill; preserve frame and resize behavior.                                                                                                              | Warn                                                                     |
| TableColumn, TableCell                                                                 | `text-start`, `text-center`, `text-end`, `whitespace-normal`, `whitespace-nowrap`; use column sizing APIs.                                                      | Warn                                                                     |
| Other table parts                                                                      | Preserve frame, padding, row state and resize treatment.                                                                                                        | Warn                                                                     |
| Modal                                                                                  | Supported size/behavior APIs; surface/backdrop/scroll changes require review.                                                                                   | Warn                                                                     |
| Popover, PopoverDialog, Tooltip, MenuPopover, Menu                                     | Width, viewport and scrolling changes require specific review. No general width/height, positioning, z-index or motion permission.                              | Warn                                                                     |
| Select/ComboBox items and sections; Menu items, sections and separators                | Supported content/behavior APIs; preserve spacing, focus and selection treatment.                                                                               | Warn                                                                     |
| Skeleton                                                                               | Width/height/min/max/size/aspect and radius needed to match loading content, including arbitrary dimensions. Preserve color and animation.                      | Warn                                                                     |
| Divider                                                                                | Margin. Length changes require orientation/interactive-variant review because name-only contracts cannot determine the safe axis. Preserve thickness and color. | Warn                                                                     |
| ToastRegion, Toast, ToastContent, ToastActions, ToastTimeoutProgress, ToastCloseButton | Supported placement/appearance/content APIs; direct styling needs review.                                                                                       | Warn                                                                     |

Two corrections to the September issue proposal follow current implementation:
**DropzoneField** now wraps the label, drop area/list and messages; its className
is a complete-field root. **CheckboxGroup** is a current export and is included.
**PageTab** is historical and has no current source/export, so no fictional rule
is configured. Behavioral trigger providers, hooks, composable Field primitives,
Spinner/LoadingText and provider APIs are outside the current named matrix.

A Veli token does not grant permission to restyle a component. Core Button and
field bracket arbitrary values receive separate errors. The core contracts also
deny Tailwind v4 CSS-variable shorthand such as `mt-(--custom-gap)` and
`order-(--custom-order)`, which upstream’s arbitrary-value rule misses. For the advisory matrix,
`no-arbitrary-values` is intentionally not enabled: wildcard margin/content
allowances can therefore accept arbitrary values. This is not universal token-
scale validation, and Skeleton dimensions are deliberately flexible.

## Implementation and review-only paths

`veli-styling.mjs` uses the same upstream plugin under two ESLint namespaces:
`shadcn/no-restyle` enforces the reviewed core as errors;
`shadcn-review/no-restyle` reports the remaining contracts as warnings.
`shadcn/no-arbitrary-values` errors are scoped to the core. Classes outside a
rule's named contracts remain unaffected by that rule.

A small compatibility adapter filters attribute sites when a direct Veli import
is lexically shadowed. Upstream 0.2.3 otherwise mistakes a local parameter named
`Button` (or `UI`) for the import. Class parsing, contract matching and diagnostics
still come from upstream. Keep the adapter's regression tests when upgrading.
The repository config also registers its normal quality plugins without enabling
their rules, so existing accessibility disable comments remain valid.

The small `veli/review-styling-boundaries` rule remains warning-only. It requests
review for internal `*ClassName` / `classNames` props and inline `style`/variables
on recognized direct imports, including compound parts. Root allowances never
imply that an internal slot can safely use the same styling. App-owned content
slots still need their own assessment. This warning is independent of the core
rules: readable forbidden classes can still produce errors on the same element.
The guard resolves nested namespace compounds (`UI.Card.Content`), respects lexical
bindings (including a shadowed `undefined`), and unwraps erased TypeScript casts
before deciding whether a value is empty or `iconOnly` is explicitly false.

It also reviews every nonempty className on an `iconOnly` Button, conservatively
including margin-only classes. It cannot prove a dimension change from every
expression. Making this heuristic blocking would reject valid usages. Core
height/size overrides are already errors; root `w-full`/`min-w-0` on iconOnly still
need this review because upstream contracts cannot branch on a prop value.

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
padding remains an error on Button and Input in every exception file, arbitrary
core margins still fail, and exception classes fail outside their named file.

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

4. Add an app-owned command such as
   `eslint --config eslint.veli.config.mjs src` (use that app’s source folders).
   Baseline the app's actual usages and preserve required accessibility/behavior
   repairs before adding the command to its CI. For an all-warning first pass,
   override the two `shadcn/*` core rule severities to `warn`, keeping their options.
   Adopt blocking core contracts after reviewing that app's exceptions. Never use
   `--max-warnings 0` to accidentally promote the advisory tier.

Upstream documents Oxlint >=1.80, but this local boundary rule is an ESLint
integration. Verify adapter support independently before adopting it with Oxlint.
Current remote govmv-web/one-fleet reads returned 404. A local govmv snapshot
`b0215c3` uses Veli UI 0.14.0 and Oxlint `^1.72.0`, below upstream's documented
Oxlint minimum; this snapshot does not establish the current remote version.

A read-only source trial on 2026-10-22 linted 73 direct-importing files in that
local govmv snapshot: 37 core errors and 224 warnings, plus two unresolved foreign
lint directives in the Veli-only test config. OnePass snapshot `2788627` had seven
files, four Button `flex-1` errors and 14 warnings; login/OIDC fields passed.
Source hashes were unchanged after the audit. These trials run source in memory
against this policy and current public Veli entries, not the apps' real installed
lint/config/import graphs. They are migration evidence, not production audits.
Web2's checked checkout imports Veli tokens but no Veli UI; its unrelated local
changes were preserved and no component-policy pass is claimed for it.

## Verified limits and sources

Pinned `@shadcn/lint` 0.2.3 was verified against official npm metadata/source;
its integrity and optional parser dependencies are locked. Current upstream main
may describe improvements absent from this release. Policy tests cover all 96
named contracts, severity separation, compound parts, direct import aliases and
namespaces, CLI exit behavior, exact-file exceptions and known blind spots.
The documented consumer config is also executed in a temporary project outside
the workspace using copied Veli public entries and no repository exceptions.
A separate clean install used actual packed UI/token tarballs, ESLint 9.39.4,
typescript-eslint 8.59.3 and React 19.2.8, with no workspace links. Allowed and
locally shadowed examples passed, protected Button/Input classes failed, and an
advisory Badge finding exited successfully. All nine core public entries imported.
Current main's development versions have an inherited peer mismatch: UI 0.16.0
requires tokens `^0.10.0`, while the token source is 0.9.1. Default installation
succeeds with that warning; `pnpm peers check` reports it. The existing release
plan advances tokens to 0.10.0. This lint validation does not approve publishing
the current development package versions.

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
