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

const seaglassButtonVariants = cva(
  "relative isolate overflow-hidden border-0 transition-[background-color,background-image,box-shadow,color,border-color] duration-200 ease-out before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:content-[''] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] focus-visible:border-0 focus-visible:ring-[#80a4ff]",
  {
    variants: {
      variant: {
        primary: '',
        secondary: '',
        danger: '',
      },
      style: {
        fill: '',
        transparent: '',
        ghost: '',
      },
    },
    compoundVariants: [
      // Fill
      {
        variant: 'primary',
        style: 'fill',
        className:
          'text-white bg-transparent before:backdrop-blur-[2px] before:bg-[radial-gradient(210.2%_603.45%_at_50%_50%,rgba(0,102,255,0.96)_8%,rgba(16,112,255,0.9375)_13.75%,rgba(32,121,255,0.875)_19.5%,rgba(64,140,255,0.75)_31%,rgba(128,179,255,0.5)_54%,rgba(255,255,255,0)_100%)] hover:bg-[linear-gradient(90deg,rgba(0,102,255,0.96)_0%,rgba(0,102,255,0.96)_100%)] hover:before:backdrop-blur-none hover:before:bg-[radial-gradient(130.06%_116.78%_at_50%_50%,rgba(0,102,255,0.96)_5.91%,rgba(16,112,255,0.96)_11.79%,rgba(32,121,255,0.96)_17.67%,rgba(64,140,255,0.96)_29.43%,rgba(96,159,255,0.96)_41.19%,rgba(128,178,255,0.96)_52.95%,rgba(191,217,255,0.96)_76.48%,rgba(255,255,255,0.96)_100%)] active:before:bg-[radial-gradient(152.27%_62.83%_at_50%_50%,rgba(0,102,255,0.96)_8%,rgba(255,255,255,0.96)_100%),linear-gradient(90deg,rgba(0,102,255,0.96)_0%,rgba(0,102,255,0.96)_100%)] after:shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] hover:after:shadow-[inset_0_3px_3px_rgba(255,255,255,0.3)] active:after:shadow-[inset_0_4px_4px_rgba(255,255,255,0.25)] disabled:bg-[radial-gradient(84.08%_120.69%_at_50%_50%,rgba(215,220,228,1)_0%,rgba(255,255,255,1)_100%)] disabled:text-fg-text-disabled-disabled disabled:before:opacity-0 disabled:after:shadow-none',
      },
      {
        variant: 'secondary',
        style: 'fill',
        className:
          'text-white bg-transparent before:backdrop-blur-[2px] before:bg-[radial-gradient(210.2%_603.45%_at_50%_50%,rgba(0,14,48,0.96)_8%,rgba(16,29,61,0.9375)_13.75%,rgba(32,44,74,0.875)_19.5%,rgba(64,74,100,0.75)_31%,rgba(96,104,126,0.625)_42.5%,rgba(128,135,152,0.5)_54%,rgba(191,195,203,0.25)_77%,rgba(255,255,255,0)_100%)] hover:bg-[linear-gradient(90deg,rgba(0,14,48,0.96)_0%,rgba(0,14,48,0.96)_100%)] hover:before:backdrop-blur-none hover:before:bg-[radial-gradient(130.06%_116.78%_at_50%_50%,rgba(0,14,48,0.96)_5.91%,rgba(255,255,255,0.96)_100%)] active:before:bg-[radial-gradient(152.27%_62.83%_at_50%_50%,rgba(0,14,48,0.96)_8%,rgba(255,255,255,0.96)_100%),linear-gradient(90deg,rgba(0,14,48,0.96)_0%,rgba(0,14,48,0.96)_100%)] after:shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] hover:after:shadow-[inset_0_3px_3px_rgba(255,255,255,0.3)] active:after:shadow-[inset_0_4px_4px_rgba(255,255,255,0.25)] disabled:bg-[radial-gradient(84.08%_120.69%_at_50%_50%,rgba(215,220,228,1)_0%,rgba(255,255,255,1)_100%)] disabled:text-fg-text-disabled-disabled disabled:before:opacity-0 disabled:after:shadow-none',
      },
      {
        variant: 'danger',
        style: 'fill',
        className:
          'text-white bg-transparent before:backdrop-blur-[2px] before:bg-[radial-gradient(210.2%_603.45%_at_50%_50%,rgba(192,24,0,0.96)_8%,rgba(208,39,16,0.9375)_13.75%,rgba(223,54,32,0.875)_19.5%,rgba(255,84,64,0.75)_31%,rgba(255,143,128,0.5)_54%,rgba(255,255,255,0)_100%)] hover:bg-[linear-gradient(90deg,rgba(192,24,0,0.96)_0%,rgba(192,24,0,0.96)_100%)] hover:before:backdrop-blur-none hover:before:bg-[radial-gradient(130.06%_116.78%_at_50%_50%,rgba(192,24,0,0.96)_5.91%,rgba(255,255,255,0.96)_100%)] active:before:bg-[radial-gradient(152.27%_62.83%_at_50%_50%,rgba(192,24,0,0.96)_8%,rgba(255,255,255,0.96)_100%),linear-gradient(90deg,rgba(192,24,0,0.96)_0%,rgba(192,24,0,0.96)_100%)] after:shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] hover:after:shadow-[inset_0_3px_3px_rgba(255,255,255,0.3)] active:after:shadow-[inset_0_4px_4px_rgba(255,255,255,0.25)] disabled:bg-[radial-gradient(84.08%_120.69%_at_50%_50%,rgba(215,220,228,1)_0%,rgba(255,255,255,1)_100%)] disabled:text-fg-text-disabled-disabled disabled:before:opacity-0 disabled:after:shadow-none',
      },
      // Transparent
      {
        variant: 'primary',
        style: 'transparent',
        className:
          'text-fg-text-primary-muted bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] before:bg-[radial-gradient(55%_140%_at_50%_50%,rgba(0,102,255,0.28)_0%,rgba(0,102,255,0)_100%)] before:opacity-80 hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] hover:before:opacity-100 active:before:opacity-70 after:shadow-[inset_0_3px_3px_rgba(255,255,255,0.25)] disabled:bg-bg-button-disabled-disabled disabled:text-fg-text-disabled-disabled disabled:before:opacity-0 disabled:after:shadow-none',
      },
      {
        variant: 'secondary',
        style: 'transparent',
        className:
          'text-fg-text-default-default bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] before:bg-[radial-gradient(55%_140%_at_50%_50%,rgba(0,14,48,0.24)_0%,rgba(0,14,48,0)_100%)] before:opacity-78 hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] hover:before:opacity-94 active:before:opacity-66 after:shadow-[inset_0_3px_3px_rgba(255,255,255,0.25)] disabled:bg-bg-button-disabled-disabled disabled:text-fg-text-disabled-disabled disabled:before:opacity-0 disabled:after:shadow-none',
      },
      {
        variant: 'danger',
        style: 'transparent',
        className:
          'text-fg-text-danger-muted bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] before:bg-[radial-gradient(55%_140%_at_50%_50%,rgba(192,24,0,0.2)_0%,rgba(192,24,0,0)_100%)] before:opacity-76 hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] hover:before:opacity-90 active:before:opacity-64 after:shadow-[inset_0_3px_3px_rgba(255,255,255,0.23)] disabled:bg-bg-button-disabled-disabled disabled:text-fg-text-disabled-disabled disabled:before:opacity-0 disabled:after:shadow-none',
      },
      // Ghost
      {
        variant: 'primary',
        style: 'ghost',
        className:
          'bg-transparent text-fg-text-primary-muted before:bg-[radial-gradient(55%_140%_at_50%_50%,rgba(0,102,255,0.24)_0%,rgba(0,102,255,0)_100%)] before:opacity-0 hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] hover:before:opacity-95 active:before:opacity-84 disabled:bg-transparent disabled:text-fg-text-disabled-disabled disabled:before:opacity-0',
      },
      {
        variant: 'secondary',
        style: 'ghost',
        className:
          'bg-transparent text-fg-text-default-default before:bg-[radial-gradient(55%_140%_at_50%_50%,rgba(0,14,48,0.22)_0%,rgba(0,14,48,0)_100%)] before:opacity-0 hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] hover:before:opacity-88 active:before:opacity-74 disabled:bg-transparent disabled:text-fg-text-disabled-disabled disabled:before:opacity-0',
      },
      {
        variant: 'danger',
        style: 'ghost',
        className:
          'bg-transparent text-fg-text-danger-muted before:bg-[radial-gradient(55%_140%_at_50%_50%,rgba(192,24,0,0.2)_0%,rgba(192,24,0,0)_100%)] before:opacity-0 hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] hover:before:opacity-86 active:before:opacity-72 disabled:bg-transparent disabled:text-fg-text-disabled-disabled disabled:before:opacity-0',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      style: 'fill',
    },
  }
);

const loadingOnlyMinWidthVariants = cva('', {
  variants: {
    size: {
      xs: 'min-w-[84px]',
      sm: 'min-w-[105px]',
      md: 'min-w-[118px]',
      lg: 'min-w-[135px]',
      xl: 'min-w-[148px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const loadingIndicatorVariants = cva('', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
      xl: 'h-[22px] w-[22px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const buttonContentVariants = cva('relative z-[1] inline-flex items-center justify-center', {
  variants: {
    size: {
      xs: 'gap-0.5',
      sm: 'gap-0.5',
      md: 'gap-0.5',
      lg: 'gap-0.5',
      xl: 'gap-0.5',
    },
    hasChildren: {
      true: '',
      false: 'gap-0',
    },
  },
  defaultVariants: {
    size: 'md',
    hasChildren: true,
  },
});

export interface ButtonProps
  extends Omit<AriaButtonProps, 'style' | 'children'>,
  VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  isLoading?: boolean;
  treatment?: 'basic' | 'seaglass';
  className?: string;
}

export function Button({
  variant,
  style,
  size,
  children,
  isLoading,
  treatment = 'basic',
  isDisabled,
  className,
  ...props
}: ButtonProps) {
  const isLoadingOnly = Boolean(isLoading && !children);
  const resolvedClassName = twMerge(
    buttonVariants({ variant, style, size }),
    treatment === 'seaglass' ? seaglassButtonVariants({ variant, style }) : undefined,
    isLoadingOnly ? loadingOnlyMinWidthVariants({ size }) : undefined,
    className
  );

  return (
    <AriaButton
      {...props}
      isDisabled={isDisabled || isLoading}
      className={resolvedClassName}
    >
      {isLoading ? (
        <span className={buttonContentVariants({ size, hasChildren: Boolean(children) })}>
          <svg
            aria-hidden="true"
            className={twMerge(loadingIndicatorVariants({ size }), 'animate-spin text-current')}
            focusable="false"
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
      ) : children ? (
        <span className={buttonContentVariants({ size })}>{children}</span>
      ) : (
        children
      )}
    </AriaButton>
  );
}
