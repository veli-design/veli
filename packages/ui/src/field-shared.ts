import type { VeliLanguage } from './provider-shared.js';

export * from './field-shared-variants.js';
export { FieldMessage, StaticFieldMessage } from './field-message.js';
export type { FieldMessageProps, StaticFieldMessageProps } from './field-message.js';

export const fieldOptionalLabels = {
  en: 'Optional',
  dv: 'އިޚްތިޔާރީ',
} as const satisfies Record<VeliLanguage, string>;

export function shouldShowFieldOptional(
  isOptional: boolean | undefined,
  isRequired: boolean | undefined,
) {
  return Boolean(isOptional) && !isRequired;
}

export function getFieldOptionalLabel(language: VeliLanguage) {
  return fieldOptionalLabels[language];
}
