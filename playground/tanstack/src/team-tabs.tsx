import { Link, useRouterState } from '@tanstack/react-router';
import { Tabs } from '@tradenetcorp/veli-ui/tabs';

export function TeamTabs() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const tabs = [
    { id: '/team/overview', label: 'Overview', href: '/team/overview' },
    { id: '/team/members', label: 'Members', href: '/team/members' },
    {
      id: '/team/settings',
      label: 'Settings (TanStack Link)',
      href: '/team/settings',
      render: (props: React.ComponentPropsWithoutRef<'a'>) => (
        <Link {...props} to={props.href ?? '/team/settings'} />
      ),
    },
  ] as const;

  return (
    <Tabs
      listAriaLabel="Team sections"
      items={[...tabs]}
      selectedKey={pathname}
      onSelectionChange={() => {}}
    />
  );
}

export function TeamShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="type-body-sm-medium text-base-muted">TanStack Router playground</p>
        <h1 className="type-subtitle-semibold text-base-strong">Team</h1>
        <p className="type-body-md-regular text-base-default">
          Tabs use <code>href</code>. Selection follows the router pathname. Client-side navigation
          comes from <code>VeliProvider.navigate</code> / <code>useHref</code> (and one tab uses{' '}
          <code>render</code> + TanStack <code>Link</code>).
        </p>
      </header>
      <TeamTabs />
      <section className="rounded-lg border border-base-subtle bg-surface-raised p-4">
        {children}
      </section>
    </div>
  );
}
