'use client';

import { useState, useSyncExternalStore, type ReactElement } from 'react';
import { BellSimpleIcon } from '@phosphor-icons/react';
import { Badge } from '@veli-design/react/badge';
import { Button } from '@veli-design/react/button';
import { Sheet } from '@veli-design/react/sheet';
import { Popover, PopoverDialog, PopoverTrigger } from '@veli-design/react/popover';
import {
  NotificationTrayContent,
  notificationTrayLabels,
  type NotificationTrayContentProps,
} from './notification-tray-content';

export { NotificationTrayContent, notificationTrayLabels } from './notification-tray-content';
export type {
  NotificationItem,
  NotificationFilter,
  NotificationTrayContentProps,
} from './notification-tray-content';

export type NotificationTrayProps = Omit<NotificationTrayContentProps, 'onClose'> & {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** A Veli/React Aria Button with an accessible name. */
  trigger?: ReactElement;
};

// Mirrors Veli's lg breakpoint. MediaQueryList requires a concrete length.
const mobileQuery = '(max-width: 1024px)';
function subscribeToViewport(callback: () => void) {
  const query = window.matchMedia(mobileQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}
const isMobileViewport = () => window.matchMedia(mobileQuery).matches;
const serverViewport = () => false;

export function NotificationTray({
  isOpen,
  defaultOpen = false,
  onOpenChange,
  trigger,
  ...contentProps
}: NotificationTrayProps) {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = isOpen ?? localOpen;
  const mobile = useSyncExternalStore(subscribeToViewport, isMobileViewport, serverViewport);
  const labels = { ...notificationTrayLabels, ...contentProps.labels };

  function changeOpen(next: boolean) {
    if (isOpen === undefined) setLocalOpen(next);
    onOpenChange?.(next);
  }

  return (
    <PopoverTrigger isOpen={open} onOpenChange={changeOpen}>
      {trigger ?? (
        <Button
          aria-label={`${labels.title}${contentProps.unreadCount > 0 ? `, ${contentProps.unreadCount} ${labels.unread}` : ''}`}
          intent="secondary"
          appearance="transparent"
          size="md"
          iconOnly
          className="relative overflow-visible"
        >
          <span className="relative inline-flex size-4 shrink-0">
            <BellSimpleIcon className="size-4" aria-hidden />
            {contentProps.unreadCount > 0 ? (
              <span
                aria-hidden
                className="absolute -top-1.5 start-full ms-1 flex w-max -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2"
              >
                <Badge
                  size="sm"
                  intent="danger"
                  appearance="emphasis"
                  count={contentProps.unreadCount}
                  dir="ltr"
                />
              </span>
            ) : null}
          </span>
        </Button>
      )}
      {mobile ? (
        <Sheet
          isOpen={open}
          onOpenChange={changeOpen}
          size="full"
          className="veli-notification-sheet h-[85svh] max-h-[85svh] max-w-none rounded-t-3xl bg-surface-raised [&>.veli-sheet-content]:h-full [&>.veli-sheet-content]:pb-0"
        >
          {/* Visual grabber only; shared Sheet handles native scrolling and dismissal. */}
          <div
            aria-hidden
            data-notification-drag-handle
            className="flex shrink-0 justify-center py-3"
          >
            <span className="h-1 w-10 rounded-full bg-border-base-emphasis" />
          </div>
          <NotificationTrayContent
            {...contentProps}
            className={`${contentProps.items.length === 0 ? '[&>.veli-notification-scroll]:pb-[max(env(safe-area-inset-bottom),calc(var(--spacing)*4))]' : '[&>.veli-notification-scroll]:pb-[env(safe-area-inset-bottom)]'} ${contentProps.className ?? ''}`}
            onClose={() => changeOpen(false)}
          />
        </Sheet>
      ) : (
        <Popover
          placement="bottom end"
          offset={12}
          showArrow={false}
          className="z-40 w-[389px] shrink-0 motion-reduce:transition-none [&>div]:max-h-[inherit] [&>div]:rounded-4xl [&>div]:shadow-sm [&>div>div]:max-h-[inherit] motion-reduce:[&>div]:transition-none"
        >
          <PopoverDialog aria-label={labels.title} className="max-h-[inherit]">
            <NotificationTrayContent {...contentProps} />
          </PopoverDialog>
        </Popover>
      )}
    </PopoverTrigger>
  );
}
