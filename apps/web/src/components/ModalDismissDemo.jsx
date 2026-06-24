import { useState } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Modal } from '@tradenetcorp/veli-ui/modal';

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
        isDismissable={!isLocked}
        isKeyboardDismissDisabled={isLocked}
      >
        <Modal.Header>
          <Modal.Title>{isLocked ? 'Confirm destructive action' : 'Dismissable modal'}</Modal.Title>
          {!isLocked ? <Modal.CloseButton /> : null}
        </Modal.Header>
        <Modal.Content>
          <p>
            {isLocked
              ? 'Outside click and Escape are disabled for critical flows.'
              : 'You can close this modal with outside click, Escape, or the close button.'}
          </p>
        </Modal.Content>
        <Modal.Footer>
          <Button intent="secondary" appearance="transparent" onPress={() => setMode(null)}>
            Cancel
          </Button>
          <Button intent={isLocked ? 'danger' : 'primary'} onPress={() => setMode(null)}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
