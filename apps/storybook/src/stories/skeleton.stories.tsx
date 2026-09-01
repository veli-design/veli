import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '@tradenetcorp/veli-ui/skeleton';

const storyPanelClassName = 'rounded-2xl border border-base-subtle bg-surface-raised p-4';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    className: 'h-4 w-32',
  },
  render: (args) => (
    <div className={storyPanelClassName}>
      <Skeleton {...args} />
    </div>
  ),
};

export const Blocks: Story = {
  render: () => (
    <div className={`${storyPanelClassName} flex w-[320px] flex-col gap-4`}>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-5 w-12 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-2 w-3/4 rounded-xs" />
      <Skeleton className="h-2 w-full rounded-xs" />
      <Skeleton className="h-2 w-5/6 rounded-xs" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  ),
};

export const TextContent: Story = {
  render: () => (
    <div className={`${storyPanelClassName} w-[360px] space-y-3`}>
      <Skeleton className="h-5 w-2/5 rounded-xs" />
      <div className="space-y-2">
        <Skeleton className="h-2.5 w-full rounded-xs" />
        <Skeleton className="h-2.5 w-full rounded-xs" />
        <Skeleton className="h-2.5 w-11/12 rounded-xs" />
        <Skeleton className="h-2.5 w-4/5 rounded-xs" />
      </div>
    </div>
  ),
};

export const ListItems: Story = {
  render: () => (
    <div className={`${storyPanelClassName} w-[360px] divide-y divide-base-subtle`}>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-2.5 w-2/5 rounded-xs" />
            <Skeleton className="h-2 w-3/5 rounded-xs" />
          </div>
          <Skeleton className="h-6 w-14 shrink-0 rounded-md" />
        </div>
      ))}
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div className={`${storyPanelClassName} w-[360px] space-y-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2 rounded-xs" />
          <Skeleton className="h-2.5 w-3/4 rounded-xs" />
        </div>
        <Skeleton className="size-8 shrink-0 rounded-md" />
      </div>
      <Skeleton className="h-20 w-full rounded-lg" />
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-2.5 w-1/3 rounded-xs" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  ),
};

export const StatGrid: Story = {
  render: () => (
    <div className="grid w-[480px] grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className={`${storyPanelClassName} space-y-2 p-3`}>
          <Skeleton className="h-2 w-2/3 rounded-xs" />
          <Skeleton className="h-6 w-1/2 rounded-xs" />
          <Skeleton className="h-2 w-4/5 rounded-xs" />
        </div>
      ))}
    </div>
  ),
};

export const TableRows: Story = {
  render: () => (
    <div className={`${storyPanelClassName} w-[640px] overflow-hidden p-0`}>
      <div className="flex items-center gap-4 border-b border-base-subtle px-4 py-3">
        <Skeleton className="h-2.5 w-24 rounded-xs" />
        <Skeleton className="h-2.5 w-32 rounded-xs" />
        <Skeleton className="h-2.5 w-20 rounded-xs" />
        <Skeleton className="ms-auto h-2.5 w-16 rounded-xs" />
      </div>
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-base-subtle px-4 py-3 last:border-b-0"
        >
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <Skeleton className="h-2.5 w-28 rounded-xs" />
          <Skeleton className="h-2.5 w-36 rounded-xs" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="ms-auto h-2.5 w-12 rounded-xs" />
        </div>
      ))}
    </div>
  ),
};

export const PageHeader: Story = {
  render: () => (
    <div className={`${storyPanelClassName} w-[640px] space-y-4`}>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-2.5 w-16 rounded-xs" />
        <Skeleton className="h-2.5 w-2 rounded-xs" />
        <Skeleton className="h-2.5 w-24 rounded-xs" />
      </div>
      <Skeleton className="h-7 w-2/5 rounded-xs" />
      <Skeleton className="h-2.5 w-3/5 rounded-xs" />
      <div className="flex flex-wrap gap-2 pt-1">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  ),
};
