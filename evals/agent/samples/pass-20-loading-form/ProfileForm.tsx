import { useState } from 'react';
import { Button } from '@veli-design/react/button';
import { Input } from '@veli-design/react/input';
import { Skeleton } from '@veli-design/react/skeleton';

type Profile = { fullName: string; email: string };

export function ProfileForm({
  profile,
  onSave,
}: {
  profile: Profile | null;
  onSave: (profile: Profile) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Profile | null>(profile);
  const [isSaving, setIsSaving] = useState(false);

  if (!draft) {
    return (
      <div aria-busy="true" aria-label="Loading profile" className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-28" />
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setIsSaving(true);
        try {
          await onSave(draft);
        } finally {
          setIsSaving(false);
        }
      }}
    >
      <Input
        label="Full name"
        value={draft.fullName}
        onChange={(fullName) => setDraft({ ...draft, fullName })}
      />
      <Input
        label="Email"
        type="email"
        value={draft.email}
        onChange={(email) => setDraft({ ...draft, email })}
      />
      <Button type="submit" isPending={isSaving}>
        Save
      </Button>
    </form>
  );
}
