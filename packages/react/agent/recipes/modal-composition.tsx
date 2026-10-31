'use client';

import { useState } from 'react';
import { Button } from '@veli-design/react/button';
import { Modal } from '@veli-design/react/modal';

export function DeleteConfirmation({ onConfirm }: { onConfirm: () => Promise<void> | void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirmDelete() {
    setIsDeleting(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Button intent="danger" onPress={() => setIsOpen(true)}>
        Delete item
      </Button>
      <Modal
        size="xs"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        isDismissable={!isDeleting}
        isKeyboardDismissDisabled={isDeleting}
      >
        <Modal.Header>
          <Modal.Title>Delete this item?</Modal.Title>
          {!isDeleting && <Modal.CloseButton />}
        </Modal.Header>
        <Modal.Content>
          <p>This action cannot be undone.</p>
        </Modal.Content>
        <Modal.Footer>
          <Button
            intent="secondary"
            appearance="transparent"
            onPress={() => setIsOpen(false)}
            isDisabled={isDeleting}
          >
            Cancel
          </Button>
          <Button intent="danger" onPress={confirmDelete} isLoading={isDeleting}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
