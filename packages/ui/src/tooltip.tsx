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
import { useVeliLanguage } from './provider.js';

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
    return 'fill-[var(--veli-color-tooltip-bg-small)]';
  }

  return resolvedTone === 'secondary'
    ? 'fill-[var(--veli-color-tooltip-bg-large-secondary)]'
    : 'fill-[var(--veli-color-tooltip-bg-large-primary)]';
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
  'group box-border font-sans type-body-sm-regular transition-[opacity,transform] duration-normal ease-out will-change-transform data-[entering]:scale-[0.98] data-[entering]:opacity-0 data-[exiting]:scale-[0.98] data-[exiting]:opacity-0 data-[exiting]:duration-fast data-[exiting]:ease-in',
  {
    variants: {
      size: {
        sm: 'rounded-lg bg-tooltip-bg-small px-3 py-0.5 text-base-default shadow-md',
        lg: 'max-w-[221px] rounded-xl px-4 py-3 shadow-lg',
      },
      tone: {
        primary: '',
        secondary: '',
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
  extends Omit<AriaTooltipProps, 'children'>, VariantProps<typeof tooltipVariants> {
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
  lang,
  dir,
  ...props
}: TooltipProps) {
  const resolvedSize = size ?? 'sm';
  const showArrow = resolvedSize === 'lg';
  const languageConfig = useVeliLanguage();

  return (
    <AriaTooltip
      {...props}
      lang={lang ?? languageConfig.lang}
      dir={dir ?? languageConfig.direction}
      offset={showArrow ? 12 : 8}
      arrowBoundaryOffset={
        showArrow ? (arrowBoundaryOffset ?? TOOLTIP_ARROW_BOUNDARY_OFFSET) : undefined
      }
      className={composeRenderProps(className, (userClassName) =>
        twMerge(
          tooltipVariants({
            size,
            tone,
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
