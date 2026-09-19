import { TeamTabs } from '@/components/team-tabs';

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="type-body-sm-medium text-base-muted">Next.js App Router playground</p>
        <h1 className="type-subtitle-semibold text-base-strong">Team</h1>
        <p className="type-body-md-regular text-base-default">
          Tabs use <code>href</code>. Selection follows <code>usePathname()</code>. Client-side
          navigation comes from <code>VeliProvider.navigate</code> (and one tab uses{' '}
          <code>render</code> + <code>next/link</code>).
        </p>
      </header>
      <TeamTabs />
      <section className="rounded-lg border border-base-subtle bg-surface-raised p-4">
        {children}
      </section>
    </div>
  );
}
