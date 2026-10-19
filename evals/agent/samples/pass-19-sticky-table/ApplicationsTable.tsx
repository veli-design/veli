import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@tradenetcorp/veli-ui/table';

const applications = Array.from({ length: 50 }, (_, index) => ({
  id: `app-${index + 1}`,
  name: `Application ${index + 1}`,
  status: index % 2 === 0 ? 'In review' : 'Submitted',
  submitted: `2026-10-${String((index % 28) + 1).padStart(2, '0')}`,
}));

export function ApplicationsTable() {
  return (
    <div className="max-h-[32rem] overflow-y-auto">
      <Table aria-label="Applications" stickyHeader>
        <TableHeader>
          <TableColumn isRowHeader>Name</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Submitted</TableColumn>
        </TableHeader>
        <TableBody items={applications}>
          {(application) => (
            <TableRow id={application.id}>
              <TableCell>{application.name}</TableCell>
              <TableCell>{application.status}</TableCell>
              <TableCell>{application.submitted}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
