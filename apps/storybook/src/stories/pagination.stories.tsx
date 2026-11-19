import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { useArgs } from 'storybook/internal/preview-api';
import {
  Pagination,
  type PaginationPageProps,
  type PaginationLoadMoreProps,
  type PaginationVariant,
} from '@veli-design/react/pagination';

type PaginationStoryArgs = Omit<PaginationPageProps, 'variant'> &
  Partial<Omit<PaginationLoadMoreProps, 'variant'>> & { variant: PaginationVariant };

const LOAD_MORE_DELAY_MS = 750;

function renderPagination(args: PaginationStoryArgs) {
  const [, updateArgs] = useArgs<PaginationStoryArgs>();
  if (args.variant === 'loadmore') {
    return (
      <Pagination
        variant="loadmore"
        loadedCount={args.loadedCount ?? 12}
        totalCount={args.totalCount ?? 42}
        isLoading={args.isLoading}
        className={args.className}
        aria-label={args['aria-label']}
        onLoadMore={async () => {
          updateArgs({ isLoading: true });
          args.onLoadMore?.();
          await new Promise((resolve) => setTimeout(resolve, LOAD_MORE_DELAY_MS));
          updateArgs({
            loadedCount: Math.min((args.loadedCount ?? 12) + 12, args.totalCount ?? 42),
            isLoading: false,
          });
        }}
      />
    );
  }
  return (
    <Pagination
      variant={args.variant}
      value={args.value}
      defaultValue={args.defaultValue}
      maxValue={args.maxValue}
      siblingCount={args.siblingCount}
      boundaryCount={args.boundaryCount}
      className={args.className}
      aria-label={args['aria-label']}
      onFirst={args.onFirst}
      onPrevious={args.onPrevious}
      onNext={args.onNext}
      onLast={args.onLast}
      onChange={(value) => {
        if (args.value !== undefined) updateArgs({ value });
        args.onChange?.(value);
      }}
    />
  );
}

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    controls: { sort: 'none', exclude: /^on[A-Z]/ },
    docs: {
      description: {
        component:
          'Compact and numbered page navigation, plus item-based load more. Use the provider toolbar for English/Dhivehi and system/light/dark themes. All controls use Veli Button: small for pages, medium for load more.',
      },
    },
  },
  tags: ['autodocs'],
  render: renderPagination,
  args: {
    variant: 'explicit',
    value: 5,
    defaultValue: 1,
    maxValue: 20,
    siblingCount: 1,
    boundaryCount: 1,
    loadedCount: 12,
    totalCount: 42,
    isLoading: false,
    onChange: fn(),
    onFirst: fn(),
    onPrevious: fn(),
    onNext: fn(),
    onLast: fn(),
    onLoadMore: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['button', 'explicit', 'loadmore'],
      table: { category: 'Appearance' },
    },
    className: {
      control: 'text',
      description: 'Additional classes on the root.',
      table: { category: 'Appearance' },
    },
    value: {
      control: { type: 'number', min: 1 },
      description: 'Controlled page. Clear to use defaultValue.',
      if: { arg: 'variant', neq: 'loadmore' },
      table: { category: 'Page navigation' },
    },
    defaultValue: {
      control: { type: 'number', min: 1 },
      description: 'Initial uncontrolled page; applied on mount.',
      if: { arg: 'variant', neq: 'loadmore' },
      table: { category: 'Page navigation' },
    },
    maxValue: {
      control: { type: 'number', min: 1 },
      description: 'Total pages; minimum 1.',
      if: { arg: 'variant', neq: 'loadmore' },
      table: { category: 'Page navigation' },
    },
    siblingCount: {
      control: { type: 'number', min: 0, max: 5 },
      description: 'Adjacent visible pages.',
      if: { arg: 'variant', eq: 'explicit' },
      table: { category: 'Page navigation' },
    },
    boundaryCount: {
      control: { type: 'number', min: 0, max: 5 },
      description: 'Visible pages at each end.',
      if: { arg: 'variant', eq: 'explicit' },
      table: { category: 'Page navigation' },
    },
    loadedCount: {
      control: { type: 'number', min: 0 },
      description: 'Items currently displayed.',
      if: { arg: 'variant', eq: 'loadmore' },
      table: { category: 'Load more' },
    },
    totalCount: {
      control: { type: 'number', min: 0 },
      description: 'Total available items. Zero disables the button.',
      if: { arg: 'variant', eq: 'loadmore' },
      table: { category: 'Load more' },
    },
    isLoading: {
      control: 'boolean',
      description: 'Uses Button’s loading indicator and prevents repeat requests.',
      if: { arg: 'variant', eq: 'loadmore' },
      table: { category: 'Load more' },
    },
    'aria-label': {
      control: 'text',
      description: 'Overrides the localized accessible name.',
      table: { category: 'Accessibility' },
    },
    onChange: {
      control: false,
      if: { arg: 'variant', neq: 'loadmore' },
      table: { category: 'Events' },
    },
    onFirst: {
      control: false,
      if: { arg: 'variant', neq: 'loadmore' },
      table: { category: 'Events' },
    },
    onPrevious: {
      control: false,
      if: { arg: 'variant', neq: 'loadmore' },
      table: { category: 'Events' },
    },
    onNext: {
      control: false,
      if: { arg: 'variant', neq: 'loadmore' },
      table: { category: 'Events' },
    },
    onLast: {
      control: false,
      if: { arg: 'variant', neq: 'loadmore' },
      table: { category: 'Events' },
    },
    onLoadMore: {
      control: false,
      if: { arg: 'variant', eq: 'loadmore' },
      table: { category: 'Events' },
    },
  },
} satisfies Meta<PaginationStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement, args }) => {
    if (args.variant !== 'explicit' || args.value !== 5) return;
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    const next = buttons[buttons.length - 2];
    if (next.matches(':disabled')) return;
    next.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith(6);
    await waitFor(() =>
      expect(canvasElement.querySelector('[aria-current="page"]')).toHaveTextContent('6'),
    );
    if (!next.matches(':disabled')) await expect(next).toHaveFocus();
    await userEvent.click(buttons[1]);
    await expect(args.onPrevious).toHaveBeenLastCalledWith(5);
    await waitFor(() =>
      expect(canvasElement.querySelector('[aria-current="page"]')).toHaveTextContent('5'),
    );
  },
};

