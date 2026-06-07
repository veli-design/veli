# @tradenetcorp/veli-ui

## 0.1.0

### Minor Changes

- fbbb10f: Correct RTL behavior for Select, Switch, and Menu so directional layout, dropdown alignment, and
  toggle motion follow the active document direction.

## 0.0.3

### Patch Changes

- c615546: Add dark mode support through the Veli provider theme contract and generated token CSS.

## 0.0.2

### Patch Changes

- cfbb44a: Align Button with Figma: refresh size padding and gaps, move label typography into the content layer, update focus ring offset, and normalize loading indicator and min-width sizing.
- a03c22e: Align Checkbox with Figma: add `size` (`md`/`lg`), description and error messaging, and refreshed control styling. Update design tokens.
- c7e5987: Add shared field underline utilities for form controls and refresh text-input design tokens with dedicated stroke and background states. Underlines use a flat `::after` bar (avoiding inset-shadow corner curl) with consistent hover, focus, pressed, disabled, and error styling. Field messages render only when description or error content is non-empty, with improved invalid-state handling for interactive and static fields.
- e349278: Align ComboBox with Figma: add `size` and `variant` props, refresh field underline styles, and update design tokens.
- 2fa97fb: Add Input component `variant` (`default`, `outline`) and `size` (`sm`, `md`, `lg`) options.
- 3b8af61: Align Link with Figma: add size variants, rename the default variant from `primary` to `default`.
- ce3515a: Align Radio with Figma: update sizes (`md`/`lg`), error and description messaging, and control styling. Refresh shared field underline styles and text-input design tokens.
- 88ebb24: Align Select with Figma: add `variant` (`default`, `outline`) and `size` (`sm`, `md`, `lg`) options, refresh trigger and listbox styling to use updated text-input tokens, and export shared field underline utilities for consistent hover, focus, pressed, disabled, and error states. Field messages render only when description or error content is present. Design tokens gain dedicated text-input stroke and background values for default, hover, pressed, and disabled states.
- a46c729: Align Switch with Figma: add default and subtle variants, update track sizing and interaction states, and refresh switch design tokens.

## 0.0.1

### Patch Changes

- a16ddef: Initial Veli Design System package releases.
