import { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@tradenetcorp/veli-ui/button';
import {
  createToastQueue,
  Toast,
  ToastRegion,
  type VeliToastContent,
} from '@tradenetcorp/veli-ui/toast';

const demoQueue = createToastQueue<VeliToastContent>({
  maxVisibleToasts: 3,
});

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
      <Button
        onPress={() =>
          demoQueue.add(
            {
              title: 'Application saved',
              description: 'Your draft has been stored securely.',
              intent: 'positive',
            },
            { timeout: 5000 },
          )
        }
      >
        Show success toast
      </Button>
      <Button
        intent="secondary"
        onPress={() =>
          demoQueue.add(
            {
              title: 'Connection unstable',
              description: 'We will retry automatically in a moment.',
              intent: 'warning',
            },
            { timeout: 8000 },
          )
        }
      >
        Show warning toast
      </Button>
      <Button
        intent="danger"
        onPress={() =>
          demoQueue.add(
            {
              title: 'Upload failed',
              description: 'The file could not be processed. Try again.',
              intent: 'danger',
            },
            { timeout: 0 },
          )
        }
      >
        Show persistent toast
      </Button>
    </div>
  ),
};

export const CustomRender: Story = {
  render: () => {
    const queue = useMemo(() => createToastQueue<VeliToastContent>(), []);

    return (
      <>
        <ToastRegion queue={queue} placement="top">
          {({ toast }) => <Toast toast={toast} intent={toast.content.intent} />}
        </ToastRegion>
        <Button
          onPress={() =>
            queue.add({
              title: 'Custom toast region',
              description: 'Rendered with an explicit Toast child.',
              intent: 'info',
            })
          }
        >
          Queue custom toast
        </Button>
      </>
    );
  },
};