export const EllipsisOverflow: Story = {
  args: { value: 23, maxValue: 54 },
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="flex min-h-dvh items-end justify-center px-4 pb-16">
      <Pagination
        variant="explicit"
        maxValue={args.maxValue ?? 54}
        defaultValue={args.value}
        onChange={args.onChange}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const document = canvasElement.ownerDocument;
    const canvas = within(canvasElement);
    const portal = within(document.body);
    const pagination = canvas.getByRole('navigation');
    const triggers = pagination.querySelectorAll<HTMLButtonElement>(
      'button:is([aria-haspopup="true"], [aria-haspopup="menu"])',
    );
    const trigger = triggers[1];
    if (!trigger) throw new Error('The trailing pagination ellipsis did not render.');
    const currentPage = () => pagination.querySelector('[aria-current="page"]');
    const rect = trigger.getBoundingClientRect();
    const coords = { clientX: rect.x + rect.width / 2, clientY: rect.y + rect.height / 2 };

    await userEvent.click(trigger);
    const menu = await portal.findByRole('menu');
    // The open menu must not cover the original click point with an actionable page.
    const releaseTarget = document.elementFromPoint(coords.clientX, coords.clientY);
    expect(releaseTarget?.closest('[role=menuitem]')).toBeNull();
    expect(currentPage()).toHaveTextContent('23');

    const options = within(menu).getAllByRole('menuitem');
    expect(options).toHaveLength(29);
    expect(menu.scrollHeight).toBeGreaterThan(menu.clientHeight);
    const menuRect = menu.getBoundingClientRect();
    expect(menuRect.top).toBeGreaterThanOrEqual(0);
    expect(menuRect.bottom).toBeLessThanOrEqual(rect.top);
    expect(menuRect.height).toBeLessThanOrEqual(280);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(trigger).toHaveFocus();
      expect(portal.queryByRole('menu')).not.toBeInTheDocument();
    });

    await userEvent.keyboard('{Enter}{End}');
    const reopened = await portal.findByRole('menu');
    const pages = within(reopened).getAllByRole('menuitem');
    const last = pages[pages.length - 1];
    expect(last).toHaveFocus();
    await waitFor(() => expect(reopened.scrollTop).toBeGreaterThan(0));
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(currentPage()).toHaveTextContent('53'));
    expect(currentPage()).toHaveFocus();
  },
};

function PaginationVariantsPreview() {
  return (
    <div className="flex max-w-full flex-col items-center gap-8">
      <div className="flex max-w-full flex-col items-center gap-3">
        <p className="type-body-sm-medium text-base-muted">Button</p>
        <Pagination maxValue={13} defaultValue={2} />
      </div>
      <div className="flex max-w-full flex-col items-center gap-3">
        <p className="type-body-sm-medium text-base-muted">Explicit</p>
        <Pagination
          variant="explicit"
          maxValue={13}
          defaultValue={2}
          siblingCount={0}
          boundaryCount={2}
        />
      </div>
      <div className="flex max-w-full flex-col items-center gap-3">
        <p className="type-body-sm-medium text-base-muted">Load more</p>
        <LoadMoreExample />
      </div>
    </div>
  );
}

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => <PaginationVariantsPreview />,
};

function LoadMoreExample({ onLoadMore }: { onLoadMore?: () => void }) {
  const [loaded, setLoaded] = useState(12);
  const [isLoading, setLoading] = useState(false);
  return (
    <Pagination
      variant="loadmore"
      loadedCount={loaded}
      totalCount={42}
      isLoading={isLoading}
      onLoadMore={async () => {
        onLoadMore?.();
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, LOAD_MORE_DELAY_MS));
        setLoaded((count) => Math.min(count + 12, 42));
        setLoading(false);
      }}
    />
  );
}

export const LoadMore: Story = {
  args: { variant: 'loadmore' },
  parameters: { controls: { disable: true } },
  render: (args) => <LoadMoreExample onLoadMore={args.onLoadMore} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    const progress = canvas.getByRole('progressbar');
    const label = button.textContent;
    await expect(progress).toHaveAttribute('aria-valuenow', '12');
    button.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('group')).toHaveAttribute('aria-busy', 'true'));
    await expect(button).toBeDisabled();
    await expect(button).toHaveTextContent(label!);
    await expect(button.querySelector('svg.animate-spin')).toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    await expect(args.onLoadMore).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(progress).toHaveAttribute('aria-valuenow', '24'));
    await expect(button).toBeEnabled();
  },
};
