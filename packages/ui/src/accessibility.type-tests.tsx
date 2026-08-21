import * as React from 'react';
import { Button } from './button';
import { ComboBox } from './combobox';
import { Input } from './input';
import { Link } from './link';
import { Modal } from './modal';
import { PasswordInput } from './password-input-component';
import { Search } from './search';
import { TextArea } from './textarea';

export function AccessibilityTypeExpectations() {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  return (
    <>
      <Button iconOnly aria-label="Add item">
        <span aria-hidden="true" />
      </Button>
      <Button ref={buttonRef}>Save</Button>
      <Input ref={inputRef} />
      <Search ref={inputRef} />
      <PasswordInput ref={inputRef} />
      <TextArea ref={textareaRef} />
      <ComboBox ref={inputRef} aria-label="Country" />
      <Button iconOnly aria-labelledby="add-item-label">
        <span aria-hidden="true" />
      </Button>

      <Link href="/account">
        {({ isCurrent, isHovered }) => (isCurrent || isHovered ? 'Current account' : 'Account')}
      </Link>

      <Link
        href="/account"
        render={(props) =>
          'href' in props ? <a {...props}>Account</a> : <span {...props}>Account</span>
        }
      >
        Account
      </Link>

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
