'use client';

import * as React from 'react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { Button } from './button';
import { useVeliLanguage } from './provider';

const paginationRootVariants = cva('inline-flex items-center gap-1 font-sans antialiased');

const paginationPageButtonVariants = cva(
  'inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2 type-body-sm-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface-base',
  {
    variants: {
      isCurrent: {
        true: 'bg-button-primary-subtle-default text-text-primary-muted',
        false:
          'text-text-default-default hover:bg-button-secondary-subtle-hover active:bg-button-secondary-subtle-pressed',
      },
      isDisabled: {
        true: 'cursor-not-allowed text-text-disabled-disabled hover:bg-transparent active:bg-transparent',
        false: '',
      },
    },
    defaultVariants: {
      isCurrent: false,
      isDisabled: false,
    },
  },
);

const paginationEllipsisVariants = cva(
  'inline-flex h-9 min-w-9 items-center justify-center type-body-sm-medium text-text-default-muted',
);

const paginationText = {
  en: {
    label: 'Pagination',
    previous: 'Previous page',
    next: 'Next page',
    page: (current: number, total: number) => `Page ${current} of ${total}`,
  },
  dv: {
    label: 'ޕޭޖިނޭޝަން',
    previous: 'ކުރީގެ ޞަފްޙާ',
    next: 'ފަހުގެ ޞަފްޙާ',
    page: (current: number, total: number) => `ޞަފްޙާ ${current} / ${total}`,
  },
} as const;

function range(start: number, end: number) {
  const values: number[] = [];
  for (let index = start; index <= end; index += 1) {
    values.push(index);
  }
  return values;
}

function getPaginationRange(
  current: number,
  total: number,
  siblingCount: number,
  boundaryCount: number,
) {
  const startPages = range(1, Math.min(boundaryCount, total));
  const endPages = range(Math.max(total - boundaryCount + 1, boundaryCount + 1), total);

  const siblingsStart = Math.max(
    Math.min(current - siblingCount, total - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : total - 1,
  );

  const itemList: Array<number | 'ellipsis'> = [...startPages];

  if (siblingsStart > boundaryCount + 2) {
    itemList.push('ellipsis');
  } else if (boundaryCount + 1 < total - boundaryCount) {
    itemList.push(boundaryCount + 1);
  }

  itemList.push(...range(siblingsStart, siblingsEnd));

  if (siblingsEnd < total - boundaryCount - 1) {
    itemList.push('ellipsis');
  } else if (total - boundaryCount > boundaryCount) {
    itemList.push(total - boundaryCount);
  }

  itemList.push(...endPages.filter((page) => !startPages.includes(page)));

  return itemList;
}

export type PaginationVariant = 'button' | 'explicit';

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  value?: number;
  defaultValue?: number;
  maxValue: number;
  onChange?: (page: number) => void;
  onPrevious?: (page: number) => void;
  onNext?: (page: number) => void;
  isDisabled?: boolean;
  variant?: PaginationVariant;
  siblingCount?: number;
  boundaryCount?: number;
  'aria-label'?: string;
  className?: string;
}

export function Pagination({
  value: valueProp,
  defaultValue = 1,
  maxValue,
  onChange,
  onPrevious,
  onNext,
  isDisabled = false,
  variant = 'button',
  siblingCount = 1,
  boundaryCount = 1,
  'aria-label': ariaLabel,
  className,
  ...props
}: PaginationProps) {
  const language = useVeliLanguage();
  const copy = paginationText[language.language === 'dv' ? 'dv' : 'en'];
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : uncontrolledValue;
  const currentPage = Math.min(Math.max(value, 1), Math.max(maxValue, 1));

  const setPage = React.useCallback(
    (nextPage: number) => {
      const clamped = Math.min(Math.max(nextPage, 1), maxValue);
      if (!isControlled) {
        setUncontrolledValue(clamped);
      }
      if (clamped !== currentPage) {
        onChange?.(clamped);
      }
    },
    [currentPage, isControlled, maxValue, onChange],
  );

  const goPrevious = () => {
    if (currentPage <= 1 || isDisabled) {
      return;
    }
    const next = currentPage - 1;
    setPage(next);
    onPrevious?.(next);
  };

  const goNext = () => {
    if (currentPage >= maxValue || isDisabled) {
      return;
    }
    const next = currentPage + 1;
    setPage(next);
    onNext?.(next);
  };

  const pages =
    variant === 'explicit'
      ? getPaginationRange(currentPage, maxValue, siblingCount, boundaryCount)
      : [];

  return (
    <nav
      {...props}
      aria-label={ariaLabel ?? copy.label}
      className={twMerge(paginationRootVariants(), className)}
    >
      <Button
        intent="secondary"
        appearance="transparent"
        size="sm"
        isDisabled={isDisabled || currentPage <= 1}
        aria-label={copy.previous}
        onPress={goPrevious}
      >
        {copy.previous}
      </Button>

      {variant === 'button' ? (
        <span className="px-2 type-body-sm-medium text-text-default-muted" aria-live="polite">
          {copy.page(currentPage, maxValue)}
        </span>
      ) : (
        <div className="flex items-center gap-1">
          {pages.map((page, index) =>
            page === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className={paginationEllipsisVariants()}
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
                disabled={isDisabled}
                className={paginationPageButtonVariants({
                  isCurrent: page === currentPage,
                  isDisabled,
                })}
                onClick={() => setPage(page)}
              >
                {page}
              </button>
            ),
          )}
        </div>
      )}

      <Button
        intent="secondary"
        appearance="transparent"
        size="sm"
        isDisabled={isDisabled || currentPage >= maxValue}
        aria-label={copy.next}
        onPress={goNext}
      >
        {copy.next}
      </Button>
    </nav>
  );
}
