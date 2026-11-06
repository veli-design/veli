'use client';
import { useState } from 'react';
import { useVeliLanguage } from '@veli-design/react/provider';
import { Heading } from 'react-aria-components';
import { Button } from '@veli-design/react/button';
import {
  FilterBarRoot,
  FilterBarToolbar,
  FilterBarActions,
  FilterBarCategories,
  FilterBarSearch,
  FilterBarPopover,
  FilterBarTrigger,
  FilterBarPanel,
  FilterBarPanelHeader,
  FilterBarPanelBody,
  FilterBarPanelFooter,
  FilterBarSections,
  FilterBarSummary,
  FilterBarStatus,
  FilterBarAppliedFilters,
  FilterBarClear,
  useFilterBar,
  type FilterBarValue,
} from '../src/filter-bar/filter-bar';
import { useFilterBarMobile } from '../src/filter-bar/mobile';
import { getFilterBarExampleContent } from './filter-bar-content';

function CustomFooter() {
  const { language } = useVeliLanguage();
  const content = getFilterBarExampleContent(language);
  const { count, setPanelOpen } = useFilterBar();
  return (
    <FilterBarPanelFooter>
      <div className="flex w-full items-center justify-between gap-4">
        <FilterBarClear size="sm">{content.reset}</FilterBarClear>
        <Button size="sm" onPress={() => setPanelOpen(false)}>
          {content.showResults(count)}
        </Button>
      </div>
    </FilterBarPanelFooter>
  );
}
/** A second arrangement: application-owned date presets, header, footer and panel width. */
export function FilterBarCompositionExample() {
  const mobile = useFilterBarMobile();
  const { language } = useVeliLanguage();
  const content = getFilterBarExampleContent(language);
  const messages = content.messages;
  const [value, setValue] = useState<FilterBarValue>({
    categoryId: null,
    selections: {},
    query: '',
    mode: 'browse',
  });
  const [period, setPeriod] = useState<'week' | 'month' | null>(null);
  // Replace these presets with any Veli control. The block never inspects its value.
  const filters = [
    {
      id: 'publication-period',
      items: period
        ? [
            {
              id: 'period',
              label: content[period],
              textValue: `${content.date} | ${content[period]}`,
              onRemove: () => setPeriod(null),
            },
          ]
        : [],
      onClear: () => setPeriod(null),
    },
  ];
  return (
    <FilterBarRoot
      label={content.searchPublications}
      categories={content.categories}
      value={value}
      onValueChange={setValue}
      filters={filters}
      className="flex flex-col gap-6 py-6"
    >
      {mobile ? <FilterBarCategories labels={messages} /> : null}
      <FilterBarToolbar className="justify-between">
        <h2 className="type-body-lg-semibold text-base-strong max-[600px]:hidden">
          {content.browse}
        </h2>
        <FilterBarActions className="max-[600px]:w-full max-[600px]:justify-end">
          <FilterBarSearch
            label={messages.search}
            closeLabel={messages.closeSearch}
            placeholder={content.searchPlaceholder}
            className="w-72 max-[600px]:w-[calc(100%-3.25rem)]"
          />
          <FilterBarPopover>
            <FilterBarTrigger label={content.refinePublications}>{content.refine}</FilterBarTrigger>
            <FilterBarPanel label={content.refinePublications} className="w-[32rem]">
              <FilterBarPanelHeader closeLabel={messages.closeFilters}>
                <div className="min-w-0 flex-1 py-2">
                  <Heading slot="title" className="type-body-lg-semibold text-base-strong">
                    {content.refinePublications}
                  </Heading>
                  <p className="type-body-sm-regular text-base-muted">{content.selectionHint}</p>
                </div>
              </FilterBarPanelHeader>
              <FilterBarPanelBody className="max-h-[60dvh] space-y-4">
                <fieldset className="min-w-0 space-y-2">
                  <legend className="type-body-sm-medium text-base-strong">{content.date}</legend>
                  <div className="flex flex-wrap gap-2">
                    {(['week', 'month'] as const).map((id) => (
                      <Button
                        key={id}
                        intent="secondary"
                        appearance={period === id ? 'fill' : 'transparent'}
                        size="sm"
                        aria-pressed={period === id}
                        onPress={() => setPeriod(period === id ? null : id)}
                      >
                        {content[id]}
                      </Button>
                    ))}
                  </div>
                </fieldset>
                <FilterBarSections selectedLabel={messages.selected} />
              </FilterBarPanelBody>
              <CustomFooter />
            </FilterBarPanel>
          </FilterBarPopover>
        </FilterBarActions>
      </FilterBarToolbar>
      {!mobile ? <FilterBarCategories labels={messages} /> : null}
      <FilterBarSummary>
        <FilterBarStatus formatCount={messages.filterCount}>{content.resultsHint}</FilterBarStatus>
        <FilterBarAppliedFilters
          label={messages.activeFilters}
          removeLabel={messages.removeFilter}
          disclosure={{ showAll: messages.showAllFilters, showLess: messages.showLessFilters }}
        >
          <FilterBarClear size="sm" showArrow>
            {messages.clearAll}
          </FilterBarClear>
        </FilterBarAppliedFilters>
      </FilterBarSummary>
    </FilterBarRoot>
  );
}
