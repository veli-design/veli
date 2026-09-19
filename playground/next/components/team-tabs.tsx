'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs } from '@tradenetcorp/veli-ui/tabs';

const tabs = [
  { id: '/team/overview', label: 'Overview', href: '/team/overview' },
  { id: '/team/members', label: 'Members', href: '/team/members' },
  {
    id: '/team/settings',
    label: 'Settings (next/link)',
    href: '/team/settings',
    render: (props: React.ComponentPropsWithoutRef<'a'>) => <Link {...props} />,
  },
] as const;

export function TeamTabs() {
  const pathname = usePathname();

  return (
    <Tabs
      listAriaLabel="Team sections"
      items={[...tabs]}
      selectedKey={pathname}
      onSelectionChange={() => {}}
    />
  );
}
