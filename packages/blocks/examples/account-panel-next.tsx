'use client';

import { useState } from 'react';
import {
  AccountPanel,
  type AccountPanelLabels,
} from '../components/blocks/account-panel/account-panel';

// An application-owned record, not a Veli identity-provider type.
export type IdentityRecord = {
  id: string;
  name: string;
  email?: string;
  photo?: string;
  primary?: boolean;
};

export function ApplicationAccountPanel({
  selected,
  groups,
  labels,
  signOutLabel,
  primaryLabel,
  failureLabel,
  onActionError,
  selectAccount,
  logout,
}: {
  selected: IdentityRecord;
  groups: { id: string; label?: string; accounts: IdentityRecord[] }[];
  labels: AccountPanelLabels;
  signOutLabel: string;
  primaryLabel: string;
  failureLabel: string;
  // Present failures through the application's toast or notification UI.
  onActionError: (message: string) => void;
  // The host updates selected/session props after these operations succeed.
  selectAccount: (id: string) => Promise<void>;
  logout: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string>();
  const [signingOut, setSigningOut] = useState(false);
  const mapAccount = (record: IdentityRecord) => ({
    id: record.id,
    displayName: record.name,
    secondaryText: record.email,
    secondaryTextLang: 'en',
    secondaryTextDir: 'ltr' as const,
    avatar: { src: record.photo, initials: record.name },
    badge: record.primary ? primaryLabel : undefined,
  });

  return (
    <AccountPanel
      selectedAccount={mapAccount(selected)}
      accountGroups={groups.map((group) => ({
        ...group,
        accounts: group.accounts.map((record) => ({
          ...mapAccount(record),
          isPending: record.id === pendingId,
        })),
      }))}
      labels={labels}
      isOpen={open}
      onOpenChange={setOpen}
      onAccountSelect={(id) => {
        if (pendingId !== undefined) return;
        setPendingId(id);
        void selectAccount(id)
          .then(() => setOpen(false))
          .catch(() => onActionError(failureLabel))
          .finally(() => setPendingId(undefined));
      }}
      signOut={{
        label: signOutLabel,
        isPending: signingOut,
        onPress: () => {
          setSigningOut(true);
          void logout()
            .then(() => setOpen(false))
            .catch(() => onActionError(failureLabel))
            .finally(() => setSigningOut(false));
        },
      }}
    />
  );
}
