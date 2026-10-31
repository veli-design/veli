import { useEffect, useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { Button } from '@veli-design/react/button';
import { useVeliLanguage } from '@veli-design/react/provider';
import {
  Tag,
  TagButton,
  TagDropdown,
  TagGroup,
  type TagGroupProps,
  type TagSize,
} from '@veli-design/react/tags';
import { MenuItem } from '@veli-design/react/menu';
import type { Selection } from 'react-aria-components';
import { UserIcon } from '@phosphor-icons/react';

const englishTagsText = {
  departments: 'Departments',
  chooseDepartments: 'Choose one or more departments.',
  tourism: 'Tourism',
  fisheries: 'Fisheries',
  transport: 'Transport',
  education: 'Education',
  documents: 'Documents',
  forms: 'Forms',
  relatedGuidance: 'Related guidance',
  resorts: 'Resorts',
  guesthouses: 'Guesthouses',
  diveCentres: 'Dive centres',
  reset: 'Reset',
} as const;

const dhivehiTagsText = {
  departments: 'ޑިޕާޓްމަންޓްތައް',
  chooseDepartments: 'އެއް ޑިޕާޓްމަންޓް ނުވަތަ އެއަށްވުރެ ގިނަ ޑިޕާޓްމަންޓް ޚިޔާރުކުރައްވާ.',
  tourism: 'ފަތުރުވެރިކަން',
  fisheries: 'މަސްވެރިކަން',
  transport: 'ޓްރާންސްޕޯޓް',
  education: 'ތަޢުލީމު',
  documents: 'ލިޔެކިޔުންތައް',
  forms: 'ފޯމުތައް',
  relatedGuidance: 'ގުޅޭ އިރުޝާދު',
  resorts: 'ރިސޯޓްތައް',
  guesthouses: 'ގެސްޓްހައުސްތައް',
  diveCentres: 'ޑައިވް ސެންޓަރުތައް',
  reset: 'އަލުން ފަށާ',
} as const;

const tagsText = { en: englishTagsText, dv: dhivehiTagsText } as const;
type TagsLanguage = keyof typeof tagsText;
type TagsText = { [Key in keyof typeof englishTagsText]: string };
type TagStoryArgs = Pick<
  TagGroupProps<object>,
  | 'label'
  | 'description'
  | 'errorMessage'
  | 'appearance'
  | 'size'
  | 'isDisabled'
  | 'selectionMode'
  | 'selectionBehavior'
  | 'disallowEmptySelection'
  | 'defaultSelectedKeys'
  | 'disabledKeys'
> & { showLeading: boolean };

const sizes: TagSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const textPairs = Object.keys(englishTagsText).map((key) => {
  const textKey = key as keyof typeof englishTagsText;
  return [englishTagsText[textKey], dhivehiTagsText[textKey]] as const;
});

function useTagsLanguage(): TagsLanguage {
  return useVeliLanguage().direction === 'rtl' ? 'dv' : 'en';
}

function useTagsText(): TagsText {
  return tagsText[useTagsLanguage()];
}

function localize(value: ReactNode, language: TagsLanguage): ReactNode {
  if (typeof value !== 'string') return value;
  const pair = textPairs.find(([en, dv]) => value === en || value === dv);
  return pair ? pair[language === 'dv' ? 1 : 0] : value;
}

const meta = {
  title: 'Components/Tags',
  component: TagGroup,
  subcomponents: { Tag, TagButton, TagDropdown },
  parameters: { layout: 'centered', controls: { sort: 'none' } },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const language: TagsLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs<TagStoryArgs>();
      const { label, description, errorMessage } = args;
      useEffect(() => {
        const nextArgs: Partial<TagStoryArgs> = {};
        for (const [key, value] of Object.entries({ label, description, errorMessage })) {
          const localized = localize(value, language);
          if (value !== localized)
            nextArgs[key as 'label' | 'description' | 'errorMessage'] = localized;
        }
        if (Object.keys(nextArgs).length > 0) updateArgs(nextArgs);
      }, [label, description, errorMessage, language, updateArgs]);
      return <Story />;
    },
  ],
  argTypes: {
    appearance: {
      control: 'select',
      options: ['fill', 'outline'],
      table: { category: 'Appearance' },
    },
    size: { control: 'select', options: sizes, table: { category: 'Appearance' } },
    showLeading: { control: 'boolean', table: { category: 'Content' } },
    label: { control: 'text', table: { category: 'Content' } },
    description: { control: 'text', table: { category: 'Content' } },
    errorMessage: { control: 'text', table: { category: 'State' } },
    isDisabled: { control: 'boolean', table: { category: 'State' } },
    selectionBehavior: {
      control: 'select',
      options: ['toggle', 'replace'],
      table: { category: 'Selection' },
    },
    disallowEmptySelection: { control: 'boolean', table: { category: 'Selection' } },
    defaultSelectedKeys: { control: 'object', table: { category: 'Selection' } },
    disabledKeys: { control: 'object', table: { category: 'State' } },
    selectionMode: {
      control: 'select',
      options: ['none', 'single', 'multiple'],
      table: { category: 'Selection' },
    },
  },
  args: {
    label: englishTagsText.departments,
    description: englishTagsText.chooseDepartments,
    errorMessage: '',
    size: 'sm',
    appearance: 'fill',
    selectionBehavior: 'toggle',
    disallowEmptySelection: false,
    isDisabled: false,
    selectionMode: 'multiple',
    defaultSelectedKeys: ['tourism'],
    showLeading: false,
  },
} satisfies Meta<TagStoryArgs>;

