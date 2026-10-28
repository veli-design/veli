'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';
import {
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
import {
  CheckCircleIcon,
  InfoIcon,
  WarningCircleIcon,
  WarningIcon,
  WarningOctagonIcon,
  XIcon,
} from '@phosphor-icons/react';
import { Button } from './button.js';
import { useVeliLanguage } from './provider.js';
import { alertIntentClasses, type AlertIntent } from './alert-intent-classes.js';

export type ToastAppearance = 'subtle' | 'emphasis';
export type ToastIntent = AlertIntent;

const toastIntentIcons = {
  neutral: InfoIcon,
  info: InfoIcon,
  positive: CheckCircleIcon,
  cautious: WarningCircleIcon,
  warning: WarningIcon,
  danger: WarningOctagonIcon,
} satisfies Record<ToastIntent, typeof InfoIcon>;

const toastAppearanceSurface = {
  subtle: 'light',
  emphasis: 'highContrast',
} as const satisfies Record<ToastAppearance, 'light' | 'highContrast'>;

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
  'relative flex w-full max-w-sm shrink-0 items-start gap-3 overflow-hidden rounded-3xl p-4 font-sans text-start antialiased shadow-md outline-none [view-transition-class:toast] data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus forced-colors:data-[focus-visible]:outline-solid forced-colors:data-[focus-visible]:outline-2 forced-colors:data-[focus-visible]:outline-[Highlight]',
);

type ToastPlacement = NonNullable<VariantProps<typeof toastRegionVariants>['placement']>;

const ToastPlacementContext = React.createContext<ToastPlacement>('bottom-end');
const ToastAppearanceContext = React.createContext<ToastAppearance>('subtle');

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

const toastTitleVariants = cva(
  'min-w-0 wrap-anywhere type-body-sm-semibold [&:lang(dv)]:type-body-sm-medium',
);

const toastDescriptionVariants = cva('min-w-0 wrap-anywhere type-body-sm-regular');

const toastActionsVariants = cva(
  'flex max-w-full flex-wrap items-center gap-2 [&>button]:max-w-full [&>button]:whitespace-normal [&>button]:[overflow-wrap:anywhere]',
);

const toastProgressTrackVariants = cva(
  'pointer-events-none motion-reduce:hidden absolute inset-x-0 bottom-0 h-1 overflow-hidden rounded-b-[inherit]',
  {
    variants: {
      appearance: {
        subtle: 'bg-toast-progress-track-subtle',
        emphasis: 'bg-toast-progress-track-emphasis',
      },
    },
    defaultVariants: {
      appearance: 'subtle',
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
  /** Replaces the default per-intent icon. */
  leadingIcon?: React.ReactNode;
  /**
   * Shows the default per-intent icon when `leadingIcon` is omitted.
   * @default true
   */
  showLeadingIcon?: boolean;
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
  leadingIcon?: React.ReactNode;
  /** Shows the default per-intent icon when no `leadingIcon` is set. @default true */
  showLeadingIcon?: boolean;
}

function resolveToastLeadingIcon(
  intent: ToastIntent,
  leadingIcon: React.ReactNode | undefined,
  showLeadingIcon: boolean | undefined,
) {
  if (leadingIcon != null && leadingIcon !== false) return leadingIcon;
  if (showLeadingIcon === false) return null;
  const Icon = toastIntentIcons[intent];
  return <Icon size={20} weight="fill" />;
}

const ToastIntentContext = React.createContext<ToastIntent>('neutral');

export function Toast<T>({
  className,
  intent,
  appearance,
  leadingIcon,
  showLeadingIcon,
  style,
  toast,
  children,
  ...props
}: ToastProps<T>) {
  const languageConfig = useVeliLanguage();
  const placement = React.useContext(ToastPlacementContext);
  const content = toast.content as VeliToastContent | undefined;
  const contentIntent = intent ?? content?.intent ?? 'neutral';
  const contentAppearance = appearance ?? content?.appearance ?? 'subtle';
  const colors = alertIntentClasses[contentIntent];
  const surface = toastAppearanceSurface[contentAppearance];
  const leading = resolveToastLeadingIcon(
    contentIntent,
    leadingIcon ?? content?.leadingIcon,
    showLeadingIcon ?? content?.showLeadingIcon,
  );

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
              contentAppearance === 'subtle' && 'border border-base-subtle',
              colors[surface],
              typeof className === 'function' ? className(state) : className,
            )
          }
        >
          {children ??
            ((state) => (
              <>
                {leading ? (
                  <span
                    aria-hidden="true"
                    data-slot="toast-icon"
                    className={twMerge(
                      'inline-flex h-5 w-5 shrink-0 items-center justify-center [&_svg]:size-5 [&:lang(dv)]:h-7',
                      contentAppearance === 'subtle' ? colors.icon : colors.foreground,
                    )}
                  >
                    {leading}
                  </span>
                ) : null}
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
  const intent = React.useContext(ToastIntentContext);
  const colors = alertIntentClasses[intent];

  return (
    <AriaToastContent className={twMerge(toastContentVariants(), className)}>
      <Text
        slot="title"
        className={twMerge(
          toastTitleVariants(),
          appearance === 'subtle' ? 'text-base-emphasis' : colors.foreground,
        )}
      >
        {content.title}
      </Text>
      {content.description != null && content.description !== false ? (
        <Text
          slot="description"
          className={twMerge(
            toastDescriptionVariants(),
            appearance === 'subtle' ? 'text-base-strong' : colors.description,
          )}
        >
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
  const intent = React.useContext(ToastIntentContext);
  const languageConfig = useVeliLanguage();
  const resolvedAriaLabel =
    ariaLabel ??
    (languageConfig.language === 'dv' ? 'ނޮޓިފިކޭޝަން ބަންދުކުރޭ' : 'Close notification');

  return (
    <span className="relative h-5 w-5 shrink-0 [&:lang(dv)]:h-7">
      <Button
        slot="close"
        type="button"
        intent="secondary"
        appearance="ghost"
        size="sm"
        iconOnly
        aria-label={resolvedAriaLabel}
        className={twMerge(
          'absolute -end-2 -top-2 [&:lang(dv)]:-top-1',
          appearance === 'emphasis' && alertIntentClasses[intent].foreground,
          'data-[hovered]:text-base-strong data-[pressed]:text-base-strong',
          className,
        )}
      >
        <XIcon aria-hidden="true" size={16} />
      </Button>
    </span>
  );
}

export type { QueuedToast, ToastOptions };

ToastRegion.displayName = 'ToastRegion';
Toast.displayName = 'Toast';
ToastContent.displayName = 'ToastContent';
ToastActions.displayName = 'ToastActions';
ToastTimeoutProgress.displayName = 'ToastTimeoutProgress';
ToastCloseButton.displayName = 'ToastCloseButton';
