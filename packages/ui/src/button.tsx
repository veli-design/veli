'use client';

import * as React from 'react';
import { Button as AriaButton, ButtonProps as AriaButtonProps } from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { hasAccessibleName, invariantDev } from './a11y';

const buttonVariants = cva(
  'relative isolate inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full border-transparent font-sans antialiased transition-colors duration-normal ease-out focus-visible:outline-none focus-visible:border-base-subtle focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface-base disabled:pointer-events-none',
  {
    variants: {
      intent: {
        primary: '',
        secondary: '',
        danger: '',
      },
      appearance: {
        fill: 'text-base-inverted',
        transparent: '',
        ghost: 'bg-transparent',
      },
      size: {
        // Includes visual compensation for Figma's internal "Label" horizontal inset.
        xs: 'h-7 px-2 gap-2',
        sm: 'h-9 px-2.5 gap-2',
        md: 'h-11 px-3.5 gap-2',
        lg: 'h-13 px-4 gap-2',
        xl: 'h-15 px-5 gap-2',
      },
      iconOnly: {
        true: 'shrink-0 px-0',
        false: '',
      },
    },
    compoundVariants: [
      // Primary
      {
        intent: 'primary',
        appearance: 'fill',
        className:
          'bg-button-primary text-white hover:bg-button-primary-hover active:bg-button-primary-pressed disabled:bg-button-disabled disabled:text-disabled',
      },
      {
        intent: 'primary',
        appearance: 'transparent',
        className:
          'bg-button-primary-subtle text-primary-muted hover:bg-button-primary-subtle-hover active:bg-button-primary-subtle-pressed disabled:bg-button-disabled disabled:text-disabled',
      },
      {
        intent: 'primary',
        appearance: 'ghost',
        className:
          'bg-transparent text-primary hover:bg-button-primary-subtle active:bg-button-primary-subtle-hover disabled:bg-transparent disabled:text-disabled',
      },
      // Secondary
      {
        intent: 'secondary',
        appearance: 'fill',
        className:
          'bg-button-secondary text-base-inverted hover:bg-button-secondary-hover active:bg-button-secondary-pressed disabled:bg-button-disabled disabled:text-disabled',
      },
      {
        intent: 'secondary',
        appearance: 'transparent',
        className:
          'bg-button-secondary-subtle text-base-default hover:bg-button-secondary-subtle-hover active:bg-button-secondary-subtle-pressed disabled:bg-button-disabled disabled:text-disabled',
      },
      {
        intent: 'secondary',
        appearance: 'ghost',
        className:
          'bg-transparent text-base-default hover:bg-button-secondary-subtle active:bg-button-secondary-subtle-hover disabled:bg-transparent disabled:text-disabled',
      },
      // Danger
      {
        intent: 'danger',
        appearance: 'fill',
        className:
          'bg-button-danger text-white hover:bg-button-danger-hover active:bg-button-danger-pressed disabled:bg-button-disabled disabled:text-disabled',
      },
      {
        intent: 'danger',
        appearance: 'transparent',
        className:
          'bg-button-danger-subtle text-danger-muted hover:bg-button-danger-subtle-hover active:bg-button-danger-subtle-pressed disabled:bg-button-disabled disabled:text-disabled',
      },
      {
        intent: 'danger',
        appearance: 'ghost',
        className:
          'bg-transparent text-danger-muted hover:bg-button-danger-subtle active:bg-button-danger-subtle-hover disabled:bg-transparent disabled:text-disabled',
      },
      { size: 'xs', iconOnly: true, className: 'w-7' },
      { size: 'sm', iconOnly: true, className: 'w-9' },
      { size: 'md', iconOnly: true, className: 'w-11' },
      { size: 'lg', iconOnly: true, className: 'w-13' },
      { size: 'xl', iconOnly: true, className: 'w-15' },
    ],
    defaultVariants: {
      intent: 'primary',
      appearance: 'fill',
      size: 'md',
      iconOnly: false,
    },
  },
);

