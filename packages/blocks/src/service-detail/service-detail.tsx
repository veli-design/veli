'use client';

import { useId, useState, type ReactNode } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Link } from '@tradenetcorp/veli-ui/link';
import { Alert, AlertDescription, AlertTitle } from '@tradenetcorp/veli-ui/alert';
import { InfoIcon } from '@phosphor-icons/react';
import { GuidelineSheet } from './guideline-sheet';
import { ApplyingInfoDialog } from './applying-info-dialog';
import type { ServiceAction, ServiceDetailProps } from './types';
import './service-detail.css';

export type * from './types';

function ServiceActionButton({
  action,
  renderLink,
}: {
  action: ServiceAction;
  renderLink?: ServiceDetailProps['renderLink'];
}) {
  const helpId = useId();
  const shared = {
    size: 'lg' as const,
    className: 'veli-service-detail-start-button',
    intent: action.emphasis === 'secondary' ? ('secondary' as const) : ('primary' as const),
    isDisabled: action.isDisabled,
    appearance: action.appearance,
    'aria-describedby': action.isDisabled && action.disabledReason ? helpId : undefined,
  };
  return (
    <>
      {action.href !== undefined ? (
        <Button
          {...shared}
          as="a"
          href={action.href}
          target={action.target}
          rel={action.rel}
          render={renderLink}
        >
          {action.label}
          {action.trailingIcon && (
            <span
              aria-hidden
              className="veli-service-detail-small-icon veli-service-detail-directional-icon"
            >
              {action.trailingIcon}
            </span>
          )}
        </Button>
      ) : (
        <Button {...shared} onPress={action.onPress}>
          {action.label}
          {action.trailingIcon && (
            <span
              aria-hidden
              className="veli-service-detail-small-icon veli-service-detail-directional-icon"
            >
              {action.trailingIcon}
            </span>
          )}
        </Button>
      )}
      {action.isDisabled && action.disabledReason && (
        <p id={helpId} className="veli-service-detail-muted">
          {action.disabledReason}
        </p>
      )}
    </>
  );
}

/** Isolate Latin runs so amounts and references retain their reading order in RTL content. */
function DisplayText({ text }: { text: string }) {
  // Keep word-separating spaces outside the LTR isolate so they separate RTL neighbours.
  return text
    .split(/([A-Za-z0-9](?:[A-Za-z0-9 .,–—−+/%()·:-]*[A-Za-z0-9.,–—−+/%()·:-])?)/g)
    .map((part, index) =>
      /^[A-Za-z0-9]/.test(part) ? (
        <bdi
          key={index}
          dir="ltr"
          lang={/[A-Za-z]/.test(part) ? 'en' : undefined}
          className={/[A-Za-z]/.test(part) ? 'veli-service-detail-latin' : undefined}
        >
          {part}
        </bdi>
      ) : (
        part
      ),
    );
}

function Meta({ icon, label, children }: { icon: string; label: string; children: ReactNode }) {
  return (
    <div className="veli-service-detail-meta-item">
      <span aria-hidden className="veli-service-detail-meta-icon">
        <span className={`veli-service-detail-meta-art veli-service-detail-art-${icon}`} />
      </span>
      <div className="veli-service-detail-meta-text">
        <dt className="veli-service-detail-meta-label">{label}</dt>
        <dd className="veli-service-detail-meta-value">{children}</dd>
      </div>
    </div>
  );
}

