'use client';

import * as React from 'react';
import { Buildings, User } from 'phosphor-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const avatarAppearances = {
  blue: {
    surface: 'bg-avatar-blue',
    content: 'text-text-primary-default',
    icon: 'text-icon-primary-default',
  },
  neutral: {
    surface: 'bg-avatar-neutral',
    content: 'text-text-default-default',
    icon: 'text-icon-default-default',
  },
  successGreen: {
    surface: 'bg-avatar-success-green',
    content: 'text-text-success-default',
    icon: 'text-icon-success-default',
  },
  yellow: {
    surface: 'bg-avatar-yellow',
    content: 'text-text-cautious-default',
    icon: 'text-icon-cautious-default',
  },
  orange: {
    surface: 'bg-avatar-orange',
    content: 'text-text-warning-default',
    icon: 'text-icon-warning-default',
  },
  pink: {
    surface: 'bg-avatar-pink',
    content: 'text-status-pink-emphasis',
    icon: 'text-status-pink-emphasis',
  },
  indigo: {
    surface: 'bg-avatar-indigo',
    content: 'text-status-indigo-emphasis',
    icon: 'text-status-indigo-emphasis',
  },
  turquoise: {
    surface: 'bg-avatar-turquoise',
    content: 'text-status-turquoise-emphasis',
    icon: 'text-status-turquoise-emphasis',
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

const avatarInitialsTypography = {
  '60': 'type-title-2-medium',
  '52': 'type-subtitle-medium',
  '44': 'type-body-lg-medium',
  '36': 'type-body-md-medium',
  '28': 'type-caption-medium',
  '20': 'type-caption-medium',
  '16': 'text-[10px] font-medium leading-[1.34] tracking-[0.15px]',
} as const;

const avatarVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-sans antialiased',
  {
    variants: {
      appearance: {
        blue: avatarAppearances.blue.surface,
        neutral: avatarAppearances.neutral.surface,
        successGreen: avatarAppearances.successGreen.surface,
        yellow: avatarAppearances.yellow.surface,
        orange: avatarAppearances.orange.surface,
        pink: avatarAppearances.pink.surface,
        indigo: avatarAppearances.indigo.surface,
        turquoise: avatarAppearances.turquoise.surface,
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

function formatInitials(value: string, size: AvatarSize) {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return '';
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  }

  const single = parts[0]!.toUpperCase();
  return size === '16' || size === '20' ? single.slice(0, 1) : single.slice(0, 2);
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
  const imageError = Boolean(src && failedSrc === src);
  const resolvedSize = size ?? '60';
  const resolvedAppearance = appearance ?? 'blue';
  const contentType = resolveContentType({ type, src, initials, imageError });
  const appearanceTokens = avatarAppearances[resolvedAppearance];
  const label = getAccessibleLabel({ alt, initials, contentType });
  const displayInitials =
    contentType === 'initials' ? formatInitials(initials ?? '', resolvedSize) : '';
  const iconSize = avatarIconSizes[resolvedSize];

  return (
    <div
      {...props}
      role="img"
      aria-label={label}
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
          alt=""
          className="size-full object-cover"
          onError={() => {
            if (src) {
              setFailedSrc(src);
            }
          }}
        />
      ) : null}

      {contentType === 'initials' ? (
        <span
          aria-hidden="true"
          className={twMerge(
            'select-none text-center uppercase [word-break:break-word]',
            avatarInitialsTypography[resolvedSize],
            appearanceTokens.content,
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
