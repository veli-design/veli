import { Badge } from '@veli-design/react/badge';
import { Button } from '@veli-design/react/button';
import { BellIcon } from '@phosphor-icons/react';

export function BadgeUsageDemo() {
  return (
    <Badge intent="positive" appearance="subtle">
      Approved
    </Badge>
  );
}

export function BadgeAppearancesDemo() {
  return (
    <div className="flex flex-wrap items-center gap-[8px]">
      <Badge appearance="outline" intent="info">
        Outline
      </Badge>
      <Badge appearance="subtle" intent="info">
        Subtle
      </Badge>
      <Badge appearance="emphasis" intent="info">
        Emphasis
      </Badge>
    </div>
  );
}

export function BadgeCounterDemo() {
  return (
    <div className="flex flex-wrap items-center gap-[16px]">
      <Badge intent="danger" counter count={5} />
      <Badge intent="neutral" counter count={128} max={99} />
      <Badge count={7} appearance="emphasis" intent="danger" size="sm" />
    </div>
  );
}

export function BadgeCounterOnIconDemo() {
  return (
    <div className="relative inline-flex">
      <Button
        iconOnly
        intent="secondary"
        appearance="transparent"
        size="md"
        aria-label="5 notifications"
      >
        <BellIcon aria-hidden size={20} weight="regular" />
      </Button>
      <Badge
        counter
        count={5}
        appearance="emphasis"
        intent="danger"
        size="sm"
        className="absolute -top-0.5 -end-0.5"
        aria-hidden
      />
    </div>
  );
}

export function BadgeStatusDotsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-[10px]">
      <Badge appearance="emphasis" intent="positive" size="xs" aria-label="Online" />
      <Badge appearance="emphasis" intent="cautious" size="xs" aria-label="Away" />
      <Badge appearance="emphasis" intent="danger" size="xs" aria-label="Busy" />
      <Badge appearance="emphasis" intent="neutral" size="xs" aria-label="Offline" />
    </div>
  );
}
