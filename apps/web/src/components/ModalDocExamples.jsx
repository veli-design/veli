import { useState } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Modal } from '@tradenetcorp/veli-ui/modal';

const SIZES = ['sm', 'md', 'lg', 'xl', 'full'];

export function ModalBasicDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-[220px] items-center justify-center">
      <Button onPress={() => setIsOpen(true)}>Open Modal</Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Edit profile"
        footer={
          <>
            <Button intent="secondary" appearance="transparent" onPress={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onPress={() => setIsOpen(false)}>Save changes</Button>
          </>
        }
      >
        <p>
          This is a controlled modal. Focus is trapped while open and restored to the trigger when
          closed.
        </p>
      </Modal>
    </div>
  );
}

export function ModalSizesDemo() {
  const [activeSize, setActiveSize] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {SIZES.map((size) => (
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
        title={`${(activeSize ?? 'md').toUpperCase()} modal`}
        footer={<Button onPress={() => setActiveSize(null)}>Close</Button>}
      >
        <p>
          Resize behavior is token-based and keeps spacing and typography consistent across all size
          variants.
        </p>
      </Modal>
    </div>
  );
}

export function ModalDismissDemo() {
  const [mode, setMode] = useState(null);
  const isLocked = mode === 'locked';

  return (
    <div className="flex flex-wrap gap-3">
      <Button onPress={() => setMode('dismissable')}>Open Dismissable Modal</Button>
      <Button intent="danger" onPress={() => setMode('locked')}>
        Open Locked Modal
      </Button>

      <Modal
        isOpen={mode !== null}
        onOpenChange={(isOpen) => setMode(isOpen ? mode : null)}
        title={isLocked ? 'Confirm destructive action' : 'Dismissable modal'}
        isDismissable={!isLocked}
        isKeyboardDismissDisabled={isLocked}
        showCloseButton={!isLocked}
        footer={
          <>
            <Button intent="secondary" appearance="transparent" onPress={() => setMode(null)}>
              Cancel
            </Button>
            <Button intent={isLocked ? 'danger' : 'primary'} onPress={() => setMode(null)}>
              Confirm
            </Button>
          </>
        }
      >
        <p>
          {isLocked
            ? 'Outside click and Escape are disabled for critical flows.'
            : 'You can close this modal with outside click, Escape, or the close button.'}
        </p>
      </Modal>
    </div>
  );
}
