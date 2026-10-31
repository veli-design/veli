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
