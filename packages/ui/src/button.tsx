import {
  Button as AriaButton,
  ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-sans font-medium antialiased transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-bg-button-disabled-disabled disabled:text-fg-text-disabled-disabled",
  {
    variants: {
      variant: {
        primary: "",
        secondary: "",
        danger: "",
      },
      style: {
        fill: "text-white",
        transparent: "",
        ghost: "bg-transparent",
      },
      size: {
        xs: "h-7 px-2.5 gap-1 text-[12px]",
        sm: "h-9 px-3 gap-1 text-[14px]",
        md: "h-11 px-4 gap-1.5 text-[16px]",
        lg: "h-13 px-5 gap-2 text-[18px]",
        xl: "h-15 px-6 gap-2 text-[20px]",
      },
    },
    compoundVariants: [
      // Primary
      {
        variant: "primary",
        style: "fill",
        className:
          "isolate overflow-hidden " +
          "bg-[radial-gradient(101.12%_444.01%_at_50.19%_54.08%,_rgb(from_var(--color-bg-button-primary-default)_r_g_b_/_0.96)_0%,_rgb(from_var(--color-bg-button-primary-default)_r_g_b_/_0.72)_22.6%,_rgba(216,232,255,0)_100%)] " +
          "[backdrop-filter:blur(4px)] [-webkit-backdrop-filter:blur(4px)] shadow-[inset_0px_4px_7.5px_-2px_rgba(255,255,255,0.4)] focus-visible:ring-fg-border-focus",
      },
      {
        variant: "primary",
        style: "transparent",
        className:
          "bg-bg-button-primary-subtle-default text-fg-text-primary-muted hover:bg-bg-button-primary-subtle-hover active:bg-bg-button-primary-subtle-pressed focus-visible:ring-fg-border-focus",
      },
      {
        variant: "primary",
        style: "ghost",
        className:
          "text-fg-text-primary-muted hover:bg-bg-button-primary-subtle-default active:bg-bg-button-primary-subtle-hover focus-visible:ring-fg-border-focus",
      },
      // Secondary
      {
        variant: "secondary",
        style: "fill",
        className:
          "bg-bg-button-secondary-default hover:bg-bg-button-secondary-hover active:bg-bg-button-secondary-pressed focus-visible:ring-fg-border-focus",
      },
      {
        variant: "secondary",
        style: "transparent",
        className:
          "bg-bg-button-secondary-subtle-default text-fg-text-default-default hover:bg-bg-button-secondary-subtle-hover active:bg-bg-button-secondary-subtle-pressed focus-visible:ring-fg-border-focus",
      },
      {
        variant: "secondary",
        style: "ghost",
        className:
          "text-fg-text-default-default hover:bg-bg-button-secondary-subtle-default active:bg-bg-button-secondary-subtle-hover focus-visible:ring-fg-border-focus",
      },
      // Danger
      {
        variant: "danger",
        style: "fill",
        className:
          "bg-bg-button-danger-default hover:bg-bg-button-danger-hover active:bg-bg-button-danger-pressed focus-visible:ring-fg-border-focus",
      },
      {
        variant: "danger",
        style: "transparent",
        className:
          "bg-bg-button-danger-subtle-default text-fg-text-danger-muted hover:bg-bg-button-danger-subtle-hover active:bg-bg-button-danger-subtle-pressed focus-visible:ring-fg-border-focus",
      },
      {
        variant: "danger",
        style: "ghost",
        className:
          "text-fg-text-danger-muted hover:bg-bg-button-danger-subtle-default active:bg-bg-button-danger-subtle-hover focus-visible:ring-fg-border-focus",
      },
    ],
    defaultVariants: {
      variant: "primary",
      style: "fill",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    Omit<AriaButtonProps, "style" | "className" | "children">,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant,
  style,
  size,
  children,
  isLoading,
  isDisabled,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      {...props}
      isDisabled={isDisabled || isLoading}
      className={buttonVariants({ variant, style, size })}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </AriaButton>
  );
}
