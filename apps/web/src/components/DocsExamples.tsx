import { useMemo, useState } from 'react';
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
import { Skeleton } from '@tradenetcorp/veli-ui/skeleton';
import { Tabs } from '@tradenetcorp/veli-ui/tabs';
import { Tag, TagGroup } from '@tradenetcorp/veli-ui/tags';
import { TextArea } from '@tradenetcorp/veli-ui/textarea';
import { Tooltip, TooltipTrigger } from '@tradenetcorp/veli-ui/tooltip';
import { Alert } from '@tradenetcorp/veli-ui/alert';
import { Card } from '@tradenetcorp/veli-ui/card';
import { Select, SelectItem, SelectSection } from '@tradenetcorp/veli-ui/select';
import { createToastQueue, ToastRegion, type VeliToastContent } from '@tradenetcorp/veli-ui/toast';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@tradenetcorp/veli-ui/table';
import { Pagination } from '@tradenetcorp/veli-ui/pagination';
import {
  Dropzone,
  DropzoneArea,
  DropzoneItem,
  DropzoneItemDelete,
  DropzoneItemMetadata,
  DropzoneItemPreview,
  DropzoneList,
  useDropzone,
} from '@tradenetcorp/veli-ui/dropzone';
import {
  ArrowRight,
  Bell,
  CalendarBlank,
  CaretLeft,
  CaretDown,
  CheckCircle,
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

const tagsStoryPanelClassName = 'rounded-2xl border border-base-subtle bg-surface-raised p-4';

const tagsStorySectionClassName = 'space-y-3';

const tagsEmptyStateClassName =
  'rounded-xl border border-dashed border-base-subtle px-3 py-2.5 type-body-sm-regular text-base-subtle';

const tagsDocsText = {
  en: {
    categories: 'Categories',
    news: 'News',
    travel: 'Travel',
    gaming: 'Gaming',
    shopping: 'Shopping',
    selectableTags: 'Selectable tags',
    departments: 'Departments',
    chooseDepartments: 'Choose one or more departments.',
    tourism: 'Tourism',
    fisheries: 'Fisheries',
    transport: 'Transport',
    education: 'Education',
    removableTags: 'Removable tags',
    savedTopics: 'Saved topics',
    allSavedTopicsRemoved: 'All saved topics have been removed.',
    documents: 'Documents',
    forms: 'Forms',
    payments: 'Payments',
    support: 'Support',
    linkTags: 'Link tags',
    relatedGuidance: 'Related guidance',
    passportServices: 'Passport services',
    licensingPortal: 'Licensing portal',
    onlinePayments: 'Online payments',
    disabledKeys: 'Disabled keys',
    amenities: 'Amenities',
    laundry: 'Laundry',
    parking: 'Parking',
    breakfast: 'Breakfast',
    wifi: 'Wi-Fi',
    disabledGroup: 'Disabled group',
    restrictedServices: 'Restricted services',
    appointments: 'Appointments',
  },
  dv: {
    categories: 'ކެޓަގަރީތައް',
    news: 'ޚަބަރު',
    travel: 'ދަތުރުފަތުރު',
    gaming: 'ގޭމިންގ',
    shopping: 'ވިޔަފާރިކުރުން',
    selectableTags: 'ޚިޔާރުކުރެވޭ ޓެގްތައް',
    departments: 'ޑިޕާޓްމަންޓްތައް',
    chooseDepartments: 'އެއް ޑިޕާޓްމަންޓް ނުވަތަ އެއަށްވުރެ ގިނަ ޑިޕާޓްމަންޓް ޚިޔާރުކުރައްވާ.',
    tourism: 'ފަތުރުވެރިކަން',
    fisheries: 'މަސްވެރިކަން',
    transport: 'ޓްރާންސްޕޯޓް',
    education: 'ތަޢުލީމު',
    removableTags: 'އުނިކުރެވޭ ޓެގްތައް',
    savedTopics: 'ސޭވްކުރެވިފައިވާ މައުޟޫޢުތައް',
    allSavedTopicsRemoved: 'ސޭވްކުރެވިފައިވާ ހުރިހާ މައުޟޫޢުތަކެއް ވަނީ އުނިކުރެވިފަ.',
    documents: 'ލިޔެކިޔުންތައް',
    forms: 'ފޯމުތައް',
    payments: 'ފައިސާދެއްކުން',
    support: 'ސަޕޯޓް',
    linkTags: 'ލިންކް ޓެގްތައް',
    relatedGuidance: 'ގުޅޭ އިރުޝާދު',
    passportServices: 'ޕާސްޕޯޓްގެ ޚިދުމަތްތައް',
    licensingPortal: 'ލައިސަންސް ޕޯޓަލް',
    onlinePayments: 'އޮންލައިން ފައިސާދެއްކުން',
    disabledKeys: 'ޑިސޭބަލް ކުރެވިފައިވާ ކީތައް',
    amenities: 'ވަސީލަތްތައް',
    laundry: 'ލޯންޑްރީ',
    parking: 'ޕާކިންގ',
    breakfast: 'ހެނދުނުގެ ސައި',
    wifi: 'ވައި-ފައި',
    disabledGroup: 'ޑިސޭބަލް ކުރެވިފައިވާ ގްރޫޕް',
    restrictedServices: 'ހިފެހެއްޓިފައިވާ ޚިދުމަތްތައް',
    appointments: 'އެޕޮއިންޓްމަންޓްތައް',
  },
} as const;

type TagsDocsText = { [Key in keyof (typeof tagsDocsText)['en']]: string };

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

const useTagsDocsText = () => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? tagsDocsText.dv : tagsDocsText.en;
};

