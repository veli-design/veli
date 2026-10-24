'use client';

import {
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Heading as AriaHeading,
  OverlayArrow,
  Popover as AriaPopover,
  PopoverProps as AriaPopoverProps,
  composeRenderProps,
} from 'react-aria-components';
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { Button } from './button.js';
import { useVeliLanguage } from './provider.js';

/** Minimum inset of the arrow from the popover edge (keeps it off rounded corners). */
const POPOVER_ARROW_BOUNDARY_OFFSET = 20;

export type PopoverIntent = 'primary' | 'secondary' | 'tertiary';
type PopoverArrowAxis = 'top' | 'bottom' | 'left' | 'right';

const PopoverIntentContext = React.createContext<PopoverIntent>('tertiary');

function usePopoverIntent() {
  return React.useContext(PopoverIntentContext);
}

/** React Aria resolves `start`/`end` to a physical side before rendering the arrow. */
function getPopoverArrowAxis(placement: string | null): PopoverArrowAxis {
  switch (placement) {
    case 'bottom':
    case 'left':
    case 'right':
      return placement;
    default:
      return 'top';
  }
}

function popoverArrowClassName(intent: PopoverIntent) {
  switch (intent) {
    case 'primary':
      return 'fill-popover-bg-primary';
    case 'secondary':
      return 'fill-popover-bg-secondary';
    default:
      return 'fill-popover-bg-tertiary';
  }
}

function popoverArrowProps(placement: string | null) {
  const axis = getPopoverArrowAxis(placement);

  if (axis === 'left') {
    return {
      width: 12,
      height: 22,
      viewBox: '0 0 12 22',
      path: 'M0 0 L12 11 L0 22',
    };
  }

  if (axis === 'right') {
    return {
      width: 12,
      height: 22,
      viewBox: '0 0 12 22',
      path: 'M12 0 L0 11 L12 22',
    };
  }

  if (axis === 'bottom') {
    return {
      width: 22,
      height: 12,
      viewBox: '0 0 22 12',
      path: 'M0 12 L11 0 L22 12',
    };
  }

  return {
    width: 22,
    height: 12,
    viewBox: '0 0 22 12',
    path: 'M0 0 L11 12 L22 0',
  };
}

/**
 * Opacity stays on the positioned root so React Aria can wait for entry/exit. Scale and slide live
 * on the surface so they do not fight the overlay position transform.
 */
const popoverRootAnimationClassName = [
  'group flex min-h-0 flex-col outline-0 transition-opacity duration-normal ease-out',
  'data-[entering]:opacity-0 data-[exiting]:opacity-0',
  'data-[exiting]:duration-fast',
].join(' ');

const popoverSurfaceMotionClassName = [
  'origin-[var(--trigger-anchor-point)]',
  'transition-[scale,translate] duration-normal ease-out group-data-[exiting]:duration-fast',
  'motion-safe:group-data-[entering]:scale-[0.96] motion-safe:group-data-[exiting]:scale-[0.96]',
  'motion-safe:group-data-[placement=top]:group-data-[entering]:translate-y-2',
  'motion-safe:group-data-[placement=top]:group-data-[exiting]:translate-y-2',
  'motion-safe:group-data-[placement=bottom]:group-data-[entering]:-translate-y-2',
  'motion-safe:group-data-[placement=bottom]:group-data-[exiting]:-translate-y-2',
  'motion-safe:group-data-[placement=left]:group-data-[entering]:translate-x-2',
  'motion-safe:group-data-[placement=left]:group-data-[exiting]:translate-x-2',
  'motion-safe:group-data-[placement=right]:group-data-[entering]:-translate-x-2',
  'motion-safe:group-data-[placement=right]:group-data-[exiting]:-translate-x-2',
].join(' ');

function popoverArrowOverlapClass(placement: string | null) {
  switch (getPopoverArrowAxis(placement)) {
    case 'top':
      return '-translate-y-0.5';
    case 'bottom':
      return 'translate-y-0.5';
    case 'left':
      return '-translate-x-0.5';
    case 'right':
      return 'translate-x-0.5';
  }
}

