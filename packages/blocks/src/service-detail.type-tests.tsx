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
