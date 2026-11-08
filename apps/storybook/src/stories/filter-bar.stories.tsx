import { DatePicker } from '@veli-design/react/date-picker';
import type {
  FilterDateRange,
  FilterDateRangeConfig,
} from '@tradenetcorp/veli-blocks/examples/filter-bar-content';
import compositionSource from '../../../../packages/blocks/examples/filter-bar-composition.tsx?raw';
import storySource from './filter-bar.stories.tsx?raw';
import { FilterBarCompositionExample } from '@tradenetcorp/veli-blocks/examples/filter-bar-composition';
import {
  FilterBarRoot,
  FilterBarToolbar,
  FilterBarCategories,
  FilterBarActions,
  FilterBarSearch,
  FilterBarPopover,
  FilterBarTrigger,
  FilterBarPanel,
  FilterBarPanelHeader,
  FilterBarPanelBody,
  FilterBarPanelFooter,
  FilterBarDone,
  FilterBarSection,
  FilterBarSummary,
  FilterBarStatus,
  FilterBarAppliedFilters,
  FilterBarClear,
} from '@tradenetcorp/veli-blocks/filter-bar';
import { parseDate } from '@internationalized/date';
import { Heading } from 'react-aria-components';
import { useState } from 'react';
import { useVeliLanguage } from '@veli-design/react/provider';
import type { Meta, StoryObj } from '@storybook/react';
import {
  FilterBar,
  FilterCheckboxSection,
  type FilterBarProps,
  type FilterBarValue,
} from '@tradenetcorp/veli-blocks/filter-bar';
import {
  filterBarCategories,
  filterBarMessages,
  getFilterBarExampleContent,
} from '@tradenetcorp/veli-blocks/examples/filter-bar-content';

const empty: FilterBarValue = { categoryId: null, selections: {}, mode: 'browse', query: '' };

type ExampleProps = FilterBarProps & {
  dateRange?: FilterDateRangeConfig;
  initialDateRange?: FilterDateRange;
  scenario?:
    | 'standard'
    | 'quick-browse'
    | 'empty'
    | 'disabled-options'
    | 'long-labels'
    | 'date-selected'
    | 'many-filters';
  showSelectAll?: boolean;
  showDisclosure?: boolean;
  maxVisibleValues?: number;
  summaryFormat?: 'default' | 'chosen' | 'first-plus-more';
  showDate?: boolean;
  defaultExpanded?: boolean;
};
function Example({
  value: initialValue,
  dateRange: config,
  initialDateRange,
  scenario: _scenario,
  showSelectAll = true,
  showDisclosure = true,
  maxVisibleValues = 1,
  summaryFormat = 'default',
  showDate = true,
  defaultExpanded: _defaultExpanded,
  ...props
}: ExampleProps) {
  // Demo-only controls must not be forwarded to the block.
  const { language } = useVeliLanguage();
  const content = getFilterBarExampleContent(language);
  const categories = props.categories.map((category) => {
    const translated = content.categories.find((item) => item.id === category.id);
    const label =
      translated?.label ?? (category.id === 'archived' ? content.archived : category.label);
    return {
      ...category,
      label: _scenario === 'long-labels' ? label.repeat(8) : label,
      children: category.children?.map((option) => ({
        ...option,
        label:
          translated?.children?.find((item) => item.id === option.id)?.label ??
          (option.id === 'restricted' ? content.restricted : option.label),
      })),
    };
  });
  void _defaultExpanded;
  const [value, setValue] = useState(initialValue);
  const [range, setRange] = useState<FilterDateRange | null>(initialDateRange ?? null);
  const text = range
    ? (config?.formatRange?.(range) ??
      (range.start.compare(range.end) === 0
        ? range.start.toString()
        : `${range.start} – ${range.end}`))
    : '';
  const filters = [
    {
      id: 'date',
      items: range
        ? [{ id: 'range', label: text, textValue: text, onRemove: () => setRange(null) }]
        : [],
      onClear: () => setRange(null),
    },
  ];
  return (
    <div className="mx-auto max-w-7xl bg-bg-surface-base px-4 min-[601px]:px-6 [--filter-bar-mobile-gutter:var(--veli-spacing-4)] pb-12">
      <FilterBar
        {...props}
        categories={categories}
        messages={content.messages}
        summary={
          _scenario === 'empty'
            ? content.noPublications
            : content.showing(props.summary === 'Showing 9 of 55' ? 55 : 209)
        }
        value={value}
        onValueChange={setValue}
        filters={showDate ? filters : []}
        sectionOptions={{ showSelectAll, showDisclosure }}
        chipSummary={{
          maxVisibleValues,
          ...(summaryFormat === 'chosen' ? { formatCount: content.chosen } : {}),
          ...(summaryFormat === 'first-plus-more'
            ? {
                formatSelection: ({
                  selectedOptions,
                }: {
                  selectedOptions: readonly { label: string }[];
                }) => content.more(selectedOptions[0]?.label ?? '', selectedOptions.length - 1),
              }
            : {}),
        }}
        panelStart={
          config && showDate ? (
            <DatePicker
              appearance="outline"
              size="lg"
              {...config.pickerProps}
              aria-label={content.date}
              calendarButtonLabel={content.chooseDate}
              value={range?.start ?? null}
              onChange={(date) => setRange(date ? { start: date, end: date } : null)}
              isDisabled={props.isDisabled}
            />
          ) : (
            props.panelStart
          )
        }
      />
    </div>
  );
}

