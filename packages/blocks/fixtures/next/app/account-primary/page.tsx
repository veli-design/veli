'use client';

import { useState } from 'react';
import { SunIcon, MoonIcon, MonitorIcon } from '@phosphor-icons/react';
import { ApplicationPrimaryAccountPanel } from '../../account-adapter';
import { VeliProvider } from '@veli-design/react/provider';

const primaryUser = {
  id: 'primary',
  name: 'Aisha Ahmed',
  email: 'aisha@example.test',
  primary: true,
};

export default function PrimaryAccountPage() {
  const [business, setBusiness] = useState('Business A');
  const [theme, setTheme] = useState('light');
  return (
    <VeliProvider language="en" colorScheme={theme === 'dark' ? 'dark' : 'light'}>
      <main className="min-h-screen bg-surface-base p-6 text-base-strong">
        <h1>Primary-user account panel</h1>
        <label>
          Selected business
          <select value={business} onChange={(event) => setBusiness(event.target.value)}>
            <option>Business A</option>
            <option>Business B</option>
          </select>
        </label>
        <p>Editing permissions for {business}</p>
        <ApplicationPrimaryAccountPanel
          primaryUser={primaryUser}
          appearance={{
            label: 'Switch Theme',
            value: theme,
            onChange: setTheme,
            options: [
              { id: 'light', label: 'Light', icon: <SunIcon size={16} weight="bold" /> },
              { id: 'dark', label: 'Dark', icon: <MoonIcon size={16} weight="bold" /> },
              { id: 'system', label: 'Auto', icon: <MonitorIcon size={16} weight="bold" /> },
            ],
          }}
          labels={{
            trigger: 'Open account panel',
            dialog: 'Your account',
            close: 'Close',
            pending: 'Working…',
            otherAccounts: 'Other accounts',
            loading: 'Loading accounts…',
          }}
          primaryLabel="Primary User"
          signOutLabel="Sign out"
          failureLabel="Operation failed"
          onActionError={() => {}}
          logout={async () => {}}
        />
      </main>
    </VeliProvider>
  );
}
