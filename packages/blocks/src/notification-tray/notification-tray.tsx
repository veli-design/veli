'use client';

import { useRef, useState, useSyncExternalStore, type ReactElement } from 'react';
import { BellSimple } from 'phosphor-react';
import { Badge } from '@tradenetcorp/veli-ui/badge';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Modal } from '@tradenetcorp/veli-ui/modal';
import { Popover, PopoverDialog, PopoverTrigger } from '@tradenetcorp/veli-ui/popover';
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
// web2's dismissal behavior; Veli has no sheet gesture tokens or primitive.
const sheetDismissThreshold = { heightRatio: 0.35, distance: 40, velocity: 0.11 };
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
  const dragStart = useRef<{ y: number; time: number; pointerId: number } | null>(null);
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
          <BellSimple className="size-5" />
          {contentProps.unreadCount > 0 ? (
            <Badge
              size="xs"
              intent="danger"
              appearance="emphasis"
              aria-hidden
              className="absolute -top-1 -end-2"
            />
          ) : null}
        </Button>
      )}
      {mobile ? (
        <Modal
          aria-label={labels.title}
          overlayClassName="items-end p-0"
          className="h-[85svh] max-h-[85svh] max-w-none overflow-hidden rounded-b-none rounded-t-3xl bg-surface-raised [&_[role=dialog]]:h-full [&_[role=dialog]]:min-h-0 [&_[role=dialog]]:p-0 [&_[role=dialog]]:pb-[env(safe-area-inset-bottom)]"
        >
          <div
            aria-hidden
            className="flex shrink-0 touch-none justify-center py-3"
            onPointerDown={(event) => {
              if (!event.isPrimary || event.button !== 0) return;
              dragStart.current = {
                y: event.clientY,
                time: event.timeStamp,
                pointerId: event.pointerId,
              };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerUp={(event) => {
              const start = dragStart.current;
              dragStart.current = null;
              if (!start || start.pointerId !== event.pointerId) return;
              const distance = event.clientY - start.y;
              const height = event.currentTarget.closest('[role="dialog"]')?.clientHeight ?? 0;
              if (
                distance > height * sheetDismissThreshold.heightRatio ||
                (distance > sheetDismissThreshold.distance &&
                  distance / Math.max(1, event.timeStamp - start.time) >
                    sheetDismissThreshold.velocity)
              )
                changeOpen(false);
            }}
            onPointerCancel={() => {
              dragStart.current = null;
            }}
          >
            <span className="h-1 w-10 rounded-full bg-border-base-emphasis" />
          </div>
          <NotificationTrayContent {...contentProps} onClose={() => changeOpen(false)} />
        </Modal>
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
