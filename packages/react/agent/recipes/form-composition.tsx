'use client';

import type { FormEvent } from 'react';
import { Button } from '@veli-design/react/button';
import { Input } from '@veli-design/react/input';
import { Select, SelectItem } from '@veli-design/react/select';

export function ServiceRequestForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget));
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <Input label="Full name" name="fullName" autoComplete="name" isRequired />
      <Select label="Service" name="service" placeholder="Choose a service" isRequired>
        <SelectItem id="permits">Permits</SelectItem>
        <SelectItem id="registrations">Registrations</SelectItem>
      </Select>
      <div className="flex justify-end">
        <Button type="submit">Submit request</Button>
      </div>
    </form>
  );
}
