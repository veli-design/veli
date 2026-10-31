'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import { Button } from '@veli-design/react/button';
import { VeliProvider } from '@veli-design/react/provider';
import { ErrorPage, type ErrorPageKind } from '../../components/blocks/error-page/error-page';
import { PageNavigationFooter } from '../../components/blocks/page-navigation-footer/page-navigation-footer';
import { SiteFooter } from '../../components/blocks/site-footer/site-footer';
import { ApplicationErrorPage } from '../../error-page-adapter';
import { ApplicationPageNavigationFooter } from '../../page-navigation-footer-adapter';
import { errorPageMessages } from '../../error-page-messages';
import { pageNavigationFooterContent } from '../../page-navigation-footer-content';

export default function ErrorExample({ initial }: { initial: Record<string, string | undefined> }) {
  const [language, setLanguage] = useState<'en' | 'dv'>(initial.lang === 'dv' ? 'dv' : 'en');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
    initial.theme === 'dark' ? 'dark' : initial.theme === 'system' ? 'system' : 'light',
  );
  const [kind, setKind] = useState<ErrorPageKind>(
    (['401', '403', '404', '500', '503', 'offline'].includes(initial.kind ?? '')
      ? initial.kind
      : '404') as ErrorPageKind,
  );
  const [retries, setRetries] = useState(0);
  const [pending, setPending] = useState(initial.variant === 'pending');
  const copy = errorPageMessages[language];
  const page = copy.pages[kind];
  const footer = pageNavigationFooterContent(language);
  const logo = (
    <img
      src="/blocks/example-organization-emblem.svg"
      alt=""
      width={61}
      height={70}
      className="object-contain"
    />
  );
  return (
    <VeliProvider
      language={language}
      colorScheme={theme}
      disableTransitionOnChange
      className="min-h-screen bg-surface-base text-base-default"
    >
      <div role="region" aria-label="Fixture controls" className="flex flex-wrap gap-3 p-4">
        <Button onPress={() => setLanguage(language === 'en' ? 'dv' : 'en')}>
          Fixture language
        </Button>
        <Button onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Fixture theme</Button>
        <Button onPress={() => setKind(kind === '404' ? '500' : '404')}>Fixture kind</Button>
        <Button onPress={() => setPending(!pending)}>Fixture pending</Button>
        <span data-testid="retry-count">{retries}</span>
      </div>
      <main>
        {initial.view === 'footer' ? (
          <h1 className="type-heading-4-medium p-8">Example service</h1>
        ) : initial.variant ? (
          <ErrorPage
            kind={kind}
            title={initial.variant === 'long' ? page.title.repeat(6) : page.title}
            description={
              initial.variant === 'long' ? `${page.description} `.repeat(10) : page.description
            }
            detail={page.detail}
            artworkLabels={{
              changeStyle: `${page.detail}. ${copy.changeStyle}`,
            }}
            animation={initial.animation === 'static' ? 'static' : 'auto'}
            primaryAction={
              initial.variant === 'no-actions'
                ? undefined
                : {
                    type: 'button',
                    label: copy.retry,
                    isPending: pending,
                    onPress: () => setRetries((n) => n + 1),
                  }
            }
            secondaryAction={
              initial.variant === 'no-actions'
                ? undefined
                : { type: 'link', label: copy.home, href: '/about' }
            }
            actionSeparator={copy.or}
            renderLink={(props) =>
              'href' in props ? <NextLink {...props} href={props.href!} /> : <span {...props} />
            }
            report={
              initial.variant === 'long'
                ? {
                    prompt: 'Long report prompt '.repeat(20),
                    action: {
                      type: 'link',
                      label: 'Report the broken link '.repeat(10),
                      href: '/about#contact',
                    },
                  }
                : undefined
            }
          />
        ) : (
          <ApplicationErrorPage
            kind={kind}
            animation={initial.animation === 'static' ? 'static' : 'auto'}
            language={language}
            retry={() => setRetries((n) => n + 1)}
            homeHref="/about"
            searchHref="/about#search"
            signInHref="/about#signin"
            reportHref="/about#contact"
          />
        )}
        {initial.footer !== 'none' &&
          (initial.variant === 'empty-footer' ? (
            <PageNavigationFooter label={footer.label} />
          ) : initial.variant === 'internal-only' || initial.variant === 'external-only' ? (
            <PageNavigationFooter
              {...footer}
              internalLinks={initial.variant === 'external-only' ? [] : footer.internalLinks}
              externalLinks={initial.variant === 'internal-only' ? [] : footer.externalLinks}
            />
          ) : initial.variant === 'long' ? (
            <PageNavigationFooter
              {...footer}
              identity={{
                ...footer.identity,
                name: footer.identity.name.repeat(5),
                description: footer.identity.description.repeat(5),
                logo,
              }}
              internalLinks={footer.internalLinks.map((link) => ({
                ...link,
                label: link.label.repeat(8),
              }))}
              externalLinks={footer.externalLinks.map((link) => ({
                ...link,
                label: link.label.repeat(8),
              }))}
            />
          ) : (
            <ApplicationPageNavigationFooter
              language={language}
              logo={initial.variant === 'no-logo' ? undefined : logo}
            />
          ))}
      </main>
      <SiteFooter
        startLabel="Information"
        endLabel="Policies"
        startLinks={[{ id: 'about', label: 'About this service', href: '/about' }]}
        endLinks={[{ id: 'privacy', label: 'Privacy', href: '/privacy' }]}
      />
    </VeliProvider>
  );
}
