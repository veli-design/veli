import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { Badge, type BadgeIntent } from '@tradenetcorp/veli-ui/badge';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { Tag, TagGroup, type TagSize } from '@tradenetcorp/veli-ui/tags';
import { UserIcon } from '@phosphor-icons/react';
import { expect, userEvent, within } from '@storybook/test';

type TagItem = {
  id: string;
  label: string;
  href?: string;
  isDisabled?: boolean;
};

const storyPanelClassName =
  'w-full max-w-md rounded-2xl border border-base-subtle bg-bg-surface-raised p-4';

const storySectionClassName = 'space-y-3';
const sizesAndLeadingPanelClassName = `${storyPanelClassName} space-y-6`;
const sizesAndLeadingSectionClassName = 'space-y-4';
const sizesAndLeadingSectionHeaderClassName = 'space-y-1';

const tagEmptyStateClassName =
  'rounded-xl border border-dashed border-base-subtle px-3 py-2.5 type-body-sm-regular text-base-subtle';

const tagSizes: TagSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const selectionModes = ['none', 'single', 'multiple'] as const;
const leadingTypes = ['none', 'userIcon', 'countBadge', 'statusBadge', 'userAndCount'] as const;
const badgeIntents: BadgeIntent[] = [
  'neutral',
  'info',
  'positive',
  'cautious',
  'warning',
  'danger',
];

const englishTagsText = {
  noTagsAvailable: 'No tags available.',
  allTagsRemoved: 'All tags have been removed.',
  allSavedTopicsRemoved: 'All saved topics have been removed.',
  selectableTags: 'Selectable tags',
  removableTags: 'Removable tags',
  linkTags: 'Link tags',
  disabledKeys: 'Disabled keys',
  disabledGroup: 'Disabled group',
  categories: 'Categories',
  news: 'News',
  travel: 'Travel',
  gaming: 'Gaming',
  shopping: 'Shopping',
  savedTopics: 'Saved topics',
  topic: 'Topic',
  relatedGuidance: 'Related guidance',
  departments: 'Departments',
  requiredDepartments: 'Required departments',
  chooseDepartments: 'Choose one or more departments.',
  chooseOneDepartment: 'Choose at least one department.',
  selectOneDepartment: 'Select at least one department.',
  tourism: 'Tourism',
  fisheries: 'Fisheries',
  transport: 'Transport',
  education: 'Education',
  passportServices: 'Passport services',
  licensingPortal: 'Licensing portal',
  onlinePayments: 'Online payments',
  amenities: 'Amenities',
  laundry: 'Laundry',
  parking: 'Parking',
  breakfast: 'Breakfast',
  wifi: 'Wi-Fi',
  restrictedServices: 'Restricted services',
  documents: 'Documents',
  appointments: 'Appointments',
  payments: 'Payments',
  support: 'Support',
  preferredChannel: 'Preferred channel',
  oneChannelOnly: 'Only one channel can be selected at a time.',
  email: 'Email',
  sms: 'SMS',
  post: 'Post',
  sizes: 'Sizes',
  fixedHeights: 'Fixed heights from xs (28px) to xl (44px).',
  extraSmall: 'Extra small',
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  extraLarge: 'Extra large',
  groupSize: 'Group size',
  groupSizeDescription: 'Set size once on TagGroup to apply to every tag.',
  departmentFilters: 'Department filters',
  leadingIcon: 'Leading icon',
  leadingIconDescription: 'Use the leading slot for icons such as a user avatar glyph.',
  assignedPeople: 'Assigned people',
  aishaHassan: 'Aisha Hassan',
  ibrahimWaheed: 'Ibrahim Waheed',
  mariyamAli: 'Mariyam Ali',
  leadingCountBadge: 'Leading count badge',
  counterBadgeDescription: 'Counter badges work well for unread or pending counts.',
  inboxes: 'Inboxes',
  inbox: 'Inbox',
  requests: 'Requests',
  alerts: 'Alerts',
  leadingStatusBadges: 'Leading status badges',
  statusBadgesDescription: 'Compose tags with the Badge component for labels and status.',
  serviceStatus: 'Service status',
  live: 'Live',
  beta: 'Beta',
  new: 'New',
  iconAndCountTogether: 'Icon and count together',
  teamChannels: 'Team channels',
  supportTeam: 'Support team',
  reviewQueue: 'Review queue',
  leadingAtEachSize: 'Leading at each size',
  iconsScaleDescription: 'Icons and badges scale with the tag size.',
  selectableFiltersWithLeadingContent: 'Selectable filters with leading content',
  leadingSlotsDescription: 'Leading slots work with selection, removable tags, and links.',
  assigned: 'Assigned',
  pending: 'Pending',
  draft: 'Draft',
  forms: 'Forms',
  relatedContacts: 'Related contacts',
  liaisonOfficer: 'Liaison officer',
  supervisor: 'Supervisor',
} as const;

