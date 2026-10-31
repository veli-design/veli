'use client';

import { useEffect, useId, useRef } from 'react';
import { BankIcon, CaretDownIcon, LockSimpleIcon } from '@phosphor-icons/react';
import { Divider } from '@veli-design/react/divider';
import { motion } from 'motion/react';

import { HeaderLanguageMenu, type SiteHeaderLanguageOption } from './header-controls';
import {
  caretTransition,
  EASE_SPEC,
  officialBannerDetailsTransition,
  officialBannerTransition,
} from './motion';

export type OfficialBannerLabels = {
  label: string;
  howToIdentify: string;
  officialLinksTitle: string;
  officialLinksDescription: string;
  secureWebsitesTitle: string;
  secureWebsitesDescription: string;
  languageLabel: string;
  languageChange: string;
};

export function OfficialWebsiteBanner({
  expanded,
  hidden,
  flagSrc,
  languages,
  language,
  onLanguageChange,
  labels,
  onDetailsHeightChange,
  onResizeAnimationComplete,
  onToggle,
  prefersReducedMotion,
}: {
  expanded: boolean;
  hidden: boolean;
  flagSrc: string;
  languages: SiteHeaderLanguageOption[];
  language: string;
  onLanguageChange: (id: string) => void;
  labels: OfficialBannerLabels;
  onDetailsHeightChange: (height: number) => void;
  onResizeAnimationComplete: () => void;
  onToggle: () => void;
  prefersReducedMotion: boolean | null;
}) {
  const detailsId = useId();
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) return;

    const updateHeight = () => onDetailsHeightChange(details.getBoundingClientRect().height);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(details);
    return () => observer.disconnect();
  }, [onDetailsHeightChange]);

  return (
    <motion.aside
      initial={false}
      animate={
        prefersReducedMotion
          ? { opacity: hidden ? 0 : 1 }
          : {
              opacity: hidden ? 0 : 1,
              transform: hidden ? 'translateY(-36px)' : 'translateY(0px)',
            }
      }
      transition={
        prefersReducedMotion ? { duration: 0.15, ease: EASE_SPEC } : officialBannerTransition
      }
      className={`from-accent-100 to-surface-raised overflow-hidden bg-linear-to-b from-[31.843%] ${
        hidden ? 'pointer-events-none' : ''
      }`}
      inert={hidden || undefined}
      aria-hidden={hidden || undefined}
    >
      <div className="flex h-9 items-center justify-between px-4 md:px-8">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={detailsId}
          className="focus-visible:ring-border-focus flex min-w-0 cursor-pointer items-center gap-2 rounded-md bg-transparent text-start focus-visible:ring-2 focus-visible:outline-none"
        >
          <span className="flex shrink-0 items-center justify-center p-1">
            <img src={flagSrc} alt="" width={18} height={12} />
          </span>
          <span className="type-caption-medium text-text-base min-w-0 truncate">
            {labels.label}
          </span>
          <span className="type-caption-medium text-text-links hidden shrink-0 items-center gap-1.5 sm:flex">
            {labels.howToIdentify}
            <motion.span
              className="inline-flex"
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : caretTransition}
            >
              <CaretDownIcon size={12} weight="regular" aria-hidden />
            </motion.span>
          </span>
        </button>

        <HeaderLanguageMenu
          variant="banner"
          languages={languages}
          language={language}
          onLanguageChange={onLanguageChange}
          labels={labels}
        />
      </div>

      <motion.div
        id={detailsId}
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : officialBannerDetailsTransition}
        onAnimationComplete={onResizeAnimationComplete}
        className="overflow-hidden"
        inert={!expanded || undefined}
        aria-hidden={!expanded || undefined}
      >
        <div ref={detailsRef} className="flex flex-col gap-6 px-4 pt-6 md:px-8">
          <div className="grid gap-6 pb-4 md:grid-cols-2 md:gap-14">
            <div className="flex gap-2">
              <BankIcon className="text-icon-primary size-6 shrink-0" aria-hidden />
              <div className="flex min-w-0 flex-col gap-1">
                <p className="type-body-md-semibold text-text-base-emphasis">
                  {labels.officialLinksTitle}
                </p>
                <p className="type-body-md-regular text-text-base-strong">
                  {labels.officialLinksDescription}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <LockSimpleIcon className="text-accent-500 size-6 shrink-0" aria-hidden />
              <div className="flex min-w-0 flex-col gap-1">
                <p className="type-body-md-semibold text-text-base-emphasis">
                  {labels.secureWebsitesTitle}
                </p>
                <p className="type-body-md-regular text-text-base-strong">
                  {labels.secureWebsitesDescription}
                </p>
              </div>
            </div>
          </div>
          <Divider appearance="subtle" className="w-full" />
        </div>
      </motion.div>
    </motion.aside>
  );
}
