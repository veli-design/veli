const alertCopy = {
  en: {
    title: 'Permit review in progress',
    description: 'You will receive an email when your application has been processed.',
    primary: 'Track application',
    secondary: 'Remind me later',
  },
  dv: {
    title: 'ޕާމިޓް ރިވިއު ކުރިއަށްދަނީ',
    description: 'އެޕްލިކޭޝަން ޕްރޮސެސްކުރުމުން އީމެއިލް ލިބޭނެއެވެ.',
    primary: 'ޝެޑިއުލް ބައްލަވާ',
    secondary: 'ކުރިއަށް',
  },
};

function alertContent({ layout = 'default', appearance = 'light', language = 'en' } = {}) {
  const text = alertCopy[language];
  return `<Alert
  intent="info"
  appearance="${appearance}"
  layout="${layout}"
  leadingIcon={<Info size={20} weight="fill" />}
>
  <Alert.Title>${text.title}</Alert.Title>${
    layout === 'compact'
      ? ''
      : `
  <Alert.Description>${text.description}</Alert.Description>`
  }
  <Alert.Actions>
    <Button type="button" size="sm" intent="secondary" appearance="${appearance === 'light' ? 'fill' : 'transparent'}">
      ${text.primary}
    </Button>${
      layout === 'compact'
        ? ''
        : `
    <Button type="button" size="sm" intent="secondary" appearance="ghost">
      ${text.secondary}
    </Button>`
    }
  </Alert.Actions>
</Alert>`;
}

function component(name, imports, content, setup = '') {
  return `${setup ? '"use client";\n\n' : ''}${imports}

export default function ${name}() {${setup ? `\n${setup}\n` : ''}
  return (
${content
  .split('\n')
  .map((line) => `    ${line}`)
  .join('\n')}
  );
}`;
}

const alertImports = `import { Info } from 'phosphor-react';
import { Alert } from '@tradenetcorp/veli-ui/alert';
import { Button } from '@tradenetcorp/veli-ui/button';`;
const providerImport = `import { VeliProvider } from '@tradenetcorp/veli-ui/provider';`;

function alertAppearances(appearance) {
  return component(
    'AlertAppearancesDemo',
    `import { CheckCircle, Info, Warning, WarningCircle, WarningOctagon } from 'phosphor-react';
import { Alert } from '@tradenetcorp/veli-ui/alert';`,
    `<div className="flex flex-col gap-4">
  {[
    { intent: 'neutral', Icon: Info },
    { intent: 'info', Icon: Info },
    { intent: 'positive', Icon: CheckCircle },
    { intent: 'cautious', Icon: WarningCircle },
    { intent: 'warning', Icon: Warning },
    { intent: 'danger', Icon: WarningOctagon },
  ].map(({ intent, Icon }) => (
    <Alert
      key={intent}
      intent={intent}
      appearance="${appearance}"
      leadingIcon={<Icon size={20} weight="fill" />}
    >
      <Alert.Title>${alertCopy.en.title}</Alert.Title>
      <Alert.Description>${alertCopy.en.description}</Alert.Description>
    </Alert>
  ))}
</div>`,
  )
    .replace("{ intent: 'neutral', Icon: Info },", "{ intent: 'neutral' as const, Icon: Info },")
    .replace(/intent: '(info|positive|cautious|warning|danger)'/g, "intent: '$1' as const");
}

