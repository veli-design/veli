import React from "react";
import {
  Tooltip as AriaTooltip,
  TooltipProps as AriaTooltipProps,
  TooltipTrigger as AriaTooltipTrigger,
  OverlayArrow,
  composeRenderProps,
} from "react-aria-components";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

/** Rotate the triangle SVG for each overlay axis (same logic as Popover). */
function overlayArrowSvgClass(placement: string | null) {
  switch (placement) {
    case "bottom":
      return "[&>svg]:rotate-180";
    case "left":
      return "[&>svg]:-rotate-90";
    case "right":
      return "[&>svg]:rotate-90";
    default:
      return "";
  }
}

const tooltipVariants = cva(
  "group rounded-lg border border-fg-border-default-subtle bg-bg-surface-surface-overlay-raised px-3 py-1.5 box-border font-sans text-xs text-fg-text-default-default shadow-[0_8px_24px_rgba(15,23,42,0.16)] backdrop-blur-[4px] will-change-transform",
  {
    variants: {
      isEntering: {
        true: "animate-in fade-in placement-bottom:slide-in-from-top-0.5 placement-top:slide-in-from-bottom-0.5 placement-left:slide-in-from-right-0.5 placement-right:slide-in-from-left-0.5 ease-out duration-200",
      },
      isExiting: {
        true: "animate-out fade-out placement-bottom:slide-out-to-top-0.5 placement-top:slide-out-to-bottom-0.5 placement-left:slide-out-to-right-0.5 placement-right:slide-out-to-left-0.5 ease-in duration-150",
      },
    },
  },
);

export interface TooltipProps
  extends Omit<AriaTooltipProps, "children">,
    Omit<VariantProps<typeof tooltipVariants>, "isEntering" | "isExiting"> {
  children: React.ReactNode;
}

export interface TooltipTriggerProps
  extends React.ComponentProps<typeof AriaTooltipTrigger> {}

export function TooltipTrigger(props: TooltipTriggerProps) {
  return <AriaTooltipTrigger {...props} />;
}

export function Tooltip({ children, className, ...props }: TooltipProps) {
  return (
    <AriaTooltip
      {...props}
      offset={12}
      className={composeRenderProps(className, (userClassName, renderProps) =>
        twMerge(
          tooltipVariants({
            isEntering: renderProps.isEntering,
            isExiting: renderProps.isExiting,
          }),
          userClassName,
        ),
      )}
    >
      <OverlayArrow
        className={({ placement, defaultClassName }) =>
          twMerge(defaultClassName, overlayArrowSvgClass(placement))
        }
      >
        <svg
          width={8}
          height={8}
          viewBox="0 0 8 8"
          className="block fill-[var(--color-bg-surface-surface-overlay-raised)] stroke-[var(--color-fg-border-default-subtle)] forced-colors:fill-[Canvas] forced-colors:stroke-[ButtonBorder]"
        >
          <path d="M0 0 L4 4 L8 0" />
        </svg>
      </OverlayArrow>
      {children}
    </AriaTooltip>
  );
}
