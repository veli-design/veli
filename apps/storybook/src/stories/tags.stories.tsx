import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tag, TagGroup } from '@tradenetcorp/veli-ui/tags';

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

const meta = {
  title: 'Components/Tags',
  component: TagGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TagGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

function removeItems(items: TagItem[], keys: Iterable<string | number>) {
  const removedKeys = new Set(keys);
  return items.filter((item) => !removedKeys.has(item.id));
}

export const Default: Story = {
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
                <Tag id={item.id} textValue={item.label}>
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 rounded-full bg-button-primary-default"
                    />
                    <span className="min-w-0 truncate">{item.label}</span>
                  </span>
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
