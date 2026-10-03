import { useState } from 'react';
import { AccountPanel } from '@tradenetcorp/veli-blocks/account-panel';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

export function AccountPanelDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('personal');
  const [message, setMessage] = useState('');
  const accounts = [
    {
      id: 'personal',
      displayName: 'Aisha Ahmed',
      secondaryText: 'aisha@example.test',
      badge: 'Primary User',
    },
    { id: 'team', displayName: 'Example team', secondaryText: 'Team account' },
  ];
  return (
    <VeliProvider language="en" colorScheme="light">
      <div className="flex items-center justify-between rounded-xl border border-border-base-muted bg-surface-raised p-4">
        <p className="type-body-sm-regular text-base-strong">
          {message || 'Open the avatar to explore the account panel.'}
        </p>
        <AccountPanel
          selectedAccount={accounts.find((account) => account.id === selected)!}
          accountGroups={[
            { id: 'additional', accounts: accounts.filter((account) => account.id !== selected) },
          ]}
          labels={{
            trigger: 'Open account panel',
            dialog: 'Your account',
            close: 'Close',
            otherAccounts: 'Other accounts',
            loading: 'Loading accounts…',
            pending: 'Working…',
            disabled: 'Unavailable',
          }}
          isOpen={open}
          onOpenChange={setOpen}
          onAccountSelect={(id) => setSelected(id)}
          signOut={{
            label: 'Sign out',
            onPress: () => setMessage('Sign-out callback received by this demo.'),
          }}
        />
      </div>
    </VeliProvider>
  );
}
