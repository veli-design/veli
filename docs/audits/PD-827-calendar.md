# PD-827 Calendar audit

Audit date: 22 October 2026. Covers Calendar and RangeCalendar; DatePicker is included in the Changelog reconciliation and checked as a consumer of the shared calendar.

## References

- [PD-827](https://linear.app/onegov/issue/PD-827/audit-calendar-for-public-release)
- [Figma Calendar page](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=5267-2)
- [English base variants](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=5267-1146)
- [Dhivehi base variants](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=5268-1537)
- [Light/dark review matrix](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=5269-1068)
- Storybook: `Components/Calendar`, including Playground, Responsive, Six Week Month, Range States, Validation States, and the controlled-selection examples.
- Website: `/docs/calendar/`, Code tab, including State and Language selectors with synchronized source.

## Changes and findings

- Removed mobile overflow caused by a fixed table width, including WebKit's handling of table `max-width`. The default surface retains Figma's 318 px width and 44 px day targets. Narrow containers retain seven columns and 44 px row heights; month labels can wrap when necessary.
- Preserved the single-date, range, invalid, disabled, Today, and RTL visual treatments from Figma. Latin day numerals retain the English body typography in Dhivehi calendars. Dhivehi weekday and month labels retain their Dhivehi typography.
- Localized navigation names, corrected logical RTL header padding, exposed disabled-calendar semantics, disabled its year control, and added reduced-motion handling for year-menu options.
- Prevented Dhivehi SSR hydration mismatches in WebKit while preserving RTL keyboard behavior. A scoped grid fallback uses React Aria state actions when WebKit/ICU incorrectly identifies Dhivehi as LTR; both selection modes are regression-tested with incorrect native direction data.
- Added Calendar rendering tests and reproducible browser checks. Expanded deterministic stories using the audited Playground, grouped-control, localized-argument, and collapsed Content/State patterns.
- Added dedicated website examples, RangeCalendar documentation, four-column API tables, and state/language previews with matching source. Excluded preview headings and tables from documentation prose styles that had enlarged the library's month heading to 32 px and added grid margins.
- Existing imports, exported types, composition helpers, and default Today behavior are preserved. No consumer migration is required.

## Changelog reconciliation: Calendar and DatePicker

The first audit omitted the separate Changelog checklist. The follow-up inspected every non-instance text entry on [the Changelog page](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=556-22811) containing Calendar or DatePicker, and reconciled these seven cards:

| Date / entry                                                                                                                           | Result                                                                                                                                                                                                                                                                                                                                                                                                                   |
| :------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [June 2 — calendar variables](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=1222-12788)               | Existing `calendar/bg`, `bg-month-year`, `day-hover`, `day-selected`, `day-range`, and `day-range-hover` tokens are used.                                                                                                                                                                                                                                                                                                |
| [June 2 — DatePicker added](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=1222-13124)                 | Existing field, popover, navigation and Today composition preserved. Current active variants, rather than the old preview text, are the visual reference.                                                                                                                                                                                                                                                                |
| [June 17 — Figma library publication](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=1994-8859)        | Publication record; no additional React feature is requested by this entry.                                                                                                                                                                                                                                                                                                                                              |
| [June 28 — variable hierarchy](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=2058-14725)              | Calendar/DatePicker use generated component and semantic token utilities rather than raw palette colors.                                                                                                                                                                                                                                                                                                                 |
| [October 12 — Calendar and new day states](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=5269-128375) | Single/range, default/invalid/disabled/read-only, focus, unavailable, selected-invalid, RTL, six-week months, Today and error messages covered. The follow-up corrects the selected Today-dot token and explicit error-icon token.                                                                                                                                                                                       |
| [October 13 — DatePicker/Dv and docs](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=5385-175045)      | Names/defaults mapped in docs; both appearances and all three sizes covered by the States and sizes story. Resting and interactive states, native Dhivehi labels, Latin day/month/year segments, fixed 36/44/52 px field heights, mirrored calendar, and 20/16 px calendar/info icons are checked. DatePicker-specific disabled-label, required-indicator and helper tokens are aligned without changing sibling fields. |
| [October 20 — 10 px field radius](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=6174-580836)          | DatePicker now uses `radius/field` (10 px) in both appearances and every size/state; this newer entry supersedes the older Anatomy note describing raw radii. Other field components are outside this change.                                                                                                                                                                                                            |

### Today-dot distinction

The unselected Today indicator ([1210:5533](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=1210-5533)) binds to `components/calendar/day-selected`. When today is also selected, the large selection fill still uses that token, the date number uses `color/white`, and the **small dot inside the selection** ([1210:5535](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=1210-5535)) binds to `color/white`. Both dots are 4 × 4 px at y = 34 in a full 44 px day cell. Storybook's Today Indicator States makes the combined case explicit, including a one-day range.

### DatePicker geometry, field states and documented mappings

Current English and Dhivehi active DatePicker variants instantiate the private calendars [1222:8162](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=1222-8162) and [5372:2438](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=5372-2438). They are 316 px wide, with 44 px days, a 36 px Today footer and a 274 px separator. The default five-week layouts are 336 px high in English and 352 px in Dhivehi (48 px Dhivehi header and 40 px weekday row). Code's forced 39 px days were removed; the default geometry now follows these references and shrinks only when the viewport requires it.

Filled values, including invalid filled values, use `text/base/strong`. Outline filled fields use `text-input/bg-hover`; keyboard-focused and active fields use `text-input/bg-pressed`, verified against [outline filled](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=1222-8749), [outline focus](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=1222-8674), and [invalid filled](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=1222-8785) variants. These corrections are scoped to DatePicker.

Dhivehi native Intl data produced month/day/year in Chromium and year/month/day in macOS WebKit. DatePicker now scopes an `en-GB` Gregorian formatter and English numeric typography to its editable field, keeping Latin day/month/year segments LTR and aligned right, while the outer labels, icon order and calendar remain Dhivehi/RTL. Other caller locales remain inherited.

The Figma Header/Help Icon/Footer controls map to label/tooltip/message props. Required takes precedence over Optional. The composed DatePicker retains its calendar trigger. Figma's `sm` initial variant differs from the existing React `md` default, and static placeholder copy differs from editable date segments; these mappings are recorded here rather than represented as new props. The skeleton variant remains design-only under the already completed [PD-589 decision](https://linear.app/onegov/issue/PD-589/remove-skeleton-loaders-from-component-internals); the October 13 question is therefore resolved by existing product policy, not an unimplemented loading API.

The DatePicker-specific text corrections address its portion of [PD-1001](https://linear.app/onegov/issue/PD-1001/align-shared-field-header-and-footer-colours-with-figma); that shared-field issue remains open for the other components. Native accessible Dhivehi month terminology remains tracked by PD-1165.

## Accessibility finding retained for Figma alignment

[PD-1164](https://linear.app/onegov/issue/PD-1164/calendar-review-active-selected-date-contrast-in-dark-figma-variants) originally tracked **3.28:1** (`#0e0e0d` on `#146f77`) for active selected dates and range endpoints in dark mode. Basim's approved 22 October update replaces selected/error date text and the corresponding Today dots with `color/white`. The implementation now follows that update; see the [scoped follow-up and evidence](PD-1164-selected-contrast.md). The original measurements below remain historical audit evidence.

The browser audit now fails active selected-date contrast regressions. Disabled controls and previous/next-month dates remain excluded. This follow-up does not claim full WCAG conformance or close the separate PD-1165/PD-1166 findings.

[PD-1165](https://linear.app/onegov/issue/PD-1165/calendar-improve-dhivehi-accessible-date-descriptions-in-webkit) tracks WebKit's incomplete Dhivehi accessible month descriptions (`2026 M10`). Visible Dhivehi labels match Figma; the remaining finding concerns hidden date descriptions and announcements.

[PD-1166](https://linear.app/onegov/issue/PD-1166/datepicker-review-active-placeholder-and-optional-label-contrast-in) records enabled DatePicker placeholder contrast (2.67:1 light / 2.31:1 dark) and Optional-label contrast (3.08:1 light / 3.22:1 dark). These Figma token bindings are retained. Disabled controls are excluded. Both engines and both languages reproduce the active findings.

## Validation

- UI suite: 193 tests and recipe type checks passed; public package entry checks passed (39 exports).
- Changeset tooling: 32 passed on Node 24; agent-eval scorer: 28; tokens: 21; blocks: 54; CLI: 35. Website preview/Markdown tests: 28.
- Production monorepo build, focused changed-file lint, formatting, changeset validation, sidecar-drift check, and whitespace validation passed. Full local lint reproduces errors in unchanged `FoundationHeaderArt.astro:53` and `pages/index.astro:79`; clean PR CI runs full lint.
- Browser evidence is **desktop/mobile emulation**, not physical-device testing. The matrix uses 320, 360, 375, 390, 414, 768, 1280, and 844 px widths, including 390 × 844 portrait and 844 × 390 landscape; English/Dhivehi × light/dark × Chromium/WebKit gives 64 viewport cases, each containing both selection modes.
- DatePicker adds 64 viewport cases with 30 fields each, checking both appearances, all three sizes and empty/filled/invalid/disabled/read-only states. Another 48 desktop combinations check hover, visible keyboard focus, active fill, selection and focus return. Both engines verify 316 × 336/352 px popovers, 44 px unconstrained day targets, fixed field heights/radius, numeric date order, helper associations, constraints, Today, and exact Today-dot tokens/geometry.
- Interaction checks cover touch selection, range endpoints, direction-aware keyboard selection, month/year navigation, scrollable year menus, Escape/focus return, DatePicker placement at both edges, outside-tap dismissal, Today, disabled/read-only behavior, validation associations, six-week months, system-theme switching, and reduced motion. No browser console errors or uncaught exceptions were observed in the completed component matrix.
- The production-docs regression checks cover mobile widths, hydration, library heading typography, intrinsic calendar width, State/Language controls, and synchronized displayed source. All 28 production-docs viewport cases passed (14 Calendar and 14 DatePicker) in Chromium/WebKit, with no hydration errors; State and Language controls update their displayed source. The PR workflow reruns all three suites and uploads complete evidence.
- Additional Storybook-wide `tsc --noEmit` reports existing errors in other stories/configuration (including Alert, Divider, Popover, and the token playground declaration); no Calendar errors were reported. The standard Storybook production build succeeds.
- The first changeset-tooling attempt on Homebrew Node 26 failed to locate npm beside that Node installation; the same suite passed on the repository's Node 24 runtime.
- Physical devices, manual screen-reader sessions, and release publication were not run. Installed-package Next and isolated-site checks are left to the existing PR CI jobs.

## Evidence

The compact [validation data](PD-827-calendar-evidence.json) records viewport measurements and known design contrast findings. Representative captures:

| Case                     | Screenshot                                                               |
| :----------------------- | :----------------------------------------------------------------------- |
| English/light, mobile    | [390 px](assets/pd-827/chromium-en-light-390.png)                        |
| English/dark, mobile     | [390 px](assets/pd-827/chromium-en-dark-390.png)                         |
| Dhivehi/light, mobile    | [390 px](assets/pd-827/chromium-dv-light-390.png)                        |
| Dhivehi/dark, mobile     | [390 px](assets/pd-827/chromium-dv-dark-390.png)                         |
| WebKit narrow layout     | [320 px](assets/pd-827/webkit-en-light-320.png)                          |
| WebKit Dhivehi/dark      | [320 px](assets/pd-827/webkit-dv-dark-320.png)                           |
| Landscape                | [844 × 390](assets/pd-827/chromium-en-light-844.png)                     |
| Desktop baseline         | [1280 px](assets/pd-827/chromium-en-light-1280.png)                      |
| Production docs          | [320 px](assets/pd-827/docs-chromium-320.png)                            |
| DatePicker English/light | [390 px](assets/pd-827/datepicker-popover-chromium-en-light-default.png) |
| DatePicker English/dark  | [390 px](assets/pd-827/datepicker-popover-chromium-en-dark-outline.png)  |
| DatePicker Dhivehi/light | [390 px](assets/pd-827/datepicker-popover-chromium-dv-light-default.png) |
| DatePicker Dhivehi/dark  | [390 px](assets/pd-827/datepicker-popover-chromium-dv-dark-outline.png)  |
| Today combined states    | [390 px](assets/pd-827/today-indicators-chromium-en-light.png)           |
| DatePicker docs          | [320 px](assets/pd-827/datepicker-docs-chromium-320.png)                 |

## Reproduce

Use a separate runtime directory, following the repository's existing isolated-browser setup:

```sh
node scripts/prepare-playground-browser.mjs /tmp/veli-calendar-browser
corepack pnpm --dir /tmp/veli-calendar-browser exec playwright install webkit
corepack pnpm --dir /tmp/veli-calendar-browser add -D @axe-core/playwright@4.11.1
corepack pnpm build
```

Serve `apps/storybook/storybook-static` and `apps/web/dist` on local ports, then run:

```sh
node scripts/verify-calendar.mjs /tmp/veli-calendar-browser http://127.0.0.1:6029 /tmp/calendar-evidence
node scripts/verify-calendar-datepicker.mjs /tmp/veli-calendar-browser http://127.0.0.1:6029 /tmp/calendar-evidence
node scripts/verify-calendar-docs.mjs /tmp/veli-calendar-browser http://127.0.0.1:4329/docs/calendar/ /tmp/calendar-evidence
```
