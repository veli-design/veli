import * as React from 'react';
import {
  Button as AriaButton,
  ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const buttonVariants = cva(
  'relative isolate inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-transparent font-sans font-medium antialiased transition-colors focus-visible:outline-none focus-visible:border-gray-300 focus-visible:ring-2 focus-visible:ring-fg-border-focus focus-visible:ring-offset-0 disabled:pointer-events-none',
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
      iconOnly: {
        true: 'shrink-0 px-0',
        false: '',
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
      { size: 'xs', iconOnly: true, className: 'w-7' },
      { size: 'sm', iconOnly: true, className: 'w-9' },
      { size: 'md', iconOnly: true, className: 'w-11' },
      { size: 'lg', iconOnly: true, className: 'w-13' },
      { size: 'xl', iconOnly: true, className: 'w-15' },
    ],
    defaultVariants: {
      variant: 'primary',
      style: 'fill',
      size: 'md',
      iconOnly: false,
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
          'text-white bg-transparent before:backdrop-blur-[2px] before:bg-[radial-gradient(210.2%_603.45%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(0,102,255,0.96)_8%,rgba(16,112,255,0.9375)_13.75%,rgba(32,121,255,0.875)_19.5%,rgba(64,140,255,0.75)_31%,rgba(128,179,255,0.5)_54%,rgba(255,255,255,0)_100%)] active:before:bg-[radial-gradient(152.27%_62.83%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(0,102,255,0.96)_8%,rgba(255,255,255,0.96)_100%),linear-gradient(90deg,rgba(0,102,255,0.96)_0%,rgba(0,102,255,0.96)_100%)] after:shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] hover:after:shadow-[inset_0_2px_4px_rgba(255,255,255,0.34)] active:after:shadow-[inset_0_4px_4px_rgba(255,255,255,0.25)] disabled:bg-[radial-gradient(84.08%_120.69%_at_50%_50%,rgba(215,220,228,1)_0%,rgba(255,255,255,1)_100%)] disabled:text-fg-text-disabled-disabled disabled:before:opacity-0 disabled:after:shadow-none',
      },
      {
        variant: 'secondary',
        style: 'fill',
        className:
          'text-white bg-transparent before:backdrop-blur-[2px] before:bg-[radial-gradient(210.2%_603.45%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(0,14,48,0.96)_8%,rgba(16,29,61,0.9375)_13.75%,rgba(32,44,74,0.875)_19.5%,rgba(64,74,100,0.75)_31%,rgba(96,104,126,0.625)_42.5%,rgba(128,135,152,0.5)_54%,rgba(191,195,203,0.25)_77%,rgba(255,255,255,0)_100%)] active:before:bg-[radial-gradient(152.27%_62.83%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(0,14,48,0.96)_8%,rgba(255,255,255,0.96)_100%),linear-gradient(90deg,rgba(0,14,48,0.96)_0%,rgba(0,14,48,0.96)_100%)] after:shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] hover:after:shadow-[inset_0_2px_4px_rgba(255,255,255,0.34)] active:after:shadow-[inset_0_4px_4px_rgba(255,255,255,0.25)] disabled:bg-[radial-gradient(84.08%_120.69%_at_50%_50%,rgba(215,220,228,1)_0%,rgba(255,255,255,1)_100%)] disabled:text-fg-text-disabled-disabled disabled:before:opacity-0 disabled:after:shadow-none',
      },
      {
        variant: 'danger',
        style: 'fill',
        className:
          'text-white bg-transparent before:backdrop-blur-[2px] before:bg-[radial-gradient(210.2%_603.45%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(192,24,0,0.96)_8%,rgba(208,39,16,0.9375)_13.75%,rgba(223,54,32,0.875)_19.5%,rgba(255,84,64,0.75)_31%,rgba(255,143,128,0.5)_54%,rgba(255,255,255,0)_100%)] active:before:bg-[radial-gradient(152.27%_62.83%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(192,24,0,0.96)_8%,rgba(255,255,255,0.96)_100%),linear-gradient(90deg,rgba(192,24,0,0.96)_0%,rgba(192,24,0,0.96)_100%)] after:shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] hover:after:shadow-[inset_0_2px_4px_rgba(255,255,255,0.34)] active:after:shadow-[inset_0_4px_4px_rgba(255,255,255,0.25)] disabled:bg-[radial-gradient(84.08%_120.69%_at_50%_50%,rgba(215,220,228,1)_0%,rgba(255,255,255,1)_100%)] disabled:text-fg-text-disabled-disabled disabled:before:opacity-0 disabled:after:shadow-none',
      },
      // Transparent
      {
        variant: 'primary',
        style: 'transparent',
        className:
          'text-fg-text-primary-muted bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] before:bg-[radial-gradient(55%_140%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(0,102,255,0.28)_0%,rgba(0,102,255,0)_100%)] before:opacity-80 active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:before:opacity-70 after:shadow-[inset_0_3px_3px_rgba(255,255,255,0.25)] hover:after:shadow-[inset_0_3px_4px_rgba(255,255,255,0.34)] disabled:bg-bg-button-disabled-disabled disabled:text-fg-text-disabled-disabled disabled:before:opacity-0 disabled:after:shadow-none',
      },
      {
        variant: 'secondary',
        style: 'transparent',
        className:
          'text-fg-text-default-default bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] before:bg-[radial-gradient(55%_140%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(0,14,48,0.24)_0%,rgba(0,14,48,0)_100%)] before:opacity-78 active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:before:opacity-66 after:shadow-[inset_0_3px_3px_rgba(255,255,255,0.25)] hover:after:shadow-[inset_0_3px_4px_rgba(255,255,255,0.34)] disabled:bg-bg-button-disabled-disabled disabled:text-fg-text-disabled-disabled disabled:before:opacity-0 disabled:after:shadow-none',
      },
      {
        variant: 'danger',
        style: 'transparent',
        className:
          'text-fg-text-danger-muted bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] before:bg-[radial-gradient(55%_140%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(192,24,0,0.2)_0%,rgba(192,24,0,0)_100%)] before:opacity-76 active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:before:opacity-64 after:shadow-[inset_0_3px_3px_rgba(255,255,255,0.23)] hover:after:shadow-[inset_0_3px_4px_rgba(255,255,255,0.32)] disabled:bg-bg-button-disabled-disabled disabled:text-fg-text-disabled-disabled disabled:before:opacity-0 disabled:after:shadow-none',
      },
      // Ghost
      {
        variant: 'primary',
        style: 'ghost',
        className:
          'bg-transparent text-fg-text-primary-muted before:bg-[radial-gradient(55%_140%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(0,102,255,0.24)_0%,rgba(0,102,255,0)_100%)] before:opacity-0 active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:before:opacity-84 disabled:bg-transparent disabled:text-fg-text-disabled-disabled disabled:before:opacity-0',
      },
      {
        variant: 'secondary',
        style: 'ghost',
        className:
          'bg-transparent text-fg-text-default-default before:bg-[radial-gradient(55%_140%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(0,14,48,0.22)_0%,rgba(0,14,48,0)_100%)] before:opacity-0 active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:before:opacity-74 disabled:bg-transparent disabled:text-fg-text-disabled-disabled disabled:before:opacity-0',
      },
      {
        variant: 'danger',
        style: 'ghost',
        className:
          'bg-transparent text-fg-text-danger-muted before:bg-[radial-gradient(55%_140%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(192,24,0,0.2)_0%,rgba(192,24,0,0)_100%)] before:opacity-0 active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:before:opacity-72 disabled:bg-transparent disabled:text-fg-text-disabled-disabled disabled:before:opacity-0',
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
      sm: 'h-[18px] w-[18px]',
      md: 'h-5 w-5',
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
    iconOnly: {
      true: 'gap-0',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    hasChildren: true,
    iconOnly: false,
  },
});

export interface ButtonProps
  extends Omit<AriaButtonProps, 'style' | 'className' | 'children'>,
  VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  iconOnly?: boolean;
  isLoading?: boolean;
  treatment?: 'basic' | 'seaglass';
}

