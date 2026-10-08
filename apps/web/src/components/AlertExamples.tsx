import { useState, useSyncExternalStore } from 'react';
import {
  Alert,
  type AlertAppearance,
  type AlertIntent,
  type AlertLayout,
} from '@tradenetcorp/veli-ui/alert';
import { Button } from '@tradenetcorp/veli-ui/button';
import {
  VeliProvider,
  useVeliLanguage,
  type VeliColorScheme,
} from '@tradenetcorp/veli-ui/provider';
import { CheckCircle, Info, Warning, WarningCircle, WarningOctagon } from 'phosphor-react';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';

const icons = {
  neutral: Info,
  info: Info,
  positive: CheckCircle,
  cautious: WarningCircle,
  warning: Warning,
  danger: WarningOctagon,
};
const copy = {
  en: {
    title: 'Permit review in progress',
    description: 'You will receive an email when your application has been processed.',
    primary: 'Track application',
    secondary: 'Remind me later',
    reset: 'Show alert again',
    action: 'Application tracking selected.',
  },
  dv: {
    title: 'ޕާމިޓް ރިވިއު ކުރިއަށްދަނީ',
    description: 'އެޕްލިކޭޝަން ޕްރޮސެސްކުރުމުން އީމެއިލް ލިބޭނެއެވެ.',
    primary: 'ޝެޑިއުލް ބައްލަވާ',
    secondary: 'ކުރިއަށް',
    reset: 'އެލާޓް އަލުން ދައްކާ',
    action: 'ޝެޑިއުލް ބަލާލުމަށް ހޮވިއްޖެ.',
  },
};
function Example({
  appearance = 'light',
  intent = 'info',
  layout = 'default',
  actions = false,
}: {
  appearance?: AlertAppearance;
  intent?: AlertIntent;
  layout?: AlertLayout;
  actions?: boolean;
}) {
  const text = copy[useVeliLanguage().language];
  const Icon = icons[intent];
  return (
    <Alert
      appearance={appearance}
      intent={intent}
      layout={layout}
      leadingIcon={<Icon size={20} weight="fill" />}
    >
      <Alert.Title>{text.title}</Alert.Title>
      {layout !== 'compact' ? <Alert.Description>{text.description}</Alert.Description> : null}
      {actions ? (
        <Alert.Actions>
          <Button
            type="button"
            size="sm"
            intent="secondary"
            appearance={appearance === 'light' ? 'fill' : 'transparent'}
          >
            {text.primary}
          </Button>
          {layout !== 'compact' ? (
            <Button type="button" size="sm" intent="secondary" appearance="ghost">
              {text.secondary}
            </Button>
          ) : null}
        </Alert.Actions>
      ) : null}
    </Alert>
  );
}
export function AlertUsageDemo() {
  return <Example />;
}
export function AlertVariantsDemo() {
  const [appearance, setAppearance] = useState<AlertAppearance>('light');
  return (
    <DocsPreview
      codeKey={`alert-appearance-${appearance}`}
      controls={
        <DocsPreviewOption
          label="Appearance"
          value={appearance}
          options={['light', 'highContrast']}
          onChange={(value) => setAppearance(value as AlertAppearance)}
        />
      }
    >
      <div className="flex w-full flex-col gap-4">
        {(Object.keys(icons) as AlertIntent[]).map((intent) => (
          <div key={intent} className="flex flex-col gap-2">
            <span className="type-body-sm-medium text-base-muted">{intent}</span>
            <Example intent={intent} appearance={appearance} />
          </div>
        ))}
      </div>
    </DocsPreview>
  );
}
export function AlertLayoutsDemo() {
  const [layout, setLayout] = useState<AlertLayout>('default');
  return (
    <DocsPreview
      codeKey={`alert-layout-${layout}`}
      controls={
        <DocsPreviewOption
          label="Layout"
          value={layout}
          options={['default', 'stacked', 'compact']}
          onChange={(value) => setLayout(value as AlertLayout)}
        />
      }
    >
      <div className={layout === 'stacked' ? 'w-[343px] max-w-full' : 'w-full'}>
        <Example layout={layout} actions />
      </div>
    </DocsPreview>
  );
}
export function AlertDismissibleDemo() {
  const [visible, setVisible] = useState(true);
  const [acted, setActed] = useState(false);
  const text = copy[useVeliLanguage().language];
  return (
    <div className="flex flex-col items-start gap-4">
      <Alert
        isVisible={visible}
        onDismiss={() => setVisible(false)}
        intent="info"
        appearance="highContrast"
        layout="stacked"
        leadingIcon={<Info size={20} weight="fill" />}
      >
        <Alert.Title>{text.title}</Alert.Title>
        <Alert.Description>{text.description}</Alert.Description>
        <Alert.Actions>
          <Button
            type="button"
            size="sm"
            intent="secondary"
            appearance="transparent"
            onPress={() => setActed(true)}
          >
            {text.primary}
          </Button>
          <Button
            type="button"
            size="sm"
            intent="secondary"
            appearance="ghost"
            onPress={() => setVisible(false)}
          >
            {text.secondary}
          </Button>
        </Alert.Actions>
        <Alert.CloseButton />
      </Alert>
      {acted && visible ? (
        <p role="status" className="type-body-sm-regular text-base-strong">
          {text.action}
        </p>
      ) : null}
      {!visible ? (
        <Button
          type="button"
          size="sm"
          intent="secondary"
          appearance="ghost"
          onPress={() => {
            setVisible(true);
            setActed(false);
          }}
        >
          {text.reset}
        </Button>
      ) : null}
    </div>
  );
}
function subscribeToDocsTheme(callback: () => void) {
  window.addEventListener('veli:color-scheme-change', callback);
  return () => window.removeEventListener('veli:color-scheme-change', callback);
}
function getDocsColorScheme(): VeliColorScheme {
  const value = document.documentElement.dataset.colorScheme;
  return value === 'light' || value === 'dark' ? value : 'system';
}
export function AlertRtlDemo() {
  const [language, setLanguage] = useState('Dhivehi');
  const colorScheme = useSyncExternalStore(
    subscribeToDocsTheme,
    getDocsColorScheme,
    () => 'system' as const,
  );
  return (
    <DocsPreview
      codeKey={`alert-language-${language === 'Dhivehi' ? 'dv' : 'en'}`}
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
        className="w-full"
      >
        <Example layout="stacked" actions />
      </VeliProvider>
    </DocsPreview>
  );
}