function presetSource(input: ExampleProps) {
  const args = { ...input, ...scenarios[input.scenario ?? 'standard'] };
  const dateSetup = args.showDate
    ? `
const [date, setDate] = useState<DateValue | null>(null);
const filters = [{
  id: 'date',
  items: date ? [{ id: 'day', label: date.toString(), textValue: date.toString(), onRemove: () => setDate(null) }] : [],
  onClear: () => setDate(null),
}];
`
    : '';
  const dateProps = args.showDate
    ? `
  filters={filters}
  panelStart={<DatePicker appearance="outline" size="lg" aria-label=${JSON.stringify(args.dateRange?.label ?? 'Publication date')} value={date} onChange={setDate} isDisabled={${args.isDisabled ?? false}} />}`
    : '';
  const formatter =
    args.summaryFormat === 'chosen'
      ? '\n    formatCount: (count) => `${count} chosen`,'
      : args.summaryFormat === 'first-plus-more'
        ? '\n    formatSelection: ({ selectedOptions }) => `${selectedOptions[0]?.label} +${selectedOptions.length - 1}`,'
        : '';
  return `const [value, setValue] = useState<FilterBarValue>(${JSON.stringify(args.value, null, 2)});
${dateSetup}
<FilterBar
  categories={categories}
  messages={messages}
  value={value}
  onValueChange={setValue}
  showSearch={${args.showSearch ?? true}}${
    args.showScrollArrows === undefined
      ? ''
      : `
  showScrollArrows={${args.showScrollArrows}}`
  }
  mobileMaxRows={${args.mobileMaxRows ?? 2}}
  isDisabled={${args.isDisabled ?? false}}
  sectionOptions={{ showSelectAll: ${args.showSelectAll ?? true}, showDisclosure: ${args.showDisclosure ?? true} }}
  chipSummary={{
    maxVisibleValues: ${args.maxVisibleValues ?? 1},${formatter}
  }}
  summary=${JSON.stringify(args.summary)}${dateProps}
/>`;
}
function sectionSource(args: ExampleProps) {
  return `const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

<FilterCheckboxSection
  label="Topics"
  options={options}
  selectedKeys={selectedKeys}
  onSelectionChange={(keys) => setSelectedKeys([...keys])}
  showSelectAll={${args.showSelectAll ?? true}}
  showDisclosure={${args.showDisclosure ?? true}}
  defaultExpanded={${args.defaultExpanded ?? true}}
  isDisabled={${args.isDisabled ?? false}}
  selectedLabel={\`\${selectedKeys.length} selected\`}
/>`;
}

