'use client';

import { useState } from 'react';
import { Button } from '@veli-design/react/button';
import { Link } from '@veli-design/react/link';
import { ClockIcon, UsersIcon } from '@phosphor-icons/react';
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
import { serviceDetailContent } from './service-detail-content';

// Illustrative consumer-owned copy. Dhivehi copy is pending translation review.
const messages = {
  en: {
    availability: 'Available places',
    check: 'Check availability',
    checked: 'Availability checked — preview only.',
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
    check: 'ޖާގަ ބަލާ',
    checked: 'ޖާގަ ބެލިއްޖެ — މިއީ ނަމޫނާއެއް.',
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
  const [places, setPlaces] = useState(12);
  const [status, setStatus] = useState('');
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
            <div className="flex flex-wrap items-center gap-3">
              <output aria-label={copy.availability}>{places}</output>
              <Button
                size="sm"
                intent="secondary"
                onPress={() => {
                  setPlaces(11);
                  setStatus(copy.checked);
                }}
              >
                {copy.check}
              </Button>
            </div>
          </ServiceDetailSummaryItem>
          <ServiceDetailSummaryItem
            label={data.labels.fees}
            disclosure={{
              triggerStyle: 'text',
              showLabel: data.labels.showFees,
              hideLabel: data.labels.hideFees,
              content: (
                <ul className="m-0 pt-5">
                  {data.metadata?.fees?.map((fee) => (
                    <li key={fee.id}>
                      {fee.label}: {fee.value}
                    </li>
                  ))}
                </ul>
              ),
            }}
          >
            {data.metadata?.feeSummary}
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
            <ServiceDetailGuideline guideline={data.guideline!} labels={data.labels} />
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
