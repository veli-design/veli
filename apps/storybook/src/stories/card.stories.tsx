import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps } from 'react';
import { Card } from '@tradenetcorp/veli-ui/card';
import { Button } from '@tradenetcorp/veli-ui/button';

type CardPadding = NonNullable<ComponentProps<typeof Card>['padding']>;
type CardElevation = NonNullable<ComponentProps<typeof Card>['elevation']>;

const cardPaddings: CardPadding[] = ['none', 'sm', 'md', 'lg'];
const cardElevations: CardElevation[] = ['none', 'xs', 'sm', 'md', 'lg'];

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    padding: 'md',
    elevation: 'xs',
    interactive: false,
  },
  argTypes: {
    padding: {
      control: 'select',
      options: cardPaddings,
    },
    elevation: {
      control: 'select',
      options: cardElevations,
    },
    interactive: {
      control: 'boolean',
    },
    children: {
      table: { disable: true },
    },
    className: {
      table: { disable: true },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ padding, elevation, interactive }) => (
    <Card className="w-[420px]" padding={padding} elevation={elevation} interactive={interactive}>
      <Card.Header>
        <Card.Title>Permit application</Card.Title>
        <Card.Description>Track progress and required documents.</Card.Description>
      </Card.Header>
      <Card.Content>
        Your application is under review. We will notify you when a decision is ready.
      </Card.Content>
      <Card.Footer>
        <Button intent="secondary" appearance="transparent" size="sm">
          View details
        </Button>
        <Button size="sm">Continue</Button>
      </Card.Footer>
    </Card>
  ),
};

export const ContentOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Header and footer are optional. Put body copy directly inside `Card`, or use `Card.Content` when you want a dedicated body slot.',
      },
    },
  },
  render: ({ padding, elevation, interactive }) => (
    <div className="grid w-[420px] gap-4">
      <Card padding={padding} elevation={elevation} interactive={interactive}>
        Your application is under review. We will notify you when a decision is ready.
      </Card>
      <Card padding={padding} elevation={elevation} interactive={interactive}>
        <Card.Content>
          Same layout using the optional <code>Card.Content</code> slot for the body region.
        </Card.Content>
      </Card>
      <Card padding={padding} elevation={elevation} interactive={interactive}>
        <Card.Header>
          <Card.Title>Permit application</Card.Title>
          <Card.Description>Track progress and required documents.</Card.Description>
        </Card.Header>
        <Card.Content>Header and content only — no footer required.</Card.Content>
      </Card>
    </div>
  ),
};

export const Elevations: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <div className="grid w-[900px] gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cardElevations.map((elevation) => (
        <Card key={elevation} elevation={elevation} padding="sm">
          <Card.Header>
            <Card.Title>Elevation {elevation}</Card.Title>
          </Card.Header>
          <Card.Content>Surface with {elevation} shadow token.</Card.Content>
        </Card>
      ))}
    </div>
  ),
};

export const Interactive: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <Card className="w-[420px]" interactive padding="md">
      <Card.Header action={<Button size="sm">Open</Button>}>
        <Card.Title>Service overview</Card.Title>
        <Card.Description>Hover to preview the raised surface state.</Card.Description>
      </Card.Header>
      <Card.Content>Use interactive cards for navigational tiles in dashboards.</Card.Content>
    </Card>
  ),
};
