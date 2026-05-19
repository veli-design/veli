import { useState } from 'react';
import { Button } from '@tradenetcorp/coral-ui/button';
import { Breadcrumb, Breadcrumbs } from '@tradenetcorp/coral-ui/breadcrumbs';
import { Checkbox } from '@tradenetcorp/coral-ui/checkbox';
import { ComboBox, ComboBoxItem, ComboBoxSection } from '@tradenetcorp/coral-ui/combobox';
import { Divider } from '@tradenetcorp/coral-ui/divider';
import { Input } from '@tradenetcorp/coral-ui/input';
import { Link } from '@tradenetcorp/coral-ui/link';
import { Radio, RadioGroup } from '@tradenetcorp/coral-ui/radio';
import { Tag, TagGroup } from '@tradenetcorp/coral-ui/tags';
import { Select, SelectItem, SelectSection } from '@tradenetcorp/coral-ui/select';
import {
  ArrowRight,
  CalendarBlank,
  CaretLeft,
  CaretDown,
  DownloadSimple,
  Info,
  MagnifyingGlass,
  Plus,
  Trash,
  WarningCircle,
} from 'phosphor-react';

export function ButtonUsageDemo() {
  return <Button>Click me</Button>;
}

type BreadcrumbTrailItem = {
  id: string;
  label: string;
  href?: string;
};

const BREADCRUMB_TRAIL: BreadcrumbTrailItem[] = [
  { id: 'home', label: 'Home', href: '#' },
  { id: 'services', label: 'Services', href: '#' },
  { id: 'permits', label: 'Permits', href: '#' },
  { id: 'fishing', label: 'Fishing permit' },
];

type TagDemoItem = {
  id: string;
  label: string;
  href?: string;
};

const REMOVABLE_TAG_SEED: TagDemoItem[] = [
  { id: 'permits', label: 'Permits' },
  { id: 'forms', label: 'Forms' },
  { id: 'notices', label: 'Notices' },
  { id: 'licences', label: 'Licences' },
];

function removeTagItems(items: TagDemoItem[], keys: Iterable<string | number>) {
  const removedKeys = new Set(keys);
  return items.filter((item) => !removedKeys.has(item.id));
}

export function BreadcrumbsUsageDemo() {
  return (
    <Breadcrumbs aria-label="Breadcrumb">
      <Breadcrumb href="#">Home</Breadcrumb>
      <Breadcrumb href="#">Services</Breadcrumb>
      <Breadcrumb href="#">Permits</Breadcrumb>
      <Breadcrumb>Fishing permit</Breadcrumb>
    </Breadcrumbs>
  );
}

export function BreadcrumbsVariantsDemo() {
  const [currentIndex, setCurrentIndex] = useState(BREADCRUMB_TRAIL.length - 1);
  const items = BREADCRUMB_TRAIL.slice(0, currentIndex + 1);

  return (
    <div className="grid gap-[24px] lg:grid-cols-2">
      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-high-contrast">
            Static breadcrumb trail
          </p>
          <Breadcrumbs aria-label="Site navigation breadcrumb">
            <Breadcrumb href="#">Home</Breadcrumb>
            <Breadcrumb href="#">Departments</Breadcrumb>
            <Breadcrumb href="#" isDisabled>
              Fisheries
            </Breadcrumb>
            <Breadcrumb>Licensing</Breadcrumb>
          </Breadcrumbs>
        </div>
      </div>

      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-high-contrast">Back link treatment</p>
          <Breadcrumbs aria-label="Back breadcrumb">
            <Breadcrumb href="#" tone="accent">
              <CaretLeft aria-hidden size={16} weight="bold" />
              <span>Previous Page</span>
            </Breadcrumb>
            <Breadcrumb href="#">Menu One</Breadcrumb>
            <Breadcrumb>...</Breadcrumb>
            <Breadcrumb href="#">Menu Five</Breadcrumb>
            <Breadcrumb>Menu Active</Breadcrumb>
          </Breadcrumbs>
        </div>
      </div>

      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px] lg:col-span-2">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-high-contrast">
            Data-driven breadcrumb trail
          </p>
          <Breadcrumbs
            aria-label="Application breadcrumb"
            items={items}
            onAction={(key) => {
              const nextIndex = BREADCRUMB_TRAIL.findIndex((item) => item.id === key);
              if (nextIndex >= 0) {
                setCurrentIndex(nextIndex);
              }
            }}
          >
            {(item) => <Breadcrumb href={item.href}>{item.label}</Breadcrumb>}
          </Breadcrumbs>
          <p className="type-caption-12-regular text-text-default-muted">
            Activate an earlier crumb to collapse the trail to that level.
          </p>
        </div>
      </div>
    </div>
  );
}