const dhivehiTagsText = {
  noTagsAvailable: 'އެއްވެސް ޓެގެއް ލިބޭކަށް ނެތް.',
  allTagsRemoved: 'ހުރިހާ ޓެގެއް ވަނީ އުނިކުރެވިފަ.',
  allSavedTopicsRemoved: 'ސޭވްކުރެވިފައިވާ ހުރިހާ މައުޟޫޢުތަކެއް ވަނީ އުނިކުރެވިފަ.',
  selectableTags: 'ޚިޔާރުކުރެވޭ ޓެގްތައް',
  removableTags: 'އުނިކުރެވޭ ޓެގްތައް',
  linkTags: 'ލިންކް ޓެގްތައް',
  disabledKeys: 'ޑިސޭބަލް ކުރެވިފައިވާ ކީތައް',
  disabledGroup: 'ޑިސޭބަލް ކުރެވިފައިވާ ގްރޫޕް',
  categories: 'ކެޓަގަރީތައް',
  news: 'ޚަބަރު',
  travel: 'ދަތުރުފަތުރު',
  gaming: 'ގޭމިންގ',
  shopping: 'ވިޔަފާރިކުރުން',
  savedTopics: 'ސޭވްކުރެވިފައިވާ މައުޟޫޢުތައް',
  topic: 'މައުޟޫޢު',
  relatedGuidance: 'ގުޅޭ އިރުޝާދު',
  departments: 'ޑިޕާޓްމަންޓްތައް',
  requiredDepartments: 'ބޭނުންވާ ޑިޕާޓްމަންޓްތައް',
  chooseDepartments: 'އެއް ޑިޕާޓްމަންޓް ނުވަތަ އެއަށްވުރެ ގިނަ ޑިޕާޓްމަންޓް ޚިޔާރުކުރައްވާ.',
  chooseOneDepartment: 'މަދުވެގެން އެއް ޑިޕާޓްމަންޓް ޚިޔާރުކުރައްވާ.',
  selectOneDepartment: 'މަދުވެގެން އެއް ޑިޕާޓްމަންޓް ނަންގަވާ.',
  tourism: 'ފަތުރުވެރިކަން',
  fisheries: 'މަސްވެރިކަން',
  transport: 'ޓްރާންސްޕޯޓް',
  education: 'ތަޢުލީމު',
  passportServices: 'ޕާސްޕޯޓްގެ ޚިދުމަތްތައް',
  licensingPortal: 'ލައިސަންސް ޕޯޓަލް',
  onlinePayments: 'އޮންލައިން ފައިސާދެއްކުން',
  amenities: 'ވަސީލަތްތައް',
  laundry: 'ލޯންޑްރީ',
  parking: 'ޕާކިންގ',
  breakfast: 'ހެނދުނުގެ ސައި',
  wifi: 'ވައި-ފައި',
  restrictedServices: 'ހިފެހެއްޓިފައިވާ ޚިދުމަތްތައް',
  documents: 'ލިޔެކިޔުންތައް',
  appointments: 'އެޕޮއިންޓްމަންޓްތައް',
  payments: 'ފައިސާދެއްކުން',
  support: 'ސަޕޯޓް',
  preferredChannel: 'އިސްކަންދޭ ޗެނަލް',
  oneChannelOnly: 'އެއްފަހަރާ ޚިޔާރުކުރެވޭނީ ހަމައެކަނި އެއް ޗެނަލެވެ.',
  email: 'އީމެއިލް',
  sms: 'އެސް.އެމް.އެސް',
  post: 'ޕޯސްޓް',
  sizes: 'ސައިޒުތައް',
  fixedHeights: 'xs (28px) އިން ފެށިގެން xl (44px) އަށް ކަނޑައެޅިފައިވާ އުސްމިންތައް.',
  extraSmall: 'ވަރަށް ކުޑަ',
  small: 'ކުޑަ',
  medium: 'މެދު',
  large: 'ބޮޑު',
  extraLarge: 'ވަރަށް ބޮޑު',
  groupSize: 'ގްރޫޕް ސައިޒު',
  groupSizeDescription:
    'ހުރިހާ ޓެގަކަށް ބޭނުންކުރުމަށް ޓެގްގްރޫޕްގައި އެއްފަހަރު ސައިޒު ކަނޑައަޅާ.',
  departmentFilters: 'ޑިޕާޓްމަންޓް ފިލްޓަރުތައް',
  leadingIcon: 'ކުރީގައި އިންނަ އައިކަން',
  leadingIconDescription: 'ޔޫޒަރ އެވަޓަރ ގްލިފް ފަދަ އައިކަންތަކަށް ލީޑިންގ ސްލޮޓް ބޭނުންކުރައްވާ.',
  assignedPeople: 'ހަވާލުކުރެވިފައިވާ މީހުން',
  aishaHassan: 'އާއިޝަތު ޙަސަން',
  ibrahimWaheed: 'އިބްރާހީމް ވަޙީދު',
  mariyamAli: 'މަރްޔަމް ޢަލީ',
  leadingCountBadge: 'ލީޑިންގ ކައުންޓް ބެޖް',
  counterBadgeDescription:
    'ނުކިޔާ ނުވަތަ ނުނިމިހުރި އަދަދުތައް ދެއްކުމަށް ކައުންޓަރ ބެޖްތައް ރަނގަޅުވާނެއެވެ.',
  inboxes: 'އިންބޮކްސްތައް',
  inbox: 'އިންބޮކްސް',
  requests: 'ރިކުއެސްޓްތައް',
  alerts: 'އެލަރޓްތައް',
  leadingStatusBadges: 'ލީޑިންގ ސްޓޭޓަސް ބެޖްތައް',
  statusBadgesDescription:
    'ލޭބަލްތަކާއި ސްޓޭޓަސްތަކަށް ބެޖް ކޮމްޕޯނަންޓާއެކު ޓެގްތައް ތައްޔާރުކުރައްވާ.',
  serviceStatus: 'ޚިދުމަތުގެ ޙާލަތު',
  live: 'ލައިވް',
  beta: 'ބީޓާ',
  new: 'އާ',
  iconAndCountTogether: 'އައިކަން އާއި އަދަދު އެކީގައި',
  teamChannels: 'ޓީމް ޗެނަލްތައް',
  supportTeam: 'ސަޕޯޓް ޓީމް',
  reviewQueue: 'ރިވިއު ކިއު',
  leadingAtEachSize: 'ކޮންމެ ސައިޒެއްގައި ލީޑިންގ',
  iconsScaleDescription: 'ޓެގްގެ ސައިޒާއެކު އައިކަންތަކާއި ބެޖްތައް ބަދަލުވާނެއެވެ.',
  selectableFiltersWithLeadingContent: 'ލީޑިންގ ކޮންޓެންޓާއެކު ޚިޔާރުކުރެވޭ ފިލްޓަރުތައް',
  leadingSlotsDescription:
    'ލީޑިންގ ސްލޮޓްތައް ސިލެކްޝަން، އުނިކުރެވޭ ޓެގް އަދި ލިންކްތަކާއެކު މަސައްކަތްކުރާނެއެވެ.',
  assigned: 'ހަވާލުކުރެވިފައި',
  pending: 'ޕެންޑިންގ',
  draft: 'ޑްރާފްޓް',
  forms: 'ފޯމުތައް',
  relatedContacts: 'ގުޅޭ ކޮންޓެކްޓްތައް',
  liaisonOfficer: 'ލިއޭޒަން އޮފިސަރ',
  supervisor: 'ސުޕަވައިޒަރ',
} as const;