const seaglassFillOverlay =
  'shadow-[0_1px_2px_rgba(0,14,48,0.14)] hover:shadow-[0_2px_6px_rgba(0,14,48,0.16)] active:shadow-[0_1px_1px_rgba(0,14,48,0.12)] [background-image:radial-gradient(ellipse_var(--button-seaglass-overlay-radius-x,var(--button-seaglass-radius-x))_var(--button-seaglass-overlay-radius-y,var(--button-seaglass-radius-y))_at_var(--button-spotlight-position),rgba(255,255,255,var(--button-seaglass-fill-alpha-1,0))_var(--button-seaglass-fill-stop-1,8%),rgba(255,255,255,var(--button-seaglass-fill-alpha-2,0.0625))_var(--button-seaglass-fill-stop-2,13.75%),rgba(255,255,255,var(--button-seaglass-fill-alpha-3,0.125))_var(--button-seaglass-fill-stop-3,19.5%),rgba(255,255,255,var(--button-seaglass-fill-alpha-4,0.25))_var(--button-seaglass-fill-stop-4,31%),rgba(255,255,255,var(--button-seaglass-fill-alpha-5,0.5))_var(--button-seaglass-fill-stop-5,54%),rgba(255,255,255,var(--button-seaglass-fill-alpha-6,0))_var(--button-seaglass-fill-stop-6,100%))] before:transition-shadow before:duration-normal before:ease-out before:shadow-[inset_0_1px_2px_rgba(255,255,255,0.26),inset_0_-1px_2px_rgba(0,14,48,0.08)] hover:before:shadow-[inset_0_2px_4px_rgba(255,255,255,0.36),inset_0_-1px_2px_rgba(0,14,48,0.07)] active:before:shadow-[inset_0_3px_5px_rgba(0,14,48,0.12),inset_0_1px_1px_rgba(255,255,255,0.18)] after:bg-[radial-gradient(ellipse_var(--button-seaglass-active-radius-x,var(--button-seaglass-radius-x))_var(--button-seaglass-active-radius-y,var(--button-seaglass-radius-y))_at_var(--button-spotlight-position),rgba(255,255,255,var(--button-seaglass-active-alpha-1,0))_var(--button-seaglass-active-stop-1,6%),rgba(255,255,255,var(--button-seaglass-active-alpha-2,0.08))_var(--button-seaglass-active-stop-2,14%),rgba(255,255,255,var(--button-seaglass-active-alpha-3,0.18))_var(--button-seaglass-active-stop-3,28%),rgba(255,255,255,var(--button-seaglass-active-alpha-4,0.32))_var(--button-seaglass-active-stop-4,46%),rgba(255,255,255,var(--button-seaglass-active-alpha-5,0.48))_var(--button-seaglass-active-stop-5,68%),rgba(255,255,255,var(--button-seaglass-active-alpha-6,0.64))_var(--button-seaglass-active-stop-6,100%))] after:opacity-0 after:transition-opacity after:duration-normal after:ease-spring active:after:opacity-[var(--button-seaglass-active-overlay-opacity,1)] active:after:duration-fast active:after:ease-out disabled:bg-[radial-gradient(84.08%_120.69%_at_50%_50%,rgba(215,220,228,1)_0%,rgba(255,255,255,1)_100%)] disabled:text-disabled disabled:shadow-none disabled:before:opacity-0 disabled:before:shadow-none disabled:after:opacity-0';

