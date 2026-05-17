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

      <Modal isOpen title="Edit profile">
        <p>Profile form</p>
      </Modal>
      <Modal isOpen aria-label="Edit profile">
        <p>Profile form</p>
      </Modal>
      <Modal isOpen aria-labelledby="edit-profile-title">
        <p>Profile form</p>
      </Modal>

      {/* @ts-expect-error modals require title, aria-label, or aria-labelledby */}
      <Modal isOpen>
        <p>Profile form</p>
      </Modal>
    </>
  );
}
