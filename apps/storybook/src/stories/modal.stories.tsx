import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Modal } from '@tradenetcorp/veli-ui/modal';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Accessible modal built with `react-aria-components`, styled with Veli design tokens. Supports controlled and uncontrolled state, semantic title/body/footer content, and dismiss behavior controls.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    showCloseButton: {
      control: 'boolean',
    },
    isDismissable: {
      control: 'boolean',
    },
    isKeyboardDismissDisabled: {
      control: 'boolean',
    },
    title: {
      control: 'text',
    },
  },
  args: {
    size: 'md',
    title: 'Edit profile',
    showCloseButton: true,
    isDismissable: true,
    isKeyboardDismissDisabled: false,
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="flex min-h-[420px] items-center justify-center bg-bg-surface-base p-8">
        <Button onPress={() => setIsOpen(true)}>Open Modal</Button>

        <Modal
          {...args}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          footer={
            <>
              <Button variant="secondary" style="transparent" onPress={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onPress={() => setIsOpen(false)}>Save changes</Button>
            </>
          }
        >
          <p>
            Your changes have been saved successfully. You can continue editing or close this window
            to return to the dashboard.
          </p>
        </Modal>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [openSize, setOpenSize] = useState<null | 'sm' | 'md' | 'lg' | 'xl' | 'full'>(null);
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;

    return (
      <div className="flex min-h-[420px] flex-wrap items-center justify-center gap-3 bg-bg-surface-base p-8">
        {sizes.map((size) => (
          <Button key={size} variant="secondary" onPress={() => setOpenSize(size)}>
            Open {size.toUpperCase()}
          </Button>
        ))}

        {sizes.map((size) => (
          <Modal
            key={size}
            isOpen={openSize === size}
            onOpenChange={(isOpen) => setOpenSize(isOpen ? size : null)}
            size={size}
            title={`${size.toUpperCase()} modal`}
            footer={<Button onPress={() => setOpenSize(null)}>Close</Button>}
          >
            <p>
              This is the <strong>{size.toUpperCase()}</strong> size variant.
            </p>
          </Modal>
        ))}
      </div>
    );
  },
};

export const NonDismissable: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="flex min-h-[420px] items-center justify-center bg-bg-surface-base p-8">
        <Button variant="danger" onPress={() => setIsOpen(true)}>
          Delete project
        </Button>

        <Modal
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          isDismissable={false}
          isKeyboardDismissDisabled
          title="Confirm destructive action"
          showCloseButton={false}
          footer={
            <>
              <Button variant="secondary" style="transparent" onPress={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onPress={() => setIsOpen(false)}>
                Delete
              </Button>
            </>
          }
        >
          <p>
            This modal cannot be dismissed by clicking outside or pressing escape. The user must
            choose one of the explicit actions.
          </p>
        </Modal>
      </div>
    );
  },
};
