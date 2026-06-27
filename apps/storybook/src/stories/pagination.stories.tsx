import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from '@tradenetcorp/veli-ui/pagination';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    maxValue: 10,
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ButtonVariant: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return <Pagination value={page} maxValue={12} onChange={setPage} variant="button" />;
  },
};

export const ExplicitVariant: Story = {
  render: () => {
    const [page, setPage] = useState(5);
    return (
      <Pagination
        value={page}
        maxValue={20}
        onChange={setPage}
        variant="explicit"
        siblingCount={1}
        boundaryCount={1}
      />
    );
  },
};

export const Disabled: Story = {
  render: () => <Pagination defaultValue={3} maxValue={8} variant="explicit" isDisabled />,
};
