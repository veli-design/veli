import type { Meta, StoryObj } from "@storybook/react";
import { Dialog, DialogTrigger } from "react-aria-components";
import { Button } from "@tradenetcorp/coral-ui/button";
import { Popover } from "@tradenetcorp/coral-ui/popover";

const meta = {
  title: "Components/Popover",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Floating panel anchored to a trigger, built with `react-aria-components` and Coral styling. Use with `DialogTrigger` and `Dialog` for focus management and accessibility.",
      },
    },
  },
  argTypes: {
    showArrow: {
      control: "boolean",
    },
    placement: {
      control: "select",
      options: [
        "bottom",
        "bottom left",
        "bottom right",
        "bottom start",
        "bottom end",
        "top",
        "top left",
        "top right",
        "top start",
        "top end",
        "left",
        "left top",
        "left bottom",
        "start",
        "start top",
        "start bottom",
        "right",
        "right top",
        "right bottom",
        "end",
        "end top",
        "end bottom",
      ],
    },
  },
  args: {
    showArrow: false,
    placement: "bottom",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className="flex min-h-[320px] items-center justify-center bg-bg-surface-surface-bg p-8">
      <DialogTrigger>
        <Button variant="secondary">Open popover</Button>
        <Popover {...args}>
          <Dialog className="max-w-xs p-4 outline-none">
            <p className="text-sm">
              This popover uses Coral surface styles and enter/exit animations.
              Adjust placement and arrow in the controls.
            </p>
          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  ),
};

export const WithArrow: Story = {
  render: () => (
    <div className="flex min-h-[320px] items-center justify-center bg-bg-surface-surface-bg p-8">
      <DialogTrigger>
        <Button>Filter</Button>
        <Popover showArrow placement="top">
          <Dialog className="w-72 p-4 outline-none">
            <p className="mb-3 text-sm font-medium text-fg-text-default-default">
              Quick filters
            </p>
            <p className="text-sm text-fg-text-default-muted">
              The arrow offset matches the panel; placement flips the arrow
              orientation.
            </p>
          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  ),
};

export const Placements: Story = {
  render: () => {
    const placements = ["top", "bottom", "left", "right"] as const;

    return (
      <div className="flex min-h-[420px] items-center justify-center bg-bg-surface-surface-bg p-8">
        <div className="grid grid-cols-2 gap-16 sm:grid-cols-4">
          {placements.map((placement) => (
            <DialogTrigger key={placement}>
              <Button variant="secondary" size="sm">
                {placement}
              </Button>
              <Popover placement={placement} showArrow>
                <Dialog className="w-48 p-3 text-center text-sm outline-none">
                  Placement: <strong>{placement}</strong>
                </Dialog>
              </Popover>
            </DialogTrigger>
          ))}
        </div>
      </div>
    );
  },
};
