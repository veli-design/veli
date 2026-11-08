'use client';
import { createContext, useContext, useRef, useState, type RefObject } from 'react';
import { useVeliLanguage } from '@veli-design/react/provider';
import type {
  AppliedFilter,
  FilterChipSummary,
  FilterBarValue,
  FilterCategory,
  FilterExtension,
  FilterLayoutProps,
} from './types';
import { getFilterLabelIds, normalizeFilterValue } from './state';

export interface FilterBarRootProps extends FilterLayoutProps {
  label: string;
  categories: readonly FilterCategory[];
  value: FilterBarValue;
  onValueChange: (value: FilterBarValue) => void;
  filters?: readonly FilterExtension[];
  chipSummary?: FilterChipSummary;
  isDisabled?: boolean;
}
interface FilterBarController {
  categories: readonly FilterCategory[];
  value: FilterBarValue;
  items: readonly AppliedFilter[];
  count: number;
  isDisabled: boolean;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  setSelection: (
    category: FilterCategory,
    selection: true | readonly string[] | null,
    source?: 'panel' | 'quick',
  ) => void;
  browse: (id: string | null) => void;
  setQuery: (query: string) => void;
  clear: () => void;
  focusTrigger: () => void;
}
const Context = createContext<FilterBarController | null>(null);
/** Shared controlled selection, applied items and actions; contains no fetching policy. */
export function useFilterBar() {
  const context = useContext(Context);
  if (!context) throw new Error('FilterBar parts must be inside FilterBarRoot.');
  return context;
}
const noExtensions: readonly FilterExtension[] = [];
/** Supplies shared behavior. Children choose their own DOM order and token-based layout. */
export function FilterBarRoot({
  label,
  categories,
  value: inputValue,
  onValueChange,
  filters = noExtensions,
  chipSummary,
  isDisabled = false,
  children,
  id,
  className = '',
}: FilterBarRootProps) {
  const { lang, direction } = useVeliLanguage();
  const maxVisibleValues = chipSummary?.maxVisibleValues ?? 1;
  if (
    maxVisibleValues !== Infinity &&
    (!Number.isInteger(maxVisibleValues) || maxVisibleValues < 0)
  ) {
    throw new RangeError(
      'chipSummary.maxVisibleValues must be a non-negative integer or Infinity.',
    );
  }
  const value = normalizeFilterValue(categories, inputValue);
  const [panelOpen, setPanelOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const focusTrigger = () =>
    (
      triggerRef.current ??
      rootRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')
    )?.focus();
  const commit = (next: FilterBarValue) => onValueChange(normalizeFilterValue(categories, next));
  const setSelection: FilterBarController['setSelection'] = (
    category,
    selection,
    source = 'panel',
  ) => {
    if (isDisabled || category.isDisabled) return;
    const selections = Object.assign(Object.create(null), value.selections) as Record<
      string,
      true | readonly string[]
    >;
    if (selection === true || (selection && selection.length)) selections[category.id] = selection;
    else delete selections[category.id];
    commit({ ...value, selections, mode: source === 'panel' ? 'advanced' : value.mode });
  };
  const clear = () => {
    if (isDisabled) return;
    // Extension values live outside the category value; one reset per consumer control.
    for (const filter of filters) if (filter.items.length) filter.onClear();
    commit({ ...value, selections: {}, mode: 'browse' });
  };
  const browse = (id: string | null) => {
    if (isDisabled) return;
    if (value.mode === 'advanced') {
      if (id === null) clear();
      else {
        const category = categories.find((item) => item.id === id);
        if (category)
          setSelection(
            category,
            value.selections[id]
              ? null
              : category.children?.length
                ? category.children.filter((item) => !item.isDisabled).map((item) => item.id)
                : true,
          );
      }
    } else {
      const category = categories.find((item) => item.id === id);
      if (category?.isDisabled) return;
      commit({
        ...value,
        categoryId: id,
        selections: id !== null && value.selections[id] ? { [id]: value.selections[id] } : {},
      });
    }
  };
  const items: AppliedFilter[] = categories
    .filter((category) => value.selections[category.id])
    .map((category) => {
      const selected = getFilterLabelIds(category, value);
      const selectedOptions =
        category.children?.filter((option) => selected.includes(option.id)) ?? [];
      const names = selectedOptions.map((option) => option.label).join(', ');
      const defaultSummary =
        selectedOptions.length > maxVisibleValues
          ? (chipSummary?.formatCount?.(selectedOptions.length, category) ??
            (lang === 'dv'
              ? `${selectedOptions.length} އިޚްތިޔާރުކުރެވިފައި`
              : `${selectedOptions.length} selected`))
          : names;
      const description = selectedOptions.length
        ? (chipSummary?.formatSelection?.({ category, selectedOptions, defaultSummary }) ??
          defaultSummary)
        : undefined;
      return {
        id: `category:${category.id}`,
        label: category.label,
        description,
        textValue: names ? `${category.label} | ${names}` : category.label,
        count: category.children?.length ? selected.length : 1,
        onRemove: () => {
          if (isDisabled) return;
          const selections = { ...value.selections };
          delete selections[category.id];
          commit({ ...value, selections });
        },
      };
    });
  for (const extension of filters)
    for (const item of extension.items) {
      const count = item.count ?? 1;
      if (!Number.isInteger(count) || count < 1)
        throw new Error('Applied filter count must be a positive integer.');
      items.push({ ...item, id: `extension:${extension.id}:${item.id}` });
    }
  const controller: FilterBarController = {
    categories,
    value,
    items,
    count: items.reduce((total, item) => total + (item.count ?? 1), 0),
    isDisabled,
    panelOpen,
    setPanelOpen,
    triggerRef,
    focusTrigger,
    setSelection,
    browse,
    setQuery: (query) => {
      if (!isDisabled) commit({ ...value, query });
    },
    clear,
  };
  return (
    <Context.Provider value={controller}>
      <section
        ref={rootRef}
        id={id}
        aria-label={label}
        lang={lang}
        dir={direction}
        className={`min-w-0 font-sans ${className}`}
      >
        {children}
      </section>
    </Context.Provider>
  );
}
export function FilterBarToolbar({ children, id, className = '' }: FilterLayoutProps) {
  return (
    <div id={id} className={`flex min-w-0 items-center gap-2 max-[600px]:flex-wrap ${className}`}>
      {children}
    </div>
  );
}
export function FilterBarActions({ children, id, className = '' }: FilterLayoutProps) {
  return (
    <div id={id} className={`flex shrink-0 items-center gap-2 ${className}`}>
      {children}
    </div>
  );
}
export function FilterBarSummary({ children, id, className = '' }: FilterLayoutProps) {
  return (
    <div id={id} className={`flex min-w-0 flex-wrap items-start gap-2 ${className}`}>
      {children}
    </div>
  );
}