function alertLayout(layout) {
  return component(
    'AlertLayoutDemo',
    alertImports,
    `<div className="${layout === 'stacked' ? 'w-[343px] max-w-full' : 'w-full'}">\n${alertContent({
      layout,
    })
      .split('\n')
      .map((line) => `  ${line}`)
      .join('\n')}\n</div>`,
  );
}
function alertLanguage(language) {
  return component(
    'AlertLanguageDemo',
    `${alertImports}\n${providerImport}`,
    `<VeliProvider language="${language}">\n${alertContent({ layout: 'stacked', language })
      .split('\n')
      .map((line) => `  ${line}`)
      .join('\n')}\n</VeliProvider>`,
  );
}
function buttonLanguage(language) {
  const dv = language === 'dv';
  const Arrow = dv ? 'ArrowLeft' : 'ArrowRight';
  return component(
    'ButtonLanguageDemo',
    `import { ${Arrow}, Plus } from 'phosphor-react';
import { Button } from '@tradenetcorp/veli-ui/button';
${providerImport}`,
    `<VeliProvider language="${language}">
  <div className="flex flex-wrap items-center justify-center gap-3">
    <Button>
      ${dv ? 'ކުރިއަށް' : 'Continue'}
      <${Arrow} size={16} aria-hidden="true" weight="bold" />
    </Button>
    <Button intent="secondary" appearance="transparent" iconOnly aria-label="${dv ? 'އިތުރުކުރޭ' : 'Add item'}">
      <Plus size={16} aria-hidden="true" weight="bold" />
    </Button>
  </div>
</VeliProvider>`,
  );
}
function linkLanguage(language) {
  const dv = language === 'dv';
  const Arrow = dv ? 'ArrowLeft' : 'ArrowRight';
  return component(
    'LinkLanguageDemo',
    `import { ${Arrow} } from 'phosphor-react';
import { Link } from '@tradenetcorp/veli-ui/link';
${providerImport}`,
    `<VeliProvider language="${language}">
  <Link href="/account" size="md">
    ${dv ? 'ކުރިއަށް' : 'Continue'}
    <${Arrow} aria-hidden="true" weight="bold" />
  </Link>
</VeliProvider>`,
  );
}
function switchLanguage(language) {
  return component(
    'SwitchLanguageDemo',
    `import { Switch } from '@tradenetcorp/veli-ui/switch';\n${providerImport}`,
    `<VeliProvider language="${language}">\n  <Switch>${language === 'dv' ? 'ނޯޓިފިކޭޝަންސް' : 'Notifications'}</Switch>\n</VeliProvider>`,
  );
}
const accordionItems = {
  dv: [
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
  ],
  en: [
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
  ],
};
function accordionLanguage(language) {
  return component(
    'AccordionLanguageDemo',
    `import { Accordion } from '@tradenetcorp/veli-ui/accordion';
${providerImport}`,
    `<VeliProvider language="${language}">
  <Accordion
    size="lg"
    alignment="left"
    defaultExpandedKeys={['overview']}
    items={${JSON.stringify(accordionItems[language], null, 2)}}
  />
</VeliProvider>`,
  );
}
function paginationExample(language, variant) {
  return component(
    'PaginationLanguageDemo',
    `${variant === 'loadmore' ? "import { useState } from 'react';\n" : ''}import { Pagination } from '@tradenetcorp/veli-ui/pagination';\n${providerImport}`,
    `<VeliProvider language="${language}">
  <Pagination
    variant="${variant}"${
      variant === 'loadmore'
        ? `
    loadedCount={loadedCount}
    totalCount={42}
    onLoadMore={() => setLoadedCount((count) => Math.min(count + 12, 42))}`
        : `
    defaultValue={3}
    maxValue={12}`
    }
  />
</VeliProvider>`,
    variant === 'loadmore' ? '  const [loadedCount, setLoadedCount] = useState(12);' : '',
  );
}

function languageVariants(prefix, builder) {
  return Object.fromEntries(
    ['en', 'dv'].map((language) => [`${prefix}-${language}`, builder(language)]),
  );
}

// Build-time sources: these are highlighted into inert templates, never shipped as a highlighter.
export const previewCodeGroups = {
  AlertVariantsDemo: {
    defaultKey: 'alert-appearance-light',
    variants: Object.fromEntries(
      ['light', 'highContrast'].map((value) => [
        `alert-appearance-${value}`,
        alertAppearances(value),
      ]),
    ),
  },
  AlertLayoutsDemo: {
    defaultKey: 'alert-layout-default',
    variants: Object.fromEntries(
      ['default', 'stacked', 'compact'].map((value) => [
        `alert-layout-${value}`,
        alertLayout(value),
      ]),
    ),
  },
  AlertRtlDemo: {
    defaultKey: 'alert-language-dv',
    variants: languageVariants('alert-language', alertLanguage),
  },
  ButtonRtlDemo: {
    defaultKey: 'button-language-dv',
    variants: languageVariants('button-language', buttonLanguage),
  },
  LinkRtlDemo: {
    defaultKey: 'link-language-dv',
    variants: languageVariants('link-language', linkLanguage),
  },
  SwitchRtlDemo: {
    defaultKey: 'switch-language-dv',
    variants: languageVariants('switch-language', switchLanguage),
  },
  AccordionRtlDemo: {
    defaultKey: 'accordion-language-dv',
    variants: languageVariants('accordion-language', accordionLanguage),
  },
  PaginationRtlDemo: {
    defaultKey: 'pagination-dv-explicit',
    variants: Object.fromEntries(
      ['en', 'dv'].flatMap((language) =>
        ['button', 'explicit', 'loadmore'].map((variant) => [
          `pagination-${language}-${variant}`,
          paginationExample(language, variant),
        ]),
      ),
    ),
  },
};
