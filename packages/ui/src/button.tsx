import {
  Button as AriaButton,
  ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full border-2 border-transparent font-sans font-medium antialiased transition-colors focus-visible:outline-none focus-visible:border-gray-300 focus-visible:ring-2 focus-visible:ring-fg-border-focus focus-visible:ring-offset-0 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: '',
        secondary: '',
        danger: '',
      },
      style: {
        fill: 'text-white',
        transparent: '',
        ghost: 'bg-transparent',
      },
      size: {
        // Includes visual compensation for Figma's internal "Label" horizontal inset.
        xs: 'h-7 px-[8px] gap-0.5 text-[12px] leading-[16px] tracking-[0.01em]',
        sm: 'h-9 px-2.5 gap-0.5 text-[14px] leading-[20px]',
        md: 'h-11 px-3.5 gap-0.5 text-[16px] leading-[24px]',
        lg: 'h-13 px-[16px] gap-0.5 text-[18px] leading-[26px]',
        xl: 'h-15 px-[18px] gap-0.5 text-[20px] leading-[28px]',
      },
    },
    compoundVariants: [
      // Primary
      {
        variant: 'primary',
        style: 'fill',
        className:
          'bg-bg-button-primary-default text-white hover:bg-bg-button-primary-hover active:bg-bg-button-primary-pressed disabled:bg-bg-button-disabled-disabled disabled:text-fg-text-disabled-disabled',
      },
      {
        variant: 'primary',
        style: 'transparent',
        className:
          'bg-bg-button-primary-subtle-default text-fg-text-primary-muted hover:bg-bg-button-primary-subtle-hover active:bg-bg-button-primary-subtle-pressed disabled:bg-bg-button-disabled-disabled disabled:text-fg-text-disabled-disabled',
      },
      {
        variant: 'primary',
        style: 'ghost',
        className:
          'bg-transparent text-fg-text-primary-muted hover:bg-bg-button-primary-subtle-default active:bg-bg-button-primary-subtle-hover disabled:bg-transparent disabled:text-fg-text-disabled-disabled',
      },
      // Secondary
      {
        variant: 'secondary',
        style: 'fill',
        className:
          'bg-bg-button-secondary-default text-white hover:bg-bg-button-secondary-hover active:bg-bg-button-secondary-pressed disabled:bg-bg-button-disabled-disabled disabled:text-fg-text-disabled-disabled',
      },
      {
        variant: 'secondary',
        style: 'transparent',
        className:
          'bg-bg-button-secondary-subtle-default text-fg-text-default-default hover:bg-bg-button-secondary-subtle-hover active:bg-bg-button-secondary-subtle-pressed disabled:bg-bg-button-disabled-disabled disabled:text-fg-text-disabled-disabled',
      },
      {
        variant: 'secondary',
        style: 'ghost',
        className:
          'bg-transparent text-fg-text-default-default hover:bg-bg-button-secondary-subtle-default active:bg-bg-button-secondary-subtle-hover disabled:bg-transparent disabled:text-fg-text-disabled-disabled',
      },
      // Danger
      {
        variant: 'danger',
        style: 'fill',
        className:
          'bg-bg-button-danger-default text-white hover:bg-bg-button-danger-hover active:bg-bg-button-danger-pressed disabled:bg-bg-button-disabled-disabled disabled:text-fg-text-disabled-disabled',
      },
      {
        variant: 'danger',
        style: 'transparent',
        className:
          'bg-bg-button-danger-subtle-default text-fg-text-danger-muted hover:bg-bg-button-danger-subtle-hover active:bg-bg-button-danger-subtle-pressed disabled:bg-bg-button-disabled-disabled disabled:text-fg-text-disabled-disabled',
      },
      {
        variant: 'danger',
        style: 'ghost',
        className:
          'bg-transparent text-fg-text-danger-muted hover:bg-bg-button-danger-subtle-default active:bg-bg-button-danger-subtle-hover disabled:bg-transparent disabled:text-fg-text-disabled-disabled',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      style: 'fill',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends Omit<AriaButtonProps, 'style' | 'className' | 'children'>,
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
