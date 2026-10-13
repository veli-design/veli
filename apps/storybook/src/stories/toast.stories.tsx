import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  useCallback,
  type ReactNode,
} from 'react';
import { UNSTABLE_ToastStateContext as ToastStateContext } from 'react-aria-components';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@tradenetcorp/veli-ui/button';
import {
  createToastQueue,
  Toast,
  ToastContent,
  ToastActions,
  ToastCloseButton,
  ToastTimeoutProgress,
  ToastRegion,
  type ToastAppearance,
  type ToastRegionProps,
  type ToastIntent,
  type VeliToastContent,
} from '@tradenetcorp/veli-ui/toast';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const appearances: ToastAppearance[] = ['outline', 'subtle', 'emphasis'];

const statusIntents: ToastIntent[] = [
  'neutral',
  'info',
  'positive',
  'cautious',
  'warning',
  'danger',
];

const englishToastText = {
  noteAdded: 'Note added',
  noteSaved: 'Your note has been saved to this record.',
  newUpdateAvailable: 'New update available',
  newVersionReady: 'A new version is ready to install.',
  applicationSaved: 'Application saved',
  draftStored: 'Your draft has been stored securely.',
  reviewRequired: 'Review required',
  fieldsNeedAttention: 'Some fields need your attention before submitting.',
  connectionUnstable: 'Connection unstable',
  retryAutomatically: 'We will retry automatically in a moment.',
  uploadFailed: 'Upload failed',
  fileCouldNotBeProcessedTryAgain: 'The file could not be processed. Try again.',
  fileDeleted: 'File deleted',
  budgetRemoved: 'Budget.xlsx was removed from your workspace.',
  fileCouldNotBeProcessed: 'The file could not be processed.',
  updateAvailable: 'Update available',
  versionReady: 'Version 2.4 is ready to install.',
  undo: 'Undo',
  retry: 'Retry',
  dismiss: 'Dismiss',
  installNow: 'Install now',
  later: 'Later',
  singleAction: 'Single action',
  multipleActions: 'Multiple actions',
  emphasisActions: 'Emphasis actions',
  progress: 'progress',
  appearanceLabels: {
    outline: 'outline',
    subtle: 'subtle',
    emphasis: 'emphasis',
  },
  intentLabels: {
    neutral: 'neutral',
    info: 'info',
    positive: 'positive',
    cautious: 'cautious',
    warning: 'warning',
    danger: 'danger',
  },
} as const;

const dhivehiToastText = {
  noteAdded: 'ނޯޓް އިތުރުކުރެވިއްޖެ',
  noteSaved: 'ތިޔަ ނޯޓް މި ރެކޯޑުގައި ސޭވްކުރެވިއްޖެ.',
  newUpdateAvailable: 'އާ އަޕްޑޭޓެއް ލިބެން އެބައިން',
  newVersionReady: 'އިންސްޓޯލް ކުރުމަށް އާ ވަރޝަނެއް ތައްޔާރަށް އެބައިން.',
  applicationSaved: 'އެޕްލިކޭޝަން ސޭވްކުރެވިއްޖެ',
  draftStored: 'ތިޔަ ޑްރާފްޓް ރައްކާތެރިކަމާއެކު ސޭވްކުރެވިއްޖެ.',
  reviewRequired: 'ރިވިއުކުރަން ޖެހޭ',
  fieldsNeedAttention: 'ހުށަހެޅުމުގެ ކުރިން ބައެއް ފީލްޑްތައް ފުރިހަމަކުރަން ޖެހޭ.',
  connectionUnstable: 'ކަނެކްޝަން ސްޓޭބަލްއެއް ނޫން',
  retryAutomatically: 'އިރުކޮޅަކުން އަމިއްލައަށް އަލުން މަސައްކަތްކުރާނެ.',
  uploadFailed: 'އަޕްލޯޑް ނުކުރެވުނު',
  fileCouldNotBeProcessedTryAgain: 'މި ފައިލް ޕްރޮސެސްއެއް ނުކުރެވުނު. އަލުން މަސައްކަތްކުރައްވާ.',
  fileDeleted: 'ފައިލް ފޮހެލެވިއްޖެ',
  budgetRemoved: 'Budget.xlsx ވޯކްސްޕޭސްއިން އުނިކުރެވިއްޖެ.',
  fileCouldNotBeProcessed: 'މި ފައިލް ޕްރޮސެސްއެއް ނުކުރެވުނު.',
  updateAvailable: 'އަޕްޑޭޓް ލިބެން އެބައިން',
  versionReady: 'ވަރޝަން 2.4 އިންސްޓޯލް ކުރުމަށް ތައްޔާރަށް އެބައިން.',
  undo: 'އަންޑޫ',
  retry: 'އަލުން މަސައްކަތްކުރޭ',
  dismiss: 'ޑިސްމިސް',
  installNow: 'މިހާރު އިންސްޓޯލްކުރޭ',
  later: 'ފަހުން',
  singleAction: 'ސިންގަލް އެކްޝަން',
  multipleActions: 'މަލްޓިޕަލް އެކްޝަންތައް',
  emphasisActions: 'އެމްފަސިސް އެކްޝަންތައް',
  progress: 'ޕްރޮގްރެސް',
  appearanceLabels: {
    outline: 'އައުޓްލައިން',
    subtle: 'ސަބްޓަލް',
    emphasis: 'އެމްފަސިސް',
  },
  intentLabels: {
    neutral: 'ނިއުޓްރަލް',
    info: 'އިންފޯ',
    positive: 'ޕޮޒިޓިވް',
    cautious: 'ކޯޝަސް',
    warning: 'ވޯނިންގ',
    danger: 'ޑޭންޖަރ',
  },
} as const;