const meta = {
  title: 'Blocks/Filter bar',
  component: Example,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: {
      include: [
        'scenario',
        'showSearch',
        'showScrollArrows',
        'mobileMaxRows',
        'showDate',
        'isDisabled',
        'showSelectAll',
        'showDisclosure',
        'maxVisibleValues',
        'summaryFormat',
      ],
    },
    docs: {
      description: {
        component:
          'A controlled filter block. Use Playground for the preset, Applied filters for chip policies, and Checkbox section for independently reusable selection. Controls map to the public props shown in each source example. Data, result filtering and dates stay consumer-owned.',
      },
      source: {
        type: 'dynamic',
        transform: (_source: string, context: { args: ExampleProps }) => presetSource(context.args),
      },
    },
  },
  argTypes: {
    scenario: {
      control: 'select',
      options: [
        'standard',
        'quick-browse',
        'empty',
        'disabled-options',
        'long-labels',
        'date-selected',
        'many-filters',
      ],
      description: 'Example data only; not a FilterBar prop.',
      table: { category: 'Example data' },
    },
    showSelectAll: {
      control: 'boolean',
      description: 'sectionOptions.showSelectAll: include a group selection checkbox.',
      table: { category: 'Sections' },
    },
    showDisclosure: {
      control: 'boolean',
      description:
        'sectionOptions.showDisclosure: allow collapse. Without it, options stay visible.',
      table: { category: 'Sections' },
    },
    maxVisibleValues: {
      control: { type: 'number', min: 0, step: 1 },
      description:
        'chipSummary.maxVisibleValues: show names through this count, then a count summary. Public API also accepts Infinity.',
      table: { category: 'Applied chips' },
    },
    summaryFormat: {
      control: 'select',
      options: ['default', 'chosen', 'first-plus-more'],
      description: 'Examples of chipSummary.formatCount and formatSelection callbacks.',
      table: { category: 'Applied chips' },
    },
    showDate: {
      control: 'boolean',
      description: 'Example composition toggle: adds DatePicker through panelStart and filters.',
      table: { category: 'Composition' },
    },
    showSearch: { control: 'boolean', table: { category: 'Preset' } },
    mobileMaxRows: {
      control: { type: 'number', min: 0, step: 1 },
      description:
        'Maximum collapsed rows of applied chips on mobile; 0 hides chips and disclosure. Desktop shows all chips.',
      table: { category: 'Applied chips', defaultValue: { summary: '2' } },
    },
    showScrollArrows: {
      control: 'boolean',
      description:
        'True enables arrows when overflowing; false hides them. Defaults to true on mobile and desktop.',
      table: { category: 'Preset', defaultValue: { summary: 'true' } },
    },
    isDisabled: { control: 'boolean', table: { category: 'State' } },
    defaultExpanded: {
      control: 'boolean',
      description:
        'Initial expansion for the standalone section. Ignored when disclosure is hidden.',
      table: { category: 'Sections' },
    },
  },
  args: {
    scenario: 'standard',
    mobileMaxRows: 2,
    showSelectAll: true,
    showDisclosure: true,
    maxVisibleValues: 1,
    summaryFormat: 'default',
    showDate: true,
    showSearch: true,
    isDisabled: false,
    defaultExpanded: true,
    categories: filterBarCategories,
    messages: filterBarMessages,
    value: empty,
    onValueChange: () => {},
    summary: 'Showing 9 of 209',
    dateRange: {
      label: 'Publication date',
      pickerProps: {
        placeholderValue: parseDate('2026-11-01'),
        calendarButtonLabel: 'Choose publication date',
      },
    },
  },
  render: (args) => {
    const fixture = scenarios[args.scenario ?? 'standard'];
    return (
      <Example
        key={JSON.stringify([args.scenario, args.value, args.showDate])}
        {...args}
        {...fixture}
      />
    );
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: 'Playground' };
const QuickBrowse: Story = {
  args: {
    value: { ...empty, categoryId: 'announcements', selections: { announcements: ['a2', 'jobs'] } },
  },
};
export const Advanced: Story = {
  name: 'Applied filters',
  parameters: {
    controls: {
      include: [
        'maxVisibleValues',
        'summaryFormat',
        'isDisabled',
        'showScrollArrows',
        'mobileMaxRows',
      ],
    },
    docs: {
      description: {
        story:
          'Change the threshold and formatter, then select or remove values to see the summary update. Zero always shows counts; the public API accepts Infinity to always show names. Full selected names remain accessible.',
      },
    },
  },
  args: {
    value: {
      ...empty,
      categoryId: 'reports',
      mode: 'advanced',
      selections: { announcements: ['a2', 'jobs'], 'market-prices': ['fuel'], guidelines: true },
    },
    summary: 'Showing 9 of 55',
  },
};
const Empty: Story = {
  args: { categories: [], summary: 'No publications', showSearch: false },
};
const DisabledOptions: Story = {
  args: {
    value: { ...empty, selections: { reports: ['restricted'] } },
    categories: [
      {
        id: 'reports',
        label: 'Reports',
        children: [
          { id: 'annual', label: 'Annual Reports' },
          { id: 'restricted', label: 'Restricted reports', isDisabled: true },
        ],
      },
      { id: 'archived', label: 'Archived', isDisabled: true },
    ],
  },
};
const LongLabels: Story = {
  args: {
    categories: filterBarCategories.map((category) => ({
      ...category,
      label: category.label.repeat(8),
    })),
  },
};
const DateSelected: Story = {
  args: {
    value: empty,
    initialDateRange: { start: parseDate('2026-11-01'), end: parseDate('2026-11-01') },
  },
};

