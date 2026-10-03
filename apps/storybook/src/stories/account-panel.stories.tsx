import { useState } from 'react';
import { Sun, Moon, Monitor } from 'phosphor-react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { AccountPanel, type AccountPanelProps } from '@tradenetcorp/veli-blocks/account-panel';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

const labels = {
  trigger: 'Open account panel',
  dialog: 'Your account',
  close: 'Close',
  otherAccounts: 'Other accounts',
  loading: 'Loading accounts…',
  pending: 'Working…',
  disabled: 'Unavailable',
};
const account = {
  id: 'personal',
  displayName: 'Aisha Ahmed',
  secondaryText: 'aisha@example.test',
  badge: 'Primary user',
};
const groups = [
  {
    id: 'personal',
    accounts: [{ id: 'other', displayName: 'Ali Hassan', secondaryText: 'ali@example.test' }],
  },
  {
    id: 'organizations',
    accounts: [{ id: 'team', displayName: 'Example team', secondaryText: 'Team account' }],
  },
];

function Playground(args: AccountPanelProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(args.selectedAccount);
  const [message, setMessage] = useState('');
  const [appearance, setAppearance] = useState('system');
  return (
    <div className="flex min-h-96 items-start justify-between gap-4 p-6">
      <p role="status">{message}</p>
      <AccountPanel
        {...args}
        selectedAccount={selected}
        accountGroups={args.accountGroups?.map((group) => ({
          ...group,
          accounts: group.accounts.filter((item) => item.id !== selected.id),
        }))}
        isOpen={open}
        onOpenChange={setOpen}
        onAccountSelect={
          args.onAccountSelect
            ? (id) => {
                const item = args.accountGroups
                  ?.flatMap((group) => group.accounts)
                  .find((item) => item.id === id);
                if (item) setSelected(item);
                setMessage(`Selected ${id}`);
              }
            : undefined
        }
        signOut={{ ...args.signOut, onPress: () => setMessage('Sign-out callback received') }}
        appearance={
          args.appearance
            ? { ...args.appearance, value: appearance, onChange: setAppearance }
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
      description: 'Set up delegation to access another account.',
      action: { label: 'Set up delegation', onPress: () => {} },
    },
    appearance: {
      label: 'Appearance',
      value: 'system',
      options: [
        { id: 'light', label: 'Light', icon: <Sun size={16} /> },
        { id: 'dark', label: 'Dark', icon: <Moon size={16} /> },
        { id: 'system', label: 'Auto', icon: <Monitor size={16} /> },
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
    const trigger = canvas.getByRole('button', { name: labels.trigger });
    await userEvent.click(trigger);
    const dialog = await page.findByRole('dialog', { name: labels.dialog });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(within(dialog).getByRole('button', { name: /Ali Hassan/ }));
    await expect(within(dialog).getByText('Ali Hassan')).toBeVisible();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Sign out' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Sign-out callback received');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: labels.trigger });
    await userEvent.click(trigger);
    const dialog = await page.findByRole('dialog', { name: labels.dialog });
    await userEvent.keyboard('{Tab}');
    await expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(true);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const OneAdditionalAccount: Story = { args: { accountGroups: [groups[0]] } };
export const NoAdditionalAccounts: Story = { args: { accountGroups: [] } };
export const DisplayOnly: Story = { args: { onAccountSelect: undefined } };
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
export const Disabled: Story = {
  args: {
    signOut: { label: 'Sign out', onPress: () => {}, isDisabled: true },
    accountGroups: [{ id: 'disabled', accounts: [{ ...groups[0].accounts[0], isDisabled: true }] }],
  },
};
export const ActionErrors: Story = {
  args: {
    signOut: { label: 'Sign out', onPress: () => {}, error: 'Sign out failed. Try again.' },
    accountGroups: [
      {
        id: 'failed',
        accounts: [{ ...groups[0].accounts[0], error: 'Selection failed. Try again.' }],
      },
    ],
  },
};
export const Dhivehi: Story = {
  decorators: [
    (Story) => (
      <VeliProvider language="dv" colorScheme="light">
        <Story />
      </VeliProvider>
    ),
  ],
  args: {
    labels: {
      trigger: 'އެކައުންޓު',
      dialog: 'ތިޔަ އެކައުންޓު',
      close: 'ބަންދުކުރައްވާ',
      otherAccounts: 'އެހެން އެކައުންޓުތައް',
      loading: 'ލޯޑުވަނީ…',
      pending: 'ބަދަލުކުރަނީ…',
      disabled: 'ނުލިބެން',
    },
    selectedAccount: {
      id: 'dv',
      displayName: 'އާއިޝާ އަޙްމަދު',
      secondaryText: 'aisha@example.test',
      badge: 'މައި ޔޫޒަރު',
      lang: 'dv',
      dir: 'rtl',
    },
    signOut: { label: 'ސައިން އައުޓް', onPress: () => {} },
    appearance: undefined,
  },
};
export const Dark: Story = {
  decorators: [
    (Story) => (
      <VeliProvider language="en" colorScheme="dark">
        <Story />
      </VeliProvider>
    ),
  ],
};
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
