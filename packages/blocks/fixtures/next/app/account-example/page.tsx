'use client';

import { ApplicationAccountPanel } from '../../account-adapter';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';
import { createToastQueue, ToastRegion } from '@tradenetcorp/veli-ui/toast';
import { useState } from 'react';

export default function ExamplePage() {
  const [toasts] = useState(() => createToastQueue());
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
          }}
          primaryLabel="Primary User"
          signOutLabel="Sign out"
          failureLabel="Operation failed. Try again."
          onActionError={(message) => toasts.add({ title: message, intent: 'danger' })}
          logout={async () => {
            throw new Error('Demonstration failure');
          }}
          selectAccount={async () => {
            throw new Error('Demonstration failure');
          }}
        />
      </main>
      <ToastRegion queue={toasts} placement="top" />
    </VeliProvider>
  );
}