const localizedTagsText = {
  en: englishTagsText,
  dv: dhivehiTagsText,
} as const;

type TagSelectionMode = (typeof selectionModes)[number];
type TagLeadingType = (typeof leadingTypes)[number];
type TagsLanguage = keyof typeof localizedTagsText;
type TagsText = { [Key in keyof typeof englishTagsText]: string };

type TagPlaygroundItem = {
  id: string;
  label: string;
};

type TagPlaygroundArgs = {
  label: string;
  description: string;
  errorMessage: string;
  selectionMode: TagSelectionMode;
  isDisabled: boolean;
  size: TagSize;
  tagLabel: string;
  secondTagLabel: string;
  thirdTagLabel: string;
  isLink: boolean;
  isRemovable: boolean;
  leadingType: TagLeadingType;
  badgeLabel: string;
  badgeIntent: BadgeIntent;
  count: number;
  countMax: number;
};

const tagArgText = {
  label: {
    en: englishTagsText.departments,
    dv: dhivehiTagsText.departments,
  },
  description: {
    en: englishTagsText.chooseDepartments,
    dv: dhivehiTagsText.chooseDepartments,
  },
  errorMessage: {
    en: englishTagsText.selectOneDepartment,
    dv: dhivehiTagsText.selectOneDepartment,
  },
  tagLabel: {
    en: englishTagsText.tourism,
    dv: dhivehiTagsText.tourism,
  },
  secondTagLabel: {
    en: englishTagsText.fisheries,
    dv: dhivehiTagsText.fisheries,
  },
  thirdTagLabel: {
    en: englishTagsText.transport,
    dv: dhivehiTagsText.transport,
  },
  badgeLabel: {
    en: englishTagsText.new,
    dv: dhivehiTagsText.new,
  },
} as const;

type TagArgTextKey = keyof typeof tagArgText;

const tagArgTextKeys = Object.keys(tagArgText) as TagArgTextKey[];

const useTagsLanguage = (): TagsLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useTagsText = () => {
  const language = useTagsLanguage();

  return localizedTagsText[language];
};

const getLocalizedTagArgText = (key: TagArgTextKey, value: unknown, language: TagsLanguage) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return value;
  }

  const localizedValues: readonly string[] = Object.values(tagArgText[key]);

  if (localizedValues.includes(value)) {
    return tagArgText[key][language];
  }

  return value;
};

