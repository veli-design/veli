Experimental `0.1.0` copied-source block for category browsing, grouped checkbox
selections, search and applied-filter summaries. Use the ready-made layout or
compose its public parts around application-owned controls.

## Core package baseline

Version 0.1.0 targets Veli React 0.19.x and tokens 0.11.x. Install the manifest
requirements before adding the source; mobile overlays use the released
composable Sheet. The tested dependency versions are listed below the guide.

## Ownership and prerequisites

The host supplies categories, stable IDs, translated messages, controlled values
and callbacks. It owns fetching, filtering results, pagination, URL persistence,
loading/error/empty states and async result announcements. The block provides UI
state transitions and composition, not application query policy.

Configure VeliProvider, tokens, English/Dhivehi fonts and Tailwind source scanning
as for the other blocks. Keep the copied manifest files together. Additional
inputs use supported Veli primitives and remain consumer-owned.

## Installation

After this block is available in the catalog, add it with:

```sh
corepack pnpm dlx @veli-design/cli add filter-bar
```

Import from the copied entry point:

```tsx
import {
  FilterBar,
  type FilterBarValue,
  type FilterCategory,
  type FilterBarMessages,
} from './components/blocks/filter-bar/filter-bar';
```

These APIs belong to the copied block, not `@veli-design/react`.

## Default or composed

Use `FilterBar` for the standard layout. It is built from the same exported parts
that consumers can arrange themselves. Application data, result filtering,
fetching, pagination, URL persistence and async announcements remain outside the
block. Install the manifest dependencies and configure VeliProvider, tokens,
fonts and Tailwind scanning as described by the CLI setup.

```tsx
const [value, setValue] = useState<FilterBarValue>({
  categoryId: null,
  selections: {},
  mode: 'browse',
  query: '',
});

<FilterBar
  categories={categories}
  value={value}
  onValueChange={setValue}
  messages={messages}
  summary={`Showing ${visibleCount} of ${totalCount}`}
/>;
```

The preset takes a complete message dictionary. Composed parts require only their
own visible content and accessible labels; they do not require the preset's full
dictionary. The example content exports English and Dhivehi sample messages and
categories. Replace sample copy with approved application wording.

```tsx
<FilterBarRoot
  label="Publication filters"
  categories={categories}
  value={value}
  onValueChange={setValue}
  filters={customFilters}
  className="space-y-6"
>
  <FilterBarToolbar>
    <FilterBarSearch label="Search" closeLabel="Close search" />
    <FilterBarPopover>
      <FilterBarTrigger label="Refine publications">Refine</FilterBarTrigger>
      <FilterBarPanel label="Refine publications" className="w-[32rem]">
        <FilterBarPanelHeader title="Refine publications" closeLabel="Close filters" />
        <FilterBarPanelBody className="max-h-[60dvh] space-y-4">
          <ConsumerDateControl />
          <FilterBarSections selectedLabel={(count) => `${count} selected`} />
        </FilterBarPanelBody>
        <FilterBarPanelFooter>
          <FilterBarClear>Reset filters</FilterBarClear>
        </FilterBarPanelFooter>
      </FilterBarPanel>
    </FilterBarPopover>
  </FilterBarToolbar>
  <FilterBarCategories labels={railLabels} />
  <FilterBarSummary>
    <FilterBarAppliedFilters label="Active filters" removeLabel={(text) => `Remove ${text}`} />
  </FilterBarSummary>
</FilterBarRoot>
```

