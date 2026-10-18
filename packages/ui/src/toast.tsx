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
  UNSTABLE_ToastStateContext as AriaToastStateContext,
  type QueuedToast,
  type ToastOptions,
  type ToastProps as AriaToastProps,
  type ToastRegionProps as AriaToastRegionProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { XIcon } from '@phosphor-icons/react';
import { Button } from './button.js';
import { useVeliLanguage } from './provider.js';

export type ToastAppearance = 'outline' | 'subtle' | 'emphasis';
export type ToastIntent = 'neutral' | 'info' | 'positive' | 'cautious' | 'warning' | 'danger';

const toastIntentClasses = {
  outline: {
    neutral: 'border-status-neutral-subtle bg-bg-surface-raised text-base-default',
    info: 'border-status-info-subtle bg-bg-surface-raised text-primary-default',
    positive: 'border-status-success-subtle bg-bg-surface-raised text-success-default',
    cautious: 'border-status-caution-subtle bg-bg-surface-raised text-caution-default',
    warning: 'border-status-warning-subtle bg-bg-surface-raised text-warning-default',
    danger: 'border-status-danger-subtle bg-bg-surface-raised text-danger-default',
  },
  subtle: {
    neutral: 'border-status-neutral-subtle bg-status-neutral-subtle text-base-strong',
    info: 'border-status-info-subtle bg-status-info-subtle text-primary-strong',
    positive: 'border-status-success-subtle bg-status-success-subtle text-success-strong',
    cautious: 'border-status-caution-subtle bg-status-caution-subtle text-caution-strong',
    warning: 'border-status-warning-subtle bg-status-warning-subtle text-warning-strong',
    danger: 'border-status-danger-subtle bg-status-danger-subtle text-danger-strong',
  },
  emphasis: {
    neutral: 'border-status-neutral-emphasis bg-status-neutral-emphasis text-base-inverted',
    info: 'border-status-info-emphasis bg-status-info-emphasis text-primary-inverted',
    positive: 'border-status-success-emphasis bg-status-success-emphasis text-success-inverted',
    cautious: 'border-status-caution-emphasis bg-status-caution-emphasis text-caution-inverted',
    warning: 'border-status-warning-emphasis bg-status-warning-emphasis text-warning-inverted',
    danger: 'border-status-danger-emphasis bg-status-danger-emphasis text-danger-inverted',
  },
} satisfies Record<ToastAppearance, Record<ToastIntent, string>>;

const toastRegionVariants = cva(
  'fixed z-50 flex max-h-dvh flex-col gap-2 overflow-y-auto p-4 outline-none data-[focus-visible]:outline-solid data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-4 data-[focus-visible]:outline-border-focus forced-colors:data-[focus-visible]:outline-[Highlight]',
  {
    variants: {
      placement: {
        top: 'inset-x-0 top-0 items-center',
        bottom: 'inset-x-0 bottom-0 items-center',
        'top-end':
          'end-0 top-0 w-full max-w-[calc(var(--container-sm)+2*var(--veli-spacing-4))] items-end',
        'bottom-end':
          'end-0 bottom-0 w-full max-w-[calc(var(--container-sm)+2*var(--veli-spacing-4))] items-end',
        'top-start':
          'start-0 top-0 w-full max-w-[calc(var(--container-sm)+2*var(--veli-spacing-4))] items-start',
        'bottom-start':
          'start-0 bottom-0 w-full max-w-[calc(var(--container-sm)+2*var(--veli-spacing-4))] items-start',
      },
    },
    defaultVariants: {
      placement: 'bottom-end',
    },
  },
);

const toastVariants = cva(
  'relative flex w-full max-w-sm shrink-0 items-start gap-3 overflow-hidden rounded-xl border p-4 font-sans text-start antialiased shadow-md outline-none [view-transition-class:toast] data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus forced-colors:data-[focus-visible]:outline-solid forced-colors:data-[focus-visible]:outline-2 forced-colors:data-[focus-visible]:outline-[Highlight]',
);

type ToastPlacement = NonNullable<VariantProps<typeof toastRegionVariants>['placement']>;

const ToastPlacementContext = React.createContext<ToastPlacement>('bottom-end');
const ToastAppearanceContext = React.createContext<ToastAppearance>('outline');

