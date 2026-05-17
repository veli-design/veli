import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '@tradenetcorp/coral-ui/switch';

/**
 * A switch allows a user to turn a setting on or off.
 * Built with `react-aria-components` for maximum accessibility.
 */
const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    isSelected: {
      control: 'boolean',
    },
    isDisabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    children: 'Low power mode',
  },
};

/**
 * Showcases all size variants of the Switch component.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Small (sm)
        </span>
        <div className="flex items-center gap-4">
          <Switch size="sm">Off</Switch>
          <Switch size="sm" defaultSelected>
            On
          </Switch>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Medium (md)
        </span>
        <div className="flex items-center gap-4">
          <Switch size="md">Off</Switch>
          <Switch size="md" defaultSelected>
            On
          </Switch>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Large (lg)
        </span>
        <div className="flex items-center gap-4">
          <Switch size="lg">Off</Switch>
          <Switch size="lg" defaultSelected>
            On
          </Switch>
        </div>
      </div>
    </div>
  ),
};

export const RootClassName: Story = {
  render: () => (
    <div className="grid gap-[12px]">
      <Switch className="ml-[24px]">Indented item</Switch>
      <Switch className="justify-self-start" defaultSelected>
        Grid item
      </Switch>
    </div>
  ),
};

/**
 * Demonstrates the interactive and non-interactive states of the Switch component.
 */
export const StatesAudit: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Interaction States (Off)
        </span>
        <div className="flex items-center gap-12">
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-text-default-muted">Default</span>
            <Switch>Switch</Switch>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-text-default-muted">
              Disabled
            </span>
            <Switch isDisabled>Switch</Switch>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Interaction States (On)
        </span>
        <div className="flex items-center gap-12">
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-text-default-muted">Default</span>
            <Switch defaultSelected>Switch</Switch>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-text-default-muted">
              Disabled
            </span>
            <Switch defaultSelected isDisabled>
              Switch
            </Switch>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * A simple example showing how to use the Switch with a label.
 */
export const WithLabel: Story = {
  args: {
    children: 'Notifications',
    defaultSelected: true,
  },
};
