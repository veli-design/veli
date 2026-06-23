import { useState } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Modal } from '@tradenetcorp/veli-ui/modal';

export function ModalBasicDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-[220px] items-center justify-center">
      <Button onPress={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Header>
          <Modal.Title>Edit profile</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Content>
          <p>
            This is a controlled modal. Focus is trapped while open and restored to the trigger when
            closed.
          </p>
        </Modal.Content>
        <Modal.Footer>
          <Button intent="secondary" appearance="transparent" onPress={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onPress={() => setIsOpen(false)}>Save changes</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
