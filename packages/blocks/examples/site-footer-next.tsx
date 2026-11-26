'use client';

import NextLink from 'next/link';
import {
  SiteFooter,
  SiteFooterThemeToggle,
  type SiteFooterColorScheme,
} from '../components/blocks/site-footer/site-footer';

type ApplicationFooterProps = {
  /** Pass both to show the theme toggle, for example when signed out. */
  colorScheme?: SiteFooterColorScheme;
  onColorSchemeChange?: (colorScheme: SiteFooterColorScheme) => void;
};

export function ApplicationFooter({ colorScheme, onColorSchemeChange }: ApplicationFooterProps) {
  return (
    <SiteFooter
      startLabel="Service information"
      endLabel="Policies"
      startLinks={[{ id: 'about', label: 'About', href: '/about' }]}
      endLinks={[{ id: 'privacy', label: 'Privacy', href: '/privacy' }]}
      renderLink={(props) =>
        'href' in props ? <NextLink {...props} href={props.href!} /> : <span {...props} />
      }
      endSlot={
        colorScheme && onColorSchemeChange ? (
          <SiteFooterThemeToggle
            colorScheme={colorScheme}
            onColorSchemeChange={onColorSchemeChange}
            labels={{
              change: 'Change theme',
              label: 'Theme',
              light: 'Light',
              dark: 'Dark',
              auto: 'Automatic',
            }}
          />
        ) : undefined
      }
    />
  );
}
