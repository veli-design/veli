'use client';

import { useId, useState, type ReactNode } from 'react';
import { Button as AriaButton, Disclosure, DisclosurePanel } from 'react-aria-components';
import { Popover, PopoverDialog, PopoverTrigger } from '@veli-design/react/popover';
import { Tooltip, TooltipTrigger } from '@veli-design/react/tooltip';
import { CaretDownIcon, InfoIcon } from '@phosphor-icons/react';
import { DisplayText } from './display-text';

type PartProps = { children?: ReactNode; id?: string; className?: string };
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type ServiceDetailRootProps = PartProps;
/** The host owns the page landmark. Children render in their supplied DOM order. */
export function ServiceDetailRoot({ children, id, className = '' }: ServiceDetailRootProps) {
  return (
    <div id={id} className={`veli-service-detail-root ${className}`}>
      <div className="veli-service-detail-page">{children}</div>
    </div>
  );
}

export type ServiceDetailHeaderProps = PartProps & {
  title: string;
  /** Inline content; rendered inside a paragraph. */
  description?: ReactNode;
  /** Inline provider attribution, including any consumer-owned link. */
  provider?: ReactNode;
  headingLevel?: HeadingLevel;
};
export function ServiceDetailHeader({
  title,
  description,
  provider,
  headingLevel = 1,
  children,
  id,
  className = '',
}: ServiceDetailHeaderProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <header id={id} className={`veli-service-detail-header ${className}`}>
      <Heading className="veli-service-detail-title">{title}</Heading>
      {description != null && <p className="veli-service-detail-description">{description}</p>}
      {provider != null && <p className="veli-service-detail-provider">{provider}</p>}
      {children}
    </header>
  );
}

export type ServiceDetailCardProps = PartProps;
export function ServiceDetailCard({ children, id, className = '' }: ServiceDetailCardProps) {
  return (
    <div id={id} className={`veli-service-detail-card ${className}`}>
      {children}
    </div>
  );
}

export type ServiceDetailSummaryProps = PartProps & { label: string };
/** Direct children must produce SummaryItems (dt/dd groups), including through fragments/maps. */
export function ServiceDetailSummary({
  children,
  label,
  id,
  className = '',
}: ServiceDetailSummaryProps) {
  return (
    <section id={id} className={`veli-service-detail-summary ${className}`} aria-label={label}>
      <dl className="veli-service-detail-metadata m-0">{children}</dl>
    </section>
  );
}

type SummaryItemBase = Omit<PartProps, 'children'> & {
  label: string;
  /** Decorative; accessible text belongs in the label. */
  icon?: ReactNode;
  /** Non-interactive explanation, shared by the tooltip and press/touch popover. */
  information?: { label: string; content: ReactNode };
  span?: 'single' | 'full';
  /** Start a new grid row, without changing DOM/keyboard order. */
  startRow?: boolean;
};
export type ServiceDetailSummaryItemProps = SummaryItemBase &
  (
    | { children?: ReactNode; disclosure?: undefined }
    | {
        children?: ReactNode;
        disclosure: {
          triggerStyle: 'text';
          showLabel: string;
          hideLabel: string;
          content: ReactNode;
        };
      }
    | {
        children?: undefined;
        disclosure: {
          triggerStyle: 'value';
          value: string;
          content: ReactNode;
        };
      }
  );

/** Strings retain mixed-script isolation; consumer elements keep their own semantics. */
function SummaryContent({ children }: { children?: ReactNode }) {
  return typeof children === 'string' ? <DisplayText text={children} /> : children;
}

