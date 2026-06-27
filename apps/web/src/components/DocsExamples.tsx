import { useState } from 'react';
import { Accordion } from '@tradenetcorp/veli-ui/accordion';
import { Avatar } from '@tradenetcorp/veli-ui/avatar';
import { Badge } from '@tradenetcorp/veli-ui/badge';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Breadcrumb, Breadcrumbs } from '@tradenetcorp/veli-ui/breadcrumbs';
import { Checkbox } from '@tradenetcorp/veli-ui/checkbox';
import { ComboBox, ComboBoxItem, ComboBoxSection } from '@tradenetcorp/veli-ui/combobox';
import { Divider } from '@tradenetcorp/veli-ui/divider';
import { Input } from '@tradenetcorp/veli-ui/input';
import { Kbd, KbdGroup } from '@tradenetcorp/veli-ui/kbd';
import { Link } from '@tradenetcorp/veli-ui/link';
import {
  Menu,
  MenuItem,
  MenuPopover,
  MenuSeparator,
  MenuTrigger,
} from '@tradenetcorp/veli-ui/menu';
import { PageTab } from '@tradenetcorp/veli-ui/page-tab';
import { PasswordInput } from '@tradenetcorp/veli-ui/password-input';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { Radio, RadioGroup } from '@tradenetcorp/veli-ui/radio';
import { Search } from '@tradenetcorp/veli-ui/search';
import { Tabs } from '@tradenetcorp/veli-ui/tabs';
import { Tag, TagGroup } from '@tradenetcorp/veli-ui/tags';
import { TextArea } from '@tradenetcorp/veli-ui/textarea';
import { Tooltip, TooltipTrigger } from '@tradenetcorp/veli-ui/tooltip';
import { Select, SelectItem, SelectSection } from '@tradenetcorp/veli-ui/select';
import { Card } from '@tradenetcorp/veli-ui/card';
import {
  ArrowRight,
  Bell,
  CalendarBlank,
  CaretLeft,
  CaretDown,
  DownloadSimple,
  Info,
  MagnifyingGlass,
  PencilSimple,
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

const inputExplorationStartAddon = <MagnifyingGlass size={16} />;
const inputExplorationEndAddon = <ArrowRight size={16} />;
const comboBoxExplorationStartAddon = <MagnifyingGlass size={16} />;

const radioDocsText = {
  en: {
    optionA: 'Option A',
    optionB: 'Option B',
    optionC: 'Option C',
    mediumOff: 'Medium Off',
    mediumOn: 'Medium On',
    largeOff: 'Large Off',
    largeOn: 'Large On',
    disabledOff: 'Disabled Off',
    disabledOn: 'Disabled On',
  },
  dv: {
    optionA: 'އޮޕްޝަން އޭ',
    optionB: 'އޮޕްޝަން ބީ',
    optionC: 'އޮޕްޝަން ސީ',
    mediumOff: 'މެދު އޮފް',
    mediumOn: 'މެދު އޮން',
    largeOff: 'ބޮޑު އޮފް',
    largeOn: 'ބޮޑު އޮން',
    disabledOff: 'ބޭނުންނުކުރެވޭ އޮފް',
    disabledOn: 'ބޭނުންނުކުރެވޭ އޮން',
  },
} as const;

const useRadioDocsText = () => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? radioDocsText.dv : radioDocsText.en;
};

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
          <p className="type-body-sm-medium text-text-default-emphasis">Static breadcrumb trail</p>
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
          <p className="type-body-sm-medium text-text-default-emphasis">Back link treatment</p>
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
          <p className="type-body-sm-medium text-text-default-emphasis">
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

      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-emphasis">Removable tags</p>
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
          <p className="type-body-sm-medium text-text-default-emphasis">Link tags</p>
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

      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
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
}