export default meta;
type Story = StoryObj<TagStoryArgs>;

export const Default: Story = {
  render: ({ showLeading, ...args }) => {
    const language = useTagsLanguage();
    const text = tagsText[language];
    return (
      <div
        key={JSON.stringify(args.defaultSelectedKeys)}
        className="w-[min(320px,calc(100vw-2rem))] max-w-full"
      >
        <TagGroup
          {...args}
          label={localize(args.label, language)}
          description={localize(args.description, language)}
          errorMessage={localize(args.errorMessage, language)}
        >
          <Tag id="tourism" leading={showLeading ? <UserIcon weight="regular" /> : undefined}>
            {text.tourism}
          </Tag>
          <Tag id="fisheries">{text.fisheries}</Tag>
          <Tag id="transport">{text.transport}</Tag>
          <Tag id="education">{text.education}</Tag>
        </TagGroup>
      </div>
    );
  },
};

export const Sizes: Story = {
  parameters: { controls: { include: ['appearance', 'isDisabled', 'showLeading'] } },
  render: ({ appearance, isDisabled, showLeading }) => {
    const text = useTagsText();
    return (
      <div className="flex w-[min(320px,calc(100vw-2rem))] max-w-full flex-col gap-6">
        {sizes.map((size) => (
          <TagGroup
            key={size}
            label={size.toUpperCase()}
            size={size}
            appearance={appearance}
            isDisabled={isDisabled}
            selectionMode="multiple"
            defaultSelectedKeys={['tourism']}
          >
            <Tag id="tourism">{text.tourism}</Tag>
            <Tag id="fisheries" leading={showLeading ? <UserIcon weight="regular" /> : undefined}>
              {text.fisheries}
            </Tag>
          </TagGroup>
        ))}
      </div>
    );
  },
};

export const Variations: Story = {
  parameters: { controls: { include: ['size'] } },
  render: ({ size }) => {
    const text = useTagsText();
    const [removedKeys, setRemovedKeys] = useState<Set<string | number>>(() => new Set());
    const items = [
      { id: 'tourism', label: text.tourism },
      { id: 'fisheries', label: text.fisheries },
      { id: 'transport', label: text.transport },
      { id: 'education', label: text.education },
    ].filter((item) => !removedKeys.has(item.id));
    return (
      <div className="flex w-[min(420px,calc(100vw-2rem))] max-w-full flex-col items-start gap-6">
        {(['fill', 'outline'] as const).map((appearance) => (
          <TagGroup
            key={appearance}
            label={appearance === 'fill' ? 'Fill' : 'Outline'}
            appearance={appearance}
            size={size}
            items={items}
            selectionMode="multiple"
            defaultSelectedKeys={['tourism', 'education']}
            disabledKeys={['transport', 'education']}
            onRemove={(keys) => setRemovedKeys((current) => new Set([...current, ...keys]))}
          >
            {(item) => (
              <Tag
                id={item.id}
                leading={item.id === 'fisheries' ? <UserIcon weight="regular" /> : undefined}
              >
                {item.label}
              </Tag>
            )}
          </TagGroup>
        ))}
        <Button
          intent="secondary"
          appearance="ghost"
          size="sm"
          onPress={() => setRemovedKeys(new Set())}
        >
          {text.reset}
        </Button>
      </div>
    );
  },
};

