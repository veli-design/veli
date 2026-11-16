import { useState } from 'react';
import { Button } from '@veli-design/react/button';
import { Modal } from '@veli-design/react/modal';

export function ModalUsageDemo() {
  return (
    <div className="flex min-h-[180px] items-center justify-center">
      <Modal.Trigger>
        <Button>Open modal</Button>
        <Modal>
          <Modal.Header>
            <Modal.Title>Edit profile</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Content>
            <p>Update your profile details and save when done.</p>
          </Modal.Content>
          <Modal.Footer>
            <Button slot="close" intent="secondary" appearance="transparent">
              Cancel
            </Button>
            <Button slot="close">Save changes</Button>
          </Modal.Footer>
        </Modal>
      </Modal.Trigger>
    </div>
  );
}

const MODAL_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const;

export function ModalSizesDemo() {
  const [activeSize, setActiveSize] = useState<(typeof MODAL_SIZES)[number] | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {MODAL_SIZES.map((size) => (
          <Button
            key={size}
            intent="secondary"
            appearance="transparent"
            onPress={() => setActiveSize(size)}
          >
            Open {size.toUpperCase()}
          </Button>
        ))}
      </div>

      <Modal
        size={activeSize ?? 'md'}
        isOpen={activeSize !== null}
        onOpenChange={(isOpen) => setActiveSize(isOpen ? activeSize : null)}
      >
        <Modal.Header>
          <Modal.Title>{(activeSize ?? 'md').toUpperCase()} modal</Modal.Title>
          {activeSize !== 'xs' ? (
            <Modal.Description>
              Width scales with `size`. Confirmation dialogs use `xs` without a description.
            </Modal.Description>
          ) : null}
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Content>
          <p>
            {activeSize === 'xs'
              ? 'Extra small modals are used for action confirmations such as delete.'
              : 'Content can grow up to 90dvh before the panel scrolls.'}
          </p>
        </Modal.Content>
        <Modal.Footer>
          <Button onPress={() => setActiveSize(null)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export function ModalDismissDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Modal.Trigger>
        <Button intent="danger">Open locked modal</Button>
        <Modal isDismissable={false} isKeyboardDismissDisabled>
          <Modal.Header>
            <Modal.Title>Confirm destructive action</Modal.Title>
          </Modal.Header>
          <Modal.Content>
            <p>Outside click and Escape are disabled. Choose an explicit action.</p>
          </Modal.Content>
          <Modal.Footer>
            <Button slot="close" intent="secondary" appearance="transparent">
              Cancel
            </Button>
            <Button slot="close" intent="danger">
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </Modal.Trigger>
    </div>
  );
}

export function ModalFooterDemo() {
  return (
    <div className="flex min-h-[180px] items-center justify-center">
      <Modal.Trigger>
        <Button>Open footer actions</Button>
        <Modal size="lg">
          <Modal.Header>
            <Modal.Title>Edit profile</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Content>
            <p>Start-edge and end-edge actions sit on opposite sides of the footer.</p>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex gap-2">
              <Button slot="close" intent="secondary" appearance="transparent">
                View history
              </Button>
            </div>
            <div className="flex gap-2">
              <Button slot="close" intent="secondary" appearance="transparent">
                Cancel
              </Button>
              <Button slot="close">Save changes</Button>
            </div>
          </Modal.Footer>
        </Modal>
      </Modal.Trigger>
    </div>
  );
}
