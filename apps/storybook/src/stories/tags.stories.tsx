import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Tag, TagGroup } from "@tradenetcorp/coral-ui/tags";

type TagItem = {
  id: string;
  label: string;
  href?: string;
  isDisabled?: boolean;
};

const removableSeed: TagItem[] = [
  { id: "permits", label: "Permits" },
  { id: "forms", label: "Forms" },
  { id: "notices", label: "Notices" },
  { id: "licences", label: "Licences" },
];

const meta = {
  title: "Components/Tags",
  component: TagGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TagGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

function removeItems(items: TagItem[], keys: Iterable<string | number>) {
  const removedKeys = new Set(keys);
  return items.filter((item) => !removedKeys.has(item.id));
}

export const Default: Story = {
  render: () => (
    <div className="w-[420px] rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
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
      <div className="grid gap-[24px] lg:grid-cols-2">
        <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
          <div className="space-y-[12px]">
            <p className="type-body-sm-medium text-text-default-high-contrast">
              Selectable tags
            </p>
            <TagGroup
              label="Departments"
              selectionMode="multiple"
              defaultSelectedKeys={["tourism", "fisheries"]}
              description="Use selection when tags act as filters."
            >
              <Tag id="tourism">Tourism</Tag>
              <Tag id="fisheries">Fisheries</Tag>
              <Tag id="transport">Transport</Tag>
              <Tag id="education">Education</Tag>
            </TagGroup>
          </div>
        </div>

        <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
          <div className="space-y-[12px]">
            <p className="type-body-sm-medium text-text-default-high-contrast">
              Removable tags
            </p>
            <TagGroup<TagItem>
              label="Saved topics"
              items={removableItems}
              onRemove={(keys) =>
                setRemovableItems((current: TagItem[]) => removeItems(current, keys))
              }
              renderEmptyState={() => (
                <div className="rounded-[12px] border border-dashed border-border-default-subtle px-[12px] py-[10px] type-body-sm-regular text-text-default-subtle">
                  All saved topics have been removed.
                </div>
              )}
            >
              {(item) => <Tag id={item.id}>{item.label}</Tag>}
            </TagGroup>
          </div>
        </div>

        <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
          <div className="space-y-[12px]">
            <p className="type-body-sm-medium text-text-default-high-contrast">
              Link tags
            </p>
            <TagGroup label="Related guidance">
              <Tag
                id="passport"
                href="https://one.gov.mv/"
                target="_blank"
                rel="noreferrer"
              >
                Passport services
              </Tag>
              <Tag
                id="licensing"
                href="https://one.gov.mv/"
                target="_blank"
                rel="noreferrer"
              >
                Licensing portal
              </Tag>
              <Tag
                id="payments"
                href="https://one.gov.mv/"
                target="_blank"
                rel="noreferrer"
              >
                Online payments
              </Tag>
            </TagGroup>
          </div>
        </div>

        <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
          <div className="space-y-[12px]">
            <p className="type-body-sm-medium text-text-default-high-contrast">
              Disabled keys
            </p>
            <TagGroup
              label="Amenities"
              selectionMode="multiple"
              defaultSelectedKeys={["laundry"]}
              disabledKeys={["parking"]}
            >
              <Tag id="laundry">Laundry</Tag>
              <Tag id="parking">Parking</Tag>
              <Tag id="breakfast">Breakfast</Tag>
              <Tag id="wifi">Wi-Fi</Tag>
            </TagGroup>
          </div>
        </div>

        <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
          <div className="space-y-[12px]">
            <p className="type-body-sm-medium text-text-default-high-contrast">
              Disabled group
            </p>
            <TagGroup
              label="Restricted services"
              selectionMode="multiple"
              defaultSelectedKeys={["documents"]}
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