type ButtonVariant = NonNullable<ButtonProps['variant']>;
type ButtonStyle = NonNullable<ButtonProps['style']>;
type SpotlightStyle = React.CSSProperties & {
  '--button-spotlight-x': string;
  '--button-spotlight-y': string;
};

export function Button({
  variant,
  style,
  size,
  children,
  iconOnly,
  isLoading,
  treatment = 'basic',
  isDisabled,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props
}: ButtonProps) {
  const isLoadingOnly = Boolean(isLoading && !children);
  const isIconOnly = Boolean(iconOnly);
  const resolvedVariant = variant ?? 'primary';
  const resolvedStyle: ButtonStyle = style ?? 'fill';
  const showSpotlight = treatment === 'seaglass' && !isDisabled && !isLoading;
  const [spotlightPosition, setSpotlightPosition] = React.useState({ x: '50%', y: '50%' });

  const handleMouseMove: NonNullable<ButtonProps['onMouseMove']> = (event) => {
    if (showSpotlight) {
      const rect = event.currentTarget.getBoundingClientRect();
      setSpotlightPosition({
        x: `${event.clientX - rect.left}px`,
        y: `${event.clientY - rect.top}px`,
      });
    }

    onMouseMove?.(event);
  };

  const handleMouseEnter: NonNullable<ButtonProps['onMouseEnter']> = (event) => {
    if (showSpotlight) {
      const rect = event.currentTarget.getBoundingClientRect();
      setSpotlightPosition({
        x: `${event.clientX - rect.left}px`,
        y: `${event.clientY - rect.top}px`,
      });
    }

    onMouseEnter?.(event);
  };

  const handleMouseLeave: NonNullable<ButtonProps['onMouseLeave']> = (event) => {
    if (showSpotlight) {
      setSpotlightPosition({ x: '50%', y: '50%' });
    }

    onMouseLeave?.(event);
  };

  const handleFocus: NonNullable<ButtonProps['onFocus']> = (event) => {
    if (showSpotlight) {
      const rect = event.currentTarget.getBoundingClientRect();
      setSpotlightPosition({
        x: `${rect.width / 2}px`,
        y: `${rect.height / 2}px`,
      });
    }

    onFocus?.(event);
  };

  const handleBlur: NonNullable<ButtonProps['onBlur']> = (event) => {
    if (showSpotlight) {
      setSpotlightPosition({ x: '50%', y: '50%' });
    }

    onBlur?.(event);
  };

  const className = twMerge(
    buttonVariants({ variant: resolvedVariant, style: resolvedStyle, size, iconOnly: isIconOnly }),
    treatment === 'seaglass'
      ? seaglassButtonVariants({ variant: resolvedVariant, style: resolvedStyle })
      : undefined,
    isLoadingOnly && !isIconOnly ? loadingOnlyMinWidthVariants({ size }) : undefined
  );
  const spotlightStyle: SpotlightStyle = {
    '--button-spotlight-x': spotlightPosition.x,
    '--button-spotlight-y': spotlightPosition.y,
  };
  const loadingIndicator = (
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
  );

  return (
    <AriaButton
      {...props}
      isDisabled={isDisabled || isLoading}
      className={className}
      style={spotlightStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {isLoading ? (
        children ? (
          <>
            <span
              className={twMerge(
                buttonContentVariants({ size, iconOnly: isIconOnly }),
                'opacity-0'
              )}
            >
              {children}
            </span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[1] inline-flex items-center justify-center"
            >
              {loadingIndicator}
            </span>
          </>
        ) : (
          <span
            className={buttonContentVariants({
              size,
              hasChildren: false,
              iconOnly: isIconOnly,
            })}
          >
            {loadingIndicator}
          </span>
        )
      ) : children ? (
        <span className={buttonContentVariants({ size, iconOnly: isIconOnly })}>
          {children}
        </span>
      ) : (
        children
      )}
    </AriaButton>
  );
}
