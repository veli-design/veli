'use client';

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { Button as AriaButton, Link as AriaLink } from 'react-aria-components';
import { CaretDownIcon, CaretLeftIcon, SidebarSimpleIcon } from '@phosphor-icons/react';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  type Transition,
} from 'motion/react';
import { Avatar, type AvatarAppearance, type AvatarSize } from '@tradenetcorp/veli-ui/avatar';
import { Badge } from '@tradenetcorp/veli-ui/badge';
import { Button } from '@tradenetcorp/veli-ui/button';
import type { LinkProps } from '@tradenetcorp/veli-ui/link';

const ROOT_NAME = 'SideNav';

/** Figma expanded frame width. */
const EXPANDED_WIDTH = 264;
/** Figma collapsed icon rail width. */
const COLLAPSED_WIDTH = 68;

/** Shared drawer ease — collapse and host level swaps. */
export const sideNavEaseDrawer = [0.32, 0.72, 0, 1] as const;
/** Panel collapse / expand duration in seconds. */
export const sideNavPanelDuration = 0.4;
/** Nested level (org → Access) swap duration in seconds. */
export const sideNavLevelDuration = 0.22;
/** Nested level horizontal travel in pixels. */
export const sideNavLevelTravelPx = 16;

const EASE_DRAWER = sideNavEaseDrawer;
const PANEL_DURATION = sideNavPanelDuration;
const PANEL_DURATION_MS = `${PANEL_DURATION * 1000}ms`;
const PANEL_EASE_CSS = 'cubic-bezier(0.32, 0.72, 0, 1)';
const REDUCED_MOTION_OPACITY_MS = '150ms';

type SideNavContextValue = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
  renderLink?: LinkProps['render'];
  layoutTransition: Transition;
};

const SideNavContext = createContext<SideNavContextValue | null>(null);

/**
 * Reads collapse state from the nearest {@link SideNav}.
 * Must be called from a descendant of `SideNav`.
 */
export function useSideNav(): SideNavContextValue {
  const context = useContext(SideNavContext);
  if (context == null) {
    throw new Error(`\`${ROOT_NAME}\` parts must be used within \`${ROOT_NAME}\`.`);
  }
  return context;
}

function ExpandingCopy({
  collapsed,
  className = '',
  children,
}: {
  collapsed: boolean;
  className?: string;
  children: ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <span
      aria-hidden={collapsed || undefined}
      className={`min-w-0 max-w-[12rem] overflow-hidden whitespace-nowrap transition-opacity ${
        collapsed ? 'opacity-0' : 'opacity-100'
      } ${className}`}
      style={{
        transitionDuration: prefersReducedMotion ? REDUCED_MOTION_OPACITY_MS : PANEL_DURATION_MS,
        transitionTimingFunction: PANEL_EASE_CSS,
      }}
    >
      {children}
    </span>
  );
}

function navItemClassName(selected: boolean, collapsed: boolean) {
  return [
    'type-body-md-medium flex h-11 w-full max-w-full cursor-pointer items-center border-0 px-3 py-2 text-start font-sans no-underline outline-none',
    // Color only — rail width + flex-shrink on the label move icons without
    // layout-property tweens on the pill (gap/width/max-width).
    'rounded-full transition-[background-color,color]',
    'data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-bg-surface-raised',
    'forced-colors:data-[focus-visible]:outline-solid forced-colors:data-[focus-visible]:outline-2 forced-colors:data-[focus-visible]:outline-offset-2',
    // Snap gap when collapsed so a 44px rail is not eaten by gap-3; do not tween.
    collapsed ? 'gap-0' : 'gap-3',
    selected
      ? 'bg-button-primary-subtle text-primary-strong [&_svg]:text-icon-primary'
      : 'bg-transparent text-base-strong [&_svg]:text-icon-base data-[hovered]:bg-neutral-alpha-200 data-[pressed]:bg-neutral-alpha-300',
  ].join(' ');
}

function textFromNode(node: ReactNode): string | undefined {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    const parts = node.map(textFromNode).filter(Boolean);
    return parts.length > 0 ? parts.join('') : undefined;
  }
  if (isValidElement<{ children?: ReactNode }>(node) && node.props.children != null) {
    return textFromNode(node.props.children);
  }
  return undefined;
}

export type SideNavProps = {
  children: ReactNode;
  /** Accessible name for the navigation landmark. */
  'aria-label': string;
  /** Controlled collapsed state. Omit to let the panel store it. */
  isCollapsed?: boolean;
  /** Uncontrolled initial collapsed state when `isCollapsed` is omitted. */
  defaultCollapsed?: boolean;
  /** Notifies the host when the panel collapses or expands. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Default router-link render for menu buttons that set `href`. */
  renderLink?: LinkProps['render'];
  className?: string;
};

