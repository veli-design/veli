'use client';

import NextLink from 'next/link';
import { useState } from 'react';
import {
  NotificationTray,
  type NotificationFilter,
  type NotificationItem,
} from '../components/blocks/notification-tray/notification-tray';

// Map your API response to display data in the app. Plain text is safe by default.
type NotificationRecord = Omit<NotificationItem, 'content' | 'actions'> & { message: string };

export function ApplicationNotifications({
  notifications,
  unreadCount,
  markRead,
  markAllRead,
}: {
  notifications: NotificationRecord[];
  unreadCount: number;
  // These app functions also update the query cache / notifications props.
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}) {
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  // For server filtering, send filter to your query instead. Do not infer the total
  // unread count or end-of-pagination from a loaded page.
  const items = notifications
    .filter((item) => filter === 'all' || item.unread)
    .map(({ message, ...item }) => ({ ...item, content: message }));

  return (
    <NotificationTray
      items={items}
      unreadCount={unreadCount}
      filter={filter}
      onFilterChange={setFilter}
      error={error}
      isMarkingAllRead={pending}
      onItemAction={(id) => {
        if (!notifications.some((notification) => notification.id === id && notification.unread))
          return;
        setError(undefined);
        void markRead(id).catch(() => setError('Could not mark this notification as read.'));
      }}
      onMarkAllRead={() => {
        setPending(true);
        setError(undefined);
        void markAllRead()
          .catch(() => setError('Could not mark notifications as read. Try the action again.'))
          .finally(() => setPending(false));
      }}
      renderLink={(props) =>
        'href' in props ? <NextLink {...props} href={props.href!} /> : <span {...props} />
      }
    />
  );
}
