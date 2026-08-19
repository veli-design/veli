# @tradenetcorp/veli-ui

All notable changes to `@tradenetcorp/veli-ui` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 0.10.0

_Released 2026-08-19._

### Added

- `VeliProvider` accepts a `disableTransitionOnChange` prop (default `false`) that suppresses CSS transitions for one frame while the theme changes.
- `getVeliThemeScript(storageKey?)` and `VELI_COLOR_SCHEME_STORAGE_KEY` are exported from `@tradenetcorp/veli-ui/theme-script` for apps that need the blocking script in `<head>` because `VeliProvider` is not the first body child.

### Fixed

- Align form field typography across sizes with the Coral design specifications.
- `VeliProvider` syncs the resolved color scheme (`.dark` class, `data-theme`, `color-scheme`) to `document.documentElement` so portaled components — modals, popovers, tooltips, menus — inherit dark mode tokens.
- Stored and system dark preferences no longer flash white on load. A parser-blocking inline script applies the theme before first paint, and document sync reads `localStorage` / `matchMedia` in `useLayoutEffect` instead of the SSR `light` snapshot.

## 0.9.0

_Released 2026-08-13._

### Added

- Add an `accent` Button intent (fill only) backed by new `button-accent` and `text-*-on-light` color tokens.
- Add a press ripple on fill, transparent, and ghost Buttons with intent-specific light and dark overlay colors. Buttons scale to 1.045× while pressed.
- Add a `radius.4xl` token (32px) for larger corner radii such as Modal.
- Add `sm`, `md`, and `lg` size variants to `Tabs` and `TabsOverflow`, scaling padding and label typography to match the design system.

### Changed

- Update Modal corner radius to `4xl` (32px) and bottom padding from 16px to 24px to match the design system.

### Removed

- Remove the experimental `seaglass` Button prop and related spotlight styling.

### Fixed

- Stop forwarding open-state props to React Aria when Modal is used inside `Modal.Trigger`, which removes the build warning to place `onOpenChange` on the trigger.

## 0.8.5

_Released 2026-08-05._

### Fixed

- Align Modal header and footer spacing so each section divider has 16px clearance from adjacent content.
- Restore subtle semantic borders for Card, Dropzone, Table, and Tags after the token hierarchy update.
- Use the Switch handle-on color for the selected checkmark, and scale its stroke width by size (1.5 for sm/md, 2.25 for lg).

## 0.8.4

_Released 2026-07-29._

### Fixed

- Align unselected `MenuItem` labels with checked items when `selectionMode` is enabled by reserving a fixed-width selection slot for all items.
- Publish package-specific metadata and release notes for each GitHub Packages version instead of blank or repository-wide version content.

## [0.8.3] - 2026-07-28

### Fixed

- Prevent Menu from flashing a highlight on the first item when dismissing by clicking outside.

## [0.8.2] - 2026-07-28

### Changed

- Align Calendar header controls, year picker, and Today button spacing with the design system.
- Default LTR Calendar weekday headers to short labels (`Sun`, `Mon`, …).
- Show adjacent-month dates in a muted color instead of hiding them.
- Use Phosphor carets for Calendar month navigation.
- Show Calendar validation errors with a leading warning icon and clearer padding.

### Fixed

- Make Calendar day cell hover feedback apply immediately.
- Size and right-align the Calendar year picker popover to its trigger container.

## [0.8.1] - 2026-07-23

### Fixed

- Use solid menu and calendar background tokens for Select, ComboBox, DatePicker, and Calendar picker popovers so dropdown surfaces stay opaque in dark mode.

## [0.8.0] - 2026-07-19

### Added

- Add a `Card` compound component with header, title, description, content, and footer slots, plus elevation, spacing, and interactive variants. Export it from `@tradenetcorp/veli-ui/card`.
- Add an `Alert` status banner with intent and appearance variants, title, description, actions, dismiss control, Dhivehi localization, and RTL support. Export it from `@tradenetcorp/veli-ui/alert`.
- Add a `Toast` queue and region for temporary notifications, with intent and appearance variants, actions, timeout progress, animations, Dhivehi localization, and RTL support. Export it from `@tradenetcorp/veli-ui/toast`.
- Add a `Dropzone` compound component for file uploads with drag-and-drop, file list, progress, validation, Dhivehi localization, and RTL support. Export it from `@tradenetcorp/veli-ui/dropzone`.
- Add a `Table` component with sorting, selection, row actions, column resizing, and sticky headers. Export it from `@tradenetcorp/veli-ui/table`.
- Add a `Pagination` component with compact and explicit page-list variants, first/previous/next/last controls, controlled and uncontrolled state, Dhivehi localization, and RTL support. Export it from `@tradenetcorp/veli-ui/pagination`.
- Add size variants (`xs`–`xl`) and a `leading` slot to `Tag` and `TagGroup`.