export function TagsUsageDemo() {
  return (
    <TagGroup label="Categories">
      <Tag id="news">News</Tag>
      <Tag id="travel">Travel</Tag>
      <Tag id="gaming">Gaming</Tag>
      <Tag id="shopping">Shopping</Tag>
    </TagGroup>
  );
}

export function TagsVariantsDemo() {
  const [removableItems, setRemovableItems] = useState(REMOVABLE_TAG_SEED);

  return (
    <div className="grid gap-[24px] lg:grid-cols-2">
      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-high-contrast">Selectable tags</p>
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

      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-high-contrast">Removable tags</p>
          <TagGroup<TagDemoItem>
            label="Saved topics"
            items={removableItems}
            onRemove={(keys) =>
              setRemovableItems((current: TagDemoItem[]) => removeTagItems(current, keys))
            }
            renderEmptyState={() => (
              <div className="rounded-[12px] border border-dashed border-border-default-subtle px-[12px] py-[10px] type-body-sm-regular text-text-default-subtle">
                All saved topics have been removed.
              </div>
            )}
          >
            {(item) => (
              <Tag id={item.id}>
                <span className="inline-flex min-w-0 items-center gap-[6px]">
                  <span
                    aria-hidden="true"
                    className="h-[6px] w-[6px] shrink-0 rounded-full bg-button-primary-default"
                  />
                  <span className="min-w-0 truncate">{item.label}</span>
                </span>
              </Tag>
            )}
          </TagGroup>
        </div>
      </div>

      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-high-contrast">Link tags</p>
          <TagGroup label="Related guidance">
            <Tag href="https://www.gov.mv" target="_blank" rel="noreferrer">
              Passport services
            </Tag>
            <Tag href="https://www.gov.mv" target="_blank" rel="noreferrer">
              Licensing portal
            </Tag>
            <Tag href="https://www.gov.mv" target="_blank" rel="noreferrer">
              Online payments
            </Tag>
          </TagGroup>
        </div>
      </div>

      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-high-contrast">Disabled keys</p>
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

      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-high-contrast">Disabled group</p>
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
}

export function ButtonVariantsDemo() {
  return (
    <div className="grid grid-cols-4 gap-x-8 gap-y-6 items-center min-w-[500px]">
      <div />
      <div className="text-xs font-bold uppercase text-text-default-muted">Fill</div>
      <div className="text-xs font-bold uppercase text-text-default-muted">Transparent</div>
      <div className="text-xs font-bold uppercase text-text-default-muted">Ghost</div>

      <div className="text-sm font-medium">Primary</div>
      <Button variant="primary" style="fill">
        Button
      </Button>
      <Button variant="primary" style="transparent">
        Button
      </Button>
      <Button variant="primary" style="ghost">
        Button
      </Button>

      <div className="text-sm font-medium">Secondary</div>
      <Button variant="secondary" style="fill">
        Button
      </Button>
      <Button variant="secondary" style="transparent">
        Button
      </Button>
      <Button variant="secondary" style="ghost">
        Button
      </Button>

      <div className="text-sm font-medium">Danger</div>
      <Button variant="danger" style="fill">
        Button
      </Button>
      <Button variant="danger" style="transparent">
        Button
      </Button>
      <Button variant="danger" style="ghost">
        Button
      </Button>
    </div>
  );
}

export function ButtonIconsDemo() {
  return (
    <div className="flex gap-4 flex-wrap items-center">
      <Button size="xl">
        <Plus size={24} weight="bold" />
        XL Button
      </Button>
      <Button size="lg" variant="secondary" style="transparent">
        <DownloadSimple size={20} weight="bold" />
        LG Button
      </Button>
      <Button size="md" variant="danger" style="ghost">
        <Trash size={16} weight="bold" />
        MD Button
      </Button>
      <Button size="xs">
        <ArrowRight size={12} weight="bold" />
        XS Button
      </Button>
    </div>
  );
}

export function ButtonIconOnlyDemo() {
  return (
    <div className="flex gap-4 flex-wrap items-center">
      <Button size="xl" iconOnly aria-label="Add item">
        <Plus size={24} weight="bold" />
      </Button>
      <Button size="lg" variant="secondary" style="transparent" iconOnly aria-label="Download file">
        <DownloadSimple size={20} weight="bold" />
      </Button>
      <Button size="md" variant="danger" style="ghost" iconOnly aria-label="Delete item">
        <Trash size={16} weight="bold" />
      </Button>
      <Button size="sm" iconOnly isLoading aria-label="Saving">
        <Plus size={16} weight="bold" />
      </Button>
    </div>
  );
}

export function ButtonSizesDemo() {
  return (
    <div className="flex gap-4 items-center flex-wrap">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  );
}

export function ButtonLoadingDemo() {
  return <Button isLoading>Processing...</Button>;
}

export function ButtonSeaglassDemo() {
  return (
    <div className="flex gap-4 items-center flex-wrap">
      <Button variant="primary" style="fill" size="xl" treatment="seaglass">
        <Plus size={24} weight="bold" />
        Label
        <ArrowRight size={24} weight="bold" />
      </Button>
      <Button variant="secondary" style="transparent" size="xl" treatment="seaglass">
        <Plus size={24} weight="bold" />
        Label
        <ArrowRight size={24} weight="bold" />
      </Button>
    </div>
  );
}

export function CheckboxUsageDemo() {
  return (
    <div className="flex flex-col gap-[12px]">
      <Checkbox>Default</Checkbox>
      <Checkbox defaultSelected>Checked</Checkbox>
      <Checkbox isIndeterminate>Indeterminate</Checkbox>
    </div>
  );
}

export function CheckboxStatesDemo() {
  return (
    <div className="flex flex-col gap-[12px]">
      <Checkbox>Off</Checkbox>
      <Checkbox defaultSelected>On</Checkbox>
      <Checkbox isIndeterminate>Indeterminate</Checkbox>
    </div>
  );
}

export function CheckboxDisabledDemo() {
  return (
    <div className="flex flex-col gap-[12px]">
      <Checkbox isDisabled>Off</Checkbox>
      <Checkbox defaultSelected isDisabled>
        On
      </Checkbox>
      <Checkbox isIndeterminate isDisabled>
        Indeterminate
      </Checkbox>
    </div>
  );
}

export function InputUsageDemo() {
  return (
    <div className="w-[320px]">
      <Input label="Email" placeholder="name@example.com" description="Helper text" />
    </div>
  );
}

export function InputExplorationDemo() {
  return (
    <div className="w-[320px]">
      <Input
        label="Label"
        labelSupplementary="(Optional)"
        isRequired
        labelIcon={<Info size={12} />}
        action="Action"
        placeholder="Placeholder"
        description="Helper text"
        startAddon={<MagnifyingGlass size={16} />}
        startContent={<CalendarBlank size={16} />}
        endContent={
          <span className="flex items-center gap-[4px]">
            <WarningCircle size={16} />
            <CaretDown size={16} />
          </span>
        }
        endAddon={<ArrowRight size={16} />}
      />
    </div>
  );
}

export function InputValidationDemo() {
  return (
    <div className="grid gap-[16px] md:grid-cols-2">
      <Input label="Required" placeholder="Enter value" isRequired description="Helper text" />
      <Input
        label="Invalid"
        placeholder="Enter value"
        isInvalid
        errorMessage="This field needs attention."
        endContent={<WarningCircle size={16} />}
      />
    </div>
  );
}

export function DividerUsageDemo() {
  return (
    <div className="w-[320px] rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
      <div className="space-y-[12px]">
        <div>
          <h3 className="type-body-sm-medium text-text-default-high-contrast">Applicant details</h3>
          <p className="type-caption-12-regular text-text-default-muted">
            Review the information before continuing.
          </p>
        </div>
        <Divider />
        <div className="space-y-[8px] type-body-sm-regular text-text-default-default">
          <p>Name: Aishath Mariyam</p>
          <p>Island: Male&apos;</p>
        </div>
      </div>
    </div>
  );
}

export function DividerVariantsDemo() {
  return (
    <div className="grid gap-[24px] lg:grid-cols-2">
      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-high-contrast">Horizontal divider</p>
          <div className="space-y-[10px] type-body-sm-regular text-text-default-default">
            <p>Passport number</p>
            <Divider />
            <p>National ID number</p>
            <Divider className="bg-border-default-high-contrast" />
            <p>Driving license number</p>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-high-contrast">Vertical divider</p>
          <div className="flex items-center gap-[12px] type-body-sm-regular text-text-default-default">
            <span>Overview</span>
            <Divider orientation="vertical" />
            <span>Documents</span>
            <Divider orientation="vertical" className="bg-border-default-high-contrast" />
            <span>History</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const COUNTRY_OPTIONS = [
  { id: 'mv', name: 'Maldives' },
  { id: 'lk', name: 'Sri Lanka' },
  { id: 'sg', name: 'Singapore' },
  { id: 'my', name: 'Malaysia' },
  { id: 'ae', name: 'United Arab Emirates' },
];

export function ComboBoxUsageDemo() {
  return (
    <div className="w-[320px]">
      <ComboBox
        label="Country"
        description="Start typing to filter options."
        defaultItems={COUNTRY_OPTIONS}
      >
        {(item) => <ComboBoxItem>{item.name}</ComboBoxItem>}
      </ComboBox>
    </div>
  );
}

export function ComboBoxExplorationDemo() {
  return (
    <div className="w-[320px]">
      <ComboBox
        label="Location"
        labelSupplementary="(Optional)"
        action="Browse"
        labelIcon={<Info size={12} />}
        description="Choose a service location or enter a custom value."
        placeholder="Search location"
        allowsCustomValue
        startAddon={<MagnifyingGlass size={16} />}
        startContent={<CalendarBlank size={16} />}
        endContent={<WarningCircle size={16} />}
      >
        <ComboBoxSection title="Popular">
          <ComboBoxItem id="male">
            <span className="inline-flex min-w-0 items-center gap-[6px]">
              <span aria-hidden="true" className="type-caption-12-medium text-text-default-subtle">
                MLE
              </span>
              <span>Male'</span>
            </span>
          </ComboBoxItem>
          <ComboBoxItem id="hulhumale">Hulhumale'</ComboBoxItem>
          <ComboBoxItem id="addu">Addu City</ComboBoxItem>
        </ComboBoxSection>
        <ComboBoxSection title="Regional">
          <ComboBoxItem id="fuvahmulah">Fuvahmulah City</ComboBoxItem>
          <ComboBoxItem id="kulhudhuffushi">Kulhudhuffushi City</ComboBoxItem>
        </ComboBoxSection>
      </ComboBox>
    </div>
  );
}

export function ComboBoxValidationDemo() {
  return (
    <div className="grid gap-[16px] md:grid-cols-2">
      <ComboBox
        label="Default"
        description="Helper text"
        placeholder="Choose a country"
        defaultItems={COUNTRY_OPTIONS}
      >
        {(item) => <ComboBoxItem>{item.name}</ComboBoxItem>}
      </ComboBox>
      <ComboBox
        label="Invalid"
        isInvalid
        errorMessage="Select a supported option."
        placeholder="Choose a country"
        defaultItems={COUNTRY_OPTIONS}
      >
        {(item) => <ComboBoxItem>{item.name}</ComboBoxItem>}
      </ComboBox>
    </div>
  );
}

export function SelectUsageDemo() {
  return (
    <div className="w-[320px]">
      <Select label="Country" placeholder="Choose a country" description="Helper text">
        <SelectItem id="my">Malaysia</SelectItem>
        <SelectItem id="sg">Singapore</SelectItem>
        <SelectItem id="th">Thailand</SelectItem>
      </Select>
    </div>
  );
}

export function SelectExplorationDemo() {
  return (
    <div className="w-[320px]">
      <Select
        label="Market"
        labelSupplementary="(Optional)"
        labelIcon={<Info size={12} />}
        action="Action"
        placeholder="Choose a market"
        description="Helper text"
        startContent={<MagnifyingGlass size={16} />}
        endContent={<WarningCircle size={16} />}
      >
        <SelectSection title="ASEAN">
          <SelectItem id="my" description="Bursa-linked products">
            <span className="inline-flex min-w-0 items-center gap-[6px]">
              <span aria-hidden="true" className="type-caption-12-medium text-text-default-subtle">
                MY
              </span>
              <span>Malaysia</span>
            </span>
          </SelectItem>
          <SelectItem id="sg" description="SGX-linked products">
            Singapore
          </SelectItem>
        </SelectSection>
        <SelectSection title="North Asia">
          <SelectItem id="jp">Japan</SelectItem>
          <SelectItem id="hk">Hong Kong</SelectItem>
        </SelectSection>
      </Select>
    </div>
  );
}

export function SelectValidationDemo() {
  return (
    <div className="grid gap-[16px] md:grid-cols-2">
      <Select label="Required" placeholder="Select an option" isRequired description="Helper text">
        <SelectItem id="cash">Cash</SelectItem>
        <SelectItem id="margin">Margin</SelectItem>
      </Select>
      <Select
        label="Invalid"
        placeholder="Select an option"
        isInvalid
        errorMessage="Please choose a valid option."
      >
        <SelectItem id="active">Active</SelectItem>
        <SelectItem id="inactive">Inactive</SelectItem>
      </Select>
    </div>
  );
}

export function LinkUsageDemo() {
  return <Link href="#">Link Label</Link>;
}

export function LinkVariantsDemo() {
  return (
    <div className="grid grid-cols-4 gap-x-8 gap-y-6 items-center min-w-[500px]">
      <div />
      <div className="text-xs font-bold uppercase text-text-default-muted text-center">Plain</div>
      <div className="text-xs font-bold uppercase text-text-default-muted text-center">
        Hover Underline
      </div>
      <div className="text-xs font-bold uppercase text-text-default-muted text-center">
        Always Underline
      </div>

      <div className="text-sm font-medium">Primary</div>
      <div className="flex justify-center">
        <Link variant="primary" underline="none">
          Link
        </Link>
      </div>
      <div className="flex justify-center">
        <Link variant="primary" underline="hover">
          Link
        </Link>
      </div>
      <div className="flex justify-center">
        <Link variant="primary" underline="always">
          Link
        </Link>
      </div>

      <div className="text-sm font-medium">Secondary</div>
      <div className="flex justify-center">
        <Link variant="secondary" underline="none">
          Link
        </Link>
      </div>
      <div className="flex justify-center">
        <Link variant="secondary" underline="hover">
          Link
        </Link>
      </div>
      <div className="flex justify-center">
        <Link variant="secondary" underline="always">
          Link
        </Link>
      </div>

      <div className="text-sm font-medium p-2 rounded">Inverted</div>
      <div className="flex justify-center bg-slate-900 p-2 rounded">
        <Link variant="inverted" underline="none">
          Link
        </Link>
      </div>
      <div className="flex justify-center bg-slate-900 p-2 rounded">
        <Link variant="inverted" underline="hover">
          Link
        </Link>
      </div>
      <div className="flex justify-center bg-slate-900 p-2 rounded">
        <Link variant="inverted" underline="always">
          Link
        </Link>
      </div>
    </div>
  );
}

export function LinkIconsDemo() {
  return (
    <div className="flex gap-8 flex-wrap items-center">
      <span className="type-subtitle-regular">
        <Link>
          <Plus size={20} weight="bold" />
          Large Link
        </Link>
      </span>
      <span className="type-body-lg-regular">
        <Link variant="secondary">
          <DownloadSimple size={18} weight="bold" />
          LG Link
        </Link>
      </span>
      <span className="type-body-md-regular">
        <Link>
          MD Link
          <ArrowRight size={16} weight="bold" />
        </Link>
      </span>
      <span className="type-caption-12-regular">
        <Link>
          <ArrowRight size={12} weight="bold" />
          XS Link
        </Link>
      </span>
    </div>
  );
}

export function LinkSizesDemo() {
  return (
    <div className="flex gap-6 items-center flex-wrap">
      <span className="type-caption-12-regular">
        <Link>Extra Small</Link>
      </span>
      <span className="type-body-sm-regular">
        <Link>Small</Link>
      </span>
      <span className="type-body-md-regular">
        <Link>Medium</Link>
      </span>
      <span className="type-body-lg-regular">
        <Link>Large</Link>
      </span>
      <span className="type-subtitle-regular">
        <Link>Extra Large</Link>
      </span>
    </div>
  );
}

export function RadioUsageDemo() {
  return (
    <RadioGroup aria-label="Example radio group" defaultValue="a">
      <Radio value="a">Option A</Radio>
      <Radio value="b">Option B</Radio>
      <Radio value="c">Option C</Radio>
    </RadioGroup>
  );
}

export function RadioSizesDemo() {
  return (
    <div className="flex flex-col gap-[16px]">
      <RadioGroup aria-label="Small radios" defaultValue="sm-on">
        <Radio value="sm-off" size="sm">
          Small Off
        </Radio>
        <Radio value="sm-on" size="sm">
          Small On
        </Radio>
      </RadioGroup>

      <RadioGroup aria-label="Medium radios" defaultValue="md-on">
        <Radio value="md-off" size="md">
          Medium Off
        </Radio>
        <Radio value="md-on" size="md">
          Medium On
        </Radio>
      </RadioGroup>
    </div>
  );
}

export function RadioDisabledDemo() {
  return (
    <RadioGroup aria-label="Disabled radios" defaultValue="on-disabled">
      <Radio value="off-disabled" isDisabled>
        Disabled Off
      </Radio>
      <Radio value="on-disabled" isDisabled>
        Disabled On
      </Radio>
    </RadioGroup>
  );
}
