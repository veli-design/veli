## 0.2.1

### Fixed

- Keep the exit action from shrinking through its layout wrapper, preserving Button's component-owned sizing contract.

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