function getRemovableSeed(text: TagsText): TagItem[] {
  return [
    { id: 'documents', label: text.documents },
    { id: 'forms', label: text.forms },
    { id: 'payments', label: text.payments },
    { id: 'support', label: text.support },
  ];
}

const tagIconSizes: Record<TagSize, number> = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 16,
};

const tagBadgeSizes: Record<TagSize, 'sm' | 'md'> = {
  xs: 'sm',
  sm: 'sm',
  md: 'sm',
  lg: 'md',
  xl: 'md',
};

function TagUserIcon({ size = 'sm' }: { size?: TagSize }) {
  return <UserIcon aria-hidden size={tagIconSizes[size]} weight="regular" />;
}

function TagCountBadge({
  count,
  max,
  size = 'sm',
}: {
  count: number;
  max?: number;
  size?: TagSize;
}) {
  return (
    <Badge
      counter
      count={count}
      max={max}
      appearance="emphasis"
      intent="info"
      size={tagBadgeSizes[size]}
    />
  );
}

function renderTagLeading({
  leadingType,
  size,
  badgeLabel,
  badgeIntent,
  count,
  countMax,
}: Pick<
  TagPlaygroundArgs,
  'leadingType' | 'size' | 'badgeLabel' | 'badgeIntent' | 'count' | 'countMax'
>) {
  switch (leadingType) {
    case 'userIcon':
      return <TagUserIcon size={size} />;
    case 'countBadge':
      return <TagCountBadge count={count} max={countMax} size={size} />;
    case 'statusBadge':
      return (
        <Badge appearance="emphasis" intent={badgeIntent} size={tagBadgeSizes[size]}>
          {badgeLabel}
        </Badge>
      );
    case 'userAndCount':
      return (
        <span className="inline-flex items-center gap-1">
          <TagUserIcon size={size} />
          <TagCountBadge count={count} max={countMax} size={size} />
        </span>
      );
    default:
      return undefined;
  }
}

