export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;
export const EASE_DRAWER_CSS = 'cubic-bezier(0.32, 0.72, 0, 1)';

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Strong ease-out for surfaces that appear in place (menu panel, popovers). */
export const EASE_SPEC = [0.19, 1, 0.22, 1] as const;

export const DURATION = {
  fade: 0.3,
  menuOpen: 0.32,
  menuClose: 0.22,
  panelExpand: 0.48,
  panelCollapse: 0.28,
  logoSwap: 0.2,
  tiles: 0.3,
  caret: 0.22,
  infoPanel: 0.15,
  navItem: 0.24,
  officialBanner: 0.24,
  officialBannerDetails: 0.28,
  headerDock: 0.3,
  navStagger: 0,
  searchFocus: 0.2,
  searchResultMove: 0.2,
  searchResultEnter: 0.15,
  searchResultExit: 0.12,
} as const;

export const EXPAND_MS = DURATION.panelExpand * 1000;
export const COLLAPSE_MS = DURATION.panelCollapse * 1000;
export const HEADER_DOCK_MS = DURATION.headerDock * 1000;
export const OFFICIAL_BANNER_MS = DURATION.officialBanner * 1000;

export const fadeTransition = { duration: DURATION.fade, ease: EASE_DRAWER };
export const mobileMenuOpenTransition = { duration: DURATION.menuOpen, ease: EASE_SPEC };
export const mobileMenuCloseTransition = { duration: DURATION.menuClose, ease: EASE_SPEC };
export const logoSwapTransition = { duration: DURATION.logoSwap, ease: EASE_DRAWER };
export const expandTilesTransition = { duration: DURATION.tiles, ease: EASE_DRAWER };
export const caretTransition = { duration: DURATION.caret, ease: EASE_DRAWER };
export const infoPanelFadeTransition = { duration: DURATION.infoPanel, ease: EASE_DRAWER };
export const navItemEntranceTransition = { duration: DURATION.navItem, ease: EASE_SPEC };
export const officialBannerTransition = {
  duration: DURATION.officialBanner,
  ease: EASE_SPEC,
};
export const officialBannerDetailsTransition = {
  duration: DURATION.officialBannerDetails,
  ease: EASE_DRAWER,
};
export const searchResultTransition = {
  duration: DURATION.searchResultEnter,
  ease: EASE_DRAWER,
  layout: { duration: DURATION.searchResultMove, ease: EASE_DRAWER },
};
export const searchResultExitTransition = {
  duration: DURATION.searchResultExit,
  ease: EASE_DRAWER,
};
export const searchResultReducedTransition = {
  duration: DURATION.searchResultEnter,
  ease: EASE_DRAWER,
};

/** Unified header surface geometry for centered and inline-start morphs. */
export function surfaceGeometryTransitionFor(open: boolean) {
  const ms = open ? EXPAND_MS : COLLAPSE_MS;
  return [
    `inset-inline-start ${ms}ms ${EASE_DRAWER_CSS}`,
    `top ${ms}ms ${EASE_DRAWER_CSS}`,
    `width ${ms}ms ${EASE_DRAWER_CSS}`,
    `max-width ${ms}ms ${EASE_DRAWER_CSS}`,
    `height ${ms}ms ${EASE_DRAWER_CSS}`,
    `border-radius ${ms}ms ${EASE_DRAWER_CSS}`,
    `box-shadow ${ms}ms ${EASE_DRAWER_CSS}`,
    `padding-top ${ms}ms ${EASE_DRAWER_CSS}`,
    `background-color ${ms}ms ${EASE_DRAWER_CSS}`,
    `backdrop-filter ${ms}ms ${EASE_DRAWER_CSS}`,
  ].join(', ');
}
