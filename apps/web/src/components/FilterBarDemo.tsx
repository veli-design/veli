'use client';

import { useState, useSyncExternalStore } from 'react';
import { FilterBar, type FilterBarValue } from '@tradenetcorp/veli-blocks/filter-bar';
import { getFilterBarExampleContent } from '@tradenetcorp/veli-blocks/examples/filter-bar-content';
import { VeliProvider, type VeliColorScheme } from '@veli-design/react/provider';

function subscribeToDocsTheme(callback: () => void) {
  window.addEventListener('veli:color-scheme-change', callback);
  return () => window.removeEventListener('veli:color-scheme-change', callback);
}

function getDocsColorScheme(): VeliColorScheme {
  const value = document.documentElement.dataset.colorScheme;
  return value === 'light' || value === 'dark' ? value : 'system';
}

export function FilterBarDemo() {
  const [value, setValue] = useState<FilterBarValue>({
    categoryId: null,
    selections: {},
    mode: 'browse',
    query: '',
  });
  const colorScheme = useSyncExternalStore(
    subscribeToDocsTheme,
    getDocsColorScheme,
    () => 'system' as const,
  );
  const content = getFilterBarExampleContent('en');

  return (
    <VeliProvider language="en" colorScheme={colorScheme}>
      <div
        data-filter-web-demo
        className="min-w-0 rounded-xl border border-border-base-muted bg-bg-surface-base px-4 [--filter-bar-mobile-gutter:var(--veli-spacing-4)]"
      >
        <FilterBar
          categories={content.categories}
          messages={content.messages}
          value={value}
          onValueChange={setValue}
        />
      </div>
    </VeliProvider>
  );
}
