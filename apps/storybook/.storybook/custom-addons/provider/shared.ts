export type VeliProviderLanguage = 'en' | 'dv';
export type VeliProviderTheme = 'system' | 'light' | 'dark';
export type VeliProviderSurface = 'base' | 'raised';

export type VeliProviderSwitcherValues = {
  language: VeliProviderLanguage;
  theme: VeliProviderTheme;
  surface: VeliProviderSurface;
};

export const defaultProviderSwitcherValues: VeliProviderSwitcherValues = {
  language: 'en',
  theme: 'system',
  surface: 'base',
};

export const providerSwitcherUpdatedEvent = 'veli/provider-updated';
export const providerSwitcherReadyEvent = 'veli/provider-ready';
export const providerSwitcherLanguageQueryParam = 'veli-language';
export const providerSwitcherThemeQueryParam = 'veli-theme';
export const providerSwitcherSurfaceQueryParam = 'veli-surface';

export const languageOptions: Array<{ label: string; value: VeliProviderLanguage }> = [
  { label: 'English / LTR', value: 'en' },
  { label: 'Dhivehi / RTL', value: 'dv' },
];

export const themeOptions: Array<{ label: string; value: VeliProviderTheme }> = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export const surfaceOptions: Array<{
  label: string;
  value: VeliProviderSurface;
  background: string;
}> = [
  { label: 'Veli surface', value: 'base', background: 'var(--color-bg-surface-base)' },
  { label: 'Veli raised', value: 'raised', background: 'var(--color-bg-surface-raised)' },
];

export function isProviderLanguage(value: unknown): value is VeliProviderLanguage {
  return value === 'en' || value === 'dv';
}

export function isProviderTheme(value: unknown): value is VeliProviderTheme {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function isProviderSurface(value: unknown): value is VeliProviderSurface {
  return value === 'base' || value === 'raised';
}

export function normalizeProviderSwitcherValues(values: {
  language?: unknown;
  theme?: unknown;
  surface?: unknown;
}): VeliProviderSwitcherValues {
  return {
    language: isProviderLanguage(values.language)
      ? values.language
      : defaultProviderSwitcherValues.language,
    theme: isProviderTheme(values.theme) ? values.theme : defaultProviderSwitcherValues.theme,
    surface: isProviderSurface(values.surface)
      ? values.surface
      : defaultProviderSwitcherValues.surface,
  };
}
