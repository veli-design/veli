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
import { CaretDownIcon, CaretUpIcon, DotsSixVerticalIcon } from '@phosphor-icons/react';
import { twMerge } from 'tailwind-merge';
import { Checkbox } from './checkbox.js';
import { useVeliLanguage } from './provider-shared.js';

const tableText = {
  en: {
    selectAll: 'Select all',
    selectRow: 'Select row',
    moveRow: 'Move row',
    empty: 'No results found.',
  },
  dv: {
    selectAll: 'ހުރިހާ ރޯތަކެއް ޚިޔާރުކުރޭ',
    selectRow: 'ރޯ ޚިޔާރުކުރޭ',
    moveRow: 'ރޯ ތަރުތީބުކުރޭ',
    empty: 'ނަތީޖާއެއް ނުފެނުނު.',
  },
};

const TableFrameContext = React.createContext(false);

const tableFrameVariants = cva(
  'overflow-x-auto rounded-2xl border border-base-subtle bg-bg-surface-raised',
);

const tableVariants = cva(
  'w-full border-separate border-spacing-0 font-sans antialiased [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:last-child]:rounded-b-[calc(var(--radius-2xl)-1px)] [&_tbody_tr:last-child_td:first-child]:rounded-es-[calc(var(--radius-2xl)-1px)] [&_tbody_tr:last-child_td:last-child]:rounded-ee-[calc(var(--radius-2xl)-1px)]',
  {
    variants: {
      stickyHeader: {
        true: '[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:bg-bg-surface-raised',
        false: '',
      },
    },
    defaultVariants: {
      stickyHeader: false,
    },
  },
);

const tableColumnVariants = cva(
  'border-b border-base-subtle text-start type-body-sm-medium text-base-emphasis outline-none',
  {
    variants: {
      allowsSorting: {
        true: 'cursor-pointer select-none data-[hovered]:bg-ash-alpha-100 data-[focus-visible]:ring-2 data-[focus-visible]:ring-inset data-[focus-visible]:ring-border-focus',
        false: '',
      },
      resizable: {
        true: 'px-0 py-0',
        false: 'px-4 py-3',
      },
    },
    defaultVariants: {
      allowsSorting: false,
      resizable: false,
    },
  },
);

const tableColumnContentVariants = cva('inline-flex min-w-0 flex-1 items-center gap-1.5', {
  variants: {
    resizable: {
      true: 'px-4 py-3',
      false: '',
    },
  },
  defaultVariants: {
    resizable: false,
  },
});

const tableRowVariants = cva(
  'outline-none transition-colors motion-reduce:transition-none data-[hovered]:bg-ash-alpha-100 data-[focus-visible]:ring-2 data-[focus-visible]:ring-inset data-[focus-visible]:ring-border-focus data-[selected]:bg-button-primary-subtle data-[disabled]:text-disabled',
);

const tableCellVariants = cva(
  'border-b border-base-subtle px-4 py-3 type-body-sm-regular text-base-default group-data-[disabled]/row:text-disabled outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-inset data-[focus-visible]:ring-border-focus',
);

const tableDragCellClassName = twMerge(
  tableCellVariants(),
  'cursor-grab group-data-[dragging]/row:cursor-grabbing',
);

const tableDragColumnClassName = twMerge(tableColumnVariants(), 'w-10 cursor-grab');

const tableEmptyVariants = cva('px-4 py-8 text-center type-body-sm-regular text-base-muted');

const tableResizerVariants = cva(
  'box-content w-px shrink-0 cursor-col-resize self-stretch touch-none bg-clip-content px-2 bg-border-base-subtle outline-none data-[resizing]:w-0.5 data-[resizing]:bg-border-focus data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus',
);