See `filter-bar-composition.tsx` below for a complete alternate arrangement with
consumer-owned publication-period presets, a custom header/footer, a 512px panel,
and a separate category row. Storybook **Custom Composition** uses that example. **Figma Reference** uses the 1208px width, content and spacing
from [7493:199351](https://www.figma.com/design/UJmgh6ihn8EsMuOnwEJrOn/gov.mv?node-id=7493-199351).

## API

### Preset props

`FilterBar` is controlled: update `value` immediately in `onValueChange`. Debounce
network requests separately. Fetching, result counts, loading/empty/error states,
pagination and URL persistence belong to the application.

| Prop               | Type / default                              | Purpose                                                            |
| ------------------ | ------------------------------------------- | ------------------------------------------------------------------ |
| `categories`       | `readonly FilterCategory[]`, required       | Stable IDs, labels, optional child options and disabled flags.     |
| `value`            | `FilterBarValue`, required                  | `{ categoryId, selections, mode, query }`.                         |
| `onValueChange`    | `(value: FilterBarValue) => void`, required | Receives the complete next value.                                  |
| `messages`         | `FilterBarMessages`, required               | Application-owned visible copy and accessible labels.              |
| `summary`          | `ReactNode`                                 | Result status, for example “Showing 9 of 55”.                      |
| `panelStart`       | `ReactNode`                                 | Your inputs above the standard checkbox sections.                  |
| `filters`          | `readonly FilterExtension[]`                | Connect custom controls to chips, counts and clearing.             |
| `sectionOptions`   | `FilterSectionOptions`                      | `showSelectAll` and `showDisclosure`, both default `true`.         |
| `chipSummary`      | `FilterChipSummary`                         | Selected-name threshold and custom summary formatters.             |
| `showSearch`       | `boolean`, `true`                           | Include the search control.                                        |
| `showScrollArrows` | `boolean`, `true`                           | Enable arrows at overflowing category edges on mobile and desktop. |
| `mobileMaxRows`    | `number`, `2`                               | Collapsed mobile chip rows; `0` hides chips and their disclosure.  |
| `isDisabled`       | `boolean`, `false`                          | Disable filter editing.                                            |
| `className`        | `string`                                    | Layout on the block-owned root.                                    |

`categoryId: null` means All. `selections` maps category IDs to child ID arrays or
`true` for a whole category. The block derives `mode` from the selected categories.
Use `query: ''` and `selections: {}` for an empty initial state.

### Composition structure

The preset uses these same public parts. Consumers may omit or rearrange them
under `FilterBarRoot`; DOM order determines reading and keyboard order.

```text
FilterBarRoot
├── FilterBarToolbar
│   ├── FilterBarCategories
│   └── FilterBarActions
│       ├── FilterBarSearch
│       └── FilterBarPopover
│           ├── FilterBarTrigger
│           └── FilterBarPanel
│               ├── FilterBarPanelHeader
│               ├── FilterBarPanelBody
│               │   ├── Your inputs
│               │   └── FilterBarSections → FilterBarSection
│               └── FilterBarPanelFooter
│                   ├── FilterBarClear
│                   └── FilterBarDone
└── FilterBarSummary
    ├── FilterBarStatus
    └── FilterBarAppliedFilters
        └── FilterBarClear
```

`FilterBarPanel` adapts to a Sheet at 600px and below. Keep its header, body and
footer parts to retain the responsive scrolling and dismissal behavior.
`FilterCheckboxSection` and `FilterCheckbox` also work independently of Root.

### Supported parts

All parts import from the copied `filter-bar` entry. Composition follows DOM order.

| Part                                                       | Contract                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FilterBarRoot`                                            | Controlled `categories`, `value`, `onValueChange`; accessible `label`; optional `filters`, `chipSummary`, `isDisabled`, children and layout `className`/`id`.                                                                                                                                               |
| `useFilterBar`                                             | Shared normalized value, categories, applied `items`, `count`, selection/browse/query/clear actions, panel state and focus helper. Must be inside Root.                                                                                                                                                     |
| `FilterBarToolbar`, `FilterBarActions`, `FilterBarSummary` | Children and block-owned layout `className`/`id`.                                                                                                                                                                                                                                                           |
| `FilterBarCategories`                                      | Rail labels (`all`, `previousCategories`, `nextCategories`, `chooseLabels`) and layout `className`. Optional `showScrollArrows` boolean controls overflow arrows (default `true`). Includes maintained TagDropdown/Menu and overlaid overflow arrows/fades; edge controls never resize the scroll viewport. |
| `FilterBarSearch`                                          | `label`, `closeLabel`, optional `placeholder`; `className` replaces the expanded wrapper's width classes. Expandable on desktop; always open on mobile.                                                                                                                                                     |
| `FilterBarPopover`                                         | Children containing a trigger and panel; integrates open state with search.                                                                                                                                                                                                                                 |
| `FilterBarTrigger`                                         | `label`; optional children for a text trigger. Active-filter Badge and focus target are supplied.                                                                                                                                                                                                           |
| `FilterBarPanel`                                           | Accessible `label`, supported Popover `intent`/`placement`, children; Desktop `className` sets its inner width; mobile uses Sheet sizing. Viewport maximum remains protected.                                                                                                                               |
| `FilterBarPanelHeader`                                     | `title`, `closeLabel`, optional `showDivider`; custom children replace the title area. Use React Aria `Heading slot="title"` for a custom heading.                                                                                                                                                          |
| `FilterBarPanelBody`                                       | Children and layout `className`/`id`; On desktop, className replaces the default 50dvh height limit; mobile uses Sheet.Body. Owns the scroll container around Veli Content, so it shrinks within available overlay height while the header and footer stay outside scrolling.                               |
| `FilterBarPanelFooter`                                     | Arbitrary children and optional `showDivider`.                                                                                                                                                                                                                                                              |
| `FilterBarSections`                                        | Standard category sections; optional `selectedLabel(count)` and layout `className`.                                                                                                                                                                                                                         |
| `FilterBarSection`                                         | Connects one `categoryId` to shared selection. Arrange sections alongside consumer controls; optional count formatter and layout `className`.                                                                                                                                                               |
| `FilterCheckboxSection`                                    | Independent of Root. `label`, `options`, `selectedKeys`, `onSelectionChange`; optional selected description, disabled and controlled/uncontrolled expanded state, and layout `className`.                                                                                                                   |
| `FilterCheckbox`                                           | Independent controlled Veli Checkbox row: `isSelected`, `onChange`, optional `isDisabled`, children and layout `className`/`id`.                                                                                                                                                                            |
| `FilterBarAppliedFilters`                                  | Accessible `label`, `removeLabel(text)`; optional list layout `className`. Renders category and consumer items together. Optional `disclosure` enables mobile expansion; `mobileMaxRows` defaults to 2. Children supply a clear action alongside desktop chips and below mobile chips.                      |
| `FilterBarStatus`                                          | `formatCount(count)`, application-owned result status children and layout `className`. Does not announce async results itself.                                                                                                                                                                              |
| `FilterBarDone`                                            | Children label the mobile-only action that closes the Sheet without changing selections.                                                                                                                                                                                                                    |
| `FilterBarClear`                                           | Children; optional supported Button `size` and arrow. Clears active category and consumer filters, retaining browse context and search.                                                                                                                                                                     |

Use Veli primitives directly for additional controls. Existing parts connect them
through `useFilterBar`; there is no replacement-control style hook. The entry point explicitly exports the composition components, their consumer-facing
types, and `useFilterBar`. State normalization helpers and the controller interface
are internal implementation details.

### Optional section controls and chip summaries

`FilterCheckboxSection`, `FilterBarSection` and `FilterBarSections` accept
`showSelectAll` and `showDisclosure`, both defaulting to `true`. The preset
forwards `sectionOptions` to its sections:

```tsx
<FilterBar
  {...props}
  sectionOptions={{ showSelectAll: false, showDisclosure: false }}
  chipSummary={{ maxVisibleValues: 1 }}
/>
```

Without select-all, the entire header is one disclosure button (label, count,
chevron and padding), operable with click, Enter or Space. It never changes
selection. If disclosure is also hidden, the header is plain text.
Without disclosure, options are always visible, even if `isExpanded={false}`
or `defaultExpanded={false}` is supplied. No expansion callback fires while
that control is absent. Individual options retain selection and disabled behavior.
For per-category choices, compose `FilterBarSection` with different props.
Standalone categories continue to be selectable rows.

Applied category chips show one selected name by default, then a localized count
for two or more (`Announcements | 5 selected`). Set `chipSummary.maxVisibleValues`
to the largest number of names to display: `3` shows names through three and a
count from four; `0` always shows a count; `Infinity` always shows names. Negative,
fractional and NaN thresholds are rejected. Extension chips keep consumer content.

Both `FilterBar` and `FilterBarRoot` accept `chipSummary`. The preset uses
`messages.selected` for count wording unless `formatCount` overrides it. Root
has English/Dhivehi fallback wording; consumers can supply approved localized copy.
For full control, including different policies per category:

```tsx
chipSummary={{
  maxVisibleValues: 2,
  formatCount: (count) => `${count} chosen`,
  formatSelection: ({ category, selectedOptions, defaultSummary }) =>
    category.id === 'topics'
      ? selectedOptions.map((option) => option.label).join(' / ')
      : defaultSummary,
}}
```

The formatter returns plain text. Full selected names remain in the accessible
remove label and the panel; summary compaction never changes filter count,
selection, or the category-wide remove action.

## Host adapter pattern

The core does not import a date control, inspect date values or serialize them.
`FilterBar` has no built-in `dateRange` prop. Use `panelStart` for a control above
the preset sections, or place it anywhere in a composed panel.

Connect a control through a `FilterExtension`:

```tsx
const [period, setPeriod] = useState<string | null>(null);
const customFilters: FilterExtension[] = [
  {
    id: 'publication-period',
    items: period
      ? [
          {
            id: 'period',
            label: period,
            textValue: `Publication date | ${period}`,
            count: 1,
            onRemove: () => setPeriod(null),
          },
        ]
      : [],
    onClear: () => setPeriod(null),
  },
];
```

Each item has a stable ID, renderable label, plain accessible `textValue`, optional
description and a remove action. `count` is a positive integer and defaults to one.
An extension clears once per control, even if it supplies several chips. Keep
category state and control values separate, as shown, or use functional state
updates when a consumer stores them together. Clear all must not accidentally
restore an earlier category value through a stale callback.

Date fields, range boundaries, incomplete input, localization and backend query
meaning belong to the consumer. A range typically supplies one chip and count.
The consumer examples compose Veli `DatePicker` directly, without a visible label,
matching the single-control Figma layout. `aria-label` supplies its accessible name.
No date input or date-specific types are exported by the block. Veli DatePicker
accepts one `DateValue | null`; it does not select ranges.
The sample consumer maps that day to equal start/end boundaries for its query.

**The supported Veli React 0.19.0 baseline does not provide DateRangePicker.** When it is released,
consumers can compose it into `panelStart` or `FilterBarPanelBody` in place of
DatePicker. Keep its range state in the consumer and connect it through
`FilterExtension` for summary, count, remove and clear. No core block redesign or
styling/lint override is needed. Existing `RangeCalendar` is not a range-input field.

### Compose your own DatePicker

Use Veli directly and connect the value through an extension. The input stays
consumer-owned; removing its chip or clearing filters resets the same state.

```tsx
import { useState } from 'react';
import { DatePicker } from '@veli-design/react/date-picker';
import type { DateValue } from 'react-aria-components';
import { FilterBar, type FilterExtension } from './components/blocks/filter-bar/filter-bar';

// Inside your component; categories, value, onValueChange and messages are app props.
const [date, setDate] = useState<DateValue | null>(null);
const dateFilters: FilterExtension[] = [
  {
    id: 'publication-date',
    items: date
      ? [
          {
            id: 'date',
            label: date.toString(),
            textValue: `Publication date: ${date.toString()}`,
            onRemove: () => setDate(null),
          },
        ]
      : [],
    onClear: () => setDate(null),
  },
];

<FilterBar
  {...props}
  filters={dateFilters}
  panelStart={
    <DatePicker
      aria-label="Publication date"
      appearance="outline"
      size="lg"
      value={date}
      onChange={setDate}
    />
  }
/>;
```

Use application-localized date formatting and labels in production. The same
extension contract works for a select, period presets, or a future range input.

## Accessibility and responsive behavior

Use stable unique category IDs and category-local option IDs. Empty or absent
children represent whole categories. Unknown IDs are ignored when rendering and
removed on the next user change; prop changes alone do not emit callbacks.
`selections` maps categories to child arrays or `true` for a whole category.
`mode` is derived from the number of selected categories: multiple categories use
outlined Tags; a single category returns to its solid browse form. Multiple
sub-labels inside that category remain selected. Browsing/search do not count as
filters. Each selected child counts once, while a standalone category counts once.
A category chip removes its complete selection.

Section select-all affects enabled options and preserves disabled selections.
Partial selections use Veli Checkbox's indeterminate state. Selection and
expand/collapse have separate controls. `FilterCheckboxSection` can also be used
without any filter-bar state or overlay. Disabled global state prevents editing;
clear/removal still handle selected disabled options when the block is enabled.

Keep controlled updates immediate; debounce fetching in the consumer instead.
VeliProvider supplies language/direction and primitive localization. An app-owned
polite live region should announce completed async results. Root provides no page
landmark and does not own fetching, matching, loading/error/empty states or pagination.

Rail arrows/fades track each overflowing edge independently, including RTL.
Arrows overlay a fixed scroll viewport, and focus returns to an end tag when its
arrow hides. Tag
mode changes and search use Veli duration/easing tokens; reduced motion skips
these transitions. Desktop uses Veli Popover/Menu; mobile uses Veli Sheet with the same selections.
Applied-chip text is non-interactive; its labelled × button removes the group.
Removing a chip moves focus to an adjacent remove button or the filter trigger.
Hidden mobile chips are excluded from keyboard navigation and the accessibility tree.

### Mobile layout

Requires `@veli-design/react@^0.19.0` for the released composable Sheet.
At 600px and below, category choices open a content-height bottom Sheet and
advanced filters open a viewport-height Sheet. Desktop retains the existing
popovers. Both surfaces use the same controlled selections and consumer content.
The five existing stories demonstrate both layouts through the viewport toolbar;
use the language toolbar for English/LTR or Dhivehi/RTL.

Category tags use Veli `lg` (40px) on mobile and `xl` (44px) on desktop.
Mobile category tags with children open their sheet from the whole tag; use All
or another category to change the browse scope. Checkbox rows remain generously
spaced. The filter trigger gains a visible label, and search stays open beside it on the second row, below the category rail.
The mobile search does not autofocus or show a collapse button; clearing its
query keeps the field visible. Desktop keeps its expandable search.

The Sheet header and footer remain available while the body scrolls. Safe-area
padding protects footer actions. `messages.done` labels category dismissal;
`messages.showResults` labels the preset's mobile-only `FilterBarDone` action.
Panel width and body-height classes apply to desktop; mobile uses the Sheet’s
viewport sizing and scrolling body.
These actions close the overlay; selections apply immediately. Closing or resizing
does not clear selections. Custom compositions retain their own footer actions.
Use `FilterBarPanelHeader` with a title or a custom `Heading slot="title"` to name
the dialog. Sheet owns focus containment, Escape/backdrop/swipe dismissal and
focus restoration. Test the nested DatePicker and virtual keyboard on target devices.

On mobile, the category rail uses native horizontal scrolling and overflow arrows
by default. Setting `showScrollArrows={false}` retains narrow 16px edge fades. Selected values use Veli’s
selected-tag foreground/divider tokens. Long labels are truncated visually
while keeping their full accessible names, and selection changes reveal the
active tag within the rail. Desktop retains its arrow controls and fades.

#### Scroll arrow visibility

`FilterBar` and `FilterBarCategories` accept `showScrollArrows?: boolean`:

- Omit it: enable arrows on mobile and desktop, only at overflowing edges.
- `true`: enable arrows at any viewport width, only at overflowing edges.
- `false`: hide arrows at any viewport width. Narrow overflow fades remain.

Native scrolling and keyboard navigation remain available in every mode.
Consumers can pass their own responsive boolean. The existing Playground and
Applied filters stories expose a boolean control; resetting it restores the
enabled default.

```tsx
<FilterBar {...props} showScrollArrows={false} />
// The same option is available when composing the rail directly:
<FilterBarCategories labels={messages} showScrollArrows={true} />
```

The block adds no page padding. To let only the mobile category rail extend through
consumer-owned gutters, set `--filter-bar-mobile-gutter` on its padded container.
The stories use 16px mobile gutters; search, Filters and summaries remain aligned.

```tsx
<div className="px-4 [--filter-bar-mobile-gutter:var(--veli-spacing-4)]">
  <FilterBar {...props} />
</div>
```

The gutter defaults to zero for containers without page padding. Narrow fades
appear only at edges with hidden content, reverse correctly in RTL, and match
`bg-surface-base`; they do not blur text or intercept touch input.

#### Mobile applied-filter overview

The preset shows up to `mobileMaxRows` rows (default `2`) of applied chips on mobile, with localized Show all filters / Show less controls when more rows exist. Clear all remains available and clears hidden selections too. Desktop continues to show every chip. The disclosure count represents grouped chips, not individual subcategory selections.

When composing `FilterBarAppliedFilters`, pass `disclosure={{ showAll: messages.showAllFilters, showLess: messages.showLessFilters }}` to enable this behavior. Omit it to display every chip unless `mobileMaxRows={0}`. Both the preset and `FilterBarAppliedFilters` accept `mobileMaxRows`, for example `mobileMaxRows={3}`. Set `mobileMaxRows={0}` to hide the chip list and Show all / Show less on mobile while retaining Clear all and the active-filter count. This also works without `disclosure`. Desktop is unchanged. Fractions round down, negative values clamp to zero, and non-finite values fall back to two. Collapsed chips are excluded from keyboard navigation and the accessibility tree. The existing Playground’s `many-filters` scenario demonstrates overflow in English and Dhivehi.

### Localization and public types

Wrap the application in `VeliProvider` with its language and color scheme.
Provide approved translated categories and messages; IDs must stay stable when
switching language. Dhivehi uses RTL layout. Example Dhivehi wording is sample
content for review, not an approved translation.

The preset needs the complete `FilterBarMessages` dictionary. It includes the
rail, search and dialog labels, clear/done actions, `selected(count)`,
`filterCount(count)`, `removeFilter(text)`, `chooseLabels(category)`,
`showAllFilters(count)` and `showLessFilters`. Composed parts take only their own
labels. Supply result announcements through an application-owned polite live region.

Import `FilterBarProps`, `FilterBarValue`, `FilterCategory`, `FilterOption`,
`FilterBarMessages`, `FilterSectionOptions`, `FilterChipSummary`, `FilterExtension`
and `AppliedFilter` from the same local entry point. Named component prop types
and `FilterLayoutProps` support typed wrappers. Internal state helpers, breakpoint
logic and date-specific example types are not public entry-point exports.

## Customization and updates

Control appearance, selected colors, borders, focus treatment and interaction
states stay with Veli. Styling classes are allowed on block-owned layout elements
for grid, widths, gaps and placement. No className/style/internal style overrides
are passed to Veli controls. The styling guard covers every TSX file in this block;
the same lint rules also apply to examples and stories.

Run `veli status`, review the block changelog and dependency baseline, then use
`veli update filter-bar` to merge updates into your copy. Resolve any conflicts
and run `veli update --continue filter-bar`, or use `--abort` to restore the
previous copy. Validate and commit the source and update baseline together.
Updating a Veli npm package does not update copied block source.

### Shared tag animation follow-up

Smoothing a TagDropdown pill’s width when its selected value changes remains a
shared Veli component improvement. The block handles movement between neighbouring
tags; it does not override the shared component’s internal animation.

## Examples and validation

Every story follows the toolbar language switch: English/LTR and Dhivehi/RTL.
Categories, summaries, custom controls and accessible labels switch together,
while selection IDs remain stable. Dhivehi copy is sample content for review.

- **Playground:** standard preset with controls for section actions, search/date composition,
  disabled state, mobile row limits, arrows and sample datasets (including many filters).
- **Applied filters:** selected categories for adjusting chip thresholds and formatter examples.
- **Checkbox section:** standalone control with select-all, disclosure, initial expansion and disabled props.
- **Custom composition:** alternate panel arrangement with consumer-owned controls and complete source.
- **Figma reference:** the retained layout comparison.

Controls map to real component props in each story's source example. The dataset
selector and formatter selector are demo conveniences, not additional block APIs.

The web preview shows the standard interactive Filter Bar and follows the docs
page theme, like the Side Nav preview. Use Storybook for language, composition,
arrow and mobile chip-row controls. The Next.js adapter below demonstrates
application-owned filtering against sample records.

Before adoption, validate your translations, keyboard and assistive-technology
flows, mobile virtual keyboard, nested date control and target devices. Desktop
browser emulation does not replace physical-device or screen-reader testing.

## Visual references

The Figma reference is a layout comparison, not a promise of pixel-identical
older component internals. Agreed differences remain visible: leading Tag checks,
standard Menu selected states, Veli Popover radius/header typography, native
DatePicker segments, and the new select-all/standalone section checkboxes. The
reference story does not fake those controls to conceal differences.

- [PD-1315](https://linear.app/onegov/issue/PD-1315/create-filter-ui-block-for-veli)
- [Figma Media / Filters](https://www.figma.com/design/UJmgh6ihn8EsMuOnwEJrOn/gov.mv?node-id=7493-76508)
- The attached Media Filters and Search HTML supplies interaction reference.
  Dhivehi examples exercise RTL and sample copy, not approved Dhivehi Figma parity.
