# @tradenetcorp/veli-ui

All notable changes to `@tradenetcorp/veli-ui` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 0.14.0

_Released 2026-10-08._

### Added

- Add explicit `default`, `stacked`, and `compact` Alert layouts and semantic Alert colour tokens for Light and Dark modes.
- Add `@tradenetcorp/veli-ui/field` with composable `Field`, `FieldSet`, `FieldLegend`, `FieldGroup`, `FieldContent`, `FieldLabel`, `FieldTitle`, `FieldDescription`, `FieldError`, `FieldSeparator`, `FieldControl`, and `useFieldControlProps` for labeling and validating native or custom controls that do not ship with built-in label and error slots.
- Add a `multiple` prop to `DropzoneField` (Figma `mode`). Single-file fields lay the area out as one row and replace it with the chosen file; multiple-file fields stack the area above a file list.
- Add `infoTooltip`, `infoTooltipAriaLabel`, `isOptional`, `isRequired`, `showRequiredIndicator`, and `isInvalid` to `DropzoneField` for the Figma field header and validation states.
- Add `title`, `hint`, and `secondaryText` to `DropzoneField` and `DropzoneArea` for customizing the drop area copy, and `isInvalid` to `DropzoneArea`.
- Add `value`, `defaultValue`, `onValueChange`, `onAccept`, `onFileAccept`, `onFileReject`, `onFileValidate`, `onUpload`, `maxFiles`, `maxSize`, and `name` pass-through props to `DropzoneField`.
- Submit the selected files with native forms when `Dropzone` or `DropzoneField` has a `name`, including files that were dropped.
- Export the `DropzoneState`, `DropzoneFileState`, and `DropzoneFileStatus` types for `useDropzone` selectors.
- Move focus to the file's remove button when a single-file dropzone receives a file, and back to Browse files when the file is removed.
- Add `@tradenetcorp/veli-ui/form` with a `Form` wrapper that defaults `validationBehavior` to `aria`, `toErrorMessage` / `getErrorMessages` for React Hook Form and Standard Schema issues (Zod, Valibot, ArkType), and `isoDateToDateValue` / `dateValueToIsoDate` so forms can store dates as ISO strings without importing `@internationalized/date`.
- Add `CheckboxGroup` for managing several checkboxes as one `string[]` value.
- Add `description` and `errorMessage` to `RadioGroup`.
- Add `triggerRef` on `Select` and `DatePicker` so form libraries can focus the trigger on validation errors.
- Infer `Select` and `ComboBox` `value` / `onChange` key types from the value you pass, so `string | null` form fields wire without conversion.
- Add an optional CaretCircleDown icon and callback-driven expandable mode to Divider.
- Add typed Link refs and `aria-current` support for current-page navigation.

### Changed

- Refresh the Figma variable and style export while preserving existing motion paths in the public DTCG JSON bundle and generated CSS utilities. Motion primitives are also available separately from `@tradenetcorp/veli-tokens/motion-tokens`.
- Align Alert spacing, typography, icon placement, and action treatments with the revised design. Default actions stay on one row; choose `stacked` for vertically arranged full-width actions. For `compact`, omit the description and use at most one action.
- Restyle Dropzone to match the current Veli Figma component: a single dashed drop area with 2px hover, drop-target, and invalid borders; file items with a linear progress bar along the bottom; and uploaded and error statuses in the item metadata.
- Rename `DropzoneField` `size` to `labelSize`. It sets the label type scale only (`md` for Body/md, `sm` for Body/sm). The drop area is the same at both sizes.
- Replace the `DropzoneField` `allowsBrowse` prop with `showTrigger`.
- `DropzoneTrigger` and `DropzoneItemDelete` now render Veli `Button`s. The remove button shows a danger Trash icon once a file is uploaded.
- A single-file dropzone now rejects a batch of more than one file with the localized “Only one file allowed” message instead of adding every file.
- Use a consistent black backdrop at 60% opacity with 6px blur for Modal in both light and dark themes.
- Link now inherits all surrounding typography when `size` is omitted, including weight. For standalone links, pass `size="sm"`, `"md"`, or `"lg"` to apply the matching medium body typography preset for English or Dhivehi. Icons remain 16px without a size or with `sm`/`md`, and 20px with `lg`.
- **Migration:** Previously, Link always applied medium weight and `size` only changed icons. Remove `size` from inline links that should follow their surrounding text; add an explicit size to standalone links that should retain medium typography. Review existing sizes: English `sm`/`md`/`lg` now set 14px/16px/18px text. For example, change `size="sm"` to `size="md"` to keep an existing 16px standalone label and 16px icons. To retain custom typography or weight, omit `size` and style the surrounding element. Text-only links can now wrap across lines, so review constrained navigation and table layouts.
- Align Breadcrumbs typography and motion with the design specification, including reduced-motion support and Dhivehi-specific type weight.

### Removed

