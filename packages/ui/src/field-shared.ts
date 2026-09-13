import type { VeliLanguage } from './provider-shared';

export * from './field-shared-variants';
export { FieldMessage, StaticFieldMessage } from './field-message';
export type { FieldMessageProps, StaticFieldMessageProps } from './field-message';

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