const seaglassButtonVariants = cva(
  "relative isolate overflow-hidden border-0 transition-[background-color,background-image,box-shadow,color,border-color,transform] duration-normal ease-spring before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:content-[''] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] focus-visible:border-0 focus-visible:ring-border-focus",
  {
    variants: {
      intent: {
        primary: '',
        secondary: '',
        danger: '',
      },
      appearance: {
        fill: '',
        transparent: '',
        ghost: '',
      },
    },
    compoundVariants: [
      // Fill
      {
        intent: 'primary',
        appearance: 'fill',
        className: `${seaglassFillOverlay} bg-[#0066FF] text-white hover:bg-[#0066FF] active:bg-[#0052CC]`,
      },
      {
        intent: 'secondary',
        appearance: 'fill',
        className: `${seaglassFillOverlay} bg-button-secondary text-base-inverted hover:bg-button-secondary-hover active:bg-button-secondary-pressed`,
      },
      {
        intent: 'danger',
        appearance: 'fill',
        className: `${seaglassFillOverlay} bg-button-danger text-danger-inverted hover:bg-button-danger-hover active:bg-button-danger-pressed`,
      },
      {
        appearance: 'fill',
        className:
          'active:translate-y-px active:scale-[0.985] active:duration-fast active:ease-out',
      },
      // Transparent
      {
        intent: 'primary',
        appearance: 'transparent',
        className:
          'text-primary-muted bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] before:bg-[radial-gradient(55%_140%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(0,102,255,0.28)_0%,rgba(0,102,255,0)_100%)] before:opacity-80 active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:before:opacity-70 after:shadow-[inset_0_3px_3px_rgba(255,255,255,0.25)] hover:after:shadow-[inset_0_3px_4px_rgba(255,255,255,0.34)] disabled:bg-button-disabled disabled:text-disabled disabled:before:opacity-0 disabled:after:shadow-none',
      },
      {
        intent: 'secondary',
        appearance: 'transparent',
        className:
          'text-base-default bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] before:bg-[radial-gradient(55%_140%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(0,14,48,0.24)_0%,rgba(0,14,48,0)_100%)] before:opacity-78 active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:before:opacity-66 after:shadow-[inset_0_3px_3px_rgba(255,255,255,0.25)] hover:after:shadow-[inset_0_3px_4px_rgba(255,255,255,0.34)] disabled:bg-button-disabled disabled:text-disabled disabled:before:opacity-0 disabled:after:shadow-none',
      },
      {
        intent: 'danger',
        appearance: 'transparent',
        className:
          'text-danger-muted bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] before:bg-[radial-gradient(55%_140%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(192,24,0,0.2)_0%,rgba(192,24,0,0)_100%)] before:opacity-76 active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:before:opacity-64 after:shadow-[inset_0_3px_3px_rgba(255,255,255,0.23)] hover:after:shadow-[inset_0_3px_4px_rgba(255,255,255,0.32)] disabled:bg-button-disabled disabled:text-disabled disabled:before:opacity-0 disabled:after:shadow-none',
      },
      // Ghost
      {
        intent: 'primary',
        appearance: 'ghost',
        className:
          'bg-transparent text-primary-muted before:bg-[radial-gradient(55%_140%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(0,102,255,0.24)_0%,rgba(0,102,255,0)_100%)] before:opacity-0 active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:before:opacity-84 disabled:bg-transparent disabled:text-disabled disabled:before:opacity-0',
      },
      {
        intent: 'secondary',
        appearance: 'ghost',
        className:
          'bg-transparent text-base-default before:bg-[radial-gradient(55%_140%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(0,14,48,0.22)_0%,rgba(0,14,48,0)_100%)] before:opacity-0 active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:before:opacity-74 disabled:bg-transparent disabled:text-disabled disabled:before:opacity-0',
      },
      {
        intent: 'danger',
        appearance: 'ghost',
        className:
          'bg-transparent text-danger-muted before:bg-[radial-gradient(55%_140%_at_var(--button-spotlight-x)_var(--button-spotlight-y),rgba(192,24,0,0.2)_0%,rgba(192,24,0,0)_100%)] before:opacity-0 active:bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] active:before:opacity-72 disabled:bg-transparent disabled:text-disabled disabled:before:opacity-0',
      },
    ],
    defaultVariants: {
      intent: 'primary',
      appearance: 'fill',
    },
  },
);

