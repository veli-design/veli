---
'@tradenetcorp/veli-ui': patch
'@tradenetcorp/veli-tokens': patch
---

Add shared field underline utilities for form controls and refresh text-input design tokens with dedicated stroke and background states. Underlines use a flat `::after` bar (avoiding inset-shadow corner curl) with consistent hover, focus, pressed, disabled, and error styling. Field messages render only when description or error content is non-empty, with improved invalid-state handling for interactive and static fields.
