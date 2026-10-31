import { useState, useSyncExternalStore } from 'react';
import { Button } from '@veli-design/react/button';
import { VeliProvider } from '@veli-design/react/provider';
import { Sheet, type SheetProps } from '@veli-design/react/sheet';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

function getTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function ExampleSheet({
  language = 'en',
  triggerLabel = 'Open sheet',
  ...props
}: SheetProps & { language?: 'en' | 'dv'; triggerLabel?: string }) {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => 'system' as const);
  return (
    <VeliProvider language={language} colorScheme={theme}>
      <Sheet.Trigger>
        <Button>{triggerLabel}</Button>
        <Sheet
          {...props}
          footer={
            props.footer ?? (
              <Button slot="close">
                {language === 'dv' ? 'އެޕްލިކޭޝަންތަކަށް އަނބުރާ ދާ' : 'Done'}
              </Button>
            )
          }
        />
      </Sheet.Trigger>
    </VeliProvider>
  );
}

function ApplicationDetails() {
  return (
    <dl className="grid gap-2">
      <dt className="text-base-muted">Reference</dt>
      <dd>
        <bdi>DEMO-1042</bdi>
      </dd>
      <dt className="text-base-muted">Status</dt>
      <dd>In review</dd>
    </dl>
  );
}

export function SheetDemo() {
  return (
    <ExampleSheet
      title="Application details"
      description="A quick view of your request."
      triggerLabel="View application"
      footer={<Button slot="close">Back to applications</Button>}
    >
      <ApplicationDetails />
    </ExampleSheet>
  );
}

export function SheetPlacementDemo() {
  const [position, setPosition] = useState<NonNullable<SheetProps['position']>>('end');
  const [language, setLanguage] = useState('English');
  const isDhivehi = language === 'Dhivehi';
  return (
    <DocsPreview
      codeKey="sheet-placement"
      controls={
        <>
          <DocsPreviewOption
            label="Placement"
            value={position}
            options={['bottom', 'start', 'end']}
            onChange={(value) => setPosition(value as typeof position)}
          />
          <DocsPreviewOption
            label="Language"
            value={language}
            options={['English', 'Dhivehi']}
            onChange={setLanguage}
          />
        </>
      }
    >
      <ExampleSheet
        title={isDhivehi ? 'އެޕްލިކޭޝަންގެ މަޢުލޫމާތު' : 'Application details'}
        triggerLabel={isDhivehi ? 'އެޕްލިކޭޝަން ބަލާ' : 'View details'}
        language={isDhivehi ? 'dv' : 'en'}
        position={position}
        size="sm"
      >
        {isDhivehi ? (
          <dl className="grid gap-2">
            <dt className="text-base-muted">ހާލަތު</dt>
            <dd>ބަލަމުންދަނީ</dd>
          </dl>
        ) : (
          <ApplicationDetails />
        )}
      </ExampleSheet>
    </DocsPreview>
  );
}

export function SheetSizesDemo() {
  const [size, setSize] = useState<NonNullable<SheetProps['size']>>('lg');
  const [height, setHeight] = useState<NonNullable<SheetProps['height']>>('viewport');
  return (
    <DocsPreview
      codeKey="sheet-sizing"
      controls={
        <>
          <DocsPreviewOption
            label="Width"
            value={size}
            options={['sm', 'md', 'lg', 'full']}
            onChange={(value) => setSize(value as typeof size)}
          />
          <DocsPreviewOption
            label="Height"
            value={height}
            options={['content', 'viewport']}
            onChange={(value) => setHeight(value as typeof height)}
          />
        </>
      }
    >
      <ExampleSheet
        title="Before you apply"
        triggerLabel="Read guidance"
        size={size}
        height={height}
      >
        <p>Prepare your information before starting a request.</p>
        <ol className="list-decimal space-y-4 ps-6">
          <li>Check that you have selected the right service.</li>
          <li>Prepare clear copies of the required documents.</li>
          <li>Review your answers before submitting.</li>
        </ol>
      </ExampleSheet>
    </DocsPreview>
  );
}

export function SheetDismissalDemo() {
  const [dismissal, setDismissal] = useState('Explicit close');
  return (
    <DocsPreview
      codeKey="sheet-dismissal"
      controls={
        <DocsPreviewOption
          label="Dismissal"
          value={dismissal}
          options={['Allowed', 'Explicit close']}
          onChange={setDismissal}
        />
      }
    >
      <ExampleSheet
        title="Application details"
        triggerLabel="Review details"
        isDismissable={dismissal === 'Allowed'}
      >
        <ApplicationDetails />
      </ExampleSheet>
    </DocsPreview>
  );
}
