'use client';

import * as React from 'react';
import { Button as AriaButton, ButtonProps as AriaButtonProps } from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { hasAccessibleName, invariantDev } from './a11y';

const buttonVariants = cva(
  [
    'relative isolate inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full border-transparent font-sans antialiased',
    // Colors use duration-normal/ease-out; press scale uses duration-fast/ease-out-quad in both directions.
    '[transition-property:background-color,color,scale]',
    '[transition-duration:var(--duration-normal),var(--duration-normal),var(--duration-fast)]',
    '[transition-timing-function:var(--ease-out),var(--ease-out),var(--ease-out-quad)]',
    'focus-visible:outline-none focus-visible:border-base-subtle focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface-base',
    'disabled:pointer-events-none',
    'data-[pressed]:scale-[1.045] motion-reduce:data-[pressed]:scale-100',
    // Keep label/icons optically fixed while the chrome scales.
    '[&>*]:origin-center [&>*]:[transition-property:scale] [&>*]:[transition-duration:var(--duration-fast)] [&>*]:[transition-timing-function:var(--ease-out-quad)]',
    'data-[pressed]:[&>*]:scale-[calc(1/1.045)] motion-reduce:data-[pressed]:[&>*]:scale-100',
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-['']",
    'after:bg-[radial-gradient(circle_var(--button-ripple-size,0px)_at_var(--button-ripple-x,50%)_var(--button-ripple-y,50%),var(--button-ripple-color)_0%,transparent_70%)]',
    'after:opacity-0 after:transition-opacity after:duration-normal after:ease-out',
    'data-[pressed]:after:opacity-100 data-[pressed]:after:duration-fast data-[pressed]:after:ease-out',
  ].join(' '),
  {
    variants: {
      intent: {
        primary: '',
        secondary: '',
        danger: '',
        accent: '',
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
          'bg-button-primary text-white hover:bg-button-primary-hover active:bg-button-primary-pressed disabled:bg-button-disabled disabled:text-disabled [--button-ripple-color:rgb(0_175_172_/_0.75)] dark:[--button-ripple-color:rgb(0_175_172_/_0.75)]',
      },
      {
        intent: 'primary',
        appearance: 'transparent',
        className:
          'bg-button-primary-subtle text-primary-muted hover:bg-button-primary-subtle-hover active:bg-button-primary-subtle-pressed disabled:bg-button-disabled disabled:text-disabled [--button-ripple-color:rgb(255_255_255_/_0.61)] dark:[--button-ripple-color:rgb(0_175_172_/_0.4)]',
      },
      {
        intent: 'primary',
        appearance: 'ghost',
        className:
          'bg-transparent text-primary hover:bg-button-primary-subtle active:bg-button-primary-subtle-hover disabled:bg-transparent disabled:text-disabled [--button-ripple-color:rgb(255_255_255_/_0.61)] dark:[--button-ripple-color:rgb(0_175_172_/_0.4)]',
      },
      // Secondary
      {
        intent: 'secondary',
        appearance: 'fill',
        className:
          'bg-button-secondary text-base-inverted hover:bg-button-secondary-hover active:bg-button-secondary-pressed disabled:bg-button-disabled disabled:text-disabled [--button-ripple-color:rgb(255_255_255_/_0.4)] dark:[--button-ripple-color:rgb(255_255_255_/_0.98)]',
      },
      {
        intent: 'secondary',
        appearance: 'transparent',
        className:
          'bg-button-secondary-subtle text-base-default hover:bg-button-secondary-subtle-hover active:bg-button-secondary-subtle-pressed disabled:bg-button-disabled disabled:text-disabled [--button-ripple-color:rgb(255_255_255_/_0.61)] dark:[--button-ripple-color:rgb(255_255_255_/_0.15)]',
      },
      {
        intent: 'secondary',
        appearance: 'ghost',
        className:
          'bg-transparent text-base-default hover:bg-button-secondary-subtle active:bg-button-secondary-subtle-hover disabled:bg-transparent disabled:text-disabled [--button-ripple-color:rgb(255_255_255_/_0.61)] dark:[--button-ripple-color:rgb(255_255_255_/_0.15)]',
      },
      // Danger
      {
        intent: 'danger',
        appearance: 'fill',
        className:
          'bg-button-danger text-white hover:bg-button-danger-hover active:bg-button-danger-pressed disabled:bg-button-disabled disabled:text-disabled [--button-ripple-color:rgb(255_2_0_/_0.9)] dark:[--button-ripple-color:rgb(255_2_0_/_0.9)]',
      },
      {
        intent: 'danger',
        appearance: 'transparent',
        className:
          'bg-button-danger-subtle text-danger-muted hover:bg-button-danger-subtle-hover active:bg-button-danger-subtle-pressed disabled:bg-button-disabled disabled:text-disabled [--button-ripple-color:rgb(255_255_255_/_0.61)] dark:[--button-ripple-color:rgb(255_2_0_/_0.61)]',
      },
      {
        intent: 'danger',
        appearance: 'ghost',
        className:
          'bg-transparent text-danger-muted hover:bg-button-danger-subtle active:bg-button-danger-subtle-hover disabled:bg-transparent disabled:text-disabled [--button-ripple-color:rgb(255_255_255_/_0.61)] dark:[--button-ripple-color:rgb(255_2_0_/_0.61)]',
      },
      // Accent (fill only in Figma)
      {
        intent: 'accent',
        appearance: 'fill',
        className:
          'bg-button-accent text-primary-on-light hover:bg-button-accent-hover active:bg-button-accent-pressed disabled:bg-button-disabled disabled:text-disabled [--button-ripple-color:rgb(154_243_102_/_1)] dark:[--button-ripple-color:rgb(154_243_102_/_1)]',
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

const pressRippleAnimationDuration = 420;
const pressRippleStartSizePx = 12;

interface UseButtonRippleOptions {
  isDisabled?: boolean;
  isLoading?: boolean;
  onPointerMove?: ButtonProps['onPointerMove'];
  onPointerUp?: ButtonProps['onPointerUp'];
  onPointerCancel?: ButtonProps['onPointerCancel'];
  onPressStart?: ButtonProps['onPressStart'];
  onPressEnd?: ButtonProps['onPressEnd'];
}

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function getPressRippleEndSize(width: number, height: number, x: number, y: number) {
  const reach = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
  return Math.round(Math.max(reach * 2.2, Math.max(width, height) * 1.35));
}

function cancelAnimationFrameRef(frameRef: React.MutableRefObject<number | null>) {
  if (typeof window === 'undefined' || frameRef.current === null) {
    return;
  }

  window.cancelAnimationFrame(frameRef.current);
  frameRef.current = null;
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

function useButtonRipple({
  isDisabled,
  isLoading,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPressStart,
  onPressEnd,
}: UseButtonRippleOptions) {
  const canRipple = !isDisabled && !isLoading;
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const expandFrameRef = React.useRef<number | null>(null);
  const pointerFrameRef = React.useRef<number | null>(null);
  const isPressingRef = React.useRef(false);
  const pendingPointerRef = React.useRef<{ x: number; y: number } | null>(null);
  const rippleRef = React.useRef({ x: 0, y: 0, size: 0 });

  const writeRipple = React.useCallback(() => {
    const button = buttonRef.current;

    if (!button) {
      return;
    }

    const { x, y, size } = rippleRef.current;
    button.style.setProperty('--button-ripple-x', `${x}px`);
    button.style.setProperty('--button-ripple-y', `${y}px`);
    button.style.setProperty('--button-ripple-size', `${size}px`);
  }, []);

  const setRipplePosition = React.useCallback(
    (x: number, y: number) => {
      rippleRef.current.x = x;
      rippleRef.current.y = y;
      writeRipple();
    },
    [writeRipple],
  );

  const trackRippleFromPointer = React.useCallback(
    (target: HTMLButtonElement, clientX: number, clientY: number) => {
      if (!isPressingRef.current || !canRipple) {
        return;
      }

      const rect = target.getBoundingClientRect();
      pendingPointerRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };

      if (typeof window === 'undefined') {
        const position = pendingPointerRef.current;
        setRipplePosition(position.x, position.y);
        return;
      }

      if (pointerFrameRef.current !== null) {
        return;
      }

      pointerFrameRef.current = window.requestAnimationFrame(() => {
        pointerFrameRef.current = null;
        const position = pendingPointerRef.current;

        if (!position || !isPressingRef.current) {
          return;
        }

        setRipplePosition(position.x, position.y);
      });
    },
    [canRipple, setRipplePosition],
  );

  const animatePressRipple = React.useCallback(
    (width: number, height: number, x: number, y: number) => {
      const endSize = getPressRippleEndSize(width, height, x, y);
      rippleRef.current = { x, y, size: endSize };
      writeRipple();

      if (typeof window === 'undefined' || prefersReducedMotion()) {
        return;
      }

      cancelAnimationFrameRef(expandFrameRef);
      rippleRef.current.size = pressRippleStartSizePx;
      writeRipple();

      const startTime = window.performance.now();

      const tick = (time: number) => {
        const progress = Math.min((time - startTime) / pressRippleAnimationDuration, 1);
        rippleRef.current.size =
          pressRippleStartSizePx + (endSize - pressRippleStartSizePx) * easeOutCubic(progress);
        writeRipple();

        if (progress < 1) {
          expandFrameRef.current = window.requestAnimationFrame(tick);
          return;
        }

        expandFrameRef.current = null;
      };

      expandFrameRef.current = window.requestAnimationFrame(tick);
    },
    [writeRipple],
  );

  React.useEffect(() => {
    return () => {
      cancelAnimationFrameRef(expandFrameRef);
      cancelAnimationFrameRef(pointerFrameRef);
    };
  }, []);

  const handlePointerMove: NonNullable<ButtonProps['onPointerMove']> = (event) => {
    trackRippleFromPointer(event.currentTarget, event.clientX, event.clientY);
    onPointerMove?.(event);
  };

  const handlePointerUp: NonNullable<ButtonProps['onPointerUp']> = (event) => {
    if (event.buttons === 0) {
      isPressingRef.current = false;
    }

    onPointerUp?.(event);
  };

  const handlePointerCancel: NonNullable<ButtonProps['onPointerCancel']> = (event) => {
    isPressingRef.current = false;
    onPointerCancel?.(event);
  };

  const handlePressStart: NonNullable<ButtonProps['onPressStart']> = (event) => {
    if (canRipple) {
      const button = buttonRef.current;
      const width = button?.offsetWidth ?? 0;
      const height = button?.offsetHeight ?? 0;
      const pressX = Number.isFinite(event.x) ? event.x : width / 2;
      const pressY = Number.isFinite(event.y) ? event.y : height / 2;

      isPressingRef.current = true;
      animatePressRipple(width, height, pressX, pressY);
    }

    onPressStart?.(event);
  };

  const handlePressEnd: NonNullable<ButtonProps['onPressEnd']> = (event) => {
    isPressingRef.current = false;
    onPressEnd?.(event);
  };

  return {
    buttonRef,
    buttonEventHandlers: {
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onPressStart: handlePressStart,
      onPressEnd: handlePressEnd,
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
  isDisabled,
  className,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPressStart,
  onPressEnd,
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
    isLoadingOnly && !isIconOnly ? loadingOnlyMinWidthVariants({ size }) : undefined,
    className,
  );
  const { buttonRef, buttonEventHandlers } = useButtonRipple({
    isDisabled,
    isLoading,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onPressStart,
    onPressEnd,
  });

  return (
    <AriaButton
      {...props}
      aria-busy={isLoading ? true : ariaBusy}
      aria-label={isLoadingOnly && !hasButtonAccessibleName ? 'Loading' : props['aria-label']}
      ref={buttonRef}
      isDisabled={isDisabled || isLoading}
      {...buttonEventHandlers}
      className={resolvedClassName}
    >
      <ButtonContent isLoading={isLoading} isIconOnly={isIconOnly} size={size}>
        {children}
      </ButtonContent>
    </AriaButton>
  );
}