const localizedToastText = {
  en: englishToastText,
  dv: dhivehiToastText,
} as const;

type ToastLanguage = keyof typeof localizedToastText;
type LocalizedToastText = (typeof localizedToastText)[ToastLanguage];
type ToastExamples = Record<ToastIntent, Pick<VeliToastContent, 'title' | 'description'>>;

const useToastLanguage = (): ToastLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useToastText = () => {
  const language = useToastLanguage();

  return localizedToastText[language];
};

const getToastExamples = (text: LocalizedToastText) =>
  ({
    neutral: {
      title: text.noteAdded,
      description: text.noteSaved,
    },
    info: {
      title: text.newUpdateAvailable,
      description: text.newVersionReady,
    },
    positive: {
      title: text.applicationSaved,
      description: text.draftStored,
    },
    cautious: {
      title: text.reviewRequired,
      description: text.fieldsNeedAttention,
    },
    warning: {
      title: text.connectionUnstable,
      description: text.retryAutomatically,
    },
    danger: {
      title: text.uploadFailed,
      description: text.fileCouldNotBeProcessedTryAgain,
    },
  }) satisfies ToastExamples;

const getVariantLabel = (
  text: LocalizedToastText,
  appearance: ToastAppearance,
  intent: ToastIntent,
) => `${text.appearanceLabels[appearance]} ${text.intentLabels[intent]}`;

type StaticToastPreview = {
  id: string;
  label: string;
  content: VeliToastContent;
  progress?: number;
};

const getStatusButtonIntent = (intent: ToastIntent) =>
  intent === 'danger' ? 'danger' : intent === 'positive' ? 'primary' : 'secondary';

function ToastStoryShell({ children, controls }: { children: ReactNode; controls: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[420px] w-full max-w-6xl flex-col items-center justify-center gap-10 p-8">
      {children}
      <div className="flex flex-wrap justify-center gap-3">{controls}</div>
    </div>
  );
}

function StaticToastCard({ label, content }: StaticToastPreview) {
  // ToastRegion intentionally portals; use its real queue state for inline previews.
  const queue = useMemo(
    () => createToastQueue<VeliToastContent>({ maxVisibleToasts: 1, wrapUpdate: (fn) => fn() }),
    [],
  );
  const subscribe = useCallback((onChange: () => void) => queue.subscribe(onChange), [queue]);
  const getSnapshot = useCallback(() => queue.visibleToasts, [queue]);
  const visibleToasts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => {
    const key = queue.add(content, { timeout: content.showProgress ? 60000 : 0 });
    return () => queue.close(key);
  }, [queue, content]);
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <p className="type-caption-medium text-start text-base-muted">{label}</p>
      <ToastStateContext.Provider
        value={{
          visibleToasts,
          add: queue.add.bind(queue),
          close: queue.close.bind(queue),
          pauseAll: queue.pauseAll.bind(queue),
          resumeAll: queue.resumeAll.bind(queue),
        }}
      >
        {visibleToasts.map((toast) => (
          <Toast key={toast.key} toast={toast} />
        ))}
      </ToastStateContext.Provider>
    </div>
  );
}

