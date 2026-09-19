import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';
import { TeamShell } from './team-tabs';
import { VeliAppProviders } from './veli-app-providers';

function RootComponent() {
  return (
    <VeliAppProviders>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-8">
        <Outlet />
      </main>
    </VeliAppProviders>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/team/overview' });
  },
});

const teamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/team',
  component: () => (
    <TeamShell>
      <Outlet />
    </TeamShell>
  ),
});

const teamOverviewRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: '/overview',
  component: () => (
    <div className="flex flex-col gap-2">
      <h2 className="type-body-lg-semibold text-base-strong">Overview</h2>
      <p className="type-body-md-regular text-base-default">
        Route content for <code>/team/overview</code>. Click other tabs and confirm the URL updates
        without a full page reload.
      </p>
    </div>
  ),
});

const teamMembersRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: '/members',
  component: () => (
    <div className="flex flex-col gap-2">
      <h2 className="type-body-lg-semibold text-base-strong">Members</h2>
      <p className="type-body-md-regular text-base-default">
        Route content for <code>/team/members</code>. This tab relies on{' '}
        <code>VeliProvider.navigate</code>.
      </p>
    </div>
  ),
});

const teamSettingsRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: '/settings',
  component: () => (
    <div className="flex flex-col gap-2">
      <h2 className="type-body-lg-semibold text-base-strong">Settings</h2>
      <p className="type-body-md-regular text-base-default">
        Route content for <code>/team/settings</code>. This tab uses a per-item <code>render</code>{' '}
        prop wrapping TanStack <code>Link</code>.
      </p>
    </div>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  teamRoute.addChildren([teamOverviewRoute, teamMembersRoute, teamSettingsRoute]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
