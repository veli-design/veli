'use client';

import { useId, type ReactNode } from 'react';
import {
  BellSimple,
  CheckCircle,
  Cursor,
  DotsThree,
  Spinner,
  WarningCircle,
  X,
} from 'phosphor-react';
import { Badge } from '@tradenetcorp/veli-ui/badge';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Divider } from '@tradenetcorp/veli-ui/divider';
import { Link, type LinkProps } from '@tradenetcorp/veli-ui/link';
import {
  Menu,
  MenuItem,
  MenuPopover,
  MenuSeparator,
  MenuTrigger,
} from '@tradenetcorp/veli-ui/menu';

export type NotificationFilter = 'all' | 'unread';

export type NotificationItem = {
  id: string;
  /** Text or non-interactive markup. Never raw API HTML. */
  content: ReactNode;
  timestamp: string;
  time: string;
  dateTime?: string;
  unread?: boolean;
  intent?: 'neutral' | 'success' | 'warning' | 'danger';
  href?: string;
  isPending?: boolean;
  /** App-owned controls, rendered outside the row link. */
  actions?: ReactNode;
};

export const notificationTrayLabels = {
  title: 'Notifications',
  options: 'Notification options',
  close: 'Close notifications',
  markAllRead: 'Mark all as read',
  markingAllRead: 'Marking all as read…',
  showAll: 'Show all',
  showUnread: 'Show unread',
  unread: 'Unread',
  loading: 'Loading notifications…',
  pending: 'Updating notification…',
  emptyTitle: 'You do not have any notifications, yet.',
  emptyDescription:
    'Use our services to track and receive alerts that will keep you in the loop here.',
  emptyUnreadTitle: 'You have no unread notifications.',
  emptyUnreadDescription: 'You’re all caught up.',
  retry: 'Try again',
  loadMore: 'View more',
  loadingMore: 'Loading more notifications…',
};

export type NotificationTrayContentProps = {
  /** Already filtered by the app; may be one page of a larger result. */
  items: readonly NotificationItem[];
  unreadCount: number;
  filter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
  onItemAction?: (id: string) => void;
  onMarkAllRead?: () => void;
  isMarkingAllRead?: boolean;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  /** Omit when no more results are available for the current filter. */
  loadMore?: { onLoadMore: () => void; isLoading?: boolean };
  labels?: Partial<typeof notificationTrayLabels>;
  renderLink?: LinkProps['render'];
  onClose?: () => void;
  className?: string;
};

const intentStyles = {
  neutral: 'bg-bg-secondary-subtle text-icon-base',
  success: 'bg-bg-success-subtle text-icon-success',
  warning: 'bg-warning-300 text-icon-warning',
  danger: 'bg-bg-danger-subtle text-icon-danger',
};

