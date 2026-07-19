'use client';

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
  Keyboard,
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

import { useVeliLanguage } from './provider';

const menuPopoverClassName =
  'min-w-56 w-max rounded-xl border border-base-subtle bg-menu-bg p-1 text-base-default shadow-md backdrop-blur-xs outline-none';

const menuVariants = cva('outline-none');

const menuItemVariants = cva(
  'group flex w-full cursor-default items-center gap-2 rounded-lg px-3 text-start antialiased outline-none transition-colors duration-normal ease-out data-[disabled]:pointer-events-none data-[disabled]:text-disabled data-[disabled]:[&_svg]:text-icon-disabled data-[focused]:bg-menu-hover data-[pressed]:bg-menu-pressed data-[open]:bg-menu-hover',
  {
    variants: {
      size: {
        sm: 'py-2 type-body-sm-regular',
        md: 'py-3 type-body-sm-regular',
        lg: 'py-3.5 type-body-md-regular',
      },
      intent: {
        default: 'text-base-strong',
        danger:
          'text-danger-muted data-[disabled]:text-disabled data-[focused]:bg-menu-hover-danger data-[pressed]:bg-menu-pressed-danger data-[open]:bg-menu-hover-danger',
      },
    },
    defaultVariants: {
      size: 'md',
      intent: 'default',
    },
  },
);

const menuSectionVariants = cva('py-1 first:pt-0 last:pb-0');

