## 0.5.1

### Changed

- Make the block documentation self-contained for public consumers while preserving API and integration guidance.

## 0.5.0

### Changed

- Require Veli React ^0.20.0 and record the exact 0.20.0 candidate baseline. The copied-source rendering API and token baseline are unchanged; previous block archives retain their existing requirements.

## 0.4.0

### Changed

- Require Veli React ^0.19.0 and record the exact 0.19.0 candidate baseline. The copied-source rendering API and token baseline are unchanged; previous block archives retain their existing requirements.

## 0.3.0

### Changed

- Support the verified public package baseline: @veli-design/react@^0.18.0, react-aria-components@^1.22.0, @veli-design/tokens@^0.11.0. The copied-source rendering API is unchanged.

## 0.2.0

### Changed

- Use the public @veli-design React and tokens package names. Migrate application and copied source imports together.

## 0.1.1

### Fixed

- Collapse label and badge fades use opacity (and badge scale) instead of max-width layout tweens; menu pills transition color only and snap gap when collapsed.
- Nested level exit layers disable pointer events so they cannot steal clicks during `SideNavLevelSwap`.
- Drill-in host examples omit `href` on nested-level openers so rows stay buttons driven by `onPress`.

## 0.1.0

### Added

- Add a composable floating organization side nav with collapse context (`SideNav`, `useSideNav`) and controlled or uncontrolled collapsed state.
- Add header and organization parts: `SideNavHeader`, `SideNavHeaderRow`, `SideNavTrigger`, `SideNavSectionLabel`, `SideNavBackButton`, `SideNavTitle`, `SideNavOrgSwitcher`, `SideNavOrgAvatar`, `SideNavOrgName`, `SideNavOrgSecondary`, `SideNavOrgCaret`, and `SideNavCollapsedOrgButton`.
- Add menu parts: `SideNavMenu`, `SideNavMenuItem`, `SideNavMenuButton`, `SideNavMenuLabel`, and `SideNavMenuBadge`, with optional `renderLink` for framework router links.
- Add `SideNavLevelSwap` and shared motion constants (`sideNavEaseDrawer`, `sideNavPanelDuration`, `sideNavLevelDuration`, `sideNavLevelTravelPx`) for host-owned nested levels with RTL-aware enter/exit travel.
