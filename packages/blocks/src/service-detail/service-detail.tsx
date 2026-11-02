'use client';

import { useId, useState } from 'react';
import { Button } from '@veli-design/react/button';
import { Link } from '@veli-design/react/link';
import { Alert, AlertDescription, AlertTitle } from '@veli-design/react/alert';
import {
  HandCoinsIcon,
  HandDepositIcon,
  HourglassMediumIcon,
  InfoIcon,
  ListNumbersIcon,
  NotePencilIcon,
} from '@phosphor-icons/react';
import { GuidelineSheet } from './guideline-sheet';
import { ApplyingInfoDialog } from './applying-info-dialog';
import { DisplayText } from './display-text';
import {
  ServiceDetailRoot,
  ServiceDetailHeader,
  ServiceDetailCard,
  ServiceDetailContent,
  ServiceDetailSummary,
  ServiceDetailSummaryItem,
  ServiceDetailActions,
  ServiceDetailSection,
  ServiceDetailDownload,
} from './parts';
import type {
  ServiceAction,
  ServiceDetailProps,
  ServiceSummaryOptions,
  ServiceSummaryDetail,
} from './types';
import './service-detail.css';

export type * from './types';
export * from './parts';
export { GuidelineSheet as ServiceDetailGuideline } from './guideline-sheet';
export type { ServiceDetailGuidelineProps } from './guideline-sheet';
export { ServiceDetailApplyingInformation } from './applying-info-dialog';
export type { ServiceDetailApplyingInformationProps } from './applying-info-dialog';

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

const metadataIcons = {
  'note-pencil': NotePencilIcon,
  'hand-coins': HandCoinsIcon,
  'hourglass-medium': HourglassMediumIcon,
  'hand-deposit': HandDepositIcon,
  'list-numbers': ListNumbersIcon,
} as const;

function summaryPresentation(icon: keyof typeof metadataIcons, options?: ServiceSummaryOptions) {
  const Icon = metadataIcons[icon];
  return {
    // Preserve the wrapper's reserved icon gutter, including an explicitly hidden icon.
    icon:
      options?.icon !== undefined ? (
        <>{options.icon}</>
      ) : (
        <Icon
          weight="fill"
          focusable="false"
          className={`veli-service-detail-meta-art veli-service-detail-art-${icon}`}
        />
      ),
    information: options?.information,
  };
}

function SummaryDetails({
  details,
  label,
}: {
  details: readonly ServiceSummaryDetail[];
  label: string;
}) {
  return (
    <dl className="veli-service-detail-breakdown" aria-label={label}>
      {details.map((detail) => (
        <div key={detail.id} className="veli-service-detail-fee-row">
          <dt>{detail.label}</dt>
          <dd>
            <DisplayText text={detail.value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function timeValue(value: string, label: string, details?: readonly ServiceSummaryDetail[]) {
  return details?.length
    ? {
        disclosure: {
          triggerStyle: 'value' as const,
          value,
          content: <SummaryDetails details={details} label={label} />,
        },
      }
    : { children: value };
}

/** Convenience layout built from the same public parts available to custom consumers. */
export function ServiceDetail({
  title,
  description,
  provider,
  metadata,
  summaryOptions,
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
  const [servicesOpen, setServicesOpen] = useState(false);
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
    <ServiceDetailRoot className={className}>
      <ServiceDetailHeader
        title={title}
        description={description || undefined}
        provider={
          provider ? (
            <>
              {labels.providedBy}{' '}
              {provider.href ? (
                <Link href={provider.href} render={renderLink}>
                  {provider.name}
                </Link>
              ) : (
                provider.name
              )}
            </>
          ) : undefined
        }
      />
      <ServiceDetailCard>
        {(hasMetadata || services.length > 0) && (
          <ServiceDetailSummary label={labels.serviceSummary}>
            {metadata?.applicationTime && (
              <ServiceDetailSummaryItem
                label={labels.applicationTime}
                {...summaryPresentation('note-pencil', summaryOptions?.applicationTime)}
                {...timeValue(
                  metadata.applicationTime,
                  labels.applicationTime,
                  summaryOptions?.applicationTime?.details,
                )}
              />
            )}
            {(metadata?.feeSummary || !!metadata?.fees?.length) && (
              <ServiceDetailSummaryItem
                label={labels.fees}
                {...summaryPresentation('hand-coins', summaryOptions?.fees)}
                disclosure={
                  metadata.fees?.length
                    ? {
                        triggerStyle: 'text',
                        showLabel: labels.showFees,
                        hideLabel: labels.hideFees,
                        content: (
                          <SummaryDetails details={metadata.fees} label={labels.feesByType} />
                        ),
                      }
                    : undefined
                }
              >
                {metadata.feeSummary}
              </ServiceDetailSummaryItem>
            )}
            {metadata?.processingTime && (
              <ServiceDetailSummaryItem
                label={labels.processingTime}
                startRow
                {...summaryPresentation('hourglass-medium', summaryOptions?.processingTime)}
                {...timeValue(
                  metadata.processingTime,
                  labels.processingTime,
                  summaryOptions?.processingTime?.details,
                )}
              />
            )}
            {metadata?.eligibility && (
              <ServiceDetailSummaryItem
                label={labels.eligibility}
                startRow={!metadata.processingTime}
                {...summaryPresentation('hand-deposit', summaryOptions?.eligibility)}
              >
                {metadata.eligibility}
              </ServiceDetailSummaryItem>
            )}
            {services.length > 0 && (
              <ServiceDetailSummaryItem
                label={labels.services}
                span="full"
                className="veli-service-detail-services-meta"
                {...summaryPresentation('list-numbers', summaryOptions?.services)}
              >
                <div className="veli-service-detail-service-summary" id={servicesId}>
                  <span>
                    {services
                      .slice(0, servicesOpen ? services.length : 3)
                      .map((service) => service.name)
                      .join(', ')}
                  </span>
                  {servicesOpen && hiddenServices > 0 ? ' ' : null}
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
              </ServiceDetailSummaryItem>
            )}
          </ServiceDetailSummary>
        )}
        <ServiceDetailContent>
          <ServiceDetailActions label={labels.apply}>
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
                  <ServiceDetailDownload
                    key={form.id}
                    title={form.title}
                    metadata={form.fileMeta || undefined}
                    hideTitle={!form.fileMeta && !form.guideline}
                  >
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
                  </ServiceDetailDownload>
                ))}
                {apply.downloadAll && (
                  <ServiceActionButton action={apply.downloadAll} renderLink={renderLink} />
                )}
                {apply.submissionDetails}
              </div>
            ) : (
              apply.action && <ServiceActionButton action={apply.action} renderLink={renderLink} />
            )}
          </ServiceDetailActions>
          {apply.notice && (
            <Alert intent="info" appearance="light" leadingIcon={<InfoIcon weight="fill" />}>
              <AlertTitle>{apply.notice.title}</AlertTitle>
              <AlertDescription>{apply.notice.description}</AlertDescription>
            </Alert>
          )}
          <ServiceDetailSection title={labels.beforeYouStart}>
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
          </ServiceDetailSection>
        </ServiceDetailContent>
      </ServiceDetailCard>
    </ServiceDetailRoot>
  );
}
