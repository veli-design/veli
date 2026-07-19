import { useEffect, useMemo, useState } from 'react';
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
  parameters: { layout: 'padded' },
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
  },
  argTypes: {
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
          <TableBody items={rows}>
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
