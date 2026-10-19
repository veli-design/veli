import { Badge } from '@tradenetcorp/veli-ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@tradenetcorp/veli-ui/table';
import { Tabs, type TabsItem } from '@tradenetcorp/veli-ui/tabs';

const applications = [
  { id: 1, name: 'Harbour permit', status: 'Pending' },
  { id: 2, name: 'Trade licence', status: 'Approved' },
];

function ApplicationsTable() {
  return (
    <Table aria-label="Applications">
      <TableHeader>
        <TableColumn isRowHeader>Application</TableColumn>
        <TableColumn>Status</TableColumn>
      </TableHeader>
      <TableBody items={applications}>
        {(application) => (
          <TableRow id={application.id}>
            <TableCell>{application.name}</TableCell>
            <TableCell>
              <Badge intent={application.status === 'Approved' ? 'positive' : 'cautious'}>
                {application.status}
              </Badge>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

const items = [
  { id: 'active', label: 'Active', panel: <ApplicationsTable /> },
  { id: 'archived', label: 'Archived', panel: <p>No archived applications.</p> },
] satisfies readonly [TabsItem, TabsItem, ...TabsItem[]];

export function ApplicationTabs() {
  return <Tabs listAriaLabel="Application status" items={items} />;
}
