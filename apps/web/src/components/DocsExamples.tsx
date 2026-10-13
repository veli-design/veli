import { useMemo, useState, type ReactNode } from 'react';
import { I18nProvider } from 'react-aria-components';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';
import { Accordion } from '@tradenetcorp/veli-ui/accordion';
import { Avatar } from '@tradenetcorp/veli-ui/avatar';
import { Badge } from '@tradenetcorp/veli-ui/badge';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Breadcrumb, BreadcrumbOverflow, Breadcrumbs } from '@tradenetcorp/veli-ui/breadcrumbs';
import { Checkbox, CheckboxGroup } from '@tradenetcorp/veli-ui/checkbox';
import { ComboBox, ComboBoxItem, ComboBoxSection } from '@tradenetcorp/veli-ui/combobox';
import { DateField } from '@tradenetcorp/veli-ui/date-field';
import { Divider } from '@tradenetcorp/veli-ui/divider';
import { FieldDescription, FieldError, FieldLabel } from '@tradenetcorp/veli-ui/field';
import { Input } from '@tradenetcorp/veli-ui/input';
import { Kbd, KbdGroup } from '@tradenetcorp/veli-ui/kbd';
import {
  Menu,
  MenuItem,
  MenuPopover,
  MenuSeparator,
  MenuTrigger,
} from '@tradenetcorp/veli-ui/menu';
import { Modal } from '@tradenetcorp/veli-ui/modal';
import { PageTab } from '@tradenetcorp/veli-ui/page-tab';
import { PasswordInput } from '@tradenetcorp/veli-ui/password-input';
import { VeliProvider, useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { Radio, RadioGroup } from '@tradenetcorp/veli-ui/radio';
import { Search } from '@tradenetcorp/veli-ui/search';
import { Skeleton } from '@tradenetcorp/veli-ui/skeleton';
import { Tabs } from '@tradenetcorp/veli-ui/tabs';
import { Tag, TagGroup } from '@tradenetcorp/veli-ui/tags';
import { TextArea } from '@tradenetcorp/veli-ui/textarea';
import { Tooltip, TooltipTrigger } from '@tradenetcorp/veli-ui/tooltip';
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
import { DropzoneField, type DropzoneProps } from '@tradenetcorp/veli-ui/dropzone';
import {
  BellIcon,
  CaretDownIcon,
  DownloadSimpleIcon,
  LinkSimpleIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react';

/** Match Storybook / VeliProvider `language="en"` → `en-GB` date segments. */
function DocsEnGbLocale({ children }: { children: ReactNode }) {
  return <I18nProvider locale="en-GB">{children}</I18nProvider>;
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

const BREADCRUMB_OVERFLOW_ITEMS = [
  { id: 'applications', label: 'Applications', href: '#' },
  { id: 'permits', label: 'Permits', href: '#' },
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
    defaultElevation: 'Default',
    spacingToggleLabel: 'Card spacing',
    contactTitle: 'Contact details',
    contactDescription: 'How we reach you about this application.',
    emailLabel: 'Email',
    emailPlaceholder: 'name@example.com',
    phoneLabel: 'Phone',
    phonePlaceholder: '+960 7XX XXXX',
    notesLabel: 'Notes',
    notesPlaceholder: 'Anything the reviewer should know',
    save: 'Save',
  },
  dv: {
    permitApplication: 'ހުއްދައަށް އެދޭ އެޕްލިކޭޝަން',
    requiredDocuments: 'ޕްރޮގްރެސް އާއި ބޭނުންވާ ލިޔެކިޔުންތައް ޓްރެކްކުރައްވާ.',
    reviewMessage: 'ތިޔަ އެޕްލިކޭޝަން ދަނީ ރިވިއުކުރެވެމުންނެވެ. ގޮތެއް ނިމުމުން އަންގާނަން.',
    viewDetails: 'ތަފްސީލު ބައްލަވާ',
    continue: 'ކުރިއަށްގެންދަވާ',
    defaultElevation: 'އާދައިގެ',
    spacingToggleLabel: 'ކާރޑް ސްޕޭސިންގް',
    contactTitle: 'ގުޅުންތައް',
    contactDescription: 'މި އެޕްލިކޭޝަން ގެންގުޅުން ހަމަޖެއްސުމަށް.',
    emailLabel: 'އީމެއިލް',
    emailPlaceholder: 'name@example.com',
    phoneLabel: 'ފޯން',
    phonePlaceholder: '+960 7XX XXXX',
    notesLabel: 'ނޯޓްސް',
    notesPlaceholder: 'ރިވިއުވަރަށް އެނގޭނެ އެއްޗެއް',
    save: 'ސޭވް',
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

export function BreadcrumbsBackLinkDemo() {
  return (
    <Breadcrumbs aria-label="Back breadcrumb" showBackLink backLinkHref="#" backLinkLabel="Back">
      <Breadcrumb href="#">Services</Breadcrumb>
      <Breadcrumb>Fishing permit</Breadcrumb>
    </Breadcrumbs>
  );
}

export function BreadcrumbsOverflowDemo() {
  return (
    <Breadcrumbs aria-label="Overflow breadcrumb">
      <Breadcrumb href="#">Home</Breadcrumb>
      <BreadcrumbOverflow items={BREADCRUMB_OVERFLOW_ITEMS} />
      <Breadcrumb href="#">Permits</Breadcrumb>
      <Breadcrumb>Fishing permit</Breadcrumb>
    </Breadcrumbs>
  );
}

export function BreadcrumbsDisabledDemo() {
  return (
    <Breadcrumbs aria-label="Disabled breadcrumb">
      <Breadcrumb href="#">Home</Breadcrumb>
      <Breadcrumb href="#" isDisabled>
        Archived services
      </Breadcrumb>
      <Breadcrumb>Permit details</Breadcrumb>
    </Breadcrumbs>
  );
}

export function BreadcrumbsDataDrivenDemo() {
  const [currentIndex, setCurrentIndex] = useState(BREADCRUMB_TRAIL.length - 1);
  const items = BREADCRUMB_TRAIL.slice(0, currentIndex + 1);

  return (
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
      <Input
        label="Email"
        type="email"
        isOptional
        placeholder="name@example.com"
        description="Helper text"
      />
    </div>
  );
}

export function InputAppearancesDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="Default" placeholder="Enter value" />
      <Input appearance="outline" label="Outline" placeholder="Enter value" />
    </div>
  );
}

export function InputValidationDemo() {
  return (
    <div className="w-[320px]">
      <Input
        label="Email"
        type="email"
        isInvalid
        errorMessage="Enter a valid email address."
        endContent={<LinkSimpleIcon size={20} />}
      />
    </div>
  );
}

export function DividerUsageDemo() {
  return (
    <div className="w-full max-w-[480px] space-y-[12px]">
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
  );
}

export function DividerExpandableDemo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full max-w-[480px] space-y-[12px]">
      <p className="type-body-sm-regular text-base">
        Keep a long section concise, then let readers choose when to reveal the remaining details.
      </p>
      <div id="divider-expanded-guidance" hidden={!expanded}>
        <p className="type-body-sm-regular text-base">
          The caller owns the expanded content and state. Add motion to the content only when it
          suits the experience, and respect reduced-motion preferences.
        </p>
      </div>
      <Divider
        text={expanded ? 'Show less' : 'Show more'}
        showIcon
        appearance="muted"
        aria-label={expanded ? 'Show less' : 'Show more'}
        aria-expanded={expanded}
        aria-controls="divider-expanded-guidance"
        onClick={() => setExpanded((current) => !current)}
      />
    </div>
  );
}

