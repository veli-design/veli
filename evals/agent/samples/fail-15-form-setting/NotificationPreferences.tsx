import { useState } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Switch } from '@tradenetcorp/veli-ui/switch';

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
      <Switch isSelected={emailUpdates} onChange={setEmailUpdates}>
        Email updates
      </Switch>
      <Button type="submit">Save preferences</Button>
    </form>
  );
}
