import { useState } from 'react';
import { I18nProvider } from 'react-aria-components';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';
import { Accordion } from '@veli-design/react/accordion';

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