export function DividerAppearancesDemo() {
  return (
    <div className="w-full max-w-[480px] space-y-3 type-body-sm-regular text-base">
      <p>Passport number</p>
      <Divider />
      <p>National ID number</p>
      <Divider appearance="muted" />
      <p>Driving license number</p>
      <Divider appearance="strong" />
      <p>Permit reference</p>
      <Divider appearance="emphasis" />
      <p>Supporting documents</p>
    </div>
  );
}

export function DividerVerticalOrientationDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3 type-body-sm-regular text-base">
      <span>Overview</span>
      <Divider orientation="vertical" />
      <span>Documents</span>
      <Divider orientation="vertical" />
      <span>History</span>
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
      <ComboBox label="Location" placeholder="Search location">
        <ComboBoxSection title="Popular">
          <ComboBoxItem id="male">Male'</ComboBoxItem>
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
      <Select label="Country" isOptional placeholder="Choose a country" description="Helper text">
        <SelectItem id="my">Malaysia</SelectItem>
        <SelectItem id="sg">Singapore</SelectItem>
        <SelectItem id="th">Thailand</SelectItem>
      </Select>
    </div>
  );
}

export function SelectAppearancesDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Select label="Default" placeholder="Choose an option">
        <SelectItem id="a">Option A</SelectItem>
        <SelectItem id="b">Option B</SelectItem>
      </Select>
      <Select appearance="outline" label="Outline" placeholder="Choose an option">
        <SelectItem id="a">Option A</SelectItem>
        <SelectItem id="b">Option B</SelectItem>
      </Select>
    </div>
  );
}

