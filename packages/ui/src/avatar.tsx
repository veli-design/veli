'use client';

import * as React from 'react';
import { Buildings, User } from 'phosphor-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { type VeliLanguage, useVeliLanguage } from './provider';

const avatarAppearances = {
  blue: {
    surface: 'bg-avatar-blue',
    content: 'text-primary',
    icon: 'text-icon-primary',
  },
  neutral: {
    surface: 'bg-avatar-neutral',
    content: 'text-base',
    icon: 'text-icon-base',
  },
  emerald: {
    surface: 'bg-avatar-emerald',
    content: 'text-success',
    icon: 'text-icon-success',
  },
  yellow: {
    surface: 'bg-avatar-yellow',
    content: 'text-cautious',
    icon: 'text-icon-cautious',
  },
  orange: {
    surface: 'bg-avatar-orange',
    content: 'text-warning',
    icon: 'text-icon-warning',
  },
  magenta: {
    surface: 'bg-avatar-magenta',
    content: 'text-status-magenta-emphasis',
    icon: 'text-status-magenta-emphasis',
  },
  indigo: {
    surface: 'bg-avatar-indigo',
    content: 'text-status-indigo-emphasis',
    icon: 'text-status-indigo-emphasis',
  },
  teal: {
    surface: 'bg-avatar-teal',
    content: 'text-status-teal-emphasis',
    icon: 'text-status-teal-emphasis',
  },
  green: {
    surface: 'bg-avatar-green',
    content: 'text-status-green-emphasis',
    icon: 'text-status-green-emphasis',
  },
  lime: {
    surface: 'bg-avatar-lime',
    content: 'text-status-lime-emphasis',
    icon: 'text-status-lime-emphasis',
  },
} as const;

const avatarIconSizes = {
  '60': 32,
  '52': 24,
  '44': 20,
  '36': 16,
  '28': 12,
  '20': 12,
  '16': 12,
} as const;

const transparentAvatarImageSrc =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const avatarInitialsTypography = {
  '60': 'type-title-2-medium',
  '52': 'type-subtitle-medium',
  '44': 'type-body-lg-medium',
  '36': 'type-body-md-medium',
  '28': 'type-caption-medium',
  '20': 'type-caption-medium',
  '16': 'text-[10px] font-medium leading-[1.34] tracking-[0.15px]',
} as const;

const dhivehiAvatarInitials: Readonly<Record<string, string>> = {
  SH: 'ޝ',
  DH: 'ދ',
  TH: 'ތ',
  CH: 'ޗ',
  GH: 'ޣ',
  KH: 'ޚ',
  GN: 'ޏ',
  PH: 'ފ',
  A: 'އ',
  B: 'ބ',
  C: 'ކ',
  D: 'ޑ',
  E: 'އ',
  F: 'ފ',
  G: 'ގ',
  H: 'ހ',
  I: 'އ',
  J: 'ޖ',
  K: 'ކ',
  L: 'ލ',
  M: 'މ',
  N: 'ނ',
  O: 'އ',
  P: 'ޕ',
  Q: 'ޤ',
  R: 'ރ',
  S: 'ސ',
  T: 'ޓ',
  U: 'އ',
  V: 'ވ',
  W: 'ވ',
  X: 'ޒ',
  Y: 'ޔ',
  Z: 'ޒ',
};

const avatarVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-sans antialiased',
  {
    variants: {
      appearance: {
        blue: avatarAppearances.blue.surface,
        neutral: avatarAppearances.neutral.surface,
        emerald: avatarAppearances.emerald.surface,
        yellow: avatarAppearances.yellow.surface,
        orange: avatarAppearances.orange.surface,
        magenta: avatarAppearances.magenta.surface,
        indigo: avatarAppearances.indigo.surface,
        teal: avatarAppearances.teal.surface,
        green: avatarAppearances.green.surface,
        lime: avatarAppearances.lime.surface,
      },
      size: {
        '60': 'size-15',
        '52': 'size-13',
        '44': 'size-11',
        '36': 'size-9',
        '28': 'size-7',
        '20': 'size-5',
        '16': 'size-4',
      },
      contentType: {
        image: 'border border-avatar-img-border',
        initials: '',
        icon: '',
        agencyIcon: '',
      },
    },
    defaultVariants: {
      appearance: 'blue',
      size: '60',
      contentType: 'icon',
    },
  },
);

export type AvatarAppearance = keyof typeof avatarAppearances;
export type AvatarSize = keyof typeof avatarIconSizes;
export type AvatarType = 'image' | 'initials' | 'icon' | 'agencyIcon';

