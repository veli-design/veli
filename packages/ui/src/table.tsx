'use client';

import * as React from 'react';
import {
  Button as AriaButton,
  Cell as AriaCell,
  Column as AriaColumn,
  ResizableTableContainer as AriaResizableTableContainer,
  ColumnResizer as AriaColumnResizer,
  Row as AriaRow,
  Table as AriaTable,
  TableBody as AriaTableBody,
  TableHeader as AriaTableHeader,
  useTableOptions,
  type CellProps as AriaCellProps,
  type ColumnProps as AriaColumnProps,
  type ColumnResizerProps as AriaColumnResizerProps,
  type ResizableTableContainerProps as AriaResizableTableContainerProps,
  type RowProps as AriaRowProps,
  type TableBodyProps as AriaTableBodyProps,
  type TableHeaderProps as AriaTableHeaderProps,
  type TableProps as AriaTableProps,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';
import { CaretDown, CaretUp, DotsSixVertical } from 'phosphor-react';
import { twMerge } from 'tailwind-merge';
import { Checkbox } from './checkbox';

const tableVariants = cva('w-full border-separate border-spacing-0 font-sans antialiased', {
  variants: {
    stickyHeader: {
      true: '[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:bg-bg-surface-raised',
      false: '',
    },
  },
  defaultVariants: {
    stickyHeader: false,
  },
});

const tableHeaderRowVariants = cva('border-b border-border-default-subtle');

const tableColumnVariants = cva(
  'px-4 py-3 text-start type-body-sm-medium text-text-default-emphasis outline-none',
  {
    variants: {
      allowsSorting: {
        true: 'cursor-pointer select-none data-[hovered]:bg-gray-alpha-100 data-[focus-visible]:ring-2 data-[focus-visible]:ring-inset data-[focus-visible]:ring-border-focus',
        false: '',
      },
    },
    defaultVariants: {
      allowsSorting: false,
    },
  },
);

const tableRowVariants = cva(
  'border-b border-border-default-subtle outline-none transition-colors data-[hovered]:bg-gray-alpha-100 data-[focus-visible]:ring-2 data-[focus-visible]:ring-inset data-[focus-visible]:ring-border-focus data-[selected]:bg-button-primary-subtle-default data-[disabled]:text-text-disabled-disabled',
);

const tableCellVariants = cva('px-4 py-3 type-body-sm-regular text-text-default-default');

const tableEmptyVariants = cva(
  'px-4 py-8 text-center type-body-sm-regular text-text-default-muted',
);

const tableResizerVariants = cva(
  'flex w-3 items-stretch justify-center px-0.5 outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus',
);

const tableResizerHandleVariants = cva(
  'w-px bg-border-default-subtle data-[resizing]:bg-border-focus',
);

function SortIndicator({ direction }: { direction?: 'ascending' | 'descending' }) {
  if (direction === 'ascending') {
    return <CaretUp aria-hidden="true" className="size-3.5 shrink-0" weight="bold" />;
  }
  if (direction === 'descending') {
    return <CaretDown aria-hidden="true" className="size-3.5 shrink-0" weight="bold" />;
  }
  return (
    <svg
      aria-hidden="true"
      className="size-3.5 shrink-0 opacity-50"
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <path d="M8 3.5 4.5 7h7L8 3.5ZM8 12.5 11.5 9h-7L8 12.5Z" />
    </svg>
  );
}

export interface TableProps extends Omit<AriaTableProps, 'className' | 'style'> {
  className?: string;
  stickyHeader?: boolean;
}

export function Table({ className, stickyHeader = false, ...props }: TableProps) {
  return <AriaTable {...props} className={twMerge(tableVariants({ stickyHeader }), className)} />;
}

export interface TableResizableContainerProps extends Omit<
  AriaResizableTableContainerProps,
  'className' | 'style'
> {
  className?: string;
}

export function TableResizableContainer({ className, ...props }: TableResizableContainerProps) {
  return (
    <AriaResizableTableContainer
      {...props}
      className={twMerge('max-w-full overflow-x-auto', className)}
    />
  );
}

export interface TableHeaderProps<T = unknown> extends Omit<
  AriaTableHeaderProps<T>,
  'className' | 'style' | 'children'
> {
  className?: string;
  children?: React.ReactNode;
}

export function TableHeader<T = unknown>({ className, children, ...props }: TableHeaderProps<T>) {
  const { selectionBehavior, selectionMode, allowsDragging } = useTableOptions();
  const showSelection = selectionBehavior === 'toggle' && selectionMode === 'multiple';

  return (
    <AriaTableHeader {...props} className={twMerge(tableHeaderRowVariants(), className)}>
      {allowsDragging ? <AriaColumn className="w-10" /> : null}
      {showSelection ? (
        <AriaColumn className="w-12 px-4 py-3">
          <Checkbox slot="selection" size="md" aria-label="Select all" />
        </AriaColumn>
      ) : null}
      {children}
    </AriaTableHeader>
  );
}

export interface TableColumnProps extends Omit<AriaColumnProps, 'className' | 'style'> {
  className?: string;
}

export function TableColumn({ className, children, ...props }: TableColumnProps) {
  return (
    <AriaColumn
      {...props}
      className={(state) =>
        twMerge(tableColumnVariants({ allowsSorting: state.allowsSorting }), className)
      }
    >
      {(state) => (
        <span className="inline-flex items-center gap-1.5">
          {typeof children === 'function' ? children(state) : children}
          {state.allowsSorting ? (
            <span className={state.sortDirection ? '' : 'invisible'}>
              <SortIndicator direction={state.sortDirection} />
            </span>
          ) : null}
        </span>
      )}
    </AriaColumn>
  );
}

export interface TableColumnResizerProps extends Omit<
  AriaColumnResizerProps,
  'className' | 'style'
> {
  className?: string;
}

export function TableColumnResizer({ className, ...props }: TableColumnResizerProps) {
  return (
    <AriaColumnResizer {...props} className={() => twMerge(tableResizerVariants(), className)}>
      <div className={tableResizerHandleVariants()} />
    </AriaColumnResizer>
  );
}

export interface TableBodyProps<T extends object> extends Omit<
  AriaTableBodyProps<T>,
  'className' | 'style'
> {
  className?: string;
  emptyMessage?: React.ReactNode;
}

export function TableBody<T extends object>({
  className,
  emptyMessage = 'No results found.',
  renderEmptyState,
  ...props
}: TableBodyProps<T>) {
  return (
    <AriaTableBody
      {...props}
      className={className}
      renderEmptyState={
        renderEmptyState ?? (() => <div className={tableEmptyVariants()}>{emptyMessage}</div>)
      }
    />
  );
}

export interface TableRowProps<T = unknown> extends Omit<
  AriaRowProps<T>,
  'className' | 'style' | 'children'
> {
  className?: string;
  children?: React.ReactNode;
}

export function TableRow<T = unknown>({ className, children, ...props }: TableRowProps<T>) {
  const { selectionBehavior, selectionMode, allowsDragging } = useTableOptions();
  const showSelection = selectionBehavior === 'toggle' && selectionMode === 'multiple';

  return (
    <AriaRow {...props} className={() => twMerge(tableRowVariants(), className)}>
      {allowsDragging ? (
        <AriaCell className={tableCellVariants()}>
          <AriaButton
            slot="drag"
            className="inline-flex rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <DotsSixVertical aria-hidden="true" className="size-4 text-icon-default-muted" />
          </AriaButton>
        </AriaCell>
      ) : null}
      {showSelection ? (
        <AriaCell className={tableCellVariants()}>
          <Checkbox slot="selection" size="md" aria-label="Select row" />
        </AriaCell>
      ) : null}
      {children}
    </AriaRow>
  );
}

export interface TableCellProps extends Omit<AriaCellProps, 'className' | 'style'> {
  className?: string;
}

export function TableCell({ className, ...props }: TableCellProps) {
  return <AriaCell {...props} className={() => twMerge(tableCellVariants(), className)} />;
}

Table.ResizableContainer = TableResizableContainer;
Table.Header = TableHeader;
Table.Column = TableColumn;
Table.ColumnResizer = TableColumnResizer;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;

export type { Selection, SortDescriptor, SortDirection } from 'react-aria-components';
export { useDragAndDrop } from 'react-aria-components';
