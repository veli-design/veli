import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { Pagination, type PaginationProps } from '@tradenetcorp/veli-ui/pagination';

type PaginationStoryArgs = PaginationProps;
type UpdatePaginationArgs = (args: Partial<PaginationStoryArgs>) => void;

function getClampedPage(value: number | undefined, maxValue: number) {
  if (value === undefined) {
    return undefined;
  }

  return Math.min(Math.max(value, 1), Math.max(maxValue, 1));
}

function ControlledPaginationPreview({
  args,
  updateArgs,
}: {
  args: PaginationStoryArgs;
  updateArgs: UpdatePaginationArgs;
}) {
  const maxValue = Math.max(args.maxValue, 1);
  const initialValue = getClampedPage(args.value ?? args.defaultValue ?? 1, maxValue) ?? 1;
  const [page, setPage] = useState(initialValue);

  const handleChange = (nextPage: number) => {
    setPage(nextPage);
    updateArgs({ value: nextPage });
    args.onChange?.(nextPage);
  };

  return (
    <Pagination
      {...args}
      value={page}
      maxValue={maxValue}
      onChange={handleChange}
      onPrevious={args.onPrevious}
      onNext={args.onNext}
    />
  );
}

function renderControlledPagination(args: PaginationStoryArgs) {
  const [, updateArgs] = useArgs();
  const maxValue = Math.max(args.maxValue, 1);
  const value = getClampedPage(args.value ?? args.defaultValue ?? 1, maxValue) ?? 1;

  return (
    <ControlledPaginationPreview
      key={[
        value,
        maxValue,
        args.variant,
        args.siblingCount,
        args.boundaryCount,
        args.isDisabled,
      ].join('-')}
      args={args}
      updateArgs={updateArgs}
    />
  );
}

function renderUncontrolledPagination(args: PaginationStoryArgs) {
  const paginationProps = { ...args };
  const maxValue = Math.max(args.maxValue, 1);
  delete paginationProps.value;

  return (
    <Pagination
      key={[
        args.defaultValue,
        maxValue,
        args.variant,
        args.siblingCount,
        args.boundaryCount,
        args.isDisabled,
      ].join('-')}
      {...paginationProps}
      maxValue={maxValue}
    />
  );
}

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Pagination supports compact previous/next controls and explicit page-number navigation with sibling, boundary, disabled, controlled, and uncontrolled states.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    'aria-label': 'Pagination',
    value: 5,
    defaultValue: 1,
    maxValue: 20,
    variant: 'explicit',
    siblingCount: 1,
    boundaryCount: 1,
    isDisabled: false,
    className: '',
  },
  argTypes: {
    'aria-label': {
      control: 'text',
      description: 'Accessible label for the pagination navigation landmark.',
    },
    value: {
      control: { type: 'number', min: 1, step: 1 },
      description: 'Controlled current page.',
    },
    defaultValue: {
      control: { type: 'number', min: 1, step: 1 },
      description: 'Initial page for uncontrolled usage.',
    },
    maxValue: {
      control: { type: 'number', min: 1, step: 1 },
      description: 'Total number of pages.',
    },
    variant: {
      control: 'select',
      options: ['button', 'explicit'],
      description: 'Pagination display mode.',
    },
    siblingCount: {
      control: { type: 'number', min: 0, max: 5, step: 1 },
      description: 'Number of pages shown beside the current page in explicit mode.',
    },
    boundaryCount: {
      control: { type: 'number', min: 0, max: 5, step: 1 },
      description: 'Number of pages shown at the start and end in explicit mode.',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Disables all pagination controls.',
    },
    className: {
      control: 'text',
      description: 'Additional class names applied to the root nav.',
    },
    onChange: {
      action: 'changed',
      control: false,
      table: {
        category: 'Events',
      },
    },
    onPrevious: {
      action: 'previous',
      control: false,
      table: {
        category: 'Events',
      },
    },
    onNext: {
      action: 'next',
      control: false,
      table: {
        category: 'Events',
      },
    },
  },
} satisfies Meta<PaginationStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: renderControlledPagination,
};

export const ButtonVariant: Story = {
  args: {
    value: 1,
    maxValue: 12,
    variant: 'button',
  },
  render: renderControlledPagination,
};

export const ExplicitVariant: Story = {
  args: {
    value: 5,
    maxValue: 20,
    variant: 'explicit',
    siblingCount: 1,
    boundaryCount: 1,
  },
  render: renderControlledPagination,
};

export const UncontrolledDefaultValue: Story = {
  args: {
    value: undefined,
    defaultValue: 3,
    maxValue: 8,
    variant: 'explicit',
  },
  argTypes: {
    value: {
      control: false,
      table: {
        disable: true,
      },
    },
  },
  render: renderUncontrolledPagination,
};

export const Disabled: Story = {
  args: {
    value: 3,
    maxValue: 8,
    variant: 'explicit',
    isDisabled: true,
  },
  render: renderControlledPagination,
};
