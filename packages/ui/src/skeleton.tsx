'use client';

import * as React from 'react';
import { twMerge } from 'tailwind-merge';
import { type RefProp } from './ref.js';

export interface SkeletonProps
  extends RefProp<HTMLDivElement>, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {}

export function Skeleton({ className, ref, ...props }: SkeletonProps) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={twMerge(
        'veli-skeleton relative overflow-hidden rounded-md bg-skeleton',
        className,
      )}
      {...props}
    />
  );
}
