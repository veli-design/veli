'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { ArrowRightIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { Button } from '@veli-design/react/button';
import { AnimatePresence, animate, motion, useMotionValue } from 'motion/react';

import {
  DURATION,
  SEARCH_MORPH_CLOSE_MS,
  SEARCH_MORPH_OPEN_OVERSHOOT_AT,
  SEARCH_MORPH_OPEN_OVERSHOOT_PX,
  searchFallbackCloseTransition,
  searchFallbackOpenTransition,
  searchMorphCloseTransition,
  searchMorphOpenSpring,
  searchReducedFadeTransition,
  searchTrayEnterTransition,
  searchTrayExitTransition,
} from './motion';
import { TRAY_GAP, getSearchTrayMaxHeight } from './search-tray';

export type SiteHeaderSearchRenderProps = {
  query: string;
  setQuery: (value: string) => void;
  close: () => void;
};

export type SiteHeaderSearchSuggestion = {
  id: string;
  label: string;
  onSelect?: () => void;
};

export type SiteHeaderSearchConfig = {
  /** Accessible label for the header search button and search dialog. Defaults to `"Search"`. */
  label?: string;
  /** Placeholder text shown inside the opened search input. Defaults to `label`. */
  placeholder?: string;
  /** Accessible label for the trailing submit arrow button. Defaults to `label`. */
  submitLabel?: string;
  /** Heading label shown above built-in suggestions. Defaults to `"Suggestions"`. */
  suggestionsLabel?: string;
  /**
   * Controlled open state. When omitted, SiteHeader manages open state internally. When set, the
   * host owns it for closing too: Escape, the backdrop, and navigation only call
   * `onOpenChange(false)`, and the dialog stays open until the host passes `open: false`.
   */
  open?: boolean;
  /** Called whenever the user asks to open or close the search dialog. */
  onOpenChange?: (open: boolean) => void;
  /** Controlled search query. When omitted, SiteHeader manages query state internally. */
  query?: string;
  /** Called whenever the search query changes. */
  onQueryChange?: (query: string) => void;
  /** Called when the user submits the query via Enter or the trailing submit button. */
  onSubmit?: (query: string) => void;
  /**
   * Optional suggestion items rendered in the standard Figma suggestions card
   * beneath the search bar with matched-text emphasis and keyboard navigation.
   * Accepts a static list (auto-filtered by query) or a function of the query.
   */
  suggestions?: SiteHeaderSearchSuggestion[] | ((query: string) => SiteHeaderSearchSuggestion[]);
  /** Called when a user selects a built-in suggestion item. */
  onSelectSuggestion?: (suggestion: SiteHeaderSearchSuggestion) => void;
  /**
   * Optional custom results or empty-state content rendered in the card below
   * the search input. When provided, overrides the built-in `suggestions` list.
   * Return null, undefined, or false to hide the card until content is ready.
   */
  renderResults?: (props: SiteHeaderSearchRenderProps) => ReactNode;
  /** Enable Cmd/Ctrl+K shortcut to toggle search. Defaults to true. */
  shortcut?: boolean;
};

type MorphRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type MorphGeometry = {
  origin: MorphRect | null;
  target: MorphRect;
  cbLeft: number;
  cbTop: number;
  viewportHeight: number;
  isRtl: boolean;
};

type MorphMode = 'morph' | 'fallback' | 'reduced' | 'instant';

/** Figma SearchOpen (`242:6214`): 696×76 pill (`rounded-[38px]`), 2px border, 20px icon at 32px inline-start, 4px gap to suggestions. */
const OPEN_PILL_MAX_WIDTH = 696;
const OPEN_PILL_MIN_WIDTH = 240;
const OPEN_PILL_HEIGHT = 76;
const OPEN_PILL_GUTTER = 16;
const OPEN_PILL_BORDER = 2;
const TRIGGER_ICON_SIZE = 16;
const OPEN_ICON_SIZE = 20;
const OPEN_ICON_INSET = 32;
function computeTargetRect(viewportWidth: number, viewportHeight: number): MorphRect {
  const width = Math.min(
    OPEN_PILL_MAX_WIDTH,
    Math.max(OPEN_PILL_MIN_WIDTH, viewportWidth - OPEN_PILL_GUTTER * 2),
  );
  const left = Math.round((viewportWidth - width) / 2);
  const top = Math.round(Math.min(Math.max(viewportHeight * 0.25, 48), 250));
  return { left, top, width, height: OPEN_PILL_HEIGHT };
}

