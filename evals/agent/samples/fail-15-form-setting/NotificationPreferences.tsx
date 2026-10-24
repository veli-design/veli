import { useState } from 'react';
import { Button } from '@veli-design/react/button';
import { Switch } from '@veli-design/react/switch';

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
