import {
  OverlayArrow,
  Popover as AriaPopover,
  PopoverProps as AriaPopoverProps,
  composeRenderProps,
} from "react-aria-components";
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

/** Rotate the triangle SVG for each overlay axis. */
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

const popoverVariants = cva(
  "bg-bg-surface-surface-raised shadow-[0_12px_32px_rgba(15,23,42,0.16)] rounded-xl bg-clip-padding border border-fg-border-default-subtle backdrop-blur-[4px] outline-0",
  {
    variants: {
      isEntering: {
        true: "animate-in fade-in placement-bottom:slide-in-from-top-1 placement-top:slide-in-from-bottom-1 placement-left:slide-in-from-right-1 placement-right:slide-in-from-left-1 ease-out duration-200",
      },
      isExiting: {
        true: "animate-out fade-out placement-bottom:slide-out-to-top-1 placement-top:slide-out-to-bottom-1 placement-left:slide-out-to-right-1 placement-right:slide-out-to-left-1 ease-in duration-150",
      },
    },
  },
);

export interface PopoverProps
  extends Omit<AriaPopoverProps, "children">,
    Omit<VariantProps<typeof popoverVariants>, "isEntering" | "isExiting"> {
  showArrow?: boolean;
  children: React.ReactNode;
}

export function Popover({
  children,
  showArrow,
  className,
  ...props
}: PopoverProps) {
  let offset = showArrow ? 12 : 8;
  return (
    <AriaPopover
      offset={offset}
      {...props}
      className={composeRenderProps(className, (userClassName, renderProps) =>
        twMerge(
          popoverVariants({
            isEntering: renderProps.isEntering,
            isExiting: renderProps.isExiting,
          }),
          userClassName,
        ),
      )}
    >
      {showArrow && (
        <OverlayArrow
          className={({ placement, defaultClassName }) =>
            twMerge(defaultClassName, overlayArrowSvgClass(placement))
          }
        >
          <svg
            width={12}
            height={12}
            viewBox="0 0 12 12"
            className="block fill-[var(--color-bg-surface-surface-raised)] stroke-[var(--color-fg-border-default-subtle)] stroke-1 forced-colors:fill-[Canvas] forced-colors:stroke-[ButtonBorder]"
          >
            <path d="M0 0 L6 6 L12 0" />
          </svg>
        </OverlayArrow>
      )}
      {children}
    </AriaPopover>
  );
}
