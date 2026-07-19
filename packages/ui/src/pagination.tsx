'use client';

import * as React from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { CaretLeft, CaretRight } from 'phosphor-react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { Button } from './button';
import { Menu, MenuItem, MenuPopover, MenuTrigger } from './menu';
import { useVeliLanguage } from './provider';

const paginationRootVariants = cva('inline-flex items-center gap-4 font-sans antialiased');

const paginationPageButtonVariants = cva(
  'inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3.5 type-body-sm-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface-base',
  {
    variants: {
      isCurrent: {
        true: 'bg-button-primary-default text-white',
        false:
          'bg-button-secondary-subtle-default text-text-default-strong hover:bg-button-secondary-subtle-hover active:bg-button-secondary-subtle-pressed',
      },
      isDisabled: {
        true: 'cursor-not-allowed bg-button-disabled-disabled text-text-disabled-disabled hover:bg-button-disabled-disabled active:bg-button-disabled-disabled',
        false: '',
      },
    },
    defaultVariants: {
      isCurrent: false,
      isDisabled: false,
    },
  },
);

const paginationEllipsisTriggerVariants = cva(
  'inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-full bg-button-secondary-subtle-default px-3.5 type-body-sm-medium text-text-default-strong outline-none transition-colors',
  {
    variants: {
      isHovered: {
        true: 'bg-button-secondary-subtle-hover text-text-default-strong',
        false: '',
      },
      isPressed: {
        true: 'bg-button-secondary-subtle-pressed text-text-default-strong',
        false: '',
      },
      isFocusVisible: {
        true: 'ring-2 ring-border-focus ring-offset-2 ring-offset-bg-surface-base',
        false: '',
      },
      isDisabled: {
        true: 'cursor-not-allowed bg-button-disabled-disabled text-text-disabled-disabled hover:bg-button-disabled-disabled active:bg-button-disabled-disabled',
        false: 'hover:bg-button-secondary-subtle-hover active:bg-button-secondary-subtle-pressed',
      },
    },
    defaultVariants: {
      isHovered: false,
      isPressed: false,
      isFocusVisible: false,
      isDisabled: false,
    },
  },
);

const paginationNumberClassName =
  'type-body-sm-medium tabular-nums [font-variant-numeric:tabular-nums]';

const paginationText = {
  en: {
    label: 'Pagination',
    first: 'First',
    previous: 'Previous',
    next: 'Next',
    last: 'Last',
    pagePrefix: 'Page',
    pageSeparator: 'of',
    pageLabel: (page: number) => `Page ${page}`,
    ellipsisLabel: 'Show hidden pages',
    ellipsisMenuLabel: 'Hidden pages',
  },
  dv: {
    label: 'ޕޭޖިނޭޝަން',
    first: 'ފުރަތަމަ',
    previous: 'ފަހު',
    next: 'ކުރީ',
    last: 'ފަހުގެ',
    pagePrefix: 'ޞަފްޙާ',
    pageSeparator: '/',
    pageLabel: (page: number) => `ޞަފްޙާ ${page}`,
    ellipsisLabel: 'ފޮރުވިފައިވާ ޞަފްޙާތައް ދައްކާ',
    ellipsisMenuLabel: 'ފޮރުވިފައިވާ ޞަފްޙާތައް',
  },
} as const;

type PaginationLanguage = keyof typeof paginationText;

function PaginationNumber({ children }: { children: React.ReactNode }) {
  return (
    <bdi lang="en" dir="ltr" className={paginationNumberClassName}>
      {children}
    </bdi>
  );
}

function PaginationPageCount({
  current,
  language,
  total,
}: {
  current: number;
  language: PaginationLanguage;
  total: number;
}) {
  const copy = paginationText[language];

  if (language === 'dv') {
    return (
      <>
        {copy.pagePrefix}{' '}
        <PaginationNumber>
          {current} {copy.pageSeparator} {total}
        </PaginationNumber>
      </>
    );
  }

  return (
    <>
      {copy.pagePrefix} <PaginationNumber>{current}</PaginationNumber> {copy.pageSeparator}{' '}
      <PaginationNumber>{total}</PaginationNumber>
    </>
  );
}

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

function getHiddenPages(pages: Array<number | 'ellipsis'>, ellipsisIndex: number) {
  const previous = pages[ellipsisIndex - 1];
  const next = pages[ellipsisIndex + 1];

  if (typeof previous !== 'number' || typeof next !== 'number') {
    return [];
  }

  return range(previous + 1, next - 1);
}

interface PaginationEllipsisProps {
  hiddenPages: number[];
  isDisabled: boolean;
  label: string;
  menuLabel: string;
  pageLabel: (page: number) => string;
  onSelectPage: (page: number) => void;
}

