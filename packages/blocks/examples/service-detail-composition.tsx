'use client';

import { useState } from 'react';
import { Button } from '@veli-design/react/button';
import { Link } from '@veli-design/react/link';
import { ClockIcon, UsersIcon, HandCoinsIcon, HourglassMediumIcon } from '@phosphor-icons/react';
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
  ServiceDetailGuideline,
  ServiceDetailApplyingInformation,
} from '../src/service-detail/service-detail';
import type { ServiceDetailProps, ServiceGuideline } from '../src/service-detail/types';
import { serviceDetailContent } from './service-detail-content';

/** Consumer example: omit unavailable values, and omit the surface when neither exists. */
function SupplementaryMetadata({
  title,
  fee,
  processingTime,
  labels,
}: {
  title: string;
  fee?: string;
  processingTime?: string;
  labels: ServiceDetailProps['labels'];
}) {
  if (fee == null && processingTime == null) return null;
  const single = fee == null || processingTime == null;
  return (
    <ServiceDetailSummary variant="compact" label={title}>
      {fee != null && (
        <ServiceDetailSummaryItem
          label={labels.fees}
          icon={<HandCoinsIcon weight="fill" className="veli-service-detail-meta-art" />}
          span={single ? 'full' : 'single'}
        >
          {fee}
        </ServiceDetailSummaryItem>
      )}
      {processingTime != null && (
        <ServiceDetailSummaryItem
          label={labels.processingTime}
          icon={<HourglassMediumIcon weight="fill" className="veli-service-detail-meta-art" />}
          span={single ? 'full' : 'single'}
        >
          {processingTime}
        </ServiceDetailSummaryItem>
      )}
    </ServiceDetailSummary>
  );
}

// Illustrative consumer-owned copy. Dhivehi copy is pending translation review.
const messages = {
  en: {
    availability: 'Available places',
    apply: 'Apply online',
    applied: 'Application selected — preview only.',
    appointments: 'Appointments',
    appointmentBody: 'You can also arrange an appointment with the service provider.',
    book: 'Book an appointment',
    booked: 'Appointment selected — preview only.',
    prefix: 'Continue with',
    information: 'How to apply',
    instructions:
      'Choose an application option. The provider will guide you through the next steps.',
    form: 'Supporting form',
    download: 'Download form',
    downloaded: 'Download selected — preview only.',
  },
  dv: {
    availability: 'ލިބެންހުރި ޖާގަ',
    apply: 'އޮންލައިން ހުށަހަޅާ',
    applied: 'އެދުން ހުށަހެޅުން ހޮވިއްޖެ — މިއީ ނަމޫނާއެއް.',
    appointments: 'އެޕޮއިންޓްމަންޓް',
    appointmentBody: 'ޚިދުމަތް ދޭ ފަރާތާ ބައްދަލުކުރުމަށް ވަގުތެއް ހަމަޖައްސާ.',
    book: 'ވަގުތެއް ހަމަޖައްސާ',
    booked: 'ވަގުތެއް ހޮވިއްޖެ — މިއީ ނަމޫނާއެއް.',
    prefix: 'ކުރިއަށް ދާ',
    information: 'ހުށަހެޅޭނެ ގޮތް',
    instructions: 'އެދުން ހުށަހެޅާނެ ގޮތެއް ހޮވާ.',
    form: 'ފޯމު',
    download: 'ފޯމު ޑައުންލޯޑް ކުރޭ',
    downloaded: 'ފޯމު ހޮވިއްޖެ — މިއީ ނަމޫނާއެއް.',
  },
};

