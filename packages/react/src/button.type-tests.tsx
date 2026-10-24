import { createRef } from 'react';
import { Button, type ButtonProps } from './button.js';
import { DropzoneTrigger } from './dropzone.js';
import { ModalCloseButton } from './modal.js';

const buttonRef = createRef<HTMLButtonElement>();
const anchorRef = createRef<HTMLAnchorElement>();

export function ButtonTypeExpectations() {
  return (
    <>
      <Button ref={buttonRef} type="submit">
        Save
      </Button>
      <Button as="a" href="/account" ref={anchorRef} target="_blank" rel="noreferrer">
        Account
      </Button>
      <Button
        as="a"
        href="/account"
        isPending
        render={(props, state) => (
          <a {...props} aria-busy={state.isPending}>
            {props.children}
          </a>
        )}
      >
        Account
      </Button>
      <Button as="a" href="/account" iconOnly aria-label="Account">
        +
      </Button>
      <Button
        as="a"
        render={(props) => (
          <a {...props} href="/account">
            {props.children}
          </a>
        )}
        ref={anchorRef}
        onClick={(event) => {
          const href: string = event.currentTarget.href;
          void href;
          event.preventDefault();
        }}
      >
        Composed account
      </Button>
      <Button onPressUp={() => {}} onPressChange={() => {}}>
        Action callbacks
      </Button>
      {/* @ts-expect-error useLink does not support this press callback. */}
      <Button as="a" href="/account" onPressUp={() => {}}>
        Account
      </Button>
      {/* @ts-expect-error useLink does not support this press callback. */}
      <Button as="a" href="/account" onPressChange={() => {}}>
        Account
      </Button>
      {/* @ts-expect-error Navigation requires href or an explicit renderer. */}
      <Button as="a">Account</Button>
      {/* @ts-expect-error href requires navigation mode. */}
      <Button href="/account">Account</Button>
      {/* @ts-expect-error Navigation has no submitter type. */}
      <Button as="a" href="/account" type="submit">
        Account
      </Button>
      {/* @ts-expect-error Navigation has no form association. */}
      <Button as="a" href="/account" form="account">
        Account
      </Button>
      {/* @ts-expect-error Navigation refs point to anchors. */}
      <Button as="a" href="/account" ref={buttonRef}>
        Account
      </Button>
      {/* @ts-expect-error Action refs point to buttons. */}
      <Button ref={anchorRef}>Save</Button>
      {/* @ts-expect-error Icon links require an accessible name. */}
      <Button as="a" href="/account" iconOnly>
        +
      </Button>
      {/* @ts-expect-error File pickers remain button actions. */}
      <DropzoneTrigger as="a" href="/account">
        Browse
      </DropzoneTrigger>
      {/* @ts-expect-error Modal close controls remain button actions. */}
      <ModalCloseButton as="a" href="/account" />
    </>
  );
}

const actionType: ButtonProps['type'] = 'submit';
const actionForm: ButtonProps['form'] = 'account';
void actionType;
void actionForm;