function getTagsDocsRemovableSeed(text: TagsDocsText): TagDemoItem[] {
  return [
    { id: 'documents', label: text.documents },
    { id: 'forms', label: text.forms },
    { id: 'payments', label: text.payments },
    { id: 'support', label: text.support },
  ];
}

function addRemovedTagKeys(currentKeys: Set<string>, keys: Iterable<string | number>) {
  const nextKeys = new Set(currentKeys);

  for (const key of keys) {
    nextKeys.add(String(key));
  }

  return nextKeys;
}

const cardDocsText = {
  en: {
    permitApplication: 'Permit application',
    requiredDocuments: 'Track progress and required documents.',
    reviewMessage: 'Your application is under review. We will notify you when a decision is ready.',
    viewDetails: 'View details',
    continue: 'Continue',
    borderOnly: 'Border only',
    noShadowElevation: 'No shadow elevation.',
    interactive: 'Interactive',
    hoverFeedback: 'Hover for surface feedback.',
  },
  dv: {
    permitApplication: 'ހުއްދައަށް އެދޭ އެޕްލިކޭޝަން',
    requiredDocuments: 'ޕްރޮގްރެސް އާއި ބޭނުންވާ ލިޔެކިޔުންތައް ޓްރެކްކުރައްވާ.',
    reviewMessage: 'ތިޔަ އެޕްލިކޭޝަން ދަނީ ރިވިއުކުރެވެމުންނެވެ. ގޮތެއް ނިމުމުން އަންގާނަން.',
    viewDetails: 'ތަފްސީލު ބައްލަވާ',
    continue: 'ކުރިއަށްގެންދަވާ',
    borderOnly: 'ހަމައެކަނި ބޯޑަރު',
    noShadowElevation: 'އެއްވެސް ޝެޑޯ އެލިވޭޝަނެއް ނެތް.',
    interactive: 'އިންޓަރެކްޓިވް',
    hoverFeedback: 'ސަރފޭސް ފީޑްބެކް ހޯދުމަށް ހޯވަރ ކުރައްވާ.',
  },
} as const;

