'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

/** Overlay flags from SiteHeader’s `onOverlayChange` (or an equivalent host adapter). */
export type SiteShellOverlay = {
  switcherOpen?: boolean;
  switcherRendered?: boolean;
  mobileMenuVisible?: boolean;
};

export type SiteShellProps = {
  /** Site header (for example the site-header block). */
  header: ReactNode;
  children: ReactNode;
  /** Site footer (for example the site-footer block). */
  footer?: ReactNode;
  /**
   * Optional bottom banner (for example the preview-banner block). Mount it
   * here so its scroll spacer participates in the page flex column only when
   * notices are present. Wire `hidden` from
   * `overlay.switcherRendered || overlay.mobileMenuVisible` in the host adapter.
   */
  notices?: ReactNode;
  /**
   * Overlay visibility from the header. Main and footer fade while
   * `switcherOpen || mobileMenuVisible`.
   */
  overlay?: SiteShellOverlay;
  /** Extra classes on the padded main column wrapper (for example page-specific padding). */
  contentClassName?: string;
  className?: string;
};

/** Matches site-header `DURATION.fade` / drawer ease without importing that block. */
const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;
const fadeTransition = { duration: 0.3, ease: EASE_DRAWER };

function ChromeFade({
  hidden,
  className,
  children,
  prefersReducedMotion,
  chrome,
}: {
  hidden: boolean;
  className?: string;
  children: ReactNode;
  prefersReducedMotion: boolean | null;
  chrome: 'content' | 'footer';
}) {
  return (
    <motion.div
      data-shell-chrome={chrome}
      className={className}
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : fadeTransition}
      style={{ pointerEvents: hidden ? 'none' : 'auto' }}
      aria-hidden={hidden || undefined}
      // Opacity and aria-hidden alone leave descendants in the tab order.
      inert={hidden || undefined}
    >
      {children}
    </motion.div>
  );
}

/**
 * Page frame around a site header and footer: raised viewport column, rounded
 * main surface, and overlay chrome fade. Session, search, routing, notices,
 * and copy stay in the host.
 */
export function SiteShell({
  header,
  children,
  footer,
  notices,
  overlay = {},
  contentClassName = '',
  className = '',
}: SiteShellProps) {
  const prefersReducedMotion = useReducedMotion();
  const switcherOpen = overlay.switcherOpen ?? false;
  const mobileMenuVisible = overlay.mobileMenuVisible ?? false;
  const isChromeHidden = switcherOpen || mobileMenuVisible;

  return (
    <div className={`bg-surface-raised relative flex min-h-dvh flex-col ${className}`}>
      {header}

      <ChromeFade
        chrome="content"
        hidden={isChromeHidden}
        className={`flex min-h-0 flex-1 flex-col px-1 lg:px-2 ${contentClassName}`}
        prefersReducedMotion={prefersReducedMotion}
      >
        <main className="bg-surface-base flex min-h-0 flex-1 flex-col rounded-3xl">{children}</main>
      </ChromeFade>

      {footer ? (
        <ChromeFade
          chrome="footer"
          hidden={isChromeHidden}
          prefersReducedMotion={prefersReducedMotion}
        >
          {footer}
        </ChromeFade>
      ) : null}

      {notices}
    </div>
  );
}