function StaticToastGrid({
  toasts,
  className,
}: {
  toasts: readonly StaticToastPreview[];
  className?: string;
}) {
  return (
    <div
      className={[
        'grid w-full grid-cols-1 justify-items-center gap-x-4 gap-y-5 md:grid-cols-2 xl:grid-cols-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {toasts.map((toast) => (
        <StaticToastCard key={toast.id} {...toast} />
      ))}
    </div>
  );
}

function useStoryToastQueue(maxVisibleToasts?: number) {
  const queue = useMemo(
    () => createToastQueue<VeliToastContent>({ maxVisibleToasts }),
    [maxVisibleToasts],
  );

  useEffect(() => () => queue.clear(), [queue]);

  return queue;
}

const getDefaultStaticToasts = (text: LocalizedToastText, examples: ToastExamples) =>
  statusIntents.map((intent) => ({
    id: intent,
    label: getVariantLabel(text, 'outline', intent),
    content: {
      ...examples[intent],
      intent,
      appearance: 'outline',
    },
  })) satisfies StaticToastPreview[];

const getAppearanceStaticToasts = (text: LocalizedToastText, examples: ToastExamples) =>
  appearances.map((appearance) => ({
    appearance,
    label: text.appearanceLabels[appearance],
    toasts: statusIntents.map((intent) => ({
      id: `${appearance}-${intent}`,
      label: getVariantLabel(text, appearance, intent),
      content: {
        ...examples[intent],
        intent,
        appearance,
      },
    })),
  })) satisfies {
    appearance: ToastAppearance;
    label: string;
    toasts: StaticToastPreview[];
  }[];

const meta = {
  title: 'Components/Toast',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultStory() {
    const queue = useStoryToastQueue(3);
    const text = useToastText();
    const toastExamples = getToastExamples(text);
    const staticToasts = getDefaultStaticToasts(text, toastExamples);

    return (
      <>
        <ToastRegion queue={queue} placement="bottom-end" />
        <ToastStoryShell
          controls={statusIntents.map((intent) => (
            <Button
              key={intent}
              intent={getStatusButtonIntent(intent)}
              onPress={() =>
                queue.add(
                  {
                    ...toastExamples[intent],
                    intent,
                    appearance: 'outline',
                  },
                  { timeout: intent === 'danger' ? 0 : 5000 },
                )
              }
            >
              {text.intentLabels[intent]}
            </Button>
          ))}
        >
          <StaticToastGrid toasts={staticToasts} />
        </ToastStoryShell>
      </>
    );
  },
};