export function ButtonVariantsDemo() {
  return (
    <div className="grid grid-cols-4 gap-x-8 gap-y-6 items-center min-w-[500px]">
      <div />
      <div className="text-xs font-bold uppercase text-text-default-muted">Fill</div>
      <div className="text-xs font-bold uppercase text-text-default-muted">Transparent</div>
      <div className="text-xs font-bold uppercase text-text-default-muted">Ghost</div>

      <div className="text-sm font-medium">Primary</div>
      <Button intent="primary" appearance="fill">
        Button
      </Button>
      <Button intent="primary" appearance="transparent">
        Button
      </Button>
      <Button intent="primary" appearance="ghost">
        Button
      </Button>

      <div className="text-sm font-medium">Secondary</div>
      <Button intent="secondary" appearance="fill">
        Button
      </Button>
      <Button intent="secondary" appearance="transparent">
        Button
      </Button>
      <Button intent="secondary" appearance="ghost">
        Button
      </Button>

      <div className="text-sm font-medium">Danger</div>
      <Button intent="danger" appearance="fill">
        Button
      </Button>
      <Button intent="danger" appearance="transparent">
        Button
      </Button>
      <Button intent="danger" appearance="ghost">
        Button
      </Button>
    </div>
  );
}

export function ButtonIconsDemo() {
  return (
    <div className="flex gap-4 flex-wrap items-center">
      <Button size="xl">
        <Plus size={20} weight="bold" />
        XL Button
      </Button>
      <Button size="lg" intent="secondary" appearance="transparent">
        <DownloadSimple size={20} weight="bold" />
        LG Button
      </Button>
      <Button size="md" intent="danger" appearance="ghost">
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
      <Button
        size="lg"
        intent="secondary"
        appearance="transparent"
        iconOnly
        aria-label="Download file"
      >
        <DownloadSimple size={20} weight="bold" />
      </Button>
      <Button size="md" intent="danger" appearance="ghost" iconOnly aria-label="Delete item">
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
      <Button intent="primary" appearance="fill" size="xl" seaglass>
        <Plus size={20} weight="bold" />
        Label
        <ArrowRight size={20} weight="bold" />
      </Button>
      <Button intent="secondary" appearance="transparent" size="xl" seaglass>
        <Plus size={20} weight="bold" />
        Label
        <ArrowRight size={20} weight="bold" />
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
        startAddon={inputExplorationStartAddon}
        startContent={<CalendarBlank size={16} />}
        endContent={
          <span className="flex items-center gap-[4px]">
            <WarningCircle size={16} />
            <CaretDown size={16} />
          </span>
        }
        endAddon={inputExplorationEndAddon}
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
          <h3 className="type-body-sm-medium text-text-default-emphasis">Applicant details</h3>
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
          <p className="type-body-sm-medium text-text-default-emphasis">Horizontal divider</p>
          <div className="space-y-[10px] type-body-sm-regular text-text-default-default">
            <p>Passport number</p>
            <Divider />
            <p>National ID number</p>
            <Divider className="bg-border-default-emphasis" />
            <p>Driving license number</p>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-emphasis">Vertical divider</p>
          <div className="flex items-center gap-[12px] type-body-sm-regular text-text-default-default">
            <span>Overview</span>
            <Divider orientation="vertical" />
            <span>Documents</span>
            <Divider orientation="vertical" className="bg-border-default-emphasis" />
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
        infoTooltip="Use this combobox to search and choose a matching option."
        infoTooltipAriaLabel="More information"
        action="Browse"
        description="Choose a service location or enter a custom value."
        placeholder="Search location"
        allowsCustomValue
        startAddon={comboBoxExplorationStartAddon}
        startContent={<CalendarBlank size={16} />}
        endContent={<WarningCircle size={16} />}
      >
        <ComboBoxSection title="Popular">
          <ComboBoxItem id="male">
            <span className="inline-flex min-w-0 items-center gap-[6px]">
              <span aria-hidden="true" className="type-caption-medium text-text-default-subtle">
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
        infoTooltip="Use this select to choose the requested market."
        infoTooltipAriaLabel="More information"
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

      <div className="text-sm font-medium">Default</div>
      <div className="flex justify-center">
        <Link intent="default" underline="none">
          Link
        </Link>
      </div>
      <div className="flex justify-center">
        <Link intent="default" underline="hover">
          Link
        </Link>
      </div>
      <div className="flex justify-center">
        <Link intent="default" underline="always">
          Link
        </Link>
      </div>

      <div className="text-sm font-medium">Secondary</div>
      <div className="flex justify-center">
        <Link intent="secondary" underline="none">
          Link
        </Link>
      </div>
      <div className="flex justify-center">
        <Link intent="secondary" underline="hover">
          Link
        </Link>
      </div>
      <div className="flex justify-center">
        <Link intent="secondary" underline="always">
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
        <Link intent="secondary">
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
  const text = useRadioDocsText();

  return (
    <RadioGroup aria-label="Example radio group" defaultValue="a">
      <Radio value="a">{text.optionA}</Radio>
      <Radio value="b">{text.optionB}</Radio>
      <Radio value="c">{text.optionC}</Radio>
    </RadioGroup>
  );
}

export function RadioSizesDemo() {
  const text = useRadioDocsText();

  return (
    <div className="flex flex-col gap-[16px]">
      <RadioGroup aria-label="Medium radios" defaultValue="md-on">
        <Radio value="md-off" size="md">
          {text.mediumOff}
        </Radio>
        <Radio value="md-on" size="md">
          {text.mediumOn}
        </Radio>
      </RadioGroup>

      <RadioGroup aria-label="Large radios" defaultValue="lg-on">
        <Radio value="lg-off" size="lg">
          {text.largeOff}
        </Radio>
        <Radio value="lg-on" size="lg">
          {text.largeOn}
        </Radio>
      </RadioGroup>
    </div>
  );
}

export function RadioDisabledDemo() {
  const text = useRadioDocsText();

  return (
    <RadioGroup aria-label="Disabled radios" defaultValue="on-disabled">
      <Radio value="off-disabled" isDisabled>
        {text.disabledOff}
      </Radio>
      <Radio value="on-disabled" isDisabled>
        {text.disabledOn}
      </Radio>
    </RadioGroup>
  );
}

export function AvatarUsageDemo() {
  return (
    <div className="flex flex-wrap items-center gap-[16px]">
      <Avatar type="initials" initials="Aishath Mariyam" appearance="blue" size="52" />
      <Avatar type="initials" initials="Ibrahim Naseer" appearance="indigo" size="52" />
      <Avatar type="icon" appearance="neutral" size="52" />
      <Avatar type="agencyIcon" appearance="successGreen" size="52" />
    </div>
  );
}

export function AvatarVariantsDemo() {
  const appearances = ['blue', 'neutral', 'successGreen', 'yellow', 'orange', 'pink'] as const;
  const sizes = ['60', '52', '44', '36', '28'] as const;

  return (
    <div className="grid gap-[24px] lg:grid-cols-2">
      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-emphasis">Appearances</p>
          <div className="flex flex-wrap items-center gap-[12px]">
            {appearances.map((appearance) => (
              <Avatar key={appearance} type="initials" initials="MV" appearance={appearance} />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-emphasis">Sizes</p>
          <div className="flex flex-wrap items-end gap-[12px]">
            {sizes.map((size) => (
              <Avatar key={size} type="icon" appearance="blue" size={size} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BadgeUsageDemo() {
  return (
    <div className="flex flex-wrap items-center gap-[12px]">
      <Badge intent="info">Info</Badge>
      <Badge intent="positive" appearance="subtle">
        Approved
      </Badge>
      <Badge intent="warning" appearance="outline">
        Pending
      </Badge>
      <Badge intent="danger" leadingIcon={<WarningCircle size={12} weight="bold" />}>
        Rejected
      </Badge>
    </div>
  );
}

export function BadgeVariantsDemo() {
  const intents = ['neutral', 'info', 'positive', 'cautious', 'warning', 'danger'] as const;

  return (
    <div className="grid gap-[24px] lg:grid-cols-2">
      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-emphasis">Appearances</p>
          <div className="space-y-[10px]">
            {(['emphasis', 'subtle', 'outline'] as const).map((appearance) => (
              <div key={appearance} className="flex flex-wrap items-center gap-[8px]">
                {intents.map((intent) => (
                  <Badge key={intent} appearance={appearance} intent={intent}>
                    {intent}
                  </Badge>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-emphasis">Counter mode</p>
          <div className="flex flex-wrap items-center gap-[16px]">
            <span className="inline-flex items-center gap-[6px] type-body-sm-regular text-text-default-default">
              <Bell size={18} />
              <Badge intent="danger" counter count={5} />
            </span>
            <Badge intent="info" counter count={42} />
            <Badge intent="neutral" counter count={128} max={99} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function KbdUsageDemo() {
  return (
    <div className="flex flex-wrap items-center gap-[16px]">
      <KbdGroup aria-label="Command K">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
      <KbdGroup aria-label="Control Shift P">
        <Kbd>Ctrl</Kbd>
        <Kbd>Shift</Kbd>
        <Kbd>P</Kbd>
      </KbdGroup>
      <Kbd>Esc</Kbd>
    </div>
  );
}

export function KbdVariantsDemo() {
  return (
    <div className="grid gap-[24px] lg:grid-cols-2">
      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-emphasis">Default</p>
          <KbdGroup aria-label="Command Enter">
            <Kbd>⌘</Kbd>
            <Kbd>Enter</Kbd>
          </KbdGroup>
        </div>
      </div>

      <div
        className="rounded-[16px] border border-white/10 p-[16px]"
        style={{ background: '#1c1d22' }}
      >
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-white">Inverted</p>
          <KbdGroup variant="inverted" aria-label="Command Enter">
            <Kbd>⌘</Kbd>
            <Kbd>Enter</Kbd>
          </KbdGroup>
        </div>
      </div>
    </div>
  );
}

export function SearchUsageDemo() {
  return (
    <div className="w-[320px]">
      <Search aria-label="Search services" placeholder="Search services" />
    </div>
  );
}

export function SearchVariantsDemo() {
  return (
    <div className="grid w-full max-w-[360px] gap-[16px]">
      <Search aria-label="Default search" placeholder="Default" />
      <Search aria-label="Outline search" variant="outline" placeholder="Outline" />
      <Search aria-label="Small search" size="sm" placeholder="Small" />
      <Search aria-label="Large search" size="lg" placeholder="Large" />
    </div>
  );
}

export function TextAreaUsageDemo() {
  return (
    <div className="w-[360px]">
      <TextArea
        label="Message"
        placeholder="Tell us how we can help"
        description="Helper text"
        showCharacterCounter
        maxLength={280}
      />
    </div>
  );
}

export function TextAreaVariantsDemo() {
  return (
    <div className="grid gap-[16px] md:grid-cols-2">
      <TextArea
        label="Resizable"
        placeholder="Drag the handle to resize"
        isResizable
        description="Helper text"
      />
      <TextArea
        label="Invalid"
        placeholder="Enter details"
        isInvalid
        errorMessage="This field needs attention."
      />
    </div>
  );
}

export function PasswordInputUsageDemo() {
  return (
    <div className="w-[360px]">
      <PasswordInput
        label="Password"
        placeholder="Enter a password"
        description="Use at least 8 characters."
      />
    </div>
  );
}

export function PasswordInputRequirementsDemo() {
  return (
    <div className="w-[360px]">
      <PasswordInput
        label="Create password"
        placeholder="Enter a password"
        requirements
        showRequirementsWhenEmpty
      />
    </div>
  );
}

const ACCORDION_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
    content:
      'Veli connects shared tokens, accessible components, and service requirements into one design language.',
  },
  {
    id: 'documents',
    label: 'Required documents',
    content: 'Upload a valid ID, proof of address, and any service-specific forms.',
  },
  {
    id: 'history',
    label: 'Submission history',
    content: 'Track previous applications and their current status.',
  },
] as const;

export function AccordionUsageDemo() {
  return (
    <div className="w-full max-w-[480px]">
      <Accordion defaultExpandedKeys={['overview']} items={ACCORDION_ITEMS} />
    </div>
  );
}

export function AccordionVariantsDemo() {
  return (
    <div className="grid gap-[24px] lg:grid-cols-2">
      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-emphasis">Single expanded</p>
          <Accordion defaultExpandedKeys={['overview']} items={ACCORDION_ITEMS} />
        </div>
      </div>

      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-emphasis">Multiple expanded</p>
          <Accordion
            allowsMultipleExpanded
            defaultExpandedKeys={['overview', 'documents']}
            items={ACCORDION_ITEMS}
          />
        </div>
      </div>
    </div>
  );
}

export function MenuUsageDemo() {
  return (
    <MenuTrigger>
      <Button intent="secondary" appearance="transparent">
        Actions
        <CaretDown size={16} />
      </Button>
      <MenuPopover>
        <Menu>
          <MenuItem startIcon={<PencilSimple size={16} />}>Edit</MenuItem>
          <MenuItem startIcon={<DownloadSimple size={16} />} shortcut="⌘E">
            Export
          </MenuItem>
          <MenuSeparator />
          <MenuItem intent="danger" startIcon={<Trash size={16} />}>
            Delete
          </MenuItem>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  );
}

export function MenuVariantsDemo() {
  return (
    <MenuTrigger>
      <Button intent="secondary" appearance="transparent">
        Open menu
        <CaretDown size={16} />
      </Button>
      <MenuPopover>
        <Menu>
          <MenuItem
            startIcon={<PencilSimple size={16} />}
            description="Update labels, metadata, and visibility."
          >
            Edit details
          </MenuItem>
          <MenuItem
            startIcon={<DownloadSimple size={16} />}
            description="Create a local copy for offline work."
          >
            Download
          </MenuItem>
          <MenuSeparator />
          <MenuItem
            intent="danger"
            startIcon={<Trash size={16} />}
            description="This action is permanent."
          >
            Remove file
          </MenuItem>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  );
}

const TAB_ITEMS = [
  { id: 'overview', label: 'Overview', panel: 'Summary of the service and what it offers.' },
  { id: 'services', label: 'Services', panel: 'The list of services available under this agency.' },
  { id: 'pricing', label: 'Pricing', panel: 'Fees, schedules, and payment options.' },
] as const;

export function TabsUsageDemo() {
  return (
    <div className="w-full max-w-[520px]">
      <Tabs listAriaLabel="Service sections" items={TAB_ITEMS} />
    </div>
  );
}

export function PageTabUsageDemo() {
  return (
    <div className="w-full max-w-[520px]">
      <PageTab listAriaLabel="Service sections" items={TAB_ITEMS} />
    </div>
  );
}

export function PageTabCenteredDemo() {
  return (
    <div className="w-full max-w-[520px]">
      <PageTab listAriaLabel="Service sections" items={TAB_ITEMS} isCentered />
    </div>
  );
}

export function TooltipUsageDemo() {
  return (
    <TooltipTrigger delay={0}>
      <Button intent="secondary">Hover or focus me</Button>
      <Tooltip>Short help text for this action.</Tooltip>
    </TooltipTrigger>
  );
}

export function TooltipVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-[16px]">
      <TooltipTrigger delay={0}>
        <Button intent="secondary" size="sm">
          Small
        </Button>
        <Tooltip size="sm">Small tooltip.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0}>
        <Button intent="secondary">Large — Primary</Button>
        <Tooltip size="lg" tone="primary">
          A tooltip with a caret and a max width. Tooltips must not contain interactive content.
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0}>
        <Button intent="secondary">Large — Secondary</Button>
        <Tooltip size="lg" tone="secondary">
          A tooltip with a caret and a max width. Tooltips must not contain interactive content.
        </Tooltip>
      </TooltipTrigger>
    </div>
  );
}

export function CardUsageDemo() {
  return (
    <Card className="w-full max-w-md">
      <Card.Header>
        <Card.Title>Permit application</Card.Title>
        <Card.Description>Track progress and required documents.</Card.Description>
      </Card.Header>
      <Card.Content>
        Your application is under review. We will notify you when a decision is ready.
      </Card.Content>
      <Card.Footer>
        <Button intent="secondary" appearance="transparent" size="sm">
          View details
        </Button>
        <Button size="sm">Continue</Button>
      </Card.Footer>
    </Card>
  );
}

export function CardVariantsDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card elevation="none" padding="sm">
        <Card.Header>
          <Card.Title>Border only</Card.Title>
        </Card.Header>
        <Card.Content>No shadow elevation.</Card.Content>
      </Card>
      <Card elevation="lg" padding="sm" interactive>
        <Card.Header>
          <Card.Title>Interactive</Card.Title>
        </Card.Header>
        <Card.Content>Hover for surface feedback.</Card.Content>
      </Card>
    </div>
  );
}
