import { useState } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Checkbox } from '@tradenetcorp/veli-ui/checkbox';

export function NotificationPreferences({
  onSave,
}: {
  onSave: (preferences: { emailUpdates: boolean }) => void;
}) {
  const [emailUpdates, setEmailUpdates] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ emailUpdates });
      }}
    >
      <Checkbox name="emailUpdates" isSelected={emailUpdates} onChange={setEmailUpdates}>
        Email me updates about my applications
      </Checkbox>
      <Button type="submit">Save preferences</Button>
    </form>
  );
}
