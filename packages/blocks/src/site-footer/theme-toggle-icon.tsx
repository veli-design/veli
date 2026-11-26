'use client';

import { useEffect, useRef, useState } from 'react';
import { useAnimate, useReducedMotion } from 'motion/react';
import type { SiteFooterColorScheme } from './theme-toggle';

const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;
const ICON_MORPH_DURATION = 0.195;

// Phosphor bold Monitor, Sun, and Moon geometry, scaled from 256 to 24 units.
// Circular arcs use cubic Beziers; each outline has 16 segments for direct morphing.
// Keep the matching path command structures when editing these shapes.
type ThemeIconScheme = SiteFooterColorScheme;

type ThemeIconPath = { d: string; opacity: number };

const themeIconPaths: Record<ThemeIconScheme, ThemeIconPath[]> = {
  system: [
    {
      d: 'M4.5 4.5C6 4.5 8 4.5 9.5 4.5C11 4.5 13 4.5 14.5 4.5C16 4.5 18 4.5 19.5 4.5C20.3284 4.5 21 5.1716 21 6C21 7 21 8.5 21 9.5C21 10.5 21 12 21 13C21 14 21 15.5 21 16.5C21 17.3284 20.3284 18 19.5 18C18 18 16 18 14.5 18C13 18 11 18 9.5 18C8 18 6 18 4.5 18C3.6716 18 3 17.3284 3 16.5C3 15.5 3 14 3 13C3 12 3 10.5 3 9.5C3 8.5 3 7 3 6C3 5.1716 3.6716 4.5 4.5 4.5',
      opacity: 1,
    },
    {
      d: 'M15 21.375L9 21.375',
      opacity: 1,
    },
    {
      d: 'M8.53 3.84L8.53 3.84M8.53 3.84L8.53 3.84',
      opacity: 0,
    },
    {
      d: 'M5.06 18.94L5.06 18.94',
      opacity: 0,
    },
    {
      d: 'M18.94 5.06L18.94 5.06',
      opacity: 0,
    },
    {
      d: 'M18.94 18.94L18.94 18.94',
      opacity: 0,
    },
    {
      d: 'M12 21.375L12 21.375',
      opacity: 0,
    },
    {
      d: 'M21.375 12L21.375 12',
      opacity: 0,
    },
  ],
  light: [
    {
      d: 'M6.75 12C6.75 11.31056 6.885795 10.627871 7.149632 9.990912C7.41347 9.353953 7.800182 8.775197 8.287689 8.287689C8.775197 7.800182 9.353953 7.41347 9.990912 7.149632C10.627871 6.885795 11.31056 6.75 12 6.75C12.68944 6.75 13.372129 6.885795 14.009088 7.149632C14.646047 7.41347 15.224803 7.800182 15.712311 8.287689C16.199818 8.775197 16.58653 9.353953 16.850368 9.990912C17.114205 10.627871 17.25 11.31056 17.25 12C17.25 12.68944 17.114205 13.372129 16.850368 14.009088C16.58653 14.646047 16.199818 15.224803 15.712311 15.712311C15.224803 16.199818 14.646047 16.58653 14.009088 16.850368C13.372129 17.114205 12.68944 17.25 12 17.25C11.31056 17.25 10.627871 17.114205 9.990912 16.850368C9.353953 16.58653 8.775197 16.199818 8.287689 15.712311C7.800182 15.224803 7.41347 14.646047 7.149632 14.009088C6.885795 13.372129 6.75 12.68944 6.75 12',
      opacity: 1,
    },
    {
      d: 'M3.375 12L1.875 12',
      opacity: 1,
    },
    {
      d: 'M12 3.375L12 1.875M5.625 5.625L4.5 4.5',
      opacity: 1,
    },
    {
      d: 'M5.625 18.375L4.5 19.5',
      opacity: 1,
    },
    {
      d: 'M18.375 5.625L19.5 4.5',
      opacity: 1,
    },
    {
      d: 'M18.375 18.375L19.5 19.5',
      opacity: 1,
    },
    {
      d: 'M12 20.625L12 22.125',
      opacity: 1,
    },
    {
      d: 'M20.625 12L22.125 12',
      opacity: 1,
    },
  ],
  dark: [
    {
      d: 'M10.137514 2.637514C8.949558 2.997865 7.848995 3.600082 6.905016 4.406305C5.961036 5.212528 5.194054 6.205322 4.652286 7.322274C4.110519 8.439226 3.805682 9.656179 3.75694 10.89663C3.708198 12.13708 3.916605 13.374202 4.36906 14.53022C4.821514 15.686238 5.508231 16.736153 6.386039 17.613961C7.263847 18.491769 8.313762 19.178486 9.46978 19.63094C10.625798 20.083395 11.86292 20.291802 13.10337 20.24306C14.343821 20.194318 15.560774 19.889481 16.677726 19.347714C17.794678 18.805946 18.787472 18.038964 19.593695 17.094984C20.399918 16.151005 21.002135 15.050442 21.362486 13.862486C20.326272 14.176808 19.241839 14.301554 18.161319 14.230727C17.080799 14.159899 16.02193 13.894661 15.035613 13.447763C14.049296 13.000866 13.151721 12.379643 12.386039 11.613961C11.620357 10.848279 10.999134 9.950704 10.552237 8.964387C10.105339 7.97807 9.840101 6.919201 9.769273 5.838681C9.698446 4.758161 9.823192 3.673728 10.137514 2.637514',
      opacity: 1,
    },
    {
      d: 'M2.63 12L2.63 12',
      opacity: 0,
    },
    {
      d: 'M8.53 3.84L8.53 3.84M8.53 3.84L8.53 3.84',
      opacity: 0,
    },
    {
      d: 'M5.06 18.94L5.06 18.94',
      opacity: 0,
    },
    {
      d: 'M18.94 5.06L18.94 5.06',
      opacity: 0,
    },
    {
      d: 'M18.94 18.94L18.94 18.94',
      opacity: 0,
    },
    {
      d: 'M12 21.375L12 21.375',
      opacity: 0,
    },
    {
      d: 'M21.375 12L21.375 12',
      opacity: 0,
    },
  ],
};

