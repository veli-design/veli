---
'@tradenetcorp/veli-ui': minor
---

### Added

- Export the `PopoverIntent` type for typing `intent` on `Popover` and its parts.
- Add a `titleLevel` prop to `PopoverHeader` to set the heading level of its title.
- Forward native `div` attributes such as `id`, `className`, and `data-*` from `PopoverHeader`, `PopoverContent`, and `PopoverFooter`.

### Changed

- Render the `PopoverHeader` title as a heading that names the surrounding `PopoverDialog`. If your page outline relies on a specific level, set `titleLevel`. Remove any `aria-label` that only repeated the header title.
- Give every Popover intent the `shadow-lg` elevation from Figma. `primary` and `secondary` popovers previously had no shadow, and `tertiary` used `shadow-xl`.
- Scale Popovers from their trigger as they open and close, matching Tooltip. Exits now use ease-out.

### Fixed

- Make Popover entry and exit slide 8px from the resolved side; previously only the fade ran. With reduced motion, the popover fades without moving.
- Show hover, pressed, and focus ring states on the header close button that match `primary` and `secondary` surfaces.
- Overlap the arrow with the surface by 2px, as in Figma, so no seam shows between them.
- Draw an outline around the Popover surface in forced colors mode.
