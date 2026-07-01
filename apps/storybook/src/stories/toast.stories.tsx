import { useEffect, useMemo, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@tradenetcorp/veli-ui/button';
import {
  createToastQueue,
  ToastRegion,
  type ToastAppearance,
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

function getStaticToastActionKey(action: NonNullable<VeliToastContent['actions']>[number]) {
  if (action.id != null) {
    return action.id;
  }

  if (typeof action.label === 'string' || typeof action.label === 'number') {
    return action.label;
  }

  return action.intent ?? action.appearance ?? 'toast-action';
}

const getStatusButtonIntent = (intent: ToastIntent) => {
  if (intent === 'danger') {
    return 'danger';
  }

  if (intent === 'positive') {
    return 'primary';
  }

  return 'secondary';
};

const staticToastIntentClasses = {
  outline: {
    neutral: 'border-status-neutral-subtle bg-bg-surface-raised text-text-default-default',
    info: 'border-status-info-subtle bg-bg-surface-raised text-text-primary-default',
    positive: 'border-status-success-subtle bg-bg-surface-raised text-text-success-default',
    cautious: 'border-status-cautious-subtle bg-bg-surface-raised text-text-cautious-default',
    warning: 'border-status-warning-subtle bg-bg-surface-raised text-text-warning-default',
    danger: 'border-status-danger-subtle bg-bg-surface-raised text-text-danger-default',
  },
  subtle: {
    neutral: 'border-status-neutral-subtle bg-status-neutral-subtle text-text-default-strong',
    info: 'border-status-info-subtle bg-status-info-subtle text-text-primary-strong',
    positive: 'border-status-success-subtle bg-status-success-subtle text-text-success-strong',
    cautious: 'border-status-cautious-subtle bg-status-cautious-subtle text-text-cautious-strong',
    warning: 'border-status-warning-subtle bg-status-warning-subtle text-text-warning-strong',
    danger: 'border-status-danger-subtle bg-status-danger-subtle text-text-danger-strong',
  },
  emphasis: {
    neutral: 'border-status-neutral-emphasis bg-status-neutral-emphasis text-text-default-inverted',
    info: 'border-status-info-emphasis bg-status-info-emphasis text-text-primary-inverted',
    positive:
      'border-status-success-emphasis bg-status-success-emphasis text-text-success-inverted',
    cautious:
      'border-status-cautious-emphasis bg-status-cautious-emphasis text-text-cautious-inverted',
    warning: 'border-status-warning-emphasis bg-status-warning-emphasis text-text-warning-inverted',
    danger: 'border-status-danger-emphasis bg-status-danger-emphasis text-text-danger-inverted',
  },
} satisfies Record<ToastAppearance, Record<ToastIntent, string>>;

const staticToastDescriptionClasses = {
  outline: 'text-text-default-muted',
  subtle: 'text-text-default-muted',
  emphasis: 'text-current opacity-80',
} satisfies Record<ToastAppearance, string>;

const staticToastCloseButtonClasses = {
  outline: 'text-icon-default-default',
  subtle: 'text-icon-default-default',
  emphasis: 'text-current',
} satisfies Record<ToastAppearance, string>;

const staticToastProgressTrackClasses = {
  outline: 'bg-gray-alpha-100',
  subtle: 'bg-gray-alpha-200',
  emphasis: 'bg-black/10',
} satisfies Record<ToastAppearance, string>;

const staticToastProgressIntentFillClasses = {
  neutral: 'bg-status-neutral-emphasis',
  info: 'bg-status-info-emphasis',
  positive: 'bg-status-success-emphasis',
  cautious: 'bg-status-cautious-emphasis',
  warning: 'bg-status-warning-emphasis',
  danger: 'bg-status-danger-emphasis',
} satisfies Record<ToastIntent, string>;

function ToastStoryShell({ children, controls }: { children: ReactNode; controls: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[420px] w-full max-w-6xl flex-col items-center justify-center gap-10 p-8">
      {children}
      <div className="flex flex-wrap justify-center gap-3">{controls}</div>
    </div>
  );
}

function StaticToastCard({ label, content, progress }: StaticToastPreview) {
  const intent = content.intent ?? 'neutral';
  const appearance = content.appearance ?? 'outline';

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <p className="type-caption-medium text-start text-text-default-muted">{label}</p>
      <div
        className={[
          'relative flex min-h-[112px] w-full items-start gap-3 overflow-hidden rounded-xl border p-4 font-sans antialiased shadow-md outline-none',
          staticToastIntentClasses[appearance][intent],
        ].join(' ')}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="type-body-sm-medium">{content.title}</p>
            {content.description ? (
              <p
                className={['type-body-sm-regular', staticToastDescriptionClasses[appearance]].join(
                  ' ',
                )}
              >
                {content.description}
              </p>
            ) : null}
          </div>
          {content.actions?.length ? (
            <div className="flex flex-wrap items-center gap-2">
              {content.actions.map((action) => {
                const actionAppearance = action.appearance ?? 'fill';
                const emphasisQuietActionClassName =
                  appearance === 'emphasis' && actionAppearance !== 'fill'
                    ? 'text-current hover:bg-white/15 active:bg-white/20'
                    : undefined;

                return (
                  <Button
                    key={getStaticToastActionKey(action)}
                    size="xs"
                    intent={action.intent ?? 'secondary'}
                    appearance={actionAppearance}
                    className={emphasisQuietActionClassName}
                  >
                    {action.label}
                  </Button>
                );
              })}
            </div>
          ) : null}
        </div>
        <span
          aria-hidden="true"
          className={[
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full outline-none',
            staticToastCloseButtonClasses[appearance],
          ].join(' ')}
        >
          <svg
            aria-hidden="true"
            className="size-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            <path d="M4 4 12 12" />
            <path d="M12 4 4 12" />
          </svg>
        </span>
        {content.showProgress ? (
          <div
            aria-hidden="true"
            className={[
              'pointer-events-none absolute inset-x-0 bottom-0 h-1 overflow-hidden rounded-b-[inherit]',
              staticToastProgressTrackClasses[appearance],
            ].join(' ')}
          >
            <div
              className={[
                'h-full origin-left will-change-transform',
                appearance === 'emphasis'
                  ? 'bg-white/70'
                  : staticToastProgressIntentFillClasses[intent],
              ].join(' ')}
              style={{ transform: `scaleX(${progress ?? 0.68})` }}
            />
          </div>
        ) : null}
      </div>
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
              <p className="type-body-sm-medium text-text-default-emphasis">{label}</p>
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
