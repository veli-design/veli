'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { Button } from './button';

export type AlertIntent = 'neutral' | 'info' | 'positive' | 'cautious' | 'warning' | 'danger';
export type AlertAppearance = 'subtle' | 'outline';

const alertIntentClasses = {
  subtle: {
    neutral:
      'border-status-neutral-subtle bg-status-neutral-subtle text-text-default-strong [&_svg]:text-icon-default-strong',
    info: 'border-status-info-subtle bg-status-info-subtle text-text-primary-strong [&_svg]:text-icon-primary-strong',
    positive:
      'border-status-success-subtle bg-status-success-subtle text-text-success-strong [&_svg]:text-icon-success-strong',
    cautious:
      'border-status-cautious-subtle bg-status-cautious-subtle text-text-cautious-strong [&_svg]:text-icon-cautious-strong',
    warning:
      'border-status-warning-subtle bg-status-warning-subtle text-text-warning-strong [&_svg]:text-icon-warning-strong',
    danger:
      'border-status-danger-subtle bg-status-danger-subtle text-text-danger-strong [&_svg]:text-icon-danger-strong',
  },
  outline: {
    neutral:
      'border-status-neutral-subtle bg-bg-surface-raised text-text-default-default [&_svg]:text-icon-default-default',
    info: 'border-status-info-subtle bg-bg-surface-raised text-text-primary-default [&_svg]:text-icon-primary-default',
    positive:
      'border-status-success-subtle bg-bg-surface-raised text-text-success-default [&_svg]:text-icon-success-default',
    cautious:
      'border-status-cautious-subtle bg-bg-surface-raised text-text-cautious-default [&_svg]:text-icon-cautious-default',
    warning:
      'border-status-warning-subtle bg-bg-surface-raised text-text-warning-default [&_svg]:text-icon-warning-default',
    danger:
      'border-status-danger-subtle bg-bg-surface-raised text-text-danger-default [&_svg]:text-icon-danger-default',
  },
} satisfies Record<AlertAppearance, Record<AlertIntent, string>>;

const alertVariants = cva(
  'relative flex w-full gap-3 rounded-xl border p-4 font-sans antialiased',
  {
    variants: {
      live: {
        alert: '',
        status: '',
      },
    },
    defaultVariants: {
      live: 'status',
    },
  },
);

const alertBodyVariants = cva('flex min-w-0 flex-1 flex-col gap-1');

const alertTitleVariants = cva('type-body-sm-medium');

const alertDescriptionVariants = cva('type-body-sm-regular text-current/90');

const alertActionsVariants = cva('mt-2 flex flex-wrap items-center gap-2');

const AlertDismissContext = React.createContext<(() => void) | null>(null);

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>, VariantProps<typeof alertVariants> {
  intent?: AlertIntent;
  appearance?: AlertAppearance;
  leadingIcon?: React.ReactNode;
  isVisible?: boolean;
  defaultVisible?: boolean;
  onDismiss?: () => void;
  /** Use `alert` when content is inserted or updated dynamically; `status` for always-visible banners. */
  live?: 'alert' | 'status';
  className?: string;
}

export function Alert({
  children,
  className,
  intent = 'neutral',
  appearance = 'subtle',
  leadingIcon,
  isVisible: isVisibleProp,
  defaultVisible = true,
  onDismiss,
  live = 'status',
  role,
  ...props
}: AlertProps) {
  const [uncontrolledVisible, setUncontrolledVisible] = React.useState(defaultVisible);
  const isControlled = isVisibleProp !== undefined;
  const isVisible = isControlled ? isVisibleProp : uncontrolledVisible;

  const handleDismiss = React.useCallback(() => {
    if (!isControlled) {
      setUncontrolledVisible(false);
    }
    onDismiss?.();
  }, [isControlled, onDismiss]);

  if (!isVisible) {
    return null;
  }

  const resolvedRole = role ?? (live === 'alert' ? 'alert' : 'status');

  return (
    <AlertDismissContext.Provider value={handleDismiss}>
      <div
        {...props}
        role={resolvedRole}
        className={twMerge(
          alertVariants({ live }),
          alertIntentClasses[appearance][intent],
          className,
        )}
      >
        {leadingIcon ? (
          <span aria-hidden="true" className="inline-flex shrink-0 pt-0.5 [&_svg]:size-5">
            {leadingIcon}
          </span>
        ) : null}
        <div className={alertBodyVariants()}>{children}</div>
      </div>
    </AlertDismissContext.Provider>
  );
}

export interface AlertTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertTitle({ children, className }: AlertTitleProps) {
  return <div className={twMerge(alertTitleVariants(), className)}>{children}</div>;
}

export interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDescription({ children, className }: AlertDescriptionProps) {
  return <div className={twMerge(alertDescriptionVariants(), className)}>{children}</div>;
}

export interface AlertActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertActions({ children, className }: AlertActionsProps) {
  return <div className={twMerge(alertActionsVariants(), className)}>{children}</div>;
}

export interface AlertCloseButtonProps {
  'aria-label'?: string;
  className?: string;
}

export function AlertCloseButton({
  'aria-label': ariaLabel = 'Dismiss alert',
  className,
}: AlertCloseButtonProps) {
  const onDismiss = React.useContext(AlertDismissContext);

  return (
    <Button
      type="button"
      intent="secondary"
      appearance="ghost"
      size="sm"
      iconOnly
      aria-label={ariaLabel}
      className={twMerge('absolute end-3 top-3 shrink-0', className)}
      onPress={() => onDismiss?.()}
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
    </Button>
  );
}

Alert.Title = AlertTitle;
Alert.Description = AlertDescription;
Alert.Actions = AlertActions;
Alert.CloseButton = AlertCloseButton;
