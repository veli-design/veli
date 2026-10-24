'use client';

import { Button } from '@veli-design/react/button';
import { Link } from '@veli-design/react/link';

export function CreateHelp() {
  return (
    <div className="flex items-center gap-3">
      <Button intent="primary" appearance="fill" onPress={() => {}}>
        Create
      </Button>
      <Link href="/help">Learn more</Link>
    </div>
  );
}
