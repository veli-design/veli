'use client';
import type { ReactNode } from 'react';
import { Sheet } from '@veli-design/react/sheet';
import { useFilterBarMobile } from './mobile';
import { FunnelSimpleIcon } from '@phosphor-icons/react';
import { Button } from '@veli-design/react/button';
import { Badge } from '@veli-design/react/badge';
import {
  Popover,
  PopoverContent,
  PopoverDialog,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  type PopoverProps,
} from '@veli-design/react/popover';
import { useFilterBar } from './root';
import type { FilterLayoutProps } from './types';

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
        <div
          id={id}
          data-filter-panel
          className={`flex min-h-0 flex-1 max-w-[calc(100vw-var(--veli-spacing-8))] flex-col overflow-hidden ${className}`}
        >
          {children}
        </div>
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
  return (
    <PopoverHeader
      title={title}
      closeButtonLabel={closeLabel}
      showDivider={showDivider}
      onClose={() => {
        setPanelOpen(false);
        focusTrigger();
      }}
    >
      {children}
    </PopoverHeader>
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
