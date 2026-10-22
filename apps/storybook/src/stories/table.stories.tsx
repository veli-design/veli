import { useEffect, useMemo, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import type { Selection, SortDescriptor } from '@tradenetcorp/veli-ui/table';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableResizableContainer,
  TableColumnResizer,
  TableRow,
  useDragAndDrop,
} from '@tradenetcorp/veli-ui/table';

type PermitRow = {
  id: string;
  name: string;
  department: string;
  status: string;
  updated: string;
};

type TableStoryText = {
  ariaLabels: {
    permitApplications: string;
    sortablePermits: string;
    selectablePermits: string;
    resizablePermits: string;
    reorderablePermits: string;
  };
  columns: {
    name: string;
    department: string;
    status: string;
    updated: string;
  };
  rows: PermitRow[];
};

type TableLanguage = 'en' | 'dv';
type TableSelectionMode = 'none' | 'single' | 'multiple';
type TableSelectionBehavior = 'toggle' | 'replace';
type TableStoryArgs = {
  'aria-label': string;
  className?: string;
  stickyHeader: boolean;
  allowsSorting: boolean;
  selectionMode: TableSelectionMode;
  selectionBehavior: TableSelectionBehavior;
  disabledKeys: string[];
  disabledBehavior: 'selection' | 'all';
  disallowEmptySelection: boolean;
  empty: boolean;
  emptyMessage?: string;
  renderEmptyState?: () => React.ReactNode;
  onRowAction?: (key: React.Key) => void;
};

const tableText = {
  en: {
    ariaLabels: {
      permitApplications: 'Permit applications',
      sortablePermits: 'Sortable permits',
      selectablePermits: 'Selectable permits',
      resizablePermits: 'Resizable permits',
      reorderablePermits: 'Reorderable permits',
    },
    columns: {
      name: 'Name',
      department: 'Department',
      status: 'Status',
      updated: 'Updated',
    },
    rows: [
      {
        id: '1',
        name: 'Tourism licence',
        department: 'Tourism',
        status: 'Approved',
        updated: '12 Mar 2026',
      },
      {
        id: '2',
        name: 'Fishing permit',
        department: 'Fisheries',
        status: 'Pending',
        updated: '10 Mar 2026',
      },
      {
        id: '3',
        name: 'Business registration',
        department: 'Commerce',
        status: 'Rejected',
        updated: '8 Mar 2026',
      },
      {
        id: '4',
        name: 'Vehicle import',
        department: 'Transport',
        status: 'Approved',
        updated: '5 Mar 2026',
      },
      {
        id: '5',
        name: 'Health clearance',
        department: 'Health',
        status: 'Pending',
        updated: '2 Mar 2026',
      },
      {
        id: '6',
        name: 'Building approval',
        department: 'Housing',
        status: 'Draft',
        updated: '1 Mar 2026',
      },
    ],
  },
  dv: {
    ariaLabels: {
      permitApplications: 'ހުއްދައަށް އެދޭ އެޕްލިކޭޝަންތައް',
      sortablePermits: 'ތަރުތީބުކުރެވޭ ހުއްދަތައް',
      selectablePermits: 'ޚިޔާރުކުރެވޭ ހުއްދަތައް',
      resizablePermits: 'ސައިޒު ބަދަލުކުރެވޭ ހުއްދަތައް',
      reorderablePermits: 'އަލުން ތަރުތީބުކުރެވޭ ހުއްދަތައް',
    },
    columns: {
      name: 'ނަން',
      department: 'ޑިޕާޓްމަންޓް',
      status: 'ޙާލަތު',
      updated: 'އަޕްޑޭޓްކުރެވިފައި',
    },
    rows: [
      {
        id: '1',
        name: 'ފަތުރުވެރިކަމުގެ ލައިސަންސް',
        department: 'ފަތުރުވެރިކަން',
        status: 'ފާސްކުރެވިފައި',
        updated: '12 މާރިޗު 2026',
      },
      {
        id: '2',
        name: 'މަސްވެރިކަން ކުރުމުގެ ހުއްދަ',
        department: 'މަސްވެރިކަން',
        status: 'ޕެންޑިންގ',
        updated: '10 މާރިޗު 2026',
      },
      {
        id: '3',
        name: 'ވިޔަފާރި ރަޖިސްޓްރީކުރުން',
        department: 'ވިޔަފާރި',
        status: 'ރިޖެކްޓްކުރެވިފައި',
        updated: '8 މާރިޗު 2026',
      },
      {
        id: '4',
        name: 'އުޅަނދު އެތެރެކުރުން',
        department: 'ޓްރާންސްޕޯޓް',
        status: 'ފާސްކުރެވިފައި',
        updated: '5 މާރިޗު 2026',
      },
      {
        id: '5',
        name: 'ހެލްތު ކްލިއަރެންސް',
        department: 'ޞިއްޙަތު',
        status: 'ޕެންޑިންގ',
        updated: '2 މާރިޗު 2026',
      },
      {
        id: '6',
        name: 'ޢިމާރާތްކުރުމުގެ ހުއްދަ',
        department: 'ހައުސިންގ',
        status: 'ޑްރާފްޓް',
        updated: '1 މާރިޗު 2026',
      },
    ],
  },
} satisfies Record<TableLanguage, TableStoryText>;

