import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb, BreadcrumbOverflow, Breadcrumbs } from '@tradenetcorp/veli-ui/breadcrumbs';
import { CaretLeft } from 'phosphor-react';

type BreadcrumbTrailItem = {
  id: string;
  label: string;
  href?: string;
};

type BreadcrumbsPlaygroundArgs = {
  treatment: 'standard' | 'backlink';
  showOverflow: boolean;
  disableSecondCrumb: boolean;
  homeLabel: string;
  secondLabel: string;
  thirdLabel: string;
  currentLabel: string;
};

const breadcrumbTrail: BreadcrumbTrailItem[] = [
  { id: 'home', label: 'Home', href: '#' },
  { id: 'services', label: 'Services', href: '#' },
  { id: 'permits', label: 'Permits', href: '#' },
  { id: 'fishing', label: 'Fishing permit' },
];

const hiddenBacklinkItems = [
  { id: 'menu-two', label: 'Menu Two', href: '#' },
  { id: 'menu-three', label: 'Menu Three', href: '#' },
  { id: 'menu-four', label: 'Menu Four', href: '#' },
];

const meta = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;
type PlaygroundStory = StoryObj<BreadcrumbsPlaygroundArgs>;

export const Playground: PlaygroundStory = {
  args: {
    treatment: 'standard',
    showOverflow: true,
    disableSecondCrumb: false,
    homeLabel: 'Home',
    secondLabel: 'Services',
    thirdLabel: 'Permits',
    currentLabel: 'Fishing permit',
  },
  argTypes: {
    treatment: {
      control: 'select',
      options: ['standard', 'backlink'],
    },
    showOverflow: {
      control: 'boolean',
    },
    disableSecondCrumb: {
      control: 'boolean',
    },
    homeLabel: {
      control: 'text',
    },
    secondLabel: {
      control: 'text',
    },
    thirdLabel: {
      control: 'text',
    },
    currentLabel: {
      control: 'text',
    },
  },
  render: (args) => (
    <div className="w-[560px] rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
      <Breadcrumbs aria-label="Breadcrumb playground">
        {args.treatment === 'backlink' ? (
          <Breadcrumb href="#" tone="accent">
            <CaretLeft aria-hidden size={16} weight="bold" />
            <span>Previous Page</span>
          </Breadcrumb>
        ) : (
          <Breadcrumb href="#">{args.homeLabel}</Breadcrumb>
        )}
        <Breadcrumb href="#" isDisabled={args.disableSecondCrumb}>
          {args.secondLabel}
        </Breadcrumb>
        {args.showOverflow ? (
          <BreadcrumbOverflow items={hiddenBacklinkItems} />
        ) : (
          <Breadcrumb href="#">{args.thirdLabel}</Breadcrumb>
        )}
        <Breadcrumb href="#">Menu Five</Breadcrumb>
        <Breadcrumb>{args.currentLabel}</Breadcrumb>
      </Breadcrumbs>
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
      <Breadcrumbs aria-label="Breadcrumb">
        <Breadcrumb href="#">Home</Breadcrumb>
        <Breadcrumb href="#">Services</Breadcrumb>
        <Breadcrumb href="#">Permits</Breadcrumb>
        <Breadcrumb>Fishing permit</Breadcrumb>
      </Breadcrumbs>
    </div>
  ),
};

export const Variations: Story = {
  render: () => (
    <div className="grid gap-[24px] lg:grid-cols-2">
      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-emphasis">Standard trail</p>
          <Breadcrumbs aria-label="Permit breadcrumb">
            <Breadcrumb href="#">Home</Breadcrumb>
            <Breadcrumb href="#">Applications</Breadcrumb>
            <Breadcrumb href="#">Permits</Breadcrumb>
            <Breadcrumb>New submission</Breadcrumb>
          </Breadcrumbs>
        </div>
      </div>

      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-emphasis">Back link treatment</p>
          <Breadcrumbs aria-label="Back breadcrumb">
            <Breadcrumb href="#" tone="accent">
              <CaretLeft aria-hidden size={16} weight="bold" />
              <span>Previous Page</span>
            </Breadcrumb>
            <Breadcrumb href="#">Menu One</Breadcrumb>
            <BreadcrumbOverflow items={hiddenBacklinkItems} />
            <Breadcrumb href="#">Menu Five</Breadcrumb>
            <Breadcrumb>Menu Active</Breadcrumb>
          </Breadcrumbs>
        </div>
      </div>

      <div className="rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px] lg:col-span-2">
        <div className="space-y-[12px]">
          <p className="type-body-sm-medium text-text-default-emphasis">Disabled crumb</p>
          <Breadcrumbs aria-label="Disabled breadcrumb">
            <Breadcrumb href="#">Home</Breadcrumb>
            <Breadcrumb href="#" isDisabled>
              Archived services
            </Breadcrumb>
            <Breadcrumb>Permit details</Breadcrumb>
          </Breadcrumbs>
        </div>
      </div>
    </div>
  ),
};

export const DataDrivenCollection: Story = {
  render: () => {
    const [currentIndex, setCurrentIndex] = useState(breadcrumbTrail.length - 1);
    const items = breadcrumbTrail.slice(0, currentIndex + 1);

    return (
      <div className="w-[420px] space-y-[12px] rounded-[16px] border border-border-default-subtle bg-bg-surface-raised p-[16px]">
        <Breadcrumbs
          aria-label="Application breadcrumb"
          items={items}
          onAction={(key) => {
            const nextIndex = breadcrumbTrail.findIndex((item) => item.id === key);
            if (nextIndex >= 0) {
              setCurrentIndex(nextIndex);
            }
          }}
        >
          {(item) => <Breadcrumb href={item.href}>{item.label}</Breadcrumb>}
        </Breadcrumbs>
        <p className="type-caption-12-regular text-text-default-muted">
          Select an earlier crumb to jump back in the hierarchy and collapse the trail.
        </p>
      </div>
    );
  },
};
