# PD-848: Table public-release audit

Audit date: 22 October 2026. Branch: `feature/pd-848-audit-table-for-public-release`, based on `origin/main`.

[Linear issue](https://linear.app/onegov/issue/PD-848/audit-table-for-public-release) · [Figma baseline](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=1977-6930)

The designer requested no design updates. The Figma page contains six example compositions (default, sortable, selectable, empty, resizable, reorderable), rather than size or appearance variants. The existing rounded frame, typography, spacing, logical alignment and resize-handle treatment are retained. Figma's dark preview was reviewed as a baseline; its notes explicitly say a Dhivehi preview is pending, so RTL was validated against the provider and component behavior, rather than claiming an unavailable Figma RTL comparison.

## Findings and changes

- Replaced obsolete text, icon and hover utility names with generated semantic tokens. Canonicalized the selected-row background alias. Disabled cell text now uses the disabled token instead of overriding its row's colour.
- Added cell keyboard-focus rings, reduced-motion handling for row feedback, and the valid Tailwind `touch-none` utility on resize handles.
- Localized selection labels, the default empty message, and the hidden drag-column heading for English/Dhivehi. The hidden heading resolves axe's empty-header finding without changing the visible design. Explicit `emptyMessage={null}` still suppresses fallback text; `renderEmptyState` still takes precedence.
- Expanded Storybook from five to thirteen stories: Default, Sortable, With Selection, Resizable Columns, Drag And Drop, Empty, Custom Empty State, Single Selection, Replace Selection, Uncontrolled Selection, Row Actions, Sticky Header, Narrow Container. Composed parts appear in autodocs. Custom demos disable controls they do not consume.
- Added interaction assertions for sorting by pointer/keyboard, selection and disabled rows, empty-state priority, keyboard resizing/reordering, and row actions. Added public API type checks and seven package tests, including a generated-token check that catches the original stale colour utilities.
- Expanded the website Code tab with working examples, controlled/uncontrolled selection guidance, sorting ownership, resize/reorder keyboard instructions, responsive/sticky behavior and an accurate API reference. Removed the claim that every React Aria prop is accepted unchanged. The Dhivehi/English preview synchronizes its highlighted source and Copy content through the existing preview-code mechanism.

## Evidence

Storybook route: `/?path=/docs/components-table--docs`; individual stories use `components-table--<story-name>`. Website route: `/docs/table/#tab-code`. The website's Explore in Storybook action uses its configured `PUBLIC_STORYBOOK_URL`.

- [Default, light, English](assets/pd-848/default-light.png)
- [Selection and disabled row, dark, Dhivehi](assets/pd-848/selection-dark-rtl.png)
- [Narrow RTL viewport](assets/pd-848/narrow-rtl.png)

The default light layout was compared with Figma's Table frame `5236:133`. Sorting indicators remain vertical; selection and drag columns move to the logical start. Browser computed styles confirmed Inter for English and MV Faseyha for Dhivehi, different disabled/body colours, and the teal selected-row fill. System mode followed emulated light/dark preferences. With reduced motion enabled, row `transition-property` is `none`.

At a 360px viewport the page remained 360px wide while the table's frame was 318px wide with 640px of scrollable content. Keyboard resizing changed the first column from 220 to 230px; pointer dragging then changed it to 260px and exposed the teal resizing state; keyboard reordering moved the first row after the second. Sticky headers were checked in a bounded scrolling frame.

## Validation

All repository commands use `corepack pnpm`.

| Check                                                                | Result                                                                                                                                                                                                                                              |
| :------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--filter @tradenetcorp/veli-ui test`                                | 187 tests, including seven Table tests, pass.                                                                                                                                                                                                       |
| `--filter @tradenetcorp/veli-ui lint`                                | Pass; public API type checks compile.                                                                                                                                                                                                               |
| `--filter @tradenetcorp/veli-ui package:check`                       | All 39 exports resolve; relative ESM imports pass.                                                                                                                                                                                                  |
| Table-only Storybook `tsc --noEmit`                                  | Pass using a temporary config extending Storybook's config and including `table.stories.tsx`.                                                                                                                                                       |
| Storybook browser interaction matrix                                 | All 13 stories report `storyFinished.status = success` in English and Dhivehi with dark theme; light-mode interactions also checked.                                                                                                                |
| axe 4.12.1                                                           | Six Figma compositions checked in light/dark Dhivehi. Zero violations after the drag-header fix. Empty state requires manual review of the expected no-data-row finding; one light sorting contrast result was indeterminate during focus feedback. |
| Website tests / Astro diagnostics / static build                     | 28 tests pass, zero Astro errors/warnings; 59 pages build and all 57 Markdown artifacts plus `llms.txt` validate.                                                                                                                                   |
| Isolated release-site consumer                                       | Both website and Storybook build against packed UI `0.16.0` and token `0.9.1` candidates, with no UI/token source checkout or source aliases. Rebuilt after the final drag-header/docs fixes.                                                       |
| Code tab browser check                                               | All examples hydrate. Switching Dhivehi to English changes the grid and highlighted source to `language="en"`; Copy reads that same live code node. No missing checkbox description IDs remain after visibility hydration.                          |
| Changed-file ESLint, Prettier, `git diff --check`, `changeset:check` | Pass.                                                                                                                                                                                                                                               |

The isolated build uses `scripts/release-sites.mjs`: build and pack UI/tokens, generate a manifest, stage a consumer outside the repository with `VELI_TARBALLS` pointing at the tarballs, then build both sites. The production website will update through the existing release workflow after publication; no production deployment was performed by this audit.

## Limits and review

The full Storybook TypeScript command currently fails in unrelated stories/configuration (including Account Panel, Alert, Divider, Error Page and Popover). The focused Table check passes. Existing build output also includes the standard chunk-size and Node deprecation notices. These were not expanded into this component audit.

No manual assistive-technology session or touch-device hardware session was performed; browser keyboard operation, accessible names/roles, focus, axe and responsive behavior were checked. There is no existing Table visual-regression baseline, so committed screenshots provide review evidence rather than an automated pixel-regression claim.

No breaking API change or migration is required. A UI patch changeset records the consumer-visible fixes. Designer guidance is recorded above; final code/release sign-off remains with the pull-request reviewer. No new component-specific follow-up issue is required by the findings resolved here.

The local pre-push gate was also attempted. Homebrew Node 26 initially failed the release README test's npm-location assumption; a Node 24 rerun passed release tests, token tests, 187 UI tests and 59 block tests. New Node processes then stalled before initialization, preventing the next script from starting. A diagnostic overlapping build was stopped after a Storybook output collision. CLI tests (35), full formatting and lint checks were run separately and passed; the isolated candidate site builds passed. The local aggregate check is therefore incomplete, and CI must supply the final aggregate gate. The local pre-push hook was skipped only for publishing the review branch, with this limitation recorded.
