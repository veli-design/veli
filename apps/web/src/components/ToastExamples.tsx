import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { createToastQueue, ToastRegion, type VeliToastContent } from '@tradenetcorp/veli-ui/toast';
import {
  VeliProvider,
  useVeliLanguage,
  type VeliColorScheme,
} from '@tradenetcorp/veli-ui/provider';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';

const usageCopy = {
  en: {
    title: 'Application saved',
    description: 'Your draft has been stored securely.',
    showToast: 'Show toast',
  },
  dv: {
    title: 'އެޕްލިކޭޝަން ސޭވްކުރެވިއްޖެ',
    description: 'ތިޔަ ޑްރާފްޓް ރައްކާތެރިކަމާއެކު ސޭވްކުރެވިއްޖެ.',
    showToast: 'ނޮޓިފިކޭޝަން ދައްކާ',
  },
};

function useToastQueue() {
  const queue = useMemo(() => createToastQueue<VeliToastContent>({ maxVisibleToasts: 3 }), []);
  useEffect(() => () => queue.clear(), [queue]);
  return queue;
}

export function ToastUsageDemo() {
  const queue = useToastQueue();
  const text = usageCopy[useVeliLanguage().language];
  return (
    <>
      <Button
        onPress={() =>
          queue.add(
            {
              title: text.title,
              description: text.description,
              intent: 'positive',
            },
            { timeout: 5000 },
          )
        }
      >
        {text.showToast}
      </Button>
      <ToastRegion queue={queue} />
    </>
  );
}

export function ToastAppearancesDemo() {
  const queue = useToastQueue();
  return (
    <div className="flex flex-wrap gap-3">
      {(['outline', 'subtle', 'emphasis'] as const).map((appearance) => (
        <Button
          key={appearance}
          appearance="transparent"
          onPress={() =>
            queue.add(
              {
                title: 'Draft saved',
                intent: 'positive',
                appearance,
              },
              { timeout: 5000 },
            )
          }
        >
          {appearance === 'outline' ? 'Outline' : appearance === 'subtle' ? 'Subtle' : 'Emphasis'}
        </Button>
      ))}
      <ToastRegion queue={queue} />
    </div>
  );
}

export function ToastActionsDemo() {
  const queue = useToastQueue();
  const [feedback, setFeedback] = useState('');
  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        onPress={() => {
          setFeedback('');
          queue.add({
            title: 'File deleted',
            actions: [
              {
                id: 'undo',
                label: 'Undo',
                intent: 'accent',
                onPress: () => setFeedback('File restored.'),
              },
              {
                id: 'details',
                label: 'View details',
                appearance: 'ghost',
                dismissOnPress: false,
                onPress: () => setFeedback('File details opened.'),
              },
            ],
          });
        }}
      >
        Show action
      </Button>
      <output className="type-body-sm-regular text-base-muted">{feedback}</output>
      <ToastRegion queue={queue} />
    </div>
  );
}

export function ToastProgressDemo() {
  const queue = useToastQueue();
  return (
    <>
      <Button
        onPress={() =>
          queue.add(
            {
              title: 'Saved',
              intent: 'positive',
              showProgress: true,
            },
            { timeout: 8000 },
          )
        }
      >
        Show progress
      </Button>
      <ToastRegion queue={queue} />
    </>
  );
}

function subscribeToDocsTheme(onChange: () => void) {
  window.addEventListener('veli:color-scheme-change', onChange);
  return () => window.removeEventListener('veli:color-scheme-change', onChange);
}

function getDocsColorScheme(): VeliColorScheme {
  const scheme = document.documentElement.dataset.colorScheme;
  return scheme === 'light' || scheme === 'dark' ? scheme : 'system';
}

export function ToastRtlDemo() {
  const [language, setLanguage] = useState('Dhivehi');
  const colorScheme = useSyncExternalStore(
    subscribeToDocsTheme,
    getDocsColorScheme,
    () => 'system' as const,
  );
  const locale = language === 'Dhivehi' ? 'dv' : 'en';

  return (
    <DocsPreview
      codeKey={`toast-language-${locale}`}
      controls={
        <DocsPreviewOption
          label="Language"
          value={language}
          options={['English', 'Dhivehi']}
          onChange={setLanguage}
        />
      }
    >
      <VeliProvider language={locale} colorScheme={colorScheme}>
        <ToastUsageDemo key={locale} />
      </VeliProvider>
    </DocsPreview>
  );
}
