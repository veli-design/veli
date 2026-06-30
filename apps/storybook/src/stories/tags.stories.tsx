import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Badge, type BadgeIntent } from '@tradenetcorp/veli-ui/badge';
import { Tag, TagGroup, type TagSize } from '@tradenetcorp/veli-ui/tags';
import { User } from 'phosphor-react';

type TagItem = {
  id: string;
  label: string;
  href?: string;
  isDisabled?: boolean;
};

const removableSeed: TagItem[] = [
  { id: 'permits', label: 'Permits' },
  { id: 'forms', label: 'Forms' },
  { id: 'notices', label: 'Notices' },
  { id: 'licences', label: 'Licences' },
];

const storyPanelClassName =
  'w-full max-w-md rounded-2xl border border-border-default-subtle bg-bg-surface-raised p-4';

const storySectionClassName = 'space-y-3';

const tagEmptyStateClassName =
  'rounded-xl border border-dashed border-border-default-subtle px-3 py-2.5 type-body-sm-regular text-text-default-subtle';

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

type TagSelectionMode = (typeof selectionModes)[number];
type TagLeadingType = (typeof leadingTypes)[number];

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

const playgroundSeed: TagPlaygroundItem[] = [
  { id: 'tag-1', label: 'Tourism' },
  { id: 'tag-2', label: 'Fisheries' },
  { id: 'tag-3', label: 'Transport' },
];

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
  return <User aria-hidden size={tagIconSizes[size]} weight="regular" />;
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
  const staticTags = useMemo<TagPlaygroundItem[]>(
    () => [
      { id: 'tag-1', label: tagLabel },
      { id: 'tag-2', label: secondTagLabel },
      { id: 'tag-3', label: thirdTagLabel },
    ],
    [secondTagLabel, tagLabel, thirdTagLabel],
  );
  const [removableItems, setRemovableItems] = useState(playgroundSeed);
  const leading = renderTagLeading({
    leadingType,
    size,
    badgeLabel,
    badgeIntent,
    count,
    countMax,
  });

  useEffect(() => {
    if (!isRemovable) {
      return;
    }

    setRemovableItems(staticTags);
  }, [isRemovable, staticTags]);

  const resolvedDescription = errorMessage ? undefined : description || undefined;
  const resolvedErrorMessage = errorMessage || undefined;
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
          label={label}
          description={resolvedDescription}
          errorMessage={resolvedErrorMessage}
          selectionMode={resolvedSelectionMode}
          defaultSelectedKeys={defaultSelectedKeys}
          isDisabled={isDisabled}
          size={size}
          items={removableItems}
          onRemove={(keys) =>
            setRemovableItems((current) => current.filter((item) => !new Set(keys).has(item.id)))
          }
          renderEmptyState={() => (
            <div className={tagEmptyStateClassName}>All tags have been removed.</div>
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
        label={label}
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
  args: {
    label: 'Departments',
    description: 'Choose one or more departments.',
    errorMessage: '',
    selectionMode: 'multiple',
    isDisabled: false,
    size: 'sm',
    tagLabel: 'Tourism',
    secondTagLabel: 'Fisheries',
    thirdTagLabel: 'Transport',
    isLink: false,
    isRemovable: false,
    leadingType: 'none',
    badgeLabel: 'New',
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

function removeItems(items: TagItem[], keys: Iterable<string | number>) {
  const removedKeys = new Set(keys);
  return items.filter((item) => !removedKeys.has(item.id));
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
    <div className={storySectionClassName}>
      <div>
        <p className="type-body-sm-medium text-text-default-emphasis">{title}</p>
        {description ? (
          <p className="type-body-sm-regular text-text-default-subtle">{description}</p>
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
  render: () => (
    <div className={storyPanelClassName}>
      <TagGroup label="Categories" aria-label="Categories">
        <Tag id="news">News</Tag>
        <Tag id="travel">Travel</Tag>
        <Tag id="gaming">Gaming</Tag>
        <Tag id="shopping">Shopping</Tag>
      </TagGroup>
    </div>
  ),
};

export const Variations: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => {
    const [removableItems, setRemovableItems] = useState(removableSeed);

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={storyPanelClassName}>
          <div className={storySectionClassName}>
            <p className="type-body-sm-medium text-text-default-emphasis">Selectable tags</p>
            <TagGroup
              label="Departments"
              selectionMode="multiple"
              defaultSelectedKeys={['tourism', 'fisheries']}
              description="Use selection when tags act as filters."
            >
              <Tag id="tourism">Tourism</Tag>
              <Tag id="fisheries">Fisheries</Tag>
              <Tag id="transport">Transport</Tag>
              <Tag id="education">Education</Tag>
            </TagGroup>
          </div>
        </div>

        <div className={storyPanelClassName}>
          <div className={storySectionClassName}>
            <p className="type-body-sm-medium text-text-default-emphasis">Removable tags</p>
            <TagGroup<TagItem>
              label="Saved topics"
              items={removableItems}
              onRemove={(keys) =>
                setRemovableItems((current: TagItem[]) => removeItems(current, keys))
              }
              renderEmptyState={() => (
                <div className={tagEmptyStateClassName}>All saved topics have been removed.</div>
              )}
            >
              {(item) => (
                <Tag
                  id={item.id}
                  textValue={item.label}
                  leading={
                    <Badge appearance="emphasis" intent="info" size="sm">
                      Topic
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
            <p className="type-body-sm-medium text-text-default-emphasis">Link tags</p>
            <TagGroup label="Related guidance">
              <Tag id="passport" href="https://one.gov.mv/" target="_blank" rel="noreferrer">
                Passport services
              </Tag>
              <Tag id="licensing" href="https://one.gov.mv/" target="_blank" rel="noreferrer">
                Licensing portal
              </Tag>
              <Tag id="payments" href="https://one.gov.mv/" target="_blank" rel="noreferrer">
                Online payments
              </Tag>
            </TagGroup>
          </div>
        </div>

        <div className={storyPanelClassName}>
          <div className={storySectionClassName}>
            <p className="type-body-sm-medium text-text-default-emphasis">Disabled keys</p>
            <TagGroup
              label="Amenities"
              selectionMode="multiple"
              defaultSelectedKeys={['laundry']}
              disabledKeys={['parking']}
            >
              <Tag id="laundry">Laundry</Tag>
              <Tag id="parking">Parking</Tag>
              <Tag id="breakfast">Breakfast</Tag>
              <Tag id="wifi">Wi-Fi</Tag>
            </TagGroup>
          </div>
        </div>

        <div className={storyPanelClassName}>
          <div className={storySectionClassName}>
            <p className="type-body-sm-medium text-text-default-emphasis">Disabled group</p>
            <TagGroup
              label="Restricted services"
              selectionMode="multiple"
              defaultSelectedKeys={['documents']}
              isDisabled
            >
              <Tag id="documents">Documents</Tag>
              <Tag id="appointments">Appointments</Tag>
              <Tag id="payments">Payments</Tag>
              <Tag id="support">Support</Tag>
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
  render: () => (
    <div className={storyPanelClassName}>
      <TagGroup
        label="Preferred channel"
        selectionMode="single"
        defaultSelectedKeys={['email']}
        description="Only one channel can be selected at a time."
      >
        <Tag id="email">Email</Tag>
        <Tag id="sms">SMS</Tag>
        <Tag id="post">Post</Tag>
      </TagGroup>
    </div>
  ),
};

export const Validation: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <div className={storyPanelClassName}>
      <TagGroup
        label="Required departments"
        selectionMode="multiple"
        description="Choose at least one department."
        errorMessage="Select at least one department."
      >
        <Tag id="tourism">Tourism</Tag>
        <Tag id="fisheries">Fisheries</Tag>
        <Tag id="transport">Transport</Tag>
        <Tag id="education">Education</Tag>
      </TagGroup>
    </div>
  ),
};

export const SizesAndLeading: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-2">
      <div className={storyPanelClassName}>
        <StorySection title="Sizes" description="Fixed heights from xs (28px) to xl (44px).">
          <TagGroup aria-label="Tag sizes">
            <Tag id="xs" size="xs">
              Extra small
            </Tag>
            <Tag id="sm" size="sm">
              Small
            </Tag>
            <Tag id="md" size="md">
              Medium
            </Tag>
            <Tag id="lg" size="lg">
              Large
            </Tag>
            <Tag id="xl" size="xl">
              Extra large
            </Tag>
          </TagGroup>
        </StorySection>

        <StorySection
          title="Group size"
          description="Set size once on TagGroup to apply to every tag."
        >
          <TagGroup label="Department filters" size="md">
            <Tag id="tourism">Tourism</Tag>
            <Tag id="fisheries">Fisheries</Tag>
            <Tag id="transport">Transport</Tag>
          </TagGroup>
        </StorySection>
      </div>

      <div className={storyPanelClassName}>
        <StorySection
          title="Leading icon"
          description="Use the leading slot for icons such as a user avatar glyph."
        >
          <TagGroup aria-label="Assigned people">
            <Tag id="aisha" leading={<TagUserIcon size="sm" />}>
              Aisha Hassan
            </Tag>
            <Tag id="ibrahim" leading={<TagUserIcon size="sm" />}>
              Ibrahim Waheed
            </Tag>
            <Tag id="mariyam" leading={<TagUserIcon size="sm" />}>
              Mariyam Ali
            </Tag>
          </TagGroup>
        </StorySection>

        <StorySection
          title="Leading count badge"
          description="Counter badges work well for unread or pending counts."
        >
          <TagGroup aria-label="Inboxes">
            <Tag id="inbox" leading={<TagCountBadge count={3} size="sm" />}>
              Inbox
            </Tag>
            <Tag id="requests" leading={<TagCountBadge count={12} size="sm" />}>
              Requests
            </Tag>
            <Tag id="alerts" leading={<TagCountBadge count={128} max={99} size="sm" />}>
              Alerts
            </Tag>
          </TagGroup>
        </StorySection>
      </div>

      <div className={storyPanelClassName}>
        <StorySection
          title="Leading status badges"
          description="Compose tags with the Badge component for labels and status."
        >
          <TagGroup aria-label="Service status">
            <Tag
              id="passport"
              leading={
                <Badge appearance="emphasis" intent="positive" size="sm">
                  Live
                </Badge>
              }
            >
              Passport services
            </Tag>
            <Tag
              id="licensing"
              leading={
                <Badge appearance="emphasis" intent="cautious" size="sm">
                  Beta
                </Badge>
              }
            >
              Licensing portal
            </Tag>
            <Tag
              id="payments"
              leading={
                <Badge appearance="emphasis" intent="info" size="sm">
                  New
                </Badge>
              }
            >
              Online payments
            </Tag>
          </TagGroup>
        </StorySection>

        <StorySection title="Icon and count together">
          <TagGroup aria-label="Team channels">
            <Tag
              id="support"
              leading={
                <span className="inline-flex items-center gap-1">
                  <TagUserIcon size="sm" />
                  <TagCountBadge count={5} size="sm" />
                </span>
              }
            >
              Support team
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
              Review queue
            </Tag>
          </TagGroup>
        </StorySection>
      </div>

      <div className={storyPanelClassName}>
        <StorySection
          title="Leading at each size"
          description="Icons and badges scale with the tag size."
        >
          <div className="space-y-4">
            <TagGroup aria-label="Extra small tags" size="xs">
              <Tag id="xs-user" leading={<TagUserIcon size="xs" />}>
                Assigned
              </Tag>
              <Tag id="xs-count" leading={<TagCountBadge count={4} size="xs" />}>
                Pending
              </Tag>
              <Tag
                id="xs-badge"
                leading={
                  <Badge appearance="emphasis" intent="warning" size="sm">
                    Draft
                  </Badge>
                }
              >
                Forms
              </Tag>
            </TagGroup>

            <TagGroup aria-label="Small tags" size="sm">
              <Tag id="sm-user" leading={<TagUserIcon size="sm" />}>
                Assigned
              </Tag>
              <Tag id="sm-count" leading={<TagCountBadge count={4} size="sm" />}>
                Pending
              </Tag>
              <Tag
                id="sm-badge"
                leading={
                  <Badge appearance="emphasis" intent="warning" size="sm">
                    Draft
                  </Badge>
                }
              >
                Forms
              </Tag>
            </TagGroup>

            <TagGroup aria-label="Medium tags" size="md">
              <Tag id="md-user" leading={<TagUserIcon size="md" />}>
                Assigned
              </Tag>
              <Tag id="md-count" leading={<TagCountBadge count={4} size="md" />}>
                Pending
              </Tag>
              <Tag
                id="md-badge"
                leading={
                  <Badge appearance="emphasis" intent="warning" size="md">
                    Draft
                  </Badge>
                }
              >
                Forms
              </Tag>
            </TagGroup>

            <TagGroup aria-label="Large tags" size="lg">
              <Tag id="lg-user" leading={<TagUserIcon size="lg" />}>
                Assigned
              </Tag>
              <Tag id="lg-count" leading={<TagCountBadge count={4} size="lg" />}>
                Pending
              </Tag>
              <Tag
                id="lg-badge"
                leading={
                  <Badge appearance="emphasis" intent="warning" size="md">
                    Draft
                  </Badge>
                }
              >
                Forms
              </Tag>
            </TagGroup>

            <TagGroup aria-label="Extra large tags" size="xl">
              <Tag id="xl-user" leading={<TagUserIcon size="xl" />}>
                Assigned
              </Tag>
              <Tag id="xl-count" leading={<TagCountBadge count={4} size="xl" />}>
                Pending
              </Tag>
              <Tag
                id="xl-badge"
                leading={
                  <Badge appearance="emphasis" intent="warning" size="md">
                    Draft
                  </Badge>
                }
              >
                Forms
              </Tag>
            </TagGroup>
          </div>
        </StorySection>
      </div>

      <div className={`${storyPanelClassName} lg:col-span-2`}>
        <StorySection
          title="Selectable filters with leading content"
          description="Leading slots work with selection, removable tags, and links."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <TagGroup
              label="Department filters"
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
                Tourism
              </Tag>
              <Tag
                id="fisheries"
                leading={
                  <Badge appearance="emphasis" intent="info" size="sm">
                    4
                  </Badge>
                }
              >
                Fisheries
              </Tag>
              <Tag
                id="transport"
                leading={
                  <Badge appearance="emphasis" intent="info" size="sm">
                    7
                  </Badge>
                }
              >
                Transport
              </Tag>
            </TagGroup>

            <TagGroup label="Related contacts">
              <Tag
                id="liaison"
                href="https://one.gov.mv/"
                target="_blank"
                rel="noreferrer"
                leading={<TagUserIcon size="sm" />}
              >
                Liaison officer
              </Tag>
              <Tag
                id="supervisor"
                href="https://one.gov.mv/"
                target="_blank"
                rel="noreferrer"
                leading={<TagUserIcon size="sm" />}
              >
                Supervisor
              </Tag>
            </TagGroup>
          </div>
        </StorySection>
      </div>
    </div>
  ),
};