/**
 * Floating side navigation shell with collapse context. Compose header and
 * menu parts as children. Applications own organization data, routing,
 * translations, and switcher menus.
 */
export function SideNav({
  children,
  'aria-label': ariaLabel,
  isCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  renderLink,
  className = '',
}: SideNavProps) {
  const prefersReducedMotion = useReducedMotion();
  const [localCollapsed, setLocalCollapsed] = useState(defaultCollapsed);
  const collapsed = isCollapsed ?? localCollapsed;

  function setCollapsed(next: boolean) {
    if (isCollapsed === undefined) setLocalCollapsed(next);
    onCollapsedChange?.(next);
  }

  function toggle() {
    setCollapsed(!collapsed);
  }

  const layoutTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: PANEL_DURATION, ease: EASE_DRAWER };

  const contextValue: SideNavContextValue = {
    collapsed,
    setCollapsed,
    toggle,
    renderLink,
    layoutTransition,
  };

  return (
    <SideNavContext.Provider value={contextValue}>
      <LayoutGroup id="side-nav">
        <motion.nav
          aria-label={ariaLabel}
          data-side-nav=""
          data-collapsed={collapsed || undefined}
          initial={false}
          className={`bg-surface-raised shadow-md flex flex-col gap-1 overflow-hidden rounded-3xl p-3 transition-[width] ${collapsed ? 'items-center' : 'items-start'} ${className}`}
          style={{
            width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
            transitionDuration: prefersReducedMotion ? '0ms' : PANEL_DURATION_MS,
            transitionTimingFunction: PANEL_EASE_CSS,
          }}
        >
          {children}
        </motion.nav>
      </LayoutGroup>
    </SideNavContext.Provider>
  );
}

export type SideNavHeaderProps = {
  children: ReactNode;
  className?: string;
};

/** Top chrome region that stacks header parts with the panel gap. */
export function SideNavHeader({ children, className = '' }: SideNavHeaderProps) {
  const { collapsed } = useSideNav();
  return (
    <div
      className={`flex w-full flex-col gap-1 ${collapsed ? 'items-center' : 'items-stretch'} ${className}`}
    >
      {children}
    </div>
  );
}

export type SideNavHeaderRowProps = {
  children: ReactNode;
  /** When true, adds start padding to align with the section label. */
  inset?: boolean;
  className?: string;
};

/** Horizontal row for a section label or back control beside the trigger. */
export function SideNavHeaderRow({
  children,
  inset = false,
  className = '',
}: SideNavHeaderRowProps) {
  // Avoid overflow-hidden here: Veli Button press scale (1.045) would clip on the
  // start edge. Label truncation lives on ExpandingCopy / the back-button text.
  return (
    <div className={`flex w-full items-center justify-between ${inset ? 'ps-3' : ''} ${className}`}>
      {children}
    </div>
  );
}

export type SideNavTriggerProps = {
  /** Accessible name when the panel is expanded (collapse action). */
  collapseLabel: string;
  /** Accessible name when the panel is collapsed (expand action). */
  expandLabel: string;
  className?: string;
};

/** Ghost icon-only control that toggles collapse via panel context. */
export function SideNavTrigger({
  collapseLabel,
  expandLabel,
  className = '',
}: SideNavTriggerProps) {
  const { collapsed, toggle, layoutTransition } = useSideNav();

  return (
    <motion.div
      layoutId="side-nav-collapse"
      layout="position"
      transition={layoutTransition}
      className={`shrink-0 ${className}`}
    >
      <Button
        aria-label={collapsed ? expandLabel : collapseLabel}
        aria-expanded={!collapsed}
        intent="secondary"
        appearance="ghost"
        size="sm"
        iconOnly
        onPress={toggle}
      >
        <SidebarSimpleIcon size={16} weight="bold" aria-hidden="true" />
      </Button>
    </motion.div>
  );
}

export type SideNavSectionLabelProps = {
  children: ReactNode;
  className?: string;
};

/** Uppercase section caption that hides when the panel is collapsed. */
export function SideNavSectionLabel({ children, className = '' }: SideNavSectionLabelProps) {
  const { collapsed } = useSideNav();
  return (
    <ExpandingCopy
      collapsed={collapsed}
      className={`type-caption-semibold text-base-subtle tracking-[0.18px] uppercase ${className}`}
    >
      {children}
    </ExpandingCopy>
  );
}

export type SideNavBackButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
};