function SortIndicator({ direction }: { direction?: 'ascending' | 'descending' }) {
  if (direction === 'ascending') {
    return <CaretUpIcon aria-hidden="true" className="size-3.5 shrink-0" weight="bold" />;
  }
  if (direction === 'descending') {
    return <CaretDownIcon aria-hidden="true" className="size-3.5 shrink-0" weight="bold" />;
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
  const inFrame = React.useContext(TableFrameContext);
  const table = (
    <AriaTable {...props} className={twMerge(tableVariants({ stickyHeader }), className)} />
  );

  if (inFrame) {
    return table;
  }

  return <div className={tableFrameVariants()}>{table}</div>;
}

export interface TableResizableContainerProps extends Omit<
  AriaResizableTableContainerProps,
  'className' | 'style'
> {
  className?: string;
}

export function TableResizableContainer({ className, ...props }: TableResizableContainerProps) {
  return (
    <TableFrameContext.Provider value={true}>
      <AriaResizableTableContainer
        {...props}
        className={twMerge(tableFrameVariants(), 'max-w-full', className)}
      />
    </TableFrameContext.Provider>
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
  const { language } = useVeliLanguage();
  const showSelection = selectionBehavior === 'toggle' && selectionMode === 'multiple';

  return (
    <AriaTableHeader {...props} className={className}>
      {allowsDragging ? (
        <AriaColumn className={tableDragColumnClassName}>
          <span className="sr-only">{tableText[language].moveRow}</span>
        </AriaColumn>
      ) : null}
      {showSelection ? (
        <AriaColumn className={twMerge(tableColumnVariants(), 'w-12')}>
          <Checkbox
            slot="selection"
            size="md"
            className="flex w-fit"
            aria-label={tableText[language].selectAll}
          />
        </AriaColumn>
      ) : null}
      {children}
    </AriaTableHeader>
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
    <AriaColumnResizer {...props} className={() => twMerge(tableResizerVariants(), className)} />
  );
}

export interface TableColumnProps extends Omit<AriaColumnProps, 'className' | 'style'> {
  className?: string;
}

function isTableColumnResizer(child: React.ReactNode): boolean {
  return React.isValidElement(child) && child.type === TableColumnResizer;
}

function splitColumnChildren(children: React.ReactNode) {
  const items = React.Children.toArray(children);
  return {
    content: items.filter((child) => !isTableColumnResizer(child)),
    resizers: items.filter(isTableColumnResizer),
  };
}

export function TableColumn({ className, children, ...props }: TableColumnProps) {
  const inResizableFrame = React.useContext(TableFrameContext);

  return (
    <AriaColumn
      {...props}
      className={(state) =>
        twMerge(
          tableColumnVariants({
            allowsSorting: state.allowsSorting,
            resizable: inResizableFrame,
          }),
          className,
        )
      }
    >
      {(state) => {
        const resolvedChildren = typeof children === 'function' ? children(state) : children;
        const { content, resizers } = splitColumnChildren(resolvedChildren);
        const hasResizer = inResizableFrame && resizers.length > 0;

        const label = (
          <span className={tableColumnContentVariants({ resizable: inResizableFrame })}>
            {content}
            {state.allowsSorting ? (
              <span className={state.sortDirection ? '' : 'invisible'}>
                <SortIndicator direction={state.sortDirection} />
              </span>
            ) : null}
          </span>
        );

        if (hasResizer) {
          return (
            <div className="flex items-stretch">
              {label}
              {resizers}
            </div>
          );
        }

        return label;
      }}
    </AriaColumn>
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
  emptyMessage,
  renderEmptyState,
  ...props
}: TableBodyProps<T>) {
  const { language } = useVeliLanguage();
  return (
    <AriaTableBody
      {...props}
      className={className}
      renderEmptyState={
        renderEmptyState ??
        (() => (
          <div className={tableEmptyVariants()}>
            {emptyMessage === undefined ? tableText[language].empty : emptyMessage}
          </div>
        ))
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
  onDragStartCapture?: React.DragEventHandler<HTMLTableRowElement>;
}

export function TableRow<T = unknown>({
  className,
  children,
  onDragStartCapture,
  onPointerDownCapture,
  ...props
}: TableRowProps<T>) {
  const { selectionBehavior, selectionMode, allowsDragging } = useTableOptions();
  const { language } = useVeliLanguage();
  const showSelection = selectionBehavior === 'toggle' && selectionMode === 'multiple';
  const dragFromHandleRef = React.useRef(false);
  const rowRef = React.useRef<HTMLTableRowElement>(null);

  const handlePointerDownCapture = React.useCallback(
    (event: React.PointerEvent<HTMLTableRowElement>) => {
      if (allowsDragging) {
        dragFromHandleRef.current =
          (event.target as HTMLElement).closest('[data-drag-handle]') != null;
      }
      onPointerDownCapture?.(event);
    },
    [allowsDragging, onPointerDownCapture],
  );

  React.useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const handleDragStartCapture = (event: DragEvent) => {
      if (allowsDragging && !dragFromHandleRef.current) {
        event.preventDefault();
        event.stopPropagation();
      }
      onDragStartCapture?.(event as unknown as React.DragEvent<HTMLTableRowElement>);
    };

    row.addEventListener('dragstart', handleDragStartCapture, true);
    return () => row.removeEventListener('dragstart', handleDragStartCapture, true);
  }, [allowsDragging, onDragStartCapture]);

  return (
    <AriaRow
      ref={rowRef}
      {...props}
      onPointerDownCapture={handlePointerDownCapture}
      className={() => twMerge(tableRowVariants(), 'group/row', className)}
    >
      {allowsDragging ? (
        <AriaCell className={tableDragCellClassName} data-drag-handle>
          <AriaButton
            slot="drag"
            className="inline-flex rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <DotsSixVerticalIcon aria-hidden="true" className="size-4 text-icon-base-muted" />
          </AriaButton>
        </AriaCell>
      ) : null}
      {showSelection ? (
        <AriaCell className={tableCellVariants()}>
          <Checkbox
            slot="selection"
            size="md"
            className="flex w-fit"
            aria-label={tableText[language].selectRow}
          />
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
