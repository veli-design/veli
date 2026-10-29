import { Table, type Selection, type SortDescriptor, type SortDirection } from './table.js';

const selection: Selection = new Set(['permit']);
const direction: SortDirection = 'ascending';
const sort: SortDescriptor = { column: 'name', direction };
export const supportedTable = (
  <Table.ResizableContainer onResize={() => {}}>
    <Table aria-label="Permits" selectedKeys={selection} sortDescriptor={sort} stickyHeader>
      <Table.Header>
        <Table.Column id="name" isRowHeader allowsSorting minWidth={160}>
          {({ sortDirection }) => (
            <>
              {sortDirection}
              <Table.ColumnResizer />
            </>
          )}
        </Table.Column>
      </Table.Header>
      <Table.Body items={[{ id: 'permit', name: 'Tourism licence' }]}>
        {(item) => (
          <Table.Row id={item.id}>
            <Table.Cell>{({ isFocused }) => (isFocused ? item.name : item.name)}</Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  </Table.ResizableContainer>
);
// @ts-expect-error Table has no public size variant.
export const invalidSize = <Table size="sm" />;
// @ts-expect-error Sorting is enabled per column, not on Table.
export const invalidSorting = <Table allowsSorting />;
// @ts-expect-error Veli accepts string classes, not React Aria state functions.
export const invalidClass = <Table className={() => 'table'} />;
// @ts-expect-error Inline style is excluded from the public API.
export const invalidStyle = <Table style={{ width: 100 }} />;
export const invalidHeader = (
  <Table.Header>
    {/* @ts-expect-error Header composition uses explicit columns. */}
    {(item: { name: string }) => <Table.Column>{item.name}</Table.Column>}
  </Table.Header>
);
