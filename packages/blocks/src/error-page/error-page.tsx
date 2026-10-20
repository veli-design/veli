'use client';

import { useId } from 'react';
import { Link } from '@tradenetcorp/veli-ui/link';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { ErrorArtwork } from './error-artwork';
import type { ErrorPageAction, ErrorPageProps } from './types';
export type {
  ErrorPageAction,
  ErrorPageArtworkLabels,
  ErrorPageKind,
  ErrorPageProps,
} from './types';

function RecoveryAction({
  action,
  renderLink,
  small = false,
}: {
  action: ErrorPageAction;
  renderLink: ErrorPageProps['renderLink'];
  small?: boolean;
}) {
  if (action.type === 'link')
    return (
      <Link
        href={action.href}
        target={action.target}
        rel={action.target === '_blank' ? (action.rel ?? 'noopener noreferrer') : action.rel}
        render={renderLink}
        size={small ? 'sm' : 'md'}
        underline="hover"
      >
        {action.label}
      </Link>
    );
  return (
    <Link
      size={small ? 'sm' : 'md'}
      underline="hover"
      onPress={action.onPress}
      isDisabled={action.isDisabled || action.isPending}
      // React Aria filters aria-busy; preserve it on the rendered callback link.
      render={(props) => <span {...props} aria-busy={action.isPending || undefined} />}
    >
      {action.label}
    </Link>
  );
}

export function ErrorPage({
  kind,
  title,
  description,
  detail,
  artworkLabels,
  primaryAction,
  secondaryAction,
  actionSeparator,
  report,
  animation = 'auto',
  headingLevel = 1,
  renderLink,
  className = '',
}: ErrorPageProps) {
  const titleId = useId();
  const { lang, direction } = useVeliLanguage();
  const Heading = headingLevel === 2 ? 'h2' : headingLevel === 3 ? 'h3' : 'h1';
  return (
    <section
      lang={lang}
      dir={direction}
      aria-labelledby={titleId}
      className={`veli-error-page bg-surface-base text-base-default flex w-full min-w-0 flex-col items-center px-4 pt-30 pb-30 md:pt-39 md:pb-50 ${className}`}
    >
      <div className="flex w-full min-w-0 max-w-[936px] flex-col items-center text-center [overflow-wrap:anywhere]">
        <div className="flex w-full max-w-[565px] flex-col gap-3">
          <Heading
            id={titleId}
            className="type-heading-4-medium md:type-heading-2-medium text-base-emphasis"
          >
            {title}
          </Heading>
          <div className="type-body-md-regular">
            <p className="whitespace-pre-line [text-wrap:balance]">{description}</p>
            {(primaryAction || secondaryAction) && (
              <div className="flex flex-wrap items-baseline justify-center gap-x-1 gap-y-1">
                {primaryAction && <RecoveryAction action={primaryAction} renderLink={renderLink} />}
                {primaryAction && secondaryAction && actionSeparator && (
                  <span>{actionSeparator}</span>
                )}
                {secondaryAction && (
                  <RecoveryAction action={secondaryAction} renderLink={renderLink} />
                )}
              </div>
            )}
          </div>
        </div>
        <ErrorArtwork
          key={`${kind}:${animation}`}
          kind={kind}
          animation={animation}
          labels={artworkLabels}
        />
        <div className="type-body-sm-regular mt-12 flex w-full flex-col items-center gap-3">
          <p className="text-base-muted">{detail}</p>
          {report && (
            <div className="flex max-w-full flex-wrap items-baseline justify-center gap-x-1 gap-y-1">
              <span>{report.prompt}</span>
              <RecoveryAction action={report.action} renderLink={renderLink} small />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
