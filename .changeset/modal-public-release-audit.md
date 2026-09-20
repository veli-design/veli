---
'@tradenetcorp/veli-ui': patch
---

### Changed

- Lay out `Modal.Footer` actions with `justify-between` so start-edge and end-edge action groups match the Figma Modal footer. Cluster right-only actions with `ms-auto` when you do not need a start group.

### Fixed

- Honor `prefers-reduced-motion` on Modal overlay and panel enter/exit transitions.
