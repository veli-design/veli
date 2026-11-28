'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ButtonContext, LinkContext } from 'react-aria-components';
import { Divider } from '@veli-design/react/divider';

import {
  HeaderLanguageMenu,
  ThemeSegmentedControl,
  type SiteHeaderLanguageOption,
  type SiteHeaderThemeOption,
} from './header-controls';
import {
  DURATION,
  mobileMenuCloseTransition,
  mobileMenuOpenTransition,
  navItemEntranceTransition,
} from './motion';
export type SiteHeaderNavItem = {
  href: string;
  label: string;
  current?: boolean;
  external?: boolean;
};

export function ShellNavLink({
  href,
  external,
  className,
  children,
  ...rest
}: {
  href: string;
  external?: boolean;
  className: string;
  children: ReactNode;
} & Pick<ComponentProps<'a'>, 'tabIndex' | 'onClick' | 'aria-current'>) {
  if (external) {
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}

export type MobileNavLabels = {
  siteMenu: string;
  primaryNav: string;
  languageLabel: string;
  languageChange: string;
  themeLabel: string;
  themeLight: string;
  themeDark: string;
  themeAuto: string;
};

/**
 * Mobile-menu actions. A React node closes the menu when a button or link is
 * activated. A function receives `closeMenu` and decides. `null` shows none.
 */
export type SiteHeaderMobileActions =
  | ReactNode
  | ((controls: { closeMenu: () => void }) => ReactNode);

function shouldCloseMenuOnAction(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  const control = target.closest('button, a[href], [role="button"], [role="link"]');
  if (!control) return false;
  if (control.matches(':disabled, [aria-disabled="true"], [data-disabled], [data-pending]')) {
    return false;
  }
  if (control.hasAttribute('aria-haspopup')) return false;
  return true;
}

/**
 * True from `sm` up, where the bar renders the header actions. `SiteHeader`
 * provides it, so the bar and the menu read one breakpoint value.
 */
const ActionsInBarContext = createContext(false);

/**
 * Passes the bar/menu split down to the menu. Context, not a prop: `AnimatePresence`
 * keeps the exiting menu's last props, so a prop would stay stale during the exit.
 * Context still reaches the exiting subtree, so its copy unmounts in the same
 * commit the bar's copy mounts.
 */
export const ActionsInBarProvider = ActionsInBarContext.Provider;

/** Renders the menu's actions below `sm`, and nothing from `sm` up. */
function MobileMenuActions({
  actions,
  mobileActions,
  navCount,
  onClose,
  prefersReducedMotion,
}: {
  actions?: ReactNode;
  mobileActions?: SiteHeaderMobileActions;
  navCount: number;
  onClose: () => void;
  prefersReducedMotion: boolean | null;
}) {
  const actionsInBar = useContext(ActionsInBarContext);
  const resolvedActions = actionsInBar
    ? null
    : mobileActions !== undefined
      ? typeof mobileActions === 'function'
        ? mobileActions({ closeMenu: onClose })
        : mobileActions
      : actions;
  const autoCloseActions = typeof mobileActions !== 'function';
  const hasActions = Boolean(resolvedActions);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = actionsRef.current;
    if (!autoCloseActions || !hasActions || !root) return;
    const onClick = (event: MouseEvent) => {
      if (shouldCloseMenuOnAction(event.target)) onClose();
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [autoCloseActions, hasActions, onClose]);

  if (!resolvedActions) return null;

  return (
    <motion.div
      ref={actionsRef}
      data-mobile-menu-actions=""
      className="flex shrink-0 flex-wrap items-center gap-2 px-5 pb-2"
      initial={prefersReducedMotion ? false : { opacity: 0, transform: 'translateY(-8px)' }}
      animate={{ opacity: 1, transform: 'translateY(0px)' }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              ...navItemEntranceTransition,
              delay: DURATION.navStagger * navCount,
            }
      }
    >
      {autoCloseActions ? (
        <ButtonContext.Provider
          value={{
            onPress: (event) => {
              if (shouldCloseMenuOnAction(event.target)) onClose();
            },
          }}
        >
          <LinkContext.Provider
            value={{
              onPress: (event) => {
                if (shouldCloseMenuOnAction(event.target)) onClose();
              },
            }}
          >
            {resolvedActions}
          </LinkContext.Provider>
        </ButtonContext.Provider>
      ) : (
        resolvedActions
      )}
    </motion.div>
  );
}

