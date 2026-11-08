'use client';

import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type Ref,
  type TransitionEvent,
} from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { CaretDownIcon, ListIcon, XIcon } from '@phosphor-icons/react';
import { Button } from '@veli-design/react/button';
import { motion, useReducedMotion } from 'motion/react';

import { AppSwitcher, type SiteHeaderAppSwitcherLabels } from './app-switcher';
import type { SiteHeaderSwitcherItem } from './app-switcher-tiles';
import {
  HeaderLanguageMenu,
  schemeFromThemeOption,
  themeOptionFromScheme,
  type SiteHeaderColorScheme,
  type SiteHeaderControlsLabels,
  type SiteHeaderLanguageOption,
  type SiteHeaderThemeOption,
} from './header-controls';
import {
  COLLAPSE_MS,
  EASE_DRAWER_CSS,
  EXPAND_MS,
  fadeTransition,
  HEADER_DOCK_MS,
  mobileMenuCloseTransition,
  mobileMenuOpenTransition,
  OFFICIAL_BANNER_MS,
  surfaceGeometryTransitionFor,
  caretTransition,
} from './motion';
import { MobileNavPanel, ShellNavLink, type SiteHeaderNavItem } from './mobile-nav';
import { OfficialWebsiteBanner, type OfficialBannerLabels } from './official-banner';
import {
  HEADER_HEIGHT,
  OFFICIAL_BANNER_COLLAPSED_HEIGHT,
  useHeaderScrollMode,
} from './use-header-scroll';

export type {
  SiteHeaderNavItem,
  SiteHeaderSwitcherItem,
  SiteHeaderColorScheme,
  SiteHeaderLanguageOption,
  SiteHeaderThemeOption,
};

export type SiteHeaderLabels = SiteHeaderAppSwitcherLabels &
  SiteHeaderControlsLabels &
  OfficialBannerLabels & {
    openAppSwitcher: string;
    closeAppSwitcher: string;
    menuOpen: string;
    menuClose: string;
    siteMenu: string;
    primaryNav: string;
  };

/** Figma open panel: 24px top pad above the nav row */
const OPEN_PAD_TOP = 24;

function subscribeCanHover(onChange: () => void) {
  const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function useCanHover() {
  return useSyncExternalStore(
    subscribeCanHover,
    () => window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    () => false,
  );
}

function DesktopNav({
  navItems,
  hidden,
  prefersReducedMotion,
  primaryNavLabel,
  renderLink,
}: {
  navItems: SiteHeaderNavItem[];
  hidden: boolean;
  prefersReducedMotion: boolean | null;
  primaryNavLabel: string;
  renderLink?: (
    item: SiteHeaderNavItem,
    className: string,
    children: ReactNode,
    options?: { onClick?: () => void },
  ) => ReactNode;
}) {
  return (
    <motion.nav
      className="hidden min-w-0 flex-1 items-center lg:flex"
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : fadeTransition}
      style={{ pointerEvents: hidden ? 'none' : 'auto' }}
      aria-label={primaryNavLabel}
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
    >
      {navItems.map((item) => {
        const { href, label, external, current } = item;
        const className = current
          ? 'type-body-md-medium text-text-base-emphasis bg-primary-subtle duration-fast ease-out-quad inline-flex h-9 items-center justify-center rounded-4xl px-5 transition-[transform,background-color] active:scale-[1.02]'
          : 'type-body-md-medium text-text-base hover:bg-neutral-alpha-200 active:bg-neutral-alpha-300 duration-fast ease-out-quad inline-flex h-9 items-center justify-center rounded-2xl px-5 transition-[transform,background-color] active:scale-[1.02]';
        return renderLink ? (
          <span key={href} className={hidden ? 'pointer-events-none' : undefined}>
            {renderLink(item, className, label)}
          </span>
        ) : (
          <ShellNavLink
            key={href}
            href={href}
            external={external}
            tabIndex={hidden ? -1 : undefined}
            className={className}
            aria-current={current ? 'page' : undefined}
          >
            {label}
          </ShellNavLink>
        );
      })}
    </motion.nav>
  );
}

