'use client';

import { Button } from '@veli-design/react/button';

export function CreateHelp() {
  return (
    <div>
      <Button onClick={() => {}}>Create</Button>
      <Button onClick={() => (window.location.href = '/help')}>Learn more</Button>
    </div>
  );
}