const loadingOnlyMinWidthVariants = cva('', {
  variants: {
    size: {
      xs: 'min-w-21',
      sm: 'min-w-26.25',
      md: 'min-w-29.5',
      lg: 'min-w-33.75',
      xl: 'min-w-37',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const loadingIndicatorVariants = cva('', {
  variants: {
    size: {
      xs: 'size-3',
      sm: 'size-4.5',
      md: 'size-5',
      lg: 'size-5',
      xl: 'size-5.5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const buttonContentVariants = cva(
  'relative z-[1] inline-flex items-center justify-center font-sans antialiased',
  {
    variants: {
      size: {
        xs: 'gap-2 type-caption-medium',
        sm: 'gap-2 type-body-sm-medium',
        md: 'gap-2 type-body-md-medium',
        lg: 'gap-2 type-body-lg-medium',
        xl: 'gap-2 type-subtitle-medium',
      },
      hasChildren: {
        true: '',
        false: 'gap-0',
      },
      iconOnly: {
        true: 'gap-0 px-0',
        false: 'px-1.5',
      },
    },
    defaultVariants: {
      size: 'md',
      hasChildren: true,
      iconOnly: false,
    },
  },
);

type AccessibleButtonName =
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string };

interface ButtonSharedProps
  extends
    Omit<AriaButtonProps, 'style' | 'children'>,
    Omit<VariantProps<typeof buttonVariants>, 'iconOnly'> {
  'aria-busy'?: React.AriaAttributes['aria-busy'];
  isLoading?: boolean;
  seaglass?: boolean;
  className?: string;
}

type IconOnlyButtonProps = ButtonSharedProps &
  AccessibleButtonName & {
    children?: React.ReactNode;
    iconOnly: true;
  };

type StandardButtonProps = ButtonSharedProps & {
  children?: React.ReactNode;
  iconOnly?: false | undefined;
};

export type ButtonProps = IconOnlyButtonProps | StandardButtonProps;

type ButtonAppearance = NonNullable<ButtonProps['appearance']>;
type SpotlightStyle = React.CSSProperties & {
  '--button-seaglass-radius-x': string;
  '--button-seaglass-radius-y': string;
  '--button-spotlight-x': string;
  '--button-spotlight-y': string;
  '--button-spotlight-position': string;
  '--button-spotlight-size': string;
};

type SeaglassMetrics = {
  radiusX: string;
  radiusY: string;
  spotlightSize: string;
};

type SpotlightPosition = {
  x: string;
  y: string;
};

type NumericSpotlightPosition = {
  x: number;
  y: number;
};

const defaultSeaglassMetrics: SeaglassMetrics = {
  radiusX: '320px',
  radiusY: '362px',
  spotlightSize: '82px',
};

const defaultSpotlightPosition: SpotlightPosition = {
  x: '50%',
  y: '50%',
};

const spotlightCenterAnimationDuration = 180;

interface UseButtonSpotlightOptions {
  seaglass: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  onMouseEnter?: ButtonProps['onMouseEnter'];
  onMouseMove?: ButtonProps['onMouseMove'];
  onMouseLeave?: ButtonProps['onMouseLeave'];
  onPointerDown?: ButtonProps['onPointerDown'];
  onPointerUp?: ButtonProps['onPointerUp'];
  onPointerCancel?: ButtonProps['onPointerCancel'];
  onFocus?: ButtonProps['onFocus'];
  onBlur?: ButtonProps['onBlur'];
}

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

function getSeaglassMetrics(width: number, height: number): SeaglassMetrics {
  const normalizedWidth = Math.min(Math.max((width - 120) / 300, 0), 1);
  const radiusMultiplier = 2.1 - normalizedWidth * 0.55;
  const radiusX = Math.round(Math.max(width * radiusMultiplier, 220));
  const radiusY = Math.round(Math.max(height * 6, 280));
  const spotlightSize = Math.round(Math.min(Math.max(width * 0.24, 72), 96));

  return {
    radiusX: `${radiusX}px`,
    radiusY: `${radiusY}px`,
    spotlightSize: `${spotlightSize}px`,
  };
}

function ButtonLoadingIndicator({ size }: { size: ButtonProps['size'] }) {
  return (
    <svg
      aria-hidden="true"
      className={twMerge(loadingIndicatorVariants({ size }), 'animate-spin text-current')}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function ButtonContent({
  children,
  isIconOnly,
  isLoading,
  size,
}: {
  children: React.ReactNode;
  isIconOnly: boolean;
  isLoading?: boolean;
  size: ButtonProps['size'];
}) {
  const loadingIndicator = <ButtonLoadingIndicator size={size} />;

  if (isLoading) {
    if (children) {
      return (
        <>
          <span
            className={twMerge(buttonContentVariants({ size, iconOnly: isIconOnly }), 'opacity-0')}
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
      );
    }

    return (
      <span
        className={buttonContentVariants({
          size,
          hasChildren: false,
          iconOnly: isIconOnly,
        })}
      >
        {loadingIndicator}
      </span>
    );
  }

  return children ? (
    <span className={buttonContentVariants({ size, iconOnly: isIconOnly })}>{children}</span>
  ) : (
    children
  );
}

function useButtonSpotlight({
  seaglass,
  isDisabled,
  isLoading,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onFocus,
  onBlur,
}: UseButtonSpotlightOptions) {
  const showSpotlight = seaglass && !isDisabled && !isLoading;
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const spotlightFrameRef = React.useRef<number | null>(null);
  const spotlightAnimationFrameRef = React.useRef<number | null>(null);
  const isPressingRef = React.useRef(false);
  const pendingSpotlightPositionRef = React.useRef(defaultSpotlightPosition);
  const currentSpotlightPositionRef = React.useRef<NumericSpotlightPosition | null>(null);
  const [seaglassMetrics, setSeaglassMetrics] = React.useState(defaultSeaglassMetrics);

  const writeSpotlightPosition = React.useCallback((x: string, y: string) => {
    const button = buttonRef.current;

    if (!button) {
      return;
    }

    button.style.setProperty('--button-spotlight-x', x);
    button.style.setProperty('--button-spotlight-y', y);
    button.style.setProperty('--button-spotlight-position', `${x} ${y}`);

    const numericX = Number.parseFloat(x);
    const numericY = Number.parseFloat(y);
    currentSpotlightPositionRef.current =
      x.endsWith('px') && y.endsWith('px') && Number.isFinite(numericX) && Number.isFinite(numericY)
        ? { x: numericX, y: numericY }
        : null;
  }, []);

  const cancelSpotlightWriteFrame = React.useCallback(() => {
    if (typeof window === 'undefined' || spotlightFrameRef.current === null) {
      return;
    }

    const spotlightFrame = spotlightFrameRef.current;
    spotlightFrameRef.current = null;
    window.cancelAnimationFrame(spotlightFrame);
  }, []);

  const cancelSpotlightCenterAnimation = React.useCallback(() => {
    if (typeof window === 'undefined' || spotlightAnimationFrameRef.current === null) {
      return;
    }

    const spotlightAnimationFrame = spotlightAnimationFrameRef.current;
    spotlightAnimationFrameRef.current = null;
    window.cancelAnimationFrame(spotlightAnimationFrame);
  }, []);

  const setSpotlightPosition = React.useCallback(
    (x: string, y: string) => {
      pendingSpotlightPositionRef.current = { x, y };

      if (typeof window === 'undefined') {
        writeSpotlightPosition(x, y);
        return;
      }

      if (spotlightFrameRef.current !== null) {
        return;
      }

      spotlightFrameRef.current = window.requestAnimationFrame(() => {
        spotlightFrameRef.current = null;
        const position = pendingSpotlightPositionRef.current;
        writeSpotlightPosition(position.x, position.y);
      });
    },
    [writeSpotlightPosition],
  );

  const animateSpotlightToCenter = React.useCallback(() => {
    const button = buttonRef.current;

    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const targetPosition = { x: rect.width / 2, y: rect.height / 2 };
    const startPosition = currentSpotlightPositionRef.current ?? targetPosition;

    if (typeof window === 'undefined') {
      writeSpotlightPosition(`${targetPosition.x}px`, `${targetPosition.y}px`);
      return;
    }

    cancelSpotlightWriteFrame();
    cancelSpotlightCenterAnimation();

    const startTime = window.performance.now();

    const tick = (time: number) => {
      const progress = Math.min((time - startTime) / spotlightCenterAnimationDuration, 1);
      const easedProgress = easeOutCubic(progress);
      const nextX = startPosition.x + (targetPosition.x - startPosition.x) * easedProgress;
      const nextY = startPosition.y + (targetPosition.y - startPosition.y) * easedProgress;

      writeSpotlightPosition(`${nextX}px`, `${nextY}px`);

      if (progress < 1) {
        spotlightAnimationFrameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      spotlightAnimationFrameRef.current = null;
    };

    spotlightAnimationFrameRef.current = window.requestAnimationFrame(tick);
  }, [cancelSpotlightCenterAnimation, cancelSpotlightWriteFrame, writeSpotlightPosition]);

  const trackSpotlightFromPointer = React.useCallback(
    (target: HTMLButtonElement, clientX: number, clientY: number) => {
      if (!showSpotlight || isPressingRef.current) {
        return;
      }

      cancelSpotlightCenterAnimation();

      const rect = target.getBoundingClientRect();
      const nextPosition = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };

      currentSpotlightPositionRef.current = nextPosition;
      setSpotlightPosition(`${nextPosition.x}px`, `${nextPosition.y}px`);
    },
    [cancelSpotlightCenterAnimation, setSpotlightPosition, showSpotlight],
  );

  const updateMetrics = React.useCallback(() => {
    const button = buttonRef.current;

    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();
    setSeaglassMetrics(getSeaglassMetrics(rect.width, rect.height));
  }, []);

  React.useEffect(() => {
    const button = buttonRef.current;

    if (!button) {
      return undefined;
    }

    updateMetrics();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(button);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateMetrics]);

  React.useEffect(() => {
    if (showSpotlight) {
      return undefined;
    }

    isPressingRef.current = false;
    cancelSpotlightCenterAnimation();
    setSpotlightPosition(defaultSpotlightPosition.x, defaultSpotlightPosition.y);

    return undefined;
  }, [cancelSpotlightCenterAnimation, setSpotlightPosition, showSpotlight]);

  React.useEffect(() => {
    return () => {
      cancelSpotlightWriteFrame();
      cancelSpotlightCenterAnimation();
    };
  }, [cancelSpotlightCenterAnimation, cancelSpotlightWriteFrame]);

  const handleMouseMove: NonNullable<ButtonProps['onMouseMove']> = (event) => {
    trackSpotlightFromPointer(event.currentTarget, event.clientX, event.clientY);

    onMouseMove?.(event);
  };

  const handleMouseEnter: NonNullable<ButtonProps['onMouseEnter']> = (event) => {
    trackSpotlightFromPointer(event.currentTarget, event.clientX, event.clientY);

    onMouseEnter?.(event);
  };

  const handleMouseLeave: NonNullable<ButtonProps['onMouseLeave']> = (event) => {
    if (showSpotlight) {
      isPressingRef.current = false;
      cancelSpotlightCenterAnimation();
      setSpotlightPosition(defaultSpotlightPosition.x, defaultSpotlightPosition.y);
    }

    onMouseLeave?.(event);
  };

  const handlePointerDown: NonNullable<ButtonProps['onPointerDown']> = (event) => {
    if (showSpotlight) {
      const rect = event.currentTarget.getBoundingClientRect();
      currentSpotlightPositionRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      isPressingRef.current = true;
      animateSpotlightToCenter();
    }

    onPointerDown?.(event);
  };

  const handlePointerUp: NonNullable<ButtonProps['onPointerUp']> = (event) => {
    if (showSpotlight) {
      isPressingRef.current = false;
    }

    onPointerUp?.(event);
  };

  const handlePointerCancel: NonNullable<ButtonProps['onPointerCancel']> = (event) => {
    if (showSpotlight) {
      isPressingRef.current = false;
    }

    onPointerCancel?.(event);
  };

  const handleFocus: NonNullable<ButtonProps['onFocus']> = (event) => {
    if (showSpotlight && !isPressingRef.current) {
      cancelSpotlightCenterAnimation();
      const rect = event.currentTarget.getBoundingClientRect();
      setSpotlightPosition(`${rect.width / 2}px`, `${rect.height / 2}px`);
    }

    onFocus?.(event);
  };

  const handleBlur: NonNullable<ButtonProps['onBlur']> = (event) => {
    if (showSpotlight) {
      isPressingRef.current = false;
      cancelSpotlightCenterAnimation();
      setSpotlightPosition(defaultSpotlightPosition.x, defaultSpotlightPosition.y);
    }

    onBlur?.(event);
  };

  const spotlightStyle: SpotlightStyle = {
    '--button-seaglass-radius-x': seaglassMetrics.radiusX,
    '--button-seaglass-radius-y': seaglassMetrics.radiusY,
    '--button-spotlight-x': defaultSpotlightPosition.x,
    '--button-spotlight-y': defaultSpotlightPosition.y,
    '--button-spotlight-position': `${defaultSpotlightPosition.x} ${defaultSpotlightPosition.y}`,
    '--button-spotlight-size': seaglassMetrics.spotlightSize,
  };

  return {
    buttonRef,
    spotlightStyle,
    buttonEventHandlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
  };
}

export function Button({
  intent,
  appearance,
  size,
  children,
  iconOnly,
  isLoading,
  seaglass = false,
  isDisabled,
  className,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onFocus,
  onBlur,
  'aria-busy': ariaBusy,
  ...props
}: ButtonProps) {
  const isLoadingOnly = Boolean(isLoading && !children);
  const isIconOnly = Boolean(iconOnly);
  const hasButtonAccessibleName = hasAccessibleName(props);
  const resolvedIntent = intent ?? 'primary';
  const resolvedAppearance: ButtonAppearance = appearance ?? 'fill';

  invariantDev(
    !isIconOnly || hasButtonAccessibleName,
    'Coral UI: Button with iconOnly requires a non-empty aria-label or aria-labelledby.',
  );
  invariantDev(
    !isLoadingOnly || hasButtonAccessibleName,
    'Coral UI: Button with isLoading and no children requires a non-empty aria-label or aria-labelledby.',
  );

  const resolvedClassName = twMerge(
    buttonVariants({
      intent: resolvedIntent,
      appearance: resolvedAppearance,
      size,
      iconOnly: isIconOnly,
    }),
    seaglass
      ? seaglassButtonVariants({ intent: resolvedIntent, appearance: resolvedAppearance })
      : undefined,
    isLoadingOnly && !isIconOnly ? loadingOnlyMinWidthVariants({ size }) : undefined,
    className,
  );
  const { buttonRef, spotlightStyle, buttonEventHandlers } = useButtonSpotlight({
    seaglass,
    isDisabled,
    isLoading,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onFocus,
    onBlur,
  });

  return (
    <AriaButton
      {...props}
      aria-busy={isLoading ? true : ariaBusy}
      aria-label={isLoadingOnly && !hasButtonAccessibleName ? 'Loading' : props['aria-label']}
      ref={buttonRef}
      isDisabled={isDisabled || isLoading}
      style={spotlightStyle}
      {...buttonEventHandlers}
      className={resolvedClassName}
    >
      <ButtonContent isLoading={isLoading} isIconOnly={isIconOnly} size={size}>
        {children}
      </ButtonContent>
    </AriaButton>
  );
}
