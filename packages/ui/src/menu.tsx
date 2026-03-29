import * as React from 'react';
import {
  Header,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuTrigger as AriaMenuTrigger,
  Popover as AriaPopover,
  Section as AriaSection,
  SubmenuTrigger as AriaSubmenuTrigger,
  Separator as AriaSeparator,
  type MenuItemProps as AriaMenuItemProps,
  type MenuProps as AriaMenuProps,
  type MenuTriggerProps as AriaMenuTriggerProps,
  type PopoverProps as AriaPopoverProps,
  type SectionProps as AriaSectionProps,
  type SubmenuTriggerProps as AriaSubmenuTriggerProps,
  type SeparatorProps as AriaSeparatorProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const menuPopoverVariants = cva(
  'min-w-56 rounded-2xl border border-fg-border-default-subtle bg-bg-surface-surface-overlay-raised p-1 text-fg-text-default-default shadow-[0_12px_32px_rgba(15,23,42,0.16)] backdrop-blur-[4px] outline-none',
  {
    variants: {
      size: {
        sm: 'w-56',
        md: 'w-64',
        lg: 'w-72',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const menuVariants = cva('outline-none');

const menuItemVariants = cva(
  'group flex w-full cursor-default items-center gap-2 rounded-xl px-3 text-left font-sans antialiased outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:text-fg-text-disabled-disabled data-[focused]:bg-bg-button-primary-subtle-default data-[pressed]:bg-bg-button-primary-subtle-hover data-[open]:bg-bg-button-primary-subtle-default',
  {
    variants: {
      size: {
        sm: 'min-h-8 py-1.5 text-[14px]',
        md: 'min-h-10 py-2 text-[16px]',
        lg: 'min-h-12 py-2.5 text-[18px]',
      },
      tone: {
        default: 'text-fg-text-default-default',
        danger:
          'text-fg-text-danger-muted data-[focused]:bg-bg-button-danger-subtle-default data-[pressed]:bg-bg-button-danger-subtle-hover data-[open]:bg-bg-button-danger-subtle-default',
      },
    },
    defaultVariants: {
      size: 'md',
      tone: 'default',
    },
  }
);

const menuSectionVariants = cva('py-1 first:pt-0 last:pb-0');

export interface MenuTriggerProps extends AriaMenuTriggerProps {}

export function MenuTrigger(props: MenuTriggerProps) {
  return <AriaMenuTrigger {...props} />;
}

export interface MenuSubmenuTriggerProps extends AriaSubmenuTriggerProps {}

export function MenuSubmenuTrigger(props: MenuSubmenuTriggerProps) {
  return <AriaSubmenuTrigger {...props} />;
}

export interface MenuPopoverProps
  extends Omit<AriaPopoverProps, 'className'>,
    VariantProps<typeof menuPopoverVariants> {
  className?: string;
}

export function MenuPopover({
  size,
  className,
  offset = 8,
  ...props
}: MenuPopoverProps) {
  return (
    <AriaPopover
      {...props}
      offset={offset}
      className={twMerge(menuPopoverVariants({ size }), className)}
    />
  );
}

export interface MenuProps<T extends object>
  extends Omit<AriaMenuProps<T>, 'className'>,
    VariantProps<typeof menuVariants> {
  className?: string;
}

export function Menu<T extends object>({ className, ...props }: MenuProps<T>) {
  return <AriaMenu {...props} className={twMerge(menuVariants(), className)} />;
}

export interface MenuSectionProps<T extends object>
  extends Omit<AriaSectionProps<T>, 'className' | 'children'> {
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function MenuSection<T extends object>({
  title,
  className,
  children,
  ...props
}: MenuSectionProps<T>) {
  return (
    <AriaSection {...props} className={twMerge(menuSectionVariants(), className)}>
      {title ? (
        <Header className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-fg-text-default-muted">
          {title}
        </Header>
      ) : null}
      {children}
    </AriaSection>
  );
}

export interface MenuSeparatorProps extends Omit<AriaSeparatorProps, 'className'> {
  className?: string;
}

export function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  return (
    <AriaSeparator
      {...props}
      className={twMerge('my-1 border-t border-fg-border-default-subtle', className)}
    />
  );
}

export interface MenuItemProps
  extends Omit<AriaMenuItemProps, 'className'>,
    VariantProps<typeof menuItemVariants> {
  className?: string;
  description?: React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  shortcut?: React.ReactNode;
}

export function MenuItem({
  className,
  size,
  tone,
  description,
  startIcon,
  endIcon,
  shortcut,
  children,
  ...props
}: MenuItemProps) {
  const hasStructuredLayout =
    description !== undefined ||
    startIcon !== undefined ||
    endIcon !== undefined ||
    shortcut !== undefined;

  if (typeof children === 'function') {
    return (
      <AriaMenuItem
        {...props}
        className={twMerge(menuItemVariants({ size, tone }), className)}
      >
        {children}
      </AriaMenuItem>
    );
  }

  return (
    <AriaMenuItem
      {...props}
      className={twMerge(menuItemVariants({ size, tone }), className)}
    >
      {hasStructuredLayout ? (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {startIcon ? (
            <span className="shrink-0 text-fg-text-default-muted">{startIcon}</span>
          ) : null}
          <div className="min-w-0 flex-1">
            {children ? <div className="truncate">{children}</div> : null}
            {description ? (
              <div className="truncate text-[12px] text-fg-text-default-muted">
                {description}
              </div>
            ) : null}
          </div>
          {shortcut ? (
            <kbd className="shrink-0 rounded-md bg-bg-button-primary-subtle-default px-1.5 py-0.5 text-[11px] font-medium text-fg-text-primary-muted">
              {shortcut}
            </kbd>
          ) : null}
          {endIcon ? (
            <span className="shrink-0 text-fg-text-default-muted">{endIcon}</span>
          ) : null}
        </div>
      ) : (
        children
      )}
    </AriaMenuItem>
  );
}
