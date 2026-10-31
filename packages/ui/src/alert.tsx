'use client';

import * as React from 'react';
import { XIcon } from '@phosphor-icons/react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { Button, type ButtonProps } from './button.js';
import { useVeliLanguage } from './provider-shared.js';
import { alertIntentClasses, type AlertIntent } from './alert-intent-classes.js';

export type { AlertIntent };
export type AlertAppearance = 'light' | 'highContrast';
export type AlertLayout = 'default' | 'stacked' | 'compact';

const alertVariants = cva(
  'relative flex w-full gap-3 rounded-3xl font-sans antialiased text-start [&:has(>[data-slot=alert-body]>[data-slot=alert-close])>[data-slot=alert-body]]:pe-8',
  {
    variants: {
      appearance: { light: 'border border-base-subtle', highContrast: '' },
      layout: {
        default: 'items-start p-4',
        stacked: 'items-start p-4',
        compact: 'items-center px-4 py-2.5',
      },
    },
  },
);
const alertBodyVariants = cva('flex min-w-0 flex-1', {
  variants: {
    layout: {
      default: 'flex-col gap-1',
      stacked: 'flex-col gap-1',
      compact: 'flex-row items-center gap-3',
    },
  },
});
const alertActionsVariants = cva('flex max-w-full gap-2', {
  variants: {
    layout: {
      default: 'flex-nowrap items-start self-start pt-3',
      stacked: 'w-full flex-col items-stretch pt-3 [&>button]:w-full',
      compact: 'shrink-0 items-center',
    },
  },
});

interface AlertContextValue {
  appearance: AlertAppearance;
  intent: AlertIntent;
  layout: AlertLayout;
  dismiss?: () => void;
}
const AlertContext = React.createContext<AlertContextValue>({
  appearance: 'light',
  intent: 'neutral',
  layout: 'default',
});

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  intent?: AlertIntent;
  appearance?: AlertAppearance;
  layout?: AlertLayout;
  leadingIcon?: React.ReactNode;
  isVisible?: boolean;
  defaultVisible?: boolean;
  onDismiss?: () => void;
  /** Use `alert` for urgent dynamic messages; `status` for ordinary persistent banners. */
  live?: 'alert' | 'status';
}

export function Alert({
  children,
  className,
  intent = 'neutral',
  appearance = 'light',
  layout = 'default',
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
    if (!isControlled) setUncontrolledVisible(false);
    onDismiss?.();
  }, [isControlled, onDismiss]);
  if (!isVisible) return null;
  const colors = alertIntentClasses[intent];
  return (
    <AlertContext.Provider value={{ appearance, intent, layout, dismiss: handleDismiss }}>
      <div
        {...props}
        role={role ?? live}
        data-slot="alert"
        className={twMerge(alertVariants({ appearance, layout }), colors[appearance], className)}
      >
        {leadingIcon ? (
          <span
            aria-hidden="true"
            data-slot="alert-icon"
            className={twMerge(
              'inline-flex h-5 w-5 shrink-0 items-center justify-center [&_svg]:size-5 [&:lang(dv)]:h-7',
              appearance === 'light' ? colors.icon : colors.foreground,
            )}
          >
            {leadingIcon}
          </span>
        ) : null}
        <div data-slot="alert-body" className={alertBodyVariants({ layout })}>
          {children}
        </div>
      </div>
    </AlertContext.Provider>
  );
}

export interface AlertTitleProps {
  children: React.ReactNode;
  className?: string;
}
export function AlertTitle({ children, className }: AlertTitleProps) {
  const { appearance, intent, layout } = React.useContext(AlertContext);
  return (
    <div
      data-slot="alert-title"
      className={twMerge(
        'min-w-0 wrap-anywhere type-body-sm-semibold [&:lang(dv)]:type-body-sm-medium',
        layout === 'compact' ? 'flex-1' : 'w-full',
        appearance === 'light' ? 'text-base-emphasis' : alertIntentClasses[intent].foreground,
        className,
      )}
    >
      {children}
    </div>
  );
}
export interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}
export function AlertDescription({ children, className }: AlertDescriptionProps) {
  const { appearance, intent } = React.useContext(AlertContext);
  return (
    <div
      data-slot="alert-description"
      className={twMerge(
        'w-full min-w-0 wrap-anywhere type-body-sm-regular',
        appearance === 'light' ? 'text-base-strong' : alertIntentClasses[intent].description,
        className,
      )}
    >
      {children}
    </div>
  );
}
export interface AlertActionsProps {
  children: React.ReactNode;
  className?: string;
}

// Only direct Veli ghost Buttons (including fragments) receive Alert's foreground.
// Other actions retain their own colour, event handlers, and application semantics.
function styleGhostActions(children: React.ReactNode, foreground: string): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    if (child.type === React.Fragment) {
      const fragment = child as React.ReactElement<{ children?: React.ReactNode }>;
      return React.cloneElement(fragment, {
        children: styleGhostActions(fragment.props.children, foreground),
      });
    }
    if (child.type !== Button) return child;
    const button = child as React.ReactElement<ButtonProps>;
    if (button.props.appearance !== 'ghost') return child;
    return React.cloneElement(button, {
      className: twMerge(foreground, button.props.className),
    });
  });
}
export function AlertActions({ children, className }: AlertActionsProps) {
  const { appearance, intent, layout } = React.useContext(AlertContext);
  return (
    <div data-slot="alert-actions" className={twMerge(alertActionsVariants({ layout }), className)}>
      {appearance === 'highContrast'
        ? styleGhostActions(children, alertIntentClasses[intent].foreground)
        : children}
    </div>
  );
}

export interface AlertCloseButtonProps {
  'aria-label'?: string;
  className?: string;
}
export function AlertCloseButton({ 'aria-label': ariaLabel, className }: AlertCloseButtonProps) {
  const { appearance, intent, layout, dismiss } = React.useContext(AlertContext);
  const { language } = useVeliLanguage();
  return (
    <Button
      type="button"
      intent="secondary"
      appearance="ghost"
      size="sm"
      iconOnly
      data-slot="alert-close"
      aria-label={ariaLabel ?? (language === 'dv' ? 'އެލާޓް ލައްޕާ' : 'Dismiss alert')}
      className={twMerge(
        'absolute end-2 shrink-0',
        layout === 'compact' ? 'top-1/2 -translate-y-1/2' : 'top-2 [&:lang(dv)]:top-3',
        appearance === 'highContrast'
          ? alertIntentClasses[intent].foreground
          : 'data-[hovered]:text-base-strong data-[pressed]:text-base-strong',
        className,
      )}
      onPress={() => dismiss?.()}
    >
      <XIcon aria-hidden="true" size={16} />
    </Button>
  );
}
Alert.Title = AlertTitle;
Alert.Description = AlertDescription;
Alert.Actions = AlertActions;
Alert.CloseButton = AlertCloseButton;