function TagsPlayground({
  label,
  description,
  errorMessage,
  selectionMode,
  isDisabled,
  size,
  tagLabel,
  secondTagLabel,
  thirdTagLabel,
  isLink,
  isRemovable,
  leadingType,
  badgeLabel,
  badgeIntent,
  count,
  countMax,
}: TagPlaygroundArgs) {
  const language = useTagsLanguage();
  const text = useTagsText();
  const localizedLabel = getLocalizedTagArgText('label', label, language) as string;
  const localizedDescription = getLocalizedTagArgText(
    'description',
    description,
    language,
  ) as string;
  const localizedErrorMessage = getLocalizedTagArgText(
    'errorMessage',
    errorMessage,
    language,
  ) as string;
  const localizedTagLabel = getLocalizedTagArgText('tagLabel', tagLabel, language) as string;
  const localizedSecondTagLabel = getLocalizedTagArgText(
    'secondTagLabel',
    secondTagLabel,
    language,
  ) as string;
  const localizedThirdTagLabel = getLocalizedTagArgText(
    'thirdTagLabel',
    thirdTagLabel,
    language,
  ) as string;
  const localizedBadgeLabel = getLocalizedTagArgText('badgeLabel', badgeLabel, language) as string;
  const staticTags = useMemo<TagPlaygroundItem[]>(
    () => [
      { id: 'tag-1', label: localizedTagLabel },
      { id: 'tag-2', label: localizedSecondTagLabel },
      { id: 'tag-3', label: localizedThirdTagLabel },
    ],
    [localizedSecondTagLabel, localizedTagLabel, localizedThirdTagLabel],
  );
  const [removedPlaygroundTagKeys, setRemovedPlaygroundTagKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const removableItems = useMemo(
    () => staticTags.filter((item) => !removedPlaygroundTagKeys.has(item.id)),
    [removedPlaygroundTagKeys, staticTags],
  );
  const leading = renderTagLeading({
    leadingType,
    size,
    badgeLabel: localizedBadgeLabel,
    badgeIntent,
    count,
    countMax,
  });

  const resolvedDescription = localizedErrorMessage ? undefined : localizedDescription || undefined;
  const resolvedErrorMessage = localizedErrorMessage || undefined;
  const resolvedSelectionMode = selectionMode === 'none' ? undefined : selectionMode;
  const defaultSelectedKeys =
    selectionMode === 'single'
      ? ['tag-1']
      : selectionMode === 'multiple'
        ? ['tag-1', 'tag-2']
        : undefined;

  if (isRemovable) {
    return (
      <div className={storyPanelClassName}>
        <TagGroup<TagPlaygroundItem>
          label={localizedLabel}
          description={resolvedDescription}
          errorMessage={resolvedErrorMessage}
          selectionMode={resolvedSelectionMode}
          defaultSelectedKeys={defaultSelectedKeys}
          isDisabled={isDisabled}
          size={size}
          items={removableItems}
          onRemove={(keys) =>
            setRemovedPlaygroundTagKeys((currentKeys) => addRemovedTagKeys(currentKeys, keys))
          }
          renderEmptyState={() => (
            <div className={tagEmptyStateClassName}>{text.allTagsRemoved}</div>
          )}
        >
          {(item) => (
            <Tag id={item.id} textValue={item.label} leading={leading}>
              {item.label}
            </Tag>
          )}
        </TagGroup>
      </div>
    );
  }

  return (
    <div className={storyPanelClassName}>
      <TagGroup
        label={localizedLabel}
        description={resolvedDescription}
        errorMessage={resolvedErrorMessage}
        selectionMode={resolvedSelectionMode}
        defaultSelectedKeys={defaultSelectedKeys}
        isDisabled={isDisabled}
        size={size}
      >
        {staticTags.map((tag) => (
          <Tag
            key={tag.id}
            id={tag.id}
            href={isLink ? 'https://one.gov.mv/' : undefined}
            target={isLink ? '_blank' : undefined}
            rel={isLink ? 'noreferrer' : undefined}
            leading={leading}
          >
            {tag.label}
          </Tag>
        ))}
      </TagGroup>
    </div>
  );
}

const meta = {
  title: 'Components/Tags',
  component: TagGroup,
  parameters: {
    layout: 'centered',
    controls: {
      expanded: true,
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const language: TagsLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const {
        label,
        description,
        errorMessage,
        tagLabel,
        secondTagLabel,
        thirdTagLabel,
        badgeLabel,
      } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<TagArgTextKey, string>> = {};
        const currentArgs = {
          label,
          description,
          errorMessage,
          tagLabel,
          secondTagLabel,
          thirdTagLabel,
          badgeLabel,
        };

        tagArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedTagArgText(key, currentArgs[key], language);

          if (typeof localizedValue === 'string' && currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [
        badgeLabel,
        description,
        errorMessage,
        label,
        language,
        secondTagLabel,
        tagLabel,
        thirdTagLabel,
        updateArgs,
      ]);

      return <Story />;
    },
  ],
  args: {
    label: englishTagsText.departments,
    description: englishTagsText.chooseDepartments,
    errorMessage: '',
    selectionMode: 'multiple',
    isDisabled: false,
    size: 'sm',
    tagLabel: englishTagsText.tourism,
    secondTagLabel: englishTagsText.fisheries,
    thirdTagLabel: englishTagsText.transport,
    isLink: false,
    isRemovable: false,
    leadingType: 'none',
    badgeLabel: englishTagsText.new,
    badgeIntent: 'info',
    count: 5,
    countMax: 99,
  } satisfies TagPlaygroundArgs,
  argTypes: {
    label: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    errorMessage: {
      control: 'text',
    },
    selectionMode: {
      control: 'select',
      options: selectionModes,
    },
    isDisabled: {
      control: 'boolean',
    },
    size: {
      control: 'select',
      options: tagSizes,
    },
    tagLabel: {
      control: 'text',
    },
    secondTagLabel: {
      control: 'text',
    },
    thirdTagLabel: {
      control: 'text',
    },
    isLink: {
      control: 'boolean',
      if: { arg: 'isRemovable', truthy: false },
    },
    isRemovable: {
      control: 'boolean',
      if: { arg: 'isLink', truthy: false },
    },
    leadingType: {
      control: 'select',
      options: leadingTypes,
    },
    badgeLabel: {
      control: 'text',
      if: { arg: 'leadingType', eq: 'statusBadge' },
    },
    badgeIntent: {
      control: 'select',
      options: badgeIntents,
      if: { arg: 'leadingType', eq: 'statusBadge' },
    },
    count: {
      control: { type: 'number', min: 0 },
    },
    countMax: {
      control: { type: 'number', min: 1 },
    },
  },
} satisfies Meta<TagPlaygroundArgs>;

export default meta;
type Story = StoryObj<TagPlaygroundArgs>;

function addRemovedTagKeys(currentKeys: Set<string>, keys: Iterable<string | number>) {
  const nextKeys = new Set(currentKeys);

  for (const key of keys) {
    nextKeys.add(String(key));
  }

  return nextKeys;
}

function StorySection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className={sizesAndLeadingSectionClassName}>
      <div className={sizesAndLeadingSectionHeaderClassName}>
        <p className="type-body-sm-medium text-base-emphasis">{title}</p>
        {description ? (
          <p className="type-body-sm-regular text-base-subtle">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export const Playground: Story = {
  render: (args) => <TagsPlayground {...args} />,
};

export const Default: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => {
    const text = useTagsText();

    return (
      <div className={storyPanelClassName}>
        <TagGroup label={text.categories} aria-label={text.categories}>
          <Tag id="news">{text.news}</Tag>
          <Tag id="travel">{text.travel}</Tag>
          <Tag id="gaming">{text.gaming}</Tag>
          <Tag id="shopping">{text.shopping}</Tag>
        </TagGroup>
      </div>
    );
  },
};

export const Variations: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => {
    const text = useTagsText();
    const removableSeed = useMemo(() => getRemovableSeed(text), [text]);
    const [removedTagKeys, setRemovedTagKeys] = useState<Set<string>>(() => new Set());
    const removableItems = useMemo(
      () => removableSeed.filter((item) => !removedTagKeys.has(item.id)),
      [removableSeed, removedTagKeys],
    );

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={storyPanelClassName}>
          <div className={storySectionClassName}>
            <p className="type-body-sm-medium text-base-emphasis">{text.selectableTags}</p>
            <TagGroup
              label={text.departments}
              selectionMode="multiple"
              defaultSelectedKeys={['tourism', 'fisheries']}
              description={text.chooseDepartments}
            >
              <Tag id="tourism">{text.tourism}</Tag>
              <Tag id="fisheries">{text.fisheries}</Tag>
              <Tag id="transport">{text.transport}</Tag>
              <Tag id="education">{text.education}</Tag>
            </TagGroup>
          </div>
        </div>

        <div className={storyPanelClassName}>
          <div className={storySectionClassName}>
            <p className="type-body-sm-medium text-base-emphasis">{text.removableTags}</p>
            <TagGroup<TagItem>
              label={text.savedTopics}
              items={removableItems}
              onRemove={(keys) =>
                setRemovedTagKeys((currentKeys) => addRemovedTagKeys(currentKeys, keys))
              }
              renderEmptyState={() => (
                <div className={tagEmptyStateClassName}>{text.allSavedTopicsRemoved}</div>
              )}
            >
              {(item) => (
                <Tag
                  id={item.id}
                  textValue={item.label}
                  leading={
                    <Badge appearance="emphasis" intent="info" size="sm">
                      {text.topic}
                    </Badge>
                  }
                >
                  {item.label}
                </Tag>
              )}
            </TagGroup>
          </div>
        </div>

        <div className={storyPanelClassName}>
          <div className={storySectionClassName}>
            <p className="type-body-sm-medium text-base-emphasis">{text.linkTags}</p>
            <TagGroup label={text.relatedGuidance}>
              <Tag id="passport" href="https://one.gov.mv/" target="_blank" rel="noreferrer">
                {text.passportServices}
              </Tag>
              <Tag id="licensing" href="https://one.gov.mv/" target="_blank" rel="noreferrer">
                {text.licensingPortal}
              </Tag>
              <Tag id="payments" href="https://one.gov.mv/" target="_blank" rel="noreferrer">
                {text.onlinePayments}
              </Tag>
            </TagGroup>
          </div>
        </div>

        <div className={storyPanelClassName}>
          <div className={storySectionClassName}>
            <p className="type-body-sm-medium text-base-emphasis">{text.disabledKeys}</p>
            <TagGroup
              label={text.amenities}
              selectionMode="multiple"
              defaultSelectedKeys={['laundry']}
              disabledKeys={['parking']}
            >
              <Tag id="laundry">{text.laundry}</Tag>
              <Tag id="parking">{text.parking}</Tag>
              <Tag id="breakfast">{text.breakfast}</Tag>
              <Tag id="wifi">{text.wifi}</Tag>
            </TagGroup>
          </div>
        </div>

        <div className={storyPanelClassName}>
          <div className={storySectionClassName}>
            <p className="type-body-sm-medium text-base-emphasis">{text.disabledGroup}</p>
            <TagGroup
              label={text.restrictedServices}
              selectionMode="multiple"
              defaultSelectedKeys={['documents']}
              isDisabled
            >
              <Tag id="documents">{text.documents}</Tag>
              <Tag id="appointments">{text.appointments}</Tag>
              <Tag id="payments">{text.payments}</Tag>
              <Tag id="support">{text.support}</Tag>
            </TagGroup>
          </div>
        </div>
      </div>
    );
  },
};