const scenarios = {
  standard: {},
  'quick-browse': QuickBrowse.args,
  empty: Empty.args,
  'disabled-options': DisabledOptions.args,
  'long-labels': LongLabels.args,
  'date-selected': DateSelected.args,
  'many-filters': {
    value: {
      ...empty,
      mode: 'advanced' as const,
      selections: Object.fromEntries(
        filterBarCategories.map((category) => [category.id, true as const]),
      ),
    },
  },
};

export const CustomComposition: Story = {
  render: () => (
    <div className="mx-auto max-w-7xl bg-bg-surface-base px-4 min-[601px]:px-6 [--filter-bar-mobile-gutter:var(--veli-spacing-4)]">
      <FilterBarCompositionExample />
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        transform: () =>
          compositionSource.replaceAll("'../src/filter-bar/", "'./components/blocks/filter-bar/"),
      },
      description: {
        story:
          'A consumer-owned date preset control shares chips, count and reset with category filters. The consumer arranges the parts and supplies the panel header, footer and width.',
      },
    },
  },
};

function FigmaReferenceExample() {
  const { language } = useVeliLanguage();
  const content = getFilterBarExampleContent(language);
  const messages = content.messages;
  const [value, setValue] = useState<FilterBarValue>({
    ...empty,
    categoryId: 'reports',
    selections: { announcements: ['a2', 'jobs'], 'market-prices': ['fuel'], guidelines: true },
    mode: 'advanced',
  });
  const [range, setRange] = useState<FilterDateRange | null>(null);
  const dateText = range
    ? range.start.compare(range.end) === 0
      ? range.start.toString()
      : `${range.start} – ${range.end}`
    : '';
  const filters = [
    {
      id: 'date',
      items: range
        ? [{ id: 'range', label: dateText, textValue: dateText, onRemove: () => setRange(null) }]
        : [],
      onClear: () => setRange(null),
    },
  ];
  return (
    <div className="mx-auto w-full max-w-[1208px] bg-bg-surface-base max-[600px]:px-4 [--filter-bar-mobile-gutter:var(--veli-spacing-4)]">
      <FilterBarRoot
        label={messages.label}
        categories={content.categories.map((category) =>
          category.id === 'announcements'
            ? {
                ...category,
                children: category.children?.filter((option) => ['a2', 'jobs'].includes(option.id)),
              }
            : category,
        )}
        value={value}
        onValueChange={setValue}
        filters={filters}
        className="space-y-6 pb-5 pt-13"
      >
        <FilterBarToolbar>
          <FilterBarCategories labels={messages} className="min-[601px]:-mx-1" />
          <FilterBarActions className="max-[600px]:w-full max-[600px]:justify-end">
            <FilterBarSearch
              label={messages.search}
              closeLabel={messages.closeSearch}
              placeholder={content.searchPlaceholder}
            />
            <FilterBarPopover>
              <FilterBarTrigger label={messages.filters} />
              <FilterBarPanel label={messages.filters} className="w-[26.875rem]">
                <div className="shrink-0 min-[601px]:px-4 min-[601px]:pb-2 min-[601px]:pt-4">
                  <FilterBarPanelHeader closeLabel={messages.closeFilters}>
                    <Heading
                      slot="title"
                      className="min-w-0 flex-1 type-body-lg-semibold text-base-strong"
                    >
                      {messages.filters}
                    </Heading>
                  </FilterBarPanelHeader>
                </div>
                <FilterBarPanelBody className="max-h-[min(60dvh,32rem)]">
                  <div className="pb-3">
                    <DatePicker
                      appearance="outline"
                      size="lg"
                      aria-label={content.date}
                      value={range?.start ?? null}
                      onChange={(date) => setRange(date ? { start: date, end: date } : null)}
                    />
                  </div>
                  {['announcements', 'reports', 'market-prices', 'resources', 'guidelines'].map(
                    (id) => (
                      <FilterBarSection
                        key={id}
                        categoryId={id}
                        selectedLabel={messages.selected}
                      />
                    ),
                  )}
                </FilterBarPanelBody>
                <FilterBarPanelFooter>
                  <FilterBarClear>{messages.clearAll}</FilterBarClear>
                  <FilterBarDone>{messages.showResults}</FilterBarDone>
                </FilterBarPanelFooter>
              </FilterBarPanel>
            </FilterBarPopover>
          </FilterBarActions>
        </FilterBarToolbar>
        <FilterBarSummary className="items-start">
          <FilterBarStatus formatCount={messages.filterCount} className="pt-0.5">
            {content.showing(55)}
          </FilterBarStatus>
          <FilterBarAppliedFilters
            label={messages.activeFilters}
            removeLabel={messages.removeFilter}
            disclosure={{ showAll: messages.showAllFilters, showLess: messages.showLessFilters }}
          >
            <FilterBarClear size="sm" showArrow>
              {messages.clearLabels}
            </FilterBarClear>
          </FilterBarAppliedFilters>
        </FilterBarSummary>
      </FilterBarRoot>
    </div>
  );
}
export const FigmaReference: Story = {
  render: () => <FigmaReferenceExample />,
  parameters: {
    controls: { disable: true },
    viewport: { defaultViewport: 'desktop' },
    docs: {
      source: {
        transform: () =>
          storySource.slice(
            storySource.indexOf('function FigmaReferenceExample()'),
            storySource.indexOf('export const FigmaReference:'),
          ),
      },
      description: {
        story:
          'Figma 7493:199351: 1208px content width, 44px controls and 24px summary chips. Uses the approved Veli-first appearance: leading checks, standard Popover surface and section select-all checkboxes differ from the older drawing. This is a layout reference, not a claim of pixel-identical Veli component internals.',
      },
    },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/UJmgh6ihn8EsMuOnwEJrOn/gov.mv?node-id=7493-199351',
    },
  },
};

