import type { DateValue } from 'react-aria-components';
import type { RangeCalendarProps } from '@veli-design/react/calendar';
import type { DatePickerProps } from '@veli-design/react/date-picker';

export type FilterDateRange = NonNullable<RangeCalendarProps<DateValue>['value']>;

export interface FilterDateRangeConfig {
  label: string;
  /** Veli DatePicker input props; selection and formatting stay owned by this example. */
  pickerProps?: Omit<
    DatePickerProps<DateValue>,
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'className'
    | 'inputClassName'
    | 'popoverClassName'
    | 'calendarClassName'
    | 'label'
    | 'appearance'
    | 'size'
    | 'style'
    | 'isDisabled'
    | 'aria-label'
    | 'aria-labelledby'
  >;
  /** Defaults to an ISO date, or ISO start – end for a multi-day range. Supply application-localized date wording here. */
  formatRange?: (range: FilterDateRange) => string;
}

import type { FilterBarMessages, FilterCategory } from '../src/filter-bar/types';

/** Example content belongs to the application; the copied block contains no Media taxonomy. */
export const filterBarCategories: readonly FilterCategory[] = [
  {
    id: 'announcements',
    label: 'Announcements',
    children: [
      { id: 'a2', label: 'A2 Sheets' },
      { id: 'tenders', label: 'Tenders' },
      { id: 'training', label: 'Training Programmes' },
      { id: 'scholarships', label: 'Scholarships' },
      { id: 'jobs', label: 'Job Announcements' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    children: [
      { id: 'annual', label: 'Annual Reports' },
      { id: 'financial', label: 'Financial Reports' },
      { id: 'agm', label: 'AGM & EGM' },
    ],
  },
  {
    id: 'market-prices',
    label: 'Market Prices',
    children: [
      { id: 'financials', label: 'Financials' },
      { id: 'fuel', label: 'Fuel' },
    ],
  },
  { id: 'resources', label: 'Resources' },
  { id: 'guidelines', label: 'Guidelines' },
  { id: 'tourism', label: 'Tourism Bulletin' },
  { id: 'visitors', label: 'Maldives Visitors Survey' },
];

export const filterBarMessages: FilterBarMessages = {
  label: 'Publication filters',
  all: 'All',
  filters: 'Filters',
  closeFilters: 'Close filters',
  done: 'Done',
  showResults: 'Show results',
  search: 'Search',
  closeSearch: 'Close search',
  previousCategories: 'Previous categories',
  nextCategories: 'Next categories',
  clearAll: 'Clear all',
  clearLabels: 'Clear labels',
  activeFilters: 'Active filters',
  showAllFilters: (count) => `Show all filters (${count})`,
  showLessFilters: 'Show less',
  selected: (count) => `${count} selected`,
  filterCount: (count) => `${count} ${count === 1 ? 'filter' : 'filters'} applied`,
  removeFilter: (label) => `Remove ${label}`,
  chooseLabels: (label) => `Choose labels for ${label}`,
};

/** Dhivehi sample copy for consumer integration; replace with approved application wording. */
export const filterBarMessagesDv: FilterBarMessages = {
  label: 'ލިޔުންތަކުގެ ފިލްޓަރުތައް',
  all: 'ހުރިހާ',
  filters: 'ފިލްޓަރުތައް',
  closeFilters: 'ފިލްޓަރުތައް ބަންދުކުރޭ',
  done: 'ނިމުނީ',
  showResults: 'ނަތީޖާ ދައްކާ',
  search: 'ހޯދާ',
  closeSearch: 'ހޯދުން ބަންދުކުރޭ',
  previousCategories: 'ކުރީގެ ބައިތައް',
  nextCategories: 'ދެން އޮތް ބައިތައް',
  clearAll: 'ހުރިހާ އެއްޗެއް ފޮހެލާ',
  clearLabels: 'ލޭބަލްތައް ފޮހެލާ',
  activeFilters: 'އިޚްތިޔާރުކުރެވިފައިވާ ފިލްޓަރުތައް',
  showAllFilters: (count) => `ހުރިހާ ފިލްޓަރެއް ދައްކާ (${count})`,
  showLessFilters: 'މަދުކޮށް ދައްކާ',
  selected: (count) => `${count} އިޚްތިޔާރުކުރެވިފައި`,
  filterCount: (count) => `${count} ފިލްޓަރު އިޚްތިޔާރުކުރެވިފައި`,
  removeFilter: (label) => `${label} ފޮހެލާ`,
  chooseLabels: (label) => `${label} ގެ ލޭބަލްތައް އިޚްތިޔާރުކުރޭ`,
};

const dhivehiCategoryLabels: Record<string, string> = {
  announcements: 'އިޢުލާނުތައް',
  reports: 'ރިޕޯޓުތައް',
  'market-prices': 'ބާޒާރު އަގުތައް',
  resources: 'ރިސޯސްތައް',
  guidelines: 'އިރުޝާދުތައް',
  tourism: 'ޓޫރިޒަމް ބުލެޓިން',
  visitors: 'މޯލްޑިވްސް ވިޒިޓަރ ސާވޭ',
};
const dhivehiOptionLabels: Record<string, string> = {
  a2: 'އޭ ޓޫ ޝީޓުތައް',
  tenders: 'ބީލަންތައް',
  training: 'ތަމްރީނު ޕްރޮގްރާމުތައް',
  scholarships: 'ސްކޮލަޝިޕުތައް',
  jobs: 'ވަޒީފާގެ އިޢުލާނުތައް',
  annual: 'އަހަރީ ރިޕޯޓުތައް',
  financial: 'މާލީ ރިޕޯޓުތައް',
  agm: 'އޭޖީއެމް އަދި އީޖީއެމް',
  financials: 'މާލީ މަޢުލޫމާތު',
  fuel: 'ތެޔޮ',
};
export const filterBarCategoriesDv: readonly FilterCategory[] = filterBarCategories.map(
  (category) => ({
    ...category,
    label: dhivehiCategoryLabels[category.id] ?? category.label,
    children: category.children?.map((option) => ({
      ...option,
      label: dhivehiOptionLabels[option.id] ?? option.label,
    })),
  }),
);

/** Sample app-owned copy shared by every filter demonstration. */
export function getFilterBarExampleContent(language: string) {
  const dv = language === 'dv';
  return {
    categories: dv ? filterBarCategoriesDv : filterBarCategories,
    messages: dv ? filterBarMessagesDv : filterBarMessages,
    showing: (total: number) =>
      dv ? `ޖުމްލަ ${total} ގެ ތެރެއިން 9 ދައްކަމުން` : `Showing 9 of ${total}`,
    noPublications: dv ? 'ލިޔުންތަކެއް ނެތް' : 'No publications',
    date: dv ? 'ޝާއިޢުކުރި ތާރީޚު' : 'Publication date',
    chooseDate: dv ? 'ތާރީޚެއް އިޚްތިޔާރުކުރޭ' : 'Choose publication date',
    searchPlaceholder: dv ? 'ހޯދާ…' : 'Search…',
    archived: dv ? 'އާކައިވްކުރެވިފައި' : 'Archived',
    restricted: dv ? 'ހައްދުކުރެވިފައިވާ ރިޕޯޓުތައް' : 'Restricted reports',
    chosen: (count: number) => (dv ? `${count} އިޚްތިޔާރުކުރެވިފައި` : `${count} chosen`),
    more: (first: string, count: number) =>
      dv ? `${first}، އަދި ${count} އެހެން` : `${first} +${count}`,
    topics: dv ? 'މައުޟޫޢުތައް' : 'Topics',
    news: dv ? 'ޚަބަރު' : 'News',
    publications: dv ? 'ލިޔުންތައް' : 'Publications',
    selectedTopics: dv ? 'އިޚްތިޔާރުކުރެވުނު މައުޟޫޢުތައް' : 'Selected topics',
    none: dv ? 'އެއްޗެއް ނެތް' : 'None',
    browse: dv ? 'ލިޔުންތައް ބައްލަވާ' : 'Browse publications',
    searchPublications: dv ? 'ލިޔުންތައް ހޯދާ' : 'Search publications',
    refine: dv ? 'ފިލްޓަރުކުރޭ' : 'Refine',
    refinePublications: dv ? 'ލިޔުންތައް ފިލްޓަރުކުރޭ' : 'Refine publications',
    selectionHint: dv
      ? 'އިޚްތިޔާރުކުރާއިރު ފިލްޓަރުތައް އެޕްލައިވާނެއެވެ.'
      : 'Selections apply as you choose them.',
    week: dv ? 'ފާއިތުވި 7 ދުވަސް' : 'Last 7 days',
    month: dv ? 'މި މަސް' : 'This month',
    reset: dv ? 'ފިލްޓަރުތައް ފޮހެލާ' : 'Reset filters',
    showResults: (count: number) => (dv ? `ނަތީޖާ ދައްކާ (${count})` : `Show results (${count})`),
    resultsHint: dv
      ? 'ގުޅޭ ނަތީޖާތައް އެޕްލިކޭޝަނުން މިތަނުގައި ދައްކާނެއެވެ.'
      : 'Your application supplies matching results here.',
  };
}
