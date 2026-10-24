'use client';

import { useState } from 'react';
import { ErrorPage, type ErrorPageProps } from '../src/error-page/error-page';
import { useVeliLanguage } from '@veli-design/react/provider';
import { errorPageMessages } from './error-page-messages';

/** Local catalog/story example. Applications own equivalent route and message wiring. */
export function ErrorPagePreview({ kind = '404', ...overrides }: Partial<ErrorPageProps>) {
  const { language } = useVeliLanguage();
  const [retried, setRetried] = useState(false);
  const copy = errorPageMessages[language];
  const page = copy.pages[kind];
  return (
    <>
      <ErrorPage
        kind={kind}
        title={page.title}
        description={page.description}
        detail={page.detail}
        artworkLabels={{
          changeStyle: `${page.detail}. ${copy.changeStyle}`,
        }}
        primaryAction={
          kind === '404'
            ? { type: 'link', label: copy.search, href: '#api' }
            : kind === '401' || kind === '403'
              ? {
                  type: 'link',
                  label: kind === '401' ? copy.signInAgain : copy.signIn,
                  href: '#ownership-and-prerequisites',
                }
              : { type: 'button', label: copy.retry, onPress: () => setRetried(true) }
        }
        secondaryAction={
          kind === 'offline' ? undefined : { type: 'link', label: copy.home, href: '#api' }
        }
        actionSeparator={copy.or}
        report={
          page.reportPrompt && page.reportLabel
            ? {
                prompt: page.reportPrompt,
                action: {
                  type: 'link',
                  label: page.reportLabel,
                  href: '#accessibility-and-validation',
                },
              }
            : undefined
        }
        {...overrides}
      />
      {retried && (
        <p role="status" className="type-body-sm-regular px-4 text-center">
          {language === 'dv' ? 'އަލުން މަސައްކަތް ކުރައްވަނީ.' : 'Retry requested.'}
        </p>
      )}
    </>
  );
}
