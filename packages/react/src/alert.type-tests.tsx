import { Alert, type AlertAppearance, type AlertLayout } from './alert.js';

const appearance: AlertAppearance = 'highContrast';
const layout: AlertLayout = 'stacked';
export const supportedAlert = (
  <Alert appearance={appearance} layout={layout}>
    <Alert.Title>Permit review</Alert.Title>
  </Alert>
);
// @ts-expect-error Legacy appearances were removed by the revised audit.
export const legacySubtle = <Alert appearance="subtle" />;
// @ts-expect-error Outline has no equivalent in the revised spec.
export const legacyOutline = <Alert appearance="outline" />;
// @ts-expect-error Use highContrast instead of emphasis.
export const legacyEmphasis = <Alert appearance="emphasis" />;
// @ts-expect-error Layout selection is explicit; auto is not a public layout.
export const automaticLayout = <Alert layout="auto" />;
