'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@veli-design/react/button';
import { motion, useReducedMotion } from 'motion/react';
import { ThemeToggleIcon } from './theme-toggle-icon';

export type SiteFooterColorScheme = 'light' | 'dark' | 'system';

export type SiteFooterThemeToggleLabels = {
  /** Button name prefix, such as "Change theme". */
  change: string;
  /** Announcement prefix, such as "Theme". */
  label: string;
  light: string;
  dark: string;
  auto: string;
};

export type SiteFooterThemeToggleProps = {
  colorScheme: SiteFooterColorScheme;
  onColorSchemeChange: (colorScheme: SiteFooterColorScheme) => void;
  labels: SiteFooterThemeToggleLabels;
  className?: string;
};

const nextScheme = { system: 'light', light: 'dark', dark: 'system' } as const;
const TOOLTIP_DISMISS_MS = 1000;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const TOOLTIP_OPEN_DURATION = 0.16;
const TOOLTIP_CLOSE_DURATION = 0.12;

function schemeLabel(labels: SiteFooterThemeToggleLabels, scheme: SiteFooterColorScheme) {
  return labels[scheme === 'system' ? 'auto' : scheme];
}

/** Icon button that cycles system → light → dark. The application stores the preference. */
export function SiteFooterThemeToggle({
  colorScheme,
  onColorSchemeChange,
  labels,
  className = '',
}: SiteFooterThemeToggleProps) {
  const label = schemeLabel(labels, colorScheme);
  const prefersReducedMotion = useReducedMotion();
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(dismissTimer.current), []);

  const advanceTheme = () => {
    const next = nextScheme[colorScheme];
    onColorSchemeChange(next);
    setAnnouncement(`${labels.label}: ${schemeLabel(labels, next)}`);
    setIsTooltipOpen(true);
    clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setIsTooltipOpen(false), TOOLTIP_DISMISS_MS);
  };

  return (
    <div className={`relative inline-flex shrink-0 justify-center ${className}`}>
      <Button
        type="button"
        intent="secondary"
        appearance="ghost"
        size="sm"
        iconOnly
        aria-label={`${labels.change}: ${label}`}
        onPress={advanceTheme}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setIsTooltipOpen(false);
        }}
      >
        <ThemeToggleIcon colorScheme={colorScheme} />
      </Button>
      <motion.span
        aria-hidden="true"
        className="type-body-sm-regular bg-surface-base text-text-base-strong pointer-events-none absolute bottom-full z-10 mb-2 flex h-6 origin-bottom items-center rounded-full px-2.5 whitespace-nowrap shadow-md"
        initial={false}
        animate={{
          opacity: isTooltipOpen ? 1 : 0,
          y: isTooltipOpen || prefersReducedMotion ? 0 : 3,
          scale: isTooltipOpen || prefersReducedMotion ? 1 : 0.96,
        }}
        transition={{
          duration: prefersReducedMotion
            ? 0
            : isTooltipOpen
              ? TOOLTIP_OPEN_DURATION
              : TOOLTIP_CLOSE_DURATION,
          ease: EASE_OUT,
        }}
      >
        {label}
      </motion.span>
      <output className="sr-only">{announcement}</output>
    </div>
  );
}
