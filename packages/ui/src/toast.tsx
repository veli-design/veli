'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';
import {
  Button as AriaButton,
  Text,
  UNSTABLE_Toast as AriaToast,
  UNSTABLE_ToastContent as AriaToastContent,
  UNSTABLE_ToastQueue as AriaToastQueue,
  UNSTABLE_ToastRegion as AriaToastRegion,
  type QueuedToast,
  type ToastOptions,
  type ToastProps as AriaToastProps,
  type ToastRegionProps as AriaToastRegionProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

export type ToastAppearance = 'outline' | 'subtle' | 'emphasis';
export type ToastIntent = 'neutral' | 'info' | 'positive' | 'cautious' | 'warning' | 'danger';

const toastIntentClasses = {
  outline: {
    neutral: 'border-status-neutral-subtle bg-bg-surface-raised text-text-default-default',
    info: 'border-status-info-subtle bg-bg-surface-raised text-text-primary-default',
    positive: 'border-status-success-subtle bg-bg-surface-raised text-text-success-default',
    cautious: 'border-status-cautious-subtle bg-bg-surface-raised text-text-cautious-default',
    warning: 'border-status-warning-subtle bg-bg-surface-raised text-text-warning-default',
    danger: 'border-status-danger-subtle bg-bg-surface-raised text-text-danger-default',
  },
  subtle: {
    neutral: 'border-status-neutral-subtle bg-status-neutral-subtle text-text-default-strong',
    info: 'border-status-info-subtle bg-status-info-subtle text-text-primary-strong',
    positive: 'border-status-success-subtle bg-status-success-subtle text-text-success-strong',
    cautious: 'border-status-cautious-subtle bg-status-cautious-subtle text-text-cautious-strong',
    warning: 'border-status-warning-subtle bg-status-warning-subtle text-text-warning-strong',
    danger: 'border-status-danger-subtle bg-status-danger-subtle text-text-danger-strong',
  },
  emphasis: {
    neutral: 'border-status-neutral-emphasis bg-status-neutral-emphasis text-text-default-inverted',
    info: 'border-status-info-emphasis bg-status-info-emphasis text-text-primary-inverted',
    positive:
      'border-status-success-emphasis bg-status-success-emphasis text-text-success-inverted',
    cautious:
      'border-status-cautious-emphasis bg-status-cautious-emphasis text-text-cautious-inverted',
    warning: 'border-status-warning-emphasis bg-status-warning-emphasis text-text-warning-inverted',
    danger: 'border-status-danger-emphasis bg-status-danger-emphasis text-text-danger-inverted',
  },
} satisfies Record<ToastAppearance, Record<ToastIntent, string>>;

const toastRegionVariants = cva('fixed z-50 flex flex-col gap-2 outline-none', {
  variants: {
    placement: {
      top: 'inset-x-4 top-4 items-center',
      bottom: 'inset-x-4 bottom-4 items-center',
      'top-end': 'end-4 top-4 items-end',
      'bottom-end': 'end-4 bottom-4 items-end',
      'top-start': 'start-4 top-4 items-start',
      'bottom-start': 'start-4 bottom-4 items-start',
    },
  },
  defaultVariants: {
    placement: 'bottom-end',
  },
});

const toastVariants = cva(
  'flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 font-sans antialiased shadow-lg outline-none [view-transition-class:toast] data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus',
);

type ToastPlacement = NonNullable<VariantProps<typeof toastRegionVariants>['placement']>;

const ToastPlacementContext = React.createContext<ToastPlacement>('bottom-end');
const ToastAppearanceContext = React.createContext<ToastAppearance>('outline');

function getToastMotionStyle(placement: ToastPlacement): React.CSSProperties {
  switch (placement) {
    case 'top-start':
    case 'bottom-start':
      return {
        '--toast-enter-x': '-100%',
        '--toast-exit-x': '-100%',
        '--toast-enter-y': '0',
        '--toast-exit-y': '0',
      } as React.CSSProperties;
    case 'top':
      return {
        '--toast-enter-x': '0',
        '--toast-exit-x': '0',
        '--toast-enter-y': '-100%',
        '--toast-exit-y': '-100%',
      } as React.CSSProperties;
    case 'bottom':
      return {
        '--toast-enter-x': '0',
        '--toast-exit-x': '0',
        '--toast-enter-y': '100%',
        '--toast-exit-y': '100%',
      } as React.CSSProperties;
    default:
      return {
        '--toast-enter-x': '100%',
        '--toast-exit-x': '100%',
        '--toast-enter-y': '0',
        '--toast-exit-y': '0',
      } as React.CSSProperties;
  }
}

const toastContentVariants = cva('flex min-w-0 flex-1 flex-col gap-1');

const toastTitleVariants = cva('type-body-sm-medium');

const toastDescriptionVariants = cva('type-body-sm-regular', {
  variants: {
    appearance: {
      outline: 'text-text-default-muted',
      subtle: 'text-text-default-muted',
      emphasis: 'text-current opacity-80',
    },
  },
  defaultVariants: {
    appearance: 'outline',
  },
});

const toastCloseButtonVariants = cva(
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-border-focus',
  {
    variants: {
      appearance: {
        outline: 'text-icon-default-default hover:bg-gray-alpha-200',
        subtle: 'text-icon-default-default hover:bg-gray-alpha-200',
        emphasis: 'text-current hover:bg-white/15',
      },
    },
    defaultVariants: {
      appearance: 'outline',
    },
  },
);

export interface VeliToastContent {
  title: React.ReactNode;
  description?: React.ReactNode;
  intent?: ToastIntent;
  appearance?: ToastAppearance;
}

export function createToastQueue<T = VeliToastContent>(
  options?: ConstructorParameters<typeof AriaToastQueue<T>>[0],
) {
  return new AriaToastQueue<T>({
    wrapUpdate(fn) {
      if (typeof document !== 'undefined' && 'startViewTransition' in document) {
        document.startViewTransition(() => {
          flushSync(fn);
        });
      } else {
        fn();
      }
    },
    ...options,
  });
}

export interface ToastRegionProps<T>
  extends
    Omit<AriaToastRegionProps<T>, 'className' | 'style' | 'children'>,
    VariantProps<typeof toastRegionVariants> {
  className?: string;
  children?: AriaToastRegionProps<T>['children'];
}

export function ToastRegion<T>({
  className,
  placement = 'bottom-end',
  children,
  ...props
}: ToastRegionProps<T>) {
  return (
    <ToastPlacementContext.Provider value={placement ?? 'bottom-end'}>
      <AriaToastRegion
        {...props}
        className={() => twMerge(toastRegionVariants({ placement }), className)}
      >
        {children ??
          (({ toast }) => (
            <Toast
              toast={toast}
              intent={(toast.content as VeliToastContent).intent}
              appearance={(toast.content as VeliToastContent).appearance}
            />
          ))}
      </AriaToastRegion>
    </ToastPlacementContext.Provider>
  );
}

export interface ToastProps<T> extends Omit<AriaToastProps<T>, 'className'> {
  className?: string;
  intent?: ToastIntent;
  appearance?: ToastAppearance;
}

export function Toast<T>({ className, intent, appearance, style, toast, ...props }: ToastProps<T>) {
  const placement = React.useContext(ToastPlacementContext);
  const content = toast.content as VeliToastContent | undefined;
  const contentIntent = intent ?? content?.intent ?? 'neutral';
  const contentAppearance = appearance ?? content?.appearance ?? 'outline';

  return (
    <ToastAppearanceContext.Provider value={contentAppearance}>
      <AriaToast
        {...props}
        toast={toast}
        style={{
          viewTransitionName: toast.key,
          ...getToastMotionStyle(placement),
          ...style,
        }}
        className={() =>
          twMerge(toastVariants(), toastIntentClasses[contentAppearance][contentIntent], className)
        }
      >
        {(state) => (
          <>
            <ToastContent toast={state.toast} />
            <ToastCloseButton />
          </>
        )}
      </AriaToast>
    </ToastAppearanceContext.Provider>
  );
}

export interface ToastContentProps<T> {
  toast: QueuedToast<T>;
  className?: string;
}

export function ToastContent<T>({ toast, className }: ToastContentProps<T>) {
  const content = toast.content as VeliToastContent;
  const appearance = React.useContext(ToastAppearanceContext);

  return (
    <AriaToastContent className={twMerge(toastContentVariants(), className)}>
      <Text slot="title" className={toastTitleVariants()}>
        {content.title}
      </Text>
      {content.description ? (
        <Text slot="description" className={toastDescriptionVariants({ appearance })}>
          {content.description}
        </Text>
      ) : null}
    </AriaToastContent>
  );
}

export interface ToastCloseButtonProps {
  'aria-label'?: string;
  className?: string;
}

export function ToastCloseButton({
  'aria-label': ariaLabel = 'Close notification',
  className,
}: ToastCloseButtonProps) {
  const appearance = React.useContext(ToastAppearanceContext);

  return (
    <AriaButton
      slot="close"
      aria-label={ariaLabel}
      className={twMerge(toastCloseButtonVariants({ appearance }), className)}
    >
      <svg
        aria-hidden="true"
        className="size-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      >
        <path d="M4 4 12 12" />
        <path d="M12 4 4 12" />
      </svg>
    </AriaButton>
  );
}

export type { QueuedToast, ToastOptions };

ToastRegion.displayName = 'ToastRegion';
Toast.displayName = 'Toast';
ToastContent.displayName = 'ToastContent';
ToastCloseButton.displayName = 'ToastCloseButton';
