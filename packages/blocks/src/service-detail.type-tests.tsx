import type { ServiceAction, ServiceApply, GuidelineContent } from './service-detail/types';

const link: ServiceAction = { id: 'link', label: 'Start', href: '/application' };
const callback: ServiceAction = { id: 'callback', label: 'Start', onPress() {} };
const unavailable: ServiceAction = { id: 'missing', label: 'Unavailable', isDisabled: true };
// @ts-expect-error An available action must have a destination or callback.
const empty: ServiceAction = { id: 'missing', label: 'Start' };
// @ts-expect-error URL and callback actions are deliberately exclusive.
const ambiguous: ServiceAction = { id: 'both', label: 'Start', href: '/', onPress() {} };
// @ts-expect-error External services cannot contain manual sub-services.
const externalForms: ServiceApply = { mode: 'external', forms: [] };
// @ts-expect-error A guideline has either host rendered content or semantic sections.
const ambiguousContent: GuidelineContent = { body: 'body', sections: [] };
const introduction: GuidelineContent = {
  sections: [{ id: 'intro', body: 'Introduction', headingSpacing: 'compact' }],
};
const unsupportedSpacing: GuidelineContent = {
  sections: [
    {
      id: 'intro',
      body: 'Introduction',
      // @ts-expect-error Only the designed compact exception is supported.
      headingSpacing: 'dense',
    },
  ],
};
const tinted: ServiceAction = {
  id: 'cancel',
  label: 'Download cancellation',
  appearance: 'transparent',
  trailingIcon: '↗',
  onPress() {},
};
const unsupported: ServiceAction = {
  id: 'bad',
  label: 'Start',
  // @ts-expect-error Action appearances must be supported by Veli Button.
  appearance: 'outline',
  onPress() {},
};
void [
  introduction,
  unsupportedSpacing,
  tinted,
  unsupported,
  link,
  callback,
  unavailable,
  empty,
  ambiguous,
  externalForms,
  ambiguousContent,
];

// Additive summary settings leave the legacy string metadata contract intact.
const summary: import('./service-detail/types').ServiceSummaryOptions = {
  icon: null,
  information: { label: 'About processing time', content: 'Host-owned explanation' },
  details: [{ id: 'registration', label: 'Registration', value: '5 working days' }],
};
const invalidSummary: import('./service-detail/types').ServiceSummaryOptions = {
  // @ts-expect-error Information controls require a host-supplied accessible label.
  information: { content: 'Explanation' },
};
void [summary, invalidSummary];

// Public composition must not require the wrapper's service data or whole label dictionary.
import {
  ServiceDetailSummary,
  ServiceDetailTable,
  ServiceDetailExpandableList,
  ServiceDetailSummaryItem,
  type ServiceDetailSummaryItemProps,
} from './service-detail/service-detail';

const customValue = (
  <ServiceDetailSummaryItem label="Availability">
    <button>Check places</button>
  </ServiceDetailSummaryItem>
);
const valueDisclosure: ServiceDetailSummaryItemProps = {
  label: 'Time',
  disclosure: { triggerStyle: 'value', value: '3 days', content: <p>Details</p> },
};
// @ts-expect-error Arbitrary children cannot be nested in a value trigger.
const nestedControl: ServiceDetailSummaryItemProps = {
  ...valueDisclosure,
  children: <button>Check</button>,
};
const incompleteDisclosure: ServiceDetailSummaryItemProps = {
  label: 'Details',
  // @ts-expect-error Text triggers require both localized state labels.
  disclosure: { triggerStyle: 'text', showLabel: 'Show', content: 'Details' },
};
void [customValue, valueDisclosure, nestedControl, incompleteDisclosure];

const compactSummary = <ServiceDetailSummary label="Supplementary metadata" variant="compact" />;
// @ts-expect-error Only the default and compact summary presentations are supported.
const unknownSummary = <ServiceDetailSummary label="Metadata" variant="dense" />;
void [compactSummary, unknownSummary];

const detailTable = (
  <ServiceDetailTable
    label="Times"
    items={[{ id: 'one', label: 'Apply', value: <strong>15 minutes</strong> }]}
  />
);
// @ts-expect-error The table requires an accessible name.
const unnamedTable = <ServiceDetailTable items={[]} />;
void [detailTable, unnamedTable];

const expandableNames = (
  <ServiceDetailExpandableList
    items={[{ id: 'a', label: 'Service' }]}
    moreLabel={(count) => `+${count} more`}
    lessLabel="Show less"
  />
);
// @ts-expect-error Consumers must supply the localized collapsed label.
const missingMoreLabel = <ServiceDetailExpandableList items={[]} lessLabel="Show less" />;
void [expandableNames, missingMoreLabel];