export function MobileNavPanel({
  navItems,
  open,
  headerHeight,
  selectedTheme,
  languages,
  language,
  onLanguageChange,
  prefersReducedMotion,
  onClose,
  onExitComplete,
  onThemeChange,
  labels,
  renderLink,
  actions,
  mobileActions,
  searchAction,
}: {
  navItems: SiteHeaderNavItem[];
  open: boolean;
  headerHeight: number;
  selectedTheme: SiteHeaderThemeOption;
  languages: SiteHeaderLanguageOption[];
  language: string;
  onLanguageChange: (id: string) => void;
  prefersReducedMotion: boolean | null;
  onClose: () => void;
  onExitComplete: () => void;
  onThemeChange: (option: SiteHeaderThemeOption) => void;
  labels: MobileNavLabels;
  /** Bar actions. Used in the menu when `mobileActions` is omitted. */
  actions?: ReactNode;
  /** Menu actions below `sm`. Overrides `actions` when set, including `null`. */
  mobileActions?: SiteHeaderMobileActions;
  searchAction?: ReactNode;
  renderLink?: (
    item: SiteHeaderNavItem,
    className: string,
    children: ReactNode,
    options?: { onClick?: () => void },
  ) => ReactNode;
}) {
  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {open ? (
        <motion.div
          key="mobile-nav"
          id="mobile-nav-menu"
          role="dialog"
          aria-modal="true"
          aria-label={labels.siteMenu}
          className="bg-surface-raised fixed inset-0 z-50 flex h-dvh w-full origin-top flex-col gap-2.5 rounded-b-[32px] pb-5 outline-none min-[1121px]:hidden"
          initial={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, transform: 'translateY(-12px) scale(0.98)' }
          }
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 1, transform: 'translateY(0px) scale(1)' }
          }
          exit={
            prefersReducedMotion
              ? { opacity: 0, transition: { duration: 0 } }
              : {
                  opacity: 0,
                  transform: 'translateY(-12px) scale(0.98)',
                  transition: mobileMenuCloseTransition,
                }
          }
          transition={prefersReducedMotion ? { duration: 0 } : mobileMenuOpenTransition}
        >
          <div className="shrink-0" style={{ height: headerHeight }} aria-hidden />

          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-5 py-2.5">
            <nav className="-mx-5 flex flex-col" aria-label={labels.primaryNav}>
              {navItems.map((item, index) => {
                const { href, label, external, current } = item;
                const className = current
                  ? 'type-body-md-medium border-accent-500 text-text-base-emphasis bg-surface-base flex w-full items-center border-s-4 px-5 py-4'
                  : 'type-body-md-medium text-text-base-strong flex w-full items-center border-s-4 border-transparent px-5 py-4';
                return (
                  <motion.div
                    key={href}
                    className="w-full"
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, transform: 'translateY(-8px)' }
                    }
                    animate={{ opacity: 1, transform: 'translateY(0px)' }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { ...navItemEntranceTransition, delay: DURATION.navStagger * index }
                    }
                  >
                    {renderLink ? (
                      renderLink(item, className, label, { onClick: onClose })
                    ) : (
                      <ShellNavLink
                        href={href}
                        external={external}
                        onClick={onClose}
                        className={className}
                        aria-current={current ? 'page' : undefined}
                      >
                        {label}
                      </ShellNavLink>
                    )}
                  </motion.div>
                );
              })}
            </nav>
          </div>

          {searchAction ? <div className="shrink-0 px-5">{searchAction}</div> : null}

          <MobileMenuActions
            actions={actions}
            mobileActions={mobileActions}
            navCount={navItems.length}
            onClose={onClose}
            prefersReducedMotion={prefersReducedMotion}
          />

          <Divider appearance="muted" className="w-full shrink-0" />

          <motion.div
            className="flex shrink-0 items-center justify-between px-5 pt-3.5"
            initial={prefersReducedMotion ? false : { opacity: 0, transform: 'translateY(-8px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    ...navItemEntranceTransition,
                    delay: DURATION.navStagger * navItems.length,
                  }
            }
          >
            <ThemeSegmentedControl
              iconOnly
              selectedTheme={selectedTheme}
              onThemeChange={onThemeChange}
              labels={labels}
            />

            <HeaderLanguageMenu
              variant="pill"
              languages={languages}
              language={language}
              onLanguageChange={onLanguageChange}
              labels={labels}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