/** Primary ghost back control with a leading caret. */
export function SideNavBackButton({ children, onPress, className = '' }: SideNavBackButtonProps) {
  return (
    <Button
      intent="primary"
      appearance="ghost"
      size="sm"
      // This control sits flush in the overflow-hidden rounded SideNav shell.
      // Veli Button’s default press scale (1.045) + overflow-hidden clip the
      // leading caret’s left edge; kill both for this part only.
      className={`min-w-0 overflow-visible data-[pressed]:!scale-100 ${className}`}
      onPress={onPress}
    >
      <CaretLeftIcon size={16} weight="bold" aria-hidden="true" />
      <span className="type-body-sm-medium truncate">{children}</span>
    </Button>
  );
}

export type SideNavTitleProps = {
  children: ReactNode;
  className?: string;
};

/** Nested-level title block. */
export function SideNavTitle({ children, className = '' }: SideNavTitleProps) {
  return (
    <div className={`flex w-full items-start overflow-hidden py-2 ps-3 ${className}`}>
      <p className="type-body-lg-semibold text-base-emphasis whitespace-nowrap">{children}</p>
    </div>
  );
}

export type SideNavOrgSwitcherProps = {
  children: ReactNode;
  /** Accessible name for the switcher control. */
  'aria-label': string;
  /**
   * Optional press handler. Prefer wrapping this control in a Veli `MenuTrigger`
   * for the organization menu; `onPress` is for hosts that open a custom overlay.
   */
  onPress?: () => void;
  isDisabled?: boolean;
  className?: string;
};

/** Bordered organization switcher row; the host wires the menu (e.g. Veli Menu). */
export function SideNavOrgSwitcher({
  children,
  'aria-label': ariaLabel,
  onPress,
  isDisabled = false,
  className = '',
}: SideNavOrgSwitcherProps) {
  return (
    <AriaButton
      aria-label={ariaLabel}
      className={[
        'flex w-full cursor-pointer items-center border border-solid bg-surface-raised text-start font-sans outline-none',
        'border-border-base-muted rounded-2xl',
        'data-[hovered]:bg-neutral-alpha-200 data-[pressed]:bg-neutral-alpha-300',
        'data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-bg-surface-raised',
        'data-[disabled]:cursor-default',
        'forced-colors:data-[focus-visible]:outline-solid forced-colors:data-[focus-visible]:outline-2 forced-colors:data-[focus-visible]:outline-offset-2',
        'gap-3 p-3',
        className,
      ].join(' ')}
      onPress={onPress}
      isDisabled={isDisabled}
    >
      {children}
    </AriaButton>
  );
}

export type SideNavOrgAvatarProps = {
  alt: string;
  size?: '44' | '36';
  src?: string;
  initials?: string;
  appearance?: AvatarAppearance;
  className?: string;
};

/** Ringed organization avatar used in the switcher or collapsed rail. */
export function SideNavOrgAvatar({
  alt,
  size = '44',
  src,
  initials,
  appearance = 'teal',
  className = '',
}: SideNavOrgAvatarProps) {
  const { layoutTransition } = useSideNav();
  const innerSize: AvatarSize = size === '44' ? '36' : '28';
  const ringClass =
    size === '44' ? 'size-11 border-2 rounded-[22px]' : 'size-9 border-[1.5px] rounded-[18px]';

  return (
    <motion.div
      layoutId="side-nav-org-avatar"
      layout="position"
      transition={layoutTransition}
      className={`shrink-0 ${className}`}
    >
      <span
        aria-hidden="true"
        className={`inline-flex shrink-0 items-center justify-center border-solid border-primary-emphasis ${ringClass}`}
      >
        <Avatar
          size={innerSize}
          appearance={appearance}
          src={src}
          initials={initials ?? alt}
          type={src ? 'image' : 'initials'}
          alt={alt}
        />
      </span>
    </motion.div>
  );
}

export type SideNavOrgNameProps = {
  children: ReactNode;
  lang?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  className?: string;
};

/** Organization name inside the switcher; hides when collapsed. */
export function SideNavOrgName({
  children,
  lang,
  dir = 'auto',
  className = '',
}: SideNavOrgNameProps) {
  const { collapsed } = useSideNav();
  return (
    <ExpandingCopy collapsed={collapsed}>
      <span
        lang={lang}
        dir={dir}
        className={`type-body-md-semibold block truncate text-base-strong ${className}`}
      >
        {children}
      </span>
    </ExpandingCopy>
  );
}

export type SideNavOrgSecondaryProps = {
  children: ReactNode;
  lang?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  className?: string;
};

