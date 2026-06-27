import type { Meta, StoryObj } from '@storybook/react';
import { Info, WarningCircle, CheckCircle } from 'phosphor-react';
import { Alert } from '@tradenetcorp/veli-ui/alert';
import { Button } from '@tradenetcorp/veli-ui/button';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert className="w-[480px]" intent="info" leadingIcon={<Info size={20} weight="fill" />}>
      <Alert.Title>Permit review in progress</Alert.Title>
      <Alert.Description>
        You will receive an email when your application has been processed.
      </Alert.Description>
    </Alert>
  ),
};

export const Intents: Story = {
  render: () => (
    <div className="flex w-[520px] flex-col gap-3">
      <Alert intent="positive" leadingIcon={<CheckCircle size={20} weight="fill" />}>
        <Alert.Title>Payment received</Alert.Title>
        <Alert.Description>Your transaction was completed successfully.</Alert.Description>
      </Alert>
      <Alert intent="warning" leadingIcon={<WarningCircle size={20} weight="fill" />}>
        <Alert.Title>Documents expiring soon</Alert.Title>
        <Alert.Description>Renew your licence before the end of this month.</Alert.Description>
      </Alert>
      <Alert
        intent="danger"
        appearance="outline"
        leadingIcon={<WarningCircle size={20} weight="fill" />}
      >
        <Alert.Title>Submission failed</Alert.Title>
        <Alert.Description>Check the required fields and try again.</Alert.Description>
      </Alert>
    </div>
  ),
};

export const Dismissible: Story = {
  render: () => (
    <Alert
      className="w-[480px]"
      intent="info"
      leadingIcon={<Info size={20} weight="fill" />}
      onDismiss={() => undefined}
    >
      <Alert.Title>System maintenance</Alert.Title>
      <Alert.Description>Services may be unavailable tonight from 22:00–02:00.</Alert.Description>
      <Alert.Actions>
        <Button size="sm" intent="secondary" appearance="transparent">
          View schedule
        </Button>
      </Alert.Actions>
      <Alert.CloseButton />
    </Alert>
  ),
};
