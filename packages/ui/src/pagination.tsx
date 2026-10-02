'use client';

import * as React from 'react';
import { CaretLeft, CaretRight } from 'phosphor-react';
import { twMerge } from 'tailwind-merge';
import { Button } from './button';
import { Menu, MenuItem, MenuPopover, MenuTrigger } from './menu';
import { useVeliLanguage } from './provider';

const secondaryButtonClassName = 'text-base-strong disabled:text-disabled';
const paginationFocusClassName =
  'forced-colors:[&_button:focus-visible]:[outline:2px_solid_Highlight] forced-colors:[&_button:focus-visible]:outline-offset-2';

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
    loadMore: 'Load more',
    viewed: (loaded: React.ReactNode, total: React.ReactNode) => (
      <>
        You’ve viewed {loaded} of {total} items
      </>
    ),
  },
  dv: {
    label: 'ޕޭޖިނޭޝަން',
    first: 'ފުރަތަމަ',
    previous: 'ފަހަތަށް',
    next: 'ކުރިއަށް',
    last: 'ފަހުގެ',
    pagePrefix: 'ޞަފްޙާ',
    pageSeparator: '/',
    pageLabel: (page: number) => `ޞަފްޙާ ${page}`,
    ellipsisLabel: 'ފޮރުވިފައިވާ ޞަފްޙާތައް ދައްކާ',
    ellipsisMenuLabel: 'ފޮރުވިފައިވާ ޞަފްޙާތައް',
    loadMore: 'އިތުރަށް ދައްކާ',
    viewed: (loaded: React.ReactNode, total: React.ReactNode) => (
      <>
        {total} ތަކެތިން {loaded} ތަކެތި ބަލާފައި
      </>
    ),
  },
} as const;

type PaginationLanguage = keyof typeof paginationText;

