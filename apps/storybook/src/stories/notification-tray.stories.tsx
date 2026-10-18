import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { useArgs } from 'storybook/internal/preview-api';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
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
        Your application <strong>maju redirect</strong> is now in <strong>progress</strong> status
      </>
    ),
    timestamp: '5 minutes ago',
    time: '09:30',
    unread: true,
    intent: 'success',
    href: '#progress',
  },
  {
    id: 'review',
    content: (
      <>
        Action required for your application <strong>MND.01.CA.cx.26.MY5638</strong>. Please review
        and submit additional information.
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
        Action required for your application <strong>MND.01.CA.cx.26.MY5638</strong>. Please review
        and submit additional information.
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
        Status update for your application <strong>MND.01.CA.26.MY5638</strong>. Marked{' '}
        <strong>complete.</strong>
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

const dhivehiLabels = {
  title: 'ނޯޓިފިކޭޝަންތައް',
  options: 'އިޚްތިޔާރުތައް',
  close: 'ބަންދުކުރައްވާ',
  markAllRead: 'ހުރިހާ ނޯޓިފިކޭޝަންތައް ކިޔާލައްވާ',
  markingAllRead: 'ކިޔާލެވިފައި ކަމަށް ބަދަލުކުރަނީ…',
  showAll: 'ހުރިހާ ނޯޓިފިކޭޝަންތައް',
  showUnread: 'ނުކިޔާ ނޯޓިފިކޭޝަންތައް',
  unread: 'ނުކިޔާ',
  loading: 'ނޯޓިފިކޭޝަންތައް ލޯޑުވަނީ…',
  pending: 'ނޯޓިފިކޭޝަން ބަދަލުކުރަނީ…',
  emptyTitle: 'އަދި ނޯޓިފިކޭޝަނެއް ނެތް.',
  emptyDescription: 'ޚިދުމަތްތަކުގެ އައު މަޢުލޫމާތު މިތާ ފެންނާނެ.',
  emptyUnreadTitle: 'ނުކިޔާ ނޯޓިފިކޭޝަނެއް ނެތް.',
  emptyUnreadDescription: 'ހުރިހާ ނޯޓިފިކޭޝަންތައް ކިޔާލެވިފައި.',
  retry: 'އަލުން ބައްލަވާ',
  loadMore: 'އިތުރަށް ބައްލަވާ',
  loadingMore: 'އިތުރު ނޯޓިފިކޭޝަންތައް ލޯޑުވަނީ…',
} satisfies Required<NonNullable<NotificationTrayProps['labels']>>;

const dhivehiItems: Record<string, Pick<NotificationItem, 'content' | 'timestamp'>> = {
  progress: {
    content: (
      <>
        <strong>ތިޔަ ހުށަހެޅުއްވި ފޯމު ބަލަމުންދަނީ</strong>.
      </>
    ),
    timestamp: '5 މިނެޓް ކުރިން',
  },
  review: {
    content: (
      <>
        ތިޔަ ހުށަހެޅުއްވި ފޯމަށް <strong>އިތުރު މަޢުލޫމާތު ބޭނުންވެއްޖެ</strong>. އެދިފައިވާ
        މަޢުލޫމާތު ބައްލަވާ.
      </>
    ),
    timestamp: '30 މިނެޓް ކުރިން',
  },
  submitted: {
    content: (
      <>
        ތިޔަ ފޯމު <strong>ހުށަހެޅިފައި</strong>. ފޯމުގެ ހާލަތު ބައްލަވާ.
      </>
    ),
    timestamp: '1 ގަޑިއިރު ކުރިން',
  },
  action: {
    content: (
      <>
        ތިޔަ ކުރެއްވި ފައިސާގެ މުޢާމަލާ <strong>ކާމިޔާބު ނުވި</strong>. އަލުން މަސައްކަތް ކުރައްވާ.
      </>
    ),
    timestamp: '1 ދުވަސް ކުރިން',
  },
  completed: {
    content: (
      <>
        ތިޔަ ހުށަހެޅުއްވި ފޯމުގެ މަސައްކަތް <strong>ނިމިފައި</strong>. ނަތީޖާ ބައްލަވާ.
      </>
    ),
    timestamp: '3 ދުވަސް ކުރިން',
  },
  older: {
    content: (
      <>
        ތިޔަ ހުށަހެޅުއްވި ފޯމު <strong>ވަގުތީގޮތުން ހުއްޓާލެވިފައި</strong>. އެންމެ ފަހުގެ
        މަޢުލޫމާތު ބައްލަވާ.
      </>
    ),
    timestamp: '2 ހަފްތާ ކުރިން',
  },
  'complete-month': {
    content: (
      <>
        ތިޔަ ލިޔުން <strong>ތައްޔާރު</strong>. ލިޔުން ބައްލަވާ ނުވަތަ ޑައުންލޯޑު ކުރައްވާ.
      </>
    ),
    timestamp: '1 މަސް ކުރިން',
  },
  long: {
    content: (
      <>
        މި ނޯޓިފިކޭޝަންގެ ދިގު މެސެޖާއި މިސާލަށް ދެވިފައިވާ ރިފަރެންސް ނަންބަރު އެކަކަށްވުރެ ގިނަ
        ސަފުތަކެއްގައި ފެންނާނެ:{' '}
        <bdi>EXAMPLE12345678901234567890123456789012345678901234567890</bdi>.
      </>
    ),
    timestamp: 'އެކަކަށްވުރެ ގިނަ ސަފުތަކެއް ބޭނުންވާ ދިގު ވަގުތުގެ މަޢުލޫމާތު',
  },
};

function usePreviewProps(
  args: NotificationTrayProps,
  updateArgs: (args: Partial<NotificationTrayProps>) => void,
): NotificationTrayProps {
  const { direction } = useVeliLanguage();
  const isDhivehi = direction === 'rtl';
  const loadMore = args.loadMore;
  return {
    ...args,
    items: args.items
      .filter((item) => args.filter === 'all' || item.unread)
      .map((item) => (isDhivehi ? { ...item, ...dhivehiItems[item.id] } : item)),
    labels: isDhivehi ? { ...dhivehiLabels, ...args.labels } : args.labels,
    error:
      isDhivehi && args.error === 'Notifications could not be loaded.'
        ? 'ނޯޓިފިކޭޝަންތައް ލޯޑު ނުކުރެވުނު.'
        : args.error,
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
    onMarkAllRead: async () => {
      updateArgs({ isMarkingAllRead: true });
      args.onMarkAllRead?.();
      await new Promise((resolve) => setTimeout(resolve, 1600));
      updateArgs({
        isMarkingAllRead: false,
        items: args.items.map((item) => ({ ...item, unread: false })),
        unreadCount: 0,
      });
    },
    loadMore: loadMore
      ? {
          ...loadMore,
          onLoadMore: async () => {
            updateArgs({ loadMore: { ...loadMore, isLoading: true } });
            loadMore.onLoadMore();
            await new Promise((resolve) => setTimeout(resolve, 1600));
            updateArgs({
              items: [...args.items, { ...notificationDemoItems[0], id: 'next-page' }],
              loadMore: undefined,
            });
          },
        }
      : undefined,
  };
}

function Preview({
  args,
  updateArgs,
  embedded = false,
}: {
  args: NotificationTrayProps;
  updateArgs: (args: Partial<NotificationTrayProps>) => void;
  embedded?: boolean;
}) {
  const props = usePreviewProps(args, updateArgs);
  return embedded ? (
    <div className="w-[389px] max-w-full shrink-0">
      <NotificationTrayContent
        {...props}
        className={`max-h-screen rounded-4xl shadow-sm ${props.className ?? ''}`}
      />
    </div>
  ) : (
    <NotificationTray {...props} />
  );
}

const meta = {
  title: 'Blocks/Notification tray',
  component: NotificationTray,
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="flex justify-center">
        <Story />
      </div>
    ),
  ],
  render: function Render(args) {
    const [, updateArgs] = useArgs<NotificationTrayProps>();
    return <Preview args={args} updateArgs={updateArgs} />;
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
    const [, updateArgs] = useArgs<NotificationTrayProps>();
    return <Preview args={args} updateArgs={updateArgs} embedded />;
  },
};
export const Paginated: Story = {
  args: { unreadCount: 42, loadMore: { onLoadMore: () => {} } },
};
export const Empty: Story = { args: { items: [], unreadCount: 0 } };
export const EmptyUnread: Story = { args: { items: [], unreadCount: 0, filter: 'unread' } };
export const Loading: Story = {
  args: { items: [], unreadCount: 0, isLoading: true },
  parameters: {
    docs: {
      description: {
        story:
          'Each notification row shares one highlight across its icon and text placeholders: 1500ms sweep, then 500ms rest. Supports light/dark themes, RTL, and static placeholders under reduced motion.',
      },
    },
  },
};
export const Error: Story = {
  args: { items: [], error: 'Notifications could not be loaded.', onRetry: () => {} },
};
export const MarkAllReadPending: Story = {
  name: 'Mark all as read pending',
  args: { isMarkingAllRead: true },
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

export const RetryPending: Story = {
  args: { items: [], error: 'Notifications could not be loaded.', onRetry: fn(), isLoading: true },
};

export const LoadingStates: Story = {
  name: 'Notification loading states',
  render: function Render(args) {
    const [, updateArgs] = useArgs<NotificationTrayProps>();
    return (
      <div className="flex max-w-full flex-wrap justify-center gap-6">
        {[
          {
            title: 'Initial loading skeleton',
            props: { items: [], unreadCount: 0, isLoading: true },
          },
          {
            title: 'Pending paging button',
            props: {
              items: notificationDemoItems.slice(0, 2),
              loadMore: { onLoadMore: fn(), isLoading: true },
            },
          },
          {
            title: 'Mark all as read — open options',
            props: { items: notificationDemoItems.slice(0, 2), isMarkingAllRead: true },
          },
        ].map(({ title, props }) => (
          <div key={title} className="flex max-w-full flex-col gap-3">
            <p className="type-body-sm-semibold text-base-strong">{title}</p>
            <Preview args={{ ...args, ...props }} updateArgs={updateArgs} embedded />
          </div>
        ))}
      </div>
    );
  },
};
