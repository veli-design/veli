'use client';
import { useId, useState, type MouseEvent, type ReactNode } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { CaretDownIcon } from '@phosphor-icons/react';
import { Button } from '@veli-design/react/button';
import { Checkbox } from '@veli-design/react/checkbox';
import { useFilterBar } from './root';
import { getFilterLabelIds } from './state';
import type { FilterLayoutProps, FilterOption, FilterSectionOptions } from './types';

/** Padding extends the native checkbox target without introducing a second tab stop. */
function activateCheckboxFromPadding(event: MouseEvent<HTMLDivElement>) {
  if (event.defaultPrevented) return;
  // Veli and the browser already handle clicks originating within the label/control.
  if (
    event.target instanceof Element &&
    event.target.closest(
      'label, input, button, a, select, textarea, [role="button"], [role="link"]',
    )
  )
    return;
  const input = event.currentTarget.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if (!input || input.disabled || input.readOnly || input.getAttribute('aria-readonly') === 'true')
    return;
  input.focus({ preventScroll: true });
  input.click();
}

export interface FilterCheckboxProps extends FilterLayoutProps {
  isSelected: boolean;
  onChange: (selected: boolean) => void;
  isDisabled?: boolean;
}
/** Standalone controlled selection row. Only its outer layout/background is block-owned. */
export function FilterCheckbox({
  isSelected,
  onChange,
  isDisabled = false,
  children,
  id,
  className = 'px-4 py-3.5',
}: FilterCheckboxProps) {
  return (
    <div
      id={id}
      role="presentation"
      onClick={activateCheckboxFromPadding}
      data-filter-selected={isSelected || undefined}
      className={`grid min-h-13 items-center rounded-xl ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'} transition-colors duration-normal ease-out motion-reduce:transition-none ${isSelected ? 'bg-primary-alpha-200' : 'has-[:enabled]:hover:bg-menu-hover'} ${className}`}
    >
      <Checkbox isSelected={isSelected} onChange={onChange} isDisabled={isDisabled}>
        {children}
      </Checkbox>
    </div>
  );
}
export interface FilterCheckboxSectionProps extends FilterSectionOptions {
  label: string;
  options: readonly FilterOption[];
  selectedKeys: readonly string[];
  onSelectionChange: (keys: readonly string[]) => void;
  /** Optional count/description supplied by the application. */
  selectedLabel?: ReactNode;
  isDisabled?: boolean;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}
