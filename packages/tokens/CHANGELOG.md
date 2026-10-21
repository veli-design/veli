# @tradenetcorp/veli-tokens

All notable changes to `@tradenetcorp/veli-tokens` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 0.9.1

_Released 2026-10-19._

### Fixed

- Make English type utilities and font-sans share one overridable font family, so apps can bind optimized web fonts without a Tailwind theme override.

## 0.9.0

_Released 2026-10-11._

### Added

- Expose normalized DTCG and motion data, complete Light/Dark CSS variables, grid utilities and retained focus effects.

### Changed

- Unify CSS and Tailwind on canonical namespaced DTCG tokens; migrate plain CSS references to `--veli-*` and use Figma typography values.
- Align generic Tailwind font-size utilities with canonical English typography size, leading and tracking; use `type-*` for automatic Dhivehi styles.

### Fixed

- Reserve `text-base` for font size; use `text-base-default` for the default text color instead of the conflicting shorthand.
- Make all UI entry points importable during Node server rendering and reject invalid relative ESM imports before publishing. Veli no longer requires Next.js `transpilePackages` or Vitest dependency inlining to resolve its JavaScript.

## 0.8.0

_Released 2026-10-08._

### Added

- Add explicit `default`, `stacked`, and `compact` Alert layouts and semantic Alert colour tokens for Light and Dark modes.

### Changed

- Refresh the Figma variable and style export while preserving existing motion paths in the public DTCG JSON bundle and generated CSS utilities. Motion primitives are also available separately from `@tradenetcorp/veli-tokens/motion-tokens`.
- Align Alert spacing, typography, icon placement, and action treatments with the revised design. Default actions stay on one row; choose `stacked` for vertically arranged full-width actions. For `compact`, omit the description and use at most one action.

### Removed

- Replace the legacy Alert appearances: migrate `subtle` to `light` and `emphasis` to `highContrast`. Replace `outline` by choosing either new treatment; it has no direct equivalent.

### Fixed

- Mirror Alert layouts for RTL and use Dhivehi typography and localized dismissal names. Reserve space around the close control and keep high-contrast ghost actions readable on hover and press.

## 0.7.1

_Released 2026-09-05._

### Added

- Add `color.status.*-stroke` tokens for badge outline borders, including `cautious-stroke` compatibility aliases.

### Changed

- Refresh Badge status subtle fills to alpha-200 tokens and map the Brand accent intent from the deprecated `teal` name.
- Point Badge info colors at the blue primitive scale instead of brand primary.

### Deprecated

- Badge `intent="teal"` now aliases to `intent="brand"`.

### Fixed

- Align Badge outline borders with Figma stroke tokens instead of subtle fill tokens.
- Remove visible borders from Badge subtle and emphasis appearances to match the design spec.

## 0.7.0

_Released 2026-09-01._

### Added

- Add a theme-aware gov.mv accent token for light and dark Tailwind themes.
- Map `radius`, `spacing`, `blur`, `breakpoints` (as `breakpoint`), and `container` tokens into the Tailwind theme so those utilities use Veli values instead of Tailwind defaults.

### Changed

- Update Figma-aligned OKLCH values for green, sage, slate, ash, and stone color primitives.
- Emit `--radius` and `--radius-md` from `radius.DEFAULT` (6px) so bare `rounded` and `rounded-md` track the design token.
- Normalize Figma fractional spacing keys such as `0,5` to Tailwind underscore CSS names (`--spacing-0_5`) for `p-0.5` and related utilities.

## 0.6.0

_Released 2026-08-13._

### Added

- Add an `accent` Button intent (fill only) backed by new `button-accent` and `text-*-on-light` color tokens.
- Add an `ease-out-quad` motion easing token (`cubic-bezier(0.25, 0.46, 0.45, 0.94)`).
- Add a `radius.4xl` token (32px) for larger corner radii such as Modal.

### Changed

- Update Modal corner radius to `4xl` (32px) and bottom padding from 16px to 24px to match the design system.

### Fixed

- Stop forwarding open-state props to React Aria when Modal is used inside `Modal.Trigger`, which removes the build warning to place `onOpenChange` on the trigger.

## 0.5.1

_Released 2026-07-29._

### Fixed

- Publish package-specific metadata and release notes for each GitHub Packages version instead of blank or repository-wide version content.

## [0.5.0] - 2026-07-19

### Changed

- Use the teal, sage, and green Veli theme aliases by default.
- Add canonical `status-caution` and `text-base-default` utilities while preserving `status-cautious` compatibility aliases.
- Support imported token data that uses DTCG dimension objects.

## 0.4.0

### Minor Changes

- 63d0e74: Sync color tokens with the updated Figma variable hierarchy, rename the public color vocabulary to slate, ash, stone, sage, emerald, teal, and magenta, and remove resolved legacy color-name aliases from generated token output.

  Emit dark-scoped token aliases for Tailwind color utilities and align caution color utility usage in Avatar and Badge.

  Avoid the ambiguous `text-base` color shorthand for neutral Avatar initials so the 16px initials typography keeps its Figma-specified 10px font size.

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
