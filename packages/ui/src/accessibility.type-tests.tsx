import { Button } from './button';
import { Modal } from './modal';

export function AccessibilityTypeExpectations() {
  return (
    <>
      <Button iconOnly aria-label="Add item">
        <span aria-hidden="true" />
      </Button>
      <Button iconOnly aria-labelledby="add-item-label">
        <span aria-hidden="true" />
      </Button>

      {/* @ts-expect-error icon-only buttons require an accessible name */}
      <Button iconOnly>
        <span aria-hidden="true" />
      </Button>

      <Modal isOpen>
        <Modal.Header>
          <Modal.Title>Edit profile</Modal.Title>
        </Modal.Header>
        <Modal.Content>
          <p>Profile form</p>
        </Modal.Content>
      </Modal>
      <Modal isOpen aria-label="Edit profile">
        <Modal.Content>
          <p>Profile form</p>
        </Modal.Content>
      </Modal>
      <Modal isOpen aria-labelledby="edit-profile-title">
        <Modal.Content>
          <p>Profile form</p>
        </Modal.Content>
      </Modal>
    </>
  );
}
