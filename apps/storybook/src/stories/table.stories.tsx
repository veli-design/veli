import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
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

const rows: PermitRow[] = [
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
];

const meta = {
  title: 'Components/Table',
  component: Table,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <Table aria-label="Permit applications">
        <TableHeader>
          <TableColumn isRowHeader>Name</TableColumn>
          <TableColumn>Department</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Updated</TableColumn>
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
  ),
};

export const Sortable: Story = {
  render: () => {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
      column: 'name',
      direction: 'ascending',
    });

    const sortedRows = useMemo(() => {
      return [...rows].sort((a, b) => {
        const column = sortDescriptor.column as keyof PermitRow;
        const first = a[column];
        const second = b[column];
        const cmp = String(first).localeCompare(String(second));
        return sortDescriptor.direction === 'descending' ? -cmp : cmp;
      });
    }, [sortDescriptor]);

    return (
      <div className="w-full max-w-4xl">
        <Table
          aria-label="Sortable permits"
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          stickyHeader
        >
          <TableHeader>
            <TableColumn id="name" isRowHeader allowsSorting>
              Name
            </TableColumn>
            <TableColumn id="department" allowsSorting>
              Department
            </TableColumn>
            <TableColumn id="status" allowsSorting>
              Status
            </TableColumn>
            <TableColumn id="updated" allowsSorting>
              Updated
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
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['2']));

    return (
      <div className="w-full max-w-4xl">
        <Table
          aria-label="Selectable permits"
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          disabledKeys={['3']}
        >
          <TableHeader>
            <TableColumn isRowHeader>Name</TableColumn>
            <TableColumn>Department</TableColumn>
            <TableColumn>Status</TableColumn>
          </TableHeader>
          <TableBody items={rows}>
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
  render: () => (
    <div className="w-full max-w-4xl">
      <TableResizableContainer>
        <Table aria-label="Resizable permits">
          <TableHeader>
            <TableColumn isRowHeader defaultWidth={220} minWidth={160}>
              Name
              <TableColumnResizer />
            </TableColumn>
            <TableColumn defaultWidth={180} minWidth={140}>
              Department
              <TableColumnResizer />
            </TableColumn>
            <TableColumn defaultWidth={140}>Status</TableColumn>
          </TableHeader>
          <TableBody items={rows}>
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
  ),
};

export const DragAndDrop: Story = {
  render: () => {
    const [items, setItems] = useState(rows.slice(0, 4));

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
        setItems(next);
      },
    });

    return (
      <div className="w-full max-w-4xl">
        <Table aria-label="Reorderable permits" dragAndDropHooks={dragAndDropHooks}>
          <TableHeader>
            <TableColumn isRowHeader>Name</TableColumn>
            <TableColumn>Department</TableColumn>
            <TableColumn>Status</TableColumn>
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
