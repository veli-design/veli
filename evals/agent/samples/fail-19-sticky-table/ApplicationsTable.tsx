import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@veli-design/react/table';

const applications = Array.from({ length: 50 }, (_, index) => ({
  id: `app-${index + 1}`,
  name: `Application ${index + 1}`,
  status: 'Submitted',
}));

export function ApplicationsTable() {
  return (
    <Table aria-label="Applications" stickyHeader>
      <TableHeader>
        <TableColumn isRowHeader>Name</TableColumn>
        <TableColumn>Status</TableColumn>
      </TableHeader>
      <TableBody items={applications}>
        {(application) => (
          <TableRow id={application.id}>
            <TableCell>{application.name}</TableCell>
            <TableCell>{application.status}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
