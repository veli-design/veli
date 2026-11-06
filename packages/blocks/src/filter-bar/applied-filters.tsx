'use client';
import { forwardRef, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, LayoutGroup, motion, useIsPresent, useReducedMotion } from 'motion/react';
import type { AppliedFilter } from './types';
import { Button as AriaButton } from 'react-aria-components';
import { ArrowRightIcon, XIcon } from '@phosphor-icons/react';
import { Button } from '@veli-design/react/button';
import { useFilterBar } from './root';
import { useFilterBarMobile } from './mobile';

export interface FilterBarStatusProps {
  className?: string;
  children?: ReactNode;
  formatCount: (count: number) => ReactNode;
}
export function FilterBarStatus({ children, formatCount, className = '' }: FilterBarStatusProps) {
  const { count } = useFilterBar();
  return (
    <p className={`type-body-sm-regular text-base-muted ${className}`}>
      {count ? (
        <>
          {formatCount(count)}
          {children ? ', ' : ''}
        </>
      ) : null}
      {children}
    </p>
  );
}
export interface FilterBarAppliedFiltersProps {
  label: string;
  removeLabel: (text: string) => string;
  /** When supplied, mobile shows a bounded number of rows with an inline expansion control. Count is chip groups. */
  disclosure?: { showAll: (count: number) => ReactNode; showLess: ReactNode };
  /** Maximum collapsed mobile rows. Defaults to 2; 0 hides chips and their disclosure on mobile. */
  mobileMaxRows?: number;
  /** Clear action stays available below the mobile chip overview. */
  children?: ReactNode;
  className?: string;
}
export function FilterBarAppliedFilters({
  label,
  removeLabel,
  disclosure,
  mobileMaxRows = 2,
  children,
  className = '',
}: FilterBarAppliedFiltersProps) {
  const { items, isDisabled, focusTrigger } = useFilterBar();
  const listRef = useRef<HTMLUListElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const mobile = useFilterBarMobile();
  const maxRows = Number.isFinite(mobileMaxRows) ? Math.max(0, Math.floor(mobileMaxRows)) : 2;
  const hideChips = mobile && maxRows === 0;
  const collapsible = mobile && Boolean(disclosure) && !hideChips;
  const [expanded, setExpanded] = useState(false);
  const [overflowIds, setOverflowIds] = useState<string[]>([]);
  const [rowHeight, setRowHeight] = useState(56);
  const measureRef = useRef<() => void>(() => {});
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !collapsible) return;
    const measure = () => {
      const ids = new Set(items.map((item) => item.id));
      const chips = Array.from(list.children).filter(
        (node): node is HTMLLIElement =>
          node instanceof HTMLLIElement && ids.has(node.dataset.filterChip ?? ''),
      );
      const rows = [...new Set(chips.map((chip) => chip.offsetTop))].sort((a, b) => a - b);
      const lastRow = rows[Math.min(maxRows, rows.length) - 1] ?? 0;
      const hidden = chips
        .filter((chip) => chip.offsetTop > lastRow + 1)
        .map((chip) => chip.dataset.filterChip!);
      const visible = chips.filter((chip) => chip.offsetTop <= lastRow + 1);
      setRowHeight(Math.max(0, ...visible.map((chip) => chip.offsetTop + chip.offsetHeight)) + 4);
      if (!hidden.length && document.activeElement === toggleRef.current) {
        list
          .querySelector<HTMLButtonElement>('button:not(:disabled)')
          ?.focus({ preventScroll: true });
      }
      setOverflowIds((previous) => (previous.join('|') === hidden.join('|') ? previous : hidden));
    };
    measureRef.current = measure;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    for (const chip of list.children) observer.observe(chip);
    const frame = requestAnimationFrame(measure);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      measureRef.current = () => {};
    };
  }, [collapsible, items, maxRows]);
  const hiddenIds = new Set(collapsible && !expanded ? overflowIds : []);
  const hasOverflow = collapsible && overflowIds.length > 0;
  const reduced = useReducedMotion();
  const [hasChips, setHasChips] = useState(items.length > 0);
  if (items.length && !hasChips) setHasChips(true);
  const remove = (item: AppliedFilter) => {
    const buttons = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>(
        'li:not([aria-hidden="true"]) button:not(:disabled)',
      ) ?? [],
    );
    const current = buttons.findIndex((button) => button.dataset.filterRemove === item.id);
    (buttons[current + 1] ?? buttons[current - 1])?.focus();
    if (buttons.length <= 1) focusTrigger();
    item.onRemove();
  };
  if (!items.length && !hasChips) return null;
  return (
    <LayoutGroup>
      <div
        data-filter-applied-group
        className={`flex min-h-7 min-w-0 max-w-full items-start gap-2 ${collapsible ? 'w-full flex-col' : 'w-max'}`}
      >
        <motion.ul
          ref={listRef}
          id={listId}
          data-filter-chip-list
          style={
            hideChips
              ? { display: 'none' }
              : collapsible && !expanded
                ? { maxHeight: rowHeight, overflow: 'hidden' }
                : undefined
          }
          aria-label={label}
          inert={hideChips}
          aria-hidden={hideChips || !items.length || undefined}
          className={`relative flex min-w-0 max-w-full flex-wrap gap-2 ${collapsible ? 'w-full py-1' : children != null ? 'flex-auto' : ''} ${className}`}
        >
          <AnimatePresence
            initial={false}
            mode="popLayout"
            onExitComplete={() => {
              if (!items.length) {
                setHasChips(false);
                setExpanded(false);
              }
              measureRef.current();
            }}
          >
            {items.map((item) => (
              <AppliedChip
                key={item.id}
                item={item}
                isDisabled={isDisabled}
                removeLabel={removeLabel(item.textValue)}
                onRemove={() => remove(item)}
                reduced={Boolean(reduced)}
                hidden={hiddenIds.has(item.id)}
              />
            ))}
          </AnimatePresence>
        </motion.ul>
        {items.length && (children != null || hasOverflow) ? (
          <motion.div
            layout={reduced ? false : 'position'}
            transition={{ duration: reduced ? 0 : 0.18, ease: [0.2, 0, 0, 1] }}
            data-filter-clear-action
            className={
              collapsible
                ? 'flex w-full flex-wrap items-center justify-between gap-2'
                : 'flex h-6 shrink-0 items-center whitespace-nowrap'
            }
          >
            {hasOverflow && disclosure ? (
              <Button
                ref={toggleRef}
                intent="primary"
                appearance="ghost"
                size="sm"
                aria-expanded={expanded}
                aria-controls={listId}
                onPress={() => setExpanded(!expanded)}
              >
                {expanded ? disclosure.showLess : disclosure.showAll(items.length)}
              </Button>
            ) : null}
            {children}
          </motion.div>
        ) : null}
      </div>
    </LayoutGroup>
  );
}
const AppliedChip = forwardRef<
  HTMLLIElement,
  {
    item: AppliedFilter;
    isDisabled: boolean;
    removeLabel: string;
    onRemove: () => void;
    reduced: boolean;
    hidden: boolean;
  }
