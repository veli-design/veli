import { useEffect, useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useArgs } from 'storybook/internal/preview-api';
import { Badge } from '@tradenetcorp/veli-ui/badge';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { Tag, TagGroup, type TagGroupProps, type TagSize } from '@tradenetcorp/veli-ui/tags';
import { UserIcon } from '@phosphor-icons/react';

const englishTagsText = {
  categories: 'Categories',
  news: 'News',
  travel: 'Travel',
  gaming: 'Gaming',
  shopping: 'Shopping',
  departments: 'Departments',
  chooseDepartments: 'Choose one or more departments.',
  tourism: 'Tourism',
  fisheries: 'Fisheries',
  transport: 'Transport',
  education: 'Education',
  savedTopics: 'Saved topics',
  documents: 'Documents',
  forms: 'Forms',
  payments: 'Payments',
  allSavedTopicsRemoved: 'All saved topics have been removed.',
  relatedGuidance: 'Related guidance',
  passportServices: 'Passport services',
  licensingPortal: 'Licensing portal',
  preferredChannel: 'Preferred channel',
  oneChannelOnly: 'Only one channel can be selected at a time.',
  email: 'Email',
  sms: 'SMS',
  post: 'Post',
  restrictedServices: 'Restricted services',
  requiredDepartments: 'Required departments',
  chooseOneDepartment: 'Choose at least one department.',
  selectOneDepartment: 'Select at least one department.',
} as const;

const dhivehiTagsText = {
  categories: 'ކެޓަގަރީތައް',
  news: 'ޚަބަރު',
  travel: 'ދަތުރުފަތުރު',
  gaming: 'ގޭމިންގ',
  shopping: 'ވިޔަފާރިކުރުން',
  departments: 'ޑިޕާޓްމަންޓްތައް',
  chooseDepartments: 'އެއް ޑިޕާޓްމަންޓް ނުވަތަ އެއަށްވުރެ ގިނަ ޑިޕާޓްމަންޓް ޚިޔާރުކުރައްވާ.',
  tourism: 'ފަތުރުވެރިކަން',
  fisheries: 'މަސްވެރިކަން',
  transport: 'ޓްރާންސްޕޯޓް',
  education: 'ތަޢުލީމު',
  savedTopics: 'ސޭވްކުރެވިފައިވާ މައުޟޫޢުތައް',
  documents: 'ލިޔެކިޔުންތައް',
  forms: 'ފޯމުތައް',
  payments: 'ފައިސާދެއްކުން',
  allSavedTopicsRemoved: 'ސޭވްކުރެވިފައިވާ ހުރިހާ މައުޟޫޢުތަކެއް ވަނީ އުނިކުރެވިފަ.',
  relatedGuidance: 'ގުޅޭ އިރުޝާދު',
  passportServices: 'ޕާސްޕޯޓްގެ ޚިދުމަތްތައް',
  licensingPortal: 'ލައިސަންސް ޕޯޓަލް',
  preferredChannel: 'އިސްކަންދޭ ޗެނަލް',
  oneChannelOnly: 'އެއްފަހަރާ ޚިޔާރުކުރެވޭނީ ހަމައެކަނި އެއް ޗެނަލެވެ.',
  email: 'އީމެއިލް',
  sms: 'އެސް.އެމް.އެސް',
  post: 'ޕޯސްޓް',
  restrictedServices: 'ހިފެހެއްޓިފައިވާ ޚިދުމަތްތައް',
  requiredDepartments: 'ބޭނުންވާ ޑިޕާޓްމަންޓްތައް',
  chooseOneDepartment: 'މަދުވެގެން އެއް ޑިޕާޓްމަންޓް ޚިޔާރުކުރައްވާ.',
  selectOneDepartment: 'މަދުވެގެން އެއް ޑިޕާޓްމަންޓް ނަންގަވާ.',
} as const;

const tagsText = { en: englishTagsText, dv: dhivehiTagsText } as const;
type TagsLanguage = keyof typeof tagsText;
type TagsText = { [Key in keyof typeof englishTagsText]: string };
type TagStoryArgs = Pick<
  TagGroupProps<object>,
  'label' | 'description' | 'errorMessage' | 'size' | 'isDisabled' | 'selectionMode'
>;

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
  parameters: { layout: 'centered' },
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
    label: { control: 'text', table: { category: 'Content' } },
    description: { control: 'text', table: { category: 'Content' } },
    errorMessage: { control: 'text', table: { category: 'Content' } },
    size: { control: 'select', options: sizes, table: { category: 'Appearance' } },
    isDisabled: { control: 'boolean', table: { category: 'State' } },
    selectionMode: {
      control: 'select',
      options: ['none', 'single', 'multiple'],
      table: { category: 'Selection' },
    },
  },
  args: {
    label: englishTagsText.categories,
    description: '',
    errorMessage: '',
    size: 'sm',
    isDisabled: false,
    selectionMode: 'none',
  },
} satisfies Meta<TagStoryArgs>;

export default meta;
type Story = StoryObj<TagStoryArgs>;

