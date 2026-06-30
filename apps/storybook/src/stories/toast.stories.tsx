import { useEffect, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@tradenetcorp/veli-ui/button';
import {
  createToastQueue,
  ToastRegion,
  type ToastAppearance,
  type ToastIntent,
  type VeliToastContent,
} from '@tradenetcorp/veli-ui/toast';

const appearances: ToastAppearance[] = ['outline', 'subtle', 'emphasis'];

const statusIntents: ToastIntent[] = [
  'neutral',
  'info',
  'positive',
  'cautious',
  'warning',
  'danger',
];

const toastExamples = {
  neutral: {
    title: 'Note added',
    description: 'Your note has been saved to this record.',
  },
  info: {
    title: 'New update available',
    description: 'A new version is ready to install.',
  },
  positive: {
    title: 'Application saved',
    description: 'Your draft has been stored securely.',
  },
  cautious: {
    title: 'Review required',
    description: 'Some fields need your attention before submitting.',
  },
  warning: {
    title: 'Connection unstable',
    description: 'We will retry automatically in a moment.',
  },
  danger: {
    title: 'Upload failed',
    description: 'The file could not be processed. Try again.',
  },
} satisfies Record<ToastIntent, Pick<VeliToastContent, 'title' | 'description'>>;

function useStoryToastQueue(maxVisibleToasts?: number) {
  const queue = useMemo(
    () => createToastQueue<VeliToastContent>({ maxVisibleToasts }),
    [maxVisibleToasts],
  );

  useEffect(() => () => queue.clear(), [queue]);

  return queue;
}

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

    return (
      <>
        <ToastRegion queue={queue} placement="bottom-end" />
        <div className="flex min-h-[320px] flex-wrap items-center justify-center gap-3 p-8">
          {statusIntents.map((intent) => (
            <Button
              key={intent}
              intent={
                intent === 'danger' ? 'danger' : intent === 'positive' ? 'primary' : 'secondary'
              }
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
              {intent}
            </Button>
          ))}
        </div>
      </>
    );
  },
};

export const Appearances: Story = {
  render: function AppearancesStory() {
    const queue = useStoryToastQueue(6);

    return (
      <>
        <ToastRegion queue={queue} placement="bottom-end" />
        <div className="flex flex-col gap-6">
          {appearances.map((appearance) => (
            <div key={appearance} className="space-y-2">
              <p className="type-body-sm-medium text-text-default-emphasis capitalize">
                {appearance}
              </p>
              <div className="flex flex-wrap gap-2">
                {statusIntents.map((intent) => (
                  <Button
                    key={`${appearance}-${intent}`}
                    intent={
                      intent === 'danger'
                        ? 'danger'
                        : intent === 'positive'
                          ? 'primary'
                          : 'secondary'
                    }
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
                    {intent}
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

export const WithActions: Story = {
  render: function WithActionsStory() {
    const queue = useStoryToastQueue(3);

    return (
      <>
        <ToastRegion queue={queue} placement="bottom-end" />
        <div className="flex min-h-80 flex-col items-center justify-center gap-4 p-8">
          <p className="type-body-sm-regular max-w-md text-center text-text-default-muted">
            Toasts with actions stay open until dismissed. Use{' '}
            <code className="type-caption-regular">timeout: 0</code> when queueing them.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              intent="secondary"
              onPress={() =>
                queue.add(
                  {
                    title: 'File deleted',
                    description: 'Budget.xlsx was removed from your workspace.',
                    intent: 'neutral',
                    appearance: 'outline',
                    actions: [{ label: 'Undo', intent: 'primary', appearance: 'fill' }],
                  },
                  { timeout: 0 },
                )
              }
            >
              Single action
            </Button>
            <Button
              intent="secondary"
              onPress={() =>
                queue.add(
                  {
                    title: 'Upload failed',
                    description: 'The file could not be processed.',
                    intent: 'danger',
                    appearance: 'subtle',
                    actions: [
                      { label: 'Retry', intent: 'primary', appearance: 'fill' },
                      { label: 'Dismiss', intent: 'secondary', appearance: 'transparent' },
                    ],
                  },
                  { timeout: 0 },
                )
              }
            >
              Multiple actions
            </Button>
            <Button
              intent="primary"
              onPress={() =>
                queue.add(
                  {
                    title: 'Update available',
                    description: 'Version 2.4 is ready to install.',
                    intent: 'info',
                    appearance: 'emphasis',
                    actions: [
                      { label: 'Install now', intent: 'primary', appearance: 'fill' },
                      { label: 'Later', intent: 'secondary', appearance: 'ghost' },
                    ],
                  },
                  { timeout: 0 },
                )
              }
            >
              Emphasis actions
            </Button>
          </div>
        </div>
      </>
    );
  },
};

export const WithProgress: Story = {
  render: function WithProgressStory() {
    const queue = useStoryToastQueue(3);

    return (
      <>
        <ToastRegion queue={queue} placement="bottom-end" />
        <div className="flex min-h-80 flex-col items-center justify-center gap-4 p-8">
          <p className="type-body-sm-regular max-w-md text-center text-text-default-muted">
            Set <code className="type-caption-regular">showProgress: true</code> on auto-dismiss
            toasts to show a depleting bar. Hover or focus a toast to pause the timer.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {progressIntents.map((intent) => (
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
                {intent}
              </Button>
            ))}
          </div>
        </div>
      </>
    );
  },
};