function PaginationEllipsis({
  hiddenPages,
  isDisabled,
  label,
  menuLabel,
  pageLabel,
  onSelectPage,
}: PaginationEllipsisProps) {
  const { direction, lang } = useVeliLanguage();

  if (hiddenPages.length === 0) {
    return (
      <span className={paginationEllipsisTriggerVariants({ isDisabled: true })} aria-hidden="true">
        …
      </span>
    );
  }

  if (isDisabled) {
    return (
      <span className={paginationEllipsisTriggerVariants({ isDisabled: true })} aria-hidden="true">
        …
      </span>
    );
  }

  return (
    <MenuTrigger>
      <AriaButton
        aria-label={label}
        className={(state) =>
          paginationEllipsisTriggerVariants({
            isHovered: state.isHovered && !state.isPressed,
            isPressed: state.isPressed,
            isFocusVisible: state.isFocusVisible,
          })
        }
      >
        <span aria-hidden="true">…</span>
      </AriaButton>
      <MenuPopover>
        <Menu
          aria-label={menuLabel}
          dir={direction}
          lang={lang}
          onAction={(key) => onSelectPage(Number(key))}
        >
          {hiddenPages.map((page) => (
            <MenuItem
              key={page}
              id={page}
              size="sm"
              className="cursor-pointer"
              aria-label={pageLabel(page)}
            >
              <PaginationNumber>{page}</PaginationNumber>
            </MenuItem>
          ))}
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  );
}

export type PaginationVariant = 'button' | 'explicit';

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  value?: number;
  defaultValue?: number;
  maxValue: number;
  onChange?: (page: number) => void;
  onFirst?: (page: number) => void;
  onPrevious?: (page: number) => void;
  onNext?: (page: number) => void;
  onLast?: (page: number) => void;
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
  onFirst,
  onPrevious,
  onNext,
  onLast,
  isDisabled = false,
  variant = 'button',
  siblingCount = 1,
  boundaryCount = 1,
  'aria-label': ariaLabel,
  className,
  ...props
}: PaginationProps) {
  const { language: activeLanguage, direction, lang } = useVeliLanguage();
  const paginationLanguage: PaginationLanguage = activeLanguage === 'dv' ? 'dv' : 'en';
  const copy = paginationText[paginationLanguage];
  const PreviousIcon = direction === 'rtl' ? CaretRight : CaretLeft;
  const NextIcon = direction === 'rtl' ? CaretLeft : CaretRight;
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

  const goFirst = () => {
    if (currentPage <= 1 || isDisabled) {
      return;
    }
    setPage(1);
    onFirst?.(1);
  };

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

  const goLast = () => {
    if (currentPage >= maxValue || isDisabled) {
      return;
    }
    setPage(maxValue);
    onLast?.(maxValue);
  };

  const pages =
    variant === 'explicit'
      ? getPaginationRange(currentPage, maxValue, siblingCount, boundaryCount)
      : [];

  const isAtStart = currentPage <= 1;
  const isAtEnd = currentPage >= maxValue;

  return (
    <nav
      {...props}
      aria-label={ariaLabel ?? copy.label}
      dir={direction}
      lang={lang}
      className={twMerge(paginationRootVariants(), className)}
    >
      <Button
        intent="secondary"
        appearance="transparent"
        size="sm"
        isDisabled={isDisabled || isAtStart}
        aria-label={copy.first}
        onPress={goFirst}
      >
        {copy.first}
      </Button>

      <Button
        intent="secondary"
        appearance="transparent"
        size="sm"
        iconOnly
        isDisabled={isDisabled || isAtStart}
        aria-label={copy.previous}
        onPress={goPrevious}
      >
        <PreviousIcon aria-hidden size={16} weight="bold" />
      </Button>

      {variant === 'button' ? (
        <span className="px-2 type-body-sm-medium text-text-default-muted" aria-live="polite">
          <PaginationPageCount
            current={currentPage}
            language={paginationLanguage}
            total={maxValue}
          />
        </span>
      ) : (
        <div className="flex items-center gap-2">
          {pages.map((page, index) => {
            if (page === 'ellipsis') {
              const previousPage = pages[index - 1];
              const nextPage = pages[index + 1];
              const hiddenPages = getHiddenPages(pages, index);
              const previousKey = typeof previousPage === 'number' ? previousPage : 'start';
              const nextKey = typeof nextPage === 'number' ? nextPage : 'end';

              return (
                <PaginationEllipsis
                  key={`ellipsis-${previousKey}-${nextKey}`}
                  hiddenPages={hiddenPages}
                  isDisabled={isDisabled}
                  label={copy.ellipsisLabel}
                  menuLabel={copy.ellipsisMenuLabel}
                  pageLabel={copy.pageLabel}
                  onSelectPage={setPage}
                />
              );
            }

            return (
              <button
                key={page}
                type="button"
                aria-label={copy.pageLabel(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                disabled={isDisabled}
                className={paginationPageButtonVariants({
                  isCurrent: page === currentPage,
                  isDisabled,
                })}
                onClick={() => setPage(page)}
              >
                <PaginationNumber>{page}</PaginationNumber>
              </button>
            );
          })}
        </div>
      )}

      <Button
        intent="secondary"
        appearance="transparent"
        size="sm"
        iconOnly
        isDisabled={isDisabled || isAtEnd}
        aria-label={copy.next}
        onPress={goNext}
      >
        <NextIcon aria-hidden size={16} weight="bold" />
      </Button>

      <Button
        intent="secondary"
        appearance="transparent"
        size="sm"
        isDisabled={isDisabled || isAtEnd}
        aria-label={copy.last}
        onPress={goLast}
      >
        {copy.last}
      </Button>
    </nav>
  );
}