export function ServiceDetailSummaryItem({
  label,
  icon,
  information,
  span = 'single',
  startRow = false,
  children,
  disclosure,
  id,
  className = '',
}: ServiceDetailSummaryItemProps) {
  return (
    <div
      id={id}
      className={[
        'veli-service-detail-meta-item',
        icon == null ? '' : 'ps-10',
        span === 'full' ? 'col-span-full' : '',
        startRow ? 'col-start-1' : '',
        className,
      ].join(' ')}
    >
      <dt className="veli-service-detail-meta-label">
        {icon != null && (
          <span aria-hidden className="veli-service-detail-meta-icon">
            {icon}
          </span>
        )}
        {label}
        {information && <SummaryInformation information={information} />}
      </dt>
      <dd className="veli-service-detail-meta-value">
        {disclosure ? (
          <Disclosure>
            {({ isExpanded }) => (
              <>
                <div className="veli-service-detail-meta-value-row">
                  {disclosure.triggerStyle === 'text' && (
                    <SummaryContent>{children}</SummaryContent>
                  )}
                  <AriaButton
                    slot="trigger"
                    className={`veli-service-detail-inline-action veli-service-detail-breakdown-trigger ${disclosure.triggerStyle === 'value' ? 'veli-service-detail-time-trigger' : ''}`}
                    aria-label={
                      disclosure.triggerStyle === 'value'
                        ? `${label}: ${disclosure.value}`
                        : undefined
                    }
                  >
                    {disclosure.triggerStyle === 'value' ? (
                      <DisplayText text={disclosure.value} />
                    ) : isExpanded ? (
                      disclosure.hideLabel
                    ) : (
                      disclosure.showLabel
                    )}
                    <CaretDownIcon aria-hidden className="veli-service-detail-small-icon" />
                  </AriaButton>
                </div>
                <DisclosurePanel>{disclosure.content}</DisclosurePanel>
              </>
            )}
          </Disclosure>
        ) : (
          <SummaryContent>{children}</SummaryContent>
        )}
      </dd>
    </div>
  );
}

export type ServiceDetailActionsProps = PartProps & { label: string };
export type ServiceDetailContentProps = PartProps;
/** One shared surface for sections, actions and custom content inside the card. */
export function ServiceDetailContent({ children, id, className = '' }: ServiceDetailContentProps) {
  return (
    <div id={id} className={`veli-service-detail-content veli-service-detail-apply ${className}`}>
      {children}
    </div>
  );
}

/** Arrange consumer-owned actions and branding within the shared content surface. */
export function ServiceDetailActions({
  children,
  label,
  id,
  className = '',
}: ServiceDetailActionsProps) {
  return (
    <section
      id={id}
      className={`veli-service-detail-action-group [&>button]:w-full [&>a]:w-full ${className}`}
      aria-label={label}
    >
      {children}
    </section>
  );
}

export type ServiceDetailSectionProps = PartProps & {
  title: string;
  headingLevel?: HeadingLevel;
};
export function ServiceDetailSection({
  title,
  headingLevel = 2,
  children,
  id,
  className = '',
}: ServiceDetailSectionProps) {
  const headingId = useId();
  const Heading = `h${headingLevel}` as const;
  return (
    <section
      id={id}
      className={`veli-service-detail-stack ${className}`}
      aria-labelledby={headingId}
    >
      <Heading id={headingId} className="veli-service-detail-section-title">
        {title}
      </Heading>
      {children}
    </section>
  );
}

export type ServiceDetailDownloadProps = PartProps & {
  title: string;
  /** Inline metadata; strings retain mixed-script isolation. */
  metadata?: ReactNode;
  headingLevel?: HeadingLevel;
  /** Keep the title available to assistive technology for compact, action-only rows. */
  hideTitle?: boolean;
};
export function ServiceDetailDownload({
  title,
  metadata,
  headingLevel = 3,
  hideTitle = false,
  children,
  id,
  className = '',
}: ServiceDetailDownloadProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div
      id={id}
      role="group"
      aria-label={title}
      className={`veli-service-detail-download-row ${className}`}
    >
      <Heading
        className={hideTitle ? 'veli-service-detail-sr-only' : 'veli-service-detail-section-title'}
      >
        {title}
      </Heading>
      {metadata != null && (
        <p className="veli-service-detail-muted">
          <SummaryContent>{metadata}</SummaryContent>
        </p>
      )}
      {children}
    </div>
  );
}
/** Native tooltip for hover/focus; native popover for keyboard activation and touch. */
function SummaryInformation({
  information,
}: {
  information: NonNullable<SummaryItemBase['information']>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <TooltipTrigger delay={0} isDisabled={isOpen}>
      <PopoverTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
        <AriaButton
          className="veli-service-detail-inline-action veli-service-detail-info-trigger"
          aria-label={information.label}
        >
          <InfoIcon aria-hidden className="veli-service-detail-small-icon" />
        </AriaButton>
        <Popover
          showArrow
          intent="secondary"
          placement="top start"
          offset={9}
          className="veli-service-detail-summary-popover font-sans type-body-sm-regular"
        >
          <PopoverDialog
            aria-label={information.label}
            className="veli-service-detail-summary-information"
          >
            {information.content}
          </PopoverDialog>
        </Popover>
      </PopoverTrigger>
      <Tooltip
        size="lg"
        tone="secondary"
        placement="top start"
        offset={9}
        className="veli-service-detail-summary-tooltip"
      >
        {information.content}
      </Tooltip>
    </TooltipTrigger>
  );
}
