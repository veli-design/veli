import { useEffect, useState, type RefObject } from 'react';

/** Scroll position within this many pixels counts as the top or the bottom. */
export const SCROLL_EDGE_PX = 4;

/** Hint click moves the list by this fraction of the visible height. */
export const SCROLL_HINT_FRACTION = 0.6;

export type ScrollEdges = {
  atTop: boolean;
  hasOverflow: boolean;
  atBottom: boolean;
};

const REST_EDGES: ScrollEdges = {
  atTop: true,
  hasOverflow: false,
  atBottom: true,
};

export function readScrollEdges(el: HTMLElement): ScrollEdges {
  const max = el.scrollHeight - el.clientHeight;
  return {
    atTop: el.scrollTop <= SCROLL_EDGE_PX,
    hasOverflow: max > SCROLL_EDGE_PX,
    atBottom: el.scrollTop >= max - SCROLL_EDGE_PX,
  };
}

export function hintVisible(edges: ScrollEdges) {
  return edges.atTop && edges.hasOverflow;
}

export function bottomFadeOn(edges: ScrollEdges) {
  return edges.hasOverflow && !edges.atBottom;
}

/** Soft 32px fade once the hint has hidden. Full 96px fade while the hint is showing. */
export function bottomFadeSoft(edges: ScrollEdges) {
  return !hintVisible(edges);
}

export function topFadeOn(edges: ScrollEdges) {
  return !edges.atTop;
}

function sameEdges(current: ScrollEdges, next: ScrollEdges) {
  return (
    current.atTop === next.atTop &&
    current.hasOverflow === next.hasOverflow &&
    current.atBottom === next.atBottom
  );
}

/**
 * Derive scroll chrome from the card body. `contentKey` changes when the
 * filter or the search query replaces the tiles, so the edges are read again.
 */
export function useScrollEdges(
  ref: RefObject<HTMLElement | null>,
  contentKey: string,
): ScrollEdges {
  const [edges, setEdges] = useState<ScrollEdges>(REST_EDGES);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const next = readScrollEdges(el);
      setEdges((current) => (sameEdges(current, next) ? current : next));
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);

    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [ref, contentKey]);

  return edges;
}