/** Secondary membership line inside the switcher; hides when collapsed. */
export function SideNavOrgSecondary({
  children,
  lang,
  dir = 'auto',
  className = '',
}: SideNavOrgSecondaryProps) {
  const { collapsed } = useSideNav();
  return (
    <ExpandingCopy collapsed={collapsed}>
      <span
        lang={lang}
        dir={dir}
        className={`type-caption-regular block truncate tracking-[0.18px] text-base-muted ${className}`}
      >
        {children}
      </span>
    </ExpandingCopy>
  );
}

export type SideNavOrgCaretProps = {
  className?: string;
};

/** Switcher trailing caret; hides when collapsed. */
export function SideNavOrgCaret({ className = '' }: SideNavOrgCaretProps) {
  const { collapsed } = useSideNav();
  return (
    <ExpandingCopy collapsed={collapsed} className={`flex shrink-0 ${className}`}>
      <CaretDownIcon size={16} weight="bold" aria-hidden="true" className="text-icon-base" />
    </ExpandingCopy>
  );
}

export type SideNavMenuProps = {
  children: ReactNode;
  className?: string;
};

/** Navigation list (`ul`) with the panel's 4px item gap. */
export function SideNavMenu({ children, className = '' }: SideNavMenuProps) {
  return (
    <ul className={`m-0 flex w-full list-none flex-col gap-1 p-0 ${className}`}>{children}</ul>
  );
}

export type SideNavMenuItemProps = {
  children: ReactNode;
  className?: string;
};

/** Single navigation list item (`li`). */
export function SideNavMenuItem({ children, className = '' }: SideNavMenuItemProps) {
  return <li className={`min-w-0 w-full ${className}`}>{children}</li>;
}

export type SideNavMenuButtonProps = {
  children: ReactNode;
  isActive?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  onPress?: () => void;
  /** Overrides the panel-level `renderLink` for this button. */
  render?: LinkProps['render'];
  'aria-label'?: string;
  className?: string;
};

/** Link or button row with active and collapsed styles from panel context. */
export function SideNavMenuButton({
  children,
  isActive = false,
  href,
  target,
  rel,
  onPress,
  render,
  'aria-label': ariaLabel,
  className = '',
}: SideNavMenuButtonProps) {
  const { collapsed, renderLink } = useSideNav();
  const prefersReducedMotion = useReducedMotion();

  const labelText = findMenuLabelText(children);

  const content = Children.map(children, (child) => {
    // Skip empty slots so optional badges / JSX whitespace do not become
    // size-5 wrappers that throw off collapsed icon centering.
    if (child == null || typeof child === 'boolean') {
      return null;
    }
    if (typeof child === 'string' || typeof child === 'number' || !isValidElement(child)) {
      return null;
    }
    if (child.type === SideNavMenuLabel || child.type === SideNavMenuBadge) {
      return child;
    }
    return (
      <span
        aria-hidden="true"
        className="inline-flex size-5 shrink-0 items-center justify-center [&_svg]:size-5"
      >
        {child}
      </span>
    );
  });

  const itemStyle = {
    transitionDuration: prefersReducedMotion ? '0ms' : PANEL_DURATION_MS,
    transitionTimingFunction: PANEL_EASE_CSS,
  };
  const resolvedAriaLabel = ariaLabel ?? (collapsed ? labelText : undefined);
  const classNames = `${navItemClassName(isActive, collapsed)} ${className}`.trim();

  if (href) {
    return (
      <AriaLink
        href={href}
        target={target}
        rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
        className={classNames}
        style={itemStyle}
        aria-label={resolvedAriaLabel}
        aria-current={isActive ? 'page' : undefined}
        render={render ?? renderLink}
        onPress={onPress}
      >
        {content}
      </AriaLink>
    );
  }

  return (
    <AriaButton
      className={classNames}
      style={itemStyle}
      aria-label={resolvedAriaLabel}
      aria-current={isActive ? 'page' : undefined}
      onPress={onPress}
    >
      {content}
    </AriaButton>
  );
}

export type SideNavMenuLabelProps = {
  children: ReactNode;
  className?: string;
};

/** Menu row label that expands and collapses with the panel. */
export function SideNavMenuLabel({ children, className = '' }: SideNavMenuLabelProps) {
  const { collapsed } = useSideNav();
  return (
    <ExpandingCopy
      collapsed={collapsed}
      className={`min-w-0 flex-1 truncate ${collapsed ? 'pointer-events-none' : ''} ${className}`}
    >
      {children}
    </ExpandingCopy>
  );
}

