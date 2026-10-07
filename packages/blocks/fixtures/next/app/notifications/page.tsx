'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { RouterProvider } from 'react-aria-components';
import { Button } from '@tradenetcorp/veli-ui/button';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';
import {
  NotificationTray,
  type NotificationItem,
  type NotificationFilter,
} from '../../components/blocks/notification-tray/notification-tray';

const initialItems: NotificationItem[] = [
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
    href: '/about',
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
    href: '/about',
  },
  {
    id: 'complete',
    content: (
      <>
        Your application is <strong>complete</strong>. View the outcome.
      </>
    ),
    timestamp: '1 month ago',
    time: '10:15',
    intent: 'success',
    href: '/about',
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [language, setLanguage] = useState<'en' | 'dv'>('en');
  const [dark, setDark] = useState(false);
  const [state, setState] = useState('ready');
  const [pending, setPending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markCalls, setMarkCalls] = useState(0);
  const [loadCalls, setLoadCalls] = useState(0);
  const [actionCalls, setActionCalls] = useState(0);
  const [routing, setRouting] = useState('next-link');

  const visibleItems = items
    .filter((item) => filter === 'all' || item.unread)
    .map((item) => ({
      ...item,
      content:
        language === 'dv' ? (
          <>
            ތިޔަ ހުށަހެޅުއްވި <bdi>EXAMPLE-001</bdi> ފޯމުގެ ހާލަތު ބަދަލުވެއްޖެ.
          </>
        ) : state === 'long' ? (
          'An example notification with a fictional unbroken reference: EXAMPLE1234567890123456789012345678901234567890123456789012345678901234567890.'.repeat(
            2,
          )
        ) : (
          item.content
        ),
      actions:
        item.id === 'review' ? (
          <Button
            size="sm"
            appearance="transparent"
            intent="secondary"
            onPress={() => setActionCalls((n) => n + 1)}
          >
            Remind me later
          </Button>
        ) : undefined,
    }));

  return (
    <RouterProvider navigate={(href, options) => router.push(href, options)}>
      <VeliProvider
        language={language}
        colorScheme={dark ? 'dark' : 'light'}
        disableTransitionOnChange
      >
        <main
          className="min-h-screen bg-surface-base p-6 text-base-strong"
          dir={language === 'dv' ? 'rtl' : 'ltr'}
          lang={language}
        >
          <h1>Notification tray consumer fixture</h1>
          <div className="flex flex-wrap gap-3 py-4">
            <button onClick={() => setLanguage(language === 'en' ? 'dv' : 'en')}>
              Change language
            </button>
            <button onClick={() => setDark(!dark)}>Change theme</button>
            <label>
              Routing{' '}
              <select value={routing} onChange={(event) => setRouting(event.target.value)}>
                <option value="next-link">Next.js Link</option>
                <option value="provider">React Aria RouterProvider</option>
              </select>
            </label>
            <label>
              State{' '}
              <select value={state} onChange={(event) => setState(event.target.value)}>
                {['ready', 'loading', 'empty', 'error', 'refresh-error', 'long'].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <button
              id="receive-notification"
              onClick={() =>
                setItems((previous) => [
                  { ...initialItems[0], id: `incoming-${previous.length}` },
                  ...previous,
                ])
              }
            >
              Receive notification
            </button>
          </div>
          <p>
            Mark calls: {markCalls}; load calls: {loadCalls}; action calls: {actionCalls}
          </p>
          <div className="flex justify-end">
            <NotificationTray
              isOpen={open}
              onOpenChange={setOpen}
              items={['empty', 'loading', 'error'].includes(state) ? [] : visibleItems}
              unreadCount={state === 'empty' ? 0 : items.filter((item) => item.unread).length}
              filter={filter}
              onFilterChange={setFilter}
              isLoading={state === 'loading'}
              error={state.includes('error') ? 'Notifications could not be loaded.' : undefined}
              onRetry={() => setState('ready')}
              isMarkingAllRead={pending}
              onMarkAllRead={() => {
                setMarkCalls((n) => n + 1);
                setPending(true);
              }}
              onItemAction={(id) =>
                setItems((previous) =>
                  previous.map((item) => (item.id === id ? { ...item, unread: false } : item)),
                )
              }
              loadMore={
                hasMore && state === 'ready'
                  ? {
                      isLoading: loadingMore,
                      onLoadMore: () => {
                        setLoadCalls((n) => n + 1);
                        setLoadingMore(true);
                      },
                    }
                  : undefined
              }
              labels={
                language === 'dv'
                  ? {
                      title: 'ނޯޓިފިކޭޝަންތައް',
                      options: 'އިޚްތިޔާރުތައް',
                      close: 'ބަންދުކުރައްވާ',
                      markAllRead: 'ހުރިހާ ނޯޓިފިކޭޝަންތައް ކިޔާލެވިފައި',
                      markingAllRead: 'ބަދަލުކުރަނީ…',
                      showAll: 'ހުރިހާ ނޯޓިފިކޭޝަންތައް',
                      showUnread: 'ނުކިޔާ ނޯޓިފިކޭޝަންތައް',
                      unread: 'ނުކިޔާ',
                      loading: 'ލޯޑުވަނީ…',
                      pending: 'ބަދަލުކުރަނީ…',
                      emptyTitle: 'އައު ނޯޓިފިކޭޝަނެއް ނެތް.',
                      emptyDescription: 'އައު މަޢުލޫމާތު މިތާ ފެންނާނެ.',
                      emptyUnreadTitle: 'ނުކިޔާ ނޯޓިފިކޭޝަނެއް ނެތް.',
                      emptyUnreadDescription: 'ހުރިހާ ނޯޓިފިކޭޝަންތައް ކިޔާލެވިފައި.',
                      retry: 'އަލުން ބައްލަވާ',
                      loadMore: 'އިތުރަށް ބައްލަވާ',
                      loadingMore: 'ލޯޑުވަނީ…',
                    }
                  : undefined
              }
              renderLink={
                routing === 'next-link'
                  ? (props) =>
                      'href' in props ? (
                        <NextLink {...props} href={props.href!} />
                      ) : (
                        <span {...props} />
                      )
                  : undefined
              }
            />
          </div>
          {/* These controls mimic external query updates, without putting fake API behavior in the block. */}
          <button
            id="complete-mark"
            onClick={() => {
              setItems((previous) => previous.map((item) => ({ ...item, unread: false })));
              setPending(false);
            }}
          >
            Complete mark
          </button>
          <button
            id="complete-load"
            onClick={() => {
              setItems((previous) => [...previous, { ...initialItems[2], id: 'loaded' }]);
              setLoadingMore(false);
              setHasMore(false);
            }}
          >
            Complete load
          </button>
        </main>
      </VeliProvider>
    </RouterProvider>
  );
}