const menuSectionTitleVariants = cva('px-3 text-start text-base-emphasis', {
  variants: {
    size: {
      sm: 'py-1.5 type-body-sm-medium',
      md: 'py-2 type-body-sm-medium',
      lg: 'py-3 type-body-md-medium',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const menuItemRowVariants = cva('flex min-w-0 flex-1 items-start gap-2');

const menuItemTextVariants = cva('flex min-w-0 flex-1 flex-col gap-1.5');

const menuItemLabelRowVariants = cva('flex min-w-0 items-center gap-2');

const menuItemLabelVariants = cva('min-w-0 flex-1 truncate', {
  variants: {
    size: {
      sm: 'type-body-sm-regular',
      md: 'type-body-sm-regular',
      lg: 'type-body-md-regular',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const menuItemDescriptionVariants = cva(
  'truncate type-caption-regular text-base-muted group-data-[disabled]:text-disabled',
);

const menuShortcutVariants = cva(
  'inline-flex shrink-0 items-center rounded-sm bg-menu-shortcut-bg px-1 type-caption-regular text-base-default group-data-[disabled]:text-disabled [&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:text-icon-base group-data-[disabled]:[&_svg]:text-icon-disabled',
);

const menuItemCheckIconVariants = cva(
  'mt-0.5 inline-flex shrink-0 items-center justify-center [&_svg]:shrink-0 group-data-[disabled]:[&_svg]:text-icon-disabled',
  {
    variants: {
      size: {
        sm: '[&_svg]:size-4',
        md: '[&_svg]:size-4',
        lg: '[&_svg]:size-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const menuItemIconVariants = cva(
  'mt-0.5 inline-flex shrink-0 items-center justify-center [&_svg]:shrink-0',
  {
    variants: {
      size: {
        sm: '[&_svg]:size-4',
        md: '[&_svg]:size-4',
        lg: '[&_svg]:size-5',
      },
      intent: {
        default: 'text-base-muted group-data-[disabled]:text-icon-disabled',
        danger: 'text-danger-muted group-data-[disabled]:text-icon-disabled',
      },
    },
    defaultVariants: {
      size: 'md',
      intent: 'default',
    },
  },
);

function MenuItemCheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="text-icon-primary"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.5 8.25L6.5 11.25L12.5 5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface MenuTriggerProps extends AriaMenuTriggerProps {}

export function MenuTrigger(props: MenuTriggerProps) {
  return <AriaMenuTrigger {...props} />;
}

export interface MenuSubmenuTriggerProps extends AriaSubmenuTriggerProps {}

export function MenuSubmenuTrigger(props: MenuSubmenuTriggerProps) {
  return <AriaSubmenuTrigger {...props} />;
}

export interface MenuPopoverProps extends Omit<AriaPopoverProps, 'className'> {
  className?: string;
}

export function MenuPopover({ className, offset = 8, ...props }: MenuPopoverProps) {
  const languageConfig = useVeliLanguage();

  return (
    <AriaPopover
      {...props}
      offset={offset}
      lang={languageConfig.lang}
      dir={languageConfig.direction}
      className={twMerge(menuPopoverClassName, className)}
    />
  );
}

export interface MenuProps<T extends object>
  extends Omit<AriaMenuProps<T>, 'className'>, VariantProps<typeof menuVariants> {
  className?: string;
}

export function Menu<T extends object>({ className, ...props }: MenuProps<T>) {
  return <AriaMenu {...props} className={twMerge(menuVariants(), className)} />;
}

export interface MenuSectionProps<T extends object>
  extends
    Omit<AriaSectionProps<T>, 'className' | 'children'>,
    VariantProps<typeof menuSectionTitleVariants> {
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function MenuSection<T extends object>({
  title,
  size,
  className,
  children,
  ...props
}: MenuSectionProps<T>) {
  return (
    <AriaSection {...props} className={twMerge(menuSectionVariants(), className)}>
      {title ? <Header className={menuSectionTitleVariants({ size })}>{title}</Header> : null}
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
      className={twMerge('mx-3 my-1 border-t border-base-subtle', className)}
    />
  );
}

interface MenuItemContentProps {
  isSelected: boolean;
  size?: 'sm' | 'md' | 'lg' | null;
  intent?: 'default' | 'danger' | null;
  description?: React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  shortcut?: React.ReactNode;
  children: React.ReactNode;
}

function MenuItemContent({
  isSelected,
  size,
  intent,
  description,
  startIcon,
  endIcon,
  shortcut,
  children,
}: MenuItemContentProps) {
  const hasStructuredLayout =
    isSelected ||
    description !== undefined ||
    startIcon !== undefined ||
    endIcon !== undefined ||
    shortcut !== undefined;

  if (!hasStructuredLayout) {
    return children;
  }

  return (
    <div className={menuItemRowVariants()}>
      {isSelected ? (
        <span className={menuItemCheckIconVariants({ size })}>
          <MenuItemCheckIcon />
        </span>
      ) : null}
      {startIcon ? (
        <span className={menuItemIconVariants({ size, intent: intent ?? 'default' })}>
          {startIcon}
        </span>
      ) : null}
      <div className={menuItemTextVariants()}>
        {children || shortcut ? (
          <div className={menuItemLabelRowVariants()}>
            {children ? <div className={menuItemLabelVariants({ size })}>{children}</div> : null}
            {shortcut ? (
              <Keyboard lang="en" className={menuShortcutVariants()}>
                {shortcut}
              </Keyboard>
            ) : null}
          </div>
        ) : null}
        {description ? <div className={menuItemDescriptionVariants()}>{description}</div> : null}
      </div>
      {endIcon ? (
        <span className={menuItemIconVariants({ size, intent: intent ?? 'default' })}>
          {endIcon}
        </span>
      ) : null}
    </div>
  );
}

export interface MenuItemProps
  extends Omit<AriaMenuItemProps, 'className'>, VariantProps<typeof menuItemVariants> {
  className?: string;
  description?: React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  shortcut?: React.ReactNode;
  /** Whether the menu closes when this item is selected. Defaults to React Aria behavior per `selectionMode`. */
  closeOnSelect?: boolean;
}

export function MenuItem({
  className,
  size,
  intent,
  description,
  startIcon,
  endIcon,
  shortcut,
  children,
  ...props
}: MenuItemProps) {
  return (
    <AriaMenuItem {...props} className={twMerge(menuItemVariants({ size, intent }), className)}>
      {(renderProps) => {
        const { isSelected } = renderProps;

        if (typeof children === 'function') {
          return isSelected ? (
            <div className={menuItemRowVariants()}>
              <span className={menuItemCheckIconVariants({ size })}>
                <MenuItemCheckIcon />
              </span>
              <div className={menuItemTextVariants()}>{children(renderProps)}</div>
            </div>
          ) : (
            children(renderProps)
          );
        }

        return (
          <MenuItemContent
            isSelected={isSelected}
            size={size}
            intent={intent}
            description={description}
            startIcon={startIcon}
            endIcon={endIcon}
            shortcut={shortcut}
          >
            {children}
          </MenuItemContent>
        );
      }}
    </AriaMenuItem>
  );
}