export const Default: Story = {
  render: (args) => {
    const language = useTagsLanguage();
    const text = tagsText[language];
    return (
      <div className="w-[min(320px,calc(100vw-2rem))] max-w-full">
        <TagGroup
          {...args}
          label={localize(args.label, language)}
          description={localize(args.description, language)}
          errorMessage={localize(args.errorMessage, language)}
        >
          <Tag id="news">{text.news}</Tag>
          <Tag id="travel">{text.travel}</Tag>
          <Tag id="gaming">{text.gaming}</Tag>
          <Tag id="shopping">{text.shopping}</Tag>
        </TagGroup>
      </div>
    );
  },
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const text = useTagsText();
    return (
      <div className="flex w-[min(320px,calc(100vw-2rem))] max-w-full flex-col gap-6">
        {sizes.map((size) => (
          <TagGroup key={size} label={size.toUpperCase()} size={size}>
            <Tag id="tourism">{text.tourism}</Tag>
            <Tag id="fisheries" leading={<UserIcon aria-hidden weight="regular" />}>
              {text.fisheries}
            </Tag>
            <Tag id="transport">{text.transport}</Tag>
          </TagGroup>
        ))}
      </div>
    );
  },
};

export const Variations: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const text = useTagsText();
    const [removedKeys, setRemovedKeys] = useState<Set<string | number>>(() => new Set());
    const items = [
      { id: 'documents', label: text.documents },
      { id: 'forms', label: text.forms },
      { id: 'payments', label: text.payments },
    ].filter((item) => !removedKeys.has(item.id));
    return (
      <div className="flex w-[min(320px,calc(100vw-2rem))] max-w-full flex-col gap-8">
        <TagGroup
          label={text.preferredChannel}
          description={text.oneChannelOnly}
          selectionMode="single"
          defaultSelectedKeys={['email']}
        >
          <Tag id="email">{text.email}</Tag>
          <Tag id="sms">{text.sms}</Tag>
          <Tag id="post">{text.post}</Tag>
        </TagGroup>
        <TagGroup
          label={text.savedTopics}
          items={items}
          onRemove={(keys) => setRemovedKeys((current) => new Set([...current, ...keys]))}
          renderEmptyState={() => (
            <p className="type-caption-regular text-base-default">{text.allSavedTopicsRemoved}</p>
          )}
        >
          {(item) => (
            <Tag
              id={item.id}
              textValue={item.label}
              leading={<Badge counter count={4} appearance="emphasis" intent="info" size="sm" />}
            >
              {item.label}
            </Tag>
          )}
        </TagGroup>
        <TagGroup label={text.relatedGuidance}>
          <Tag id="passport" href="https://www.gov.mv" target="_blank" rel="noreferrer">
            {text.passportServices}
          </Tag>
          <Tag id="licensing" href="https://www.gov.mv" target="_blank" rel="noreferrer">
            {text.licensingPortal}
          </Tag>
        </TagGroup>
      </div>
    );
  },
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const text = useTagsText();
    const [items, setItems] = useState(['tourism', 'fisheries', 'transport', 'education']);
    const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(
      () => new Set(['fisheries', 'education']),
    );
    const labels: Record<string, string> = {
      tourism: text.tourism,
      fisheries: text.fisheries,
      transport: text.transport,
      education: text.education,
    };
    return (
      <div className="flex w-[min(320px,calc(100vw-2rem))] max-w-full flex-col gap-8">
        <TagGroup
          label={text.departments}
          description={text.chooseDepartments}
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={(keys) => setSelectedKeys(new Set(keys === 'all' ? items : keys))}
          disabledKeys={['fisheries']}
          onRemove={(keys) => setItems((current) => current.filter((id) => !keys.has(id)))}
        >
          {items.map((id) => (
            <Tag key={id} id={id} isDisabled={id === 'education'}>
              {labels[id]}
            </Tag>
          ))}
        </TagGroup>
        <TagGroup
          label={text.restrictedServices}
          isDisabled
          selectionMode="multiple"
          defaultSelectedKeys={['documents']}
          onRemove={() => {}}
        >
          <Tag id="documents">{text.documents}</Tag>
          <Tag id="payments" href="https://www.gov.mv">
            {text.payments}
          </Tag>
        </TagGroup>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getAllByRole('grid')[0];
    const rows = within(grid).getAllByRole('row');
    const removeButton = within(rows[0]).getByRole('button');
    await expect(removeButton).toHaveAccessibleName(removeButton.getAttribute('aria-label')!);
    await userEvent.click(rows[0]);
    await expect(rows[0]).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(removeButton);
    await expect(within(grid).getAllByRole('row')).toHaveLength(3);
    await expect(within(rows[1]).getByRole('button')).toBeDisabled();
    await expect(rows[1]).toHaveAttribute('data-selected', 'true');
    await userEvent.click(rows[2]);
    await userEvent.keyboard('{Delete}');
    const remainingRows = within(grid).getAllByRole('row');
    await expect(remainingRows).toHaveLength(2);
    for (const row of remainingRows) {
      await expect(row).toHaveAttribute('aria-disabled', 'true');
      await expect(within(row).getByRole('button')).toBeDisabled();
    }
    for (const row of within(canvas.getAllByRole('grid')[1]).getAllByRole('row')) {
      await expect(row).toHaveAttribute('aria-disabled', 'true');
      await expect(within(row).getByRole('button')).toBeDisabled();
    }
  },
};

export const Validation: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const text = useTagsText();
    const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(() => new Set());
    return (
      <div className="w-[min(320px,calc(100vw-2rem))] max-w-full">
        <TagGroup
          label={text.requiredDepartments}
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={(keys) =>
            setSelectedKeys(new Set(keys === 'all' ? ['tourism', 'fisheries'] : keys))
          }
          description={text.chooseOneDepartment}
          errorMessage={selectedKeys.size === 0 ? text.selectOneDepartment : undefined}
        >
          <Tag id="tourism">{text.tourism}</Tag>
          <Tag id="fisheries">{text.fisheries}</Tag>
        </TagGroup>
      </div>
    );
  },
};
