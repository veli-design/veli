import { Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
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
  component: () => (
    <div className="flex flex-col gap-2">
      <h1 className="type-body-lg-semibold text-base-strong">TanStack Router playground</h1>
      <p className="type-body-md-regular text-base-default">
        Clean slate for verifying Veli components against TanStack Router. Add routes and demos as
        needed.
      </p>
    </div>
  ),
});

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