function getToastMotionStyle(
  placement: ToastPlacement,
  direction: 'ltr' | 'rtl',
): React.CSSProperties {
  const edge =
    placement === 'top' || placement === 'bottom'
      ? placement
      : placement.endsWith('start')
        ? direction === 'rtl'
          ? 'right'
          : 'left'
        : direction === 'rtl'
          ? 'left'
          : 'right';
  return { viewTransitionClass: `toast toast-from-${edge}` } as React.CSSProperties;
}

const toastContentVariants = cva('flex min-w-0 flex-1 flex-col gap-1');

const toastTitleVariants = cva('type-body-sm-medium [overflow-wrap:anywhere]');

const toastDescriptionVariants = cva('type-body-sm-regular [overflow-wrap:anywhere]', {
  variants: {
    appearance: {
      outline: 'text-base-muted',
      subtle: 'text-base-muted',
      emphasis: 'text-current opacity-80',
    },
  },
  defaultVariants: {
    appearance: 'outline',
  },
});

const toastCloseButtonVariants = cva(
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full outline-none transition-colors duration-normal ease-out motion-reduce:transition-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus forced-colors:data-[focus-visible]:outline-solid forced-colors:data-[focus-visible]:outline-2 forced-colors:data-[focus-visible]:outline-[Highlight]',
  {
    variants: {
      appearance: {
        outline:
          'text-icon-base-default data-[hovered]:bg-neutral-alpha-200 data-[pressed]:bg-neutral-alpha-300',
        subtle:
          'text-icon-base-default data-[hovered]:bg-neutral-alpha-200 data-[pressed]:bg-neutral-alpha-300',
        emphasis:
          'text-icon-base-inverted data-[hovered]:bg-toast-interactive-hover-emphasis data-[pressed]:bg-toast-interactive-active-emphasis',
      },
    },
    defaultVariants: {
      appearance: 'outline',
    },
  },
);

const toastActionsVariants = cva(
  'flex max-w-full flex-wrap items-center gap-2 [&>button]:max-w-full [&>button]:whitespace-normal [&>button]:[overflow-wrap:anywhere]',
);

const toastProgressTrackVariants = cva(
  'pointer-events-none motion-reduce:hidden absolute inset-x-0 bottom-0 h-1 overflow-hidden rounded-b-[inherit]',
  {
    variants: {
      appearance: {
        outline: 'bg-toast-progress-track-outline',
        subtle: 'bg-toast-progress-track-subtle',
        emphasis: 'bg-toast-progress-track-emphasis',
      },
    },
    defaultVariants: {
      appearance: 'outline',
    },
  },
);

const toastProgressIntentFillClasses = {
  neutral: 'bg-status-neutral-emphasis',
  info: 'bg-status-info-emphasis',
  positive: 'bg-status-success-emphasis',
  cautious: 'bg-status-caution-emphasis',
  warning: 'bg-status-warning-emphasis',
  danger: 'bg-status-danger-emphasis',
} satisfies Record<ToastIntent, string>;

type ToastTimerInternals = {
  remaining: number;
  startTime: number | null;
  timerId: ReturnType<typeof setTimeout> | null;
};

function getToastRemainingMs(toast: QueuedToast<unknown>): number | null {
  const { timeout, timer } = toast;
  if (!timeout || timeout <= 0 || !timer) {
    return null;
  }

  const { remaining, startTime, timerId } = timer as unknown as ToastTimerInternals;
  if (remaining <= 0) {
    return 0;
  }

  if (timerId == null) {
    return remaining;
  }

  return Math.max(0, remaining - (Date.now() - (startTime ?? Date.now())));
}

export type VeliToastActionIntent = 'primary' | 'secondary' | 'accent' | 'danger';
export type VeliToastActionAppearance = 'fill' | 'transparent' | 'ghost';

export interface VeliToastAction {
  /** Stable id used when rendering the action list. */
  id?: React.Key;
  label: React.ReactNode;
  onPress?: () => void;
  /** Dismiss the toast after the action runs. @default true */
  dismissOnPress?: boolean;
  intent?: VeliToastActionIntent;
  /** @default 'fill' */
  appearance?: VeliToastActionAppearance;
}

export interface VeliToastContent {
  title: React.ReactNode;
  description?: React.ReactNode;
  intent?: ToastIntent;
  appearance?: ToastAppearance;
  actions?: VeliToastAction[];
  /** Show the close button in the default composition. @default true */
  showCloseButton?: boolean;
  /** Show a depleting progress bar for auto-dismiss toasts. Requires a `timeout` when queueing. */
  showProgress?: boolean;
}

