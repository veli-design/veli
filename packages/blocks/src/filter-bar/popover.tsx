'use client';
import { createContext, useContext, type ReactNode } from 'react';
import { Button as AriaButton, Heading } from 'react-aria-components';
import { Sheet } from '@veli-design/react/sheet';
import { useFilterBarMobile } from './mobile';
import { FunnelSimpleIcon, XIcon } from '@phosphor-icons/react';
import { Button } from '@veli-design/react/button';
import { Badge } from '@veli-design/react/badge';
import {
  Popover,
  PopoverContent,
  PopoverDialog,
  PopoverFooter,
  PopoverTrigger,
  type PopoverIntent,
  type PopoverProps,
} from '@veli-design/react/popover';
import { useFilterBar } from './root';
import type { FilterLayoutProps } from './types';

const FilterBarPanelIntentContext = createContext<PopoverIntent>('tertiary');

const panelTitleTone: Record<PopoverIntent, string> = {
  primary: 'text-popover-fg-on-primary',
  secondary: 'text-popover-fg-on-secondary',
  tertiary: 'text-base-strong',
};

const panelDividerTone: Record<PopoverIntent, string> = {
  primary: 'bg-popover-border-on-primary',
  secondary: 'bg-popover-border-on-secondary',
  tertiary: 'bg-border-base-muted',
};

// Mirrors the Veli sm icon Button (Modal/Sheet close); tertiary uses the popover menu hover/pressed tokens, which adapt to dark mode.
const panelCloseBase = [
  '-my-1 -me-2 ms-auto flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent outline-none',
  '[transition-property:background-color,color,scale]',
  '[transition-duration:var(--veli-duration-normal),var(--veli-duration-normal),var(--veli-duration-fast)]',
  '[transition-timing-function:var(--veli-ease-out),var(--veli-ease-out),var(--veli-ease-out-quad)]',
  'data-[pressed]:scale-[1.045] motion-reduce:transition-none motion-reduce:data-[pressed]:scale-100',
  'data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus data-[focus-visible]:ring-offset-2',
  'forced-colors:data-[focus-visible]:outline-solid forced-colors:data-[focus-visible]:outline-2 forced-colors:data-[focus-visible]:outline-offset-2',
].join(' ');

const panelCloseTone: Record<PopoverIntent, string> = {
  primary:
    'text-popover-fg-on-primary data-[hovered]:bg-popover-fg-on-primary/10 data-[pressed]:bg-popover-fg-on-primary/20 data-[focus-visible]:ring-offset-popover-bg-primary',
  secondary:
    'text-popover-fg-on-secondary data-[hovered]:bg-popover-fg-on-secondary/10 data-[pressed]:bg-popover-fg-on-secondary/20 data-[focus-visible]:ring-offset-popover-bg-secondary',
  tertiary:
    'text-base-strong data-[hovered]:bg-menu-hover data-[pressed]:bg-menu-pressed data-[focus-visible]:ring-offset-popover-bg-tertiary',
};

