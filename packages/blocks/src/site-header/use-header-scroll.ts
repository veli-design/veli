import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export type HeaderScrollMode = 'top' | 'floating' | 'hidden' | 'hidden-top';

export const HEADER_HEIGHT = 72;
export const OFFICIAL_BANNER_COLLAPSED_HEIGHT = 36;

const HEADER_TOP_THRESHOLD_PX = 24;
const HEADER_SCROLL_DELTA_PX = 6;
const HEADER_FLOATING_ACTIVATION_PX = 160;
/** Collapsed banner + gap + header — used to inert top chrome once it's off-screen. */
const HEADER_TOP_STACK_PX = OFFICIAL_BANNER_COLLAPSED_HEIGHT + 4 + HEADER_HEIGHT;

/**
 * At the page top the fixed chrome tracks scrollY (scrolls away with the page).
 * Past the activation point, show the floating pill when scrolling up and hide
 * it when scrolling down.
 */
export function useHeaderScrollMode(
  pathname: string,
  headerRef: RefObject<HTMLElement | null>,
  bannerExitRef: RefObject<HTMLElement | null>,
): { mode: HeaderScrollMode; floatingMotion: boolean } {
  const [mode, setMode] = useState<HeaderScrollMode>('top');
  // Transitions stay off until the floating pill has been shown once, so the
  // first top→hidden handoff doesn't fade the pill in.
  const [floatingMotion, setFloatingMotion] = useState(false);
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);
  const floatingEnabledRef = useRef(false);
  const modeRef = useRef<HeaderScrollMode>('top');
  const clearExitRafRef = useRef<number | null>(null);

  const applyTopExitOffset = useCallback(
    (offset: number) => {
      const transform = offset > 0 ? `translateY(${-offset}px)` : '';
      for (const el of [headerRef.current, bannerExitRef.current]) {
        if (!el) continue;
        if (transform) el.style.transform = transform;
        else el.style.removeProperty('transform');
      }
    },
    [bannerExitRef, headerRef],
  );

  const clearBannerExitPaint = useCallback(() => {
    const banner = bannerExitRef.current;
    if (!banner) return;
    banner.style.removeProperty('opacity');
    banner.style.removeProperty('pointer-events');
  }, [bannerExitRef]);

  const commitMode = useCallback((next: HeaderScrollMode) => {
    if (modeRef.current === next) return;
    modeRef.current = next;
    setMode(next);
  }, []);

  const cancelPendingExitClear = useCallback(() => {
    if (clearExitRafRef.current != null) {
      cancelAnimationFrame(clearExitRafRef.current);
      clearExitRafRef.current = null;
    }
  }, []);

  /** Enter floating-hidden without a visible flash of the pill or banner. */
  const activateFloatingHidden = useCallback(
    (y: number) => {
      floatingEnabledRef.current = true;
      lastYRef.current = y;
      setFloatingMotion(false);
      // Keep chrome translated off-screen until React commits opacity-0.
      applyTopExitOffset(Math.max(y, HEADER_TOP_STACK_PX));
      const banner = bannerExitRef.current;
      if (banner) {
        banner.style.opacity = '0';
        banner.style.pointerEvents = 'none';
      }
      commitMode('hidden');
      cancelPendingExitClear();
      clearExitRafRef.current = requestAnimationFrame(() => {
        clearExitRafRef.current = requestAnimationFrame(() => {
          clearExitRafRef.current = null;
          if (modeRef.current === 'hidden') applyTopExitOffset(0);
        });
      });
    },
    [applyTopExitOffset, bannerExitRef, cancelPendingExitClear, commitMode],
  );

  useEffect(() => {
    const y = window.scrollY;
    lastYRef.current = y;
    floatingEnabledRef.current = y >= HEADER_FLOATING_ACTIVATION_PX;
    setFloatingMotion(false);
    cancelPendingExitClear();
    clearBannerExitPaint();
    if (floatingEnabledRef.current) {
      applyTopExitOffset(0);
      commitMode(y < HEADER_TOP_THRESHOLD_PX ? 'top' : 'hidden');
    } else {
      applyTopExitOffset(y);
      commitMode(y < HEADER_TOP_STACK_PX ? 'top' : 'hidden-top');
    }
  }, [pathname, applyTopExitOffset, cancelPendingExitClear, clearBannerExitPaint, commitMode]);

  useEffect(() => {
    lastYRef.current = window.scrollY;

    const update = () => {
      tickingRef.current = false;
      const y = window.scrollY;
      const delta = y - lastYRef.current;

      // Near the top: top chrome tracks the page 1:1.
      if (!floatingEnabledRef.current) {
        if (y >= HEADER_FLOATING_ACTIVATION_PX) {
          activateFloatingHidden(y);
          return;
        }
        applyTopExitOffset(y);
        if (y < HEADER_TOP_THRESHOLD_PX) {
          lastYRef.current = y;
          commitMode('top');
          return;
        }
        commitMode(y < HEADER_TOP_STACK_PX ? 'top' : 'hidden-top');
        return;
      }

      if (y < HEADER_TOP_THRESHOLD_PX) {
        lastYRef.current = y;
        floatingEnabledRef.current = false;
        setFloatingMotion(false);
        cancelPendingExitClear();
        clearBannerExitPaint();
        applyTopExitOffset(y);
        commitMode('top');
        return;
      }

      // Floating region: direction-based show/hide. Accumulate small deltas so
      // slow scrolls still clear the threshold.
      if (Math.abs(delta) < HEADER_SCROLL_DELTA_PX) return;
      lastYRef.current = y;
      if (delta < 0) {
        cancelPendingExitClear();
        applyTopExitOffset(0);
        setFloatingMotion(true);
        commitMode('floating');
      } else {
        commitMode('hidden');
      }
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelPendingExitClear();
    };
  }, [
    activateFloatingHidden,
    applyTopExitOffset,
    cancelPendingExitClear,
    clearBannerExitPaint,
    commitMode,
  ]);

  return { mode, floatingMotion };
}