- Replace the legacy Alert appearances: migrate `subtle` to `light` and `emphasis` to `highContrast`. Replace `outline` by choosing either new treatment; it has no direct equivalent.
- Remove the `lg` value from `DropzoneField` `size`. Use `labelSize="md"`.
- Remove `DropzoneField` `onSelect`. Use `onValueChange` or `onAccept`.
- Remove the `variant` (`circular` and `fill`) and `size` props from `DropzoneItemProgress`. Progress is always the linear bar along the bottom of the item.
- Remove the `size` prop from `DropzoneItemMetadata` and the `orientation` prop from `DropzoneList`. Lists are always vertical.
- Remove the `Dropzone` `required` prop, which had no effect.
- Remove `isDisabled` from `DropzoneArea`. Disable the whole dropzone with `disabled` on `Dropzone` or `isDisabled` on `DropzoneField`.
- Remove Divider's `elementType`, `isDecorative`, `render`, and `slot` props. Use the documented separator and callback-driven button APIs instead.
- Remove the unused `Breadcrumb` `tone` prop. Remove the prop from existing trails; use `BreadcrumbBackLink` or `showBackLink` for the dedicated back-link treatment.

### Fixed

- Mirror Alert layouts for RTL and use Dhivehi typography and localized dismissal names. Reserve space around the close control and keep high-contrast ghost actions readable on hover and press.
- Keep Checkbox and Radio visually-hidden inputs positioned against their own control so focus and clicks no longer jump the page inside nested scroll containers such as the docs site.
- Fix Dropzone text, background, and border colors that referenced undefined theme tokens and rendered unstyled.
- Fix `onValueChange` firing twice for each change in controlled mode.
- Fix upload progress updates being dropped or moving backwards after a file finished uploading.
- Fix overlapping invalid-state timers leaving the drop area stuck in its invalid style.
- Match file extensions in `accept` case-insensitively, so `.pdf` accepts `REPORT.PDF`.
- Fix nested interactive controls inside the drop area and a focusable element hidden with `aria-hidden`.
- Keep right-to-left layouts aligned when file names or error messages are in a left-to-right script.
- Respect reduced-motion preferences for drop area and progress transitions.
- Apply `Dropzone`'s `name` and `required` props to the underlying file input so native form submission and required validation work.
- Align Divider caption typography, spacing, and semantic border colors with the design specification.
- Fix Switch checkmark geometry and disabled visibility, match instant hover and spring press motion, respect reduced motion and forced colors, and provide a 24-pixel hit height with wrapping labels.
- Include the existing root-label ref in Switch's public TypeScript props.
- Keep Switch's hidden input within its label so focusing or toggling it does not jump a scrolling page.
- Keep keyboard focus visible even when a visual override is false, show a system-color focus outline in forced-colors mode, and disable color transitions under reduced motion.
- Mark disabled breadcrumb text as unavailable to assistive technologies while keeping it out of the tab order.

## 0.13.0

_Released 2026-09-28._

### Added

- Add Pagination loadmore with item counts, progress, and Veli Button’s loading indicator.

### Changed

- Keep loading buttons focusable and expose `aria-busy`, `aria-disabled`, and `data-pending`. `isPending` now uses the same spinner as `isLoading`. Update loading-specific `:disabled` selectors to `[data-pending]`; use `isDisabled` when the action should leave the tab order.
- Align Button padding, icon spacing, and spinner dimensions with the design system. Text buttons grow with translated or wrapped labels; review tightly sized action groups. `size={null}` now resolves to `md`, and accent buttons always use the fill appearance.
- Make DatePicker an editable segmented date field with a calendar trigger and form submission; replace placeholder and labelSupplementary with isOptional and infoTooltip.
- Model `PaginationProps` as a variant union. Page-only wrappers should extend `PaginationPageProps`; load-more wrappers can use `PaginationLoadMoreProps`.

### Removed

- Remove Accordion isDisabled support from groups, items, and data-driven entries.
- Remove Pagination’s `isDisabled` prop. Boundary and completion controls disable automatically; use `isLoading` for pending load-more requests.

### Fixed

- Prevent pending submit and reset buttons from triggering native form actions, including implicit submission from a text field, while retaining focus.
- Preserve inherited Button context classes and custom rendering, explicit height and square-size overrides, and React 19 callback-ref cleanup.
- Keep spinner-only buttons within narrow containers and allow explicit width overrides.
- Let button labels and icons scale with the button on press while preserving ripple expansion. Align the dark filled danger ripple opacity with the design specification and use the white and theme-specific accent design tokens for ripples. Respect reduced motion for the spinner and ripple, and retain a visible focus outline in forced-colors mode.
- Center Accordion dividers on item boundaries so hovered headers have balanced spacing, including the last item.
- Keep Pagination within narrow containers, restore numbered-button theme colors, make ellipsis menus work when `boundaryCount` is zero, and retain keyboard focus after selecting a hidden page.

## 0.12.0

_Released 2026-09-20._

### Added

