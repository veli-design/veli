import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { UNSTABLE_ToastStateContext as ToastStateContext } from 'react-aria-components';
import { Button } from '@veli-design/react/button';
import { useVeliLanguage } from '@veli-design/react/provider';
import {
  createToastQueue,
  Toast,
  ToastRegion,
  type ToastAppearance,
  type ToastIntent,
  type ToastRegionProps,
  type VeliToastContent,
} from '@veli-design/react/toast';

const appearances: ToastAppearance[] = ['subtle', 'emphasis'];
const intents: ToastIntent[] = ['neutral', 'info', 'positive', 'cautious', 'warning', 'danger'];
type Placement = NonNullable<ToastRegionProps<VeliToastContent>['placement']>;
type ToastLanguage = 'en' | 'dv';

const toastText = {
  en: {
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
    appearance: { subtle: 'Default', emphasis: 'Emphasis' },
    intent: {
      neutral: 'Neutral',
      info: 'Info',
      positive: 'Positive',
      cautious: 'Cautious',
      warning: 'Warning',
      danger: 'Danger',
    },
    byIntent: {
      neutral: {
        title: 'Application saved',
        description: 'Your draft has been stored securely.',
      },
      info: {
        title: 'Update available',
        description: 'A newer version of this form is ready to review.',
      },
      positive: {
        title: 'Application submitted',
        description: 'Your application was received successfully.',
      },
      cautious: {
        title: 'Payment pending',
        description: 'Confirm your bank details to finish this payment.',
      },
      warning: {
        title: 'Session expiring soon',
        description: 'Sign in again within 5 minutes to keep your work.',
      },
      danger: {
        title: 'Upload failed',
        description: 'The file could not be processed. Try again.',
      },
    },
  },
  dv: {
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
    appearance: { subtle: 'ޑިފޯލްޓް', emphasis: 'އެމްފަސިސް' },
    intent: {
      neutral: 'ނިއުޓްރަލް',
      info: 'އިންފޯ',
      positive: 'ޕޮޒިޓިވް',
      cautious: 'ކޯޝަސް',
      warning: 'ވޯނިންގ',
      danger: 'ޑޭންޖަރ',
    },
    byIntent: {
      neutral: {
        title: 'އެޕްލިކޭޝަން ސޭވްކުރެވިއްޖެ',
        description: 'ތިޔަ ޑްރާފްޓް ރައްކާތެރިކަމާއެކު ސޭވްކުރެވިއްޖެ.',
      },
      info: {
        title: 'އަޕްޑޭޓެއް ލިބެންހުރޭ',
        description: 'މި ފޯމްގެ އަފްލާ ވާޝަނެއް ރިވިއުކުރެވޭނެ.',
      },
      positive: {
        title: 'އެޕްލިކޭޝަން ފޮނުވިއްޖެ',
        description: 'ތިޔަ އެޕްލިކޭޝަން ކާމިޔާބުކަމާއެކު ލިބިއްޖެ.',
      },
      cautious: {
        title: 'ޕޭމަންޓް ޕެންޑިންގް',
        description: 'ޕޭމަންޓް ނިމުމަށް ތިޔަ ބޭންކް ތަފްސީލް ކަނޑައަޅާ.',
      },
      warning: {
        title: 'ސެޝަން ނިމެންހުރޭ',
        description: 'މަސައްކަތް ދެމެހެއްޓުމަށް 5 މިނެޓްގެ ތެރޭގައި އަލުން ސައިން އިން ކުރޭ.',
      },
      danger: {
        title: 'އަޕްލޯޑް ނުކުރެވުނު',
        description: 'މި ފައިލް ޕްރޮސެސްއެއް ނުކުރެވުނު. އަލުން މަސައްކަތްކުރައްވާ.',
      },
    },
  },
} as const;

const useToastLanguage = (): ToastLanguage => (useVeliLanguage().language === 'dv' ? 'dv' : 'en');
const useToastText = (): (typeof toastText)[ToastLanguage] => toastText[useToastLanguage()];

type CopyKey = 'title' | 'description';

const isBundledCopy = (value: string, key: CopyKey) =>
  !value.trim() ||
  intents.some(
    (intent) =>
      value === toastText.en.byIntent[intent][key] || value === toastText.dv.byIntent[intent][key],
  );

const resolveCopy = (key: CopyKey, value: string, language: ToastLanguage, intent: ToastIntent) =>
  isBundledCopy(value, key) ? toastText[language].byIntent[intent][key] : value;

const withArgCategory = <T extends Record<string, object>>(category: string, argTypes: T) =>
  Object.fromEntries(
    Object.entries(argTypes).map(([name, argType]) => [
      name,
      {
        ...argType,
        table: {
          ...('table' in argType && argType.table && typeof argType.table === 'object'
            ? argType.table
            : {}),
          category,
        },
      },
    ]),
  ) as { [K in keyof T]: T[K] & { table: { category: string } } };