export const SingleSelection: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => {
    const text = useTagsText();

    return (
      <div className={storyPanelClassName}>
        <TagGroup
          label={text.preferredChannel}
          selectionMode="single"
          defaultSelectedKeys={['email']}
          description={text.oneChannelOnly}
        >
          <Tag id="email">{text.email}</Tag>
          <Tag id="sms">{text.sms}</Tag>
          <Tag id="post">{text.post}</Tag>
        </TagGroup>
      </div>
    );
  },
};

export const Validation: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => {
    const text = useTagsText();
    const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(() => new Set());

    return (
      <div className={storyPanelClassName}>
        <TagGroup
          label={text.requiredDepartments}
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={(keys) => setSelectedKeys(new Set(keys === 'all' ? [] : keys))}
          description={text.chooseOneDepartment}
          errorMessage={selectedKeys.size === 0 ? text.selectOneDepartment : undefined}
        >
          <Tag id="tourism">{text.tourism}</Tag>
          <Tag id="fisheries">{text.fisheries}</Tag>
          <Tag id="transport">{text.transport}</Tag>
          <Tag id="education">{text.education}</Tag>
        </TagGroup>
      </div>
    );
  },
};

export const InteractionStates: Story = {
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
      <div className={`${storyPanelClassName} space-y-6`}>
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
            <Tag key={id} id={id} textValue={labels[id]} isDisabled={id === 'education'}>
              {() => <span>{labels[id]}</span>}
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
          <Tag id="payments" href="https://one.gov.mv/" target="_blank" rel="noreferrer">
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
    // The localized label already includes the tag, so RAC must not append it again.
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
  },
};

