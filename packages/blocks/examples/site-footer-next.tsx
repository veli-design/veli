'use client';

import NextLink from 'next/link';
import { SiteFooter } from '../components/blocks/site-footer/site-footer';

export function ApplicationFooter() {
  return (
    <SiteFooter
      startLabel="Service information"
      endLabel="Policies"
      startLinks={[{ id: 'about', label: 'About', href: '/about' }]}
      endLinks={[{ id: 'privacy', label: 'Privacy', href: '/privacy' }]}
      renderLink={(props) =>
        'href' in props ? <NextLink {...props} href={props.href!} /> : <span {...props} />
      }
    />
  );
}
