Version 0.4.0 targets Veli React 0.19.x, tokens 0.11.x and React Aria Components 1.22.x.

## Ownership and prerequisites

A floating organization side navigation shell with collapse-to-icon-rail behavior and host-composed header and menu parts. This experimental block is portable, editable React source. The hosting application supplies organizations, nested route levels, translations, switcher menus, selection, and router links. It owns fetching, authorization, persistence, analytics, and every network side effect.

Follow the [Veli setup guide](/docs/) for package access, Tailwind, fonts and primitives. Use React 19 and Tailwind 4, and wrap the application in `VeliProvider` with its language and color scheme. See the [provider guide](/docs/provider/) for document direction and theme initialization. The tested dependency versions appear below and in `manifest.json`.

## Installation

Configure access to Veli's restricted npm packages through your existing setup; keep credentials outside committed files. Initialize Blocks once, using your team's Veli Web URL, then install:

```sh
corepack pnpm dlx @tradenetcorp/veli init
corepack pnpm dlx @tradenetcorp/veli add side-nav
```

The CLI checks dependencies and copies `side-nav.tsx` into your configured Blocks directory. Import `SideNav` and its parts directly from that working copy. Commit both the source and `.veli/blocks/side-nav/`, which retains the original source and receipt for updates.

Install the block's peer stack when it is not already present:

```sh
corepack pnpm add @phosphor-icons/react@2.1.10 @veli-design/react@0.19.0 @veli-design/tokens@0.11.0 motion@12.42.2 react@19.2.6 react-dom@19.2.6 react-aria-components@1.22.0
```

Your stylesheet must import Tailwind and the Veli token and UI themes:

```css
@import 'tailwindcss';
@import '@veli-design/tokens/tailwind';
@import '@veli-design/react/tailwind';
```

If the copied directory is outside Tailwind's automatically scanned tree, add an `@source` path relative to your stylesheet.

## Composition

`SideNav` is a client component. It provides collapse context to descendants. Parts must be used within `SideNav`; `useSideNav()` returns `{ collapsed, setCollapsed, toggle, renderLink, layoutTransition }`.

```text
SideNav
├── SideNavTrigger (one instance across collapse; pin outside level swap)
├── SideNavLevelSwap (optional host-owned nested levels)
│   ├── SideNavHeader
│   │   ├── SideNavHeaderRow
│   │   │   ├── SideNavSectionLabel | SideNavBackButton
│   │   │   └── size-9 spacer under the pinned trigger
│   │   ├── SideNavOrgSwitcher
│   │   │   ├── SideNavOrgAvatar
│   │   │   ├── SideNavOrgName / SideNavOrgSecondary
│   │   │   └── SideNavOrgCaret
│   │   └── SideNavTitle
│   └── SideNavMenu
│       └── SideNavMenuItem
│           └── SideNavMenuButton
│               ├── icon
│               ├── SideNavMenuLabel
│               └── SideNavMenuBadge
```

Collapsed rail: keep the same `SideNavTrigger` mounted, then compose `SideNavCollapsedOrgButton` + `SideNavOrgAvatar` (size `36`), an optional spacer (`h-1 w-2.5`), and `SideNavMenu`. Do not remount a second trigger when collapsing — that drops keyboard focus. Hide nested header chrome while collapsed. Expanded spacers between chrome and menu are ordinary markup (`h-2`).

## API

`SideNav` is composable. Controlled collapse uses `isCollapsed` + `onCollapsedChange`; omit `isCollapsed` for uncontrolled state with optional `defaultCollapsed`. All visible and assistive copy comes from the host; there are no built-in product translations.

### Shell

| Prop / export       | Contract                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `aria-label`        | Required accessible name for the root `nav` landmark.                                                                                      |
| `children`          | Required composed parts.                                                                                                                   |
| `isCollapsed`       | Optional controlled collapsed state. When set, the panel does not store collapsed state locally.                                           |
| `defaultCollapsed`  | Optional initial collapsed state when `isCollapsed` is omitted. Defaults to `false`.                                                       |
| `onCollapsedChange` | Optional `(collapsed: boolean) => void`. Fired when the expand or collapse control is pressed.                                             |
| `renderLink`        | Optional default router-link render for menu buttons with `href`. Follows Veli Link’s `render` contract; per-button `render` overrides it. |
| `className`         | Optional class on the root `nav`. Preserve focus rings, contrast, truncation, and the 264 ↔ 68 width contract.                             |
| `useSideNav()`      | Context hook. Returns `{ collapsed, setCollapsed, toggle, renderLink, layoutTransition }`. Throws outside `SideNav`.                       |