export function SelectSectionsDemo() {
  return (
    <div className="w-[320px]">
      <Select label="Island" placeholder="Choose an island">
        <SelectSection title="Popular">
          <SelectItem id="male" description="Capital city">
            Male&apos;
          </SelectItem>
          <SelectItem id="hulhumale" description="Reclaimed island">
            Hulhumale&apos;
          </SelectItem>
        </SelectSection>
        <SelectSection title="Regional">
          <SelectItem id="addu">Addu City</SelectItem>
          <SelectItem id="fuvahmulah" isDisabled>
            Fuvahmulah City
          </SelectItem>
        </SelectSection>
      </Select>
    </div>
  );
}

export function SelectValidationDemo() {
  return (
    <div className="w-[320px]">
      <Select label="Status" isInvalid errorMessage="Choose a status to continue.">
        <SelectItem id="active">Active</SelectItem>
        <SelectItem id="inactive">Inactive</SelectItem>
      </Select>
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
    <Avatar type="initials" initials="Aishath Mariyam" appearance="blue" alt="Aishath Mariyam" />
  );
}

export function AvatarTypesDemo() {
  return (
    <div className="flex flex-wrap items-center gap-[16px]">
      <Avatar
        type="image"
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80"
        alt="Aishath Mariyam"
      />
      <Avatar type="initials" initials="Aishath Mariyam" appearance="blue" alt="Aishath Mariyam" />
      <Avatar type="icon" appearance="neutral" alt="User" />
      <Avatar type="agencyIcon" appearance="emerald" alt="Agency" />
    </div>
  );
}

export function AvatarAppearancesDemo() {
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

  return (
    <div className="flex flex-wrap items-center gap-[12px]">
      {appearances.map((appearance) => (
        <Avatar
          key={appearance}
          type="initials"
          initials="MV"
          appearance={appearance}
          alt={appearance}
        />
      ))}
    </div>
  );
}

export function AvatarSizesDemo() {
  const sizes = ['60', '52', '44', '36', '28', '20', '16'] as const;

  return (
    <div className="flex flex-wrap items-end gap-[12px]">
      {sizes.map((size) => (
        <Avatar key={size} type="icon" appearance="blue" size={size} alt="User" />
      ))}
    </div>
  );
}

export function BadgeUsageDemo() {
  return (
    <Badge intent="positive" appearance="subtle">
      Approved
    </Badge>
  );
}

export function BadgeAppearancesDemo() {
  return (
    <div className="flex flex-wrap items-center gap-[8px]">
      <Badge appearance="outline" intent="info">
        Outline
      </Badge>
      <Badge appearance="subtle" intent="info">
        Subtle
      </Badge>
      <Badge appearance="emphasis" intent="info">
        Emphasis
      </Badge>
    </div>
  );
}

