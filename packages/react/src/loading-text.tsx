'use client';

import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import type { RefProp } from './ref.js';

export interface LoadingTextProps
  extends RefProp<HTMLSpanElement>, Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Localized pending label. A trailing ellipsis is replaced by decorative grains. */
  children: string;
}

export function LoadingText({
  children,
  className,
  ref,
  role,
  'aria-label': label,
  'aria-hidden': hidden,
  ...props
}: LoadingTextProps) {
  const decorative = hidden === true || hidden === 'true';
  return (
    <span
      {...props}
      ref={ref}
      aria-hidden={hidden}
      role={decorative ? undefined : (role ?? 'status')}
      aria-label={decorative ? undefined : (label ?? children)}
      aria-atomic="true"
      className={twMerge('veli-loading-text', className)}
    >
      <span aria-hidden="true" className="veli-loading-text__label">
        {children.replace(/(?:…|\.{3})\s*$/, '')}
      </span>
      <span aria-hidden="true" className="veli-loading-text__grains">
        <span className="veli-loading-text__grain" />
        <span className="veli-loading-text__grain" />
        <span className="veli-loading-text__grain" />
      </span>
    </span>
  );
}