/** Walk children (including wrappers) for the first `SideNavMenuLabel` text. */
function findMenuLabelText(node: ReactNode): string | undefined {
  for (const child of Children.toArray(node)) {
    if (!isValidElement<{ children?: ReactNode }>(child)) continue;
    if (child.type === SideNavMenuLabel) {
      return textFromNode(child.props.children);
    }
    const nested = findMenuLabelText(child.props.children);
    if (nested != null) return nested;
  }
  return undefined;
}

export type SideNavMenuBadgeProps = {
  children: ReactNode;
  className?: string;
};

/** Trailing counter badge that fades out when the panel collapses. */
export function SideNavMenuBadge({ children, className = '' }: SideNavMenuBadgeProps) {
  const { collapsed } = useSideNav();
  const prefersReducedMotion = useReducedMotion();
  return (
    <span
      aria-hidden={collapsed || undefined}
      className={`inline-flex shrink-0 items-center transition-[opacity,transform] ${
        collapsed
          ? 'pointer-events-none w-0 scale-90 overflow-hidden opacity-0'
          : 'scale-100 opacity-100'
      } ${className}`}
      style={{
        transitionDuration: prefersReducedMotion ? REDUCED_MOTION_OPACITY_MS : PANEL_DURATION_MS,
        transitionTimingFunction: PANEL_EASE_CSS,
      }}
    >
      <Badge counter size="sm" appearance="subtle" intent="neutral">
        {children}
      </Badge>
    </span>
  );
}

/** Collapsed-rail organization avatar press target (icon-only). */
export function SideNavCollapsedOrgButton({
  children,
  'aria-label': ariaLabel,
  onPress,
  isDisabled = false,
  className = '',
}: {
  children: ReactNode;
  'aria-label': string;
  /**
   * Optional press handler. Prefer wrapping this control in a Veli `MenuTrigger`
   * for the organization menu; `onPress` is for hosts that open a custom overlay.
   */
  onPress?: () => void;
  isDisabled?: boolean;
  className?: string;
}) {
  const { layoutTransition } = useSideNav();
  return (
    <motion.div layout="position" transition={layoutTransition} className="shrink-0">
      <AriaButton
        aria-label={ariaLabel}
        className={`inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-bg-surface-raised data-[disabled]:cursor-default ${className}`}
        onPress={onPress}
        isDisabled={isDisabled}
      >
        {children}
      </AriaButton>
    </motion.div>
  );
}

export type SideNavLevelSwapProps = {
  /** Stable key for the current level (e.g. `"organization"` | `"access"`). */
  level: string;
  /** `1` = drill in toward a submenu; `-1` = navigate back out. */
  direction: number;
  /** Writing direction; flips the physical enter/exit axis for RTL. */
  writingDirection?: 'ltr' | 'rtl';
  children: ReactNode;
};

/**
 * Host helper for org → nested level transitions. Forward: outgoing exits toward
 * inline-start, incoming enters from inline-end. Back reverses. Reduced motion
 * keeps a short opacity crossfade only.
 */
export function SideNavLevelSwap({
  level,
  direction,
  writingDirection = 'ltr',
  children,
}: SideNavLevelSwapProps) {
  const prefersReducedMotion = useReducedMotion();
  const axis = writingDirection === 'rtl' ? -1 : 1;
  const transition: Transition = prefersReducedMotion
    ? { duration: 0.15 }
    : { duration: sideNavLevelDuration, ease: sideNavEaseDrawer };

  // Exit must read AnimatePresence's current `custom` direction. A static exit
  // object would keep the direction from the outgoing child's last render.
  const variants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, pointerEvents: 'auto' as const },
        exit: { opacity: 0, pointerEvents: 'none' as const },
      }
    : {
        initial: (dir: number) => ({
          opacity: 0,
          transform: `translateX(${sideNavLevelTravelPx * dir * axis}px)`,
        }),
        animate: {
          opacity: 1,
          transform: 'translateX(0px)',
          pointerEvents: 'auto' as const,
        },
        exit: (dir: number) => ({
          opacity: 0,
          transform: `translateX(${-sideNavLevelTravelPx * dir * axis}px)`,
          pointerEvents: 'none' as const,
        }),
      };

  return (
    // Stack both levels in one grid cell so enter/exit can overlap without
    // `popLayout` (which layout-scales the exiting panel) or a local
    // `overflow-hidden` (which clips Veli Button’s 1.045 press scale on Back).
    // Horizontal travel still masks at the root SideNav overflow. Exiting
    // layers disable pointer events so they cannot steal clicks mid-swap.
    <div className="relative grid w-full grid-cols-1 grid-rows-1">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={level}
          custom={direction}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          className="col-start-1 row-start-1 flex w-full flex-col gap-1"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