// Traverse the monitor outline in the moon's direction to avoid twisting on wrap.
const themeIconWrapOutline =
  'M3 6C3 7 3 8.5 3 9.5C3 10.5 3 12 3 13C3 14 3 15.5 3 16.5C3 17.3284 3.6716 18 4.5 18C6 18 8 18 9.5 18C11 18 13 18 14.5 18C16 18 18 18 19.5 18C20.3284 18 21 17.3284 21 16.5C21 15.5 21 14 21 13C21 12 21 10.5 21 9.5C21 8.5 21 7 21 6C21 5.1716 20.3284 4.5 19.5 4.5C18 4.5 16 4.5 14.5 4.5C13 4.5 11 4.5 9.5 4.5C8 4.5 6 4.5 4.5 4.5C3.6716 4.5 3 5.1716 3 6';
// Grow the monitor stand from its center during the second half of the wrap.
const themeIconWrapStand = ['M12 21.375L12 21.375', 'M15 21.375L9 21.375'];

export function ThemeToggleIcon({ colorScheme }: { colorScheme: ThemeIconScheme }) {
  const [scope, animate] = useAnimate<SVGSVGElement>();
  const prefersReducedMotion = useReducedMotion();
  // Render the first scheme only; the effect morphs the paths after that.
  const [initialScheme] = useState(colorScheme);
  const previousScheme = useRef(colorScheme);

  useEffect(() => {
    const svg = scope.current;
    const paths = Array.from(svg.querySelectorAll('path'));
    const from = previousScheme.current;
    const to = colorScheme;
    previousScheme.current = colorScheme;
    const animations: { stop: () => void }[] = [];
    const showIcon = (scheme: ThemeIconScheme) => {
      paths.forEach((path, index) => {
        const { d, opacity } = themeIconPaths[scheme][index];
        path.setAttribute('d', d);
        path.setAttribute('opacity', String(opacity));
      });
    };

    // Snap any interrupted transition to the last selected icon before advancing.
    showIcon(from);

    if (prefersReducedMotion || from === to) {
      showIcon(to);
    } else {
      const isWrap = from === 'dark' && to === 'system';
      paths.forEach((path, index) => {
        const start = themeIconPaths[from][index];
        const end = themeIconPaths[to][index];
        const isStand = isWrap && index === 1;
        const targetPath = isWrap && index === 0 ? themeIconWrapOutline : end.d;

        animations.push(
          animate(
            path,
            {
              d: isStand ? themeIconWrapStand : [start.d, targetPath],
              opacity: [start.opacity, end.opacity],
            },
            {
              duration: isStand ? ICON_MORPH_DURATION / 2 : ICON_MORPH_DURATION,
              delay: isStand ? ICON_MORPH_DURATION / 2 : 0,
              ease: EASE_DRAWER,
            },
          ),
        );
      });
    }

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [animate, colorScheme, prefersReducedMotion, scope]);

  return (
    <svg
      ref={scope}
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25" // matches phosphor bold
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {themeIconPaths[initialScheme].map(({ d, opacity }, index) => (
        <path key={index} d={d} opacity={opacity} />
      ))}
    </svg>
  );
}