/** Example application code: no service schema is required by the composed parts. */
export function ServiceDetailComposition({
  language = 'en',
  id,
}: {
  language?: 'en' | 'dv';
  id?: string;
}) {
  const data = serviceDetailContent(language);
  const copy = messages[language];
  const [status, setStatus] = useState('');
  // Already formatted consumer data. Missing values are not inferred as free or Instant.
  const supplementary = data.services!.slice(0, 4).map((service, index) => ({
    ...service,
    fee: index < 2 ? data.metadata!.fees![index].value : undefined,
    processingTime:
      index === 0 || index === 2
        ? language === 'dv'
          ? 'އެ މަސައްކަތު ދުވަހު'
          : 'Same working day'
        : undefined,
    body: copy.instructions,
  }));
  const feeRows = supplementary.filter((service) => service.fee != null);
  const originalSections = data.guideline!.content.sections!;
  // Stable IDs identify this example's preparation/fees sections; never match translated titles.
  const guideline: ServiceGuideline = {
    ...data.guideline!,
    content: {
      sections: [
        ...originalSections.filter((section) => section.id === 'before'),
        {
          id: 'fees',
          title: data.labels.fees,
          body: (
            <table className="veli-service-detail-fee-table">
              <caption className="sr-only">{data.labels.feesByType}</caption>
              <tbody>
                {feeRows.map((service) => (
                  <tr key={service.id}>
                    <th scope="row">{service.name}</th>
                    <td>{service.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ),
        },
        ...originalSections.filter((section) => section.id !== 'before' && section.id !== 'fees'),
        ...supplementary.map((service) => ({
          id: `supplementary-${service.id}`,
          title: service.name,
          body: (
            <>
              <SupplementaryMetadata
                title={service.name}
                fee={service.fee}
                processingTime={service.processingTime}
                labels={data.labels}
              />
              <p>{service.body}</p>
            </>
          ),
        })),
      ],
    },
  };

  return (
    <ServiceDetailRoot id={id}>
      <ServiceDetailHeader title={data.title} description={data.description}>
        <p role="status" className="text-base-muted m-0">
          {status}
        </p>
      </ServiceDetailHeader>
      <ServiceDetailCard>
        <ServiceDetailSummary label={data.labels.serviceSummary}>
          <ServiceDetailSummaryItem
            label={copy.availability}
            icon={<UsersIcon />}
            information={{ label: copy.availability, content: copy.appointmentBody }}
          >
            12
          </ServiceDetailSummaryItem>
          <ServiceDetailSummaryItem
            label={data.labels.fees}
            disclosure={{
              triggerStyle: 'text',
              showLabel: data.labels.showFees,
              hideLabel: data.labels.hideFees,
              content: (
                <ul className="m-0 pt-5">
                  {feeRows.map((fee) => (
                    <li key={fee.id}>
                      {fee.name}: {fee.fee}
                    </li>
                  ))}
                </ul>
              ),
            }}
          >
            {language === 'dv' ? '200 – 2,000 ރުފިޔާ' : 'MVR 200 – 2,000'}
          </ServiceDetailSummaryItem>
          <ServiceDetailSummaryItem
            label={data.labels.processingTime}
            icon={<ClockIcon />}
            span="full"
            disclosure={{
              triggerStyle: 'value',
              value: data.metadata!.processingTime!,
              content: <p className="m-0 pt-5">{copy.instructions}</p>,
            }}
          />
        </ServiceDetailSummary>
        <ServiceDetailContent>
          {/* Reorder content within one shared surface, rather than stacking rounded cards. */}
          <ServiceDetailSection title={data.labels.beforeYouStart}>
            <ServiceDetailGuideline guideline={guideline} labels={data.labels} />
          </ServiceDetailSection>
          <ServiceDetailSection title={copy.appointments}>
            <p className="m-0">{copy.appointmentBody}</p>
            <Link onPress={() => setStatus(copy.booked)}>{copy.book}</Link>
          </ServiceDetailSection>
          <ServiceDetailActions label={data.labels.apply}>
            <ServiceDetailApplyingInformation
              title={copy.information}
              closeLabel={data.labels.closeInformation}
              trigger={
                <>
                  <span>{copy.prefix}</span>
                  <strong>Island Services</strong>
                </>
              }
            >
              <p className="m-0">{copy.instructions}</p>
            </ServiceDetailApplyingInformation>
            <Button size="lg" onPress={() => setStatus(copy.applied)}>
              {copy.apply}
            </Button>
          </ServiceDetailActions>
          <ServiceDetailDownload
            title={copy.form}
            metadata={<span lang="en">PDF · 120 KB</span>}
            headingLevel={2}
          >
            <Button intent="secondary" onPress={() => setStatus(copy.downloaded)}>
              {copy.download}
            </Button>
          </ServiceDetailDownload>
        </ServiceDetailContent>
      </ServiceDetailCard>
    </ServiceDetailRoot>
  );
}