### Changed

- Align Tags styling with the Veli token scale.

### Fixed

- Fix Button content horizontal padding for text and icon-only layouts, and show a pointer cursor on interactive buttons.
- Prevent semantic text colors from overriding explicit font-size utilities when Veli component classes are merged.
- Localize Tags fallback copy for Dhivehi and improve RTL layout.

## 0.7.2

### Patch Changes

- 24ffeb8: Migrate remaining component transition durations and easing utilities to primitive motion tokens.
- 4455ac4: Migrate Tabs color and selection indicator transitions to primitive motion utilities.

## 0.7.1

### Patch Changes

- eddd8ac: Migrate Checkbox color and indicator transitions to primitive motion utilities, and tune checked press-state feedback.

## 0.7.0

### Minor Changes

- 63d0e74: Sync color tokens with the updated Figma variable hierarchy, rename the public color vocabulary to slate, ash, stone, sage, emerald, teal, and magenta, and remove resolved legacy color-name aliases from generated token output.

  Emit dark-scoped token aliases for Tailwind color utilities and align caution color utility usage in Avatar and Badge.

  Avoid the ambiguous `text-base` color shorthand for neutral Avatar initials so the 16px initials typography keeps its Figma-specified 10px font size.

### Patch Changes

- fc3f421: Show only one initial letter in Avatar at sizes 16 and 20, including for multi-word names and Dhivehi initials.
- 7e83207: Migrate Button seaglass transition timing and easing to primitive motion token utilities.

## 0.6.1

### Patch Changes

- 6bfc020: Improve Dhivehi and RTL rendering across UI components:
  - Add Dhivehi font fallback scoping and shared WebKit baseline handling for mixed-script text.
  - Remove component-specific hardcoded alignment offsets that are now handled centrally.
  - Keep Checkbox labels, descriptions, and error messages aligned in RTL/Dhivehi layouts.
  - Align Dhivehi Avatar initials visually within the avatar circle.
  - Start Calendar and RangeCalendar weeks on Sunday for both English and Dhivehi locales.

## 0.6.0

### Minor Changes

- 38eee3b: Add primitive motion tokens and migrate current overlay transitions to use them.

## 0.5.2

### Patch Changes

- dded15b: Expose Figma elevation shadows as theme-aware Tailwind `shadow-xs` through `shadow-3xl` utilities and migrate overlay components off hardcoded box shadows.
- fbfe3d2: Refactor shared provider, field, date, and PasswordInput internals while preserving public import paths, and tighten component edge cases for Modal validation, Button loading state, Tabs indicator measurement, TextArea resize cleanup, Accordion loading semantics, and Avatar labeling.

## 0.5.1

### Patch Changes

- 9ed2dc9: Keep keyboard shortcut typography stable in Dhivehi RTL by opting key caps and menu shortcuts out of Dhivehi text-token font swaps.
- ddb2252: Adjusted PasswordInput to render the password field as LTR while keeping RTL layout for surrounding content.
  Localized PasswordInput requirement labels and password match/different status text in Dhivehi stories.
  Preserved the existing ASCII-based validation logic so existing password policy behavior remains unchanged.
- 55c5ec2: Mapped Avatar fallback initials, including common Thaana digraphs, to Dhivehi letters when Veli is in Dhivehi/RTL mode.
- 94e15b1: Render email, URL, telephone, and password Input values left-to-right with English typography metrics in RTL layouts while preserving right-aligned Dhivehi placeholders.
- 01825a0: Improve Popover Dhivehi RTL support by localizing the close button label and using logical footer spacing.

## 0.5.0

### Minor Changes

- bfb44b3: Add an `Avatar` component with image, initials, icon, and agency icon variants across all Figma appearances and sizes, including initials fallback when an image fails to load. Export it from `@tradenetcorp/veli-ui/avatar` and add avatar color tokens to the design system.

### Patch Changes

