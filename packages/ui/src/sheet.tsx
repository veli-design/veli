'use client';

import { useId, type ReactNode } from 'react';
import { Heading, Text } from 'react-aria-components';
import {
  Sheet as AriaSheet,
  SheetBackdrop,
  SheetContent,
  SheetOverlay,
  SheetTrigger,
  type SheetOverlayProps,
} from 'react-aria-components/Sheet';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { XIcon } from '@phosphor-icons/react';
import { Button } from './button.js';
import { Divider } from './divider.js';
import { useVeliColorScheme, useVeliLanguage } from './provider.js';
// Share Modal’s accessible-title validation.
import { invariantDev, normalizeAccessibleText } from './a11y.js';

const sheetVariants = cva(
  // Clip corners without creating a scroll container that intercepts the native swipe timeline.
  'veli-sheet max-w-full max-h-[calc(var(--visual-viewport-height)-var(--veli-spacing-8))] overflow-clip bg-modal-bg-solid text-base-default shadow-sm outline-none forced-colors:outline-solid forced-colors:outline-1 forced-colors:-outline-offset-1 forced-colors:outline-[CanvasText]',
  {
    variants: {
      position: {
        bottom: 'rounded-t-4xl',
        // Keep a dismissal rail: React Aria 1.22 can stall at exactly full viewport width.
        start:
          'h-[var(--visual-viewport-height)] max-h-[var(--visual-viewport-height)] max-w-[calc(100%-var(--veli-spacing-8))] data-[position=left]:rounded-r-4xl data-[position=right]:rounded-l-4xl',
        end: 'h-[var(--visual-viewport-height)] max-h-[var(--visual-viewport-height)] max-w-[calc(100%-var(--veli-spacing-8))] data-[position=left]:rounded-r-4xl data-[position=right]:rounded-l-4xl',
      },
      size: { sm: 'w-md', md: 'w-xl', lg: 'w-3xl', full: 'w-full' },
      height: { content: '', viewport: '' },
    },
    compoundVariants: [
      {
        position: 'bottom',
        height: 'viewport',
        className: 'h-[calc(var(--visual-viewport-height)-var(--veli-spacing-16))]',
      },
    ],
    defaultVariants: { position: 'bottom', size: 'md', height: 'content' },
  },
);

// React Aria owns gestures, focus and scroll locking.
export interface SheetProps extends Pick<
  SheetOverlayProps,
  'isOpen' | 'defaultOpen' | 'onOpenChange'
> {
  position?: 'bottom' | 'start' | 'end';
  /** Width preset for every placement, capped to the available viewport. */
  size?: 'sm' | 'md' | 'lg' | 'full';
  /** Bottom sheet height; side drawers fill the available viewport. */
  height?: 'content' | 'viewport';
  showHandle?: boolean;
  /** Allow Escape, backdrop and swipe dismissal. Explicit close is always available. */
  isDismissable?: boolean;
  title: string;
  description?: string;
  headerActions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

export function Sheet({
  position = 'bottom',
  size = 'md',
  height = 'content',
  showHandle = true,
  isDismissable = true,
  isOpen,
  defaultOpen,
  onOpenChange,
  title,
  description,
  headerActions,
  children,
  footer,
  className,
  overlayClassName,
  contentClassName,
}: SheetProps) {
  const language = useVeliLanguage();
  const { resolvedColorScheme } = useVeliColorScheme();
  const descriptionId = useId();
  const isWide = position === 'bottom' && size === 'full';
  const normalizedTitle = normalizeAccessibleText(title);
  invariantDev(
    normalizedTitle,
    'Veli UI: Sheet requires a nonempty title so the dialog has an accessible name.',
  );
  const accessibleTitle = normalizedTitle || (language.language === 'dv' ? 'ތަފްސީލު' : 'Details');

  return (
    <SheetOverlay
      position={position}
      preventDismissal={!isDismissable}
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      lang={language.lang}
      dir={language.direction}
      data-theme={resolvedColorScheme}
      // Fractional page heights can clip the last pixel and prevent native entry from completing.
      className={twMerge(
        'veli-sheet-overlay z-50 min-h-[round(up,max(var(--page-height),100dvh),1px)]',
        overlayClassName,
      )}
    >
      {/* Match Modal's scrim; native swipe progress avoids a delayed entering-state flash. */}
      <SheetBackdrop
        swipeAnimation="veli-sheet-scrim"
        className="veli-sheet-backdrop bg-black/60 backdrop-blur-[6px] motion-reduce:animate-none!"
      />
      <AriaSheet
        data-size={size}
        data-height={height}
        className={twMerge(sheetVariants({ position, size, height }), className)}
      >
        <SheetContent
          aria-describedby={description ? descriptionId : undefined}
          lang={language.lang}
          dir={language.direction}
          className="veli-sheet-content type-body-md-regular flex max-h-[inherit] flex-col overflow-auto wrap-anywhere outline-none"
        >
          {position === 'bottom' && showHandle && (
            <div aria-hidden className="flex shrink-0 justify-center py-2 lg:hidden">
              <div className="h-1 w-10 rounded-full bg-neutral-alpha-600" />
            </div>
          )}
          <header
            className={twMerge(
              'veli-sheet-header flex shrink-0 items-center justify-between gap-4 bg-modal-bg-solid px-6 py-4',
              isWide && 'lg:px-14 lg:py-5',
            )}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Heading
                slot="title"
                className={twMerge(
                  'type-subtitle-medium text-base-strong',
                  isWide && 'lg:type-title-2-semibold',
                )}
              >
                {accessibleTitle}
              </Heading>
              {description && (
                <Text
                  id={descriptionId}
                  slot="description"
                  className="type-body-md-regular text-base-muted"
                >
                  {description}
                </Text>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {headerActions}
              <Button
                slot="close"
                intent="secondary"
                appearance="ghost"
                size="sm"
                iconOnly
                aria-label={language.language === 'dv' ? 'ލައްޕާ' : 'Close sheet'}
              >
                <XIcon aria-hidden className="size-4" />
              </Button>
            </div>
          </header>
          <Divider />
          {/* Reserve a readable body; when chrome cannot fit, SheetContent scrolls as a whole. */}
          {/* Allow scroll chaining into React Aria’s native swipe container at body boundaries. */}
          {/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
          <div
            role="region"
            aria-label={accessibleTitle}
            tabIndex={0}
            className={twMerge(
              'veli-sheet-body flex min-h-24 flex-1 flex-col gap-4 overflow-auto px-6 py-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus forced-colors:focus-visible:outline-solid forced-colors:focus-visible:outline-2 forced-colors:focus-visible:-outline-offset-2 forced-colors:focus-visible:outline-[Highlight]',
              isWide && 'lg:px-14 lg:py-8',
              contentClassName,
            )}
          >
            {children}
          </div>
          {/* eslint-enable jsx-a11y/no-noninteractive-tabindex */}
          {footer && (
            <footer
              className={twMerge(
                'veli-sheet-footer flex shrink-0 flex-col gap-4 bg-modal-bg-solid px-6 pt-2 pb-6',
                isWide && 'lg:px-14',
              )}
            >
              <Divider />
              <div className="flex flex-wrap items-center justify-end gap-2">{footer}</div>
            </footer>
          )}
        </SheetContent>
      </AriaSheet>
    </SheetOverlay>
  );
}

Sheet.Trigger = SheetTrigger;