const collapsedControlGroups = ['Content', 'State'] as const;

function ToastDocsContainer(props: DocsContainerProps) {
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const tryCollapse = () => {
      if (cancelled) return;
      const tableReady = collapsedControlGroups.every(
        (group) =>
          document.querySelector(
            `tr[title^="Hide ${group} item"], tr[title^="Show ${group} item"]`,
          ) != null,
      );
      if (!tableReady && attempts < 40) {
        attempts += 1;
        requestAnimationFrame(tryCollapse);
        return;
      }
      collapsedControlGroups.forEach((group) =>
        document
          .querySelector(`tr[title^="Hide ${group} item"]`)
          ?.querySelector<HTMLElement>('[tabindex="0"]')
          ?.click(),
      );
    };
    tryCollapse();
    return () => {
      cancelled = true;
    };
  }, []);
  return <DocsContainer {...props} />;
}

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
  showLeadingIcon: boolean;
  showCloseButton: boolean;
  showProgress: boolean;
  timeout: number;
}

const contentFromArgs = (
  args: ToastStoryArgs,
  language: ToastLanguage,
  intent: ToastIntent = args.intent,
): VeliToastContent => ({
  title: resolveCopy('title', args.title, language, intent),
  description: resolveCopy('description', args.description, language, intent),
  appearance: args.appearance,
  intent,
  showLeadingIcon: args.showLeadingIcon,
  showCloseButton: args.showCloseButton,
  showProgress: args.showProgress,
});

const meta = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'padded',
    controls: { sort: 'none' },
    docs: { container: ToastDocsContainer },
  },
  tags: ['autodocs'],
  argTypes: {
    ...withArgCategory('Appearance', {
      appearance: { control: 'select', options: appearances },
      intent: { control: 'select', options: intents },
    }),
    ...withArgCategory('Content', {
      title: { control: 'text' },
      description: { control: 'text' },
    }),
    ...withArgCategory('State', {
      placement: {
        control: 'select',
        options: ['top', 'bottom', 'top-start', 'top-end', 'bottom-start', 'bottom-end'],
      },
      showLeadingIcon: { control: 'boolean' },
      showCloseButton: { control: 'boolean' },
      showProgress: { control: 'boolean' },
      timeout: { control: { type: 'number', min: 0, step: 1000 } },
    }),
    ...Object.fromEntries(
      ['className', 'style', 'ref', 'children', 'toast', 'slot', 'leadingIcon', 'id', 'role'].map(
        (key) => [key, { table: { disable: true } }],
      ),
    ),
  },
  args: {
    appearance: 'subtle',
    intent: 'neutral',
    showLeadingIcon: true,
    title: '',
    description: '',
    placement: 'bottom-end',
    showCloseButton: true,
    showProgress: false,
    timeout: 5000,
  },
} as Meta<ToastStoryArgs>;
export default meta;
type Story = StoryObj<ToastStoryArgs>;

export const Default: Story = {
  render: function DefaultStory(args) {
    const language = useToastLanguage();
    const text = useToastText();
    const queue = useToastQueue();
    const content = contentFromArgs(args, language);
    return (
      <div key={language} className="mx-auto flex w-full max-w-sm flex-col items-start gap-4">
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
    const language = useToastLanguage();
    const text = useToastText();
    return (
      <div key={language} className="mx-auto grid w-full max-w-[1200px] gap-6 md:grid-cols-2">
        {appearances.map((appearance) => (
          <div key={appearance} className="flex flex-col gap-3">
            <p className="type-body-sm-medium text-base-muted">{text.appearance[appearance]}</p>
            <ToastPreview content={{ ...contentFromArgs(args, language), appearance }} />
          </div>
        ))}
      </div>
    );
  },
};

export const Intents: Story = {
  parameters: { controls: { include: ['appearance', 'title', 'description', 'showCloseButton'] } },
  render: function IntentsStory(args) {
    const language = useToastLanguage();
    const text = useToastText();
    return (
      <div
        key={language}
        className="mx-auto grid w-full max-w-[1200px] gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {intents.map((intent) => (
          <div key={intent} className="flex flex-col gap-3">
            <p className="type-body-sm-medium text-base-muted">{text.intent[intent]}</p>
            <ToastPreview content={contentFromArgs(args, language, intent)} />
          </div>
        ))}
      </div>
    );
  },
};

export const WithActions: Story = {
  parameters: { controls: { disable: true } },
  render: function WithActionsStory() {
    const language = useToastLanguage();
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
      <div
        key={`${language}:${version}`}
        className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-4"
      >
        <div className="grid w-full gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-3" data-example="undo">
            <p className="type-body-sm-medium text-base-muted">{text.undo}</p>
            <ToastPreview
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
              content={{
                title: text.byIntent.neutral.title,
                description: text.byIntent.neutral.description,
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
