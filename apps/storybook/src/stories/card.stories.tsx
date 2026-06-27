import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '@tradenetcorp/veli-ui/card';
import { Button } from '@tradenetcorp/veli-ui/button';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[420px]">
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

export const Elevations: Story = {
  render: () => (
    <div className="grid w-[900px] gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {(['none', 'xs', 'sm', 'md', 'lg'] as const).map((elevation) => (
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
