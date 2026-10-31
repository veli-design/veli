export type AlertIntent = 'neutral' | 'info' | 'positive' | 'cautious' | 'warning' | 'danger';

export const alertIntentClasses = {
  neutral: {
    light: 'bg-alert-light-neutral-bg',
    highContrast: 'bg-alert-high-contrast-neutral-bg',
    icon: 'text-alert-light-neutral-icon',
    foreground: 'text-alert-high-contrast-neutral-foreground',
    description: 'text-alert-high-contrast-neutral-description',
  },
  info: {
    light: 'bg-alert-light-info-bg',
    highContrast: 'bg-alert-high-contrast-info-bg',
    icon: 'text-alert-light-info-icon',
    foreground: 'text-alert-high-contrast-info-foreground',
    description: 'text-alert-high-contrast-info-description',
  },
  positive: {
    light: 'bg-alert-light-positive-bg',
    highContrast: 'bg-alert-high-contrast-positive-bg',
    icon: 'text-alert-light-positive-icon',
    foreground: 'text-alert-high-contrast-positive-foreground',
    description: 'text-alert-high-contrast-positive-description',
  },
  cautious: {
    light: 'bg-alert-light-cautious-bg',
    highContrast: 'bg-alert-high-contrast-cautious-bg',
    icon: 'text-alert-light-cautious-icon',
    foreground: 'text-alert-high-contrast-cautious-foreground',
    description: 'text-alert-high-contrast-cautious-description',
  },
  warning: {
    light: 'bg-alert-light-warning-bg',
    highContrast: 'bg-alert-high-contrast-warning-bg',
    icon: 'text-alert-light-warning-icon',
    foreground: 'text-alert-high-contrast-warning-foreground',
    description: 'text-alert-high-contrast-warning-description',
  },
  danger: {
    light: 'bg-alert-light-danger-bg',
    highContrast: 'bg-alert-high-contrast-danger-bg',
    icon: 'text-alert-light-danger-icon',
    foreground: 'text-alert-high-contrast-danger-foreground',
    description: 'text-alert-high-contrast-danger-description',
  },
} satisfies Record<
  AlertIntent,
  Record<'light' | 'highContrast' | 'icon' | 'foreground' | 'description', string>
>;
