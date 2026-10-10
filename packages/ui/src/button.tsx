'use client';

import * as React from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  ButtonContext,
  DEFAULT_SLOT,
  ProgressBarContext,
  useSlottedContext,
} from 'react-aria-components';
import { CircleNotchIcon } from '@phosphor-icons/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { hasAccessibleName, invariantDev } from './a11y.js';
import type { RefProp } from './ref.js';
import { useVeliLanguage } from './provider-shared.js';

const buttonVariants = cva(
  [
    'relative isolate inline-flex min-w-0 max-w-full cursor-pointer items-center justify-center overflow-hidden rounded-full border-transparent font-sans antialiased',
    // Colors use duration-normal/ease-out; press scale uses duration-fast/ease-out-quad in both directions.
    '[transition-property:background-color,color,scale]',
    '[transition-duration:var(--veli-duration-normal),var(--veli-duration-normal),var(--veli-duration-fast)]',
    '[transition-timing-function:var(--veli-ease-out),var(--veli-ease-out),var(--veli-ease-out-quad)]',
    'focus-visible:outline-none focus-visible:border-base-subtle focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface-base',
    'forced-colors:data-[focus-visible]:outline-solid forced-colors:data-[focus-visible]:outline-2 forced-colors:data-[focus-visible]:outline-offset-2',
    'disabled:pointer-events-none data-[pending]:cursor-wait',
    'data-[pressed]:scale-[1.045] motion-reduce:data-[pressed]:scale-100',
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
        // Figma hugs the content plus padding, including translated or wrapped labels.
        xs: 'px-1.5 py-1.5',
        sm: 'px-2 py-2',
        md: 'px-3 py-2.5',
        lg: 'px-3.5 py-3',
        xl: 'px-4.5 py-4',
      },
      iconOnly: {
        true: 'shrink-0 p-0',
        false: '',
      },
    },
    compoundVariants: [
      // Primary
      {
        intent: 'primary',
        appearance: 'fill',
        className:
          'bg-button-primary text-white data-[hovered]:bg-button-primary-hover data-[pressed]:bg-button-primary-pressed disabled:bg-button-disabled disabled:text-disabled [--button-ripple-color:rgb(0_175_172_/_0.75)]',
      },
      {
        intent: 'primary',
        appearance: 'transparent',
        className:
          'bg-button-primary-subtle text-primary data-[hovered]:bg-button-primary-subtle-hover data-[pressed]:bg-button-primary-subtle-pressed disabled:bg-button-disabled disabled:text-disabled [--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_61%,transparent)] dark:[--button-ripple-color:rgb(0_175_172_/_0.4)]',
      },
      {
        intent: 'primary',
        appearance: 'ghost',
        className:
          'bg-transparent text-primary data-[hovered]:bg-button-primary-subtle data-[pressed]:bg-button-primary-subtle-hover disabled:bg-transparent disabled:text-disabled [--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_61%,transparent)] dark:[--button-ripple-color:rgb(0_175_172_/_0.4)]',
      },
      // Secondary
      {
        intent: 'secondary',
        appearance: 'fill',
        className:
          'bg-button-secondary text-base-inverted data-[hovered]:bg-button-secondary-hover data-[pressed]:bg-button-secondary-pressed disabled:bg-button-disabled disabled:text-disabled [--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_40%,transparent)] dark:[--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_98%,transparent)]',
      },
      {
        intent: 'secondary',
        appearance: 'transparent',
        className:
          'bg-button-secondary-subtle text-base-strong data-[hovered]:bg-button-secondary-subtle-hover data-[pressed]:bg-button-secondary-subtle-pressed disabled:bg-button-disabled disabled:text-disabled [--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_61%,transparent)] dark:[--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_15%,transparent)]',
      },
      {
        intent: 'secondary',
        appearance: 'ghost',
        className:
          'bg-transparent text-base-strong data-[hovered]:bg-button-secondary-subtle data-[pressed]:bg-button-secondary-subtle-hover disabled:bg-transparent disabled:text-disabled [--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_61%,transparent)] dark:[--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_15%,transparent)]',
      },
      // Danger
      {
        intent: 'danger',
        appearance: 'fill',
        className:
          'bg-button-danger text-white data-[hovered]:bg-button-danger-hover data-[pressed]:bg-button-danger-pressed disabled:bg-button-disabled disabled:text-disabled [--button-ripple-color:rgb(255_2_0_/_0.9)] dark:[--button-ripple-color:rgb(255_2_0_/_0.95)]',
      },
      {
        intent: 'danger',
        appearance: 'transparent',
        className:
          'bg-button-danger-subtle text-danger data-[hovered]:bg-button-danger-subtle-hover data-[pressed]:bg-button-danger-subtle-pressed disabled:bg-button-disabled disabled:text-disabled [--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_61%,transparent)] dark:[--button-ripple-color:rgb(255_2_0_/_0.61)]',
      },
      {
        intent: 'danger',
        appearance: 'ghost',
        className:
          'bg-transparent text-danger data-[hovered]:bg-button-danger-subtle data-[pressed]:bg-button-danger-subtle-hover disabled:bg-transparent disabled:text-disabled [--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_61%,transparent)] dark:[--button-ripple-color:rgb(255_2_0_/_0.61)]',
      },
      // Accent (fill only in Figma)
      {
        intent: 'accent',
        appearance: 'fill',
        className:
          'bg-button-accent text-primary-on-light data-[hovered]:bg-button-accent-hover data-[pressed]:bg-button-accent-pressed disabled:bg-button-disabled disabled:text-disabled [--button-ripple-color:var(--veli-color-accent-400)] dark:[--button-ripple-color:var(--veli-color-accent-1100)]',
      },
      { size: 'xs', iconOnly: true, className: 'h-7 w-7' },
      { size: 'sm', iconOnly: true, className: 'h-9 w-9' },
      { size: 'md', iconOnly: true, className: 'h-11 w-11' },
      { size: 'lg', iconOnly: true, className: 'h-13 w-13' },
      { size: 'xl', iconOnly: true, className: 'h-15 w-15' },
    ],
    defaultVariants: {
      intent: 'primary',
      appearance: 'fill',
      size: 'md',
      iconOnly: false,
    },
  },
);

