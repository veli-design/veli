import { useState } from 'react';
import {
  NotificationTray,
  type NotificationFilter,
  type NotificationItem,
} from '@tradenetcorp/veli-blocks/notification-tray';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

const notificationDemoItems: NotificationItem[] = [
  {
    id: 'progress',
    content: (
      <>
        Your application is now <strong>in progress</strong>.
      </>
    ),
    timestamp: '5 minutes ago',
    time: '09:30',
    unread: true,
    intent: 'warning',
    href: '#progress',
  },
  {
    id: 'review',
    content: (
      <>
        Your application needs <strong>more information</strong>. Review the requested details.
      </>
    ),
    timestamp: '30 minutes ago',
    time: '09:05',
    unread: true,
    intent: 'warning',
    href: '#review',
  },
  {
    id: 'submitted',
    content: (
      <>
        Your application was <strong>submitted</strong>. You can track its progress.
      </>
    ),
    timestamp: '1 hour ago',
    time: '08:35',
    unread: true,
    intent: 'success',
    href: '#submitted',
  },
  {
    id: 'action',
    content: (
      <>
        Your payment was <strong>unsuccessful</strong>. Please try again.
      </>
    ),
    timestamp: '1 day ago',
    time: '14:00',
    intent: 'danger',
    href: '#action',
  },
  {
    id: 'completed',
    content: (
      <>
        Your application is <strong>complete</strong>. View the outcome.
      </>
    ),
    timestamp: '3 days ago',
    time: '10:15',
    intent: 'success',
    href: '#completed',
  },
  {
    id: 'older',
    content: (
      <>
        Your application is <strong>on hold</strong>. Check the latest update.
      </>
    ),
    timestamp: '2 weeks ago',
    time: '11:00',
    intent: 'warning',
    href: '#older',
  },
  {
    id: 'complete-month',
    content: (
      <>
        Your document is <strong>ready</strong>. View or download it.
      </>
    ),
    timestamp: '1 month ago',
    time: '15:30',
    intent: 'success',
    href: '#complete-month',
  },
];

export function NotificationTrayDemo() {
  const [items, setItems] = useState(notificationDemoItems);
  const [filter, setFilter] = useState<NotificationFilter>('all');

  return (
    <VeliProvider language="en" colorScheme="light">
      <div className="not-prose flex justify-end rounded-2xl border border-border-base-muted bg-surface-base p-6">
        <NotificationTray
          items={items.filter((item) => filter === 'all' || item.unread)}
          unreadCount={items.filter((item) => item.unread).length}
          filter={filter}
          onFilterChange={setFilter}
          onItemAction={(id) =>
            setItems((previous) =>
              previous.map((item) => (item.id === id ? { ...item, unread: false } : item)),
            )
          }
          onMarkAllRead={() =>
            setItems((previous) => previous.map((item) => ({ ...item, unread: false })))
          }
        />
      </div>
    </VeliProvider>
  );
}