function NotificationRow({
  item,
  labels,
  onAction,
  renderLink,
}: {
  item: NotificationItem;
  labels: typeof notificationTrayLabels;
  onAction?: (id: string) => void;
  renderLink?: LinkProps['render'];
}) {
  const statusId = useId();
  const intent = item.intent ?? 'neutral';
  const Icon =
    intent === 'success' ? CheckCircle : intent === 'neutral' ? BellSimple : WarningCircle;
  const content = (
    <>
      <span
        aria-hidden
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${intentStyles[intent]}`}
      >
        <Icon className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="type-body-sm-regular min-h-14 text-base-strong wrap-anywhere [&_strong]:font-semibold">
          {item.content}
        </span>
        <span className="type-caption-regular flex items-start justify-between gap-2 text-base-muted">
          <span className="flex min-w-0 items-center">
            <span
              aria-hidden
              className="inline-flex w-0 shrink-0 overflow-hidden opacity-0 transition-[width,opacity] duration-normal ease-out motion-reduce:transition-none data-[unread=true]:w-4 data-[unread=true]:opacity-100"
              data-unread={Boolean(item.unread)}
            >
              <Badge size="xs" appearance="emphasis" intent="info" className="bg-info-700" />
            </span>
            <time dateTime={item.dateTime} className="min-w-0 wrap-anywhere">
              <bdi>{item.timestamp}</bdi>
            </time>
          </span>
          <span className="shrink-0">
            <bdi>{item.time}</bdi>
          </span>
        </span>
      </span>
    </>
  );

  return (
    <li
      className="veli-notification-row relative rounded-2xl hover:bg-neutral-alpha-200 focus-within:bg-neutral-alpha-200 [&>:first-child]:flex [&>:first-child]:items-start [&>:first-child]:justify-start [&>:first-child]:gap-4 [&>:first-child]:rounded-2xl [&>:first-child]:p-2 [&>:first-child]:no-underline not-last:after:absolute not-last:after:inset-x-0 not-last:after:-bottom-0.5 not-last:after:h-px not-last:after:bg-border-base-subtle hover:after:opacity-0 focus-within:after:opacity-0 has-[+li:focus-within]:after:opacity-0 [@media(hover:hover)]:has-[+li:hover]:after:opacity-0"
      aria-busy={item.isPending || undefined}
    >
      {item.href ? (
        <Link
          href={item.href}
          size="lg"
          render={renderLink}
          isDisabled={item.isPending}
          aria-describedby={statusId}
          onPress={() => onAction?.(item.id)}
        >
          {content}
        </Link>
      ) : (
        <div className="flex items-start gap-4 p-2">{content}</div>
      )}
      <span id={statusId} className="sr-only">
        {item.unread ? labels.unread : ''}
        {item.isPending ? ` ${labels.pending}` : ''}
      </span>
      {item.actions ? (
        <div className="flex flex-wrap gap-2 ps-14 pe-2 pb-2">{item.actions}</div>
      ) : null}
    </li>
  );
}

export function NotificationTrayContent({
  items,
  unreadCount,
  filter,
  onFilterChange,
  onItemAction,
  onMarkAllRead,
  isMarkingAllRead = false,
  isLoading = false,
  error,
  onRetry,
  loadMore,
  labels: labelOverrides,
  renderLink,
  onClose,
  className = '',
}: NotificationTrayContentProps) {
  const labels = { ...notificationTrayLabels, ...labelOverrides };
  const titleId = useId();
  const status = isMarkingAllRead
    ? labels.markingAllRead
    : loadMore?.isLoading
      ? labels.loadingMore
      : isLoading
        ? labels.loading
        : '';

  return (
    <section
      aria-labelledby={titleId}
      className={`veli-notification-tray flex min-h-0 w-full flex-1 flex-col gap-1 bg-surface-raised p-4 text-start text-base-strong [&:has(.veli-notification-row:first-child:focus-within)>.veli-notification-divider]:opacity-0 [@media(hover:hover)]:[&:has(.veli-notification-row:first-child:hover)>.veli-notification-divider]:opacity-0 ${className}`}
    >
      <div className="flex min-h-11 shrink-0 items-center justify-between gap-2">
        <h2 id={titleId} className="type-body-md-semibold min-w-0 flex-1 wrap-anywhere">
          {labels.title}
        </h2>
        <MenuTrigger>
          <Button
            aria-label={labels.options}
            intent="secondary"
            appearance="ghost"
            iconOnly
            size="md"
          >
            <DotsThree className="size-5" />
          </Button>
          <MenuPopover placement="bottom end" offset={2} className="z-50 min-w-50">
            <Menu
              aria-label={labels.options}
              onAction={(key) => {
                if (key === 'mark-all') onMarkAllRead?.();
                else if (key === 'all' || key === 'unread') onFilterChange(key);
              }}
            >
              <MenuItem
                id="mark-all"
                size="sm"
                isDisabled={!onMarkAllRead || unreadCount === 0 || isMarkingAllRead}
              >
                {isMarkingAllRead ? labels.markingAllRead : labels.markAllRead}
              </MenuItem>
              <MenuSeparator />
              <MenuItem id="all" size="sm" aria-current={filter === 'all' ? 'true' : undefined}>
                {labels.showAll}
              </MenuItem>
              <MenuItem
                id="unread"
                size="sm"
                aria-current={filter === 'unread' ? 'true' : undefined}
              >
                {labels.showUnread}
              </MenuItem>
            </Menu>
          </MenuPopover>
        </MenuTrigger>
        {onClose ? (
          <Button
            aria-label={labels.close}
            intent="secondary"
            appearance="ghost"
            iconOnly
            size="md"
            onPress={onClose}
          >
            <X className="size-5" />
          </Button>
        ) : null}
      </div>
      <Divider aria-hidden appearance="subtle" className="veli-notification-divider" />
      <p role="status" className="sr-only">
        {status}
      </p>
      <div className="veli-notification-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {error ? (
          <div className="flex flex-col items-center gap-3 p-4 text-center">
            <p role="alert" className="type-body-sm-regular text-danger wrap-anywhere">
              {error}
            </p>
            {onRetry ? (
              <Button
                size="sm"
                intent="secondary"
                appearance="transparent"
                onPress={onRetry}
                isPending={isLoading}
              >
                {labels.retry}
              </Button>
            ) : null}
          </div>
        ) : null}
        {items.length > 0 ? (
          <ul
            aria-label={filter === 'unread' ? labels.showUnread : labels.showAll}
            className="m-0 flex list-none flex-col gap-1 p-0"
          >
            {items.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                labels={labels}
                onAction={onItemAction}
                renderLink={renderLink}
              />
            ))}
          </ul>
        ) : isLoading ? (
          <div aria-hidden className="flex min-h-80 items-center justify-center">
            <Spinner className="size-8 text-icon-base-muted motion-safe:animate-spin" />
          </div>
        ) : !error ? (
          <div
            role="status"
            className="flex min-h-80 flex-col items-center justify-center gap-4 p-2 text-center text-base-muted"
          >
            <Cursor className="size-6" aria-hidden />
            <div className="flex max-w-77 flex-col items-center gap-2">
              <p className="type-body-sm-semibold">
                {filter === 'unread' ? labels.emptyUnreadTitle : labels.emptyTitle}
              </p>
              <p className="type-caption-regular max-w-69">
                {filter === 'unread' ? labels.emptyUnreadDescription : labels.emptyDescription}
              </p>
            </div>
          </div>
        ) : null}
        {loadMore ? (
          <div className="flex justify-center p-2">
            <Button
              intent="secondary"
              appearance="ghost"
              size="sm"
              onPress={loadMore.onLoadMore}
              isPending={loadMore.isLoading}
              isDisabled={isLoading}
            >
              {labels.loadMore}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
