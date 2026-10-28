# PD-1164 selected-date contrast

Basim's [22 October approval](https://linear.app/onegov/issue/PD-1164/calendar-review-active-selected-date-contrast-in-dark-figma-variants#comment-0fec91dc) changes the text and Today dot in the three selected-day variants and selected-invalid variant to `color/white` (`#ffffff`). Figma was inspected read-only, including his attached reference image, live design context/screenshots, and variable bindings.

## Design evidence

- [English dark review](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=5269-2706): single `5269:2711`, range `5269:2914`, invalid `5269:3567`.
- [English light single](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=5269-1074).
- [Dhivehi dark single](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=5269-7106), [range](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=5269-6903), and [invalid](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=5269-6245).
- Source day variants: selected single `1210:5560`, range start `1210:5558`, range end `1210:5562`, selected invalid `5264:2630`. Text and Today dots all bind to `VariableID:117:10597`, white. Live dark variables retain `components/calendar/day-selected` = `#146f77` and invalid fill `#c80f0c`.

## Implementation

Calendar's shared selected-cell foreground uses white, including invalid selections. Selected Today dots use white. Range endpoints share those bindings; interior range dates and unselected Today dots retain their existing tokens. No token definitions, layout, interaction code, or workflows changed. The existing patch changeset and Calendar agent sidecar describe the corrected behavior.

Existing browser checks now expect the approved white dots and reject active selected-date contrast failures. Their broad audit suites were intentionally not run locally for this follow-up.

## Scoped validation

The dedicated `scripts/verify-calendar-selected-contrast.mjs` runs 48 scoped cases and checks current-month enabled selections only, in Chromium/WebKit × English/Dhivehi × light/dark, using existing Calendar stories. It measures selected single dates, one-day ranges, range starts/ends, invalid selections and selected Today dots. It verifies white computed sRGB, AA text contrast, 44 × 44 px selected fills, and 4 × 4 px Today dots at y = 34; screenshots record visual alignment. A focused directional keyboard selection guards the existing Dhivehi WebKit behavior.

All 48 cases passed. The lowest measured text contrast is **5.33:1**; dark teal selections measure **5.88:1** (previously 3.28:1), and dark invalid single selections measure **5.95:1**. Screenshot review confirms white text/dots and unchanged endpoint rounding.

[Computed measurements](PD-1164-evidence/measurements.json) and representative captures:

- [English dark selected Today](PD-1164-evidence/chromium-en-dark-selected-today.png)
- [Dhivehi dark range start](PD-1164-evidence/webkit-dv-dark-range-start-today.png)
- [English light invalid selected Today](PD-1164-evidence/chromium-en-light-invalid-selected.png)

Local checks also include the UI TypeScript build, 11 focused Calendar rendering tests, changed-file ESLint/Prettier, changeset validation, sidecar drift, and `git diff --check`. Token generation supplies the local preview; no token definitions changed.

Full suites, full accessibility audits, production builds, physical-device checks, and manual screen-reader sessions were intentionally excluded from this color-only follow-up. PD-1165 and PD-1166 remain separate. Automatic PR CI after push is reported separately; no broad CI run was manually triggered. The PR integration moves PD-1164 to Review; it remains open until PR #285 merges.