export interface AvatarProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof avatarVariants> {
  type?: AvatarType;
  src?: string;
  alt?: string;
  initials?: string;
}

function formatInitials(value: string, size: AvatarSize, language: VeliLanguage) {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return '';
  }

  if (language === 'dv') {
    return formatDhivehiInitials(trimmed, size);
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  }

  const single = parts[0]!.toUpperCase();
  return size === '16' || size === '20' ? single.slice(0, 1) : single.slice(0, 2);
}

function formatDhivehiInitials(value: string, size: AvatarSize) {
  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${getDhivehiInitial(parts[0]!)}${getDhivehiInitial(parts[1]!)}`;
  }

  const single = parts[0]!;

  if (size === '16' || size === '20') {
    return getDhivehiInitial(single);
  }

  return getDhivehiInitialPrefix(single, 2);
}

function getDhivehiInitial(value: string) {
  const characters = Array.from(value.trim());
  const firstTwo = characters.slice(0, 2).join('').toUpperCase();
  const firstOne = characters[0]?.toUpperCase() ?? '';

  return dhivehiAvatarInitials[firstTwo] ?? dhivehiAvatarInitials[firstOne] ?? firstOne;
}

function getDhivehiInitialPrefix(value: string, maxLength: number) {
  const characters = Array.from(value.trim());
  const firstTwo = characters.slice(0, 2).join('').toUpperCase();
  const digraph = dhivehiAvatarInitials[firstTwo];

  if (digraph) {
    return digraph;
  }

  return characters
    .slice(0, maxLength)
    .map((character) => {
      const uppercaseCharacter = character.toUpperCase();

      return dhivehiAvatarInitials[uppercaseCharacter] ?? uppercaseCharacter;
    })
    .join('');
}

function resolveContentType({
  type,
  src,
  initials,
  imageError,
}: Pick<AvatarProps, 'type' | 'src' | 'initials'> & { imageError: boolean }): AvatarType {
  if (src && !imageError) {
    return 'image';
  }

  if (initials?.trim()) {
    return 'initials';
  }

  if (type && type !== 'image') {
    return type;
  }

  return 'icon';
}

function getAccessibleLabel({
  alt,
  initials,
  contentType,
}: {
  alt?: string;
  initials?: string;
  contentType: AvatarType;
}) {
  if (alt?.trim()) {
    return alt.trim();
  }

  if (contentType === 'initials' && initials?.trim()) {
    return initials.trim();
  }

  if (contentType === 'agencyIcon') {
    return 'Agency';
  }

  return 'User';
}

export function Avatar({
  className,
  appearance = 'blue',
  size = '60',
  type,
  src,
  alt,
  initials,
  ...props
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
  const { language } = useVeliLanguage();
  const imageError = Boolean(src && failedSrc === src);
  const resolvedSize = size ?? '60';
  const resolvedAppearance = appearance ?? 'blue';
  const contentType = resolveContentType({ type, src, initials, imageError });
  const appearanceTokens = avatarAppearances[resolvedAppearance];
  const label = getAccessibleLabel({ alt, initials, contentType });
  const displayInitials =
    contentType === 'initials' ? formatInitials(initials ?? '', resolvedSize, language) : '';
  const iconSize = avatarIconSizes[resolvedSize];

  return (
    <div
      {...props}
      className={twMerge(
        avatarVariants({
          appearance: resolvedAppearance,
          size: resolvedSize,
          contentType,
        }),
        className,
      )}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={label}
          className="size-full object-cover"
          onError={() => {
            if (src) {
              setFailedSrc(src);
            }
          }}
        />
      ) : null}

      {contentType !== 'image' ? (
        <img src={transparentAvatarImageSrc} alt={label} className="sr-only" />
      ) : null}

      {contentType === 'initials' ? (
        <span
          aria-hidden="true"
          className={twMerge(
            'select-none text-center uppercase [word-break:break-word]',
            avatarInitialsTypography[resolvedSize],
            appearanceTokens.content,
            language === 'dv' && '-translate-y-1',
          )}
        >
          {displayInitials}
        </span>
      ) : null}

      {contentType === 'icon' ? (
        <User
          aria-hidden="true"
          size={iconSize}
          weight="fill"
          className={twMerge('shrink-0', appearanceTokens.icon)}
        />
      ) : null}

      {contentType === 'agencyIcon' ? (
        <Buildings
          aria-hidden="true"
          size={iconSize}
          weight="fill"
          className={twMerge('shrink-0', appearanceTokens.icon)}
        />
      ) : null}
    </div>
  );
}

export { avatarVariants };
