## 0.1.0

### Added

- Add a composable floating organization side nav with collapse context (`SideNav`, `useSideNav`) and controlled or uncontrolled collapsed state.
- Add header and organization parts: `SideNavHeader`, `SideNavHeaderRow`, `SideNavTrigger`, `SideNavSectionLabel`, `SideNavBackButton`, `SideNavTitle`, `SideNavOrgSwitcher`, `SideNavOrgAvatar`, `SideNavOrgName`, `SideNavOrgSecondary`, `SideNavOrgCaret`, and `SideNavCollapsedOrgButton`.
- Add menu parts: `SideNavMenu`, `SideNavMenuItem`, `SideNavMenuButton`, `SideNavMenuLabel`, and `SideNavMenuBadge`, with optional `renderLink` for framework router links.
- Add `SideNavLevelSwap` and shared motion constants (`sideNavEaseDrawer`, `sideNavPanelDuration`, `sideNavLevelDuration`, `sideNavLevelTravelPx`) for host-owned nested levels with RTL-aware enter/exit travel.