>(function AppliedChip({ item, isDisabled, removeLabel, onRemove, reduced, hidden }, ref) {
  const present = useIsPresent();
  return (
    <motion.li
      ref={ref}
      layout={reduced ? false : 'position'}
      initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: reduced ? 1 : 0.98, transition: { duration: reduced ? 0 : 0.12 } }}
      transition={{ duration: reduced ? 0 : 0.18, ease: [0.2, 0, 0, 1] }}
      data-filter-chip={item.id}
      inert={!present || hidden}
      aria-hidden={!present || hidden || undefined}
      style={hidden ? { visibility: 'hidden' } : undefined}
      className="inline-flex h-6 min-w-0 max-w-full items-center gap-2 rounded-full bg-neutral-alpha-200 ps-2 type-caption-regular text-base-strong has-[button[data-hovered]]:bg-neutral-alpha-300"
    >
      <span className="truncate">{item.label}</span>
      {item.description ? (
        <>
          <span aria-hidden className="h-2 w-px shrink-0 bg-border-base-strong" />
          <span className="truncate">{item.description}</span>
        </>
      ) : null}
      <AriaButton
        aria-label={removeLabel}
        data-filter-remove={item.id}
        isDisabled={isDisabled || !present}
        onPress={onRemove}
        className="flex size-6 shrink-0 items-center justify-center rounded-full outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus data-[disabled]:opacity-50 forced-colors:outline-solid forced-colors:outline-1"
      >
        <XIcon aria-hidden className="size-3 shrink-0" />
      </AriaButton>
    </motion.li>
  );
});

export interface FilterBarClearProps {
  children: ReactNode;
  showArrow?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}
export function FilterBarClear({ children, showArrow = false, size = 'md' }: FilterBarClearProps) {
  const { count, clear, focusTrigger, isDisabled } = useFilterBar();
  const buttonRef = useRef<HTMLButtonElement>(null);
  return (
    <Button
      ref={buttonRef}
      intent="primary"
      appearance="ghost"
      size={size}
      isDisabled={isDisabled || !count}
      onPress={() => {
        const dialog = buttonRef.current?.closest('[role="dialog"]');
        if (dialog) {
          // Move focus before clearing disables this control; stay in the active focus scope.
          const target = Array.from(
            dialog.querySelectorAll<HTMLElement>(
              'button:not(:disabled), input:not(:disabled), [tabindex="0"]',
            ),
          ).find((element) => element !== buttonRef.current && !element.closest('[inert]'));
          target?.focus({ preventScroll: true });
        }
        clear();
        if (!dialog) focusTrigger();
      }}
    >
      <span className="whitespace-nowrap">{children}</span>
      {showArrow ? <ArrowRightIcon aria-hidden className="size-4 rtl:rotate-180" /> : null}
    </Button>
  );
}