export const Standalone: Story = {
  parameters: { controls: { include: ['appearance', 'size', 'isDisabled', 'showLeading'] } },
  render: ({ appearance, size, isDisabled, showLeading }) => {
    const text = useTagsText();
    const [selected, setSelected] = useState(false);
    return (
      <div className="flex flex-wrap items-center gap-3">
        <TagButton
          appearance={appearance}
          size={size}
          isDisabled={isDisabled}
          isSelected={selected}
          leading={showLeading ? <UserIcon weight="regular" /> : undefined}
          onPress={() => setSelected((value) => !value)}
        >
          {text.documents}
        </TagButton>
        <TagButton
          as="a"
          appearance={appearance}
          size={size}
          isDisabled={isDisabled}
          href="https://www.gov.mv"
          target="_blank"
          rel="noreferrer"
        >
          {text.relatedGuidance}
        </TagButton>
      </div>
    );
  },
};

export const Dropdown: Story = {
  parameters: { controls: { include: ['appearance', 'size', 'isDisabled', 'showLeading'] } },
  render: ({ appearance, size, isDisabled, showLeading }) => {
    const text = useTagsText();
    const [selected, setSelected] = useState(true);
    const [selectedKeys, setSelectedKeys] = useState<Selection>(
      new Set(['resorts', 'guesthouses']),
    );
    const items = [
      { id: 'resorts', label: text.resorts },
      { id: 'guesthouses', label: text.guesthouses },
      { id: 'dive-centres', label: text.diveCentres },
    ];
    return (
      <TagDropdown
        isSelected={selected}
        onSelect={() => setSelected(true)}
        label={text.tourism}
        appearance={appearance}
        size={size}
        isDisabled={isDisabled}
        leading={showLeading ? <UserIcon weight="regular" /> : undefined}
        items={items}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        onDeselect={() => setSelected(false)}
        renderSelection={(selection) => {
          const values = items.filter((item) => selection === 'all' || selection.has(item.id));
          return values.length === 1 ? values[0].label : values.length > 1 ? values.length : null;
        }}
      >
        {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
      </TagDropdown>
    );
  },
};

// Consumer-owned category and sub-label selection in a connected filter example.
export const MediaFilters: Story = {
  args: { size: 'xl' },
  parameters: { layout: 'padded', controls: { include: ['size', 'appearance', 'isDisabled'] } },
  render: ({ size, appearance, isDisabled }) => {
    const language = useTagsLanguage();
    const dv = language === 'dv';
    const [active, setActive] = useState('all');
    const [selection, setSelection] = useState<Selection>(new Set());
    const [open, setOpen] = useState<string | null>(null);
    const categories = [
      { id: 'all', label: dv ? 'ހުރިހާ' : 'All', children: [] },
      {
        id: 'announcement',
        label: dv ? 'އިޢުލާން' : 'Announcement',
        children: dv
          ? [
              'އޭޓޫ ޝީޓްތައް',
              'ވަޒީފާގެ އިޢުލާންތައް',
              'ބީލަންތައް',
              'ތަމްރީނު ޕްރޮގްރާމްތައް',
              'ސްކޮލަރޝިޕްތައް',
            ]
          : ['A2 Sheets', 'Job Announcements', 'Tenders', 'Training Programmes', 'Scholarships'],
      },
      {
        id: 'reports',
        label: dv ? 'ރިޕޯޓްތައް' : 'Reports',
        children: dv
          ? ['އަހަރީ ރިޕޯޓްތައް', 'މާލީ ރިޕޯޓްތައް', 'ޢާންމު ޖަލްސާތައް']
          : ['Annual Reports', 'Financial Reports', 'AGM & EGM'],
      },
      {
        id: 'market-prices',
        label: dv ? 'ބާޒާރުގެ އަގުތައް' : 'Market Prices',
        children: dv
          ? ['މަސް އަދި ތަރުކާރީ', 'ތެޔޮ', 'އިމާރާތުގެ މަސްތައް', 'މާލީ މަޢުލޫމާތު']
          : ['Fish & Produce', 'Fuel', 'Construction Materials', 'Financials'],
      },
      { id: 'resources', label: dv ? 'ވަޞީލަތްތައް' : 'Resources', children: [] },
      { id: 'guidelines', label: dv ? 'އިރުޝާދުތައް' : 'Guidelines', children: [] },
      {
        id: 'tourism-bulletin',
        label: dv ? 'ފަތުރުވެރިކަމުގެ ބުލެޓިން' : 'Tourism Bulletin',
        children: [],
      },
    ];
    const choose = (id: string) => {
      if (id !== active) setSelection(new Set());
      setActive(id);
      setOpen(null);
    };
    const selectedCategory = categories.find((category) => category.id === active)!;
    const selectedItems = selectedCategory.children
      .map((label, index) => ({ id: index, label }))
      .filter((item) => selection === 'all' || selection.has(item.id));
    return (
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6">
        <div
          role="group"
          aria-label={dv ? 'ޝާއިޢުކުރެވުނު ތަކެތީގެ ބައިތައް' : 'Browse publications by category'}
          className="flex min-w-0 flex-wrap items-center gap-2 p-1"
        >
          {categories.map((category) =>
            category.children.length ? (
              <TagDropdown
                key={category.id}
                label={category.label}
                size={size}
                appearance={appearance}
                isDisabled={isDisabled}
                isSelected={active === category.id}
                onSelect={() => choose(category.id)}
                onDeselect={() => choose('all')}
                selectedKeys={active === category.id ? selection : new Set()}
                onSelectionChange={setSelection}
                isOpen={open === category.id}
                onOpenChange={(next) => setOpen(next ? category.id : null)}
                renderSelection={(keys) => {
                  const values = category.children.filter(
                    (_, index) => keys === 'all' || keys.has(index),
                  );
                  return values.length === 1 ? values[0] : values.length > 1 ? values.length : null;
                }}
              >
                {category.children.map((label, index) => (
                  <MenuItem key={index} id={index}>
                    {label}
                  </MenuItem>
                ))}
              </TagDropdown>
            ) : (
              <TagButton
                key={category.id}
                size={size}
                appearance={appearance}
                isDisabled={isDisabled}
                isSelected={active === category.id}
                onPress={() => choose(category.id)}
              >
                {category.label}
              </TagButton>
            ),
          )}
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <p className="type-body-sm-regular text-base-muted" aria-live="polite">
            {selectedCategory.label}
            {selectedItems.length ? ` · ${selectedItems.length}` : ''}
          </p>
          <div
            className="min-w-0 max-w-full"
            inert={!selectedItems.length}
            aria-hidden={!selectedItems.length || undefined}
          >
            <TagGroup
              renderEmptyState={() => null}
              aria-label={dv ? 'ޚިޔާރުކުރެވުނު ލޭބަލްތައް' : 'Active sub-labels'}
              items={selectedItems}
              isDisabled={isDisabled}
              appearance="outline"
              onRemove={(keys) =>
                setSelection(
                  new Set(
                    selectedItems.filter((item) => !keys.has(item.id)).map((item) => item.id),
                  ),
                )
              }
            >
              {(item) => <Tag id={item.id}>{item.label}</Tag>}
            </TagGroup>
          </div>
          {selectedItems.length ? (
            <Button
              size="sm"
              intent="secondary"
              appearance="ghost"
              isDisabled={isDisabled}
              onPress={() => setSelection(new Set())}
            >
              {dv ? 'ހުރިހާ އުނިކުރޭ' : 'Clear all'}
            </Button>
          ) : null}
        </div>
      </div>
    );
  },
};