const tableArgText = {
  'aria-label': {
    en: tableText.en.ariaLabels.permitApplications,
    dv: tableText.dv.ariaLabels.permitApplications,
  },
} as const;

type TableArgTextKey = keyof typeof tableArgText;

const useTableLanguage = (): TableLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useTableText = () => {
  const language = useTableLanguage();

  return tableText[language];
};

const getLocalizedTableArgText = (
  key: TableArgTextKey,
  value: unknown,
  language: TableLanguage,
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return tableArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(tableArgText[key]);

  if (localizedValues.includes(value)) {
    return tableArgText[key][language];
  }

  return value;
};

const getRowsByIds = (rows: readonly PermitRow[], ids: readonly string[]) =>
  ids.map((id) => rows.find((row) => row.id === id)).filter((row): row is PermitRow => row != null);

const meta = {
  title: 'Components/Table',
  component: Table,
  subcomponents: {
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    TableResizableContainer,
    TableColumnResizer,
  },
  parameters: {
    layout: 'padded',
    controls: { sort: 'none' },
    docs: {
      description: {
        component:
          'Compose Table.Header, Table.Column, Table.Body, Table.Row and Table.Cell (also available as named exports). Figma examples are compositions, not size or appearance variants. Use the provider toolbar to check light, dark, system and Dhivehi RTL. Sorting is owned by the caller; allowsSorting belongs to each column. Resizing and reordering are opt-in compositions.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const language: TableLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs<TableStoryArgs>();
      const ariaLabel = args['aria-label'];

      useEffect(() => {
        const localizedAriaLabel = getLocalizedTableArgText('aria-label', ariaLabel, language);

        if (ariaLabel !== localizedAriaLabel) {
          updateArgs?.({ 'aria-label': localizedAriaLabel });
        }
      }, [ariaLabel, language, updateArgs]);

      return <Story />;
    },
  ],
  args: {
    'aria-label': tableText.en.ariaLabels.permitApplications,
    className: '',
    stickyHeader: false,
    allowsSorting: false,
    selectionMode: 'none',
    selectionBehavior: 'toggle',
    disabledKeys: [],
    disabledBehavior: 'all',
    disallowEmptySelection: false,
    empty: false,
    emptyMessage: undefined,
    onRowAction: undefined,
  },
  argTypes: {
    disabledBehavior: {
      control: 'select',
      options: ['selection', 'all'],
      description: 'Disable only selection, or all interactions on disabledKeys.',
      table: { category: 'Selection' },
    },
    disallowEmptySelection: { control: 'boolean', table: { category: 'Selection' } },
    empty: {
      control: 'boolean',
      description: 'Story-only: supply an empty items collection.',
      table: { category: 'Demo' },
    },
    emptyMessage: {
      control: 'text',
      description:
        'Table.Body fallback when items is empty. Undefined uses the localized default; renderEmptyState takes precedence.',
      table: { category: 'Body' },
    },
    renderEmptyState: {
      control: false,
      description: 'Table.Body callback for a custom empty state.',
      table: { category: 'Body' },
    },
    onRowAction: {
      control: false,
      description: 'Row activation callback; use Enter or a pointer to activate a row.',
      table: { category: 'Events' },
    },
    'aria-label': {
      control: 'text',
      description: 'Accessible name for the table.',
    },
    className: {
      control: 'text',
      description: 'Optional classes merged onto the table element.',
    },
    stickyHeader: {
      control: 'boolean',
      description: 'Keeps header cells sticky while the table scrolls.',
    },
    allowsSorting: {
      control: 'boolean',
      description: 'Story control that enables sortable columns for the demo data.',
    },
    selectionMode: {
      control: 'select',
      options: ['none', 'single', 'multiple'],
      description: 'Enables row selection for the demo table.',
    },
    selectionBehavior: {
      control: 'select',
      options: ['toggle', 'replace'],
      description: 'React Aria table selection behavior.',
    },
    disabledKeys: {
      control: 'object',
      description: 'Row ids to disable, for example ["3"].',
    },
  },
} satisfies Meta<TableStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const text = useTableText();
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
      column: 'name',
      direction: 'ascending',
    });
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['2']));
    const selectionMode = args.selectionMode === 'none' ? undefined : args.selectionMode;
    const disabledKeys =
      Array.isArray(args.disabledKeys) && args.disabledKeys.length > 0
        ? args.disabledKeys
        : undefined;
    const rows = useMemo(() => {
      if (!args.allowsSorting) {
        return text.rows;
      }

      return [...text.rows].sort((a, b) => {
        const column = sortDescriptor.column as keyof PermitRow;
        const first = a[column];
        const second = b[column];
        const cmp = String(first).localeCompare(String(second));
        return sortDescriptor.direction === 'descending' ? -cmp : cmp;
      });
    }, [args.allowsSorting, sortDescriptor, text.rows]);

    return (
      <div className="w-full max-w-4xl">
        <Table
          aria-label={args['aria-label']}
          className={args.className || undefined}
          stickyHeader={args.stickyHeader}
          sortDescriptor={args.allowsSorting ? sortDescriptor : undefined}
          onSortChange={args.allowsSorting ? setSortDescriptor : undefined}
          selectionMode={selectionMode}
          selectionBehavior={selectionMode ? args.selectionBehavior : undefined}
          selectedKeys={selectionMode ? selectedKeys : undefined}
          onSelectionChange={selectionMode ? setSelectedKeys : undefined}
          disabledKeys={disabledKeys}
          disabledBehavior={args.disabledBehavior}
          disallowEmptySelection={args.disallowEmptySelection}
          onRowAction={args.onRowAction}
        >
          <TableHeader>
            <TableColumn id="name" isRowHeader allowsSorting={args.allowsSorting}>
              {text.columns.name}
            </TableColumn>
            <TableColumn id="department" allowsSorting={args.allowsSorting}>
              {text.columns.department}
            </TableColumn>
            <TableColumn id="status" allowsSorting={args.allowsSorting}>
              {text.columns.status}
            </TableColumn>
            <TableColumn id="updated" allowsSorting={args.allowsSorting}>
              {text.columns.updated}
            </TableColumn>
          </TableHeader>
          <TableBody
            items={args.empty ? [] : rows}
            emptyMessage={args.emptyMessage}
            renderEmptyState={args.renderEmptyState}
          >
            {(item) => (
              <TableRow id={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.department}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.updated}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  },
};