- Align `DateField` with Input `appearance` (`default` | `outline`) and `size` (`sm` | `md` | `lg`) for segment-based date entry.
- Add `isOptional`, `infoTooltip`, and `infoTooltipAriaLabel` to `DateField`, matching the TextArea label pattern.
- Add TextArea `isOptional` to show localized Optional beside the label. Required fields hide that caption.
- Support `href`, link DOM props, `routerOptions`, and a `render` escape hatch on Tabs items so individual tabs can navigate with Next.js or TanStack Router links.
- Accept optional `navigate` and `useHref` on `VeliProvider` to wire React Aria's `RouterProvider` for app-wide client-side navigation.

### Changed

- Change Avatar's default size from 60px to 44px.
- Lay out `Modal.Footer` actions with `justify-between` so start-edge and end-edge action groups match the Figma Modal footer. Cluster right-only actions with `ms-auto` when you do not need a start group.
- Rename the PasswordInput `variant` prop to `appearance` so Default and Outline match Input, Select, ComboBox, and TextArea. Replace `variant="outline"` with `appearance="outline"`.
- Default PasswordInput `isRequired` to `true`. Pass `isRequired={false}` to opt out, or `showRequiredIndicator={false}` to keep the field required without a visible asterisk.
- Make `TabsItem.panel` optional so route-driven tabs can omit in-component panel content; Tabs still renders a visually hidden panel so `aria-controls` resolves.
- Rename the TextArea `variant` prop to `appearance` so Default and Outline match Input, Select, and ComboBox. Replace `variant="outline"` with `appearance="outline"`.

### Removed

- Remove the deprecated Badge `intent="teal"` alias. Use `intent="brand"` instead.
- Remove TextArea `labelSupplementary`. Replace `labelSupplementary="Optional"` with `isOptional`.
- Remove PasswordInput `infoTooltip`, `infoTooltipAriaLabel`, and `labelSupplementary`. Password fields do not show an info icon or Optional caption.

### Fixed

- Align Card footer actions to the inline end with `ms-auto` so the action row follows LTR and RTL correctly.
- Restore interactive Card hover and pressed feedback with an `ash-alpha` overlay (replacing invalid `gray-alpha` utilities) and opacity transitions that respect `prefers-reduced-motion`.
- Stop outline `DateField` shells from shifting layout on hover and focus by painting the stroke with an inset box-shadow.
- Use `bg-text-input-bg-hover` for disabled and read-only `DateField` shells so they match Figma and TextArea in light and dark.
- Correct Accordion spacing and dividers between expanded sections, mirror panel insets and leading chevrons in RTL, honor reduced motion, and align decorative custom indicators. Public props and imports are unchanged; review custom spacing overrides when upgrading.
- Honor `prefers-reduced-motion` on Modal overlay and panel enter/exit transitions.
- Draw the PasswordInput outline stroke inside the shell so hover (1.5px) and active (2px) do not shift the field or its value.
- Drop the muted PasswordInput disabled stroke and underline so Default and Outline match Figma (fill only).
- Use the text-input hover fill for disabled PasswordInput shells so they match Figma `components/text-input/bg-hover`.
- Honor reduced-motion preferences on PasswordInput color transitions.
- Keep link tab selection in sync with `selectedKey` / `onSelectionChange` after React Aria resets selection on href tab presses.
- Set the large TextArea shell minimum height to 173px to match the Figma specification.
- Apply the shared Dhivehi Safari baseline offset to TextArea so Thaana glyphs sit on the same line box as Input.
- Honor reduced-motion preferences on TextArea color transitions.
- Use `type-body-sm-regular` for the TextArea character counter at every size instead of hardcoded 14px type.
- Color field-header info tooltip triggers with `icon/base/default` (and `icon/disabled` when disabled) to match Figma. This applies to Input, TextArea, Select, ComboBox, and PasswordInput.
- Draw the TextArea outline stroke inside the shell so hover (1.5px) and active (2px) do not shift the field or its label.
- Drop the muted TextArea disabled stroke and underline so Default and Outline match Figma (fill only).
- Use the text-input hover fill for disabled TextArea shells so they match read-only and Figma `components/text-input/bg-hover`.
- Keep the TextArea resize handle out of the tab order. Resize stays pointer-drag only, matching a native textarea.

## 0.11.1

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

## 0.11.0

_Released 2026-09-01._

### Added

- Add a generic `Skeleton` placeholder primitive exported from `@tradenetcorp/veli-ui/skeleton` for composing loading state skeletons.

### Changed

- Require React 19 and React DOM 19, eliminating peer dependency warnings for React 19 applications.

### Removed

- Remove embedded skeleton loading modes from `Input`, `TextArea`, `PasswordInput`, `Search`, and `Accordion`. Compose `Skeleton` placeholders instead of using `appearance="skeleton"`, `variant="skeleton"`, or `isSkeleton`.

### Fixed

- Allow `Link` children to use React Aria's state render function alongside router link rendering.
- Standardize interactive component refs as React 19 ref props while preserving access to their underlying controls.
- Add default ESM export conditions so bundlers can resolve every public component subpath consistently.

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
