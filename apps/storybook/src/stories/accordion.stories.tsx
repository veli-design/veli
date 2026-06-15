import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from '@tradenetcorp/veli-ui/accordion';
import { Button } from '@tradenetcorp/veli-ui/button';

const storyPanelClassName =
  'w-[calc(100vw-2rem)] max-w-[640px] rounded-2xl border border-border-default-subtle bg-bg-surface-raised p-4';

const storyGridClassName =
  'grid w-[calc(100vw-2rem)] max-w-[960px] grid-cols-1 gap-8 md:grid-cols-2';

const storyGridPanelClassName =
  'w-full rounded-2xl border border-border-default-subtle bg-bg-surface-raised p-4';

const accordionItems = [
  {
    id: 'overview',
    label: 'Overview',
    content:
      'Review the permit status, submission date, and assigned reviewer before making changes.',
  },
  {
    id: 'documents',
    label: 'Documents',
    content:
      'Upload supporting files such as identification, proof of address, and payment receipts.',
  },
  {
    id: 'history',
    label: 'History',
    content: 'Track every update, comment, and status change recorded for this application.',
  },
] as const;

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className={storyPanelClassName}>
      <Accordion defaultExpandedKeys={['overview']} items={[...accordionItems]} />
    </div>
  ),
};

export const MultipleExpanded: Story = {
  render: () => (
    <div className={storyPanelClassName}>
      <Accordion
        allowsMultipleExpanded
        defaultExpandedKeys={['overview', 'documents']}
        items={[...accordionItems]}
      />
    </div>
  ),
};

export const Compound: Story = {
  render: () => (
    <div className={storyPanelClassName}>
      <Accordion defaultExpandedKeys={['overview']}>
        <AccordionItem id="overview">
          <AccordionHeader>Overview</AccordionHeader>
          <AccordionPanel>{accordionItems[0].content}</AccordionPanel>
        </AccordionItem>
        <AccordionItem id="documents">
          <AccordionHeader>Documents</AccordionHeader>
          <AccordionPanel>{accordionItems[1].content}</AccordionPanel>
        </AccordionItem>
        <AccordionItem id="history" isDisabled>
          <AccordionHeader>History</AccordionHeader>
          <AccordionPanel>{accordionItems[2].content}</AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyGridClassName}>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Medium (md)
        </span>
        <div className={storyGridPanelClassName}>
          <Accordion size="md" defaultExpandedKeys={['overview']} items={[...accordionItems]} />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Large (lg)
        </span>
        <div className={storyGridPanelClassName}>
          <Accordion size="lg" defaultExpandedKeys={['overview']} items={[...accordionItems]} />
        </div>
      </div>
    </div>
  ),
};

export const Alignment: Story = {
  render: () => (
    <div className={storyGridClassName}>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Left
        </span>
        <div className={storyGridPanelClassName}>
          <Accordion
            alignment="left"
            defaultExpandedKeys={['overview']}
            items={[...accordionItems]}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Right
        </span>
        <div className={storyGridPanelClassName}>
          <Accordion
            alignment="right"
            defaultExpandedKeys={['overview']}
            items={[...accordionItems]}
          />
        </div>
      </div>
    </div>
  ),
};

export const Flushed: Story = {
  render: () => {
    const [flushed, setFlushed] = useState(false);

    return (
      <div className="flex w-[calc(100vw-2rem)] max-w-[640px] flex-col gap-4">
        <Button size="sm" intent="secondary" onPress={() => setFlushed((value) => !value)}>
          {flushed ? 'Turn flushed off' : 'Turn flushed on'}
        </Button>
        <div className={storyPanelClassName}>
          <Accordion
            flushed={flushed}
            defaultExpandedKeys={['overview']}
            items={[...accordionItems]}
          />
        </div>
      </div>
    );
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className={storyGridClassName}>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Medium (md)
        </span>
        <div className={storyGridPanelClassName}>
          <Accordion isSkeleton size="md" alignment="left" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Large (lg)
        </span>
        <div className={storyGridPanelClassName}>
          <Accordion isSkeleton size="lg" alignment="right" />
        </div>
      </div>
    </div>
  ),
};
