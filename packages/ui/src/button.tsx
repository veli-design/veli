'use client';

import * as React from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  ButtonContext,
  type LinkProps as AriaLinkProps,
  type LinkRenderProps,
  LinkContext,
  useContextProps,
  DEFAULT_SLOT,
  ProgressBarContext,
  useSlottedContext,
} from 'react-aria-components';
import { useLink, useHover, useFocusRing, mergeProps } from 'react-aria';
import { filterDOMProps } from 'react-aria/filterDOMProps';
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
          'bg-button-primary text-white data-[hovered]:bg-button-primary-hover data-[pressed]:bg-button-primary-pressed data-[disabled]:bg-button-disabled data-[disabled]:text-disabled [--button-ripple-color:rgb(0_175_172_/_0.75)]',
      },
      {
        intent: 'primary',
        appearance: 'transparent',
        className:
          'bg-button-primary-subtle text-primary data-[hovered]:bg-button-primary-subtle-hover data-[pressed]:bg-button-primary-subtle-pressed data-[disabled]:bg-button-disabled data-[disabled]:text-disabled [--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_61%,transparent)] dark:[--button-ripple-color:rgb(0_175_172_/_0.4)]',
      },
      {
        intent: 'primary',
        appearance: 'ghost',
        className:
          'bg-transparent text-primary data-[hovered]:bg-button-primary-subtle data-[pressed]:bg-button-primary-subtle-hover data-[disabled]:bg-transparent data-[disabled]:text-disabled [--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_61%,transparent)] dark:[--button-ripple-color:rgb(0_175_172_/_0.4)]',
      },
      // Secondary
      {
        intent: 'secondary',
        appearance: 'fill',
        className:
          'bg-button-secondary text-base-inverted data-[hovered]:bg-button-secondary-hover data-[pressed]:bg-button-secondary-pressed data-[disabled]:bg-button-disabled data-[disabled]:text-disabled [--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_40%,transparent)] dark:[--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_98%,transparent)]',
      },
      {
        intent: 'secondary',
        appearance: 'transparent',
        className:
          'bg-button-secondary-subtle text-base-strong data-[hovered]:bg-button-secondary-subtle-hover data-[pressed]:bg-button-secondary-subtle-pressed data-[disabled]:bg-button-disabled data-[disabled]:text-disabled [--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_61%,transparent)] dark:[--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_15%,transparent)]',
      },
      {
        intent: 'secondary',
        appearance: 'ghost',
        className:
          'bg-transparent text-base-strong data-[hovered]:bg-button-secondary-subtle data-[pressed]:bg-button-secondary-subtle-hover data-[disabled]:bg-transparent data-[disabled]:text-disabled [--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_61%,transparent)] dark:[--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_15%,transparent)]',
      },
      // Danger
      {
        intent: 'danger',
        appearance: 'fill',
        className:
          'bg-button-danger text-white data-[hovered]:bg-button-danger-hover data-[pressed]:bg-button-danger-pressed data-[disabled]:bg-button-disabled data-[disabled]:text-disabled [--button-ripple-color:rgb(255_2_0_/_0.9)] dark:[--button-ripple-color:rgb(255_2_0_/_0.95)]',
      },
      {
        intent: 'danger',
        appearance: 'transparent',
        className:
          'bg-button-danger-subtle text-danger data-[hovered]:bg-button-danger-subtle-hover data-[pressed]:bg-button-danger-subtle-pressed data-[disabled]:bg-button-disabled data-[disabled]:text-disabled [--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_61%,transparent)] dark:[--button-ripple-color:rgb(255_2_0_/_0.61)]',
      },
      {
        intent: 'danger',
        appearance: 'ghost',
        className:
          'bg-transparent text-danger data-[hovered]:bg-button-danger-subtle data-[pressed]:bg-button-danger-subtle-hover data-[disabled]:bg-transparent data-[disabled]:text-disabled [--button-ripple-color:color-mix(in_srgb,var(--veli-color-white)_61%,transparent)] dark:[--button-ripple-color:rgb(255_2_0_/_0.61)]',
      },
      // Accent (fill only in Figma)
      {
        intent: 'accent',
        appearance: 'fill',
        className:
          'bg-button-accent text-primary-on-light data-[hovered]:bg-button-accent-hover data-[pressed]:bg-button-accent-pressed data-[disabled]:bg-button-disabled data-[disabled]:text-disabled [--button-ripple-color:var(--veli-color-accent-400)] dark:[--button-ripple-color:var(--veli-color-accent-1100)]',
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

type ActionButtonProps = (IconOnlyButtonProps | StandardButtonProps) & {
  as?: 'button';
  href?: never;
};

type ButtonLinkState = LinkRenderProps & { isPending: boolean };

interface ButtonLinkSharedProps
  extends
    Omit<AriaLinkProps, 'style' | 'children' | 'className' | 'render' | 'href'>,
    Omit<VariantProps<typeof buttonVariants>, 'iconOnly'>,
    RefProp<HTMLAnchorElement> {
  as: 'a';
  href: string;
  excludeFromTabOrder?: boolean;
  isLoading?: boolean;
  isPending?: boolean;
  'aria-busy'?: React.AriaAttributes['aria-busy'];
  'aria-current'?: React.AriaAttributes['aria-current'];
  className?: string;
  render?: (props: React.ComponentPropsWithRef<'a'>, state: ButtonLinkState) => React.ReactElement;
}

type NavigationButtonProps = ButtonLinkSharedProps &
  (
    | (AccessibleButtonName & { children?: React.ReactNode; iconOnly: true })
    | { children?: React.ReactNode; iconOnly?: false | undefined }
  );

export type ButtonProps<Element extends 'button' | 'a' = 'button'> = Element extends 'a'
  ? NavigationButtonProps
  : ActionButtonProps;

type ButtonAppearance = NonNullable<ButtonProps['appearance']>;

const pressRippleAnimationDuration = 420;
const pressRippleStartSizePx = 12;

interface UseButtonRippleOptions<T extends HTMLButtonElement | HTMLAnchorElement> {
  ref?: React.RefObject<T | null>;
  isDisabled?: boolean;
  isLoading?: boolean;
  onPointerMove?: React.PointerEventHandler<T>;
  onPointerUp?: React.PointerEventHandler<T>;
  onPointerCancel?: React.PointerEventHandler<T>;
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

function useButtonRipple<T extends HTMLButtonElement | HTMLAnchorElement = HTMLButtonElement>({
  ref,
  isDisabled,
  isLoading,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPressStart,
  onPressEnd,
}: UseButtonRippleOptions<T>) {
  const canRipple = !isDisabled && !isLoading;
  const internalRef = React.useRef<T | null>(null);
  const buttonRef = ref ?? internalRef;
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
  }, [buttonRef]);

  const setRipplePosition = React.useCallback(
    (x: number, y: number) => {
      rippleRef.current.x = x;
      rippleRef.current.y = y;
      writeRipple();
    },
    [writeRipple],
  );

  const trackRippleFromPointer = React.useCallback(
    (target: T, clientX: number, clientY: number) => {
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

  const handlePointerMove: React.PointerEventHandler<T> = (event) => {
    trackRippleFromPointer(event.currentTarget, event.clientX, event.clientY);
    onPointerMove?.(event);
  };

  const handlePointerUp: React.PointerEventHandler<T> = (event) => {
    if (event.buttons === 0) {
      stopTrackingRipple();
    }

    onPointerUp?.(event);
  };

  const handlePointerCancel: React.PointerEventHandler<T> = (event) => {
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

function ActionButton({
  as: elementType = 'button',
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
}: ActionButtonProps) {
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
    'Coral UI: Button with iconOnly requires a non-empty aria-label or aria-labelledby.',
  );
  invariantDev(
    !resolvedPending || hasChildren || hasButtonAccessibleName,
    'Coral UI: Button with isLoading or isPending and no children requires a non-empty aria-label or aria-labelledby.',
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
          typeof context?.className === 'function'
            ? context.className({ ...state, defaultClassName: undefined })
            : context?.className,
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
        return resolvedRender
          ? resolvedRender(buttonProps, state)
          : React.createElement(elementType, buttonProps);
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

function NavigationButton({ ref: forwardedRef, ...inputProps }: NavigationButtonProps) {
  const context = useSlottedContext(LinkContext, inputProps.slot);
  const [mergedProps, ref] = useContextProps(inputProps, forwardedRef, LinkContext);
  const {
    as: elementType,
    intent,
    appearance,
    size,
    children,
    iconOnly,
    isLoading,
    isPending,
    isDisabled,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onPressStart,
    onPressEnd,
    'aria-busy': ariaBusy,
    render,
    ...props
  } = mergedProps;
  const resolvedIntent = intent ?? 'primary';
  const resolvedSize = size ?? 'md';
  const resolvedAppearance = resolvedIntent === 'accent' ? 'fill' : (appearance ?? 'fill');
  const pending = Boolean(isLoading || isPending);
  const inactive = Boolean(isDisabled || pending);
  const hasChildren = React.Children.toArray(children).some(
    (child) => typeof child !== 'string' || child.trim().length > 0,
  );
  const isIconOnly = Boolean(iconOnly);
  const hasName = hasAccessibleName(props);
  invariantDev(
    !isIconOnly || hasName,
    'Coral UI: Button with iconOnly requires a non-empty aria-label or aria-labelledby.',
  );
  invariantDev(
    !pending || hasChildren || hasName,
    'Coral UI: Button with isLoading or isPending and no children requires a non-empty aria-label or aria-labelledby.',
  );
  const { buttonEventHandlers } = useButtonRipple<HTMLAnchorElement>({
    ref,
    isDisabled,
    isLoading: pending,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onPressStart,
    onPressEnd,
  });
  const { linkProps, isPressed } = useLink(
    {
      ...props,
      elementType,
      isDisabled: inactive,
      onPressStart: buttonEventHandlers.onPressStart,
      onPressEnd: buttonEventHandlers.onPressEnd,
    },
    ref,
  );
  const { hoverProps, isHovered } = useHover({ ...props, isDisabled: inactive });
  const { focusProps, isFocused, isFocusVisible } = useFocusRing({ autoFocus: props.autoFocus });
  const state: ButtonLinkState = {
    isDisabled: inactive,
    isPending: pending,
    isCurrent: Boolean(props['aria-current'] && props['aria-current'] !== 'false'),
    isPressed,
    isHovered,
    isFocused,
    isFocusVisible,
  };
  const blockActivation = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const nativeProps = filterDOMProps(props, { global: true });
  delete nativeProps.onClick;
  const domProps = mergeProps(nativeProps, linkProps, hoverProps, focusProps, {
    onPointerMove: buttonEventHandlers.onPointerMove,
    onPointerUp: buttonEventHandlers.onPointerUp,
    onPointerCancel: buttonEventHandlers.onPointerCancel,
  }) as React.ComponentPropsWithoutRef<'a'>;
  const anchorProps: React.ComponentPropsWithRef<'a'> & Record<string, unknown> = {
    ...domProps,
    ref,
    style:
      typeof context?.style === 'function'
        ? context.style({ ...state, defaultStyle: {} })
        : context?.style,
    href: inactive ? undefined : domProps.href,
    role: inactive ? 'link' : domProps.role,
    slot: props.slot ?? undefined,
    tabIndex: isDisabled ? -1 : pending ? (props.excludeFromTabOrder ? -1 : 0) : domProps.tabIndex,
    'aria-busy': pending ? true : ariaBusy,
    'data-disabled': isDisabled || undefined,
    'data-pending': pending || undefined,
    'data-pressed': isPressed || undefined,
    'data-hovered': isHovered || undefined,
    'data-focused': isFocused || undefined,
    'data-focus-visible': isFocusVisible || undefined,
    'data-current': state.isCurrent || undefined,
    onClickCapture: inactive ? blockActivation : domProps.onClickCapture,
    onAuxClickCapture: inactive ? blockActivation : domProps.onAuxClickCapture,
    onKeyDownCapture: inactive
      ? (event) => {
          if (event.key === 'Enter' || event.key === ' ') blockActivation(event);
          else domProps.onKeyDownCapture?.(event);
        }
      : domProps.onKeyDownCapture,
    className: twMerge(
      typeof context?.className === 'function'
        ? context.className({ ...state, defaultClassName: undefined })
        : context?.className,
      buttonVariants({
        intent: resolvedIntent,
        appearance: resolvedAppearance,
        size: resolvedSize,
        iconOnly: isIconOnly,
      }),
      'no-underline',
      pending && !hasChildren && !isIconOnly
        ? loadingOnlyWidthVariants({ size: resolvedSize })
        : undefined,
      inputProps.className,
    ),
    children: (
      <ButtonContent
        hasChildren={hasChildren}
        isLoading={pending}
        isIconOnly={isIconOnly}
        size={resolvedSize}
      >
        {children}
      </ButtonContent>
    ),
  };
  const resolvedRender = render ?? (context?.render as ButtonLinkSharedProps['render']);
  return resolvedRender ? (
    resolvedRender(anchorProps, state)
  ) : (
    <a {...anchorProps}>{anchorProps.children}</a>
  );
}

export function Button(props: ButtonProps<'button' | 'a'>) {
  return props.as === 'a' ? <NavigationButton {...props} /> : <ActionButton {...props} />;
}
