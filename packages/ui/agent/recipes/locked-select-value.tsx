'use client';

import type { FormEvent } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Input } from '@tradenetcorp/veli-ui/input';

export function LockedAtollField({ atoll }: { atoll: { id: string; name: string } }) {
  return (
    <>
      <Input label="Atoll" value={atoll.name} isReadOnly />
      <input type="hidden" name="atollId" value={atoll.id} />
    </>
  );
}

export function LockedAtollForm({
  atoll,
  onSubmit,
}: {
  atoll: { id: string; name: string };
  onSubmit: (data: FormData) => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget));
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <LockedAtollField atoll={atoll} />
      <div className="flex justify-end">
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