- 96b1473: Improve Badge RTL and Dhivehi rendering with stable label, icon, and counter alignment.
- 455a88c: Improve Modal Dhivehi RTL support by applying provider language and direction to the portalled dialog and aligning footer actions to the logical end.
- 32c2484: Polish TextArea RTL support with Dhivehi textarea alignment, counter alignment, and a direction-aware resize grip.
- e21677c: Align `Popover` with the Figma component set: add primary, secondary, and tertiary intents, large fill-only arrow, enter/exit animations, and optional `PopoverHeader`, `PopoverContent`, and `PopoverFooter` helpers. Replace legacy popover surface styling with dedicated popover design tokens and expand Storybook coverage with a Figma variant matrix and real-world examples.
- 9583cd3: Fix Search clear control alignment and clearing behavior in RTL layouts.

## 0.4.0

### Minor Changes

- 7b2d663: Add Badge component exported from `@tradenetcorp/veli-ui/badge` with status label and counter modes aligned to the Veli Figma spec.

  Badge supports `appearance` (`outline`, `subtle`, `emphasis`), `intent` (status and accent tokens), and `size` (`xs` status dot, `sm`, `md`). Status mode renders an optional `leadingIcon` with a truncated label. Counter mode (`counter` or `count`) uses a pill shape with centered tabular numbers and optional `max` formatting (default `99+`).

- 960af6a: Add `Kbd` and `KbdGroup` components for keyboard shortcut display, aligned with the Veli Design System Shortcuts spec. Export from `@tradenetcorp/veli-ui/kbd` with `default` and `inverted` variants, fixed-height key caps for icons and text, and Storybook documentation.
- 43e8b1b: Add a `Search` component with default and pill outline appearances, size variants, skeleton loading, and localized placeholder text. Export it from `@tradenetcorp/veli-ui/search`.
- 3ff678e: Add a `TextArea` component with default and outline variants, size variants, character counter with progress ring, custom vertical resize handle, skeleton loading, and localized labels. Export it from `@tradenetcorp/veli-ui/textarea`.
- 002467a: Add a `PasswordInput` component with visibility toggle, password requirement validation, match feedback, success styling, and animated requirement indicators. Export it from `@tradenetcorp/veli-ui/password-input`.

### Patch Changes

- 7adef9b: Improve DatePicker RTL support by forwarding language direction to the popover and aligning trigger typography for Dhivehi field text.
- c49c434: Refactor Modal into a compound component API and align styles with the Veli Figma spec.

  Modal now composes through `Modal.Trigger`, `Modal.Header`, `Modal.Title`, `Modal.Description`, `Modal.CloseButton`, `Modal.Content`, and `Modal.Footer` instead of `title`, `description`, `footer`, `showCloseButton`, `closeButtonLabel`, and `contentClassName` props. Size tokens now match design widths (`xs` 440px, `sm` 440px, `md` 576px, `lg` 776px, `xl` 1024px, `full` 1200px), use `Shadow/sm` and `modal/bg-solid` tokens, and update header/footer spacing with section dividers. The close button is opt-in via `Modal.CloseButton`.

- 7baece9: Normalize Accordion responsive skeleton behavior, size-aware skeleton bars, and item array typing.
- 1a3d2db: Localize Calendar and DatePicker month, weekday, and Today labels for Dhivehi RTL contexts, and default Calendar weekday headers to narrow in LTR and long in RTL.
- b0f1bc3: Polish Checkbox Dhivehi RTL label alignment and localize Storybook label, description, and validation text.
- 1c54dc3: Polish PageTab Dhivehi rendering with tokenized typography and localized Storybook controls.
- 4b432a0: Polish Tabs RTL and Dhivehi rendering with direction-aware overflow menus, localized Storybook examples, and corrected overflow indicator measurement.
- ecc8dfb: Align Radio pressed states with semantic radio tokens and polish Dhivehi label alignment.

## 0.3.0

### Minor Changes

- 2aa802b: Rename public component styling axes to align with the design-system model.

  Button now uses `intent` for `primary`, `secondary`, and `danger`, `appearance` for `fill`, `transparent`, and `ghost`, and `seaglass` as a boolean prop. Input, Select, ComboBox, DatePicker, Switch, and Divider now use `appearance` instead of `variant`. Link and MenuItem now use `intent` instead of `variant` and `sentiment`, respectively.

### Patch Changes

- a249b3f: Polish Breadcrumb RTL and Dhivehi rendering with tokenized typography, directional back controls, and localized Storybook examples.
- e6540ab: Apply token-backed Dhivehi typography to Menu items, descriptions, shortcuts, and section headers in RTL contexts.
- f58d542: Preserve language and direction on Tooltip overlays so portalled Dhivehi tooltips use the correct RTL behavior and Dhivehi typography tokens.

