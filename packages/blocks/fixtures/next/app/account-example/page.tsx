'use client';

import { ApplicationAccountPanel } from '../../account-adapter';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

export default function ExamplePage() {
  return (
    <VeliProvider language="en" colorScheme="light">
      <main className="min-h-screen bg-surface-base p-6 text-base-strong">
        <h1>Executable adapter example</h1>
        <ApplicationAccountPanel
          selected={{ id: 'primary', name: 'Aisha Ahmed', primary: true }}
          groups={[{ id: 'additional', accounts: [{ id: 'other', name: 'Ali Hassan' }] }]}
          labels={{
            trigger: 'Open account panel',
            dialog: 'Your account',
            close: 'Close',
            otherAccounts: 'Other accounts',
            loading: 'Loading…',
            pending: 'Working…',
            disabled: 'Unavailable',
          }}
          primaryLabel="Primary user"
          signOutLabel="Sign out"
          failureLabel="Operation failed. Try again."
          logout={async () => {
            throw new Error('Demonstration failure');
          }}
          selectAccount={async () => {
            throw new Error('Demonstration failure');
          }}
        />
      </main>
    </VeliProvider>
  );
}