export function BadgeCounterDemo() {
  return (
    <div className="flex flex-wrap items-center gap-[16px]">
      <Badge intent="danger" counter count={5} />
      <Badge intent="neutral" counter count={128} max={99} />
      <Badge count={7} appearance="emphasis" intent="danger" size="sm" />
    </div>
  );
}

export function BadgeCounterOnIconDemo() {
  return (
    <div className="relative inline-flex">
      <Button
        iconOnly
        intent="secondary"
        appearance="transparent"
        size="md"
        aria-label="5 notifications"
      >
        <BellIcon aria-hidden size={20} weight="regular" />
      </Button>
      <Badge
        counter
        count={5}
        appearance="emphasis"
        intent="danger"
        size="sm"
        className="absolute -top-0.5 -end-0.5"
        aria-hidden
      />
    </div>
  );
}

export function BadgeStatusDotsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-[10px]">
      <Badge appearance="emphasis" intent="positive" size="xs" aria-label="Online" />
      <Badge appearance="emphasis" intent="cautious" size="xs" aria-label="Away" />
      <Badge appearance="emphasis" intent="danger" size="xs" aria-label="Busy" />
      <Badge appearance="emphasis" intent="neutral" size="xs" aria-label="Offline" />
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
        isOptional
        placeholder="Tell us how we can help"
        description="Helper text"
        maxLength={280}
      />
    </div>
  );
}

export function TextAreaAppearancesDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextArea label="Default" placeholder="Write a note" />
      <TextArea appearance="outline" label="Outline" placeholder="Write a note" />
    </div>
  );
}

export function TextAreaValidationDemo() {
  return (
    <div className="w-[360px]">
      <TextArea
        label="Details"
        placeholder="Enter details"
        isInvalid
        errorMessage="This field needs attention."
      />
    </div>
  );
}

export function DateFieldUsageDemo() {
  return (
    <DocsEnGbLocale>
      <div className="w-[320px]">
        <DateField
          label="Appointment date"
          isOptional
          description="Type a date segment by segment."
        />
      </div>
    </DocsEnGbLocale>
  );
}

export function DateFieldAppearancesDemo() {
  return (
    <DocsEnGbLocale>
      <div className="grid gap-4 md:grid-cols-2">
        <DateField label="Default" />
        <DateField appearance="outline" label="Outline" />
      </div>
    </DocsEnGbLocale>
  );
}

export function DateFieldValidationDemo() {
  return (
    <DocsEnGbLocale>
      <div className="w-[320px]">
        <DateField label="Service date" isInvalid errorMessage="Enter a valid service date." />
      </div>
    </DocsEnGbLocale>
  );
}

export function PasswordInputUsageDemo() {
  return (
    <div className="w-[320px]">
      <PasswordInput
        label="Password"
        placeholder="Enter a password"
        description="Use at least 8 characters."
      />
    </div>
  );
}

export function PasswordInputAppearancesDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PasswordInput label="Default" placeholder="Enter a password" />
      <PasswordInput appearance="outline" label="Outline" placeholder="Enter a password" />
    </div>
  );
}

export function PasswordInputRequirementsDemo() {
  return (
    <div className="w-[320px]">
      <PasswordInput
        label="Create password"
        placeholder="Enter a password"
        requirements
        showRequirementsWhenEmpty
      />
    </div>
  );
}

export function PasswordInputMatchDemo() {
  return (
    <div className="w-[320px]">
      <PasswordInput
        label="Confirm password"
        defaultValue="SecretPass1!"
        feedbackMessage="Password match"
        feedbackTone="success"
        isSuccess
      />
    </div>
  );
}

