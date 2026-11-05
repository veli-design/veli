import type { ReactNode } from 'react';
export interface FilterOption {
  /** Stable, category-local identifier; never use translated labels as IDs. */
  id: string;
  label: string;
  isDisabled?: boolean;
}

export interface FilterCategory extends FilterOption {
  /** Omit, or pass an empty array, for a selectable whole category. */
  children?: readonly FilterOption[];
}

export interface FilterBarValue {
  /** Remembered quick-browse category. null represents All. */
  categoryId: string | null;
  /** Child IDs for grouped categories; true for a category without children. */
  selections: Readonly<Record<string, true | readonly string[]>>;
  /** Derived from selected categories: multiple categories are outlined; one is solid. */
  mode: 'browse' | 'advanced';
  query: string;
}

/** Application-owned copy, including accessible control names. */
export interface FilterBarMessages {
  label: string;
  all: string;
  filters: string;
  closeFilters: string;
  done: string;
  showResults: string;
  search: string;
  closeSearch: string;
  previousCategories: string;
  nextCategories: string;
  clearAll: string;
  clearLabels: string;
  activeFilters: string;
  showAllFilters: (count: number) => string;
  showLessFilters: string;
  selected: (count: number) => string;
  filterCount: (count: number) => string;
  removeFilter: (label: string) => string;
  chooseLabels: (label: string) => string;
}

/** Independent convenience-section controls. Hidden disclosure always leaves options visible. */
export interface FilterSectionOptions {
  showSelectAll?: boolean;
  showDisclosure?: boolean;
}
export interface FilterChipSummary {
  /** Show names up to this count (default 1). Zero always shows a count; Infinity always shows names. */
  maxVisibleValues?: number;
  formatCount?: (count: number, category: FilterCategory) => string;
  /** Complete consumer override, including per-category thresholds and localized wording. */
  formatSelection?: (context: {
    category: FilterCategory;
    selectedOptions: readonly FilterOption[];
    defaultSummary: string;
  }) => string;
}

export interface FilterBarProps {
  categories: readonly FilterCategory[];
  value: FilterBarValue;
  /** One complete, immutable value per interaction, suitable for URL or server state. */
  onValueChange: (value: FilterBarValue) => void;
  messages: FilterBarMessages;
  sectionOptions?: FilterSectionOptions;
  chipSummary?: FilterChipSummary;
  /** App-owned result count/status. Announce async results in the app when appropriate. */
  summary?: ReactNode;
  /** Optional app-owned controls above the categories, e.g. an integrated date filter. */
  panelStart?: ReactNode;
  /** Consumer-owned filters connected to chips, counts and clear-all. */
  filters?: readonly FilterExtension[];
  /** Omit search entirely when the consumer does not support it. */
  showSearch?: boolean;
  /** Show overflow arrows on mobile and desktop. Defaults to true. */
  showScrollArrows?: boolean;
  /** Maximum collapsed applied-chip rows on mobile. Defaults to 2; 0 hides chips and their disclosure on mobile. */
  mobileMaxRows?: number;
  isDisabled?: boolean;
  className?: string;
}

/** One summary item may represent several selected values. */
export interface AppliedFilter {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  /** Plain accessible wording used by the remove action. */
  textValue: string;
  /** Positive integer; defaults to one. */
  count?: number;
  onRemove: () => void;
}
/** A consumer control owns its values and clears them in one update. */
export interface FilterExtension {
  id: string;
  items: readonly AppliedFilter[];
  onClear: () => void;
}
export interface FilterLayoutProps {
  children?: ReactNode;
  id?: string;
  /** Styles the block-owned layout container, never a Veli control. */
  className?: string;
}