const popoverVariants = cva(
  // max-h-[inherit] mirrors React Aria's root max-height; percentage max-height is unreliable when
  // the root only has a max-height from available space.
  `relative flex max-h-[inherit] min-h-0 w-full flex-col overflow-visible rounded-xl bg-clip-padding shadow-lg outline-0 forced-colors:outline forced-colors:outline-1 forced-colors:outline-[CanvasText] ${popoverSurfaceMotionClassName}`,
  {
    variants: {
      intent: {
        primary: 'bg-popover-bg-primary text-popover-fg-on-primary',
        secondary: 'bg-popover-bg-secondary text-popover-fg-on-secondary',
        tertiary: 'bg-popover-bg-tertiary text-base-default',
      },
    },
    defaultVariants: {
      intent: 'tertiary',
    },
  },
);

const popoverDividerVariants = cva('h-px w-full shrink-0', {
  variants: {
    intent: {
      primary: 'bg-popover-border-on-primary',
      secondary: 'bg-popover-border-on-secondary',
      tertiary: 'bg-border-base-muted',
    },
  },
  defaultVariants: {
    intent: 'tertiary',
  },
});

const popoverHeaderTitleVariants = cva('min-w-0 flex-1 type-body-sm-medium', {
  variants: {
    intent: {
      primary: 'text-popover-fg-on-primary',
      secondary: 'text-popover-fg-on-secondary',
      tertiary: 'text-base-strong',
    },
  },
  defaultVariants: {
    intent: 'tertiary',
  },
});

const popoverFooterLabelVariants = cva('shrink-0 type-caption-regular', {
  variants: {
    intent: {
      primary: 'text-popover-fg-on-primary',
      secondary: 'text-popover-fg-on-secondary',
      tertiary: 'text-base-default',
    },
  },
  defaultVariants: {
    intent: 'tertiary',
  },
});

const popoverCloseButtonVariants = cva('', {
  variants: {
    intent: {
      primary:
        'text-popover-fg-on-primary data-[hovered]:bg-popover-fg-on-primary/10 data-[pressed]:bg-popover-fg-on-primary/20 focus-visible:ring-offset-popover-bg-primary',
      secondary:
        'text-popover-fg-on-secondary data-[hovered]:bg-popover-fg-on-secondary/10 data-[pressed]:bg-popover-fg-on-secondary/20 focus-visible:ring-offset-popover-bg-secondary',
      tertiary: 'text-base-strong focus-visible:ring-offset-popover-bg-tertiary',
    },
  },
  defaultVariants: {
    intent: 'tertiary',
  },
});

export interface PopoverProps
  extends Omit<AriaPopoverProps, 'children'>, VariantProps<typeof popoverVariants> {
  showArrow?: boolean;
  children: React.ReactNode;
}

export interface PopoverTriggerProps extends React.ComponentProps<typeof AriaDialogTrigger> {}

export function PopoverTrigger(props: PopoverTriggerProps) {
  return <AriaDialogTrigger {...props} />;
}

export interface PopoverDialogProps extends React.ComponentProps<typeof AriaDialog> {}

export function PopoverDialog({ className, ...props }: PopoverDialogProps) {
  return (
    <AriaDialog
      {...props}
      className={twMerge('flex min-h-0 min-w-0 flex-1 flex-col outline-none', className)}
    />
  );
}

export interface PopoverHeaderProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title' | 'children'
> {
  /** Rendered as the dialog's title heading, which names the surrounding `PopoverDialog`. */
  title?: React.ReactNode;
  /** Heading level for `title`. */
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  icon?: React.ReactNode;
  onClose?: () => void;
  closeButtonLabel?: string;
  showDivider?: boolean;
  /** Replaces the icon and title; include a `Heading slot="title"` or label the dialog yourself. */
  children?: React.ReactNode;
}

