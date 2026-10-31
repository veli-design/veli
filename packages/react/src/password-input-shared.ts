import type * as React from 'react';

export type PasswordRequirementId =
  | 'minLength'
  | 'lowercase'
  | 'uppercase'
  | 'number'
  | 'specialCharacter';

export interface PasswordRequirement {
  id: PasswordRequirementId;
  label: React.ReactNode;
  test: (password: string) => boolean;
}

export const defaultPasswordRequirementLabels = {
  en: {
    minLength: '8+ Character',
    lowercase: 'Lowercase letter',
    uppercase: 'Uppercase letter',
    number: 'Number',
    specialCharacter: 'Special Character',
  },
  dv: {
    minLength: '8+ އަކުރު',
    lowercase: 'ކުޑަ އަކުރެއް',
    uppercase: 'ބޮޑު އަކުރެއް',
    number: 'ނަންބަރެއް',
    specialCharacter: 'ޚާއްޞަ ކެރެކްޓަރެއް',
  },
} as const satisfies Record<'en' | 'dv', Record<PasswordRequirementId, string>>;

export const defaultPasswordRequirements: PasswordRequirement[] = [
  {
    id: 'minLength',
    label: defaultPasswordRequirementLabels.en.minLength,
    test: (password) => password.length >= 8,
  },
  {
    id: 'lowercase',
    label: defaultPasswordRequirementLabels.en.lowercase,
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: 'uppercase',
    label: defaultPasswordRequirementLabels.en.uppercase,
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'number',
    label: defaultPasswordRequirementLabels.en.number,
    test: (password) => /\d/.test(password),
  },
  {
    id: 'specialCharacter',
    label: defaultPasswordRequirementLabels.en.specialCharacter,
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export function arePasswordRequirementsMet(
  requirements: PasswordRequirement[],
  password: string,
): boolean {
  return requirements.every((requirement) => requirement.test(password));
}

export function getDefaultPasswordRequirements(
  language: keyof typeof defaultPasswordRequirementLabels,
): PasswordRequirement[] {
  if (language === 'en') {
    return defaultPasswordRequirements;
  }

  const labels = defaultPasswordRequirementLabels[language];

  return defaultPasswordRequirements.map((requirement) => ({
    ...requirement,
    label: labels[requirement.id],
  }));
}

export function resolvePasswordRequirements(
  requirements: PasswordRequirement[] | boolean | undefined,
  language: keyof typeof defaultPasswordRequirementLabels,
): PasswordRequirement[] | undefined {
  if (requirements === true) {
    return getDefaultPasswordRequirements(language);
  }

  if (Array.isArray(requirements) && requirements.length > 0) {
    return requirements;
  }

  return undefined;
}
