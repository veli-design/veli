'use client';

import { useState } from 'react';
import { Sun, Moon, Monitor } from 'phosphor-react';
import {
  AccountPanel,
  type AccountPanelAccount,
} from '../../components/blocks/account-panel/account-panel';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

const initial = {
  id: 'primary',
  displayName: 'Aisha Ahmed',
  secondaryText: 'aisha@example.test',
  badge: 'Primary user',
};
const others = [
  { id: 'other', displayName: 'Ali Hassan', secondaryText: 'ali@example.test' },
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
        disabled: 'ނުލިބެން',
      }
    : {
        trigger: 'Open account panel',
        dialog: 'Your account',
        close: 'Close',
        otherAccounts: 'Other accounts',
        loading: 'Loading accounts…',
        pending: 'Working…',
        disabled: 'Unavailable',
      };
  let rows: AccountPanelAccount[] =
    state === 'long'
      ? Array.from({ length: 25 }, (_, index) => ({
          id: String(index),
          displayName: `Account ${index} with a very long name `.repeat(3),
          secondaryText: 'secondary-'.repeat(25) + '@example.test',
        }))
      : others;
  rows = rows
    .filter((account) => account.id !== selected.id)
    .map((account) => ({
      ...account,
      isPending: state === 'pending',
      isDisabled: state === 'disabled',
      error: state === 'action-error' ? 'Account selection failed.' : undefined,
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
                'disabled',
                'action-error',
                'display-only',
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
            onAccountSelect={
              state === 'display-only'
                ? undefined
                : (id) => {
                    setSelectionCalls((n) => n + 1);
                    const next = rows.find((account) => account.id === id);
                    if (next) setSelected(next);
                  }
            }
            signOut={{
              label: dv ? 'ސައިން އައުޓް' : 'Sign out',
              onPress: () => setLogoutCalls((n) => n + 1),
              isPending: state === 'pending',
              isDisabled: state === 'disabled',
              error: state === 'action-error' ? 'Sign out failed.' : undefined,
            }}
            emptyState={{
              title: dv ? 'އެހެން އެކައުންޓުތައް' : 'Add other accounts',
              description: dv
                ? 'އެހެން އެކައުންޓަކަށް ވަދެވޭނެ.'
                : 'Set up delegation to access another account.',
              action: {
                label: dv ? 'ޑެލިގޭޝަން' : 'Set up delegation',
                onPress: () => setDelegationCalls((n) => n + 1),
              },
            }}
            accountManagement={{
              label: dv ? 'އެކައުންޓު' : 'Manage account',
              onPress: () => setManagementCalls((n) => n + 1),
            }}
            appearance={{
              label: dv ? 'ތީމް' : 'Appearance',
              value: theme,
              options: [
                { id: 'light', label: dv ? 'ލައިޓް' : 'Light', icon: <Sun size={16} /> },
                { id: 'dark', label: dv ? 'ޑާކް' : 'Dark', icon: <Moon size={16} /> },
                { id: 'system', label: dv ? 'ސިސްޓަމް' : 'Auto', icon: <Monitor size={16} /> },
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
