import type { ErrorPageAction, ErrorPageKind } from '../components/blocks/error-page/error-page';

const link: ErrorPageAction = { type: 'link', label: 'Home', href: '/' };
const retry: ErrorPageAction = { type: 'button', label: 'Retry', onPress() {}, isPending: true };
// @ts-expect-error Navigation actions cannot also execute a callback.
const mixed: ErrorPageAction = { type: 'link', label: 'Home', href: '/', onPress() {} };
// @ts-expect-error Buttons require a callback; no reload behavior is inferred.
const missingCallback: ErrorPageAction = { type: 'button', label: 'Retry' };
// @ts-expect-error Only the six designed states are supported.
const unsupported: ErrorPageKind = 'maintenance';
void [link, retry, mixed, missingCallback, unsupported];

import type { PageNavigationFooterProps } from '../components/blocks/page-navigation-footer/page-navigation-footer';
const customFooterGroups: PageNavigationFooterProps = {
  label: 'Navigation',
  // @ts-expect-error Section titles belong to the localized block, not application data.
  groups: [{ id: 'custom', label: 'Custom', links: [] }],
};
void customFooterGroups;
