import { Table } from '@tradenetcorp/veli-ui/table';
import { Tabs } from '@tradenetcorp/veli-ui/tabs';

const applications = [
  { id: 'a1', name: 'Building permit', status: 'In review' },
  { id: 'a2', name: 'Business registration', status: 'Submitted' },
];

function ActiveApplications() {
  return (
    <Table aria-label="Active applications">
      <Table.Header>
        <Table.Column isRowHeader>Name</Table.Column>
        <Table.Column>Status</Table.Column>
      </Table.Header>
      <Table.Body items={applications}>
        {(application) => (
          <Table.Row id={application.id}>
            <Table.Cell>{application.name}</Table.Cell>
            <Table.Cell>{application.status}</Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  );
}

export function ApplicationsReview() {
  return (
    <Tabs
      listAriaLabel="Application status"
      items={[
        { id: 'active', label: 'Active', panel: <ActiveApplications /> },
        { id: 'archived', label: 'Archived', panel: <p>No archived applications yet.</p> },
      ]}
    />
  );
}