export const Sortable: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const column = canvas.getAllByRole('columnheader')[0];
    await expect(column).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(column);
    await expect(column).toHaveAttribute('aria-sort', 'descending');
    column.focus();
    await userEvent.keyboard('{Enter}');
    await expect(column).toHaveAttribute('aria-sort', 'ascending');
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Controlled sortDescriptor and onSortChange. The caller sorts items; Table does not reorder data automatically.',
      },
    },
  },
  render: () => {
    const text = useTableText();
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
      column: 'name',
      direction: 'ascending',
    });

    const sortedRows = useMemo(() => {
      return [...text.rows].sort((a, b) => {
        const column = sortDescriptor.column as keyof PermitRow;
        const first = a[column];
        const second = b[column];
        const cmp = String(first).localeCompare(String(second));
        return sortDescriptor.direction === 'descending' ? -cmp : cmp;
      });
    }, [sortDescriptor, text.rows]);

    return (
      <div className="w-full max-w-4xl">
        <Table
          aria-label={text.ariaLabels.sortablePermits}
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          stickyHeader
        >
          <TableHeader>
            <TableColumn id="name" isRowHeader allowsSorting>
              {text.columns.name}
            </TableColumn>
            <TableColumn id="department" allowsSorting>
              {text.columns.department}
            </TableColumn>
            <TableColumn id="status" allowsSorting>
              {text.columns.status}
            </TableColumn>
            <TableColumn id="updated" allowsSorting>
              {text.columns.updated}
            </TableColumn>
          </TableHeader>
          <TableBody items={sortedRows}>
            {(item) => (
              <TableRow id={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.department}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.updated}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  },
};