export const Appearances: Story = {
  render: function AppearancesStory() {
    const queue = useStoryToastQueue(6);
    const text = useToastText();
    const toastExamples = getToastExamples(text);
    const staticToasts = getAppearanceStaticToasts(text, toastExamples);

    return (
      <>
        <ToastRegion queue={queue} placement="bottom-end" />
        <div className="mx-auto flex min-h-[640px] w-full max-w-6xl flex-col justify-center gap-8 p-8">
          {staticToasts.map(({ appearance, label, toasts }) => (
            <div key={appearance} className="flex flex-col items-center gap-3">
              <p className="type-body-sm-medium text-base-emphasis">{label}</p>
              <StaticToastGrid toasts={toasts} />
              <div className="flex flex-wrap justify-center gap-2">
                {statusIntents.map((intent) => (
                  <Button
                    key={`${appearance}-${intent}`}
                    intent={getStatusButtonIntent(intent)}
                    onPress={() =>
                      queue.add(
                        {
                          ...toastExamples[intent],
                          intent,
                          appearance,
                        },
                        { timeout: 8000 },
                      )
                    }
                  >
                    {text.intentLabels[intent]}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  },
};

const progressIntents = ['positive', 'info', 'warning'] as const satisfies readonly ToastIntent[];

type ActionToastPreview = StaticToastPreview & {
  timeout: number;
};

const getActionToastExamples = (text: LocalizedToastText) =>
  [
    {
      id: 'single-action',
      label: text.singleAction,
      content: {
        title: text.fileDeleted,
        description: text.budgetRemoved,
        intent: 'neutral',
        appearance: 'outline',
        actions: [{ id: 'undo', label: text.undo, intent: 'primary', appearance: 'fill' }],
      },
      timeout: 0,
    },
    {
      id: 'multiple-actions',
      label: text.multipleActions,
      content: {
        title: text.uploadFailed,
        description: text.fileCouldNotBeProcessed,
        intent: 'danger',
        appearance: 'subtle',
        actions: [
          { id: 'retry', label: text.retry, intent: 'primary', appearance: 'fill' },
          { id: 'dismiss', label: text.dismiss, intent: 'secondary', appearance: 'transparent' },
        ],
      },
      timeout: 0,
    },
    {
      id: 'emphasis-actions',
      label: text.emphasisActions,
      content: {
        title: text.updateAvailable,
        description: text.versionReady,
        intent: 'info',
        appearance: 'emphasis',
        actions: [
          { id: 'install-now', label: text.installNow, intent: 'primary', appearance: 'fill' },
          { id: 'later', label: text.later, intent: 'secondary', appearance: 'ghost' },
        ],
      },
      timeout: 0,
    },
  ] satisfies ActionToastPreview[];

const getProgressToastExamples = (text: LocalizedToastText, examples: ToastExamples) =>
  progressIntents.map((intent, index) => ({
    id: intent,
    label: `${text.progress} ${text.intentLabels[intent]}`,
    content: {
      ...examples[intent],
      intent,
      appearance: 'outline' as const,
      showProgress: true,
    },
    progress: [0.82, 0.56, 0.3][index],
  })) satisfies StaticToastPreview[];

export const WithActions: Story = {
  render: function WithActionsStory() {
    const queue = useStoryToastQueue(3);
    const text = useToastText();
    const actionToastExamples = getActionToastExamples(text);

    return (
      <>
        <ToastRegion queue={queue} placement="bottom-end" />
        <ToastStoryShell
          controls={actionToastExamples.map((example) => (
            <Button
              key={example.id}
              intent={example.id === 'emphasis-actions' ? 'primary' : 'secondary'}
              onPress={() => queue.add(example.content, { timeout: example.timeout })}
            >
              {example.label}
            </Button>
          ))}
        >
          <StaticToastGrid toasts={actionToastExamples} />
        </ToastStoryShell>
      </>
    );
  },
};

export const WithProgress: Story = {
  render: function WithProgressStory() {
    const queue = useStoryToastQueue(3);
    const text = useToastText();
    const toastExamples = getToastExamples(text);
    const progressToastExamples = getProgressToastExamples(text, toastExamples);

    return (
      <>
        <ToastRegion queue={queue} placement="bottom-end" />
        <ToastStoryShell
          controls={progressIntents.map((intent) => (
            <Button
              key={intent}
              intent={
                intent === 'warning' ? 'danger' : intent === 'positive' ? 'primary' : 'secondary'
              }
              onPress={() =>
                queue.add(
                  {
                    ...toastExamples[intent],
                    intent,
                    appearance: 'outline',
                    showProgress: true,
                  },
                  { timeout: 8000 },
                )
              }
            >
              {text.intentLabels[intent]}
            </Button>
          ))}
        >
          <StaticToastGrid toasts={progressToastExamples} />
        </ToastStoryShell>
      </>
    );
  },
};

export const Placements: Story = {
  render: function PlacementsStory() {
    const queue = useStoryToastQueue(3);
    const text = useToastText();
    const [placement, setPlacement] =
      useState<NonNullable<ToastRegionProps<VeliToastContent>['placement']>>('bottom-end');
    return (
      <>
        <ToastRegion queue={queue} placement={placement} />
        <ToastStoryShell
          controls={['top', 'bottom', 'top-start', 'top-end', 'bottom-start', 'bottom-end'].map(
            (value) => (
              <Button
                key={value}
                onPress={() => {
                  setPlacement(value as typeof placement);
                  queue.clear();
                  queue.add(
                    { title: text.applicationSaved, description: text.draftStored },
                    { timeout: 0 },
                  );
                }}
              >
                {value}
              </Button>
            ),
          )}
        >
          <p className="type-body-sm-regular text-base-default">{text.noteSaved}</p>
        </ToastStoryShell>
      </>
    );
  },
};

export const NarrowLongContent: Story = {
  render: function NarrowLongContentStory() {
    const text = useToastText();
    const toasts = useMemo(
      () => [
        {
          id: 'long',
          label: text.multipleActions,
          content: {
            title: `${text.applicationSaved} — ${text.applicationSaved}`,
            description: (
              <>
                {text.draftStored} {text.draftStored}{' '}
                <bdi>application_reference_12345678901234567890123456789012345678901234567890</bdi>
              </>
            ),
            actions: [
              { label: `${text.retry} ${text.retry} ${text.retry}`, dismissOnPress: false },
              { label: text.undo, intent: 'accent' as const },
            ],
          },
        },
        {
          id: 'no-close',
          label: text.noteAdded,
          content: {
            title: text.noteAdded,
            showCloseButton: false,
            actions: [{ label: text.dismiss }],
          },
        },
      ],
      [text],
    );
    return (
      <div className="mx-auto w-full max-w-[288px] p-4">
        <StaticToastGrid toasts={toasts} />
      </div>
    );
  },
};

export const Composition: Story = {
  render: function CompositionStory() {
    const queue = useStoryToastQueue(2);
    const text = useToastText();
    const [count, setCount] = useState(0);
    return (
      <>
        <ToastRegion
          queue={queue}
          className={({ isHovered }) => (isHovered ? 'ring-1 ring-border-focus' : '')}
          style={{ maxWidth: 360 }}
        >
          {({ toast }) => (
            <Toast
              toast={toast}
              className={({ isFocusVisible }) => (isFocusVisible ? 'ring-2' : '')}
              style={() => ({ borderStyle: 'dashed' })}
            >
              {({ toast: current }) => (
                <>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <ToastContent toast={current} />
                    <ToastActions toast={current} className="gap-3" />
                  </div>
                  <ToastCloseButton aria-label={text.dismiss} />
                  <ToastTimeoutProgress toast={current} />
                </>
              )}
            </Toast>
          )}
        </ToastRegion>
        <ToastStoryShell
          controls={
            <>
              <Button
                onPress={() =>
                  queue.add(
                    {
                      title: text.updateAvailable,
                      description: 0,
                      actions: [
                        {
                          label: text.retry,
                          dismissOnPress: false,
                          onPress: () => setCount((value) => value + 1),
                        },
                        { label: text.dismiss },
                      ],
                    },
                    { timeout: 0 },
                  )
                }
              >
                {text.singleAction}
              </Button>
              <Button onPress={() => queue.clear()}>{text.dismiss}</Button>
            </>
          }
        >
          <output className="type-body-sm-regular text-base-default">
            {text.singleAction}: {count}
          </output>
        </ToastStoryShell>
      </>
    );
  },
};

export const ActionIdentity: Story = {
  render: function ActionIdentityStory() {
    const queue = useStoryToastQueue(1);
    const text = useToastText();
    const [reverse, setReverse] = useState(false);
    useEffect(() => {
      const key = queue.add({ title: text.updateAvailable });
      return () => queue.close(key);
    }, [queue, text]);
    const actions = [
      { id: 'retry', label: text.retry, dismissOnPress: false },
      { id: 'later', label: text.later, dismissOnPress: false },
    ];
    return (
      <>
        <ToastRegion queue={queue}>
          {({ toast }) => (
            <Toast
              toast={{
                ...toast,
                content: { ...toast.content, actions: reverse ? [...actions].reverse() : actions },
              }}
            />
          )}
        </ToastRegion>
        <ToastStoryShell
          controls={<Button onPress={() => setReverse((value) => !value)}>Reverse actions</Button>}
        >
          <p className="type-body-sm-regular text-base-default">{text.multipleActions}</p>
        </ToastStoryShell>
      </>
    );
  },
};
