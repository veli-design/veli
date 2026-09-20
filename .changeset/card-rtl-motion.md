---
'@tradenetcorp/veli-ui': patch
---

### Fixed

- Align Card footer actions to the inline end with `ms-auto` so the action row follows LTR and RTL correctly.
- Restore interactive Card hover and pressed feedback with an `ash-alpha` overlay (replacing invalid `gray-alpha` utilities) and opacity transitions that respect `prefers-reduced-motion`.