export function PasswordInputValidationDemo() {
  return (
    <div className="w-[320px]">
      <PasswordInput
        label="Password"
        defaultValue="secret"
        isInvalid
        errorMessage="This field needs attention."
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

const ACCORDION_RTL_ITEMS = [
  {
    id: 'overview',
    label: 'ޚުލާޞާ',
    content:
      'ބަދަލެއް ގެނައުމުގެ ކުރިން، ހުއްދައިގެ ސްޓޭޓަސް، ހުށަހެޅި ތާރީޚު، އަދި މައްސަލަ ހަވާލުކުރެވިފައިވާ ރިވިއުވަރ ޗެކްކުރައްވާ.',
  },
  {
    id: 'documents',
    label: 'ލިޔެކިޔުންތައް',
    content:
      'ކާކުކަން އަންގައިދޭ ލިޔުމާއި، އެޑްރެސް އަންގައިދޭ ލިޔުން، އަދި ފައިސާ ދެއްކިކަމުގެ ރަސީދު ފަދަ ގުޅޭ ލިޔެކިޔުންތައް އަޕްލޯޑްކުރައްވާ.',
  },
  {
    id: 'history',
    label: 'ހިސްޓްރީ',
    content:
      'މި އެޕްލިކޭޝަނާ ގުޅިގެން ރެކޯޑުކުރެވިފައިވާ ކޮންމެ އަޕްޑޭޓަކާއި، ކޮމެންޓެއް އަދި ސްޓޭޓަސްއަށް އައިސްފައިވާ ބަދަލުތައް ބައްލަވާލައްވާ.',
  },
] as const;

const ACCORDION_LTR_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
    content:
      'Review the permit status, submission date, and assigned reviewer before making changes.',
  },
  {
    id: 'documents',
    label: 'Documents',
    content:
      'Upload supporting files such as identification, proof of address, and payment receipts.',
  },
  {
    id: 'history',
    label: 'History',
    content: 'Track every update, comment, and status change recorded for this application.',
  },
] as const;

export function AccordionRtlDemo() {
  const [language, setLanguage] = useState('Dhivehi');
  const isDhivehi = language === 'Dhivehi';

  return (
    <DocsPreview
      codeKey={`accordion-language-${isDhivehi ? 'dv' : 'en'}`}
      controls={
        <DocsPreviewOption
          label="Language"
          value={language}
          options={['English', 'Dhivehi']}
          onChange={setLanguage}
        />
      }
    >
      <I18nProvider locale={isDhivehi ? 'dv-MV' : 'en-GB'}>
        <div
          className="w-full max-w-[420px] min-w-0"
          lang={isDhivehi ? 'dv' : 'en'}
          dir={isDhivehi ? 'rtl' : 'ltr'}
        >
          <Accordion
            key={language}
            size="lg"
            alignment="left"
            defaultExpandedKeys={['overview']}
            items={isDhivehi ? ACCORDION_RTL_ITEMS : ACCORDION_LTR_ITEMS}
          />
        </div>
      </I18nProvider>
    </DocsPreview>
  );
}

export function AccordionUsageDemo() {
  return (
    <div className="mx-auto w-full max-w-[640px]">
      <Accordion defaultExpandedKeys={['overview']} items={ACCORDION_ITEMS} />
    </div>
  );
}