const loadingOnlyWidthVariants = cva('', {
  variants: {
    size: {
      xs: 'w-28.5',
      sm: 'w-32.25',
      md: 'w-37.5',
      lg: 'w-41.75',
      xl: 'w-41.75',
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
      sm: 'size-4',
      md: 'size-4',
      lg: 'size-5',
      xl: 'size-5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const buttonContentVariants = cva(
  'relative z-10 inline-flex min-w-0 max-w-full items-center justify-center gap-2 whitespace-normal wrap-anywhere font-sans antialiased [&>svg]:shrink-0',
  {
    variants: {
      size: {
        xs: 'type-caption-medium',
        sm: 'type-body-sm-medium',
        md: 'type-body-md-medium',
        lg: 'min-h-7 type-body-lg-medium',
        xl: 'type-subtitle-medium',
      },
      iconOnly: {
        true: 'gap-0 px-0',
        // Compensate the icon margins in the gap: label inset 6px, icon inset 2px, gap 8px.
        false: 'px-1.5 [&:has(>svg)]:gap-3 [&>svg]:-mx-1',
      },
    },
    defaultVariants: {
      size: 'md',
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
    Omit<VariantProps<typeof buttonVariants>, 'iconOnly'>,
    RefProp<HTMLButtonElement> {
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
  const { language } = useVeliLanguage();
  const progressProps = useSlottedContext(ProgressBarContext);

  return (
    <span
      id={progressProps?.id}
      role="progressbar"
      aria-label={language === 'dv' ? 'ލޯޑުވަނީ' : 'Loading'}
      className="inline-flex shrink-0 items-center justify-center"
    >
      <CircleNotchIcon
        aria-hidden="true"
        weight="bold"
        className={twMerge(loadingIndicatorVariants({ size }), 'motion-safe:animate-spin')}
      />
    </span>
  );
}

function ButtonContent({
  children,
  hasChildren,
  isIconOnly,
  isLoading,
  size,
}: {
  children: React.ReactNode;
  hasChildren: boolean;
  isIconOnly: boolean;
  isLoading: boolean;
  size: ButtonProps['size'];
}) {
  return (
    <>
      {hasChildren ? (
        <span
          className={twMerge(
            buttonContentVariants({ size, iconOnly: isIconOnly }),
            isLoading && 'opacity-0',
          )}
        >
          {children}
        </span>
      ) : null}
      {isLoading ? (
        <span
          className={twMerge(
            buttonContentVariants({ size, iconOnly: isIconOnly }),
            'pointer-events-none',
            hasChildren ? 'absolute inset-0' : 'h-lh',
          )}
        >
          <ButtonLoadingIndicator size={size} />
        </span>
      ) : null}
    </>
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
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
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
      if (!isPressingRef.current || !canRipple || prefersReducedMotion()) {
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
      cancelAnimationFrameRef(expandFrameRef);
      const endSize = getPressRippleEndSize(width, height, x, y);
      rippleRef.current = { x, y, size: endSize };
      writeRipple();

      if (typeof window === 'undefined' || prefersReducedMotion()) {
        return;
      }

      rippleRef.current.size = pressRippleStartSizePx;
      writeRipple();

      const startTime = window.performance.now();

      const tick = (time: number) => {
        if (prefersReducedMotion()) {
          rippleRef.current.size = endSize;
          writeRipple();
          expandFrameRef.current = null;
          return;
        }
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

  const stopTrackingRipple = React.useCallback(() => {
    isPressingRef.current = false;
    pendingPointerRef.current = null;
    cancelAnimationFrameRef(pointerFrameRef);
  }, []);

  React.useEffect(() => {
    const stopRipple = () => {
      stopTrackingRipple();
      cancelAnimationFrameRef(expandFrameRef);
    };
    if (!canRipple) stopRipple();
    return stopRipple;
  }, [canRipple, stopTrackingRipple]);

  const handlePointerMove: NonNullable<ButtonProps['onPointerMove']> = (event) => {
    trackRippleFromPointer(event.currentTarget, event.clientX, event.clientY);
    onPointerMove?.(event);
  };

  const handlePointerUp: NonNullable<ButtonProps['onPointerUp']> = (event) => {
    if (event.buttons === 0) {
      stopTrackingRipple();
    }

    onPointerUp?.(event);
  };

  const handlePointerCancel: NonNullable<ButtonProps['onPointerCancel']> = (event) => {
    stopTrackingRipple();
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
    // Let expansion finish during the opacity fade, including after a quick click.
    stopTrackingRipple();
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
  isPending,
  isDisabled,
  className,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPressStart,
  onPressEnd,
  'aria-busy': ariaBusy,
  render,
  ref,
  ...props
}: ButtonProps) {
  const buttonContext = React.useContext(ButtonContext);
  // Collection-building passes may omit slots. AriaButton validates the visible render.
  const context =
    props.slot === null
      ? undefined
      : buttonContext && 'slots' in buttonContext
        ? buttonContext.slots?.[props.slot || DEFAULT_SLOT]
        : (buttonContext as AriaButtonProps | null);
  const hasChildren = React.Children.toArray(children).some(
    (child) => typeof child !== 'string' || child.trim().length > 0,
  );
  const isIconOnly = Boolean(iconOnly);
  const hasButtonAccessibleName = hasAccessibleName({ ...context, ...props });
  const resolvedPending = isLoading || (isPending ?? context?.isPending);
  const resolvedDisabled = isDisabled ?? context?.isDisabled;
  const resolvedRender = render ?? context?.render;
  const resolvedIntent = intent ?? 'primary';
  const resolvedAppearance: ButtonAppearance =
    resolvedIntent === 'accent' ? 'fill' : (appearance ?? 'fill');
  const resolvedSize = size ?? 'md';

  invariantDev(
    !isIconOnly || hasButtonAccessibleName,
    'Veli UI: Button with iconOnly requires a non-empty aria-label or aria-labelledby.',
  );
  invariantDev(
    !resolvedPending || hasChildren || hasButtonAccessibleName,
    'Veli UI: Button with isLoading or isPending and no children requires a non-empty aria-label or aria-labelledby.',
  );

  const { buttonRef, buttonEventHandlers } = useButtonRipple({
    isDisabled: resolvedDisabled,
    isLoading: resolvedPending,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onPressStart,
    onPressEnd,
  });
  const setButtonRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      buttonRef.current = node;
      const cleanup = typeof ref === 'function' ? ref(node) : undefined;
      if (ref && typeof ref !== 'function') ref.current = node;

      return () => {
        buttonRef.current = null;
        if (typeof cleanup === 'function') cleanup();
        else if (typeof ref === 'function') ref(null);
        else if (ref) ref.current = null;
      };
    },
    [buttonRef, ref],
  );

  return (
    <AriaButton
      {...props}
      ref={setButtonRef}
      isDisabled={isDisabled}
      isPending={resolvedPending}
      {...buttonEventHandlers}
      className={(state) =>
        twMerge(
          typeof context?.className === 'function' ? context.className(state) : context?.className,
          buttonVariants({
            intent: resolvedIntent,
            appearance: resolvedAppearance,
            size: resolvedSize,
            iconOnly: isIconOnly,
          }),
          state.isPending && !hasChildren && !isIconOnly
            ? loadingOnlyWidthVariants({ size: resolvedSize })
            : undefined,
          className,
        )
      }
      // React Aria drops aria-busy, so set it on the element.
      render={(domProps, state) => {
        const buttonProps = {
          ...domProps,
          'aria-busy': state.isPending ? true : ariaBusy,
          // Preserve the submit target for Enter and cancel native form actions.
          ...(state.isPending && {
            type: props.type ?? context?.type ?? 'button',
            onClick: (event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault(),
          }),
        };
        return resolvedRender ? resolvedRender(buttonProps, state) : <button {...buttonProps} />;
      }}
    >
      {({ isPending: pending }) => (
        <ButtonContent
          hasChildren={hasChildren}
          isLoading={pending}
          isIconOnly={isIconOnly}
          size={resolvedSize}
        >
          {children}
        </ButtonContent>
      )}
    </AriaButton>
  );
}