export const ContentAndEmptyStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const text = useTagsText();
    return (
      <div className="w-64 max-w-full space-y-6">
        <TagGroup label={0} description={text.chooseDepartments.repeat(8)}>
          <Tag id={0}>{0}</Tag>
          <Tag id="long" leading={<TagUserIcon size="sm" />}>
            {text.documents.repeat(40)}
          </Tag>
        </TagGroup>
        <TagGroup label={text.savedTopics} errorMessage={text.selectOneDepartment.repeat(8)}>
          <Tag id="large" size="xl" textValue={text.documents}>
            {() => <span>{text.documents}</span>}
          </Tag>
        </TagGroup>
        <TagGroup label={text.categories} />
        <TagGroup
          label={text.savedTopics}
          renderEmptyState={() => <p>{text.allSavedTopicsRemoved}</p>}
          listClassName="border border-base-subtle p-2"
        />
        <TagGroup label={text.relatedContacts} onRemove={() => {}}>
          <Tag
            id="custom"
            textValue={text.liaisonOfficer}
            removeButtonLabel={(label) => `${text.relatedContacts}: ${label}`}
            isDisabled
          >
            {text.liaisonOfficer}
          </Tag>
        </TagGroup>
      </div>
    );
  },
};

export const SizesAndLeading: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => {
    const text = useTagsText();

    return (
      <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-2">
        <div className={sizesAndLeadingPanelClassName}>
          <StorySection title={text.sizes} description={text.fixedHeights}>
            <TagGroup aria-label={text.sizes}>
              <Tag id="xs" size="xs">
                {text.extraSmall}
              </Tag>
              <Tag id="sm" size="sm">
                {text.small}
              </Tag>
              <Tag id="md" size="md">
                {text.medium}
              </Tag>
              <Tag id="lg" size="lg">
                {text.large}
              </Tag>
              <Tag id="xl" size="xl">
                {text.extraLarge}
              </Tag>
            </TagGroup>
          </StorySection>

          <StorySection title={text.groupSize} description={text.groupSizeDescription}>
            <TagGroup label={text.departmentFilters} size="md">
              <Tag id="tourism">{text.tourism}</Tag>
              <Tag id="fisheries">{text.fisheries}</Tag>
              <Tag id="transport">{text.transport}</Tag>
            </TagGroup>
          </StorySection>
        </div>

        <div className={sizesAndLeadingPanelClassName}>
          <StorySection title={text.leadingIcon} description={text.leadingIconDescription}>
            <TagGroup aria-label={text.assignedPeople}>
              <Tag id="aisha" leading={<TagUserIcon size="sm" />}>
                {text.aishaHassan}
              </Tag>
              <Tag id="ibrahim" leading={<TagUserIcon size="sm" />}>
                {text.ibrahimWaheed}
              </Tag>
              <Tag id="mariyam" leading={<TagUserIcon size="sm" />}>
                {text.mariyamAli}
              </Tag>
            </TagGroup>
          </StorySection>

          <StorySection title={text.leadingCountBadge} description={text.counterBadgeDescription}>
            <TagGroup aria-label={text.inboxes}>
              <Tag id="inbox" leading={<TagCountBadge count={3} size="sm" />}>
                {text.inbox}
              </Tag>
              <Tag id="requests" leading={<TagCountBadge count={12} size="sm" />}>
                {text.requests}
              </Tag>
              <Tag id="alerts" leading={<TagCountBadge count={128} max={99} size="sm" />}>
                {text.alerts}
              </Tag>
            </TagGroup>
          </StorySection>
        </div>

        <div className={sizesAndLeadingPanelClassName}>
          <StorySection title={text.leadingStatusBadges} description={text.statusBadgesDescription}>
            <TagGroup aria-label={text.serviceStatus}>
              <Tag
                id="passport"
                leading={
                  <Badge appearance="emphasis" intent="positive" size="sm">
                    {text.live}
                  </Badge>
                }
              >
                {text.passportServices}
              </Tag>
              <Tag
                id="licensing"
                leading={
                  <Badge appearance="emphasis" intent="cautious" size="sm">
                    {text.beta}
                  </Badge>
                }
              >
                {text.licensingPortal}
              </Tag>
              <Tag
                id="payments"
                leading={
                  <Badge appearance="emphasis" intent="info" size="sm">
                    {text.new}
                  </Badge>
                }
              >
                {text.onlinePayments}
              </Tag>
            </TagGroup>
          </StorySection>

          <StorySection title={text.iconAndCountTogether}>
            <TagGroup aria-label={text.teamChannels}>
              <Tag
                id="support"
                leading={
                  <span className="inline-flex items-center gap-1">
                    <TagUserIcon size="sm" />
                    <TagCountBadge count={5} size="sm" />
                  </span>
                }
              >
                {text.supportTeam}
              </Tag>
              <Tag
                id="review"
                leading={
                  <span className="inline-flex items-center gap-1">
                    <TagUserIcon size="sm" />
                    <TagCountBadge count={2} size="sm" />
                  </span>
                }
              >
                {text.reviewQueue}
              </Tag>
            </TagGroup>
          </StorySection>
        </div>

        <div className={sizesAndLeadingPanelClassName}>
          <StorySection title={text.leadingAtEachSize} description={text.iconsScaleDescription}>
            <div className="space-y-4">
              <TagGroup aria-label={text.extraSmall} size="xs">
                <Tag id="xs-user" leading={<TagUserIcon size="xs" />}>
                  {text.assigned}
                </Tag>
                <Tag id="xs-count" leading={<TagCountBadge count={4} size="xs" />}>
                  {text.pending}
                </Tag>
                <Tag
                  id="xs-badge"
                  leading={
                    <Badge appearance="emphasis" intent="warning" size="sm">
                      {text.draft}
                    </Badge>
                  }
                >
                  {text.forms}
                </Tag>
              </TagGroup>

              <TagGroup aria-label={text.small} size="sm">
                <Tag id="sm-user" leading={<TagUserIcon size="sm" />}>
                  {text.assigned}
                </Tag>
                <Tag id="sm-count" leading={<TagCountBadge count={4} size="sm" />}>
                  {text.pending}
                </Tag>
                <Tag
                  id="sm-badge"
                  leading={
                    <Badge appearance="emphasis" intent="warning" size="sm">
                      {text.draft}
                    </Badge>
                  }
                >
                  {text.forms}
                </Tag>
              </TagGroup>

              <TagGroup aria-label={text.medium} size="md">
                <Tag id="md-user" leading={<TagUserIcon size="md" />}>
                  {text.assigned}
                </Tag>
                <Tag id="md-count" leading={<TagCountBadge count={4} size="md" />}>
                  {text.pending}
                </Tag>
                <Tag
                  id="md-badge"
                  leading={
                    <Badge appearance="emphasis" intent="warning" size="md">
                      {text.draft}
                    </Badge>
                  }
                >
                  {text.forms}
                </Tag>
              </TagGroup>

              <TagGroup aria-label={text.large} size="lg">
                <Tag id="lg-user" leading={<TagUserIcon size="lg" />}>
                  {text.assigned}
                </Tag>
                <Tag id="lg-count" leading={<TagCountBadge count={4} size="lg" />}>
                  {text.pending}
                </Tag>
                <Tag
                  id="lg-badge"
                  leading={
                    <Badge appearance="emphasis" intent="warning" size="md">
                      {text.draft}
                    </Badge>
                  }
                >
                  {text.forms}
                </Tag>
              </TagGroup>

              <TagGroup aria-label={text.extraLarge} size="xl">
                <Tag id="xl-user" leading={<TagUserIcon size="xl" />}>
                  {text.assigned}
                </Tag>
                <Tag id="xl-count" leading={<TagCountBadge count={4} size="xl" />}>
                  {text.pending}
                </Tag>
                <Tag
                  id="xl-badge"
                  leading={
                    <Badge appearance="emphasis" intent="warning" size="md">
                      {text.draft}
                    </Badge>
                  }
                >
                  {text.forms}
                </Tag>
              </TagGroup>
            </div>
          </StorySection>
        </div>

        <div className={`${sizesAndLeadingPanelClassName} lg:col-span-2`}>
          <StorySection
            title={text.selectableFiltersWithLeadingContent}
            description={text.leadingSlotsDescription}
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <TagGroup
                label={text.departmentFilters}
                selectionMode="multiple"
                defaultSelectedKeys={['tourism']}
              >
                <Tag
                  id="tourism"
                  leading={
                    <Badge appearance="emphasis" intent="info" size="sm">
                      12
                    </Badge>
                  }
                >
                  {text.tourism}
                </Tag>
                <Tag
                  id="fisheries"
                  leading={
                    <Badge appearance="emphasis" intent="info" size="sm">
                      4
                    </Badge>
                  }
                >
                  {text.fisheries}
                </Tag>
                <Tag
                  id="transport"
                  leading={
                    <Badge appearance="emphasis" intent="info" size="sm">
                      7
                    </Badge>
                  }
                >
                  {text.transport}
                </Tag>
              </TagGroup>

              <TagGroup label={text.relatedContacts}>
                <Tag
                  id="liaison"
                  href="https://one.gov.mv/"
                  target="_blank"
                  rel="noreferrer"
                  leading={<TagUserIcon size="sm" />}
                >
                  {text.liaisonOfficer}
                </Tag>
                <Tag
                  id="supervisor"
                  href="https://one.gov.mv/"
                  target="_blank"
                  rel="noreferrer"
                  leading={<TagUserIcon size="sm" />}
                >
                  {text.supervisor}
                </Tag>
              </TagGroup>
            </div>
          </StorySection>
        </div>
      </div>
    );
  },
};
