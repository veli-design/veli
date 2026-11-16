import { TagsDropdownDemo } from './TagExamples';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';
import { VeliProvider, useVeliLanguage } from '@veli-design/react/provider';
import { Tag, TagGroup } from '@veli-design/react/tags';

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

function subscribeToTagsDocsTheme(onChange: () => void) {
  window.addEventListener('veli:color-scheme-change', onChange);
  return () => window.removeEventListener('veli:color-scheme-change', onChange);
}

function getTagsDocsColorScheme() {
  const colorScheme = document.documentElement.dataset.colorScheme;
  return colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : 'system';
}

function TagsRtlContent() {
  const text = useTagsDocsText();
  const [topics, setTopics] = useState(() => getTagsDocsRemovableSeed(text));

  return (
    <div className="w-full max-w-lg space-y-5">
      <TagGroup
        label={text.departments}
        selectionMode="multiple"
        defaultSelectedKeys={['tourism']}
        description={text.chooseDepartments}
      >
        <Tag id="tourism">{text.tourism}</Tag>
        <Tag id="fisheries">{text.fisheries}</Tag>
        <Tag id="education">{text.education}</Tag>
      </TagGroup>
      <TagGroup<TagDemoItem>
        label={text.savedTopics}
        items={topics}
        onRemove={(keys) => setTopics((current) => current.filter((item) => !keys.has(item.id)))}
      >
        {(item) => <Tag id={item.id}>{item.label}</Tag>}
      </TagGroup>
      <TagsDropdownDemo />
    </div>
  );
}

export function TagsRtlDemo() {
  const [language, setLanguage] = useState('Dhivehi');
  const isDhivehi = language === 'Dhivehi';
  const colorScheme = useSyncExternalStore(
    subscribeToTagsDocsTheme,
    getTagsDocsColorScheme,
    () => 'system' as const,
  );

  return (
    <DocsPreview
      codeKey={`tags-language-${isDhivehi ? 'dv' : 'en'}`}
      controls={
        <DocsPreviewOption
          label="Language"
          value={language}
          options={['English', 'Dhivehi']}
          onChange={setLanguage}
        />
      }
    >
      <VeliProvider
        language={isDhivehi ? 'dv' : 'en'}
        colorScheme={colorScheme}
        className="w-full min-w-0"
      >
        <TagsRtlContent key={language} />
      </VeliProvider>
    </DocsPreview>
  );
}
