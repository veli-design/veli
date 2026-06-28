import { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@tradenetcorp/veli-ui/button';
import {
  createToastQueue,
  Toast,
  ToastRegion,
  type ToastAppearance,
  type ToastIntent,
  type VeliToastContent,
} from '@tradenetcorp/veli-ui/toast';

const demoQueue = createToastQueue<VeliToastContent>({
  maxVisibleToasts: 3,
});

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

const meta = {
  title: 'Components/Toast',
  component: ToastRegion,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    queue: demoQueue,
  },
  decorators: [
    (Story) => (
      <>
        <ToastRegion queue={demoQueue} placement="bottom-end" />
        <div className="flex min-h-[320px] items-center justify-center p-8">
          <Story />
        </div>
      </>
    ),
  ],
} satisfies Meta<typeof ToastRegion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {statusIntents.map((intent) => (
        <Button
          key={intent}
          intent={intent === 'danger' ? 'danger' : intent === 'positive' ? 'primary' : 'secondary'}
          onPress={() =>
            demoQueue.add(
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
  ),
};

export const Appearances: Story = {
  render: () => {
    const queue = useMemo(() => createToastQueue<VeliToastContent>({ maxVisibleToasts: 6 }), []);

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

export const CustomRender: Story = {
  render: () => {
    const queue = useMemo(() => createToastQueue<VeliToastContent>(), []);

    return (
      <>
        <ToastRegion queue={queue} placement="top">
          {({ toast }) => (
            <Toast
              toast={toast}
              intent={toast.content.intent}
              appearance={toast.content.appearance}
            />
          )}
        </ToastRegion>
        <Button
          onPress={() =>
            queue.add({
              title: 'Custom toast region',
              description: 'Rendered with an explicit Toast child.',
              intent: 'info',
              appearance: 'subtle',
            })
          }
        >
          Queue custom toast
        </Button>
      </>
    );
  },
};