/** Usable without FilterBarRoot: Veli checkbox selection plus an independent disclosure. */
export function FilterCheckboxSection({
  label,
  options,
  selectedKeys,
  onSelectionChange,
  selectedLabel,
  showSelectAll = true,
  showDisclosure = true,
  isDisabled = false,
  isExpanded,
  defaultExpanded = true,
  onExpandedChange,
  className = '',
}: FilterCheckboxSectionProps) {
  const [localExpanded, setLocalExpanded] = useState(defaultExpanded);
  const expanded = !showDisclosure || (isExpanded ?? localExpanded);
  const bodyId = useId();
  const countId = useId();
  const known = options
    .filter((option) => selectedKeys.includes(option.id))
    .map((option) => option.id);
  const enabled = options.filter((option) => !option.isDisabled).map((option) => option.id);
  const allEnabledSelected = enabled.length > 0 && enabled.every((id) => known.includes(id));
  const allSelected = options.length > 0 && known.length === options.length;
  const toggle = () => {
    const next = !expanded;
    if (isExpanded === undefined) setLocalExpanded(next);
    onExpandedChange?.(next);
  };
  return (
    <div className={`rounded-xl ${allSelected ? 'bg-primary-alpha-200' : ''} ${className}`}>
      {!showSelectAll && showDisclosure ? (
        <AriaButton
          aria-label={label}
          aria-expanded={expanded}
          aria-controls={bodyId}
          aria-describedby={selectedLabel != null && known.length ? countId : undefined}
          isDisabled={isDisabled}
          onPress={toggle}
          className={`flex max-[600px]:flex-wrap min-h-13 w-full items-center gap-2 rounded-xl px-4 py-2 text-start text-base-strong outline-none transition-colors duration-normal ease-out motion-reduce:transition-none data-[disabled]:cursor-not-allowed data-[disabled]:text-disabled data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus forced-colors:outline-solid forced-colors:outline-1 ${known.length ? '' : 'data-[hovered]:bg-menu-hover'}`}
        >
          <span className="min-w-0 flex-1 type-body-md-medium">{label}</span>
          {selectedLabel != null && known.length ? (
            <span
              id={countId}
              className="shrink-0 border-s border-base-subtle ps-2 type-body-sm-regular text-base-subtle max-[600px]:order-last max-[600px]:basis-full max-[600px]:border-0 max-[600px]:ps-7"
            >
              {selectedLabel}
            </span>
          ) : null}
          <CaretDownIcon
            aria-hidden
            className={`size-5 shrink-0 transition-transform duration-normal ease-out motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`}
          />
        </AriaButton>
      ) : (
        <div
          role="presentation"
          onClick={showSelectAll ? activateCheckboxFromPadding : undefined}
          className={`flex max-[600px]:flex-wrap min-h-13 ${showSelectAll ? (isDisabled || !enabled.length ? 'cursor-not-allowed' : 'cursor-pointer') : ''} items-center gap-2 rounded-xl px-4 py-2 transition-colors duration-normal ease-out motion-reduce:transition-none ${known.length ? '' : 'has-[input:enabled]:hover:bg-menu-hover'}`}
        >
          <div className="grid min-w-0 flex-1 items-center">
            {showSelectAll ? (
              <Checkbox
                isSelected={allEnabledSelected}
                isIndeterminate={known.length > 0 && !allEnabledSelected}
                isDisabled={isDisabled || !enabled.length}
                aria-describedby={selectedLabel != null && known.length ? countId : undefined}
                onChange={(selected) =>
                  onSelectionChange(
                    selected
                      ? [...new Set([...known, ...enabled])]
                      : known.filter((id) => !enabled.includes(id)),
                  )
                }
              >
                {label}
              </Checkbox>
            ) : (
              <span className="type-body-md-medium text-base-strong">{label}</span>
            )}
          </div>
          {selectedLabel != null && known.length ? (
            <span
              id={countId}
              className="shrink-0 border-s border-base-subtle ps-2 type-body-sm-regular text-base-subtle max-[600px]:order-last max-[600px]:basis-full max-[600px]:border-0 max-[600px]:ps-7"
            >
              {selectedLabel}
            </span>
          ) : null}
          {showDisclosure ? (
            <Button
              intent="secondary"
              appearance="ghost"
              size="sm"
              iconOnly
              aria-label={label}
              aria-expanded={expanded}
              aria-controls={bodyId}
              isDisabled={isDisabled}
              onPress={toggle}
            >
              <CaretDownIcon
                aria-hidden
                className={`size-5 transition-transform duration-normal ease-out motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`}
              />
            </Button>
          ) : null}
        </div>
      )}
      <div
        id={bodyId}
        hidden={!expanded}
        role="group"
        aria-label={label}
        className="flex flex-col gap-0.5"
      >
        {options.map((option) => (
          <div
            key={option.id}
            data-filter-option={option.id}
            role="presentation"
            onClick={activateCheckboxFromPadding}
            data-filter-selected={known.includes(option.id) || undefined}
            className={`grid min-h-13 ${isDisabled || option.isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'} items-center rounded-xl px-9 py-3.5 transition-colors duration-normal ease-out motion-reduce:transition-none ${known.includes(option.id) ? `${allSelected ? '' : 'bg-primary-alpha-200'}` : 'has-[:enabled]:hover:bg-menu-hover'}`}
          >
            <Checkbox
              isSelected={known.includes(option.id)}
              isDisabled={isDisabled || option.isDisabled}
              onChange={(selected) =>
                onSelectionChange(
                  selected ? [...known, option.id] : known.filter((id) => id !== option.id),
                )
              }
            >
              {option.label}
            </Checkbox>
          </div>
        ))}
      </div>
    </div>
  );
}
export interface FilterBarSectionProps extends FilterSectionOptions {
  categoryId: string;
  selectedLabel?: (count: number) => ReactNode;
  className?: string;
}
/** Connects one independent checkbox section/row to the shared category value. */
export function FilterBarSection({
  categoryId,
  showSelectAll,
  showDisclosure,
  selectedLabel,
  className = '',
}: FilterBarSectionProps) {
  const { categories, value, setSelection, isDisabled } = useFilterBar();
  const category = categories.find((item) => item.id === categoryId);
  if (!category) return null;
  const ids = getFilterLabelIds(category, value);
  return category.children?.length ? (
    <div data-filter-section={category.id} className={className}>
      <FilterCheckboxSection
        label={category.label}
        showSelectAll={showSelectAll}
        showDisclosure={showDisclosure}
        options={category.children}
        selectedKeys={ids}
        selectedLabel={selectedLabel?.(ids.length)}
        isDisabled={isDisabled || category.isDisabled}
        onSelectionChange={(keys) => setSelection(category, keys)}
      />
    </div>
  ) : (
    <div data-filter-standalone={category.id} className={className}>
      <FilterCheckbox
        isSelected={Boolean(value.selections[category.id])}
        isDisabled={isDisabled || category.isDisabled}
        onChange={(selected) => setSelection(category, selected ? true : null)}
      >
        {category.label}
      </FilterCheckbox>
    </div>
  );
}
export interface FilterBarSectionsProps extends FilterSectionOptions {
  selectedLabel?: (count: number) => ReactNode;
  className?: string;
}
export function FilterBarSections({
  selectedLabel,
  showSelectAll,
  showDisclosure,
  className = '',
}: FilterBarSectionsProps) {
  const { categories } = useFilterBar();
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      {categories.map((category) => (
        <FilterBarSection
          key={category.id}
          categoryId={category.id}
          showSelectAll={showSelectAll}
          showDisclosure={showDisclosure}
          selectedLabel={selectedLabel}
        />
      ))}
    </div>
  );
}
