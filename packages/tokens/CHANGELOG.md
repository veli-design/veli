# @tradenetcorp/veli-tokens

## 0.3.0

### Minor Changes

- 38eee3b: Add primitive motion tokens and migrate current overlay transitions to use them.

## 0.2.1

### Patch Changes

- dded15b: Expose Figma elevation shadows as theme-aware Tailwind `shadow-xs` through `shadow-3xl` utilities and migrate overlay components off hardcoded box shadows.

## 0.2.0

### Minor Changes

- bfb44b3: Add an `Avatar` component with image, initials, icon, and agency icon variants across all Figma appearances and sizes, including initials fallback when an image fails to load. Export it from `@tradenetcorp/veli-ui/avatar` and add avatar color tokens to the design system.

### Patch Changes

- e21677c: Align `Popover` with the Figma component set: add primary, secondary, and tertiary intents, large fill-only arrow, enter/exit animations, and optional `PopoverHeader`, `PopoverContent`, and `PopoverFooter` helpers. Replace legacy popover surface styling with dedicated popover design tokens and expand Storybook coverage with a Figma variant matrix and real-world examples.

## 0.1.1

### Patch Changes

- 6e70d28: Rename `text.default.default` to `text.default.DEFAULT` and `popover.bg` to `popover.bg-solid` for Tailwind alignment, and add `modal.bg-solid` surface token.

## 0.1.0

### Minor Changes

- bf44de1: Add generated Dhivehi typography overrides for `type-*` utilities so token consumers can switch English and Dhivehi text styles through the inherited `lang` value.

## 0.0.3

### Patch Changes

- c615546: Add dark mode support through the Veli provider theme contract and generated token CSS.

## 0.0.2

### Patch Changes

- c7e5987: Add shared field underline utilities for form controls and refresh text-input design tokens with dedicated stroke and background states. Underlines use a flat `::after` bar (avoiding inset-shadow corner curl) with consistent hover, focus, pressed, disabled, and error styling. Field messages render only when description or error content is non-empty, with improved invalid-state handling for interactive and static fields.
- 88ebb24: Align Select with Figma: add `variant` (`default`, `outline`) and `size` (`sm`, `md`, `lg`) options, refresh trigger and listbox styling to use updated text-input tokens, and export shared field underline utilities for consistent hover, focus, pressed, disabled, and error states. Field messages render only when description or error content is present. Design tokens gain dedicated text-input stroke and background values for default, hover, pressed, and disabled states.

## 0.0.1

### Patch Changes

- a16ddef: Initial Veli Design System package releases.
