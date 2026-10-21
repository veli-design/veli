import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { UNSTABLE_ToastStateContext as ToastStateContext } from 'react-aria-components';
import { Button } from '@tradenetcorp/veli-ui/button';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import {
  createToastQueue,
  Toast,
  ToastRegion,
  type ToastAppearance,
  type ToastIntent,
  type ToastRegionProps,
  type VeliToastContent,
} from '@tradenetcorp/veli-ui/toast';

const appearances: ToastAppearance[] = ['outline', 'subtle', 'emphasis'];
const intents: ToastIntent[] = ['neutral', 'info', 'positive', 'cautious', 'warning', 'danger'];
type Placement = NonNullable<ToastRegionProps<VeliToastContent>['placement']>;

const toastText = {
  en: {
    title: 'Application saved',
    description: 'Your draft has been stored securely.',
    showToast: 'Show notification',
    showToasts: 'Show notifications',
    progressHint: 'Show a notification to see the countdown.',
    undo: 'Undo',
    retry: 'Retry',
    dismiss: 'Dismiss',
    later: 'Later',
    reverse: 'Reverse actions',
    actions: 'Actions',
    attempts: 'Attempts',
    noClose: 'Without close button',
    deleted: 'File deleted',
    restored: 'The file can still be restored.',
    failed: 'Upload failed',
    tryAgain: 'The file could not be processed. Try again.',
    appearance: { outline: 'Outline', subtle: 'Subtle', emphasis: 'Emphasis' },
    intent: {
      neutral: 'Neutral',
      info: 'Info',
      positive: 'Positive',
      cautious: 'Cautious',
      warning: 'Warning',
      danger: 'Danger',
    },
  },
  dv: {
    title: 'އެޕްލިކޭޝަން ސޭވްކުރެވިއްޖެ',
    description: 'ތިޔަ ޑްރާފްޓް ރައްކާތެރިކަމާއެކު ސޭވްކުރެވިއްޖެ.',
    showToast: 'ނޮޓިފިކޭޝަން ދައްކާ',
    showToasts: 'ނޮޓިފިކޭޝަންތައް ދައްކާ',
    progressHint: 'ޕްރޮގްރެސް ބެލުމަށް ނޮޓިފިކޭޝަނެއް ދައްކާ.',
    undo: 'އަންޑޫ',
    retry: 'އަލުން މަސައްކަތްކުރޭ',
    dismiss: 'ޑިސްމިސް',
    later: 'ފަހުން',
    reverse: 'އެކްޝަންތަކުގެ ތަރުތީބު ބަދަލުކުރޭ',
    actions: 'އެކްޝަންތައް',
    attempts: 'މަސައްކަތްކުރި އަދަދު',
    noClose: 'ބަންދުކުރާ ބަޓަން ނެތި',
    deleted: 'ފައިލް ފޮހެލެވިއްޖެ',
    restored: 'ފައިލް އަނބުރާ ލިބިގެންދާނެ.',
    failed: 'އަޕްލޯޑް ނުކުރެވުނު',
    tryAgain: 'މި ފައިލް ޕްރޮސެސްއެއް ނުކުރެވުނު. އަލުން މަސައްކަތްކުރައްވާ.',
    appearance: { outline: 'އައުޓްލައިން', subtle: 'ސަބްޓަލް', emphasis: 'އެމްފަސިސް' },
    intent: {
      neutral: 'ނިއުޓްރަލް',
      info: 'އިންފޯ',
      positive: 'ޕޮޒިޓިވް',
      cautious: 'ކޯޝަސް',
      warning: 'ވޯނިންގ',
      danger: 'ޑޭންޖަރ',
    },
  },
} as const;

const useToastText = () => toastText[useVeliLanguage().direction === 'rtl' ? 'dv' : 'en'];
const localizedArg = (
  value: string,
  key: 'title' | 'description',
  text: ReturnType<typeof useToastText>,
) =>
  !value.trim() || value === toastText.en[key] || value === toastText.dv[key] ? text[key] : value;

function useToastQueue() {
  const queue = useMemo(() => createToastQueue<VeliToastContent>({ maxVisibleToasts: 3 }), []);
  useEffect(() => () => queue.clear(), [queue]);
  return queue;
}

