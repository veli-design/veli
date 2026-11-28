export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;
export const EASE_DRAWER_CSS = 'cubic-bezier(0.32, 0.72, 0, 1)';

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
/** CSS form of EASE_OUT — do not use Veli `--veli-ease-out` (different curve). */
export const EASE_OUT_CSS = 'cubic-bezier(0.23, 1, 0.32, 1)';

/** Strong ease-out for surfaces that appear in place (menu panel, popovers). */
export const EASE_SPEC = [0.19, 1, 0.22, 1] as const;

/** Balanced ease-in-out curve for the search morph close. The entrance uses a spring instead. */
export const EASE_SEARCH_MORPH = [0.42, 0, 0.58, 1] as const;

/**
 * Underdamped entrance spring. Bounce stays low so the overshoot is only a few pixels;
 * `SEARCH_MORPH_OPEN_OVERSHOOT_AT` is the progress past 1 that maps to the full offset.
 */
export const searchMorphOpenSpring = {
  type: 'spring' as const,
  visualDuration: 0.38,
  bounce: 0.22,
};
export const SEARCH_MORPH_OPEN_OVERSHOOT_PX = 6;
export const SEARCH_MORPH_OPEN_OVERSHOOT_AT = 0.02;

export const DURATION = {
  fade: 0.3,
  chromeFadeOut: 0.14,
  switcherContentEnter: 0.28,
  switcherContentExit: 0.14,
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
  officialBannerHide: 0.14,
  officialBannerHideExpanded: 0.11,
  officialBannerDetails: 0.28,
  headerDock: 0.3,
  navStagger: 0,
  searchFocus: 0.2,
  searchResultMove: 0.2,
  searchResultEnter: 0.15,
  searchResultExit: 0.12,
  searchMorphClose: 0.29,
  searchBackdropOpen: 0.2,
  searchBackdropClose: 0.15,
  searchTrayEnter: 0.18,
  searchTrayExit: 0.1,
  searchReducedFade: 0.16,
} as const;

export const EXPAND_MS = DURATION.panelExpand * 1000;
export const COLLAPSE_MS = DURATION.panelCollapse * 1000;
export const HEADER_DOCK_MS = DURATION.headerDock * 1000;
export const OFFICIAL_BANNER_MS = DURATION.officialBanner * 1000;
export const SEARCH_MORPH_CLOSE_MS = DURATION.searchMorphClose * 1000;

export const fadeTransition = { duration: DURATION.fade, ease: EASE_DRAWER };
export const chromeFadeOutTransition = { duration: DURATION.chromeFadeOut, ease: EASE_OUT };
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
export const officialBannerHideTransition = {
  duration: DURATION.officialBannerHide,
  ease: EASE_OUT,
};
export const officialBannerHideExpandedTransition = {
  duration: DURATION.officialBannerHideExpanded,
  ease: EASE_OUT,
};
export const officialBannerShowTransition = {
  duration: DURATION.panelCollapse,
  ease: EASE_DRAWER,
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

export const searchMorphCloseTransition = {
  duration: DURATION.searchMorphClose,
  ease: EASE_SEARCH_MORPH,
};
export const searchFallbackOpenTransition = {
  duration: DURATION.searchBackdropOpen,
  ease: EASE_OUT,
};
export const searchFallbackCloseTransition = {
  duration: DURATION.searchBackdropClose,
  ease: EASE_OUT,
};
export const searchReducedFadeTransition = {
  duration: DURATION.searchReducedFade,
  ease: EASE_OUT,
};
export const searchTrayEnterTransition = {
  duration: DURATION.searchTrayEnter,
  ease: EASE_OUT,
};
export const searchTrayExitTransition = {
  duration: DURATION.searchTrayExit,
  ease: EASE_OUT,
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
    `padding-top ${ms}ms ${EASE_DRAWER_CSS}`,
  ].join(', ');
}

/**
 * Visual chrome (fill, blur, and shadow) painted by the header underlay. It transitions on
 * the underlay element, so it is separate from the geometry transition on the header itself.
 */
export function surfaceChromeTransitionFor(open: boolean) {
  const ms = open ? EXPAND_MS : COLLAPSE_MS;
  // Delay the card shadow until halfway through entrance so it lands as the card rests;
  // clear it in the first half of collapse so no shadow edge streaks upward.
  const shadowMs = Math.round(ms * 0.5);
  const shadowDelay = open ? shadowMs : 0;
  return [
    `box-shadow ${shadowMs}ms ${EASE_OUT_CSS} ${shadowDelay}ms`,
    `background-color ${ms}ms ${EASE_DRAWER_CSS}`,
    `backdrop-filter ${ms}ms ${EASE_DRAWER_CSS}`,
  ].join(', ');
}
