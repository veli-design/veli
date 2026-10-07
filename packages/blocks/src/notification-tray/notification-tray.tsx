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

function MobileNotificationSheet({
  onClose,
  ...contentProps
}: NotificationTrayContentProps & { onClose: () => void }) {
  const dragStart = useRef<{ y: number; time: number; pointerId: number } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  function cancelDrag() {
    dragStart.current = null;
    setIsDragging(false);
    setDragOffset(0);
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-t-3xl bg-surface-raised shadow-sm transition-transform duration-normal ease-out data-[dragging=true]:transition-none motion-reduce:transition-none [&>.veli-notification-tray>.veli-notification-header]:touch-none"
      style={{ transform: `translateY(${dragOffset}px)` }}
      data-dragging={isDragging}
      onPointerDown={(event) => {
        const target = event.target as HTMLElement;
        if (
          !event.isPrimary ||
          event.button !== 0 ||
          target.closest('button, a, [role="button"]') ||
          !target.closest('[data-notification-drag-handle], .veli-notification-header')
        )
          return;
        dragStart.current = {
          y: event.clientY,
          time: event.timeStamp,
          pointerId: event.pointerId,
        };
        setIsDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const start = dragStart.current;
        if (start?.pointerId === event.pointerId)
          setDragOffset(Math.max(0, event.clientY - start.y));
      }}
      onPointerUp={(event) => {
        const start = dragStart.current;
        if (!start || start.pointerId !== event.pointerId) return;
        dragStart.current = null;
        setIsDragging(false);
        const distance = Math.max(0, event.clientY - start.y);
        const height = event.currentTarget.clientHeight;
        if (
          distance > height * sheetDismissThreshold.heightRatio ||
          (distance > sheetDismissThreshold.distance &&
            distance / Math.max(1, event.timeStamp - start.time) > sheetDismissThreshold.velocity)
        ) {
          onClose();
        } else {
          setDragOffset(0);
        }
      }}
      onPointerCancel={cancelDrag}
      onLostPointerCapture={() => {
        if (dragStart.current) cancelDrag();
      }}
    >
      <div
        aria-hidden
        data-notification-drag-handle
        className="flex shrink-0 touch-none justify-center py-3"
      >
        <span className="h-1 w-10 rounded-full bg-border-base-emphasis" />
      </div>
      <NotificationTrayContent {...contentProps} onClose={onClose} />
    </div>
  );
}

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
          overlayClassName="items-end p-0 motion-safe:duration-slow motion-safe:ease-out-quad! motion-safe:data-[exiting]:duration-slow motion-safe:data-[exiting]:ease-in-out!"
          className="h-[85svh] max-h-[85svh] max-w-none overflow-visible rounded-none bg-transparent shadow-none motion-safe:transition-[translate,opacity] motion-safe:duration-slow motion-safe:ease-out-quad! motion-safe:data-[entering]:translate-y-6 motion-safe:data-[entering]:scale-100 motion-safe:data-[entering]:opacity-0 motion-safe:data-[exiting]:translate-y-full motion-safe:data-[exiting]:scale-100 motion-safe:data-[exiting]:opacity-100 motion-safe:data-[exiting]:duration-slow motion-safe:data-[exiting]:ease-in-out! [&_[role=dialog]]:h-full [&_[role=dialog]]:min-h-0 [&_[role=dialog]]:p-0"
        >
          <MobileNotificationSheet
            {...contentProps}
            className={`${contentProps.items.length === 0 ? '[&>.veli-notification-scroll]:pb-[max(env(safe-area-inset-bottom),calc(var(--spacing)*4))]' : '[&>.veli-notification-scroll]:pb-[env(safe-area-inset-bottom)]'} ${contentProps.className ?? ''}`}
            onClose={() => changeOpen(false)}
          />
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
