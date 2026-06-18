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
          'Accessible modal built with `react-aria-components`, styled with Veli design tokens. Compose with `Modal.Trigger`, `Modal.Header`, `Modal.Title`, `Modal.Description`, `Modal.CloseButton`, `Modal.Content`, and `Modal.Footer`.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'],
    },
    isDismissable: {
      control: 'boolean',
    },
    isKeyboardDismissDisabled: {
      control: 'boolean',
    },
  },
  args: {
    size: 'md',
    isDismissable: true,
    isKeyboardDismissDisabled: false,
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTrigger: Story = {
  render: (args) => (
    <div className="flex min-h-[420px] items-center justify-center bg-bg-surface-base p-8">
      <Modal.Trigger>
        <Button>Open Modal</Button>
        <Modal {...args}>
          <Modal.Header>
            <Modal.Title>Edit profile</Modal.Title>
            <Modal.Description>
              Update your profile details and save when you are done.
            </Modal.Description>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Content>
            <p>
              Open state is managed by `Modal.Trigger`. Focus returns to the trigger when the modal
              closes.
            </p>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex flex-1 justify-end gap-2">
              <Button slot="close" intent="secondary" appearance="transparent">
                Cancel
              </Button>
              <Button slot="close">Save changes</Button>
            </div>
          </Modal.Footer>
        </Modal>
      </Modal.Trigger>
    </div>
  ),
};

export const Playground: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="flex min-h-[420px] items-center justify-center bg-bg-surface-base p-8">
        <Button onPress={() => setIsOpen(true)}>Open Modal</Button>

        <Modal {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
          <Modal.Header>
            <Modal.Title>Edit profile</Modal.Title>
            <Modal.Description>
              Update your profile details and save when you are done.
            </Modal.Description>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Content>
            <p>
              Your changes have been saved successfully. You can continue editing or close this
              window to return to the dashboard.
            </p>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex flex-1 justify-end gap-2">
              <Button intent="secondary" appearance="transparent" onPress={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onPress={() => setIsOpen(false)}>Save changes</Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    );
  },
};

export const WithDescription: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="flex min-h-[420px] items-center justify-center bg-bg-surface-base p-8">
        <Button onPress={() => setIsOpen(true)}>Open modal with description</Button>

        <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
          <Modal.Header>
            <Modal.Title>Delete project</Modal.Title>
            <Modal.Description>
              This action cannot be undone. All project data will be permanently removed.
            </Modal.Description>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Content>
            <p>
              If you need a copy of this project, export it before deleting. Deleted projects cannot
              be recovered after 30 days.
            </p>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex flex-1 justify-end gap-2">
              <Button variant="secondary" style="transparent" onPress={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onPress={() => setIsOpen(false)}>
                Delete
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    );
  },
};

export const Confirmation: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="flex min-h-[420px] items-center justify-center bg-bg-surface-base p-8">
        <Button intent="danger" onPress={() => setIsOpen(true)}>
          Delete project
        </Button>

        <Modal isOpen={isOpen} onOpenChange={setIsOpen} size="xs">
          <Modal.Header>
            <Modal.Title>Delete project</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Content>
            <p>
              Extra small modals are used for action confirmations such as delete. This action
              cannot be undone.
            </p>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex flex-1 justify-end gap-2">
              <Button intent="secondary" appearance="transparent" onPress={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button intent="danger" onPress={() => setIsOpen(false)}>
                Delete
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [openSize, setOpenSize] = useState<null | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'>(
      null,
    );
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const;

    return (
      <div className="flex min-h-[420px] flex-wrap items-center justify-center gap-3 bg-bg-surface-base p-8">
        {sizes.map((size) => (
          <Button key={size} intent="secondary" onPress={() => setOpenSize(size)}>
            Open {size.toUpperCase()}
          </Button>
        ))}

        {sizes.map((size) => (
          <Modal
            key={size}
            isOpen={openSize === size}
            onOpenChange={(isOpen) => setOpenSize(isOpen ? size : null)}
            size={size}
          >
            <Modal.Header>
              <Modal.Title>{size.toUpperCase()} modal</Modal.Title>
              {size !== 'xs' ? (
                <Modal.Description>
                  This modal offers a detailed overview, featuring rich text and seamlessly
                  integrated links for easy navigation.
                </Modal.Description>
              ) : null}
              <Modal.CloseButton />
            </Modal.Header>
            <Modal.Content>
              <p>
                {size === 'xs' ? (
                  <>
                    Extra small modals are used for action confirmations such as delete. Replace the
                    confirmation message here.
                  </>
                ) : (
                  <>
                    This is the <strong>{size.toUpperCase()}</strong> size variant (
                    {size === 'sm' || size === 'xs'
                      ? '440px'
                      : size === 'md'
                        ? '576px'
                        : size === 'lg'
                          ? '776px'
                          : size === 'xl'
                            ? '1024px'
                            : '1200px'}
                    ).
                  </>
                )}
              </p>
            </Modal.Content>
            <Modal.Footer>
              <div className="flex flex-1 justify-end gap-2">
                <Button onPress={() => setOpenSize(null)}>Close</Button>
              </div>
            </Modal.Footer>
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
        <Button intent="danger" onPress={() => setIsOpen(true)}>
          Delete project
        </Button>

        <Modal
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          isDismissable={false}
          isKeyboardDismissDisabled
        >
          <Modal.Header>
            <Modal.Title>Confirm destructive action</Modal.Title>
          </Modal.Header>
          <Modal.Content>
            <p>
              This modal cannot be dismissed by clicking outside or pressing escape. The user must
              choose one of the explicit actions.
            </p>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex flex-1 justify-end gap-2">
              <Button intent="secondary" appearance="transparent" onPress={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button intent="danger" onPress={() => setIsOpen(false)}>
                Delete
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    );
  },
};
