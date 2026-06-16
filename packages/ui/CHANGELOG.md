# @tradenetcorp/veli-ui

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
