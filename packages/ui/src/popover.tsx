'use client';

import {
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  OverlayArrow,
  Popover as AriaPopover,
  PopoverProps as AriaPopoverProps,
  composeRenderProps,
} from 'react-aria-components';
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { Button } from './button';
import { useVeliLanguage } from './provider';

/** Minimum inset of the arrow from the popover edge (keeps it off rounded corners). */
const POPOVER_ARROW_BOUNDARY_OFFSET = 20;

type PopoverIntent = 'primary' | 'secondary' | 'tertiary';
type PopoverArrowAxis = 'top' | 'bottom' | 'left' | 'right';

const PopoverIntentContext = React.createContext<PopoverIntent>('tertiary');

function usePopoverIntent() {
  return React.useContext(PopoverIntentContext);
}

function getPopoverArrowAxis(placement: string | null): PopoverArrowAxis {
  const axis = placement?.split(' ')[0];

  switch (axis) {
    case 'bottom':
    case 'left':
    case 'right':
      return axis;
    case 'start':
      return 'left';
    case 'end':
      return 'right';
    default:
      return 'top';
  }
}

function popoverArrowFillClass(intent: PopoverIntent | null | undefined) {
  const resolvedIntent = intent ?? 'tertiary';

  switch (resolvedIntent) {
    case 'primary':
      return 'fill-[var(--color-popover-bg-primary)]';
    case 'secondary':
      return 'fill-[var(--color-popover-bg-secondary)]';
    default:
      return 'fill-[var(--color-popover-bg-tertiary)]';
  }
}

function popoverArrowClassName(intent: PopoverIntent | null | undefined) {
  return popoverArrowFillClass(intent);
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

/** Opacity on the positioned root — React Aria waits for transitions on this element before unmounting. */
const popoverRootAnimationClassName = [
  'group outline-0 transition-opacity duration-normal ease-out',
  'data-[entering]:opacity-0 data-[exiting]:opacity-0',
  'data-[exiting]:duration-fast data-[exiting]:ease-in',
].join(' ');

/** Slide on the inner surface so we don't fight the overlay positioning transform. */
const popoverSlideClassName = [
  'transition-transform duration-normal ease-out group-data-[exiting]:duration-fast group-data-[exiting]:ease-in',
  'group-data-[placement^=top]:group-data-[entering]:translate-y-2',
  'group-data-[placement^=top]:group-data-[exiting]:translate-y-2',
  'group-data-[placement^=bottom]:group-data-[entering]:-translate-y-2',
  'group-data-[placement^=bottom]:group-data-[exiting]:-translate-y-2',
  'group-data-[placement^=left]:group-data-[entering]:translate-x-2',
  'group-data-[placement^=left]:group-data-[exiting]:translate-x-2',
  'group-data-[placement^=right]:group-data-[entering]:-translate-x-2',
  'group-data-[placement^=right]:group-data-[exiting]:-translate-x-2',
  'group-data-[placement^=start]:group-data-[entering]:translate-x-2',
  'group-data-[placement^=start]:group-data-[exiting]:translate-x-2',
  'group-data-[placement^=end]:group-data-[entering]:-translate-x-2',
  'group-data-[placement^=end]:group-data-[exiting]:-translate-x-2',
].join(' ');

function popoverArrowOverlapClass(placement: string | null) {
  switch (getPopoverArrowAxis(placement)) {
    case 'top':
      return '-translate-y-px';
    case 'bottom':
      return 'translate-y-px';
    case 'left':
      return '-translate-x-px';
    case 'right':
      return 'translate-x-px';
  }
}

const popoverVariants = cva(
  'relative flex flex-col overflow-visible rounded-xl bg-clip-padding outline-0',
  {
    variants: {
      intent: {
        primary: 'bg-popover-bg-primary text-popover-fg-on-primary',
        secondary: 'bg-popover-bg-secondary text-popover-fg-on-secondary',
        tertiary: 'bg-popover-bg-tertiary text-base shadow-xl',
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
      tertiary: 'text-base',
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
        'text-popover-fg-on-primary hover:bg-popover-fg-on-primary/10 active:bg-popover-fg-on-primary/20',
      secondary:
        'text-popover-fg-on-secondary hover:bg-popover-fg-on-secondary/10 active:bg-popover-fg-on-secondary/20',
      tertiary: 'text-base-strong',
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
      className={twMerge('flex min-w-0 flex-1 flex-col outline-none', className)}
    />
  );
}

export interface PopoverHeaderProps {
  className?: string;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
  closeButtonLabel?: string;
  showDivider?: boolean;
  children?: React.ReactNode;
}

export function PopoverHeader({
  className,
  title,
  icon,
  onClose,
  closeButtonLabel,
  showDivider = true,
  children,
}: PopoverHeaderProps) {
  const intent = usePopoverIntent();
  const languageConfig = useVeliLanguage();
  const resolvedCloseButtonLabel =
    closeButtonLabel ??
    (languageConfig.language === 'dv' ? 'ޕޮޕްއޯވަރ ބަންދުކުރައްވާ' : 'Close popover');

  return (
    <div className={twMerge('flex flex-col px-4', className)}>
      <div className="flex items-center gap-2 py-2">
        {children ?? (
          <>
            {icon ? <span className="inline-flex shrink-0 [&_svg]:size-4">{icon}</span> : null}
            {title ? <p className={popoverHeaderTitleVariants({ intent })}>{title}</p> : null}
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

export interface PopoverContentProps {
  className?: string;
  children: React.ReactNode;
}

export function PopoverContent({ className, children }: PopoverContentProps) {
  return <div className={twMerge('min-h-0 flex-1 px-4 py-3', className)}>{children}</div>;
}

export interface PopoverFooterProps {
  className?: string;
  label?: React.ReactNode;
  showDivider?: boolean;
  children?: React.ReactNode;
}

export function PopoverFooter({
  className,
  label,
  showDivider = true,
  children,
}: PopoverFooterProps) {
  const intent = usePopoverIntent();

  return (
    <div className={twMerge('flex flex-col px-4', className)}>
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
        <div className={twMerge(popoverVariants({ intent }), popoverSlideClassName)}>
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