export function PopoverHeader({
  className,
  title,
  titleLevel,
  icon,
  onClose,
  closeButtonLabel,
  showDivider = true,
  children,
  ...props
}: PopoverHeaderProps) {
  const intent = usePopoverIntent();
  const languageConfig = useVeliLanguage();
  const resolvedCloseButtonLabel =
    closeButtonLabel ??
    (languageConfig.language === 'dv' ? 'ޕޮޕްއޯވަރ ބަންދުކުރައްވާ' : 'Close popover');

  return (
    <div {...props} className={twMerge('flex shrink-0 flex-col px-4', className)}>
      <div className="flex items-center gap-2 py-2">
        {children ?? (
          <>
            {icon ? (
              <span aria-hidden className="inline-flex shrink-0 [&_svg]:size-4">
                {icon}
              </span>
            ) : null}
            {title ? (
              <AriaHeading
                slot="title"
                level={titleLevel}
                className={popoverHeaderTitleVariants({ intent })}
              >
                {title}
              </AriaHeading>
            ) : null}
          </>
        )}
        {onClose ? (
          <Button
            onPress={onClose}
            intent="secondary"
            appearance="ghost"
            size="xs"
            iconOnly
            aria-label={resolvedCloseButtonLabel}
            className={popoverCloseButtonVariants({ intent })}
          >
            <svg
              aria-hidden="true"
              className="size-3"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </Button>
        ) : null}
      </div>
      {showDivider ? <div aria-hidden className={popoverDividerVariants({ intent })} /> : null}
    </div>
  );
}

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PopoverContent({ className, children, ...props }: PopoverContentProps) {
  return (
    <div {...props} className={twMerge('min-h-0 flex-1 px-4 py-3', className)}>
      {children}
    </div>
  );
}

export interface PopoverFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  showDivider?: boolean;
  children?: React.ReactNode;
}

export function PopoverFooter({
  className,
  label,
  showDivider = true,
  children,
  ...props
}: PopoverFooterProps) {
  const intent = usePopoverIntent();

  return (
    <div {...props} className={twMerge('flex shrink-0 flex-col px-4', className)}>
      {showDivider ? <div aria-hidden className={popoverDividerVariants({ intent })} /> : null}
      <div className="flex items-center gap-2 py-3">
        {label ? <p className={popoverFooterLabelVariants({ intent })}>{label}</p> : null}
        {children ? (
          <div className="[margin-inline-start:auto] flex min-w-0 flex-1 items-center justify-end gap-2">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function Popover({
  children,
  showArrow = true,
  intent,
  className,
  arrowBoundaryOffset,
  lang,
  dir,
  ...props
}: PopoverProps) {
  const resolvedIntent = intent ?? 'tertiary';
  const offset = showArrow ? 12 : 8;
  const languageConfig = useVeliLanguage();

  return (
    <PopoverIntentContext.Provider value={resolvedIntent}>
      <AriaPopover
        offset={offset}
        lang={lang ?? languageConfig.lang}
        dir={dir ?? languageConfig.direction}
        arrowBoundaryOffset={
          showArrow ? (arrowBoundaryOffset ?? POPOVER_ARROW_BOUNDARY_OFFSET) : undefined
        }
        {...props}
        className={composeRenderProps(className, (userClassName) =>
          twMerge(popoverRootAnimationClassName, userClassName),
        )}
      >
        <div className={popoverVariants({ intent })}>
          {showArrow && (
            <OverlayArrow>
              {({ placement }) => {
                const arrow = popoverArrowProps(placement);

                return (
                  <svg
                    width={arrow.width}
                    height={arrow.height}
                    viewBox={arrow.viewBox}
                    className={twMerge(
                      'block forced-colors:fill-[Canvas]',
                      popoverArrowOverlapClass(placement),
                      popoverArrowClassName(resolvedIntent),
                    )}
                  >
                    <path d={arrow.path} />
                  </svg>
                );
              }}
            </OverlayArrow>
          )}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[inherit]">
            {children}
          </div>
        </div>
      </AriaPopover>
    </PopoverIntentContext.Provider>
  );
}