## 0.2.0

### Minor Changes

- 6bef072: Add `infoTooltip`, `infoTooltipAriaLabel`, and the `skeleton` Input variant, refine Dhivehi (`:lang(dv)`) input typography so field content remains inside the box across sizes, and align Input color tokens and validation/readonly states with the design system.
- ad3757e: Replace `SegmentedTabs` with underlined `Tabs` navigation: bottom border, animated selection indicator, optional `leading`/`trailing` slots, and `overflowItems` with a "More" dropdown (`TabsOverflow`). Move the previous pill/segmented pattern to `@tradenetcorp/veli-ui/page-tab` as `PageTab`.

  **Breaking:** `SegmentedTabs`, `SegmentedTabsItem`, and `SegmentedTabsProps` are removed from `@tradenetcorp/veli-ui/tabs`. Use `Tabs`/`TabsItem`/`TabsProps` for underlined tabs, or `PageTab` from `@tradenetcorp/veli-ui/page-tab` to keep the segmented style. `isCentered` is removed from `Tabs` (still available on `PageTab`).

### Patch Changes

- 8cd3dc9: Add Accordion component built on React Aria `DisclosureGroup`, exported from `@tradenetcorp/veli-ui/accordion`. Support compound composition (`AccordionItem`, `AccordionHeader`, `AccordionPanel`) and a data-driven `items` prop, with `size` (`md`, `lg`), `alignment` (`left`, `right`), and `flushed` variants, skeleton loading via `isSkeleton`, and dedicated accordion design tokens for hover, pressed, and focus states.
- b0e47af: Align Breadcrumbs with Figma: refresh item, link, current-page, and overflow styling with dedicated breadcrumb design tokens and updated spacing. Add `BreadcrumbBackLink` and `Breadcrumbs` back-link props (`showBackLink`, `backLinkLabel`, `backLinkHref`, and related link attributes) for the caret back treatment with a trailing divider, replacing manual accent-tone first crumbs.
- 753bf50: Align Calendar and DatePicker with Figma: refresh calendar styling with dedicated calendar design tokens, add month/year header controls with a year picker dropdown, optional Today button (`showTodayButton`, `todayButtonLabel`), today-dot indicator, and a new `RangeCalendar` export with range-selection styling. Rework DatePicker to use a field trigger button that displays a formatted value (`placeholder`, `variant`, `size`, `granularity`, `hourCycle`) instead of inline date segments; remove `calendarButtonLabel`. Add shared field trigger/header utilities and `formatDatePickerValue` for consistent date display.
- 0a47ba3: Align Menu with Figma: refresh popover, item, section, and separator styling with dedicated menu design tokens. Rename `MenuItem` `tone` to `sentiment`, remove the `MenuPopover` `size` prop in favor of content-driven width, add selection check indicators via React Aria `selectionMode`/`selectedKeys`, expose `closeOnSelect` on `MenuItem`, and add `size` variants to section titles. Update item layout for icons, descriptions, and keyboard shortcuts using the React Aria `Keyboard` component.
- 1223e0c: Align Button icon sizing and spacing with Figma, remove reserved border width, and fix primary/danger fill plus primary ghost text colors for dark mode consistency.
- 8ec8946: Polish ComboBox RTL and Dhivehi support with localized tooltip header props, Dhivehi field metrics, corrected validation states, portalled dropdown direction, and visible selected-option indicators.
- 11a26ea: Add Select info tooltip support and improve Dhivehi RTL behavior so trigger, dropdown, option, section, helper, and error text use the active language typography and corrected vertical field metrics in Storybook and popovers.
- 56b8b9e: Align Tooltip with Figma: add `size` (`sm`/`lg`) and `tone` (`primary`/`secondary`) variants, style surfaces with dedicated tooltip tokens, and show placement-aware caret arrows on large tooltips only. Small tooltips drop the arrow and use a tighter anchor offset.

## 0.1.1

### Patch Changes

- c7b1e4a: Add Divider `variant` (`subtle`, `muted`, `strong`, `emphasis`) and `text` props for centered labels between React Aria separators, using border color tokens for reliable variant styling.
- c388cb9: Remove the unsupported `inverted` Link variant and fix disabled Link styling so disabled text and icons use the correct disabled color tokens.

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
