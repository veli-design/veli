import { useState } from 'react';
import { SunIcon, MoonIcon, MonitorIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { AccountPanel, type AccountPanelProps } from '@tradenetcorp/veli-blocks/account-panel';
import { useVeliLanguage } from '@veli-design/react/provider';

const labels = {
  trigger: 'Open account panel',
  dialog: 'Your account',
  close: 'Close',
  otherAccounts: 'Other accounts',
  loading: 'Loading accounts…',
  pending: 'Working…',
};
const account = {
  id: 'personal',
  displayName: 'Aisha Ahmed',
  secondaryText: 'aisha@example.test',
  secondaryTextLang: 'en',
  secondaryTextDir: 'ltr' as const,
  badge: 'Primary User',
};
const groups = [
  {
    id: 'personal',
    accounts: [
      {
        id: 'other',
        displayName: 'Ali Hassan',
        secondaryText: 'ali@example.test',
        secondaryTextLang: 'en',
        secondaryTextDir: 'ltr' as const,
      },
    ],
  },
  {
    id: 'organizations',
    accounts: [{ id: 'team', displayName: 'Example team', secondaryText: 'Team account' }],
  },
];

const dhivehiText: Record<string, string> = {
  'Open account panel': 'އެކައުންޓު',
  'Your account': 'ތިޔަ އެކައުންޓު',
  Close: 'ބަންދުކުރައްވާ',
  'Other accounts': 'އެހެން އެކައުންޓުތައް',
  'Loading accounts…': 'އެކައުންޓުތައް ލޯޑުވަނީ…',
  'Working…': 'ބަދަލުކުރަނީ…',
  'Aisha Ahmed': 'އާއިޝާ އަޙްމަދު',
  'Ali Hassan': 'އަލީ ޙަސަން',
  'Primary User': 'މައި ޔޫޒަރު',
  'Delegate user': 'ނާއިބު ޔޫޒަރު',
  'Primary account': 'މައި އެކައުންޓު',
  'Example team': 'މިސާލު ޓީމް',
  'Team account': 'ޓީމްގެ އެކައުންޓު',
  'Sign out': 'ސައިން އައުޓް',
  'Switch Theme': 'ތީމް ބަދަލުކުރައްވާ',
  Light: 'އަލި',
  Dark: 'އަނދިރި',
  Auto: 'އޮޓޯ',
  'Add other accounts': 'އެހެން އެކައުންޓުތައް އިތުރުކުރައްވާ',
  'Set up delegation to act on behalf of other users or businesses you own.':
    'އެހެން ޔޫޒަރުންނާއި ތިޔަ ފަރާތުގެ ވިޔަފާރިތަކުގެ ނާއިބަކުގެ ގޮތުގައި ކަންތައްކުރުމަށް ޑެލިގޭޝަން ސެޓްއަޕް ކުރައްވާ.',
  'Setup Delegation': 'ޑެލިގޭޝަން ސެޓްއަޕް ކުރައްވާ',
  'Could not load additional accounts.': 'އެހެން އެކައުންޓުތައް ލޯޑު ނުކުރެވުނު.',
  'Sign-out callback received': 'ސައިން އައުޓް ކުރުމުގެ ދަންނަވާލުން ލިބިއްޖެ.',
  ['A very long account holder name '.repeat(5)]:
    'އެކައުންޓުގެ ވެރިފަރާތުގެ ވަރަށް ދިގު ނަމެއް '.repeat(5),
  ['long-secondary-text-'.repeat(8)]: 'ވަރަށް ދިގު އިތުރު މަޢުލޫމާތު '.repeat(8),
  ...Object.fromEntries(
    Array.from({ length: 20 }, (_, index) => [
      `Account ${index} with a very long name`,
      `ވަރަށް ދިގު ނަމެއްގެ އެކައުންޓު ${index}`,
    ]),
  ),
};

const translate = (text: string, dhivehi: boolean) =>
  dhivehi ? (dhivehiText[text] ?? text) : text;

function playText(canvasElement: HTMLElement, text: string) {
  return translate(text, canvasElement.querySelector('[lang]')?.getAttribute('lang') === 'dv');
}

function Playground(args: AccountPanelProps) {
  const { language, lang, direction } = useVeliLanguage();
  const dhivehi = language === 'dv';
  const text = (value: string) => translate(value, dhivehi);
  const localizeAccount = (item: AccountPanelProps['selectedAccount']) => ({
    ...item,
    displayName: text(item.displayName),
    secondaryText: item.secondaryText && text(item.secondaryText),
    badge: item.badge && text(item.badge),
    avatar: item.avatar && {
      ...item.avatar,
      initials: dhivehi ? text(item.displayName) : item.avatar.initials,
    },
    lang,
    dir: direction,
  });
  const [open, setOpen] = useState(args.isOpen);
  const [selected, setSelected] = useState(args.selectedAccount);
  const [message, setMessage] = useState('');
  const [appearance, setAppearance] = useState(args.appearance?.value ?? 'system');
  return (
    <div
      lang={lang}
      dir={direction}
      className="flex min-h-96 items-start justify-between gap-4 p-6"
    >
      <p role="status">
        {message.startsWith('Selected ') && dhivehi
          ? 'އެކައުންޓު ބަދަލުކުރެވިއްޖެ.'
          : text(message)}
      </p>
      <AccountPanel
        {...args}
        selectedAccount={localizeAccount(selected)}
        labels={
          Object.fromEntries(
            Object.entries(args.labels).map(([key, value]) => [key, text(value)]),
          ) as AccountPanelProps['labels']
        }
        error={args.error && text(args.error)}
        emptyState={
          args.emptyState && {
            ...args.emptyState,
            title: text(args.emptyState.title),
            description: args.emptyState.description && text(args.emptyState.description),
            action: args.emptyState.action && {
              ...args.emptyState.action,
              label: text(args.emptyState.action.label),
            },
          }
        }
        accountManagement={
          args.accountManagement && {
            ...args.accountManagement,
            label: text(args.accountManagement.label),
          }
        }
        accountGroups={args.accountGroups?.map((group) => ({
          ...group,
          label: group.label && text(group.label),
          accounts: group.accounts.filter((item) => item.id !== selected.id).map(localizeAccount),
        }))}
        isOpen={open}
        onOpenChange={setOpen}
        onAccountSelect={(id) => {
          const item = args.accountGroups
            ?.flatMap((group) => group.accounts)
            .find((item) => item.id === id);
          if (item) setSelected(item);
          setMessage(`Selected ${id}`);
        }}
        signOut={{
          ...args.signOut,
          label: text(args.signOut.label),
          onPress: () => setMessage('Sign-out callback received'),
        }}
        appearance={
          args.appearance
            ? {
                ...args.appearance,
                label: text(args.appearance.label),
                options: args.appearance.options.map((option) => ({
                  ...option,
                  label: text(option.label),
                })),
                value: appearance,
                onChange: setAppearance,
              }
            : undefined
        }
      />
    </div>
  );
}

const meta = {
  title: 'Blocks/Account panel',
  component: AccountPanel,
  parameters: { layout: 'fullscreen' },
  render: (args) => <Playground {...args} />,
  args: {
    selectedAccount: account,
    accountGroups: groups,
    labels,
    isOpen: false,
    onOpenChange: () => {},
    onAccountSelect: () => {},
    signOut: { label: 'Sign out', onPress: () => {} },
    emptyState: {
      title: 'Add other accounts',
      description: 'Set up delegation to act on behalf of other users or businesses you own.',
      action: { label: 'Setup Delegation', onPress: () => {} },
    },
    appearance: {
      label: 'Switch Theme',
      value: 'system',
      options: [
        { id: 'light', label: 'Light', icon: <SunIcon size={16} weight="bold" /> },
        { id: 'dark', label: 'Dark', icon: <MoonIcon size={16} weight="bold" /> },
        { id: 'system', label: 'Auto', icon: <MonitorIcon size={16} weight="bold" /> },
      ],
      onChange: () => {},
    },
  },
} satisfies Meta<typeof AccountPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const text = (value: string) => playText(canvasElement, value);
    // exact: Dhivehi account rows also contain the trigger label substring.
    const trigger = await canvas.findByRole('button', {
      name: text(labels.trigger),
      exact: true,
    });
    await userEvent.click(trigger);
    const dialog = await page.findByRole('dialog', { name: text(labels.dialog) });
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const mobile = canvasElement.ownerDocument.defaultView?.matchMedia('(width < 640px)').matches;
    if (mobile) {
      await expect(within(dialog).queryByRole('radiogroup')).not.toBeInTheDocument();
    } else {
      // Click Dark directly — arrow direction under RTL is flaky across browsers.
      await userEvent.click(within(dialog).getByRole('radio', { name: text('Dark') }));
      await expect(within(dialog).getByRole('radio', { name: text('Dark') })).toBeChecked();
    }
    await userEvent.click(
      within(dialog).getByRole('button', { name: new RegExp(text('Ali Hassan')) }),
    );
    await waitFor(() => expect(within(dialog).getByText(text('Ali Hassan'))).toBeVisible());
    await userEvent.click(within(dialog).getByRole('button', { name: text('Sign out') }));
    await expect(canvas.getByRole('status')).toHaveTextContent(text('Sign-out callback received'));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
    });
  },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', {
      name: playText(canvasElement, labels.trigger),
      exact: true,
    });
    await userEvent.click(trigger);
    const dialog = await page.findByRole('dialog', {
      name: playText(canvasElement, labels.dialog),
    });
    await userEvent.keyboard('{Tab}');
    await expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(true);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
    });
  },
};
export const OneAdditionalAccount: Story = { args: { accountGroups: [groups[0]] } };
export const NoAdditionalAccounts: Story = { args: { accountGroups: [] } };
export const Image: Story = {
  args: {
    selectedAccount: {
      ...account,
      avatar: {
        src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23007878"/%3E%3Ccircle cx="30" cy="23" r="10" fill="white"/%3E%3Cpath d="M10 60a20 20 0 0 1 40 0" fill="white"/%3E%3C/svg%3E',
        initials: 'AA',
      },
    },
  },
};
export const BrokenImageFallback: Story = {
  args: {
    selectedAccount: {
      ...account,
      avatar: { src: 'data:image/png;base64,invalid', initials: 'AA' },
    },
  },
};
export const LongContent: Story = {
  args: {
    selectedAccount: {
      ...account,
      displayName: 'A very long account holder name '.repeat(5),
      secondaryText: 'very-long-address-'.repeat(8) + '@example.test',
    },
    accountGroups: [
      {
        id: 'many',
        accounts: Array.from({ length: 20 }, (_, index) => ({
          id: String(index),
          displayName: `Account ${index} with a very long name`,
          secondaryText: 'long-secondary-text-'.repeat(8),
        })),
      },
    ],
  },
};
export const Loading: Story = { args: { isLoading: true, accountGroups: [] } };
export const Error: Story = {
  args: { error: 'Could not load additional accounts.', accountGroups: [] },
};
export const Pending: Story = {
  args: {
    signOut: { label: 'Sign out', onPress: () => {}, isPending: true },
    accountGroups: [{ id: 'pending', accounts: [{ ...groups[0].accounts[0], isPending: true }] }],
  },
};
export const TriggerDisabled: Story = { args: { isDisabled: true } };
export const ReducedMotion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Enable the browser reduced-motion preference. Consumer tests exercise this story behavior with media emulation.',
      },
    },
  },
};

export const DelegateSelected: Story = {
  args: {
    selectedAccount: { ...groups[0].accounts[0], badge: 'Delegate user', badgeIntent: 'neutral' },
    accountGroups: [{ id: 'primary', label: 'Primary account', accounts: [account] }, ...groups],
  },
};
