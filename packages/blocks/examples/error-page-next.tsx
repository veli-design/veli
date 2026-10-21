'use client';

import NextLink from 'next/link';
import { ErrorPage, type ErrorPageKind } from '../components/blocks/error-page/error-page';
import { errorPageMessages } from './error-page-messages';

/** The host resolves routes, language and retry policy; this adapter owns callbacks. */
export function ApplicationErrorPage({
  kind,
  language,
  retry,
  homeHref,
  searchHref,
  signInHref,
  reportHref,
  animation,
}: {
  kind: ErrorPageKind;
  language: 'en' | 'dv';
  retry: () => void;
  homeHref: string;
  searchHref: string;
  signInHref: string;
  reportHref: string;
  animation?: 'auto' | 'static';
}) {
  const copy = errorPageMessages[language];
  const page = copy.pages[kind];
  return (
    <ErrorPage
      kind={kind}
      animation={animation}
      {...page}
      artworkLabels={{
        changeStyle: `${page.detail}. ${copy.changeStyle}`,
      }}
      primaryAction={
        kind === '404'
          ? { type: 'link', label: copy.search, href: searchHref }
          : kind === '401' || kind === '403'
            ? {
                type: 'link',
                label: kind === '401' ? copy.signInAgain : copy.signIn,
                href: signInHref,
              }
            : { type: 'button', label: copy.retry, onPress: retry }
      }
      secondaryAction={
        kind === 'offline' ? undefined : { type: 'link', label: copy.home, href: homeHref }
      }
      actionSeparator={copy.or}
      report={
        page.reportPrompt && page.reportLabel
          ? {
              prompt: page.reportPrompt,
              action: { type: 'link', label: page.reportLabel, href: reportHref },
            }
          : undefined
      }
      renderLink={(props) =>
        'href' in props ? <NextLink {...props} href={props.href!} /> : <span {...props} />
      }
    />
  );
}
