import { useEffect, useMemo, useState } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { createToastQueue, ToastRegion, type VeliToastContent } from '@tradenetcorp/veli-ui/toast';

function useToastQueue() {
  const queue = useMemo(() => createToastQueue<VeliToastContent>({ maxVisibleToasts: 3 }), []);
  useEffect(() => () => queue.clear(), [queue]);
  return queue;
}

export function ToastUsageDemo() {
  const queue = useToastQueue();
  return (
    <>
      <Button
        onPress={() =>
          queue.add(
            {
              title: 'Application saved',
              description: 'Your draft has been stored securely.',
              intent: 'positive',
            },
            { timeout: 5000 },
          )
        }
      >
        Show toast
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