export const WithSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkboxes = canvas.getAllByRole('checkbox');
    await expect(checkboxes[3]).toBeDisabled();
    await userEvent.click(checkboxes[0]);
    for (const checkbox of checkboxes.slice(1)) {
      if (!checkbox.hasAttribute('disabled')) await expect(checkbox).toBeChecked();
    }
    await userEvent.click(checkboxes[0]);
    for (const checkbox of checkboxes.slice(1)) await expect(checkbox).not.toBeChecked();
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Controlled multiple selection. Toggle behavior inserts selection cells automatically. The third row is disabled.',
      },
    },
  },
  render: () => {
    const text = useTableText();
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['2']));

    return (
      <div className="w-full max-w-4xl">
        <Table
          aria-label={text.ariaLabels.selectablePermits}
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          disabledKeys={['3']}
        >
          <TableHeader>
            <TableColumn isRowHeader>{text.columns.name}</TableColumn>
            <TableColumn>{text.columns.department}</TableColumn>
            <TableColumn>{text.columns.status}</TableColumn>
          </TableHeader>
          <TableBody items={text.rows}>
            {(item) => (
              <TableRow id={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.department}</TableCell>
                <TableCell>{item.status}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  },
};

export const ResizableColumns: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getAllByRole('slider')[0];
    const initial = Number((slider as HTMLInputElement).value);
    // Enter the grid first; React Aria owns focus within its composite widgets.
    await userEvent.click(canvas.getAllByRole('columnheader')[0]);
    await userEvent.keyboard('{Enter}');
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(Number((slider as HTMLInputElement).value)).not.toBe(initial);
    await userEvent.keyboard('{Enter}');
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Wrap Table in TableResizableContainer. Put TableColumnResizer directly in each resizable column. Focus a handle, press Enter, resize with the horizontal arrow keys, then Enter to finish. Column minWidth/maxWidth constrain resizing.',
      },
    },
  },
  render: () => {
    const text = useTableText();

    return (
      <div className="w-full max-w-4xl">
        <TableResizableContainer>
          <Table aria-label={text.ariaLabels.resizablePermits}>
            <TableHeader>
              <TableColumn isRowHeader defaultWidth={220} minWidth={160}>
                {text.columns.name}
                <TableColumnResizer />
              </TableColumn>
              <TableColumn defaultWidth={180} minWidth={140}>
                {text.columns.department}
                <TableColumnResizer />
              </TableColumn>
              <TableColumn defaultWidth={140}>{text.columns.status}</TableColumn>
            </TableHeader>
            <TableBody items={text.rows}>
              {(item) => (
                <TableRow id={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell>{item.status}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableResizableContainer>
      </div>
    );
  },
};

export const DragAndDrop: Story = {
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const firstRow = canvas.getAllByRole('row')[1];
    const originalName = canvas.getAllByRole('rowheader')[0].textContent;
    firstRow.focus();
    await userEvent.keyboard(globals.language === 'dv' ? '{ArrowLeft}' : '{ArrowRight}');
    await userEvent.keyboard('{Enter}');
    await canvas.findAllByRole('button', { name: /Insert|އިންސަރޓް/ });
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() =>
      expect(canvas.getAllByRole('rowheader')[0]).not.toHaveTextContent(originalName ?? ''),
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'useDragAndDrop is re-exported from React Aria. Supply getItems and onReorder, then update your collection. Focus a drag handle, press Enter, use arrow keys to choose a target, Enter to drop or Escape to cancel. Pointer dragging starts from the handle cell.',
      },
    },
  },
  render: () => {
    const text = useTableText();
    const [orderedIds, setOrderedIds] = useState<string[]>(() =>
      tableText.en.rows.slice(0, 4).map((row) => row.id),
    );
    const items = getRowsByIds(text.rows, orderedIds);

    const { dragAndDropHooks } = useDragAndDrop({
      getItems: (keys) =>
        [...keys].map((key) => {
          const row = items.find((item) => item.id === key);
          return { 'text/plain': row?.name ?? String(key) };
        }),
      onReorder(e) {
        const next = [...items];
        const movedKeys = [...e.keys];
        const sourceIndex = next.findIndex((item) => item.id === movedKeys[0]);
        if (sourceIndex === -1) {
          return;
        }
        const [moved] = next.splice(sourceIndex, 1);
        const targetIndex = next.findIndex((item) => item.id === e.target.key);
        if (targetIndex === -1) {
          next.push(moved);
        } else {
          next.splice(e.target.dropPosition === 'after' ? targetIndex + 1 : targetIndex, 0, moved);
        }
        setOrderedIds(next.map((item) => item.id));
      },
    });

    return (
      <div className="w-full max-w-4xl">
        <Table aria-label={text.ariaLabels.reorderablePermits} dragAndDropHooks={dragAndDropHooks}>
          <TableHeader>
            <TableColumn isRowHeader>{text.columns.name}</TableColumn>
            <TableColumn>{text.columns.department}</TableColumn>
            <TableColumn>{text.columns.status}</TableColumn>
          </TableHeader>
          <TableBody items={items}>
            {(item) => (
              <TableRow id={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.department}</TableCell>
                <TableCell>{item.status}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  },
};

export const Empty: Story = {
  ...Default,
  args: { empty: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('grid')).toBeInTheDocument();
    await expect(canvas.getByRole('grid').querySelector('tbody')).toHaveTextContent(
      /No results found.|ނަތީޖާ/,
    );
  },
};

export const CustomEmptyState: Story = {
  ...Default,
  args: {
    empty: true,
    emptyMessage: 'No matching permits.',
    renderEmptyState: () => <p className="p-8 text-center">Try another search.</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Try another search.')).toBeInTheDocument();
    await expect(canvas.queryByText('No matching permits.')).not.toBeInTheDocument();
  },
};

export const SingleSelection: Story = {
  ...Default,
  args: { selectionMode: 'single', selectionBehavior: 'replace', disabledKeys: ['3'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = canvas.getAllByRole('row');
    await userEvent.click(rows[1]);
    await expect(rows[1]).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.queryByRole('checkbox')).not.toBeInTheDocument();
    await userEvent.click(rows[3]);
    await expect(rows[3]).toHaveAttribute('aria-selected', 'false');
  },
};

export const ReplaceSelection: Story = {
  ...Default,
  args: { selectionMode: 'multiple', selectionBehavior: 'replace', disallowEmptySelection: true },
};

export const UncontrolledSelection: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Use defaultSelectedKeys for initial selection without owning selectedKeys state.',
      },
    },
  },
  render: () => {
    const text = useTableText();
    return (
      <Table
        aria-label={text.ariaLabels.selectablePermits}
        selectionMode="multiple"
        defaultSelectedKeys={['2']}
      >
        <Table.Header>
          <Table.Column isRowHeader>{text.columns.name}</Table.Column>
          <Table.Column>{text.columns.status}</Table.Column>
        </Table.Header>
        <Table.Body items={text.rows}>
          {(item) => (
            <Table.Row id={item.id}>
              <Table.Cell>{item.name}</Table.Cell>
              <Table.Cell>{item.status}</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    );
  },
};

export const RowActions: Story = {
  ...Default,
  args: { onRowAction: fn() },
  play: async ({ canvasElement, args }) => {
    const row = within(canvasElement).getAllByRole('row')[1];
    await userEvent.click(row);
    await expect(args.onRowAction).toHaveBeenCalledWith('1');
    row.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onRowAction).toHaveBeenCalledTimes(2);
  },
};

export const StickyHeader: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Provide a bounded scrolling frame so stickyHeader can stick. className on Table styles the table element, not its automatic outer frame.',
      },
    },
  },
  render: () => {
    const text = useTableText();
    return (
      <TableResizableContainer className="max-h-56 overflow-auto">
        <Table aria-label={text.ariaLabels.permitApplications} stickyHeader>
          <TableHeader>
            <TableColumn isRowHeader>{text.columns.name}</TableColumn>
            <TableColumn>{text.columns.status}</TableColumn>
          </TableHeader>
          <TableBody items={text.rows}>
            {(item) => (
              <TableRow id={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.status}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableResizableContainer>
    );
  },
};

export const NarrowContainer: Story = {
  ...Default,
  args: { className: 'min-w-[640px]' },
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'A minimum table width keeps columns readable. The automatic frame scrolls horizontally within a narrow viewport in either direction.',
      },
    },
  },
};