export function createToastQueue<T = VeliToastContent>(
  options?: ConstructorParameters<typeof AriaToastQueue<T>>[0],
): AriaToastQueue<T> {
  // React Stately changes the queue synchronously; wrapUpdate only notifies subscribers.
  // Complete an earlier notification before a new transition captures its snapshot.
  let pending: { run: () => void; transition: ViewTransition } | undefined;
  const flushPending = () => {
    const previous = pending;
    pending = undefined;
    previous?.transition.skipTransition();
    previous?.run();
  };
  class VeliToastQueue extends AriaToastQueue<T> {
    add(content: T, toastOptions?: ToastOptions) {
      flushPending();
      return super.add(content, toastOptions);
    }
    close(key: string) {
      flushPending();
      super.close(key);
    }
    clear() {
      flushPending();
      super.clear();
    }
  }
  return new VeliToastQueue({
    ...options,
    wrapUpdate(fn, action) {
      if (options?.wrapUpdate) {
        options.wrapUpdate(fn, action);
        return;
      }
      flushPending();
      if (
        typeof document === 'undefined' ||
        typeof document.startViewTransition !== 'function' ||
        typeof CSS === 'undefined' ||
        !CSS.supports('view-transition-class', 'toast') ||
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ) {
        fn();
        return;
      }
      let didRun = false;
      const run = () => {
        if (!didRun) {
          didRun = true;
          flushSync(fn);
        }
      };
      try {
        const transition = document.startViewTransition(run);
        pending = { run, transition };
        // A skipped or rejected transition must still deliver its update exactly once.
        void transition.updateCallbackDone.catch(run);
        void transition.ready.catch(() => {});
        void transition.finished.catch(() => {});
      } catch {
        run();
      }
    },
  });
}

export interface ToastRegionProps<T>
  extends Omit<AriaToastRegionProps<T>, 'children'>, VariantProps<typeof toastRegionVariants> {
  children?: AriaToastRegionProps<T>['children'];
}

