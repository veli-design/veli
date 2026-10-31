'use client';

import { useSyncExternalStore, type HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { useVeliLanguage } from './provider.js';
import type { RefProp } from './ref.js';
import { SpinnerArtwork } from './spinner-artwork.js';

export interface SpinnerProps
  extends RefProp<HTMLSpanElement>, Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** General loading or the compact button animation. */
  variant?: 'default' | 'button';
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'size-5', md: 'size-6', lg: 'size-8' };
const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
function subscribeToMotion(callback: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}
const prefersReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;
// Static artwork is also useful before hydration.
const serverMotion = () => true;

export function Spinner({
  variant = 'default',
  size = 'md',
  className,
  ref,
  'aria-label': label,
  'aria-hidden': hidden,
  role,
  ...props
}: SpinnerProps) {
  const { language } = useVeliLanguage();
  const reducedMotion = useSyncExternalStore(subscribeToMotion, prefersReducedMotion, serverMotion);
  const decorative = hidden === true || hidden === 'true';

  return (
    <span
      {...props}
      ref={ref}
      aria-hidden={hidden}
      role={decorative ? undefined : (role ?? 'status')}
      aria-label={decorative ? undefined : (label ?? (language === 'dv' ? 'ލޯޑުވަނީ' : 'Loading'))}
      className={twMerge(
        'veli-spinner inline-flex shrink-0 items-center justify-center',
        variant === 'default' ? 'text-icon-primary' : 'text-inherit',
        sizes[size],
        className,
      )}
    >
      <SpinnerArtwork variant={variant} animated={!reducedMotion} />
    </span>
  );
}