export function FilterBarPopover({ children }: { children: ReactNode }) {
  const { panelOpen, setPanelOpen, isDisabled } = useFilterBar();
  const mobile = useFilterBarMobile();
  if (mobile)
    return (
      <Sheet.Trigger isOpen={panelOpen && !isDisabled} onOpenChange={setPanelOpen}>
        {children}
      </Sheet.Trigger>
    );
  return (
    <PopoverTrigger isOpen={panelOpen && !isDisabled} onOpenChange={setPanelOpen}>
      {children}
    </PopoverTrigger>
  );
}
export function FilterBarTrigger({ label, children }: { label: string; children?: ReactNode }) {
  const { triggerRef, isDisabled, panelOpen, count } = useFilterBar();
  const mobile = useFilterBarMobile();
  const buttonProps = {
    ref: triggerRef,
    intent: 'secondary' as const,
    appearance: 'transparent' as const,
    size: 'md' as const,
    'aria-label': label,
    isDisabled,
    'aria-expanded': panelOpen,
    'aria-haspopup': 'dialog' as const,
  };
  return (
    <div className="relative shrink-0">
      {children || mobile ? (
        <Button {...buttonProps}>
          <FunnelSimpleIcon aria-hidden weight="bold" className="size-4" />
          {children ?? label}
        </Button>
      ) : (
        <Button {...buttonProps} iconOnly>
          <FunnelSimpleIcon aria-hidden weight="bold" className="size-4" />
        </Button>
      )}
      {count ? (
        <span
          data-filter-active-dot
          aria-hidden
          className="pointer-events-none absolute end-0 top-0 flex rounded-full border-2 border-bg-surface-base"
        >
          <Badge size="xs" intent="brand" appearance="emphasis" />
        </span>
      ) : null}
    </div>
  );
}
export interface FilterBarPanelProps extends FilterLayoutProps {
  label: string;
  placement?: PopoverProps['placement'];
  intent?: PopoverProps['intent'];
}
/** className controls the inner block-owned layout, not the Veli surface. */
export function FilterBarPanel({
  label,
  placement = 'bottom end',
  intent = 'tertiary',
  children,
  id,
  className = '',
}: FilterBarPanelProps) {
  const mobile = useFilterBarMobile();
  if (mobile)
    return (
      <Sheet position="bottom" size="full" height="viewport">
        {children}
      </Sheet>
    );
  return (
    <Popover placement={placement} intent={intent} showArrow={false}>
      <PopoverDialog aria-label={label}>
        <FilterBarPanelIntentContext.Provider value={intent ?? 'tertiary'}>
          <div
            id={id}
            data-filter-panel
            className={`flex min-h-0 flex-1 max-w-[calc(100vw-var(--veli-spacing-8))] flex-col overflow-hidden ${className}`}
          >
            {children}
          </div>
        </FilterBarPanelIntentContext.Provider>
      </PopoverDialog>
    </Popover>
  );
}
export interface FilterBarPanelHeaderProps {
  title?: ReactNode;
  closeLabel: string;
  showDivider?: boolean;
  children?: ReactNode;
}
/** Custom children replace title content; use a Heading slot="title" for a custom heading. */
export function FilterBarPanelHeader({
  title,
  closeLabel,
  showDivider = false,
  children,
}: FilterBarPanelHeaderProps) {
  const { setPanelOpen, focusTrigger } = useFilterBar();
  const intent = useContext(FilterBarPanelIntentContext);
  const mobile = useFilterBarMobile();
  if (mobile)
    return (
      <>
        <Sheet.Handle />
        <Sheet.Header>
          {children ?? <Sheet.Title>{title}</Sheet.Title>}
          <Sheet.Close aria-label={closeLabel} />
        </Sheet.Header>
      </>
    );
  // Design spec: 32px inline inset, 24/16 block padding, Body lg title, 20px close icon.
  return (
    <div data-filter-panel-header className="flex shrink-0 flex-col px-8">
      <div className="flex items-center gap-2 pb-4 pt-6">
        {children ??
          (title ? (
            <Heading
              slot="title"
              className={`min-w-0 flex-1 type-body-lg-semibold ${panelTitleTone[intent]}`}
            >
              {title}
            </Heading>
          ) : null)}
        {/* 36px hit area like Modal and Sheet close; negative margins keep the 32px inset and 68px header. */}
        <AriaButton
          aria-label={closeLabel}
          onPress={() => {
            setPanelOpen(false);
            focusTrigger();
          }}
          className={`${panelCloseBase} ${panelCloseTone[intent]}`}
        >
          <XIcon aria-hidden className="size-5 shrink-0" />
        </AriaButton>
      </div>
      {showDivider ? (
        <div aria-hidden className={`h-px w-full shrink-0 ${panelDividerTone[intent]}`} />
      ) : null}
    </div>
  );
}
export function FilterBarPanelBody({
  children,
  id,
  className = 'max-h-[50dvh]',
}: FilterLayoutProps) {
  const mobile = useFilterBarMobile();
  if (mobile)
    return (
      <Sheet.Body id={id} data-filter-panel-body>
        <div className="min-w-0 space-y-4">{children}</div>
      </Sheet.Body>
    );
  return (
    <div
      id={id}
      data-filter-panel-body
      className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${className}`}
    >
      <PopoverContent>{children}</PopoverContent>
    </div>
  );
}
export function FilterBarPanelFooter({
  children,
  showDivider = false,
}: {
  children?: ReactNode;
  showDivider?: boolean;
}) {
  const mobile = useFilterBarMobile();
  if (mobile)
    return (
      <Sheet.Footer data-filter-panel-footer>
        <div className="flex w-full flex-wrap items-center justify-between gap-3 pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </Sheet.Footer>
    );
  return (
    <div data-filter-panel-footer className="shrink-0">
      <PopoverFooter showDivider={showDivider}>{children}</PopoverFooter>
    </div>
  );
}

/** Mobile dismissal action; selections are already applied. */
export function FilterBarDone({ children }: { children: ReactNode }) {
  const mobile = useFilterBarMobile();
  if (!mobile) return null;
  return <Button slot="close">{children}</Button>;
}