Expanded width is **264px**; collapsed icon rail is **68px**. Width transitions use CSS (`400ms`, `cubic-bezier(0.32, 0.72, 0, 1)`); under `prefers-reduced-motion` width snaps.

### Header and chrome

| Part                        | Contract                                                                                                                                                                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SideNavHeader`             | Stacks header children with the panel gap; centers children when collapsed.                                                                                                                                                         |
| `SideNavHeaderRow`          | Horizontal row. Optional `inset` adds start padding to align section labels with content.                                                                                                                                           |
| `SideNavTrigger`            | Required `collapseLabel` and `expandLabel`. Toggles collapse via context; exposes `aria-expanded`. Keep one instance mounted across collapse/expand, and pin it outside `SideNavLevelSwap` so it does not slide with nested levels. |
| `SideNavSectionLabel`       | Uppercase section caption; opacity-fades when collapsed.                                                                                                                                                                            |
| `SideNavBackButton`         | Primary ghost back control with leading caret. Host supplies `onPress` and label children (often the parent organization name).                                                                                                     |
| `SideNavTitle`              | Nested-level title block (for example Access).                                                                                                                                                                                      |
| `SideNavOrgSwitcher`        | Bordered switcher row. Required `aria-label`. Prefer wrapping in Veli `MenuTrigger`; optional `onPress` / `isDisabled` for custom overlays.                                                                                         |
| `SideNavOrgAvatar`          | Ringed avatar. Required `alt`. `size` is `44` (expanded switcher) or `36` (collapsed rail). Optional `src`, `initials`, `appearance` (Veli Avatar appearance; default `teal`).                                                      |
| `SideNavOrgName`            | Primary switcher label; hides when collapsed. Optional `lang` / `dir` (`ltr` \| `rtl` \| `auto`).                                                                                                                                   |
| `SideNavOrgSecondary`       | Secondary membership line; hides when collapsed. Optional `lang` / `dir`.                                                                                                                                                           |
| `SideNavOrgCaret`           | Trailing caret; hides when collapsed.                                                                                                                                                                                               |
| `SideNavCollapsedOrgButton` | Icon-only collapsed-rail press target. Required `aria-label`. Prefer `MenuTrigger` wrapping; optional `onPress` / `isDisabled`.                                                                                                     |

### Menu

| Part                | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SideNavMenu`       | Navigation `ul` with 4px item gap.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `SideNavMenuItem`   | Single `li` wrapper.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `SideNavMenuButton` | Link or button row. Optional `href`, `target`, `rel`, `onPress`, `isActive`, `render`, `aria-label`, `className`. With `href`, renders React Aria `Link` (`aria-current="page"` when active). Without `href`, renders a button — use that for drill-in rows that only call `onPress` to open a nested level. Children: icon node(s), `SideNavMenuLabel`, optional `SideNavMenuBadge`. Empty/optional children are skipped so collapsed icons stay at the start padding. When collapsed, `aria-label` defaults to the label text if omitted. |
| `SideNavMenuLabel`  | Row label; `flex-1` + opacity fade when collapsed (no max-width tween).                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `SideNavMenuBadge`  | Trailing counter Badge (`subtle` / `neutral`); opacity/scale fade when collapsed, snaps out of flow with `w-0` (no max-width tween).                                                                                                                                                                                                                                                                                                                                                                                                        |

### Nested levels and motion

| Export / part          | Contract                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SideNavLevelSwap`     | Host helper for push/pop between levels. Required `level` (stable key) and `direction` (`1` drill in, `-1` back). Optional `writingDirection` (`ltr` \| `rtl`, default `ltr`) flips the physical axis. Stacks enter/exit in one grid cell (no `popLayout`) with direction-aware `transform` translate (±16px) and drawer ease; exiting layers set `pointer-events: none`. Reduced motion is opacity-only (`150ms`). |
| `sideNavEaseDrawer`    | Shared ease `[0.32, 0.72, 0, 1]`.                                                                                                                                                                                                                                                                                                                                                                                   |
| `sideNavPanelDuration` | Collapse duration in seconds (`0.4`).                                                                                                                                                                                                                                                                                                                                                                               |
| `sideNavLevelDuration` | Level-swap duration in seconds (`0.22`).                                                                                                                                                                                                                                                                                                                                                                            |
| `sideNavLevelTravelPx` | Level-swap travel in pixels (`16`).                                                                                                                                                                                                                                                                                                                                                                                 |

## Host adapter pattern

Keep organization records, menus, nested route tables, and persistence in the application. Translate every accessible string. Pass destinations as `href` and supply `renderLink` (or per-button `render`) for framework router links. Mount the panel beside your main content or inside a shell column you own; [site-shell](/blocks/site-shell/) has no side slot in this release.

Executable Next-oriented adapter: `packages/blocks/examples/side-nav-next.tsx`. Storybook and the docs demo follow the same recipe.

### Expanded organization level

```tsx
import { UsersIcon } from '@phosphor-icons/react';
import { Menu, MenuItem, MenuPopover, MenuTrigger } from '@veli-design/react/menu';
import { Avatar } from '@veli-design/react/avatar';
import {
  SideNav,
  SideNavHeader,
  SideNavHeaderRow,
  SideNavSectionLabel,
  SideNavTrigger,
  SideNavOrgSwitcher,
  SideNavOrgAvatar,
  SideNavOrgName,
  SideNavOrgSecondary,
  SideNavOrgCaret,
  SideNavMenu,
  SideNavMenuItem,
  SideNavMenuButton,
  SideNavMenuLabel,
  SideNavMenuBadge,
} from '@/components/blocks/side-nav/side-nav';

