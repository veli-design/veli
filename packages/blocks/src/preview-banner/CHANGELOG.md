## 0.7.1

### Fixed

- Refresh the exact tested dependency baseline to Veli React 0.20.1 and tokens 0.11.1 for the repository-transfer metadata release. Copied source and supported dependency ranges are unchanged; previous block archives retain their existing baselines.

## 0.7.0

### Changed

- Require Veli React ^0.20.0 and record the exact 0.20.0 candidate baseline. The copied-source rendering API and token baseline are unchanged; previous block archives retain their existing requirements.

## 0.6.0

### Changed

- Require Veli React ^0.19.0 and record the exact 0.19.0 candidate baseline. The copied-source rendering API and token baseline are unchanged; previous block archives retain their existing requirements.

## 0.5.0

### Changed

- Support the verified public package baseline: @veli-design/react@^0.18.0, react-aria-components@^1.22.0, @veli-design/tokens@^0.11.0. The copied-source rendering API is unchanged.

## 0.4.1

### Fixed

- Keep the exit action from shrinking through its layout wrapper, preserving Button's component-owned sizing contract.

## 0.4.0

### Changed

- Use the public @veli-design React and tokens package names. Migrate application and copied source imports together.

## 0.3.1

### Fixed

- Keep the exit action from shrinking through its layout wrapper, preserving Button's component-owned sizing contract.

## 0.3.0

### Changed

- Adopt Veli UI 0.17.x and tokens 0.10.x as the supported core package baseline. Upgrade the applicable core packages together before adding or updating this copied block; earlier block versions retain their previous dependency contracts.
- Record the tested core candidate versions for the bilingual typography and subtle-button color update. Block APIs and authored source are unchanged.

## 0.2.0

### Changed

- Require Veli UI 0.16.0 or later in the 0.16 line and tokens 0.9.1 or later in the 0.9 line for installation alongside the complete block catalog. Upgrade the applicable packages before adding or updating this block. Validated against release candidates; repeat a clean registry install after publication.

## 0.1.3

### Fixed

- Use `text-base-muted` for the preview message so body copy meets WCAG 2 AA contrast on the raised surface (Figma’s subtle token is too light at Body/lg).

## 0.1.2

### Changed

- Match the updated mobile Draft preview layout from Figma: ping with title and status on the first row, message beside a hug-width secondary exit on the second, `p-3.5` / `gap-2` / `rounded-4xl` below `lg`.
- Use the secondary transparent exit action on desktop as well as mobile.
- Use a bold SignOut icon and align banner type/color tokens with Figma (title strong, message subtle).
- Use Badge `md` for the status label so height and Body/sm type match Figma.

### Fixed

- Keep the status ping in a fixed 24px wrapper so layout cannot expand the ping fill, and keep it outside truncating overflow so the ripple is not cut off.

## 0.1.1

### Fixed

- Constrain the stacked mobile metadata row to the card width so the message truncates inside the pill instead of overflowing the viewport.

## 0.1.0

### Added

- Experimental floating fixed bottom preview banner for host-owned draft and published preview states, with a measured scroll spacer so page content is not covered. Renders nothing when no notices are supplied. Stacks on small screens and becomes a single pill from the `lg` breakpoint, with an outline status badge and a SignOut exit action.
