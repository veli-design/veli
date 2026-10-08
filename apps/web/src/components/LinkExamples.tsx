import { useState, useSyncExternalStore } from 'react';
import { Link } from '@tradenetcorp/veli-ui/link';
import {
  VeliProvider,
  useVeliLanguage,
  type VeliColorScheme,
} from '@tradenetcorp/veli-ui/provider';
import { ArrowLeft, ArrowRight, Plus } from 'phosphor-react';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';

const copy = {
  en: {
    label: 'Continue',
    default: 'Default',
    secondary: 'Secondary',
    none: 'No underline',
    hover: 'Underline on hover',
    always: 'Always underlined',
    sm: 'Small',
    md: 'Medium',
    lg: 'Large',
    prefix: 'Read the ',
    inline: 'guidance for completing your application',
    suffix: ' before continuing.',
    current: 'Current account',
    unavailable: 'Unavailable account',
  },
  dv: {
    label: 'ކުރިއަށް',
    default: 'އާދައިގެ',
    secondary: 'ދެވަނަ',
    none: 'ރޮނގެއް ނެތް',
    hover: 'ހޯވަރ',
    always: 'އަބަދުވެސް ރޮނގުދަމާފައި',
    sm: 'ކުޑަ',
    md: 'މެދު',
    lg: 'ބޮޑު',
    prefix: 'ކުރިއަށް ދިއުމުގެ ކުރިން ',
    inline: 'އެދުން ފުރިހަމަކުރުމުގެ އިރުޝާދު',
    suffix: ' ކިޔާލައްވާ.',
    current: 'މިހާރުގެ އެކައުންޓު',
    unavailable: 'ބޭނުންނުކުރެވޭ އެކައުންޓު',
  },
} as const;

function useLinkExample() {
  const { language, direction } = useVeliLanguage();
  return {
    text: copy[language === 'dv' ? 'dv' : 'en'],
    Arrow: direction === 'rtl' ? ArrowLeft : ArrowRight,
  };
}

export function LinkUsageDemo() {
  const { text } = useLinkExample();
  return (
    <Link href="#api-reference" size="md">
      {text.label}
    </Link>
  );
}

export function LinkVariantsDemo() {
  const { text } = useLinkExample();
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {(['default', 'secondary'] as const).map((intent) => (
        <div key={intent} className="flex flex-col items-start gap-4">
          <span className="text-xs uppercase tracking-wider text-base-muted">{text[intent]}</span>
          {(['none', 'hover', 'always'] as const).map((underline) => (
            <Link
              key={underline}
              href="#api-reference"
              size="md"
              intent={intent}
              underline={underline}
            >
              {text[underline]}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}

export function LinkSizesDemo() {
  const { text, Arrow } = useLinkExample();
  return (
    <div className="flex flex-col gap-6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <Link href="#api-reference" size={size}>
            <Plus aria-hidden="true" weight="bold" />
            {text[size]}
            <Arrow aria-hidden="true" weight="bold" />
          </Link>
        </div>
      ))}
    </div>
  );
}

export function LinkTypographyDemo() {
  const { text } = useLinkExample();
  return (
    <div className="max-w-sm space-y-4">
      {['type-caption-regular', 'type-body-md-regular', 'type-body-sm-semibold'].map((type) => (
        <p key={type} className={type}>
          {text.prefix}
          <Link href="#api-reference" underline="always">
            {text.inline}
          </Link>
          {text.suffix}
        </p>
      ))}
    </div>
  );
}

export function LinkStatesDemo() {
  const { text } = useLinkExample();
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Link href="#api-reference" size="md" aria-current="page">
        {({ isCurrent }) => (isCurrent ? text.current : text.label)}
      </Link>
      <Link href="#api-reference" size="md" isDisabled>
        {text.unavailable}
      </Link>
    </div>
  );
}

function subscribeToDocsTheme(onChange: () => void) {
  window.addEventListener('veli:color-scheme-change', onChange);
  return () => window.removeEventListener('veli:color-scheme-change', onChange);
}

function getDocsColorScheme(): VeliColorScheme {
  const colorScheme = document.documentElement.dataset.colorScheme;
  return colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : 'system';
}

function LinkRtlContent() {
  const { text, Arrow } = useLinkExample();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-6">
        {(['default', 'secondary'] as const).map((intent) => (
          <Link key={intent} href="#api-reference" size="md" intent={intent}>
            {text.label}
            <Arrow aria-hidden="true" weight="bold" />
          </Link>
        ))}
      </div>
      <p className="type-body-md-regular">
        {text.prefix}
        <Link href="#api-reference" underline="always">
          {text.inline}
        </Link>
        {text.suffix}
      </p>
    </div>
  );
}

export function LinkRtlDemo() {
  const [language, setLanguage] = useState('Dhivehi');
  const colorScheme = useSyncExternalStore(
    subscribeToDocsTheme,
    getDocsColorScheme,
    () => 'system' as const,
  );

  return (
    <DocsPreview
      codeKey={`link-language-${language === 'Dhivehi' ? 'dv' : 'en'}`}
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
        language={language === 'Dhivehi' ? 'dv' : 'en'}
        colorScheme={colorScheme}
        className="w-full min-w-0 max-w-sm"
      >
        <LinkRtlContent />
      </VeliProvider>
    </DocsPreview>
  );
}