<SideNav aria-label={labels.section} renderLink={renderLink}>
  <div className="relative flex w-full flex-col">
    <div className="absolute end-0 top-0 z-10">
      <SideNavTrigger collapseLabel={labels.collapse} expandLabel={labels.expand} />
    </div>
    <SideNavHeader>
      <SideNavHeaderRow inset>
        <SideNavSectionLabel>{labels.section}</SideNavSectionLabel>
        <span aria-hidden="true" className="inline-block size-9 shrink-0" />
      </SideNavHeaderRow>
      <MenuTrigger>
        <SideNavOrgSwitcher aria-label={labels.organizationSwitcher}>
          <SideNavOrgAvatar
            alt={org.name}
            size="44"
            initials={org.initials}
            appearance={org.appearance}
          />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
            <SideNavOrgName>{org.name}</SideNavOrgName>
            <SideNavOrgSecondary>{org.secondaryText}</SideNavOrgSecondary>
          </span>
          <SideNavOrgCaret />
        </SideNavOrgSwitcher>
        <MenuPopover placement="bottom start" className="min-w-[var(--trigger-width)]">
          <Menu
            aria-label={labels.organizationSwitcher}
            selectionMode="single"
            selectedKeys={new Set([org.id])}
            onSelectionChange={onOrganizationSelection}
            disallowEmptySelection
            className="[&_[data-veli-menu-selection-slot]]:order-last"
          >
            {organizations.map((entry) => (
              <MenuItem
                key={entry.id}
                id={entry.id}
                textValue={entry.name}
                description={entry.secondaryText}
                startIcon={
                  <Avatar size="28" initials={entry.initials} type="initials" alt={entry.name} />
                }
              >
                {entry.name}
              </MenuItem>
            ))}
          </Menu>
        </MenuPopover>
      </MenuTrigger>
      <div aria-hidden="true" className="h-2 w-full shrink-0" />
    </SideNavHeader>
    <SideNavMenu>
      <SideNavMenuItem>
        <SideNavMenuButton href="/people" isActive>
          <UsersIcon weight="bold" />
          <SideNavMenuLabel>People</SideNavMenuLabel>
          <SideNavMenuBadge>1</SideNavMenuBadge>
        </SideNavMenuButton>
      </SideNavMenuItem>
    </SideNavMenu>
  </div>
</SideNav>;
```

### Collapsed rail

Keep one `SideNavTrigger` in a stable tree slot across both layouts so focus survives toggle. When `useSideNav().collapsed` is true, swap only the body under that trigger — collapsed org control, spacer, and the same menu (icons only) — not a second trigger or the expanded header tree:

```tsx
<div className={`relative flex w-full flex-col ${collapsed ? 'items-center' : ''}`}>
  <div className={collapsed ? 'shrink-0' : 'absolute end-0 top-0 z-10'}>
    <SideNavTrigger collapseLabel={labels.collapse} expandLabel={labels.expand} />
  </div>
  {
    collapsed ? (
      <>
        <MenuTrigger>
          <SideNavCollapsedOrgButton aria-label={labels.organizationSwitcher}>
            <SideNavOrgAvatar
              alt={org.name}
              size="36"
              initials={org.initials}
              appearance={org.appearance}
            />
          </SideNavCollapsedOrgButton>
          {/* same MenuPopover / Menu as expanded */}
        </MenuTrigger>
        <div aria-hidden="true" className="h-1 w-2.5 shrink-0" />
        <SideNavMenu>{/* same items */}</SideNavMenu>
      </>
    ) : null /* expanded header + menu; trigger stays above */
  }
