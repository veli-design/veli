'use client';

import * as React from 'react';
import {
  Header,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuSection as AriaMenuSection,
  MenuTrigger as AriaMenuTrigger,
  Popover as AriaPopover,
  SubmenuTrigger as AriaSubmenuTrigger,
  Separator as AriaSeparator,
  type MenuItemProps as AriaMenuItemProps,
  type MenuProps as AriaMenuProps,
  type MenuSectionProps as AriaMenuSectionProps,
  type MenuTriggerProps as AriaMenuTriggerProps,
  type PopoverProps as AriaPopoverProps,
  type SubmenuTriggerProps as AriaSubmenuTriggerProps,
  type SeparatorProps as AriaSeparatorProps,
} from 'react-aria-components';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

import { Kbd, KbdGroup } from './kbd.js';
import { useVeliLanguage } from './provider.js';

/**
 * Enter/exit motion on the positioned root. Opacity, translate and scale must live on
 * this node so React Aria's enter reflow applies to both (inner group-data
 * slides never paint a "from" state). Overlay positioning uses left/top here,
 * so translate is free. `--trigger-anchor-point` is set inline by React Aria on
 * this node, so scale grows from the trigger.
 */
const menuPopoverRootClassName = [
  'outline-none origin-[var(--trigger-anchor-point)]',
  'transition-[opacity,translate,scale] duration-normal ease-out motion-reduce:transition-none',
  'data-[entering]:opacity-0 data-[exiting]:opacity-0',
  'motion-safe:data-[entering]:scale-[0.97] motion-safe:data-[exiting]:scale-[0.97]',
  'data-[exiting]:duration-fast data-[exiting]:ease-in',
  'motion-safe:data-[placement^=top]:data-[entering]:translate-y-1',
  'motion-safe:data-[placement^=top]:data-[exiting]:translate-y-1',
  'motion-safe:data-[placement^=bottom]:data-[entering]:-translate-y-1',
  'motion-safe:data-[placement^=bottom]:data-[exiting]:-translate-y-1',
  'motion-safe:data-[placement^=left]:data-[entering]:translate-x-1',
  'motion-safe:data-[placement^=left]:data-[exiting]:translate-x-1',
  'motion-safe:data-[placement^=right]:data-[entering]:-translate-x-1',
  'motion-safe:data-[placement^=right]:data-[exiting]:-translate-x-1',
  'motion-safe:data-[placement^=start]:data-[entering]:translate-x-1',
  'motion-safe:data-[placement^=start]:data-[exiting]:translate-x-1',
  'motion-safe:data-[placement^=end]:data-[entering]:-translate-x-1',
  'motion-safe:data-[placement^=end]:data-[exiting]:-translate-x-1',
].join(' ');

/** Visual surface — kept off the root so width/className overrides stay local. */
const menuPopoverSurfaceClassName = [
  'min-w-48 w-max rounded-xl border-[0.5px] border-base-muted bg-menu-bg p-1 text-base-default shadow-md backdrop-blur-xs outline-none',
].join(' ');

const menuVariants = cva('outline-none');

const menuItemVariants = cva(
  'group flex w-full cursor-default items-center gap-2 rounded-lg px-4 text-start antialiased outline-none transition-colors duration-normal ease-out motion-reduce:transition-none data-[disabled]:pointer-events-none data-[disabled]:text-disabled data-[disabled]:[&_svg]:text-icon-disabled data-[hovered]:bg-menu-hover data-[focus-visible]:bg-menu-hover data-[pressed]:bg-menu-pressed data-[open]:bg-menu-hover',
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
          'text-danger-muted data-[disabled]:text-disabled data-[hovered]:bg-menu-hover-danger data-[focus-visible]:bg-menu-hover-danger data-[pressed]:bg-menu-pressed-danger data-[open]:bg-menu-hover-danger',
      },
    },
    defaultVariants: {
      size: 'md',
      intent: 'default',
    },
  },
);

const menuSectionVariants = cva('py-1 first:pt-0 last:pb-0');