const useCardDocsText = () => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? cardDocsText.dv : cardDocsText.en;
};

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
      <div className="rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-base-emphasis">Static breadcrumb trail</p>
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

      <div className="rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-base-emphasis">Back link treatment</p>
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

      <div className="rounded-[16px] border border-base-subtle bg-surface-raised p-[16px] lg:col-span-2">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-base-emphasis">Data-driven breadcrumb trail</p>
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
          <p className="type-caption-12-regular text-base-muted">
            Activate an earlier crumb to collapse the trail to that level.
          </p>
        </div>
      </div>
    </div>
  );
}

export function TagsUsageDemo() {
  const text = useTagsDocsText();

  return (
    <TagGroup label={text.categories}>
      <Tag id="news">{text.news}</Tag>
      <Tag id="travel">{text.travel}</Tag>
      <Tag id="gaming">{text.gaming}</Tag>
      <Tag id="shopping">{text.shopping}</Tag>
    </TagGroup>
  );
}

export function TagsVariantsDemo() {
  const text = useTagsDocsText();
  const removableSeed = useMemo(() => getTagsDocsRemovableSeed(text), [text]);
  const [removedTagKeys, setRemovedTagKeys] = useState<Set<string>>(() => new Set());
  const removableItems = useMemo(
    () => removableSeed.filter((item) => !removedTagKeys.has(item.id)),
    [removableSeed, removedTagKeys],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={tagsStoryPanelClassName}>
        <div className={tagsStorySectionClassName}>
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

      <div className={tagsStoryPanelClassName}>
        <div className={tagsStorySectionClassName}>
          <p className="type-body-sm-medium text-base-emphasis">{text.removableTags}</p>
          <TagGroup<TagDemoItem>
            label={text.savedTopics}
            items={removableItems}
            onRemove={(keys) =>
              setRemovedTagKeys((currentKeys) => addRemovedTagKeys(currentKeys, keys))
            }
            renderEmptyState={() => (
              <div className={tagsEmptyStateClassName}>{text.allSavedTopicsRemoved}</div>
            )}
          >
            {(item) => (
              <Tag id={item.id} textValue={item.label}>
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full bg-button-primary"
                  />
                  <span className="min-w-0 truncate">{item.label}</span>
                </span>
              </Tag>
            )}
          </TagGroup>
        </div>
      </div>

      <div className={tagsStoryPanelClassName}>
        <div className={tagsStorySectionClassName}>
          <p className="type-body-sm-medium text-base-emphasis">{text.linkTags}</p>
          <TagGroup label={text.relatedGuidance}>
            <Tag id="passport" href="https://www.gov.mv" target="_blank" rel="noreferrer">
              {text.passportServices}
            </Tag>
            <Tag id="licensing" href="https://www.gov.mv" target="_blank" rel="noreferrer">
              {text.licensingPortal}
            </Tag>
            <Tag id="payments" href="https://www.gov.mv" target="_blank" rel="noreferrer">
              {text.onlinePayments}
            </Tag>
          </TagGroup>
        </div>
      </div>

      <div className={tagsStoryPanelClassName}>
        <div className={tagsStorySectionClassName}>
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

      <div className={tagsStoryPanelClassName}>
        <div className={tagsStorySectionClassName}>
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
}
export function ButtonVariantsDemo() {
  return (
    <div className="grid grid-cols-4 gap-x-8 gap-y-6 items-center min-w-[500px]">
      <div />
      <div className="text-xs font-bold uppercase text-base-muted">Fill</div>
      <div className="text-xs font-bold uppercase text-base-muted">Transparent</div>
      <div className="text-xs font-bold uppercase text-base-muted">Ghost</div>

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

      <div className="text-sm font-medium">Accent</div>
      <Button intent="accent" appearance="fill">
        Button
      </Button>
      <div className="text-xs text-base-muted">Fill only</div>
      <div className="text-xs text-base-muted">Fill only</div>
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
    <div className="w-[320px] rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
      <div className="space-y-[12px]">
        <div>
          <h3 className="type-body-sm-medium text-base-emphasis">Applicant details</h3>
          <p className="type-caption-12-regular text-base-muted">
            Review the information before continuing.
          </p>
        </div>
        <Divider />
        <div className="space-y-[8px] type-body-sm-regular text-base">
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
      <div className="rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-base-emphasis">Horizontal divider</p>
          <div className="space-y-[10px] type-body-sm-regular text-base">
            <p>Passport number</p>
            <Divider />
            <p>National ID number</p>
            <Divider className="bg-border-base-emphasis" />
            <p>Driving license number</p>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-base-emphasis">Vertical divider</p>
          <div className="flex items-center gap-[12px] type-body-sm-regular text-base">
            <span>Overview</span>
            <Divider orientation="vertical" />
            <span>Documents</span>
            <Divider orientation="vertical" className="bg-border-base-emphasis" />
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
              <span aria-hidden="true" className="type-caption-medium text-base-subtle">
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
              <span aria-hidden="true" className="type-caption-12-medium text-base-subtle">
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
      <div className="text-xs font-bold uppercase text-base-muted text-center">Plain</div>
      <div className="text-xs font-bold uppercase text-base-muted text-center">Hover Underline</div>
      <div className="text-xs font-bold uppercase text-base-muted text-center">
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
      <Avatar type="agencyIcon" appearance="emerald" size="52" />
      <Avatar
        type="image"
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80"
        alt="Aishath Mariyam"
        size="52"
      />
    </div>
  );
}

export function AvatarVariantsDemo() {
  const appearances = [
    'blue',
    'neutral',
    'emerald',
    'yellow',
    'orange',
    'magenta',
    'indigo',
    'teal',
    'green',
    'lime',
  ] as const;
  const sizes = ['60', '52', '44', '36', '28', '20', '16'] as const;

  return (
    <div className="grid gap-[24px] lg:grid-cols-2">
      <div className="rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-base-emphasis">Appearances</p>
          <div className="flex flex-wrap items-center gap-[12px]">
            {appearances.map((appearance) => (
              <Avatar key={appearance} type="initials" initials="MV" appearance={appearance} />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-base-emphasis">Sizes</p>
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
  const statusIntents = ['neutral', 'info', 'positive', 'cautious', 'warning', 'danger'] as const;
  const accentIntents = ['magenta', 'indigo', 'brand', 'green', 'lime'] as const;

  return (
    <div className="grid gap-[24px] lg:grid-cols-2">
      <div className="rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-base-emphasis">Status appearances</p>
          <div className="space-y-[10px]">
            {(['outline', 'subtle', 'emphasis'] as const).map((appearance) => (
              <div key={appearance} className="flex flex-wrap items-center gap-[8px]">
                {statusIntents.map((intent) => (
                  <Badge key={intent} appearance={appearance} intent={intent}>
                    {intent}
                  </Badge>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-base-emphasis">Accent intents</p>
          <div className="flex flex-wrap items-center gap-[8px]">
            {accentIntents.map((intent) => (
              <Badge key={intent} appearance="outline" intent={intent}>
                {intent}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-base-emphasis">Counter mode</p>
          <div className="flex flex-wrap items-center gap-[16px]">
            <Badge intent="info" counter count={42} size="sm" />
            <Badge intent="info" counter count={42} size="md" />
            <Badge intent="neutral" counter count={128} max={99} />
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-base-emphasis">Counter on icon</p>
          <div className="relative inline-flex">
            <Bell aria-hidden size={24} className="text-icon-base" />
            <Badge
              counter
              count={5}
              appearance="emphasis"
              intent="danger"
              size="sm"
              className="absolute -top-1 -end-1"
              aria-label="5 notifications"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BadgeSizesDemo() {
  return (
    <div className="flex flex-wrap items-end gap-[12px]">
      <Badge appearance="outline" intent="info" size="sm">
        sm
      </Badge>
      <Badge appearance="outline" intent="info" size="md">
        md
      </Badge>
    </div>
  );
}

export function BadgeStatusDotsDemo() {
  const intents = [
    'neutral',
    'info',
    'positive',
    'cautious',
    'warning',
    'danger',
    'magenta',
    'brand',
  ] as const;

  return (
    <div className="flex flex-wrap items-center gap-[10px]">
      {intents.map((intent) => (
        <Badge
          key={intent}
          appearance="emphasis"
          intent={intent}
          size="xs"
          aria-label={`${intent} status`}
        />
      ))}
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
      <div className="rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-base-emphasis">Default</p>
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

export function SkeletonUsageDemo() {
  return (
    <div aria-busy="true" aria-label="Loading content" className="w-[320px] space-y-3">
      <Skeleton className="h-5 w-2/5 rounded-sm" />
      <div className="space-y-2">
        <Skeleton className="h-2.5 w-full rounded-xs" />
        <Skeleton className="h-2.5 w-full rounded-xs" />
        <Skeleton className="h-2.5 w-4/5 rounded-xs" />
      </div>
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
      <div className="rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-base-emphasis">Single expanded</p>
          <Accordion defaultExpandedKeys={['overview']} items={ACCORDION_ITEMS} />
        </div>
      </div>

      <div className="rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-base-emphasis">Multiple expanded</p>
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
  const text = useCardDocsText();

  return (
    <Card className="w-full max-w-md">
      <Card.Header>
        <Card.Title>{text.permitApplication}</Card.Title>
        <Card.Description>{text.requiredDocuments}</Card.Description>
      </Card.Header>
      <Card.Content>{text.reviewMessage}</Card.Content>
      <Card.Footer>
        <Button intent="secondary" appearance="transparent" size="sm">
          {text.viewDetails}
        </Button>
        <Button size="sm">{text.continue}</Button>
      </Card.Footer>
    </Card>
  );
}

export function CardVariantsDemo() {
  const text = useCardDocsText();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card elevation="none" spacing="sm">
        <Card.Header>
          <Card.Title>{text.borderOnly}</Card.Title>
        </Card.Header>
        <Card.Content>{text.noShadowElevation}</Card.Content>
      </Card>
      <Card elevation="lg" spacing="sm" interactive>
        <Card.Header>
          <Card.Title>{text.interactive}</Card.Title>
        </Card.Header>
        <Card.Content>{text.hoverFeedback}</Card.Content>
      </Card>
    </div>
  );
}

export function AlertUsageDemo() {
  return (
    <Alert intent="info" leadingIcon={<Info size={20} weight="fill" />}>
      <Alert.Title>Permit review in progress</Alert.Title>
      <Alert.Description>
        You will receive an email when your application has been processed.
      </Alert.Description>
    </Alert>
  );
}

export function AlertVariantsDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Alert intent="positive" leadingIcon={<CheckCircle size={20} weight="fill" />}>
        <Alert.Title>Payment received</Alert.Title>
        <Alert.Description>Your transaction was completed successfully.</Alert.Description>
      </Alert>
      <Alert
        intent="danger"
        appearance="outline"
        leadingIcon={<WarningCircle size={20} weight="fill" />}
      >
        <Alert.Title>Submission failed</Alert.Title>
        <Alert.Description>Check the required fields and try again.</Alert.Description>
        <Alert.CloseButton />
      </Alert>
    </div>
  );
}

const DOCS_TOAST_QUEUE = createToastQueue<VeliToastContent>();

export function ToastUsageDemo() {
  return (
    <>
      <ToastRegion queue={DOCS_TOAST_QUEUE} placement="bottom-end" />
      <Button
        onPress={() =>
          DOCS_TOAST_QUEUE.add(
            {
              title: 'Application saved',
              description: 'Your draft has been stored securely.',
              intent: 'positive',
            },
            { timeout: 5000 },
          )
        }
      >
        Show toast
      </Button>
    </>
  );
}
type TableDocsRow = {
  id: string;
  name: string;
  department: string;
  status: string;
};

type TableDocsText = {
  ariaLabel: string;
  columns: {
    name: string;
    department: string;
    status: string;
  };
  rows: TableDocsRow[];
};

const tableDocsText = {
  en: {
    ariaLabel: 'Permit applications',
    columns: {
      name: 'Name',
      department: 'Department',
      status: 'Status',
    },
    rows: [
      { id: '1', name: 'Tourism licence', department: 'Tourism', status: 'Approved' },
      { id: '2', name: 'Fishing permit', department: 'Fisheries', status: 'Pending' },
      { id: '3', name: 'Business registration', department: 'Commerce', status: 'Rejected' },
    ],
  },
  dv: {
    ariaLabel: 'ހުއްދައަށް އެދޭ އެޕްލިކޭޝަންތައް',
    columns: {
      name: 'ނަން',
      department: 'ޑިޕާޓްމަންޓް',
      status: 'ޙާލަތު',
    },
    rows: [
      {
        id: '1',
        name: 'ފަތުރުވެރިކަމުގެ ލައިސަންސް',
        department: 'ފަތުރުވެރިކަން',
        status: 'ފާސްކުރެވިފައި',
      },
      {
        id: '2',
        name: 'މަސްވެރިކަން ކުރުމުގެ ހުއްދަ',
        department: 'މަސްވެރިކަން',
        status: 'ޕެންޑިންގ',
      },
      {
        id: '3',
        name: 'ވިޔަފާރި ރަޖިސްޓްރީކުރުން',
        department: 'ވިޔަފާރި',
        status: 'ރިޖެކްޓްކުރެވިފައި',
      },
    ],
  },
} satisfies Record<'en' | 'dv', TableDocsText>;

export function TableUsageDemo() {
  const { direction } = useVeliLanguage();
  const text = tableDocsText[direction === 'rtl' ? 'dv' : 'en'];

  return (
    <div className="max-w-2xl">
      <Table aria-label={text.ariaLabel}>
        <TableHeader>
          <TableColumn isRowHeader>{text.columns.name}</TableColumn>
          <TableColumn>{text.columns.department}</TableColumn>
          <TableColumn>{text.columns.status}</TableColumn>
        </TableHeader>
        <TableBody items={text.rows}>
          {(item) => (
            <TableRow id={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.department}</TableCell>
              <TableCell>{item.status}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function PaginationUsageDemo() {
  const [page, setPage] = useState(1);
  return <Pagination value={page} maxValue={8} onChange={setPage} variant="button" />;
}

export function PaginationVariantsDemo() {
  const [page, setPage] = useState(3);
  return (
    <Pagination value={page} maxValue={12} onChange={setPage} variant="explicit" siblingCount={1} />
  );
}

export function DropzoneUsageDemo() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <Dropzone
      label="Upload attachments"
      accept="application/pdf,image/png,image/jpeg"
      maxFiles={2}
      multiple
      value={files}
      onValueChange={setFiles}
    >
      <DropzoneArea />
      <DropzoneList>
        <DropzoneFileListItems />
      </DropzoneList>
    </Dropzone>
  );
}

function DropzoneFileListItems() {
  const files = useDropzone((state) =>
    Array.from(state.files.values()).map((fileState) => fileState.file),
  );

  return (
    <>
      {files.map((file) => (
        <DropzoneItem key={`${file.name}-${file.lastModified}`} value={file}>
          <DropzoneItemPreview />
          <DropzoneItemMetadata />
          <DropzoneItemDelete />
        </DropzoneItem>
      ))}
    </>
  );
}