/** Approved summary/card presentation. The host owns its page landmark and application workflows. */
export function ServiceDetail({
  title,
  description,
  provider,
  metadata,
  services = [],
  prerequisites,
  apply,
  guideline,
  labels,
  renderLink,
  isGuidelineOpen,
  defaultGuidelineOpen,
  onGuidelineOpenChange,
  className,
  dialogClassName,
  overlayClassName,
}: ServiceDetailProps) {
  const [feesOpen, setFeesOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const feesId = useId();
  const servicesId = useId();
  const hasMetadata = Boolean(
    metadata?.applicationTime ||
    metadata?.processingTime ||
    metadata?.eligibility ||
    metadata?.feeSummary ||
    metadata?.fees?.length,
  );
  const hiddenServices = Math.max(services.length - 3, 0);
  const portalClasses = { dialogClassName, overlayClassName };
  return (
    <div className={`veli-service-detail-root ${className ?? ''}`}>
      <div className="veli-service-detail-page">
        <header className="veli-service-detail-header">
          <h1 className="veli-service-detail-title">{title}</h1>
          {description && <p className="veli-service-detail-description">{description}</p>}
          {provider && (
            <p className="veli-service-detail-provider">
              {labels.providedBy}{' '}
              {provider.href ? (
                <Link href={provider.href} render={renderLink}>
                  {provider.name}
                </Link>
              ) : (
                provider.name
              )}
            </p>
          )}
        </header>
        <div className="veli-service-detail-card">
          {(hasMetadata || services.length > 0) && (
            <section className="veli-service-detail-summary" aria-label={labels.serviceSummary}>
              {hasMetadata && (
                <dl className="veli-service-detail-metadata">
                  {metadata?.applicationTime && (
                    <Meta icon="note-pencil" label={labels.applicationTime}>
                      <DisplayText text={metadata.applicationTime} />
                    </Meta>
                  )}
                  {(metadata?.feeSummary || !!metadata?.fees?.length) && (
                    <Meta icon="hand-coins" label={labels.fees}>
                      <span className="veli-service-detail-meta-value-row">
                        <span>
                          {metadata.feeSummary && <DisplayText text={metadata.feeSummary} />}
                        </span>
                        {!!metadata.fees?.length && (
                          <button
                            type="button"
                            className="veli-service-detail-inline-action"
                            aria-expanded={feesOpen}
                            aria-controls={feesOpen ? feesId : undefined}
                            onClick={() => setFeesOpen(!feesOpen)}
                          >
                            {feesOpen ? labels.hideFees : labels.showFees}
                          </button>
                        )}
                      </span>
                    </Meta>
                  )}
                  {metadata?.processingTime && (
                    <Meta icon="hourglass-medium" label={labels.processingTime}>
                      <DisplayText text={metadata.processingTime} />
                    </Meta>
                  )}
                  {metadata?.eligibility && (
                    <Meta icon="hand-deposit" label={labels.eligibility}>
                      <DisplayText text={metadata.eligibility} />
                    </Meta>
                  )}
                </dl>
              )}
              {feesOpen && !!metadata?.fees?.length && (
                <dl id={feesId} className="veli-service-detail-fees" aria-label={labels.feesByType}>
                  {metadata?.fees?.map((fee) => (
                    <div key={fee.id} className="veli-service-detail-fee-row">
                      <dt>{fee.label}</dt>
                      <dd>
                        <DisplayText text={fee.value} />
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
              {services.length > 0 && (
                <dl className="veli-service-detail-services-meta">
                  <Meta icon="list-numbers" label={labels.services}>
                    <div className="veli-service-detail-service-summary" id={servicesId}>
                      <span>
                        {services
                          .slice(0, servicesOpen ? services.length : 3)
                          .map((service) => service.name)
                          .join(', ')}
                      </span>
                      {hiddenServices > 0 && (
                        <button
                          type="button"
                          className="veli-service-detail-inline-action"
                          aria-expanded={servicesOpen}
                          aria-controls={servicesId}
                          onClick={() => setServicesOpen(!servicesOpen)}
                        >
                          {servicesOpen ? labels.showLess : labels.moreServices(hiddenServices)}
                        </button>
                      )}
                    </div>
                  </Meta>
                </dl>
              )}
            </section>
          )}
          <section className="veli-service-detail-apply" aria-label={labels.apply}>
            <div className="veli-service-detail-action-group">
              {apply.information ? (
                <ApplyingInfoDialog
                  information={apply.information}
                  platform={apply.platform}
                  labels={labels}
                  {...portalClasses}
                />
              ) : (
                apply.platform && (
                  <div className="veli-service-detail-platform-trigger">
                    <span>{labels.applyOn}</span>
                    {apply.platform.logo}
                    <strong>{apply.platform.name}</strong>
                  </div>
                )
              )}
              {apply.mode === 'manual' ? (
                <div
                  className={`veli-service-detail-download-list ${apply.forms.every((form) => !form.fileMeta && !form.guideline) ? 'veli-service-detail-download-list-simple' : ''}`}
                >
                  {apply.forms.map((form) => (
                    <div
                      key={form.id}
                      role="group"
                      aria-label={form.title}
                      className="veli-service-detail-download-row"
                    >
                      <h3
                        className={
                          form.fileMeta || form.guideline
                            ? 'veli-service-detail-section-title'
                            : 'veli-service-detail-sr-only'
                        }
                      >
                        {form.title}
                      </h3>
                      {form.fileMeta && (
                        <p className="veli-service-detail-muted">
                          <DisplayText text={form.fileMeta} />
                        </p>
                      )}
                      {form.action && (
                        <ServiceActionButton action={form.action} renderLink={renderLink} />
                      )}
                      {form.guideline && (
                        <GuidelineSheet
                          guideline={form.guideline}
                          labels={labels}
                          {...portalClasses}
                        />
                      )}
                    </div>
                  ))}
                  {apply.downloadAll && (
                    <ServiceActionButton action={apply.downloadAll} renderLink={renderLink} />
                  )}
                  {apply.submissionDetails}
                </div>
              ) : (
                apply.action && (
                  <ServiceActionButton action={apply.action} renderLink={renderLink} />
                )
              )}
            </div>
            {apply.notice && (
              <Alert intent="info" appearance="light" leadingIcon={<InfoIcon weight="fill" />}>
                <AlertTitle>{apply.notice.title}</AlertTitle>
                <AlertDescription>{apply.notice.description}</AlertDescription>
              </Alert>
            )}
            <div className="veli-service-detail-stack">
              <h2 className="veli-service-detail-section-title">{labels.beforeYouStart}</h2>
              {guideline ? (
                <GuidelineSheet
                  guideline={guideline}
                  labels={labels}
                  isOpen={isGuidelineOpen}
                  defaultOpen={defaultGuidelineOpen}
                  onOpenChange={onGuidelineOpenChange}
                  {...portalClasses}
                />
              ) : (
                <p className="veli-service-detail-body-text">{labels.guidelineUnavailable}</p>
              )}
              {!!prerequisites?.length && (
                <>
                  <p className="veli-service-detail-body-text">{labels.prerequisiteIntroduction}</p>
                  <ul className="veli-service-detail-prerequisites">
                    {prerequisites.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
