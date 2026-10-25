# Kbd public-release audit (PD-836)

[PD-836](https://linear.app/onegov/issue/PD-836/audit-kbd-for-public-release) covers Kbd and its Menu/Tooltip consumers. This change fixes key geometry and group semantics, adds integration coverage, and updates Storybook and the web docs. The inverted treatment remains a release decision, described below.

## Design sources

- [Atomic Kbd specification](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=5235-6): 20px height, minimum 20px width, 4px radius, 2px vertical / 4px horizontal padding, 12px Inter Regular with 16px line height and 0.18px tracking. KbdGroup has a 2px gap. Linear discussion on October 12 agreed to standalone keys added as needed rather than a preset six-slot asset.
- [Legacy Menu Kbd](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=1085-3621): retained in Figma for designer review. Its inverted background alias differs from the atomic specification.
- [Figma Changelog](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=577-22841): inspection found no explicit Kbd entry among 345 text nodes. The October 14 shared Caption change specifies 134% → 16px line height and 1.5% → 0.18px tracking.
- [Menu October 14 entry](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=5523-319868): Shortcuts → shortcut rename explicitly requires no code change; DV shortcuts/end icons sit on the left.
- [Tooltip October 17 entry](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=5819-470964): showShortcut rename requires no code change; small DV shortcuts sit on the left, and the large design has no shortcut.

These findings do not establish a requirement to apply Dhivehi fonts or 24px heights to Latin shortcut glyphs. Kbd remains a noninteractive visual hint, without a global keyboard handler.

## Changes

- Remove `leading-none`, which produced a measured 12px line height; use the existing 16px leading token and 2px vertical padding. Prevent key-label wrapping and group shrinking.
- Give KbdGroup a nameable `group` role. Preserve direct-child variant propagation, explicit key overrides, native attributes, and inherited group direction. Latin combinations use explicit `dir="ltr"`; Kbd defaults to `lang="en"`.
- Add Kbd behavior/type tests and Menu shortcut regression coverage for sm/md/lg in EN and DV.
- Add Kbd composition/layout stories and a discoverable **Kbd → In Menu** story with automatic string/array shortcuts, explicit icon-key composition and disabled styling. Menu's regression story checks navigation, disabled skipping, selection, submenu entry/return, Escape, action dismissal and focus restoration.
- Move Kbd demos from the shared legacy examples file into `KbdExamples.tsx`, using current `DocsPreview`/`DocsPreviewOption` controls and synchronized code. Order the API reference as Veli props, React Aria forwarded props (none), then native element props.
- Correct sidecar theme/direction guidance. Include a patch UI changeset; no import migration is required.

## Verification and evidence

The original audit ran from main `3e899245`. The PR branch was then fast-forwarded to current main `cba5aa7a` (including the bilingual typography update) before final checks. No unrelated worktree or shader edits are included.

- Final `corepack pnpm check` passed on current main: changeset/tooling, agent eval, token/UI/block/CLI tests, repository-wide formatting/lint, and all six builds. A temporary Mac process-start stall cleared and the original run completed. Local test-server access was needed for release-site tests.
- Full UI suite: 186 tests passed, including Kbd behavior, Menu regressions, public exports and recipe/type compilation. Published package checks verified 69 ESM files and 39 entry points.
- Scoped ESLint, formatting, sidecar drift, changeset validation, and focused Kbd/Menu/Tooltip Storybook typechecks passed. The broader standalone Storybook typecheck has existing errors in untouched configuration, stories and notification-tray content; it is not claimed as passing.
- Storybook and website production builds passed. Website artifact validation covered 59 pages and 57 Markdown pages plus llms.txt. Preview/code synchronization tests passed.
- Browser matrix: 12 contexts × 4 stories = 48 runs, with zero component console errors and correct resolved themes. EN/LTR and DV/RTL, 1280px desktop and 390px mobile, light/dark and system with both OS preferences were covered. Desktop used normal motion; mobile used reduced motion.
- Menu checks covered all sizes, 2px key gaps, fixed 20px keys, Latin font/order, shortcut/end-icon placement, vertical alignment, disabled treatment, navigation, selection, submenu actions, Escape/outside dismissal and focus restoration. Menu portal accessibility checks and live system-theme switching passed.
- Actual fonts loaded: Inter for keys; MV Faseyha and MV A Waheed for Dhivehi consumer text. Tooltip opening scale can transiently produce a 19px bounding box; its CSS key height is 20px.
- Follow-up checks verified the new In Menu story in four language/theme/viewport combinations and both docs controls updating their preview and code. The built docs API heading order was also checked.

Selected evidence is committed under [audits/kbd](audits/kbd/):

- [Baseline keys](audits/kbd/kbd-before.png) and [corrected keys](audits/kbd/kbd-1280-en-light-light.png).
- [Menu large, DV/dark](audits/kbd/menu-lg-1280-dv-dark-dark.png) and [Kbd → In Menu](audits/kbd/kbd-in-menu-dv-dark-1280.png).
- [Current docs usage preview](audits/kbd/docs-kbd-new-usage-mobile.png) and [variant preview](audits/kbd/docs-kbd-new-variant-preview.png).
- [Matrix summary](audits/kbd/summary.json), [contrast measurements](audits/kbd/contrast-details.json), [docs checks](audits/kbd/followup-docs.json), and [In Menu checks](audits/kbd/followup-story.json).

The complete scratch captures and logs remain local outside the repository.

## Unresolved inverted treatment

Atomic Kbd uses `components/button/secondary/subtle/default`; legacy Menu Kbd uses `semantics/bg/secondary/subtle/DEFAULT`. Their light composite colours agree on the reference surface but their dark aliases differ. Existing runtime colour behavior is preserved; choosing one alias for both assets requires a designer decision.

The inactive foreground over the current atomic background fails normal-text contrast:

| Theme | Foreground | Background | Contrast | Required for normal 12px text |
| :---- | :--------- | :--------- | :------- | :---------------------------- |
| Light | #9a9d96    | #eceee9    | 2.35:1   | 4.5:1                         |
| Dark  | #555753    | #1c1d1b    | 2.31:1   | 4.5:1                         |

This is an existing design/accessibility caveat, not a solved check. Decide whether inverted represents disabled/decorative content or needs different foreground/background tokens for informative shortcuts, then verify the resulting contrast before closing the public-release audit. This PR does not change Figma, colour tokens, or issue status.
