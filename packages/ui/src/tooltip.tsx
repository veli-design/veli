'use client';

import React from 'react';
import {
  Tooltip as AriaTooltip,
  TooltipProps as AriaTooltipProps,
  TooltipTrigger as AriaTooltipTrigger,
  OverlayArrow,
  composeRenderProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

/** Minimum inset of the arrow from the tooltip edge (keeps it off rounded corners). */
const TOOLTIP_ARROW_BOUNDARY_OFFSET = 20;

type TooltipArrowAxis = 'top' | 'bottom' | 'left' | 'right';

function getTooltipArrowAxis(placement: string | null): TooltipArrowAxis {
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

function tooltipArrowFillClass(
  size: 'sm' | 'lg' | null | undefined,
  tone: 'primary' | 'secondary' | null | undefined,
) {
  const resolvedSize = size ?? 'sm';
  const resolvedTone = tone ?? 'primary';

  if (resolvedSize === 'sm') {
    return 'fill-[var(--color-tooltip-bg-small)]';
  }

  return resolvedTone === 'secondary'
    ? 'fill-[var(--color-tooltip-bg-large-secondary)]'
    : 'fill-[var(--color-tooltip-bg-large-primary)]';
}

function tooltipArrowProps(size: 'sm' | 'lg' | null | undefined, placement: string | null) {
  const axis = getTooltipArrowAxis(placement);

  if ((size ?? 'sm') === 'lg') {
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

  return {
    width: 8,
    height: 8,
    viewBox: '0 0 8 8',
    path: 'M0 0 L4 4 L8 0',
  };
}

const tooltipVariants = cva(
  'group box-border font-sans type-body-sm-regular shadow-[0_8px_24px_rgba(15,23,42,0.16)] will-change-transform',
  {
    variants: {
      size: {
        sm: 'rounded-lg bg-tooltip-bg-small px-3 py-0.5 text-text-default-default',
        lg: 'max-w-[221px] rounded-xl px-4 py-3',
      },
      tone: {
        primary: '',
        secondary: '',
      },
      isEntering: {
        true: 'animate-in fade-in placement-bottom:slide-in-from-top-0.5 placement-top:slide-in-from-bottom-0.5 placement-left:slide-in-from-right-0.5 placement-right:slide-in-from-left-0.5 ease-out duration-200',
      },
      isExiting: {
        true: 'animate-out fade-out placement-bottom:slide-out-to-top-0.5 placement-top:slide-out-to-bottom-0.5 placement-left:slide-out-to-right-0.5 placement-right:slide-out-to-left-0.5 ease-in duration-150',
      },
    },
    compoundVariants: [
      {
        size: 'lg',
        tone: 'primary',
        className: 'bg-tooltip-bg-large-primary text-tooltip-text-on-primary',
      },
      {
        size: 'lg',
        tone: 'secondary',
        className: 'bg-tooltip-bg-large-secondary text-tooltip-text-on-secondary',
      },
    ],
    defaultVariants: {
      size: 'sm',
      tone: 'primary',
    },
  },
);

export interface TooltipProps
  extends
    Omit<AriaTooltipProps, 'children'>,
    Omit<VariantProps<typeof tooltipVariants>, 'isEntering' | 'isExiting'> {
  children: React.ReactNode;
}

export interface TooltipTriggerProps extends React.ComponentProps<typeof AriaTooltipTrigger> {}

export function TooltipTrigger(props: TooltipTriggerProps) {
  return <AriaTooltipTrigger {...props} />;
}

export function Tooltip({
  children,
  className,
  size,
  tone,
  arrowBoundaryOffset,
  ...props
}: TooltipProps) {
  const resolvedSize = size ?? 'sm';
  const showArrow = resolvedSize === 'lg';

  return (
    <AriaTooltip
      {...props}
      offset={showArrow ? 12 : 8}
      arrowBoundaryOffset={
        showArrow ? (arrowBoundaryOffset ?? TOOLTIP_ARROW_BOUNDARY_OFFSET) : undefined
      }
      className={composeRenderProps(className, (userClassName, renderProps) =>
        twMerge(
          tooltipVariants({
            size,
            tone,
            isEntering: renderProps.isEntering,
            isExiting: renderProps.isExiting,
          }),
          userClassName,
        ),
      )}
    >
      {showArrow && (
        <OverlayArrow>
          {({ placement }) => {
            const arrow = tooltipArrowProps(size, placement);

            return (
              <svg
                width={arrow.width}
                height={arrow.height}
                viewBox={arrow.viewBox}
                className={twMerge(
                  'block forced-colors:fill-[Canvas]',
                  tooltipArrowFillClass(size, tone),
                )}
              >
                <path d={arrow.path} />
              </svg>
            );
          }}
        </OverlayArrow>
      )}
      {children}
    </AriaTooltip>
  );
}