export function AccordionVariantsDemo() {
  return (
    <div className="mx-auto grid w-full max-w-[640px] gap-6">
      <div className="rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <span className="block type-body-sm-medium text-base-emphasis">Single expanded</span>
          <Accordion defaultExpandedKeys={['overview']} items={ACCORDION_ITEMS} />
        </div>
      </div>

      <div className="rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <span className="block type-body-sm-medium text-base-emphasis">Multiple expanded</span>
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

export function AccordionControlledDemo() {
  const [expandedKeys, setExpandedKeys] = useState<Set<string | number>>(new Set(['overview']));
  return (
    <div className="mx-auto w-full max-w-[640px]">
      <Accordion
        items={ACCORDION_ITEMS}
        expandedKeys={expandedKeys}
        onExpandedChange={setExpandedKeys}
      />
      <output className="mt-4 block type-body-sm-regular" aria-live="polite">
        Open sections: {Array.from(expandedKeys).join(', ') || 'none'}
      </output>
    </div>
  );
}

export function AccordionAppearanceDemo() {
  return (
    <div className="mx-auto grid w-full max-w-[640px] gap-6">
      {(
        [
          { label: 'Medium', size: 'md' },
          { label: 'Large', size: 'lg' },
          { label: 'Trailing indicator', alignment: 'left' },
          { label: 'Leading indicator', alignment: 'right' },
          { label: 'Default inset', flushed: false },
          { label: 'Flushed', flushed: true },
        ] as const
      ).map(({ label, ...props }) => (
        <div key={label} className="rounded-2xl border border-base-subtle bg-surface-raised p-4">
          <span className="mb-3 block type-body-sm-medium">{label}</span>
          <Accordion {...props} items={ACCORDION_ITEMS} defaultExpandedKeys={['overview']} />
        </div>
      ))}
    </div>
  );
}

export function MenuUsageDemo() {
  return (
    <MenuTrigger>
      <Button intent="secondary" appearance="transparent">
        Actions
        <CaretDownIcon size={16} />
      </Button>
      <MenuPopover>
        <Menu>
          <MenuItem startIcon={<PencilSimpleIcon size={16} />}>Edit</MenuItem>
          <MenuItem startIcon={<DownloadSimpleIcon size={16} />} shortcut="⌘E">
            Export
          </MenuItem>
          <MenuSeparator />
          <MenuItem intent="danger" startIcon={<TrashIcon size={16} />}>
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
        <CaretDownIcon size={16} />
      </Button>
      <MenuPopover>
        <Menu>
          <MenuItem
            startIcon={<PencilSimpleIcon size={16} />}
            description="Update labels, metadata, and visibility."
          >
            Edit details
          </MenuItem>
          <MenuItem
            startIcon={<DownloadSimpleIcon size={16} />}
            description="Create a local copy for offline work."
          >
            Download
          </MenuItem>
          <MenuSeparator />
          <MenuItem
            intent="danger"
            startIcon={<TrashIcon size={16} />}
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

export function CardElevationsDemo() {
  const text = useCardDocsText();
  const elevations = ['none', 'xs', 'sm', 'md', 'lg'] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {elevations.map((elevation) => (
        <Card key={elevation} elevation={elevation} spacing="sm">
          <Card.Header>
            <Card.Title>{elevation === 'xs' ? text.defaultElevation : elevation}</Card.Title>
          </Card.Header>
          <Card.Content>{elevation}</Card.Content>
        </Card>
      ))}
    </div>
  );
}

export function CardSpacingDemo() {
  const text = useCardDocsText();
  const spacings = ['sm', 'md', 'lg', 'xl'] as const;
  const [spacing, setSpacing] = useState<(typeof spacings)[number]>('md');

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="flex flex-wrap justify-center gap-1"
        role="group"
        aria-label={text.spacingToggleLabel}
      >
        {spacings.map((value) => {
          const selected = spacing === value;

          return (
            <Button
              key={value}
              size="sm"
              intent={selected ? 'primary' : 'secondary'}
              appearance={selected ? 'fill' : 'transparent'}
              aria-pressed={selected}
              onPress={() => setSpacing(value)}
            >
              {value === 'md' ? text.defaultElevation : value}
            </Button>
          );
        })}
      </div>
      <Card className="w-full max-w-md" spacing={spacing} elevation="xs">
        <Card.Header>
          <Card.Title>{text.permitApplication}</Card.Title>
          <Card.Description>{text.requiredDocuments}</Card.Description>
        </Card.Header>
        <Card.Content>{text.reviewMessage}</Card.Content>
        <Card.Footer>
          <Button size="sm">{text.continue}</Button>
        </Card.Footer>
      </Card>
    </div>
  );
}

export function CardFormDemo() {
  const text = useCardDocsText();

  return (
    <Card className="w-full max-w-md">
      <Card.Header>
        <Card.Title>{text.contactTitle}</Card.Title>
        <Card.Description>{text.contactDescription}</Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="flex flex-col gap-3">
          <Input
            label={text.emailLabel}
            placeholder={text.emailPlaceholder}
            defaultValue="aisha.mohamed@example.com"
          />
          <Input label={text.phoneLabel} placeholder={text.phonePlaceholder} />
          <TextArea label={text.notesLabel} placeholder={text.notesPlaceholder} rows={3} />
        </div>
      </Card.Content>
      <Card.Footer>
        <Button size="sm">{text.save}</Button>
      </Card.Footer>
    </Card>
  );
}

export function ModalUsageDemo() {
  return (
    <div className="flex min-h-[180px] items-center justify-center">
      <Modal.Trigger>
        <Button>Open modal</Button>
        <Modal>
          <Modal.Header>
            <Modal.Title>Edit profile</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Content>
            <p>Update your profile details and save when done.</p>
          </Modal.Content>
          <Modal.Footer>
            <Button slot="close" intent="secondary" appearance="transparent">
              Cancel
            </Button>
            <Button slot="close">Save changes</Button>
          </Modal.Footer>
        </Modal>
      </Modal.Trigger>
    </div>
  );
}

const MODAL_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const;

export function ModalSizesDemo() {
  const [activeSize, setActiveSize] = useState<(typeof MODAL_SIZES)[number] | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {MODAL_SIZES.map((size) => (
          <Button
            key={size}
            intent="secondary"
            appearance="transparent"
            onPress={() => setActiveSize(size)}
          >
            Open {size.toUpperCase()}
          </Button>
        ))}
      </div>

      <Modal
        size={activeSize ?? 'md'}
        isOpen={activeSize !== null}
        onOpenChange={(isOpen) => setActiveSize(isOpen ? activeSize : null)}
      >
        <Modal.Header>
          <Modal.Title>{(activeSize ?? 'md').toUpperCase()} modal</Modal.Title>
          {activeSize !== 'xs' ? (
            <Modal.Description>
              Width scales with `size`. Confirmation dialogs use `xs` without a description.
            </Modal.Description>
          ) : null}
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Content>
          <p>
            {activeSize === 'xs'
              ? 'Extra small modals are used for action confirmations such as delete.'
              : 'Content can grow up to 90dvh before the panel scrolls.'}
          </p>
        </Modal.Content>
        <Modal.Footer>
          <Button onPress={() => setActiveSize(null)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export function ModalDismissDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Modal.Trigger>
        <Button intent="danger">Open locked modal</Button>
        <Modal isDismissable={false} isKeyboardDismissDisabled>
          <Modal.Header>
            <Modal.Title>Confirm destructive action</Modal.Title>
          </Modal.Header>
          <Modal.Content>
            <p>Outside click and Escape are disabled. Choose an explicit action.</p>
          </Modal.Content>
          <Modal.Footer>
            <Button slot="close" intent="secondary" appearance="transparent">
              Cancel
            </Button>
            <Button slot="close" intent="danger">
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </Modal.Trigger>
    </div>
  );
}

export function ModalFooterDemo() {
  return (
    <div className="flex min-h-[180px] items-center justify-center">
      <Modal.Trigger>
        <Button>Open footer actions</Button>
        <Modal size="lg">
          <Modal.Header>
            <Modal.Title>Edit profile</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Content>
            <p>Start-edge and end-edge actions sit on opposite sides of the footer.</p>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex gap-2">
              <Button slot="close" intent="secondary" appearance="transparent">
                View history
              </Button>
            </div>
            <div className="flex gap-2">
              <Button slot="close" intent="secondary" appearance="transparent">
                Cancel
              </Button>
              <Button slot="close">Save changes</Button>
            </div>
          </Modal.Footer>
        </Modal>
      </Modal.Trigger>
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

export function PaginationLoadMoreDemo() {
  const [loadedCount, setLoadedCount] = useState(12);
  const [isLoading, setLoading] = useState(false);
  return (
    <Pagination
      variant="loadmore"
      loadedCount={loadedCount}
      totalCount={42}
      isLoading={isLoading}
      onLoadMore={async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLoadedCount((count) => Math.min(count + 12, 42));
        setLoading(false);
      }}
    />
  );
}

export function PaginationRtlDemo() {
  const [language, setLanguage] = useState('Dhivehi');
  const [variant, setVariant] = useState('Explicit');

  return (
    <DocsPreview
      codeKey={`pagination-${language === 'Dhivehi' ? 'dv' : 'en'}-${variant === 'Load more' ? 'loadmore' : variant === 'Explicit' ? 'explicit' : 'button'}`}
      controls={
        <>
          <DocsPreviewOption
            label="Language"
            value={language}
            options={['English', 'Dhivehi']}
            onChange={setLanguage}
          />
          <DocsPreviewOption
            label="Variant"
            value={variant}
            options={['Button', 'Explicit', 'Load more']}
            onChange={setVariant}
          />
        </>
      }
    >
      <VeliProvider
        language={language === 'Dhivehi' ? 'dv' : 'en'}
        className="flex w-full min-w-0 justify-center"
      >
        {variant === 'Load more' ? (
          <PaginationLoadMoreDemo />
        ) : (
          <Pagination
            variant={variant === 'Explicit' ? 'explicit' : 'button'}
            defaultValue={3}
            maxValue={12}
          />
        )}
      </VeliProvider>
    </DocsPreview>
  );
}

const simulateDropzoneUpload: NonNullable<DropzoneProps['onUpload']> = async (
  files,
  { onProgress, onSuccess },
) => {
  await Promise.all(
    files.map(async (file) => {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        onProgress(file, progress);
      }
      onSuccess(file);
    }),
  );
};

export function DropzoneUsageDemo() {
  return (
    <div className="w-full max-w-[496px]">
      <DropzoneField
        label="Attachment"
        isOptional
        description="PDF, PNG or JPG · up to 10 MB each"
        secondaryText="Up to 10 MB"
        acceptedFileTypes={['application/pdf', 'image/png', 'image/jpeg']}
        maxSize={10 * 1024 * 1024}
        onUpload={simulateDropzoneUpload}
      />
    </div>
  );
}

export function DropzoneMultipleDemo() {
  return (
    <div className="w-full max-w-[496px]">
      <DropzoneField
        multiple
        label="Attachments"
        description="Up to 5 files"
        secondaryText="Up to 10 MB each"
        maxFiles={5}
        maxSize={10 * 1024 * 1024}
        onUpload={simulateDropzoneUpload}
      />
    </div>
  );
}

export function DropzoneValidationDemo() {
  const [error, setError] = useState<string>();

  return (
    <div className="w-full max-w-[496px]">
      <DropzoneField
        multiple
        label="Documents"
        description="PDF only · up to 2 MB each"
        errorMessage={error}
        acceptedFileTypes={['application/pdf']}
        maxSize={2 * 1024 * 1024}
        onAccept={() => setError(undefined)}
        onFileReject={(file, message) => setError(`${file.name}: ${message}`)}
      />
    </div>
  );
}

export function FieldUsageDemo() {
  return (
    <RadioGroup className="max-w-md gap-3" defaultValue="pro">
      <FieldLabel>Plan</FieldLabel>
      <FieldDescription>You can change this later.</FieldDescription>
      <Radio value="basic">Basic</Radio>
      <Radio value="pro">Pro</Radio>
    </RadioGroup>
  );
}

export function FieldCheckboxGroupDemo() {
  return (
    <CheckboxGroup className="max-w-md gap-3" defaultValue={['email']}>
      <FieldLabel>Notification channels</FieldLabel>
      <FieldDescription>Where should we send updates?</FieldDescription>
      <Checkbox value="email">Email</Checkbox>
      <Checkbox value="sms">SMS</Checkbox>
    </CheckboxGroup>
  );
}

export function FieldValidationDemo() {
  return (
    <RadioGroup className="max-w-md gap-3" isInvalid>
      <FieldLabel>Plan</FieldLabel>
      <Radio value="basic">Basic</Radio>
      <Radio value="pro">Pro</Radio>
      <FieldError>Choose a plan to continue.</FieldError>
    </RadioGroup>
  );
}