function ToastPreview({ content }: { content: VeliToastContent }) {
  // Keep real Toasts inline; ToastRegion renders its notifications in a portal.
  const queue = useMemo(() => {
    const result = createToastQueue<VeliToastContent>({ wrapUpdate: (fn) => fn() });
    result.add({ title: null });
    return result;
  }, []);
  useEffect(() => () => queue.clear(), [queue]);
  const subscribe = useCallback((onChange: () => void) => queue.subscribe(onChange), [queue]);
  const snapshot = useCallback(() => queue.visibleToasts, [queue]);
  const visibleToasts = useSyncExternalStore(subscribe, snapshot, snapshot);
  return (
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
        <Toast key={toast.key} toast={{ ...toast, content: { ...content, showProgress: false } }} />
      ))}
    </ToastStateContext.Provider>
  );
}

interface ToastStoryArgs {
  title: string;
  description: string;
  appearance: ToastAppearance;
  intent: ToastIntent;
  placement: Placement;
  showCloseButton: boolean;
  showProgress: boolean;
  timeout: number;
}

const contentFromArgs = (
  args: ToastStoryArgs,
  text: ReturnType<typeof useToastText>,
): VeliToastContent => ({
  title: localizedArg(args.title, 'title', text),
  description: localizedArg(args.description, 'description', text),
  appearance: args.appearance,
  intent: args.intent,
  showCloseButton: args.showCloseButton,
  showProgress: args.showProgress,
});

const collapsedControlGroups = ['Content', 'State'] as const;

function ToastDocsContainer(props: DocsContainerProps) {
  useEffect(() => {
    let frame = 0;
    let attempts = 0;
    const collapseGroups = () => {
      const ready = collapsedControlGroups.every((group) =>
        document.querySelector(`tr[title^="Hide ${group} item"], tr[title^="Show ${group} item"]`),
      );
      if (!ready && attempts++ < 40) {
        frame = requestAnimationFrame(collapseGroups);
        return;
      }
      collapsedControlGroups.forEach((group) =>
        document
          .querySelector(`tr[title^="Hide ${group} item"]`)
          ?.querySelector<HTMLElement>('[tabindex="0"]')
          ?.click(),
      );
    };
    collapseGroups();
    return () => cancelAnimationFrame(frame);
  }, []);
  return <DocsContainer {...props} />;
}

const meta = {
  title: 'Components/Toast',
  parameters: {
    layout: 'padded',
    controls: { sort: 'none' },
    docs: { container: ToastDocsContainer },
  },
  tags: ['autodocs'],
  argTypes: {
    appearance: { control: 'select', options: appearances, table: { category: 'Appearance' } },
    intent: { control: 'select', options: intents, table: { category: 'Appearance' } },
    title: { control: 'text', table: { category: 'Content' } },
    description: { control: 'text', table: { category: 'Content' } },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'top-start', 'top-end', 'bottom-start', 'bottom-end'],
      table: { category: 'State' },
    },
    showCloseButton: { control: 'boolean', table: { category: 'State' } },
    showProgress: {
      control: 'boolean',
      description: 'Show the countdown on queued notifications.',
      table: { category: 'State' },
    },
    timeout: {
      description: 'Auto-dismiss delay in milliseconds for queued notifications.',
      control: { type: 'number', min: 0, step: 1000 },
      table: { category: 'State' },
    },
  },
  args: {
    appearance: 'outline',
    intent: 'neutral',
    title: toastText.en.title,
    description: toastText.en.description,
    placement: 'bottom-end',
    showCloseButton: true,
    showProgress: false,
    timeout: 5000,
  },
} satisfies Meta<ToastStoryArgs>;
export default meta;
type Story = StoryObj<ToastStoryArgs>;

export const Default: Story = {
  render: function DefaultStory(args) {
    const text = useToastText();
    const queue = useToastQueue();
    const content = contentFromArgs(args, text);
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col items-start gap-4">
        <ToastPreview content={content} />
        {args.showProgress ? (
          <p className="type-body-sm-regular text-base-muted">{text.progressHint}</p>
        ) : null}
        <Button onPress={() => queue.add(content, { timeout: args.timeout })}>
          {text.showToast}
        </Button>
        <ToastRegion queue={queue} placement={args.placement} />
      </div>
    );
  },
};

export const Appearances: Story = {
  parameters: { controls: { include: ['intent', 'title', 'description', 'showCloseButton'] } },
  render: function AppearancesStory(args) {
    const text = useToastText();
    return (
      <div className="mx-auto grid w-full max-w-[1200px] gap-6 md:grid-cols-3">
        {appearances.map((appearance) => (
          <div key={appearance} className="flex flex-col gap-3">
            <p className="type-body-sm-medium text-base-muted">{text.appearance[appearance]}</p>
            <ToastPreview content={{ ...contentFromArgs(args, text), appearance }} />
          </div>
        ))}
      </div>
    );
  },
};

