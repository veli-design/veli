'use client';

import { useState } from 'react';
import { SunIcon, MoonIcon, MonitorIcon } from '@phosphor-icons/react';
import {
  AccountPanel,
  type AccountPanelAccount,
} from '../../components/blocks/account-panel/account-panel';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

const initial = {
  id: 'primary',
  displayName: 'Aisha Ahmed',
  secondaryText: 'aisha@example.test',
  secondaryTextLang: 'en',
  secondaryTextDir: 'ltr' as const,
  badge: 'Primary User',
};
const others = [
  {
    id: 'other',
    displayName: 'Ali Hassan',
    secondaryText: 'ali@example.test',
    secondaryTextLang: 'en',
    secondaryTextDir: 'ltr' as const,
  },
  { id: 'team', displayName: 'Example team', secondaryText: 'Team account' },
];

export default function AccountsPage() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'dv'>('en');
  const [theme, setTheme] = useState('light');
  const [state, setState] = useState('ready');
  const [selected, setSelected] = useState<AccountPanelAccount>(initial);
  const [selectionCalls, setSelectionCalls] = useState(0);
  const [logoutCalls, setLogoutCalls] = useState(0);
  const [delegationCalls, setDelegationCalls] = useState(0);
  const [managementCalls, setManagementCalls] = useState(0);
  const dv = language === 'dv';
  const labels = dv
    ? {
        trigger: 'އެކައުންޓު',
        dialog: 'ތިޔަ އެކައުންޓު',
        close: 'ބަންދުކުރައްވާ',
        otherAccounts: 'އެހެން އެކައުންޓުތައް',
        loading: 'ލޯޑުވަނީ…',
        pending: 'ބަދަލުކުރަނީ…',
      }
    : {
        trigger: 'Open account panel',
        dialog: 'Your account',
        close: 'Close',
        otherAccounts: 'Other accounts',
        loading: 'Loading accounts…',
        pending: 'Working…',
      };
  let rows: AccountPanelAccount[] =
    state === 'long'
      ? Array.from({ length: 25 }, (_, index) => ({
          id: String(index),
          displayName: `Account ${index} with a very long name `.repeat(3),
          secondaryText: 'secondary-'.repeat(25) + '@example.test',
          secondaryTextLang: 'en',
          secondaryTextDir: 'ltr' as const,
        }))
      : others;
  rows = rows
    .filter((account) => account.id !== selected.id)
    .map((account) => ({
      ...account,
      isPending: state === 'pending',
    }));
  if (['empty', 'loading', 'error'].includes(state)) rows = [];
  if (state === 'one') rows = rows.slice(0, 1);
  const profile =
    state === 'long'
      ? {
          ...selected,
          displayName: 'Very long selected account name '.repeat(10),
          secondaryText: 'long-address-'.repeat(30) + '@example.test',
        }
      : dv
        ? {
            ...selected,
            displayName: 'އާއިޝާ އަޙްމަދު',
            badge: 'މައި ޔޫޒަރު',
            lang: 'dv',
            dir: 'rtl' as const,
          }
        : selected;
  return (
    <VeliProvider
      language={language}
      colorScheme={theme === 'dark' ? 'dark' : 'light'}
      disableTransitionOnChange
    >
      <main
        dir={dv ? 'rtl' : 'ltr'}
        lang={language}
        className="min-h-screen bg-surface-base p-4 text-base-strong"
      >
        <h1>Account panel consumer fixture</h1>
        <div className="flex flex-wrap gap-4 py-4">
          <button onClick={() => setLanguage(dv ? 'en' : 'dv')}>Change language</button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            Change theme
          </button>
          <label>
            State{' '}
            <select value={state} onChange={(event) => setState(event.target.value)}>
              {[
                'ready',
                'one',
                'empty',
                'loading',
                'error',
                'pending',
                'long',
                'image',
                'broken-image',
                'trigger-disabled',
              ].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <p data-calls>
          Selection: {selectionCalls}; logout: {logoutCalls}; delegation: {delegationCalls};
          management: {managementCalls}
        </p>
        {/* A transformed header catches overlays incorrectly trapped by fixed-position ancestors. */}
        <header
          className="mt-4 flex justify-end rounded-xl bg-surface-raised p-2"
          style={{ transform: 'translateY(1px)' }}
        >
          <AccountPanel
            selectedAccount={{
              ...profile,
              avatar:
                state === 'image'
                  ? {
                      src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="teal"/%3E%3C/svg%3E',
                      initials: 'AA',
                    }
                  : state === 'broken-image'
                    ? { src: 'data:image/png;base64,invalid', initials: 'AA' }
                    : undefined,
            }}
            accountGroups={[
              { id: 'personal', accounts: rows.slice(0, 1) },
              { id: 'teams', accounts: rows.slice(1) },
            ]}
            labels={labels}
            isOpen={open}
            onOpenChange={setOpen}
            isDisabled={state === 'trigger-disabled'}
            isLoading={state === 'loading'}
            error={state === 'error' ? 'Could not load accounts.' : undefined}
            onAccountSelect={(id) => {
              setSelectionCalls((n) => n + 1);
              const next = rows.find((account) => account.id === id);
              if (next) setSelected(next);
            }}
            signOut={{
              label: dv ? 'ސައިން އައުޓް' : 'Sign out',
              onPress: () => setLogoutCalls((n) => n + 1),
              isPending: state === 'pending',
            }}
            emptyState={{
              title: dv ? 'އެހެން އެކައުންޓުތައް' : 'Add other accounts',
              description: dv
                ? 'އެހެން އެކައުންޓަކަށް ވަދެވޭނެ.'
                : 'Set up delegation to act on behalf of other users or businesses you own.',
              action: {
                label: dv ? 'ޑެލިގޭޝަން' : 'Setup Delegation',
                onPress: () => setDelegationCalls((n) => n + 1),
              },
            }}
            accountManagement={{
              label: dv ? 'އެކައުންޓު' : 'Manage account',
              onPress: () => setManagementCalls((n) => n + 1),
            }}
            appearance={{
              label: dv ? 'ތީމް' : 'Switch Theme',
              value: theme,
              options: [
                {
                  id: 'light',
                  label: dv ? 'ލައިޓް' : 'Light',
                  icon: <SunIcon size={16} weight="bold" />,
                },
                {
                  id: 'dark',
                  label: dv ? 'ޑާކް' : 'Dark',
                  icon: <MoonIcon size={16} weight="bold" />,
                },
                {
                  id: 'system',
                  label: dv ? 'ސިސްޓަމް' : 'Auto',
                  icon: <MonitorIcon size={16} weight="bold" />,
                },
              ],
              onChange: setTheme,
            }}
          />
        </header>
        <button id="complete" onClick={() => setState('ready')}>
          Complete operation
        </button>
        <a href="/account-example">Adapter example</a>
      </main>
    </VeliProvider>
  );
}
