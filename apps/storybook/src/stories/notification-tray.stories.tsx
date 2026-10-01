import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { useArgs } from 'storybook/internal/preview-api';
import {
  NotificationTray,
  NotificationTrayContent,
  type NotificationItem,
  type NotificationTrayProps,
} from '@tradenetcorp/veli-blocks/notification-tray';

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

function usePreviewProps(args: NotificationTrayProps): NotificationTrayProps {
  const [, updateArgs] = useArgs<NotificationTrayProps>();
  return {
    ...args,
    items: args.items.filter((item) => args.filter === 'all' || item.unread),
    onFilterChange: (filter) => {
      updateArgs({ filter });
      args.onFilterChange(filter);
    },
    onItemAction: (id) => {
      if (args.items.some((item) => item.id === id && item.unread)) {
        updateArgs({
          items: args.items.map((item) => (item.id === id ? { ...item, unread: false } : item)),
          unreadCount: Math.max(0, args.unreadCount - 1),
        });
      }
      args.onItemAction?.(id);
    },
    onMarkAllRead: () => {
      updateArgs({
        items: args.items.map((item) => ({ ...item, unread: false })),
        unreadCount: 0,
      });
      args.onMarkAllRead?.();
    },
  };
}

const meta = {
  title: 'Blocks/Notification tray',
  component: NotificationTray,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="flex justify-center">
        <Story />
      </div>
    ),
  ],
  render: function Render(args) {
    const props = usePreviewProps(args);
    return <NotificationTray {...props} />;
  },
  args: {
    items: notificationDemoItems,
    unreadCount: notificationDemoItems.filter((item) => item.unread).length,
    filter: 'all',
    onFilterChange: fn(),
    onItemAction: fn(),
    onMarkAllRead: fn(),
  },
} satisfies Meta<typeof NotificationTray>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const EmbeddedContent: Story = {
  render: function Render(args) {
    const props = usePreviewProps(args);
    return (
      <div className="w-[389px] max-w-full shrink-0">
        <NotificationTrayContent
          {...props}
          className={`max-h-screen rounded-4xl shadow-sm ${props.className ?? ''}`}
        />
      </div>
    );
  },
};
export const Paginated: Story = {
  args: { unreadCount: 42, loadMore: { onLoadMore: () => {} } },
};
export const Empty: Story = { args: { items: [], unreadCount: 0 } };
export const EmptyUnread: Story = { args: { items: [], unreadCount: 0, filter: 'unread' } };
export const Loading: Story = { args: { items: [], isLoading: true } };
export const Error: Story = {
  args: { items: [], error: 'Notifications could not be loaded.', onRetry: () => {} },
};
export const MarkAllReadPending: Story = {
  name: 'Mark all as read pending',
  args: { isMarkingAllRead: true },
  parameters: {
    docs: {
      description: {
        story:
          'The app is saving “Mark all as read”. Open Notification options to see the disabled “Marking all as read…” action. This story holds that state; no request is sent.',
      },
    },
  },
};
export const LoadMorePending: Story = {
  args: { loadMore: { onLoadMore: () => {}, isLoading: true } },
};
export const LongContent: Story = {
  args: {
    items: [
      {
        id: 'long',
        content:
          'This example notification has a long message and a fictional reference to demonstrate wrapping: EXAMPLE12345678901234567890123456789012345678901234567890.',
        timestamp: 'A translated timestamp that needs more than one line',
        time: '09:30',
        unread: true,
        href: '#long',
      },
    ],
  },
};
