import { useMemo, useState } from 'react';
import {
  Table,
  type Selection,
  type SortDescriptor,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@veli-design/react/table';
import { VeliProvider, useVeliLanguage } from '@veli-design/react/provider';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';

const copy = {
  en: {
    label: 'Permit applications',
    name: 'Name',
    status: 'Status',
    rows: [
      { id: 'tourism', name: 'Tourism licence', status: 'Approved' },
      { id: 'fishing', name: 'Fishing permit', status: 'Pending' },
      { id: 'business', name: 'Business registration', status: 'Rejected' },
    ],
  },
  dv: {
    label: 'ހުއްދައަށް އެދޭ އެޕްލިކޭޝަންތައް',
    name: 'ނަން',
    status: 'ޙާލަތު',
    rows: [
      { id: 'tourism', name: 'ފަތުރުވެރިކަމުގެ ލައިސަންސް', status: 'ފާސްކުރެވިފައި' },
      { id: 'fishing', name: 'މަސްވެރިކަން ކުރުމުގެ ހުއްދަ', status: 'ޕެންޑިންގ' },
      { id: 'business', name: 'ވިޔަފާރި ރަޖިސްޓްރީކުރުން', status: 'ރިޖެކްޓްކުރެވިފައި' },
    ],
  },
};

export function TableSelectionDemo() {
  const text = copy[useVeliLanguage().language];
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['fishing']));
  return (
    <Table
      aria-label={text.label}
      selectionMode="multiple"
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}
      disabledKeys={['business']}
    >
      <Table.Header>
        <Table.Column isRowHeader>{text.name}</Table.Column>
        <Table.Column>{text.status}</Table.Column>
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
}

export function TableSortingDemo() {
  const text = copy[useVeliLanguage().language];
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'name',
    direction: 'ascending',
  });
  const rows = useMemo(
    () =>
      [...text.rows].sort((a, b) => {
        const column = sortDescriptor.column as 'name' | 'status';
        const result = a[column].localeCompare(b[column]);
        return sortDescriptor.direction === 'descending' ? -result : result;
      }),
    [text.rows, sortDescriptor],
  );
  return (
    <Table aria-label={text.label} sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor}>
      <Table.Header>
        <Table.Column id="name" isRowHeader allowsSorting>
          {text.name}
        </Table.Column>
        <Table.Column id="status" allowsSorting>
          {text.status}
        </Table.Column>
      </Table.Header>
      <Table.Body items={rows}>
        {(item) => (
          <Table.Row id={item.id}>
            <Table.Cell>{item.name}</Table.Cell>
            <Table.Cell>{item.status}</Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  );
}

export function TableResizingDemo() {
  const text = copy[useVeliLanguage().language];
  return (
    <Table.ResizableContainer>
      <Table aria-label={text.label}>
        <Table.Header>
          <Table.Column isRowHeader defaultWidth={280} minWidth={160} maxWidth={400}>
            {text.name}
            <Table.ColumnResizer />
          </Table.Column>
          <Table.Column>{text.status}</Table.Column>
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
    </Table.ResizableContainer>
  );
}

export function TableEmptyDemo() {
  const text = copy[useVeliLanguage().language];
  return (
    <Table aria-label={text.label}>
      <Table.Header>
        <Table.Column isRowHeader>{text.name}</Table.Column>
        <Table.Column>{text.status}</Table.Column>
      </Table.Header>
      <Table.Body items={[]}>
        {(item: { id: string; name: string; status: string }) => (
          <Table.Row id={item.id}>
            <Table.Cell>{item.name}</Table.Cell>
            <Table.Cell>{item.status}</Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  );
}

export function TableRtlDemo() {
  const [language, setLanguage] = useState('Dhivehi');
  return (
    <DocsPreview
      codeKey={`table-language-${language === 'Dhivehi' ? 'dv' : 'en'}`}
      controls={
        <DocsPreviewOption
          label="Language"
          value={language}
          options={['English', 'Dhivehi']}
          onChange={setLanguage}
        />
      }
    >
      <VeliProvider language={language === 'Dhivehi' ? 'dv' : 'en'}>
        <TableSelectionDemo />
      </VeliProvider>
    </DocsPreview>
  );
}

type TableDocsRow = {
  id: string;
  name: string;
  department: string;
  status: string;
};

type TableDocsText = {
  ariaLabel: string;
  columns: {
    name: string;
    department: string;
    status: string;
  };
  rows: TableDocsRow[];
};

const tableDocsText = {
  en: {
    ariaLabel: 'Permit applications',
    columns: {
      name: 'Name',
      department: 'Department',
      status: 'Status',
    },
    rows: [
      { id: '1', name: 'Tourism licence', department: 'Tourism', status: 'Approved' },
      { id: '2', name: 'Fishing permit', department: 'Fisheries', status: 'Pending' },
      { id: '3', name: 'Business registration', department: 'Commerce', status: 'Rejected' },
    ],
  },
  dv: {
    ariaLabel: 'ހުއްދައަށް އެދޭ އެޕްލިކޭޝަންތައް',
    columns: {
      name: 'ނަން',
      department: 'ޑިޕާޓްމަންޓް',
      status: 'ޙާލަތު',
    },
    rows: [
      {
        id: '1',
        name: 'ފަތުރުވެރިކަމުގެ ލައިސަންސް',
        department: 'ފަތުރުވެރިކަން',
        status: 'ފާސްކުރެވިފައި',
      },
      {
        id: '2',
        name: 'މަސްވެރިކަން ކުރުމުގެ ހުއްދަ',
        department: 'މަސްވެރިކަން',
        status: 'ޕެންޑިންގ',
      },
      {
        id: '3',
        name: 'ވިޔަފާރި ރަޖިސްޓްރީކުރުން',
        department: 'ވިޔަފާރި',
        status: 'ރިޖެކްޓްކުރެވިފައި',
      },
    ],
  },
} satisfies Record<'en' | 'dv', TableDocsText>;

export function TableUsageDemo() {
  const { direction } = useVeliLanguage();
  const text = tableDocsText[direction === 'rtl' ? 'dv' : 'en'];

  return (
    <div className="max-w-2xl">
      <Table aria-label={text.ariaLabel}>
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
}