function measureOriginRect(
  slotEl: HTMLElement | null,
  viewportWidth: number,
  viewportHeight: number,
  triggerHidden: boolean,
): MorphRect | null {
  if (!slotEl || triggerHidden) return null;
  const rect = slotEl.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const isVisibleInViewport =
    rect.bottom > 0 && rect.top < viewportHeight && rect.right > 0 && rect.left < viewportWidth;

  if (!isVisibleInViewport) return null;

  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

type SearchSuggestionsListProps = {
  id: string;
  label: string;
  getOptionId: (index: number) => string;
  suggestions: readonly SiteHeaderSearchSuggestion[];
  activeIndex: number | null;
  query: string;
  onSelect: (suggestion: SiteHeaderSearchSuggestion) => void;
  onHover: (index: number) => void;
  onLeave: () => void;
  /** An option received real focus (Tab or click), so it becomes the highlighted one. */
  onOptionFocus: (index: number) => void;
  /** ArrowUp from the first option hands focus back to the search input. */
  onReturnToInput: () => void;
};

/**
 * Built-in suggestions as an ARIA listbox. While typing, focus stays in the search input, which
 * points at the highlighted option through `aria-activedescendant`. Tab also reaches the results:
 * the highlighted option (or the first) is the single roving Tab stop, and arrow keys move between
 * options from there.
 */
function SearchSuggestionsList({
  id,
  label,
  getOptionId,
  suggestions,
  activeIndex,
  query,
  onSelect,
  onHover,
  onLeave,
  onOptionFocus,
  onReturnToInput,
}: SearchSuggestionsListProps) {
  const focusOption = (index: number) => {
    document.getElementById(getOptionId(index))?.focus({ preventScroll: true });
  };

  return (
    <ul
      id={id}
      role="listbox"
      aria-label={label}
      className="flex flex-col"
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') onLeave();
      }}
    >
      {suggestions.map((suggestion, index) => {
        const isActive = index === activeIndex;
        const isTabStop = index === (activeIndex ?? 0);
        return (
          <li
            key={suggestion.id}
            id={getOptionId(index)}
            role="option"
            aria-selected={isActive}
            tabIndex={isTabStop ? 0 : -1}
            onClick={() => onSelect(suggestion)}
            onFocus={() => onOptionFocus(index)}
            onKeyDown={(event) => {
              switch (event.key) {
                case 'Enter':
                case ' ':
                  event.preventDefault();
                  onSelect(suggestion);
                  break;
                case 'ArrowDown':
                  event.preventDefault();
                  if (index < suggestions.length - 1) focusOption(index + 1);
                  break;
                case 'ArrowUp':
                  event.preventDefault();
                  if (index > 0) focusOption(index - 1);
                  else onReturnToInput();
                  break;
                case 'Home':
                  event.preventDefault();
                  focusOption(0);
                  break;
                case 'End':
                  event.preventDefault();
                  focusOption(suggestions.length - 1);
                  break;
              }
            }}
            onPointerMove={(event) => {
              if (event.pointerType === 'mouse') onHover(index);
            }}
            className={`text-text-base focus-visible:ring-border-focus flex w-full cursor-pointer items-center gap-3 rounded-[32px] px-4 py-3 text-start transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset ${
              isActive ? 'bg-neutral-alpha-200' : 'bg-transparent'
            }`}
          >
            <MagnifyingGlassIcon
              size={OPEN_ICON_SIZE}
              weight="regular"
              className="text-text-base shrink-0"
              aria-hidden
            />
            <span className="type-body-md-regular text-text-base min-w-0 flex-1">
              {renderMatchedLabel(suggestion.label, query)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function renderMatchedLabel(label: string, query: string): ReactNode {
  const trimmed = query.trim();
  if (!trimmed) return label;
  const matchIndex = label.toLowerCase().indexOf(trimmed.toLowerCase());
  if (matchIndex === -1) return label;
  const before = label.slice(0, matchIndex);
  const match = label.slice(matchIndex, matchIndex + trimmed.length);
  const after = label.slice(matchIndex + trimmed.length);
  return (
    <>
      {before}
      <span className="font-medium">{match}</span>
      {after}
    </>
  );
}

/**
 * Single-element morphing search trigger & dialog: the same persistent pill element
 * and magnifying-glass icon rest inside the header action slot when closed and lift
 * directly into the centered Figma search bar along a GPU-composited quadratic-Bézier
 * arc when opened — eliminating any two-element swap or flicker.
 */
export function HeaderSearchControl({
  dialogId,
  open,
  rendered,
  instant = false,
  triggerHidden,
  shortcutEnabled,
  search,
  query,
  onQueryChange,
  onOpen,
  onClose,
  onExitComplete,
  prefersReducedMotion,
}: {
  dialogId: string;
  open: boolean;
  rendered: boolean;
  /** Bypass animation for keyboard-initiated open/close (Cmd/Ctrl+K, Escape). */
  instant?: boolean;
  triggerHidden: boolean;
  shortcutEnabled: boolean;
  search: SiteHeaderSearchConfig;
  query: string;
  onQueryChange: (value: string) => void;
  onOpen: () => void;
  onClose: () => void;
  onExitComplete: () => void;
  prefersReducedMotion: boolean | null;
}) {
  const slotRef = useRef<HTMLDivElement>(null);
  const fixedProbeRef = useRef<HTMLSpanElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const exitCompletedRef = useRef(false);
  const exitFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasRenderedRef = useRef(false);
  const geometryRef = useRef<MorphGeometry | null>(null);
  const modeRef = useRef<MorphMode>('morph');
  const phaseRef = useRef<'open' | 'close'>('open');
  const morphAnchorRef = useRef<{ startU: number; startWp: number }>({ startU: 0, startWp: 0 });
  const lastWpRef = useRef(0);
  const [geometry, setGeometry] = useState<MorphGeometry | null>(null);
  const [morphSettled, setMorphSettled] = useState(instant);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const highlightSourceRef = useRef<'keyboard' | 'mouse' | null>(null);
  const listboxId = useId();
  const trayScrollRef = useRef<HTMLDivElement>(null);
  const getOptionId = useCallback((index: number) => `${listboxId}-option-${index}`, [listboxId]);

  // Single master progress drives 100% GPU-composited transform, dual concentric
  // clip-path (for an unclipped 4-sided 2px border), and opacity in lockstep.
  const progress = useMotionValue(instant && open ? 1 : 0);
  const backdropOpacity = useMotionValue(instant && open ? 1 : 0);
  const pillTransform = useMotionValue('translate3d(0px, 0px, 0)');
  const outerClipPath = useMotionValue('inset(0px 0px 0px 0px round 9999px)');
  const innerClipPath = useMotionValue(
    `inset(${OPEN_PILL_BORDER}px ${OPEN_PILL_BORDER}px ${OPEN_PILL_BORDER}px ${OPEN_PILL_BORDER}px round 9999px)`,
  );
  const pillOpacity = useMotionValue(1);
  const shadowTransform = useMotionValue('translate3d(0px, 0px, 0) scale(1, 1)');
  const shadowOpacity = useMotionValue(instant && open ? 1 : 0);
  const triggerFillOpacity = useMotionValue(1);
  const ringOpacity = useMotionValue(instant && open ? 1 : 0);
  const iconTransform = useMotionValue(`translate3d(${OPEN_ICON_INSET}px, -50%, 0) scale(1)`);
  const inputOpacity = useMotionValue(instant && open ? 1 : 0);
  const submitOpacity = useMotionValue(instant && open ? 1 : 0);
  const submitTransform = useMotionValue('translate3d(0px, -50%, 0) scale(1)');

  const resolveMode = useCallback(
    (origin: MorphRect | null): MorphMode => {
      if (instant) return 'instant';
      if (prefersReducedMotion) return 'reduced';
      return origin ? 'morph' : 'fallback';
    },
    [instant, prefersReducedMotion],
  );

  const applyMorphFrame = useCallback(
    (rawU: number) => {
      const geo = geometryRef.current;
      if (!geo) return;
      const u = Math.min(1, Math.max(0, rawU));
      const { origin, target, isRtl } = geo;
      const mode = modeRef.current;
      const openIconTx = isRtl ? -OPEN_ICON_INSET : OPEN_ICON_INSET;

      if (mode === 'instant' || mode === 'reduced' || mode === 'fallback' || !origin) {
        const scale = mode === 'fallback' ? 0.96 + 0.04 * u : 1;
        const opacity = mode === 'instant' ? (u > 0 ? 1 : 0) : u;
        const sxOffset = (target.width * (1 - scale)) / 2;
        const syOffset = (target.height * (1 - scale)) / 2;
        lastWpRef.current = u;

        backdropOpacity.set(opacity);
        pillTransform.set(
          scale === 1
            ? `translate3d(${target.left}px, ${target.top}px, 0)`
            : `translate3d(${target.left}px, ${target.top}px, 0) scale(${scale})`,
        );
        outerClipPath.set('inset(0px 0px 0px 0px round 9999px)');
        innerClipPath.set(
          `inset(${OPEN_PILL_BORDER}px ${OPEN_PILL_BORDER}px ${OPEN_PILL_BORDER}px ${OPEN_PILL_BORDER}px round 9999px)`,
        );
        pillOpacity.set(opacity);
        shadowTransform.set(
          scale === 1
            ? `translate3d(${target.left}px, ${target.top}px, 0) scale(1, 1)`
            : `translate3d(${target.left + sxOffset}px, ${target.top + syOffset}px, 0) scale(${scale}, ${scale})`,
        );
        shadowOpacity.set(opacity);
        triggerFillOpacity.set(0);
        ringOpacity.set(1);
        iconTransform.set(`translate3d(${openIconTx}px, -50%, 0) scale(1)`);
        inputOpacity.set(opacity);
        submitOpacity.set(opacity);
        submitTransform.set('translate3d(0px, -50%, 0) scale(1)');
        return;
      }

      // Symmetric anchored size curve: expands ahead of the arc on open, tucks in
      // ahead of the upward arc on close, and stays jump-free on mid-flight interrupts.
      const { startU, startWp } = morphAnchorRef.current;
      let wp: number;
      if (phaseRef.current === 'open') {
        const span = 1 - startU;
        const s = span > 0.0001 ? Math.min(1, Math.max(0, (u - startU) / span)) : 1;
        wp = startWp + (1 - startWp) * (1 - Math.pow(1 - s, 1.85));
      } else {
        const s = startU > 0.0001 ? Math.min(1, Math.max(0, u / startU)) : 0;
        wp = startWp * Math.pow(s, 1.6);
      }
      lastWpRef.current = wp;

      // Quadratic Bézier arc with control point (originAnchorX, target.top + arcDip):
      // x follows u² while y dips briefly below target.top and scoops up into its resting position.
      const anchorRight = origin.left + origin.width / 2 >= target.left + target.width / 2;
      const originAnchorX = anchorRight ? origin.left + origin.width : origin.left;
      const targetAnchorX = anchorRight ? target.left + target.width : target.left;
      const arcDip = Math.min(130, Math.max(36, Math.max(0, target.top - origin.top) * 0.65));

      const anchorX = originAnchorX + (targetAnchorX - originAnchorX) * (u * u);
      let visY =
        origin.top + (target.top - origin.top) * (1 - (1 - u) * (1 - u)) + 2 * u * (1 - u) * arcDip;
      const visW = origin.width + (target.width - origin.width) * wp;
      const visH = origin.height + (target.height - origin.height) * wp;
      let visLeft = anchorRight ? anchorX - visW : anchorX;

      // Keep the pill laid out at final target dimensions; mask via dual concentric GPU clip-paths
      // so the 2px Figma focus border wraps all 4 sides cleanly with zero width/height reflow.
      const clipY = Math.max(0, (target.height - visH) / 2);
      const clipHorizontal = Math.max(0, target.width - visW);
      const clipL = isRtl ? clipHorizontal : 0;
      const clipR = isRtl ? 0 : clipHorizontal;
      let pillTx = visLeft - clipL;
      let pillTy = visY - clipY;

      // The entrance spring travels slightly past 1. Hold the arc on the rest pose and
      // nudge the pill a few pixels along its arrival tangent, then settle back.
      if (rawU > 1) {
        const tangentX = 2 * (targetAnchorX - originAnchorX);
        const tangentY = -2 * arcDip;
        const tangentLength = Math.hypot(tangentX, tangentY) || 1;
        const shift =
          Math.min((rawU - 1) / SEARCH_MORPH_OPEN_OVERSHOOT_AT, 1) * SEARCH_MORPH_OPEN_OVERSHOOT_PX;
        const overshootX = (tangentX / tangentLength) * shift;
        const overshootY = (tangentY / tangentLength) * shift;
        pillTx += overshootX;
        pillTy += overshootY;
        visLeft += overshootX;
        visY += overshootY;
      }

      // Leading magnifying glass starts dead-center in the 44×44 button at 16px visual size
      // and smoothly glides/scales to 20px at 32px inline-start in the open Figma pill.
      const startIconInset = origin.width / 2 - OPEN_ICON_SIZE / 2;
      const iconInset = startIconInset + (OPEN_ICON_INSET - startIconInset) * wp;
      const iconTx = isRtl ? -iconInset : iconInset;
      const iconScale =
        TRIGGER_ICON_SIZE / OPEN_ICON_SIZE + (1 - TRIGGER_ICON_SIZE / OPEN_ICON_SIZE) * wp;

      // Trailing submit button rides locked to the pill's visible trailing cap via GPU transform.
      const submitShiftX = isRtl ? clipL : -clipR;
      const fadeTriggerFill = Math.max(0, 1 - wp * 1.45);
      const revealRing = Math.min(1, Math.max(0, (wp - 0.18) / 0.62));
      const revealInput = Math.min(1, Math.max(0, (wp - 0.32) / 0.55));
      const revealSubmit = Math.min(1, Math.max(0, (wp - 0.42) / 0.5));
      const submitScale = 0.76 + 0.24 * revealSubmit;

      backdropOpacity.set(u);
      pillTransform.set(`translate3d(${pillTx}px, ${pillTy}px, 0)`);
      outerClipPath.set(`inset(${clipY}px ${clipR}px ${clipY}px ${clipL}px round 9999px)`);
      innerClipPath.set(
        `inset(${clipY + OPEN_PILL_BORDER}px ${clipR + OPEN_PILL_BORDER}px ${clipY + OPEN_PILL_BORDER}px ${clipL + OPEN_PILL_BORDER}px round 9999px)`,
      );
      pillOpacity.set(1);
      shadowTransform.set(
        `translate3d(${visLeft}px, ${visY}px, 0) scale(${visW / target.width}, ${visH / target.height})`,
      );
      shadowOpacity.set(u);
      triggerFillOpacity.set(fadeTriggerFill);
      ringOpacity.set(revealRing);
      iconTransform.set(`translate3d(${iconTx}px, -50%, 0) scale(${iconScale})`);
      inputOpacity.set(revealInput);
      submitOpacity.set(revealSubmit);
      submitTransform.set(`translate3d(${submitShiftX}px, -50%, 0) scale(${submitScale})`);
    },
    [
      backdropOpacity,
      iconTransform,
      innerClipPath,
      inputOpacity,
      outerClipPath,
      pillOpacity,
      pillTransform,
      ringOpacity,
      shadowOpacity,
      shadowTransform,
      submitOpacity,
      submitTransform,
      triggerFillOpacity,
    ],
  );

  const clearExitFallback = useCallback(() => {
    if (exitFallbackRef.current != null) {
      clearTimeout(exitFallbackRef.current);
      exitFallbackRef.current = null;
    }
  }, []);

  const finishExit = useCallback(() => {
    if (exitCompletedRef.current) return;
    exitCompletedRef.current = true;
    clearExitFallback();
    highlightSourceRef.current = null;
    setGeometry(null);
    setHighlightedIndex(null);
    onExitComplete();
  }, [clearExitFallback, onExitComplete]);

  // Mirrors `open` for the measure callback. Reading it through a ref keeps closing from
  // re-running the measure effect, which would re-bind scroll and resize listeners mid-exit.
  const openRef = useRef(open);
  useLayoutEffect(() => {
    openRef.current = open;
  }, [open]);

  // Measure synchronously before the first paint when opening so Frame 0 lifts off
  // from the exact pixel where the single button already sits, with zero jump.
  useLayoutEffect(() => {
    if (!rendered) {
      wasRenderedRef.current = false;
      geometryRef.current = null;
      progress.jump(0);
      lastWpRef.current = 0;
      morphAnchorRef.current = { startU: 0, startWp: 0 };
      return;
    }

    const slot = slotRef.current;
    if (!slot) return;

    const isFreshMount = !wasRenderedRef.current;
    wasRenderedRef.current = true;
    if (isFreshMount) {
      exitCompletedRef.current = false;
      const initialU = instant && openRef.current ? 1 : 0;
      progress.jump(initialU);
      lastWpRef.current = initialU;
      phaseRef.current = openRef.current ? 'open' : 'close';
      morphAnchorRef.current = { startU: initialU, startWp: initialU };
    }

    const measure = () => {
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight = window.innerHeight;
      const probeRect = fixedProbeRef.current?.getBoundingClientRect();
      const cbLeft = probeRect?.left ?? 0;
      const cbTop = probeRect?.top ?? 0;
      // The origin is captured once per rendered session. Re-measuring it on scroll or resize
      // (for example when the header hides mid-flight) would flip the morph mode and make an
      // in-flight open or close jump. Only the target is refreshed.
      const session = geometryRef.current;
      let origin: MorphRect | null;
      if (session) {
        origin = session.origin
          ? {
              ...session.origin,
              left: session.origin.left + session.cbLeft - cbLeft,
              top: session.origin.top + session.cbTop - cbTop,
            }
          : null;
      } else {
        const rawOrigin = measureOriginRect(slot, viewportWidth, viewportHeight, triggerHidden);
        origin = rawOrigin
          ? { ...rawOrigin, left: rawOrigin.left - cbLeft, top: rawOrigin.top - cbTop }
          : null;
      }
      const rawTarget = computeTargetRect(viewportWidth, viewportHeight);
      const target = {
        ...rawTarget,
        left: rawTarget.left - cbLeft,
        top: rawTarget.top - cbTop,
      };
      const isRtl = getComputedStyle(slot).direction === 'rtl';
      const next: MorphGeometry = {
        origin,
        target,
        cbLeft,
        cbTop,
        viewportHeight,
        isRtl,
      };
      geometryRef.current = next;
      modeRef.current = resolveMode(origin);
      applyMorphFrame(modeRef.current === 'instant' ? (openRef.current ? 1 : 0) : progress.get());
      setGeometry(next);
    };

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
    };
  }, [applyMorphFrame, instant, progress, rendered, resolveMode, triggerHidden]);

  const isMorphActive = rendered && geometry !== null;
  const mode = resolveMode(geometry?.origin ?? null);

  // Drive the unified progress smoothly on open/close, or snap instantly for keyboard shortcuts.
  useEffect(() => {
    if (!isMorphActive) return;
    modeRef.current = mode;

    if (mode === 'instant') {
      const targetU = open ? 1 : 0;
      progress.jump(targetU);
      lastWpRef.current = targetU;
      applyMorphFrame(targetU);
      if (!open) finishExit();
      return;
    }

    const currentU = progress.get();
    if (open) {
      phaseRef.current = 'open';
      morphAnchorRef.current = { startU: currentU, startWp: lastWpRef.current };
      applyMorphFrame(currentU);
      if (mode === 'morph') {
        const remaining = Math.max(0.25, 1 - Math.min(1, currentU));
        const controls = animate(progress, 1, {
          ...searchMorphOpenSpring,
          visualDuration: searchMorphOpenSpring.visualDuration * remaining,
          onUpdate: applyMorphFrame,
        });
        return () => controls.stop();
      }

      const baseTransition =
        mode === 'reduced' ? searchReducedFadeTransition : searchFallbackOpenTransition;
      const controls = animate(progress, 1, {
        ...baseTransition,
        duration: baseTransition.duration * Math.max(0.25, 1 - currentU),
        onUpdate: applyMorphFrame,
      });
      return () => controls.stop();
    }

    phaseRef.current = 'close';
    morphAnchorRef.current = { startU: currentU, startWp: lastWpRef.current };
    const baseTransition =
      mode === 'reduced'
        ? searchReducedFadeTransition
        : mode === 'fallback'
          ? searchFallbackCloseTransition
          : searchMorphCloseTransition;
    const controls = animate(progress, 0, {
      ...baseTransition,
      duration: baseTransition.duration * Math.max(0.25, currentU),
      onUpdate: applyMorphFrame,
      onComplete: finishExit,
    });
    return () => controls.stop();
  }, [applyMorphFrame, finishExit, isMorphActive, mode, open, progress]);

  // Focus the search input immediately on open and coordinate tray settle state.
  useEffect(() => {
    if (!open) {
      const resetFrame = requestAnimationFrame(() => setMorphSettled(false));
      return () => cancelAnimationFrame(resetFrame);
    }
    exitCompletedRef.current = false;
    clearExitFallback();
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
      if (instant || prefersReducedMotion) {
        setMorphSettled(true);
      }
    });
    const settledTimer =
      instant || prefersReducedMotion
        ? null
        : setTimeout(
            () => setMorphSettled(true),
            Math.round(searchMorphOpenSpring.visualDuration * 1000 * 0.5),
          );
    return () => {
      cancelAnimationFrame(frame);
      if (settledTimer != null) clearTimeout(settledTimer);
    };
  }, [clearExitFallback, instant, open, prefersReducedMotion]);

  // Safety timeout for exit completion (headless browsers where onComplete may not fire).
  useEffect(() => {
    if (!rendered || open) return;
    if (instant) {
      finishExit();
      return;
    }
    clearExitFallback();
    const timeoutMs =
      Math.max(
        SEARCH_MORPH_CLOSE_MS,
        DURATION.searchBackdropClose * 1000,
        DURATION.searchReducedFade * 1000,
      ) + 80;
    exitFallbackRef.current = setTimeout(finishExit, timeoutMs);
    return clearExitFallback;
  }, [clearExitFallback, finishExit, instant, open, rendered]);

  useEffect(() => clearExitFallback, [clearExitFallback]);

  // Keep Tab focus cycling strictly inside the modal search dialog while it is mounted, including
  // during the exit morph so Tab cannot escape while the backdrop is still visible.
  useEffect(() => {
    if (!rendered) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      if (!open) {
        event.preventDefault();
        return;
      }
      const container = dialogRef.current;
      if (!container) return;
      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.tabIndex >= 0 && el.offsetParent !== null);
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (!active || active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (!active || active === last || !container.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, rendered]);

  const trimmedQuery = query.trim();
  const resolvedSuggestions: SiteHeaderSearchSuggestion[] =
    search.renderResults != null || !search.suggestions
      ? []
      : typeof search.suggestions === 'function'
        ? search.suggestions(query)
        : trimmedQuery
          ? search.suggestions.filter((item) =>
              item.label.toLowerCase().includes(trimmedQuery.toLowerCase()),
            )
          : [];

  const activeSuggestionIndex =
    highlightedIndex !== null && resolvedSuggestions.length > 0
      ? Math.min(highlightedIndex, resolvedSuggestions.length - 1)
      : null;

  // Keep the keyboard-highlighted option inside the scrolling tray. Only the tray scrolls here,
  // never the page or the header, and mouse hover does not move the list.
  useEffect(() => {
    if (activeSuggestionIndex === null || highlightSourceRef.current !== 'keyboard') return;
    const scroller = trayScrollRef.current;
    const option = scroller?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]');
    if (!scroller || !option) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const optionRect = option.getBoundingClientRect();
    if (optionRect.top < scrollerRect.top) {
      scroller.scrollTop -= scrollerRect.top - optionRect.top;
    } else if (optionRect.bottom > scrollerRect.bottom) {
      scroller.scrollTop += optionRect.bottom - scrollerRect.bottom;
    }
  }, [activeSuggestionIndex]);

  const handleSelectSuggestion = (suggestion: SiteHeaderSearchSuggestion) => {
    suggestion.onSelect?.();
    search.onSelectSuggestion?.(suggestion);
    onClose();
  };

  const handleSuggestionHover = (index: number) => {
    if (highlightedIndex === index) return;
    highlightSourceRef.current = 'mouse';
    setHighlightedIndex(index);
  };

  const handleBackdropClick = () => {
    onClose();
    requestAnimationFrame(() => {
      // A controlled host can decline the close and keep the modal open. If focus still fell out of
      // the dialog (for example on a touch tap), put it back on the field.
      if (!openRef.current) return;
      const active = document.activeElement;
      if (!active || active === document.body) {
        inputRef.current?.focus({ preventScroll: true });
      }
    });
  };

  const handleSuggestionFocus = (index: number) => {
    highlightSourceRef.current = 'keyboard';
    setHighlightedIndex((current) => (current === index ? current : index));
  };

  const handleReturnToInput = () => {
    inputRef.current?.focus({ preventScroll: true });
  };

  const handleSuggestionsLeave = () => {
    if (highlightSourceRef.current !== 'mouse') return;
    highlightSourceRef.current = null;
    setHighlightedIndex(null);
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (resolvedSuggestions.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        highlightSourceRef.current = 'keyboard';
        setHighlightedIndex((current) =>
          current === null ? 0 : (current + 1) % resolvedSuggestions.length,
        );
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        highlightSourceRef.current = 'keyboard';
        setHighlightedIndex((current) =>
          current === null
            ? resolvedSuggestions.length - 1
            : (current - 1 + resolvedSuggestions.length) % resolvedSuggestions.length,
        );
        return;
      }
      if (event.key === 'Enter' && activeSuggestionIndex !== null) {
        const selected = resolvedSuggestions[activeSuggestionIndex];
        if (selected) {
          event.preventDefault();
          handleSelectSuggestion(selected);
          return;
        }
      }
    }
    if (event.key === 'Enter') {
      search.onSubmit?.(query);
    }
  };

  const customResultsContent = isMorphActive
    ? search.renderResults?.({
        query,
        setQuery: onQueryChange,
        close: onClose,
      })
    : null;
  const hasCustomResults = customResultsContent != null && customResultsContent !== false;
  const hasSuggestions = isMorphActive && !hasCustomResults && resolvedSuggestions.length > 0;
  const showTray = isMorphActive && open && (hasCustomResults || hasSuggestions);
  // Built-in suggestions are a listbox the input controls; custom `renderResults` content is not.
  const suggestionsVisible = showTray && hasSuggestions;

  const target = geometry?.target ?? null;

  const trayTransition = instant
    ? { duration: 0 }
    : prefersReducedMotion
      ? searchReducedFadeTransition
      : {
          ...searchTrayEnterTransition,
          delay: morphSettled ? 0 : 0.08,
        };

  const resolvedLabel = search.label ?? 'Search';
  const resolvedSubmitLabel = search.submitLabel ?? resolvedLabel;
  const resolvedSuggestionsLabel = search.suggestionsLabel ?? 'Suggestions';

  const trayMaxHeight = geometry
    ? getSearchTrayMaxHeight({
        viewportHeight: geometry.viewportHeight,
        containerTop: geometry.cbTop,
        targetTop: geometry.target.top,
        targetHeight: geometry.target.height,
      })
    : undefined;

  return (
    <div
      ref={slotRef}
      data-header-search-trigger=""
      className="relative inline-flex size-11 shrink-0"
    >
      <span
        ref={fixedProbeRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 size-0"
      />

      {isMorphActive && target ? (
        <>
          <motion.div
            data-header-search-backdrop=""
            aria-hidden
            className="bg-black/50 fixed z-10 h-dvh w-screen transform-gpu backdrop-blur-[2px] will-change-[opacity] dark:bg-black/65"
            style={{
              left: -geometry.cbLeft,
              top: -geometry.cbTop,
              opacity: backdropOpacity,
            }}
            // The backdrop is not focusable, so a press on it must not blur the dialog: keep focus
            // where it is in case the host declines the close.
            onMouseDown={open ? (event) => event.preventDefault() : undefined}
            onClick={open ? handleBackdropClick : undefined}
          />

          {/* GPU-only pre-shadowed plate behind the morphing pill. */}
          <motion.div
            aria-hidden
            className="pointer-events-none fixed top-0 left-0 z-15 origin-top-left rounded-full shadow-sm will-change-[transform,opacity]"
            style={{
              width: target.width,
              height: target.height,
              transform: shadowTransform,
              opacity: shadowOpacity,
            }}
          />
        </>
      ) : null}

      <div
        ref={dialogRef}
        data-header-search-overlay={isMorphActive ? '' : undefined}
        id={isMorphActive ? dialogId : undefined}
        role={isMorphActive ? 'dialog' : undefined}
        aria-modal={isMorphActive || undefined}
        aria-label={isMorphActive ? resolvedLabel : undefined}
        className="contents"
      >
        {/* Single persistent DOM element: rests at 44×44 in the header slot, then morphs via GPU transform + dual clip-path along the arc. */}
        <motion.div
          data-header-search-pill=""
          className={
            isMorphActive
              ? 'bg-surface-raised pointer-events-auto fixed top-0 left-0 z-20 flex items-center overflow-hidden rounded-full will-change-[transform,clip-path,opacity]'
              : 'bg-surface-raised relative flex size-11 items-center overflow-hidden rounded-full'
          }
          style={
            isMorphActive && target
              ? {
                  width: target.width,
                  height: target.height,
                  transform: pillTransform,
                  clipPath: outerClipPath,
                  opacity: pillOpacity,
                }
              : {
                  width: undefined,
                  height: undefined,
                  transform: 'none',
                  clipPath: 'none',
                  opacity: 1,
                }
          }
          onClick={isMorphActive ? (event) => event.stopPropagation() : undefined}
        >
          {/* Outer 2px Figma primary-emphasis border + concentric inner surface clipped 2px inside on the GPU. */}
          {isMorphActive ? (
            <>
              <motion.span
                aria-hidden
                className="bg-border-primary-emphasis pointer-events-none absolute inset-0 z-0 rounded-full will-change-[opacity]"
                style={{ opacity: ringOpacity }}
              />
              <motion.span
                aria-hidden
                className="bg-surface-raised pointer-events-none absolute inset-0 z-1 rounded-full will-change-[clip-path]"
                style={{ clipPath: innerClipPath }}
              />
            </>
          ) : null}

          {/* Trigger hit surface when closed; cross-fades out smoothly during the morph without unmounting. */}
          <motion.button
            data-header-search-trigger-button=""
            type="button"
            aria-label={resolvedLabel}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={isMorphActive ? dialogId : undefined}
            aria-keyshortcuts={shortcutEnabled ? 'Meta+K Control+K' : undefined}
            tabIndex={isMorphActive ? -1 : 0}
            aria-hidden={isMorphActive || undefined}
            onClick={isMorphActive ? undefined : onOpen}
            className={
              isMorphActive
                ? 'bg-button-secondary-subtle pointer-events-none absolute inset-0 z-2 rounded-full will-change-[opacity]'
                : 'bg-button-secondary-subtle hover:bg-button-secondary-subtle-hover active:bg-button-secondary-subtle-pressed focus-visible:ring-border-focus absolute inset-0 z-2 cursor-pointer rounded-full transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none'
            }
            style={isMorphActive ? { opacity: triggerFillOpacity } : { opacity: 1 }}
          />

          {/* Single persistent magnifying glass: centered 16px when closed, glides/scales to 20px at 32px inline-start when open. */}
          <motion.span
            aria-hidden
            className={
              isMorphActive
                ? 'text-text-base pointer-events-none absolute top-1/2 start-0 z-3 flex size-5 items-center justify-center will-change-transform'
                : 'text-text-base-strong pointer-events-none relative z-3 mx-auto flex size-5 items-center justify-center'
            }
            style={
              isMorphActive
                ? { transform: iconTransform }
                : { transform: `scale(${TRIGGER_ICON_SIZE / OPEN_ICON_SIZE})` }
            }
          >
            <MagnifyingGlassIcon size={OPEN_ICON_SIZE} weight="regular" />
          </motion.span>

          {isMorphActive ? (
            <>
              <motion.div
                className="relative z-3 flex h-full w-full items-center ps-16 pe-[72px]"
                style={{ opacity: inputOpacity }}
              >
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => {
                    highlightSourceRef.current = null;
                    setHighlightedIndex(null);
                    onQueryChange(event.target.value);
                  }}
                  onKeyDown={handleInputKeyDown}
                  placeholder={search.placeholder ?? resolvedLabel}
                  aria-label={resolvedLabel}
                  autoComplete="off"
                  spellCheck={false}
                  enterKeyHint="search"
                  tabIndex={open ? 0 : -1}
                  aria-controls={suggestionsVisible ? listboxId : undefined}
                  aria-autocomplete={suggestionsVisible ? 'list' : undefined}
                  aria-activedescendant={
                    suggestionsVisible && activeSuggestionIndex !== null
                      ? getOptionId(activeSuggestionIndex)
                      : undefined
                  }
                  className="type-body-lg-regular text-text-base placeholder:text-text-base-muted min-w-0 flex-1 border-0 bg-transparent outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:hidden"
                />
              </motion.div>

              <motion.div
                className="absolute top-1/2 end-4 z-3 inline-flex shrink-0 will-change-[transform,opacity]"
                inert={!open || undefined}
                aria-hidden={!open || undefined}
                style={{
                  opacity: submitOpacity,
                  transform: submitTransform,
                  pointerEvents: open ? 'auto' : 'none',
                }}
              >
                <Button
                  intent="primary"
                  appearance="transparent"
                  size="md"
                  iconOnly
                  aria-label={resolvedSubmitLabel}
                  onPress={() => search.onSubmit?.(query)}
                >
                  <ArrowRightIcon
                    size={TRIGGER_ICON_SIZE}
                    weight="regular"
                    className="rtl:rotate-180"
                    aria-hidden
                  />
                </Button>
              </motion.div>
            </>
          ) : null}
        </motion.div>

        <AnimatePresence>
          {showTray && target ? (
            <motion.div
              key="search-tray"
              data-header-search-tray=""
              className="bg-surface-raised pointer-events-auto fixed z-15 flex origin-top flex-col overflow-hidden rounded-3xl p-2 shadow-sm"
              style={{
                left: target.left,
                top: target.top + target.height + TRAY_GAP,
                width: target.width,
                maxHeight: trayMaxHeight,
              }}
              initial={
                instant
                  ? { opacity: 1 }
                  : prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, transform: 'translateY(-6px) scale(0.98)' }
              }
              animate={
                instant || prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, transform: 'translateY(0px) scale(1)' }
              }
              exit={
                instant
                  ? { opacity: 0, transition: { duration: 0 } }
                  : prefersReducedMotion
                    ? { opacity: 0, transition: searchReducedFadeTransition }
                    : {
                        opacity: 0,
                        transform: 'translateY(-6px) scale(0.98)',
                        transition: searchTrayExitTransition,
                      }
              }
              transition={trayTransition}
            >
              <div
                ref={trayScrollRef}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
              >
                {hasCustomResults ? (
                  customResultsContent
                ) : (
                  <div className="flex flex-col">
                    <p className="type-body-sm-regular text-text-base-muted px-4 pt-5 pb-3">
                      {resolvedSuggestionsLabel}
                    </p>
                    <SearchSuggestionsList
                      id={listboxId}
                      label={resolvedSuggestionsLabel}
                      getOptionId={getOptionId}
                      suggestions={resolvedSuggestions}
                      activeIndex={activeSuggestionIndex}
                      query={query}
                      onSelect={handleSelectSuggestion}
                      onHover={handleSuggestionHover}
                      onLeave={handleSuggestionsLeave}
                      onOptionFocus={handleSuggestionFocus}
                      onReturnToInput={handleReturnToInput}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
