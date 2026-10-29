---
'@tradenetcorp/veli-ui': patch
---

### Fixed

- Size `Modal.CloseButton` at `sm` (36px) by default so it matches the Figma Modal close control.
- Keep `Modal.CloseButton` on the logical end of the header row when `Modal.Title` is omitted.
- Draw the Modal header divider only when `Modal.Description` has renderable content, so an empty description no longer leaves a lone rule under the title.
