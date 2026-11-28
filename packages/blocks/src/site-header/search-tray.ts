/** Vertical gap between the search trigger and the suggestions tray. */
export const TRAY_GAP = 4;

/** Space kept between the tray's bottom edge and the bottom of the viewport. */
export const TRAY_BOTTOM_GAP = 16;

/**
 * Largest height the suggestions tray can take without extending past the viewport bottom. Body
 * scroll is locked while search is open, so anything below the viewport cannot be reached. There is
 * no minimum: on a short viewport the tray shrinks and its list scrolls inside it.
 */
export function getSearchTrayMaxHeight({
  viewportHeight,
  containerTop,
  targetTop,
  targetHeight,
}: {
  viewportHeight: number;
  containerTop: number;
  targetTop: number;
  targetHeight: number;
}): number {
  const trayTop = containerTop + targetTop + targetHeight + TRAY_GAP;
  return Math.max(0, viewportHeight - trayTop - TRAY_BOTTOM_GAP);
}