function HeaderLogoButton({
  logo,
  title,
  isOpen,
  isExpanded,
  isFloating,
  titleId,
  prefersReducedMotion,
  openLabel,
  closeLabel,
  onOpen,
  onClose,
  onHoverStart,
  onHoverEnd,
}: {
  logo: ReactNode;
  title?: string;
  isOpen: boolean;
  isExpanded: boolean;
  isFloating: boolean;
  titleId: string;
  prefersReducedMotion: boolean | null;
  openLabel: string;
  closeLabel: string;
  onOpen: () => void;
  onClose: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const canHover = useCanHover();
  const iconTransition = prefersReducedMotion ? { duration: 0 } : caretTransition;

  return (
    <AriaButton
      data-header-logo=""
      className={`hover:bg-button-secondary-subtle focus-visible:ring-border-focus pointer-events-auto flex min-w-0 cursor-pointer bg-transparent transition-colors focus-visible:ring-2 focus-visible:outline-none ${
        title ? 'items-center' : 'items-start'
      } ${
        isFloating
          ? `rounded-xl py-2 ps-2 pe-1 lg:ps-3 lg:pe-2 ${title ? 'gap-3 lg:gap-4' : 'shrink-0 gap-2'}`
          : `rounded-xl py-2 ps-2 pe-1 lg:ps-3 lg:pe-2 ${title ? 'gap-3 lg:gap-4' : 'shrink-0 gap-2'}`
      }`}
      aria-label={isOpen ? closeLabel : openLabel}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-controls={titleId}
      onPress={isOpen ? onClose : onOpen}
      onHoverStart={() => {
        if (canHover) onHoverStart();
      }}
      onHoverEnd={() => {
        if (canHover) onHoverEnd();
      }}
      onFocusChange={(focused) => {
        if (focused) onHoverStart();
        else onHoverEnd();
      }}
    >
      {title ? (
        <>
          <span className="relative block size-10 shrink-0" aria-hidden>
            {logo}
          </span>
          <span
            className={`text-text-base-emphasis line-clamp-2 min-w-0 text-start transition-[max-width,font-size] duration-300 ease-[var(--veli-header-ease-drawer,cubic-bezier(0.32,0.72,0,1))] motion-reduce:transition-none ${
              isFloating
                ? 'type-body-md-medium max-w-40 leading-[1.5] sm:max-w-52 xl:max-w-[242px]'
                : 'type-caption-medium max-w-[184px] leading-[1.34] tracking-[0.18px] lg:type-body-md-medium lg:max-w-[242px] lg:leading-[1.5] lg:tracking-normal'
            }`}
            aria-hidden
          >
            {title}
          </span>
        </>
      ) : (
        <span className="relative block shrink-0" aria-hidden>
          {logo}
        </span>
      )}
      <motion.span
        // Wordmark-only: lift onto the x-height (descenders pull the glyph-box center down).
        // Use margin so this does not fight the rotate transform.
        className={`text-text-base-strong inline-flex size-8 shrink-0 items-center justify-center ${
          title ? '' : '-mt-1.5'
        }`}
        animate={{
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
        transition={iconTransition}
      >
        <CaretDownIcon size={16} weight="bold" aria-hidden />
      </motion.span>
    </AriaButton>
  );
}

function HeaderActions({
  isOpen,
  isMobileMenuOpen,
  isFloating,
  prefersReducedMotion,
  onToggleMobileMenu,
  actions,
  labels,
}: {
  isOpen: boolean;
  isMobileMenuOpen: boolean;
  isFloating: boolean;
  prefersReducedMotion: boolean | null;
  onToggleMobileMenu: () => void;
  actions?: ReactNode;
  labels: Pick<SiteHeaderLabels, 'menuOpen' | 'menuClose'>;
}) {
  const iconTransition = prefersReducedMotion
    ? { duration: 0 }
    : isMobileMenuOpen
      ? mobileMenuOpenTransition
      : mobileMenuCloseTransition;

  return (
    <div
      className={`ms-auto flex shrink-0 items-center ${isFloating ? 'gap-2' : 'gap-2 lg:gap-4'}`}
    >
      <motion.div
        className={`flex items-center ${isFloating ? 'gap-2' : 'gap-2 lg:gap-4'}`}
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : fadeTransition}
        style={{ pointerEvents: isOpen ? 'none' : 'auto' }}
        aria-hidden={isOpen || undefined}
        inert={isOpen || undefined}
      >
        {actions}
        <span className="lg:hidden">
          <Button
            intent="secondary"
            appearance="transparent"
            size="md"
            iconOnly
            aria-label={isMobileMenuOpen ? labels.menuClose : labels.menuOpen}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-menu"
            onPress={onToggleMobileMenu}
          >
            <span className="relative inline-grid size-4 place-items-center">
              <motion.span
                className="col-start-1 row-start-1 inline-flex"
                initial={false}
                animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                transition={iconTransition}
                aria-hidden
              >
                <ListIcon size={16} weight="bold" />
              </motion.span>
              <motion.span
                className="col-start-1 row-start-1 inline-flex"
                initial={false}
                animate={{ opacity: isMobileMenuOpen ? 1 : 0 }}
                transition={iconTransition}
                aria-hidden
              >
                <XIcon size={16} weight="bold" />
              </motion.span>
            </span>
          </Button>
        </span>
      </motion.div>
    </div>
  );
}

/** Overlay flags the page shell uses to fade chrome and hide notices. */
export type SiteHeaderOverlayState = {
  /** App switcher is open (chrome fade). */
  switcherOpen: boolean;
  /** App switcher surface is still mounted during its exit (notice hide). */
  switcherRendered: boolean;
  /** Mobile menu is visible, including exit animation (chrome fade and notice hide). */
  mobileMenuVisible: boolean;
};

/** Imperative controls for host adapters that coordinate search and other overlays. */
export type SiteHeaderHandle = {
  closeOverlays: () => void;
  /** Focus the logo trigger unless another control already owns focus. */
  focusLogo: () => void;
};

export type SiteHeaderProps = {
  /** Brand mark rendered inside the logo trigger. */
  logo: ReactNode;
  /** Optional site name shown beside the logo (ministry mode). */
  title?: string;
  /** Pathname used to reset scroll mode on navigation. */
  pathname: string;
  desktopNavItems: SiteHeaderNavItem[];
  mobileNavItems: SiteHeaderNavItem[];
  apps: SiteHeaderSwitcherItem[];
  sites?: SiteHeaderSwitcherItem[];
  labels: SiteHeaderLabels;
  languages: SiteHeaderLanguageOption[];
  language: string;
  onLanguageChange: (id: string) => void;
  colorScheme: SiteHeaderColorScheme;
  onColorSchemeChange: (scheme: SiteHeaderColorScheme) => void;
  /** Called when the user activates an in-app switcher tile. */
  onNavigate: (href: string) => void;
  /** Flag image URL for the official-website banner. */
  flagSrc: string;
  /** Application-owned actions (search, sign-in). Fades while overlays are open. */
  actions?: ReactNode;
  /** Optional custom renderer for nav links (for example Next.js Link). */
  renderNavLink?: (
    item: SiteHeaderNavItem,
    className: string,
    children: ReactNode,
    options?: { onClick?: () => void },
  ) => ReactNode;
  className?: string;
  /** Default selected app-switcher tile. */
  defaultSelectedAppId?: string;
  /** Reports switcher and mobile-menu visibility for page-shell chrome coordination. */
  onOverlayChange?: (state: SiteHeaderOverlayState) => void;
  ref?: Ref<SiteHeaderHandle | null>;
};

export function SiteHeader({
  logo,
  title,
  pathname,
  desktopNavItems,
  mobileNavItems,
  apps,
  sites = [],
  labels,
  languages,
  language,
  onLanguageChange,
  colorScheme,
  onColorSchemeChange,
  onNavigate,
  flagSrc,
  actions,
  renderNavLink,
  className = '',
  defaultSelectedAppId,
  onOverlayChange,
  ref,
}: SiteHeaderProps) {
  const titleId = useId();
  const surfaceRef = useRef<HTMLElement>(null);
  const bannerExitRef = useRef<HTMLDivElement>(null);
  const unrenderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { mode: scrollMode, floatingMotion } = useHeaderScrollMode(
    pathname,
    surfaceRef,
    bannerExitRef,
  );
  const [openedFromFloating, setOpenedFromFloating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
  const [officialBannerExpanded, setOfficialBannerExpanded] = useState(false);
  const [officialBannerDetailsHeight, setOfficialBannerDetailsHeight] = useState(0);
  const [isOfficialBannerResizing, setIsOfficialBannerResizing] = useState(false);
  const [menuPathname, setMenuPathname] = useState(pathname);

  // Close the mobile menu when the application navigates.
  if (pathname !== menuPathname) {
    setMenuPathname(pathname);
    if (isMobileMenuOpen || isMobileMenuVisible) {
      setIsMobileMenuOpen(false);
      setIsMobileMenuVisible(false);
    }
  }

  // Collapse the official banner once the header leaves the page-top stack.
  if (scrollMode !== 'top' && officialBannerExpanded) {
    setOfficialBannerExpanded(false);
  }

  const isChromeHidden = isOpen || isMobileMenuVisible;
  const overlaysOpen = isOpen || isMobileMenuVisible;
  const floatingLayout = scrollMode === 'floating' || scrollMode === 'hidden';
  const showFloatingChrome = floatingLayout && !overlaysOpen;
  const isHeaderHidden = (scrollMode === 'hidden' || scrollMode === 'hidden-top') && !overlaysOpen;
  const isDockingAtTop =
    scrollMode === 'top' && !isHeaderHidden && !isRendered && !isMobileMenuVisible;
  const anchorExpandedSurfaceToStart = isRendered && !openedFromFloating;
  const officialBannerHidden = floatingLayout || isRendered || isMobileMenuOpen;
  const officialBannerHeight =
    OFFICIAL_BANNER_COLLAPSED_HEIGHT + (officialBannerExpanded ? officialBannerDetailsHeight : 0);
  const headerTopOffset =
    !isExpanded && !floatingLayout ? (isMobileMenuOpen ? 0 : officialBannerHeight + 4) : undefined;
  const layoutSpacerHeight =
    scrollMode === 'top' && !isRendered && isMobileMenuOpen
      ? HEADER_HEIGHT
      : officialBannerHeight + 4 + HEADER_HEIGHT;
  const selectedTheme = themeOptionFromScheme(colorScheme);

  const geometryTransition =
    (isOpen || isRendered) && !prefersReducedMotion
      ? surfaceGeometryTransitionFor(isOpen)
      : undefined;
  const surfaceDockingTransition =
    isDockingAtTop && !prefersReducedMotion
      ? [
          `top ${HEADER_DOCK_MS}ms ${EASE_DRAWER_CSS}`,
          `width ${HEADER_DOCK_MS}ms ${EASE_DRAWER_CSS}`,
          `max-width ${HEADER_DOCK_MS}ms ${EASE_DRAWER_CSS}`,
          `border-radius ${HEADER_DOCK_MS}ms ${EASE_DRAWER_CSS}`,
          `background-color ${HEADER_DOCK_MS}ms ${EASE_DRAWER_CSS}`,
          `box-shadow ${HEADER_DOCK_MS}ms ${EASE_DRAWER_CSS}`,
          `backdrop-filter ${HEADER_DOCK_MS}ms ${EASE_DRAWER_CSS}`,
        ].join(', ')
      : undefined;
  const navRowTransition =
    (isOpen || isRendered) && !prefersReducedMotion
      ? [
          `padding-inline ${isOpen ? EXPAND_MS : COLLAPSE_MS}ms ${EASE_DRAWER_CSS}`,
          `gap ${isOpen ? EXPAND_MS : COLLAPSE_MS}ms ${EASE_DRAWER_CSS}`,
        ].join(', ')
      : isDockingAtTop && !prefersReducedMotion
        ? [
            `padding-inline ${HEADER_DOCK_MS}ms ${EASE_DRAWER_CSS}`,
            `gap ${HEADER_DOCK_MS}ms ${EASE_DRAWER_CSS}`,
          ].join(', ')
        : undefined;
  const headerTopTransition =
    !prefersReducedMotion && !isExpanded && !floatingLayout && !isOpen && !isRendered
      ? `top ${isOfficialBannerResizing ? COLLAPSE_MS : OFFICIAL_BANNER_MS}ms ${EASE_DRAWER_CSS}`
      : undefined;
  const layoutSpacerTransition = prefersReducedMotion
    ? undefined
    : `height ${isOfficialBannerResizing ? COLLAPSE_MS : OFFICIAL_BANNER_MS}ms ${EASE_DRAWER_CSS}`;

  const clearUnrenderTimeout = useCallback(() => {
    if (unrenderTimeoutRef.current == null) return;
    clearTimeout(unrenderTimeoutRef.current);
    unrenderTimeoutRef.current = null;
  }, []);

  const openMenu = useCallback(() => {
    clearUnrenderTimeout();
    setOpenedFromFloating(floatingLayout);
    setOfficialBannerExpanded(false);
    setIsMobileMenuOpen(false);
    setIsMobileMenuVisible(false);
    setIsRendered(true);
    setIsOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsExpanded(true));
    });
  }, [clearUnrenderTimeout, floatingLayout]);

  const focusLogo = useCallback(() => {
    const active = document.activeElement;
    if (!active || active === document.body || surfaceRef.current?.contains(active)) {
      surfaceRef.current
        ?.querySelector<HTMLElement>('[data-header-logo]')
        ?.focus({ preventScroll: true });
    }
  }, []);

  const closeMenu = useCallback(() => {
    focusLogo();
    setIsExpanded(false);
    setIsOpen(false);
    if (prefersReducedMotion) {
      clearUnrenderTimeout();
      setIsRendered(false);
      return;
    }
    clearUnrenderTimeout();
    // Fallback if the surface never emits transitionend (some headless runs).
    unrenderTimeoutRef.current = setTimeout(() => {
      unrenderTimeoutRef.current = null;
      setIsRendered(false);
    }, COLLAPSE_MS + 50);
  }, [clearUnrenderTimeout, focusLogo, prefersReducedMotion]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const closeOverlays = useCallback(() => {
    closeMenu();
    closeMobileMenu();
  }, [closeMenu, closeMobileMenu]);

  useImperativeHandle(
    ref,
    () => ({
      closeOverlays,
      focusLogo,
    }),
    [closeOverlays, focusLogo],
  );

  useEffect(() => {
    onOverlayChange?.({
      switcherOpen: isOpen,
      switcherRendered: isRendered,
      mobileMenuVisible: isMobileMenuVisible,
    });
  }, [isOpen, isRendered, isMobileMenuVisible, onOverlayChange]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((open) => {
      if (open) {
        return false;
      }
      closeMenu();
      setOfficialBannerExpanded(false);
      setIsMobileMenuVisible(true);
      return true;
    });
  }, [closeMenu]);

  const onSurfaceTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLElement>) => {
      if (event.target !== event.currentTarget) return;
      if (event.propertyName !== 'height') return;
      if (!isExpanded) {
        clearUnrenderTimeout();
        setIsRendered(false);
        focusLogo();
      }
    },
    [clearUnrenderTimeout, focusLogo, isExpanded],
  );

  useEffect(() => {
    if (!isOpen && !isMobileMenuVisible) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (isOpen) closeMenu();
      else if (isMobileMenuOpen) closeMobileMenu();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, isMobileMenuVisible, isMobileMenuOpen, closeMenu, closeMobileMenu]);

  useEffect(() => {
    if (isExpanded) {
      surfaceRef.current?.focus({ preventScroll: true });
    }
  }, [isExpanded]);

  useEffect(() => {
    if (!overlaysOpen) return;
    for (const el of [surfaceRef.current, bannerExitRef.current]) {
      el?.style.removeProperty('transform');
    }
  }, [overlaysOpen]);

  const updateOfficialBannerDetailsHeight = useCallback((height: number) => {
    setOfficialBannerDetailsHeight(height);
  }, []);

  const onThemeChange = useCallback(
    (option: SiteHeaderThemeOption) => {
      onColorSchemeChange(schemeFromThemeOption(option));
    },
    [onColorSchemeChange],
  );

  const navRowPadding = isExpanded
    ? 'gap-2 px-6 xl:px-12'
    : floatingLayout
      ? 'gap-2 ps-2 pe-2 lg:gap-10 lg:ps-6 lg:pe-3.5'
      : 'gap-2 ps-2 pe-4 lg:gap-12 lg:px-8 lg:ps-5';

  return (
    <div className={`relative ${className}`}>
      <div ref={bannerExitRef} className="fixed inset-x-0 top-0 z-50">
        <OfficialWebsiteBanner
          expanded={officialBannerExpanded}
          hidden={officialBannerHidden}
          flagSrc={flagSrc}
          languages={languages}
          language={language}
          onLanguageChange={onLanguageChange}
          labels={labels}
          onDetailsHeightChange={updateOfficialBannerDetailsHeight}
          onResizeAnimationComplete={() => setIsOfficialBannerResizing(false)}
          onToggle={() => {
            setIsOfficialBannerResizing(true);
            setOfficialBannerExpanded((expanded) => !expanded);
          }}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>

      {isRendered ? (
        <motion.div
          className="bg-secondary-subtle/80 fixed inset-0 z-40 p-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: isExpanded ? 1 : 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : fadeTransition}
          onClick={closeMenu}
          aria-hidden
        />
      ) : null}

      <header
        ref={surfaceRef}
        data-header-surface=""
        tabIndex={isExpanded ? -1 : undefined}
        role={isExpanded ? 'dialog' : undefined}
        aria-modal={isExpanded || undefined}
        aria-labelledby={isExpanded ? titleId : undefined}
        inert={isHeaderHidden || undefined}
        aria-hidden={isHeaderHidden || undefined}
        onTransitionEnd={onSurfaceTransitionEnd}
        className={[
          'bg-surface-raised fixed inset-x-0 z-40 mx-auto flex flex-col outline-none motion-reduce:transition-none',
          isExpanded || isRendered ? 'overflow-hidden' : 'overflow-visible',
          isOpen || isMobileMenuVisible ? 'z-60' : 'z-40',
          isExpanded
            ? openedFromFloating
              ? 'top-2 h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-[1464px] lg:top-4 lg:h-[calc(100dvh-1.5rem)] lg:w-[calc(100%-4rem)]'
              : 'top-2 h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-[1496px]'
            : floatingLayout
              ? 'top-2 h-[72px] w-[calc(100%-1rem)] max-w-[1464px] lg:top-4 lg:w-[calc(100%-4rem)]'
              : 'top-0 h-[72px] w-full max-w-[100vw]',
          isExpanded ? 'rounded-[24px]' : floatingLayout ? 'rounded-[36px]' : 'rounded-none',
          isExpanded || showFloatingChrome
            ? 'shadow-[0_24px_64px_var(--veli-color-effects-shadow-depth-200)]'
            : 'shadow-none',
          showFloatingChrome && !isExpanded
            ? 'bg-surface-raised/90 shadow-lg backdrop-blur-[18px]'
            : '',
          !isExpanded && !showFloatingChrome ? 'bg-transparent' : '',
          isHeaderHidden
            ? floatingLayout
              ? 'pointer-events-none -translate-y-1 opacity-0'
              : 'pointer-events-none'
            : 'opacity-100',
          !isOpen && !isRendered && floatingLayout && floatingMotion
            ? 'transition-[transform,opacity] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)]'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          insetInlineStart: anchorExpandedSurfaceToStart && isExpanded ? '0.5rem' : 0,
          insetInlineEnd: anchorExpandedSurfaceToStart ? 'auto' : 0,
          marginInline: anchorExpandedSurfaceToStart ? 0 : 'auto',
          paddingTop: isExpanded ? OPEN_PAD_TOP : 0,
          top: headerTopOffset,
          transition: geometryTransition ?? surfaceDockingTransition ?? headerTopTransition,
        }}
      >
        <div
          className={`flex h-[72px] shrink-0 items-center ${navRowPadding}`}
          style={{ transition: navRowTransition }}
        >
          <HeaderLogoButton
            logo={logo}
            title={title}
            isOpen={isOpen}
            isExpanded={isExpanded}
            isFloating={floatingLayout && !isExpanded}
            titleId={titleId}
            prefersReducedMotion={prefersReducedMotion}
            openLabel={labels.openAppSwitcher}
            closeLabel={labels.closeAppSwitcher}
            onOpen={openMenu}
            onClose={closeMenu}
            onHoverStart={() => {}}
            onHoverEnd={() => {}}
          />

          <DesktopNav
            navItems={desktopNavItems}
            hidden={isChromeHidden}
            prefersReducedMotion={prefersReducedMotion}
            primaryNavLabel={labels.primaryNav}
            renderLink={renderNavLink}
          />

          <HeaderActions
            isOpen={isOpen}
            isMobileMenuOpen={isMobileMenuOpen}
            isFloating={floatingLayout && !isExpanded}
            prefersReducedMotion={prefersReducedMotion}
            onToggleMobileMenu={toggleMobileMenu}
            actions={actions}
            labels={labels}
          />
        </div>

        {isRendered ? (
          <motion.div
            className="flex min-h-0 flex-1 flex-col"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={
              prefersReducedMotion
                ? { opacity: isExpanded ? 1 : 0 }
                : {
                    opacity: isExpanded ? 1 : 0,
                    y: isExpanded ? 0 : -12,
                  }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    ...fadeTransition,
                    duration: isExpanded ? fadeTransition.duration : 0.2,
                    delay: isExpanded ? 0.1 : 0,
                  }
            }
            style={{ pointerEvents: isExpanded ? 'auto' : 'none' }}
            aria-hidden={!isExpanded || undefined}
            inert={!isExpanded || undefined}
          >
            <AppSwitcher
              titleId={titleId}
              onClose={closeMenu}
              apps={apps}
              sites={sites}
              labels={labels}
              onNavigate={onNavigate}
              defaultSelectedId={defaultSelectedAppId}
            />
          </motion.div>
        ) : null}
      </header>

      <div
        className="shrink-0"
        style={{
          height: layoutSpacerHeight,
          transition: layoutSpacerTransition,
        }}
        aria-hidden
      />

      <MobileNavPanel
        navItems={mobileNavItems}
        open={isMobileMenuOpen}
        headerHeight={HEADER_HEIGHT}
        selectedTheme={selectedTheme}
        languages={languages}
        language={language}
        onLanguageChange={onLanguageChange}
        prefersReducedMotion={prefersReducedMotion}
        onClose={closeMobileMenu}
        onExitComplete={() => setIsMobileMenuVisible(false)}
        onThemeChange={onThemeChange}
        labels={labels}
        renderLink={renderNavLink}
      />
    </div>
  );
}

// Re-export language menu for apps that want it outside the header actions slot.
export { HeaderLanguageMenu };