export const Intents: Story = {
  parameters: { controls: { include: ['appearance', 'title', 'description', 'showCloseButton'] } },
  render: function IntentsStory(args) {
    const text = useToastText();
    return (
      <div className="mx-auto grid w-full max-w-[1200px] gap-6 md:grid-cols-2 lg:grid-cols-3">
        {intents.map((intent) => (
          <div key={intent} className="flex flex-col gap-3">
            <p className="type-body-sm-medium text-base-muted">{text.intent[intent]}</p>
            <ToastPreview content={{ ...contentFromArgs(args, text), intent }} />
          </div>
        ))}
      </div>
    );
  },
};

export const WithActions: Story = {
  parameters: { controls: { disable: true } },
  render: function WithActionsStory() {
    const text = useToastText();
    const [attempts, setAttempts] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [version, setVersion] = useState(0);
    const actions = useMemo(
      () => [
        {
          id: 'retry',
          label: text.retry,
          dismissOnPress: false,
          onPress: () => setAttempts((value) => value + 1),
        },
        { id: 'dismiss', label: text.dismiss, appearance: 'ghost' as const },
      ],
      [text],
    );
    return (
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-4">
        <div className="grid w-full gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-3" data-example="undo">
            <p className="type-body-sm-medium text-base-muted">{text.undo}</p>
            <ToastPreview
              key={version}
              content={{
                title: text.deleted,
                description: text.restored,
                actions: [{ id: 'undo', label: text.undo, intent: 'accent' }],
              }}
            />
          </div>
          <div className="flex flex-col items-start gap-3" data-example="actions">
            <p className="type-body-sm-medium text-base-muted">{text.actions}</p>
            <ToastPreview
              key={version}
              content={{
                title: text.failed,
                description: text.tryAgain,
                intent: 'danger',
                appearance: 'subtle',
                actions: reverse ? [...actions].reverse() : actions,
              }}
            />
            <output className="type-body-sm-regular text-base-muted">
              {text.attempts}: <bdi>{attempts}</bdi>
            </output>
            <Button size="sm" preventFocusOnPress onPress={() => setReverse((value) => !value)}>
              {text.reverse}
            </Button>
          </div>
          <div className="flex flex-col gap-3" data-example="no-close">
            <p className="type-body-sm-medium text-base-muted">{text.noClose}</p>
            <ToastPreview
              key={version}
              content={{
                title: text.title,
                description: text.description,
                showCloseButton: false,
                actions: [{ id: 'later', label: text.later, appearance: 'ghost' }],
              }}
            />
          </div>
        </div>
        <Button
          onPress={() => {
            setAttempts(0);
            setReverse(false);
            setVersion((value) => value + 1);
          }}
        >
          {text.showToasts}
        </Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const text =
      toastText[
        canvasElement.querySelector('[role="alertdialog"]')?.getAttribute('lang') === 'dv'
          ? 'dv'
          : 'en'
      ];
    const canvas = within(canvasElement);
    const example = canvasElement.querySelector('[data-example="actions"]') as HTMLElement;
    const actions = within(example);
    const retry = actions.getByRole('button', { name: text.retry });
    await userEvent.click(retry);
    await expect(example.querySelector('output')).toHaveTextContent('1');
    await expect(actions.getByRole('alertdialog')).toBeInTheDocument();
    retry.focus();
    await userEvent.click(actions.getByRole('button', { name: text.reverse }));
    await waitFor(() => expect(actions.getByRole('button', { name: text.retry })).toBe(retry));
    await expect(retry).toHaveFocus();
    await userEvent.click(actions.getByRole('button', { name: text.dismiss }));
    await expect(actions.queryByRole('alertdialog')).not.toBeInTheDocument();
    const noClose = within(canvasElement.querySelector('[data-example="no-close"]') as HTMLElement);
    await expect(noClose.getAllByRole('button')).toHaveLength(1);
    await userEvent.click(noClose.getByRole('button', { name: text.later }));
    await expect(noClose.queryByRole('alertdialog')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: text.undo }));
    await userEvent.click(canvas.getByRole('button', { name: text.showToasts }));
    await expect(canvas.getAllByRole('alertdialog')).toHaveLength(3);
  },
};

export const WithProgress: Story = {
  args: { intent: 'positive', showProgress: true, timeout: 8000 },
  parameters: {
    controls: {
      include: [
        'title',
        'description',
        'appearance',
        'intent',
        'placement',
        'timeout',
        'showCloseButton',
      ],
    },
  },
  render: Default.render,
};
