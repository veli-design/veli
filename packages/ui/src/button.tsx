import {
  Button as AriaButton,
  ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends AriaButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      {...props}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-bg-button-primary-default text-fg-text-default-inverted hover:bg-bg-button-primary-hover focus-visible:ring-fg-border-focus':
              variant === 'primary',
            'bg-bg-button-secondary-default text-fg-text-default-default hover:bg-bg-button-secondary-hover focus-visible:ring-fg-border-focus':
              variant === 'secondary',
            'border-2 border-fg-border-default-muted bg-transparent hover:bg-bg-button-secondary-subtle-hover focus-visible:ring-fg-border-focus':
              variant === 'outline',
            'bg-transparent hover:bg-bg-button-secondary-subtle-hover focus-visible:ring-fg-border-focus':
              variant === 'ghost',
          },
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-base': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
          },
          className
        )
      )}
    >
      {children}
    </AriaButton>
  );
}
