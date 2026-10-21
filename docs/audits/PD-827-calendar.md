# PD-827 Calendar audit

Audit date: 22 October 2026. Covers Calendar and RangeCalendar; DatePicker is checked as a consumer of the shared calendar.

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

## Accessibility finding retained for Figma alignment

[PD-1164: review active selected-date contrast in dark Figma variants](https://linear.app/onegov/issue/PD-1164/calendar-review-active-selected-date-contrast-in-dark-figma-variants) tracks the enabled, selected-date foreground at **3.28:1** (`#0e0e0d` on `#146f77`), below the 4.5:1 AA threshold for 14 px regular text. This affects active current-month selections and range endpoints in dark mode, in both languages and browser engines.

The implementation deliberately matches Figma, as requested. The browser audit records this known design finding and fails unexpected accessibility violations. Disabled controls and previous/next-month dates are excluded from contrast findings. The disabled month label is an inactive-control contrast exemption. This audit does not claim full WCAG conformance; final accessibility/design sign-off remains open on PD-1164.

[PD-1165](https://linear.app/onegov/issue/PD-1165/calendar-improve-dhivehi-accessible-date-descriptions-in-webkit) tracks WebKit's incomplete Dhivehi accessible month descriptions (`2026 M10`). Visible Dhivehi labels match Figma; the remaining finding concerns hidden date descriptions and announcements.

## Validation

- UI suite: 191 tests and recipe type checks passed; public package entry checks passed (39 exports).
- Changeset tooling: 32 passed on Node 24; agent-eval scorer: 28; tokens: 21; blocks: 54; CLI: 35. Website preview/Markdown tests: 28.
- Production monorepo build, lint, formatting, changeset validation, sidecar-drift check, and whitespace validation passed before handoff.
- Browser evidence is **desktop/mobile emulation**, not physical-device testing. The matrix uses 320, 360, 375, 390, 414, 768, 1280, and 844 px widths, including 390 × 844 portrait and 844 × 390 landscape; English/Dhivehi × light/dark × Chromium/WebKit gives 64 viewport cases, each containing both selection modes.
- Interaction checks cover touch selection, range endpoints, direction-aware keyboard selection, month/year navigation, scrollable year menus, Escape/focus return, DatePicker placement at both edges, outside-tap dismissal, Today, disabled/read-only behavior, validation associations, six-week months, system-theme switching, and reduced motion. No browser console errors or uncaught exceptions were observed in the completed component matrix.
- The production-docs regression checks cover mobile widths, hydration, library heading typography, intrinsic calendar width, State/Language controls, and synchronized displayed source. All 14 production-docs viewport cases passed in Chromium/WebKit, with no hydration errors; State and Language controls update their displayed source. The PR workflow reruns both suites and uploads complete evidence.
- Additional Storybook-wide `tsc --noEmit` reports existing errors in other stories/configuration (including Alert, Divider, Popover, and the token playground declaration); no Calendar errors were reported. The standard Storybook production build succeeds.
- The first changeset-tooling attempt on Homebrew Node 26 failed to locate npm beside that Node installation; the same suite passed on the repository's Node 24 runtime.
- Physical devices, manual screen-reader sessions, and release publication were not run. Installed-package Next and isolated-site checks are left to the existing PR CI jobs.

## Evidence

The compact [validation data](PD-827-calendar-evidence.json) records viewport measurements and known design contrast findings. Representative captures:

| Case                  | Screenshot                                           |
| :-------------------- | :--------------------------------------------------- |
| English/light, mobile | [390 px](assets/pd-827/chromium-en-light-390.png)    |
| English/dark, mobile  | [390 px](assets/pd-827/chromium-en-dark-390.png)     |
| Dhivehi/light, mobile | [390 px](assets/pd-827/chromium-dv-light-390.png)    |
| Dhivehi/dark, mobile  | [390 px](assets/pd-827/chromium-dv-dark-390.png)     |
| WebKit narrow layout  | [320 px](assets/pd-827/webkit-en-light-320.png)      |
| WebKit Dhivehi/dark   | [320 px](assets/pd-827/webkit-dv-dark-320.png)       |
| Landscape             | [844 × 390](assets/pd-827/chromium-en-light-844.png) |
| Desktop baseline      | [1280 px](assets/pd-827/chromium-en-light-1280.png)  |
| Production docs       | [320 px](assets/pd-827/docs-chromium-320.png)        |

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
node scripts/verify-calendar-docs.mjs /tmp/veli-calendar-browser http://127.0.0.1:4329/docs/calendar/ /tmp/calendar-evidence
```