export function ToastRegion<T>({
  className,
  placement = 'bottom-end',
  children,
  ...props
}: ToastRegionProps<T>) {
  const languageConfig = useVeliLanguage();

  return (
    <ToastPlacementContext.Provider value={placement ?? 'bottom-end'}>
      <AriaToastRegion
        {...props}
        lang={languageConfig.lang}
        dir={languageConfig.direction}
        className={(state) =>
          twMerge(
            toastRegionVariants({ placement }),
            typeof className === 'function' ? className(state) : className,
          )
        }
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

export interface ToastProps<T> extends AriaToastProps<T> {
  intent?: ToastIntent;
  appearance?: ToastAppearance;
}

const ToastIntentContext = React.createContext<ToastIntent>('neutral');

export function Toast<T>({
  className,
  intent,
  appearance,
  style,
  toast,
  children,
  ...props
}: ToastProps<T>) {
  const languageConfig = useVeliLanguage();
  const placement = React.useContext(ToastPlacementContext);
  const content = toast.content as VeliToastContent | undefined;
  const contentIntent = intent ?? content?.intent ?? 'neutral';
  const contentAppearance = appearance ?? content?.appearance ?? 'outline';

  return (
    <ToastAppearanceContext.Provider value={contentAppearance}>
      <ToastIntentContext.Provider value={contentIntent}>
        <AriaToast
          {...props}
          toast={toast}
          lang={languageConfig.lang}
          dir={languageConfig.direction}
          style={(state) => ({
            viewTransitionName: toast.key,
            ...getToastMotionStyle(placement, languageConfig.direction),
            ...(typeof style === 'function' ? style(state) : style),
          })}
          className={(state) =>
            twMerge(
              toastVariants(),
              toastIntentClasses[contentAppearance][contentIntent],
              typeof className === 'function' ? className(state) : className,
            )
          }
        >
          {children ??
            ((state) => (
              <>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <ToastContent toast={state.toast} />
                  <ToastActions toast={state.toast} />
                </div>
                {content?.showCloseButton !== false ? <ToastCloseButton /> : null}
                <ToastTimeoutProgress toast={state.toast} />
              </>
            ))}
        </AriaToast>
      </ToastIntentContext.Provider>
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
      {content.description != null && content.description !== false ? (
        <Text slot="description" className={toastDescriptionVariants({ appearance })}>
          {content.description}
        </Text>
      ) : null}
    </AriaToastContent>
  );
}

export interface ToastActionsProps<T> {
  toast: QueuedToast<T>;
  className?: string;
}

export function ToastActions<T>({ toast, className }: ToastActionsProps<T>) {
  const content = toast.content as VeliToastContent;
  const toastAppearance = React.useContext(ToastAppearanceContext);
  const state = React.useContext(AriaToastStateContext);

  if (!content.actions?.length) {
    return null;
  }

  const idCounts = new Map<string, number>();
  for (const action of content.actions) {
    if (action.id != null) {
      const id = String(action.id);
      idCounts.set(id, (idCounts.get(id) ?? 0) + 1);
    }
  }

  return (
    <div className={twMerge(toastActionsVariants(), className)}>
      {content.actions.map((action, index) => {
        const actionAppearance = action.appearance ?? 'fill';
        const emphasisQuietActionClassName =
          toastAppearance === 'emphasis' &&
          actionAppearance !== 'fill' &&
          action.intent !== 'accent'
            ? 'text-icon-base-inverted data-[hovered]:bg-toast-interactive-hover-emphasis data-[pressed]:bg-toast-interactive-active-emphasis active:bg-white/20'
            : undefined;

        return (
          <Button
            key={
              action.id != null && idCounts.get(String(action.id)) === 1
                ? `id:${action.id}`
                : `action:${index}`
            }
            size="xs"
            intent={action.intent ?? 'secondary'}
            appearance={actionAppearance}
            className={emphasisQuietActionClassName}
            onPress={() => {
              action.onPress?.();
              if (action.dismissOnPress !== false) {
                state?.close(toast.key);
              }
            }}
          >
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}

export interface ToastCloseButtonProps {
  'aria-label'?: string;
  className?: string;
}

export interface ToastTimeoutProgressProps<T> {
  toast: QueuedToast<T>;
  className?: string;
}

function subscribeToastReducedMotion(onChange: () => void) {
  const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  media?.addEventListener('change', onChange);
  return () => media?.removeEventListener('change', onChange);
}

function getToastReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

export function ToastTimeoutProgress<T>({ toast, className }: ToastTimeoutProgressProps<T>) {
  const content = toast.content as VeliToastContent;
  const appearance = React.useContext(ToastAppearanceContext);
  const intent = React.useContext(ToastIntentContext);
  const timeout = toast.timeout;
  const [progress, setProgress] = React.useState(1);
  const reduceMotion = React.useSyncExternalStore(
    subscribeToastReducedMotion,
    getToastReducedMotion,
    () => false,
  );

  React.useEffect(() => {
    if (!content.showProgress || !timeout || timeout <= 0 || !toast.timer) {
      return;
    }

    if (reduceMotion) {
      return;
    }

    let frame = 0;

    const tick = () => {
      const remaining = getToastRemainingMs(toast as QueuedToast<unknown>);
      if (remaining == null) {
        return;
      }

      setProgress(Math.max(0, Math.min(1, remaining / timeout)));

      if (remaining > 0) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [content.showProgress, toast, timeout, reduceMotion]);

  if (!content.showProgress || !timeout || timeout <= 0 || !toast.timer) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={twMerge(toastProgressTrackVariants({ appearance }), className)}
    >
      <div
        className={twMerge(
          'h-full origin-left rtl:origin-right motion-safe:will-change-transform',
          appearance === 'emphasis'
            ? 'bg-toast-progress-fill-emphasis'
            : toastProgressIntentFillClasses[intent],
        )}
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

export function ToastCloseButton({ 'aria-label': ariaLabel, className }: ToastCloseButtonProps) {
  const appearance = React.useContext(ToastAppearanceContext);
  const languageConfig = useVeliLanguage();
  const resolvedAriaLabel =
    ariaLabel ??
    (languageConfig.language === 'dv' ? 'ނޮޓިފިކޭޝަން ބަންދުކުރޭ' : 'Close notification');

  return (
    <AriaButton
      slot="close"
      aria-label={resolvedAriaLabel}
      className={twMerge(toastCloseButtonVariants({ appearance }), className)}
    >
      <XIcon aria-hidden="true" size={16} weight="regular" />
    </AriaButton>
  );
}

export type { QueuedToast, ToastOptions };

ToastRegion.displayName = 'ToastRegion';
Toast.displayName = 'Toast';
ToastContent.displayName = 'ToastContent';
ToastActions.displayName = 'ToastActions';
ToastTimeoutProgress.displayName = 'ToastTimeoutProgress';
ToastCloseButton.displayName = 'ToastCloseButton';
