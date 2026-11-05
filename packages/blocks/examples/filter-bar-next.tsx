'use client';

import { DatePicker } from '@veli-design/react/date-picker';
import type { FilterDateRange } from './filter-bar-content';
import { useState } from 'react';
import { FilterBar, type FilterBarValue } from '../components/blocks/filter-bar/filter-bar';
import { filterBarCategories, filterBarMessages } from './filter-bar-content';

const publications = [
  {
    id: '1',
    categoryId: 'reports',
    labelId: 'annual',
    date: '2026-11-01',
    title: 'Annual Report 2026',
  },
  {
    id: '2',
    categoryId: 'reports',
    labelId: 'financial',
    date: '2026-11-02',
    title: 'Financial Report 2026',
  },
  {
    id: '3',
    categoryId: 'announcements',
    labelId: 'jobs',
    date: '2026-11-03',
    title: 'UI/UX Designer',
  },
  {
    id: '4',
    categoryId: 'market-prices',
    labelId: 'fuel',
    date: '2026-10-20',
    title: 'Fuel prices for October',
  },
  {
    id: '5',
    categoryId: 'guidelines',
    labelId: null,
    date: '2026-11-04',
    title: 'Application guidelines',
  },
];

/** Replace this local predicate with your API/URL adapter; keep fetching out of the block. */
export function ApplicationFilterBar() {
  const [value, setValue] = useState<FilterBarValue>({
    categoryId: null,
    selections: {},
    mode: 'browse',
    query: '',
  });
  const [dateRange, setDateRange] = useState<FilterDateRange | null>(null);
  const dateText = dateRange
    ? dateRange.start.compare(dateRange.end) === 0
      ? dateRange.start.toString()
      : `${dateRange.start} – ${dateRange.end}`
    : '';
  const hasFilters = Object.keys(value.selections).length > 0;
  const results = publications.filter((publication) => {
    const selection = value.selections[publication.categoryId];
    const matchesCategory = hasFilters
      ? selection === true || (Array.isArray(selection) && selection.includes(publication.labelId))
      : value.categoryId === null || value.categoryId === publication.categoryId;
    return (
      matchesCategory &&
      (!dateRange ||
        (publication.date >= dateRange.start.toString() &&
          publication.date <= dateRange.end.toString())) &&
      publication.title.toLocaleLowerCase().includes(value.query.trim().toLocaleLowerCase())
    );
  });
  return (
    <>
      <FilterBar
        categories={filterBarCategories}
        messages={filterBarMessages}
        value={value}
        onValueChange={setValue}
        panelStart={
          <DatePicker
            appearance="outline"
            size="lg"
            aria-label="Publication date"
            value={dateRange?.start ?? null}
            onChange={(date) => setDateRange(date ? { start: date, end: date } : null)}
          />
        }
        filters={[
          {
            id: 'publication-date',
            items: dateRange
              ? [
                  {
                    id: 'range',
                    label: dateText,
                    textValue: dateText,
                    onRemove: () => setDateRange(null),
                  },
                ]
              : [],
            onClear: () => setDateRange(null),
          },
        ]}
        summary={`Showing ${results.length} of ${publications.length}`}
      />
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {results.length} publications found
      </div>
      <ul className="grid gap-6 md:grid-cols-3">
        {results.map((publication) => (
          <li
            key={publication.id}
            className="rounded-3xl bg-bg-surface-raised p-6 type-body-lg-medium"
          >
            {publication.title}
          </li>
        ))}
      </ul>
      {!results.length ? (
        <p className="type-body-md-regular">No publications match your search and filters.</p>
      ) : null}
    </>
  );
}
