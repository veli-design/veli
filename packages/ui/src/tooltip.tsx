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
  'group box-border max-w-[calc(100vw-24px)] wrap-anywhere font-sans type-body-sm-regular transition-[opacity,scale,translate] duration-normal ease-out origin-[var(--trigger-anchor-point)] motion-reduce:transition-none forced-colors:bg-[Canvas] forced-colors:text-[CanvasText] forced-colors:outline forced-colors:outline-[CanvasText] motion-safe:data-[entering]:scale-95 data-[entering]:opacity-0 motion-safe:data-[exiting]:scale-95 data-[exiting]:opacity-0 data-[exiting]:duration-fast data-[exiting]:ease-in motion-safe:data-[placement=top]:data-[entering]:translate-y-1 motion-safe:data-[placement=top]:data-[exiting]:translate-y-1 motion-safe:data-[placement=bottom]:data-[entering]:-translate-y-1 motion-safe:data-[placement=bottom]:data-[exiting]:-translate-y-1 motion-safe:data-[placement=left]:data-[entering]:translate-x-1 motion-safe:data-[placement=left]:data-[exiting]:translate-x-1 motion-safe:data-[placement=right]:data-[entering]:-translate-x-1 motion-safe:data-[placement=right]:data-[exiting]:-translate-x-1',
  {
    variants: {
      size: {
        sm: 'rounded-lg border-[0.5px] border-base-subtle px-3 py-0.5 shadow-md',
        lg: 'max-w-[221px] rounded-xl px-4 py-3 shadow-lg',
      },
      tone: {
        primary: 'bg-tooltip-bg-large-primary text-tooltip-text-on-primary',
        secondary: 'bg-tooltip-bg-large-secondary text-tooltip-text-on-secondary',
      },
    },
    defaultVariants: {
      size: 'sm',
      tone: 'primary',
    },
  },
);

export interface TooltipProps
  extends Omit<AriaTooltipProps, 'children'>, VariantProps<typeof tooltipVariants> {
  ref?: React.Ref<HTMLDivElement>;
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
  offset,
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
      offset={offset ?? (showArrow ? 12 : 8)}
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
                aria-hidden="true"
                width={arrow.width}
                height={arrow.height}
                viewBox={arrow.viewBox}
                className={twMerge(
                  'block forced-colors:fill-[Canvas] forced-colors:stroke-[CanvasText] forced-colors:stroke-1',
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