function PaginationNumber({
  children,
  regular = false,
}: {
  children: React.ReactNode;
  regular?: boolean;
}) {
  return (
    <bdi
      lang="en"
      dir="ltr"
      className={twMerge(regular ? 'type-body-sm-regular' : 'type-body-sm-medium', 'tabular-nums')}
    >
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

function getHiddenPages(pages: Array<number | 'ellipsis'>, ellipsisIndex: number, total: number) {
  const previous = pages[ellipsisIndex - 1] ?? 0;
  const next = pages[ellipsisIndex + 1] ?? total + 1;

  if (typeof previous !== 'number' || typeof next !== 'number') {
    return [];
  }

  return range(previous + 1, next - 1);
}

interface PaginationEllipsisProps {
  hiddenPages: number[];
  label: string;
  menuLabel: string;
  pageLabel: (page: number) => string;
  onSelectPage: (page: number) => void;
}

function PaginationEllipsis({
  hiddenPages,
  label,
  menuLabel,
  pageLabel,
  onSelectPage,
}: PaginationEllipsisProps) {
  const { direction, lang } = useVeliLanguage();

  return (
    <MenuTrigger>
      <Button
        type="button"
        intent="secondary"
        appearance="transparent"
        size="sm"
        className={twMerge('px-2', secondaryButtonClassName)}
        isDisabled={hiddenPages.length === 0}
        aria-label={label}
      >
        <span aria-hidden="true">...</span>
      </Button>
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

export type PaginationVariant = 'button' | 'explicit' | 'loadmore';

type PaginationSharedProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  'onChange' | 'children' | 'defaultValue'
>;

export interface PaginationPageProps extends PaginationSharedProps {
  value?: number;
  defaultValue?: number;
  maxValue: number;
  onChange?: (page: number) => void;
  onFirst?: (page: number) => void;
  onPrevious?: (page: number) => void;
  onNext?: (page: number) => void;
  onLast?: (page: number) => void;
  variant?: Exclude<PaginationVariant, 'loadmore'>;
  siblingCount?: number;
  boundaryCount?: number;
}

export interface PaginationLoadMoreProps extends PaginationSharedProps {
  variant: 'loadmore';
  loadedCount: number;
  totalCount: number;
  onLoadMore: () => void;
  isLoading?: boolean;
}

export type PaginationProps = PaginationPageProps | PaginationLoadMoreProps;

function toCount(value: number, minimum = 0) {
  return Number.isFinite(value) ? Math.max(minimum, Math.floor(value)) : minimum;
}

export function Pagination(props: PaginationProps) {
  return props.variant === 'loadmore' ? (
    <PaginationLoadMore {...props} />
  ) : (
    <PaginationPages {...props} />
  );
}

function PaginationLoadMore({
  variant,
  loadedCount,
  totalCount,
  onLoadMore,
  isLoading = false,
  'aria-label': ariaLabel,
  className,
  ...props
}: PaginationLoadMoreProps) {
  const { language, direction, lang } = useVeliLanguage();
  const copy = paginationText[language === 'dv' ? 'dv' : 'en'];
  const statusId = React.useId();
  const total = toCount(totalCount);
  const loaded = Math.min(toCount(loadedCount), total);
  const isComplete = loaded >= total;

  return (
    <div
      {...props}
      role="group"
      aria-label={ariaLabel ?? copy.loadMore}
      dir={direction}
      lang={lang}
      data-variant={variant}
      aria-busy={isLoading || undefined}
      className={twMerge(
        'inline-flex w-66 max-w-full flex-col items-center gap-7 font-sans antialiased',
        paginationFocusClassName,
        className,
      )}
    >
      <div className="flex w-full flex-col items-center gap-3 px-1">
        <p
          id={statusId}
          role="status"
          aria-atomic="true"
          className="m-0 text-center type-body-sm-regular text-base-muted"
        >
          {copy.viewed(
            <PaginationNumber regular>{loaded}</PaginationNumber>,
            <PaginationNumber regular>{total}</PaginationNumber>,
          )}
        </p>
        <div
          role="progressbar"
          aria-labelledby={statusId}
          aria-valuemin={0}
          aria-valuemax={total || 1}
          aria-valuenow={loaded}
          className="flex h-1 w-full overflow-hidden rounded-lg bg-neutral-alpha-400 forced-colors:bg-[Canvas] forced-colors:outline forced-colors:outline-1"
        >
          <div
            className="h-full bg-primary-600 transition-[width] duration-normal ease-out motion-reduce:transition-none forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none"
            style={{ width: `${total > 0 ? (loaded / total) * 100 : 0}%` }}
          />
        </div>
      </div>
      <Button
        type="button"
        intent="secondary"
        appearance="transparent"
        size="md"
        className={twMerge('w-full', secondaryButtonClassName)}
        isDisabled={isComplete}
        isLoading={isLoading}
        onPress={() => {
          if (!isLoading && !isComplete) onLoadMore();
        }}
      >
        {copy.loadMore}
      </Button>
    </div>
  );
}

function PaginationPages({
  value: valueProp,
  defaultValue = 1,
  maxValue: maxValueProp,
  onChange,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  variant = 'button',
  siblingCount: siblingCountProp = 1,
  boundaryCount: boundaryCountProp = 1,
  'aria-label': ariaLabel,
  className,
  ...props
}: PaginationPageProps) {
  const maxValue = toCount(maxValueProp, 1);
  const siblingCount = Math.min(toCount(siblingCountProp), maxValue);
  const boundaryCount = Math.min(toCount(boundaryCountProp), maxValue);
  const { language: activeLanguage, direction, lang } = useVeliLanguage();
  const paginationLanguage: PaginationLanguage = activeLanguage === 'dv' ? 'dv' : 'en';
  const copy = paginationText[paginationLanguage];
  const PreviousIcon = direction === 'rtl' ? CaretRight : CaretLeft;
  const NextIcon = direction === 'rtl' ? CaretLeft : CaretRight;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : uncontrolledValue;
  const currentPage = Math.min(toCount(value, 1), maxValue);

  const currentPageRef = React.useRef<HTMLButtonElement>(null);
  const focusSelectedPage = React.useRef(false);
  React.useEffect(() => {
    if (focusSelectedPage.current) {
      currentPageRef.current?.focus();
      focusSelectedPage.current = false;
    }
  }, [currentPage]);

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
    if (currentPage <= 1) {
      return;
    }
    setPage(1);
    onFirst?.(1);
  };

  const goPrevious = () => {
    if (currentPage <= 1) {
      return;
    }
    const next = currentPage - 1;
    setPage(next);
    onPrevious?.(next);
  };

  const goNext = () => {
    if (currentPage >= maxValue) {
      return;
    }
    const next = currentPage + 1;
    setPage(next);
    onNext?.(next);
  };

  const goLast = () => {
    if (currentPage >= maxValue) {
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
      className={twMerge(
        'inline-flex max-w-full flex-wrap items-center justify-center gap-4 font-sans antialiased',
        paginationFocusClassName,
        className,
      )}
    >
      <Button
        type="button"
        intent="secondary"
        appearance="transparent"
        size="sm"
        isDisabled={isAtStart}
        className={twMerge('px-2', secondaryButtonClassName)}
        aria-label={copy.first}
        onPress={goFirst}
      >
        {copy.first}
      </Button>

      <Button
        type="button"
        intent="secondary"
        appearance="transparent"
        size="sm"
        iconOnly
        className={secondaryButtonClassName}
        isDisabled={isAtStart}
        aria-label={copy.previous}
        onPress={goPrevious}
      >
        <PreviousIcon aria-hidden size={16} weight="bold" />
      </Button>

      {variant === 'button' ? (
        <span
          className="px-2 type-body-sm-medium text-base-muted"
          aria-live="polite"
          aria-atomic="true"
        >
          <PaginationPageCount
            current={currentPage}
            language={paginationLanguage}
            total={maxValue}
          />
        </span>
      ) : (
        <div className="flex max-w-full flex-wrap items-center justify-center gap-2">
          {pages.map((page, index) => {
            if (page === 'ellipsis') {
              const previousPage = pages[index - 1];
              const nextPage = pages[index + 1];
              const hiddenPages = getHiddenPages(pages, index, maxValue);
              const previousKey = typeof previousPage === 'number' ? previousPage : 'start';
              const nextKey = typeof nextPage === 'number' ? nextPage : 'end';

              return (
                <PaginationEllipsis
                  key={`ellipsis-${previousKey}-${nextKey}`}
                  hiddenPages={hiddenPages}
                  label={copy.ellipsisLabel}
                  menuLabel={copy.ellipsisMenuLabel}
                  pageLabel={copy.pageLabel}
                  onSelectPage={(page) => {
                    focusSelectedPage.current = true;
                    setPage(page);
                  }}
                />
              );
            }

            return (
              <Button
                key={page}
                ref={page === currentPage ? currentPageRef : undefined}
                type="button"
                size="sm"
                intent={page === currentPage ? 'primary' : 'secondary'}
                appearance={page === currentPage ? 'fill' : 'transparent'}
                aria-label={copy.pageLabel(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={twMerge(
                  'px-2',
                  page === currentPage
                    ? 'forced-colors:outline forced-colors:outline-2'
                    : secondaryButtonClassName,
                )}
                onPress={() => setPage(page)}
              >
                <PaginationNumber>{page}</PaginationNumber>
              </Button>
            );
          })}
        </div>
      )}

      <Button
        type="button"
        intent="secondary"
        appearance="transparent"
        size="sm"
        iconOnly
        className={secondaryButtonClassName}
        isDisabled={isAtEnd}
        aria-label={copy.next}
        onPress={goNext}
      >
        <NextIcon aria-hidden size={16} weight="bold" />
      </Button>

      <Button
        type="button"
        intent="secondary"
        appearance="transparent"
        size="sm"
        isDisabled={isAtEnd}
        className={twMerge('px-2', secondaryButtonClassName)}
        aria-label={copy.last}
        onPress={goLast}
      >
        {copy.last}
      </Button>
    </nav>
  );
}