</div>
```

### Nested level (for example Access)

Track host state for `level` and semantic `direction` (`1` into a submenu, `-1` back). Wrap the level body in `SideNavLevelSwap` and keep `SideNavTrigger` pinned outside the swap. Pass `writingDirection` from `useVeliLanguage().direction` so enter/exit follow inline-end. For the row that opens a nested level, omit `href` and handle the swap in `onPress` so it stays a button rather than a half-navigating link.

```tsx
import { useVeliLanguage } from '@veli-design/react/provider';
import {
  SideNavLevelSwap,
  SideNavBackButton,
  SideNavTitle,
} from '@/components/blocks/side-nav/side-nav';

const { direction } = useVeliLanguage();

<div className="relative flex w-full flex-col">
  <div className="absolute end-0 top-0 z-10">
    <SideNavTrigger collapseLabel={labels.collapse} expandLabel={labels.expand} />
  </div>
  <SideNavLevelSwap level={level} direction={levelDirection} writingDirection={direction}>
    {level === 'access' ? (
      <SideNavHeader>
        <SideNavHeaderRow>
          <SideNavBackButton onPress={onBack}>{org.name}</SideNavBackButton>
          <span aria-hidden="true" className="inline-block size-9 shrink-0" />
        </SideNavHeaderRow>
        <SideNavTitle>Access</SideNavTitle>
      </SideNavHeader>
    ) : /* organization header */
    null}
    <SideNavMenu>{/* items for the current level */}</SideNavMenu>
  </SideNavLevelSwap>
</div>;
```

## Accessibility and responsive behavior

The root is a `nav` labelled by the host. `SideNavTrigger` exposes `aria-expanded` and the host-owned collapse/expand name. Keep that trigger mounted across collapse so Enter/Space can expand again without restoring focus manually. Organization switcher, collapsed org control, back control, and each navigation item are keyboard-focusable with visible focus rings (`ring-border-focus`). Active items set `aria-current="page"`. When collapsed, menu buttons use `aria-label` from the menu label text unless the host passes one.

Geometry is fixed to the floating nav frames: **264px** expanded and **68px** collapsed. Labels, section captions, switcher text, and badges hide with opacity fades (`400ms` drawer ease; `150ms` under reduced motion) while the panel width CSS-transitions; flex-shrink on labels (not max-width tweens) keeps menu icons on their start padding. Badges snap out of flow when collapsed. Panel width snaps under `prefers-reduced-motion`; level travel is dropped and only opacity remains.

Logical CSS (`ps-3`, `end-0`, text-start) supports LTR and RTL. `SideNavLevelSwap` flips the physical enter/exit axis from `writingDirection` so drill-in moves toward inline-end. Organization name and secondary lines accept optional `lang` / `dir` for mixed-script content.

The block does not ship a mobile sheet or off-canvas variant. Hosts that need small-viewport navigation compose a separate pattern. Manual screen-reader and device testing remains part of adopting an experimental block. Storybook language and theme toolbars exercise sample copy; production translations remain host-owned.

## Customization and updates

Edit your installed source and adapter to fit the host. Keep organization switching, routing, and persistence outside the reusable presentation. Send reusable interaction fixes upstream.

1. Run `veli status` and read the new changelog and dependency requirements. Updating Veli UI alone does not update this source.
2. Run `veli update side-nav` for a three-way merge against the saved original.
3. Resolve labelled conflicts and run `veli update --continue side-nav`, or `veli update --abort side-nav` to restore your copy.
4. Re-run application validation and commit the working source and updated `.veli` baseline together.

Receipts contain source commit and SHA-256 hashes. A `dirty` receipt identifies a local preview rather than a released source snapshot.

## Non-goals

The block does not fetch organizations, open a switcher menu, own nested route tables, translate copy, or persist collapse preference. It contains no framework, environment-variable, or service-client imports. It introduces no registry, CLI capability, or npm package. It does not ship a separate Provider, content inset region, mobile sheet, or resize rail. Product-specific navigation trees stay in the host adapter.

## Visual references

Presentation follows the V3 floating organization nav geometry: expanded **264px**, collapsed icon rail **68px**, `rounded-3xl` raised surface with `shadow-md`, primary-emphasis avatar ring, and primary-subtle active pills. Collapse and level motion use drawer ease `cubic-bezier(0.32, 0.72, 0, 1)` (400ms panel, 220ms level, 16px travel).

Token authority: [Veli Design System](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=1940-872). Compare surface, text, neutral interaction colors, typography, radii, and shadow against its current variables in both color modes when adopting.

Interactive reference: Storybook **Blocks/Side nav** (Default, Nested, Collapsed) and the docs block page demo. Organization imagery and menu destinations remain host data.
