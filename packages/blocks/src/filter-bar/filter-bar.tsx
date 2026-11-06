'use client';
import {
  FilterBarRoot,
  FilterBarToolbar,
  FilterBarActions,
  FilterBarSummary,
  useFilterBar,
} from './root';
import { FilterBarCategories } from './categories';
import { FilterBarSearch } from './search';
import {
  FilterBarPopover,
  FilterBarTrigger,
  FilterBarPanel,
  FilterBarPanelHeader,
  FilterBarPanelBody,
  FilterBarPanelFooter,
  FilterBarDone,
} from './popover';
import { FilterBarSections } from './sections';
import { FilterBarAppliedFilters, FilterBarClear, FilterBarStatus } from './applied-filters';
import type { FilterBarProps, FilterBarMessages } from './types';

export type {
  FilterOption,
  FilterCategory,
  FilterBarValue,
  FilterBarMessages,
  FilterSectionOptions,
  FilterChipSummary,
  FilterBarProps,
  AppliedFilter,
  FilterExtension,
  FilterLayoutProps,
} from './types';
export {
  useFilterBar,
  FilterBarRoot,
  FilterBarToolbar,
  FilterBarActions,
  FilterBarSummary,
} from './root';
export type { FilterBarRootProps } from './root';
export { FilterBarCategories } from './categories';
export type { FilterBarCategoriesProps } from './categories';
export { FilterBarSearch } from './search';
export type { FilterBarSearchProps } from './search';
export {
  FilterBarPopover,
  FilterBarTrigger,
  FilterBarPanel,
  FilterBarPanelHeader,
  FilterBarPanelBody,
  FilterBarPanelFooter,
  FilterBarDone,
} from './popover';
export type { FilterBarPanelProps, FilterBarPanelHeaderProps } from './popover';
export {
  FilterCheckbox,
  FilterCheckboxSection,
  FilterBarSection,
  FilterBarSections,
} from './sections';
export type {
  FilterCheckboxProps,
  FilterCheckboxSectionProps,
  FilterBarSectionProps,
  FilterBarSectionsProps,
} from './sections';
export { FilterBarStatus, FilterBarAppliedFilters, FilterBarClear } from './applied-filters';
export type {
  FilterBarStatusProps,
  FilterBarAppliedFiltersProps,
  FilterBarClearProps,
} from './applied-filters';

function SummaryClear({ messages }: { messages: FilterBarMessages }) {
  const { count, value, items } = useFilterBar();
  if (!count) return null;
  const hasCustom = items.some((item) => item.id.startsWith('extension:'));
  return (
    <FilterBarClear size="sm" showArrow>
      {value.mode === 'advanced' || hasCustom ? messages.clearAll : messages.clearLabels}
    </FilterBarClear>
  );
}
/** Ready-made layout, implemented exclusively with the same public parts available to consumers. */
export function FilterBar({
  categories,
  value,
  onValueChange,
  filters,
  messages,
  sectionOptions,
  chipSummary,
  summary,
  panelStart,
  showSearch = true,
  showScrollArrows,
  mobileMaxRows = 2,
  isDisabled = false,
  className = '',
}: FilterBarProps) {
  return (
    <FilterBarRoot
      label={messages.label}
      categories={categories}
      value={value}
      onValueChange={onValueChange}
      filters={filters}
      chipSummary={{ formatCount: messages.selected, ...chipSummary }}
      isDisabled={isDisabled}
      className={`space-y-7 py-6 min-[601px]:pt-14 ${className}`}
    >
      <FilterBarToolbar>
        <FilterBarCategories labels={messages} showScrollArrows={showScrollArrows} />
        <FilterBarActions className="max-[600px]:w-full max-[600px]:justify-end">
          {showSearch ? (
            <FilterBarSearch label={messages.search} closeLabel={messages.closeSearch} />
          ) : null}
          <FilterBarPopover>
            <FilterBarTrigger label={messages.filters} />
            <FilterBarPanel label={messages.filters} className="w-[26.875rem]">
              <FilterBarPanelHeader title={messages.filters} closeLabel={messages.closeFilters} />
              <FilterBarPanelBody>
                {panelStart ? <div className="pb-3">{panelStart}</div> : null}
                <FilterBarSections {...sectionOptions} selectedLabel={messages.selected} />
              </FilterBarPanelBody>
              <FilterBarPanelFooter>
                <FilterBarClear>{messages.clearAll}</FilterBarClear>
                <FilterBarDone>{messages.showResults}</FilterBarDone>
              </FilterBarPanelFooter>
            </FilterBarPanel>
          </FilterBarPopover>
        </FilterBarActions>
      </FilterBarToolbar>
      <FilterBarSummary>
        <FilterBarStatus formatCount={messages.filterCount}>{summary}</FilterBarStatus>
        <FilterBarAppliedFilters
          label={messages.activeFilters}
          removeLabel={messages.removeFilter}
          mobileMaxRows={mobileMaxRows}
          disclosure={{ showAll: messages.showAllFilters, showLess: messages.showLessFilters }}
        >
          <SummaryClear messages={messages} />
        </FilterBarAppliedFilters>
      </FilterBarSummary>
    </FilterBarRoot>
  );
}
