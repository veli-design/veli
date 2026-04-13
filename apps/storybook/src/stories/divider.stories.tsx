import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from "@tradenetcorp/coral-ui/divider";

const meta = {
  title: "Components/Divider",
  component: Divider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    orientation: "horizontal",
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[320px] rounded-[16px] border border-fg-border-default-subtle bg-bg-surface-surface-raised p-[16px]">
      <div className="space-y-[12px]">
        <p className="text-[14px] font-medium leading-[20px] text-fg-text-default-high-contrast">
          Permit information
        </p>
        <Divider {...args} />
        <p className="text-[14px] leading-[20px] text-fg-text-default-default">
          Use horizontal dividers to separate related content blocks without
          introducing extra hierarchy.
        </p>
      </div>
    </div>
  ),
};

export const Orientations: Story = {
  render: () => (
    <div className="grid gap-[24px] lg:grid-cols-2">
      <div className="w-[320px] rounded-[16px] border border-fg-border-default-subtle bg-bg-surface-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="text-[14px] font-medium leading-[20px] text-fg-text-default-high-contrast">
            Horizontal
          </p>
          <div className="space-y-[10px] text-[14px] leading-[20px] text-fg-text-default-default">
            <p>Section one</p>
            <Divider />
            <p>Section two</p>
          </div>
        </div>
      </div>

      <div className="w-[320px] rounded-[16px] border border-fg-border-default-subtle bg-bg-surface-surface-raised p-[16px]">
        <div className="space-y-[12px]">
          <p className="text-[14px] font-medium leading-[20px] text-fg-text-default-high-contrast">
            Vertical
          </p>
          <div className="flex items-center justify-between text-fg-text-default-default">
            <span>Summary</span>
            <Divider orientation="vertical" />
            <span>Documents</span>
            <Divider orientation="vertical" />
            <span>Status</span>
          </div>
        </div>
      </div>
    </div>
  ),
};