const menuSectionTitleVariants = cva('px-4 text-start text-base-emphasis', {
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

const menuItemLabelRowVariants = cva('flex min-w-0 items-center gap-1.5');

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
  'truncate text-base-muted group-data-[disabled]:text-disabled',
  {
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
  },
);

const menuItemCheckIconVariants = cva(
  'mt-0.5 inline-flex shrink-0 items-center justify-center [&_svg]:shrink-0 group-data-[disabled]:[&_svg]:text-icon-disabled',
  {
    variants: {
      size: {
        sm: 'size-4 [&_svg]:size-4',
        md: 'size-4 [&_svg]:size-4',
        lg: 'size-5 [&_svg]:size-5',
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
        default: 'text-icon-base group-data-[disabled]:text-icon-disabled',
        danger: 'text-icon-danger-muted group-data-[disabled]:text-icon-disabled',
      },
    },
    defaultVariants: {
      size: 'md',
      intent: 'default',
    },
  },
);

const menuSubmenuCaretVariants = cva(
  'mt-0.5 inline-flex shrink-0 items-center justify-center text-icon-base group-data-[disabled]:text-icon-disabled [&_svg]:shrink-0',
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

function MenuItemSelectionSlot({
  isSelected,
  showSelectionSlot,
  size,
}: {
  isSelected: boolean;
  showSelectionSlot: boolean;
  size?: 'sm' | 'md' | 'lg' | null;
}) {
  if (!showSelectionSlot) {
    return null;
  }

  return (
    <span
      className={menuItemCheckIconVariants({ size })}
      aria-hidden={isSelected ? undefined : true}
      data-veli-menu-selection-slot=""
    >
      {isSelected ? <MenuItemCheckIcon /> : null}
    </span>
  );
}

function MenuSubmenuCaret({ size }: { size?: 'sm' | 'md' | 'lg' | null }) {
  const { direction } = useVeliLanguage();
  const CaretIcon = direction === 'rtl' ? CaretLeftIcon : CaretRightIcon;

  return (
    <span
      className={menuSubmenuCaretVariants({ size })}
      data-veli-menu-submenu-caret=""
      aria-hidden
    >
      <CaretIcon weight="regular" />
    </span>
  );
}

function MenuShortcut({ shortcut }: { shortcut: React.ReactNode }) {
  if (typeof shortcut === 'string') {
    return (
      <KbdGroup dir="ltr" data-veli-menu-shortcut="">
        <Kbd lang="en">{shortcut}</Kbd>
      </KbdGroup>
    );
  }

  if (Array.isArray(shortcut)) {
    return (
      <KbdGroup dir="ltr" data-veli-menu-shortcut="">
        {shortcut.map((key, index) => (
          <Kbd key={index} lang="en">
            {key}
          </Kbd>
        ))}
      </KbdGroup>
    );
  }

  return shortcut;
}

export interface MenuTriggerProps extends AriaMenuTriggerProps {}

export function MenuTrigger(props: MenuTriggerProps) {
  return <AriaMenuTrigger {...props} />;
}

export interface MenuSubmenuTriggerProps extends AriaSubmenuTriggerProps {}

export function MenuSubmenuTrigger(props: MenuSubmenuTriggerProps) {
  return <AriaSubmenuTrigger {...props} />;
}

export interface MenuPopoverProps extends Omit<AriaPopoverProps, 'className' | 'children'> {
  className?: string;
  children?: React.ReactNode;
}

export function MenuPopover({ children, className, offset = 8, ...props }: MenuPopoverProps) {
  const languageConfig = useVeliLanguage();

  return (
    <AriaPopover
      {...props}
      offset={offset}
      lang={languageConfig.lang}
      dir={languageConfig.direction}
      className={menuPopoverRootClassName}
    >
      <div className={twMerge(menuPopoverSurfaceClassName, className)}>{children}</div>
    </AriaPopover>
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
    Omit<AriaMenuSectionProps<T>, 'className' | 'children'>,
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
    <AriaMenuSection {...props} className={twMerge(menuSectionVariants(), className)}>
      {title ? <Header className={menuSectionTitleVariants({ size })}>{title}</Header> : null}
      {children}
    </AriaMenuSection>
  );
}

export interface MenuSeparatorProps extends Omit<AriaSeparatorProps, 'className'> {
  className?: string;
}

export function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  return <AriaSeparator {...props} className={twMerge('border-t border-base-muted', className)} />;
}

interface MenuItemContentProps {
  isSelected: boolean;
  showSelectionSlot: boolean;
  hasSubmenu: boolean;
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
  showSelectionSlot,
  hasSubmenu,
  size,
  intent,
  description,
  startIcon,
  endIcon,
  shortcut,
  children,
}: MenuItemContentProps) {
  const hasStructuredLayout =
    showSelectionSlot ||
    hasSubmenu ||
    description !== undefined ||
    startIcon !== undefined ||
    endIcon !== undefined ||
    shortcut !== undefined;

  if (!hasStructuredLayout) {
    return children;
  }

  return (
    <div className={menuItemRowVariants()}>
      <MenuItemSelectionSlot
        isSelected={isSelected}
        showSelectionSlot={showSelectionSlot}
        size={size}
      />
      {startIcon ? (
        <span className={menuItemIconVariants({ size, intent: intent ?? 'default' })}>
          {startIcon}
        </span>
      ) : null}
      <div className={menuItemTextVariants()}>
        {children || shortcut ? (
          <div className={menuItemLabelRowVariants()}>
            {children ? <div className={menuItemLabelVariants({ size })}>{children}</div> : null}
            {shortcut !== undefined ? <MenuShortcut shortcut={shortcut} /> : null}
          </div>
        ) : null}
        {description ? (
          <div className={menuItemDescriptionVariants({ size })}>{description}</div>
        ) : null}
      </div>
      {endIcon ? (
        <span className={menuItemIconVariants({ size, intent: intent ?? 'default' })}>
          {endIcon}
        </span>
      ) : null}
      {hasSubmenu ? <MenuSubmenuCaret size={size} /> : null}
    </div>
  );
}

export interface MenuItemProps
  extends Omit<AriaMenuItemProps, 'className'>, VariantProps<typeof menuItemVariants> {
  className?: string;
  description?: React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  /** Keyboard shortcut hint. Strings and string arrays render as `Kbd` keys; other nodes pass through. */
  shortcut?: string | readonly string[] | React.ReactNode;
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
        const { isSelected, selectionMode, hasSubmenu } = renderProps;
        const showSelectionSlot = selectionMode !== 'none';

        if (typeof children === 'function') {
          const content = children(renderProps);
          const needsChrome = showSelectionSlot || hasSubmenu;

          if (!needsChrome) {
            return content;
          }

          return (
            <div className={menuItemRowVariants()}>
              <MenuItemSelectionSlot
                isSelected={isSelected}
                showSelectionSlot={showSelectionSlot}
                size={size}
              />
              <div className={menuItemTextVariants()}>{content}</div>
              {hasSubmenu ? <MenuSubmenuCaret size={size} /> : null}
            </div>
          );
        }

        return (
          <MenuItemContent
            isSelected={isSelected}
            showSelectionSlot={showSelectionSlot}
            hasSubmenu={hasSubmenu}
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
