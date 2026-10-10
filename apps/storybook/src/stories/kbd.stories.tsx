import type { Meta, StoryObj } from '@storybook/react';
import { ArrowFatUpIcon, CommandIcon, OptionIcon } from '@phosphor-icons/react';
import { Kbd, KbdGroup, type KbdVariant } from '@tradenetcorp/veli-ui/kbd';

const variants: KbdVariant[] = ['default', 'inverted'];

const meta = {
  title: 'Components/Kbd',
  component: Kbd,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    children: 'A',
    variant: 'default',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: variants,
    },
    children: {
      control: 'text',
    },
  },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>
        <CommandIcon aria-hidden weight="regular" />
      </Kbd>
      <Kbd>
        <ArrowFatUpIcon aria-hidden weight="regular" />
      </Kbd>
      <Kbd>
        <OptionIcon aria-hidden weight="regular" />
      </Kbd>
      <Kbd>A</Kbd>
      <Kbd>B</Kbd>
      <Kbd>C</Kbd>
    </KbdGroup>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {variants.map((variant) => (
        <KbdGroup key={variant} variant={variant}>
          <Kbd>
            <CommandIcon aria-hidden weight="regular" />
          </Kbd>
          <Kbd>
            <ArrowFatUpIcon aria-hidden weight="regular" />
          </Kbd>
          <Kbd>
            <OptionIcon aria-hidden weight="regular" />
          </Kbd>
          <Kbd>A</Kbd>
          <Kbd>B</Kbd>
          <Kbd>C</Kbd>
        </KbdGroup>
      ))}
    </div>
  ),
};

export const TextKeys: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <KbdGroup>
        <Kbd>E</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Del</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>C</Kbd>
      </KbdGroup>
    </div>
  ),
};

export const SingleKey: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Kbd>Enter</Kbd>
      <Kbd>
        <CommandIcon aria-hidden weight="regular" />
      </Kbd>
    </div>
  ),
};