function StandaloneSelectionExample({
  showSelectAll = true,
  showDisclosure = true,
  defaultExpanded = true,
  isDisabled = false,
}: Pick<ExampleProps, 'showSelectAll' | 'showDisclosure' | 'defaultExpanded' | 'isDisabled'> = {}) {
  const { language } = useVeliLanguage();
  const content = getFilterBarExampleContent(language);
  const options = [
    { id: 'news', label: content.news },
    { id: 'publications', label: content.publications },
    { id: 'archived', label: content.archived, isDisabled: true },
  ];
  const [selected, setSelected] = useState<readonly string[]>([]);
  return (
    <div className="mx-auto max-w-md space-y-4 bg-bg-surface-base p-6">
      <FilterCheckboxSection
        label={content.topics}
        showSelectAll={showSelectAll}
        showDisclosure={showDisclosure}
        defaultExpanded={defaultExpanded}
        isDisabled={isDisabled}
        options={options}
        selectedKeys={selected}
        onSelectionChange={setSelected}
        selectedLabel={content.messages.selected(selected.length)}
      />
      <output aria-label={content.selectedTopics} className="type-body-sm-regular text-base-muted">
        {selected.length
          ? options
              .filter((option) => selected.includes(option.id))
              .map((option) => option.label)
              .join(', ')
          : content.none}
      </output>
    </div>
  );
}
export const StandaloneSelection: Story = {
  name: 'Checkbox section',
  render: (args) => <StandaloneSelectionExample key={String(args.defaultExpanded)} {...args} />,
  parameters: {
    controls: { include: ['showSelectAll', 'showDisclosure', 'defaultExpanded', 'isDisabled'] },
    docs: {
      source: {
        transform: (_source: string, context: { args: ExampleProps }) =>
          sectionSource(context.args),
      },
      description: {
        story:
          'The checkbox section is controlled and reusable without FilterBarRoot or any popover. Group selection skips disabled options.',
      },
    },
  },
};
