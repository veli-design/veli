import { useState } from 'react';
import { Checkbox, CheckboxGroup } from '@veli-design/react/checkbox';
import { FieldLabel } from '@veli-design/react/field';

export function CheckboxUsageDemo() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Checkbox>Default</Checkbox>
      <Checkbox defaultSelected>Checked</Checkbox>
      <Checkbox isIndeterminate>Indeterminate</Checkbox>
    </div>
  );
}

export function CheckboxStatesDemo() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Checkbox>Off</Checkbox>
      <Checkbox defaultSelected>On</Checkbox>
      <Checkbox isIndeterminate>Indeterminate</Checkbox>
    </div>
  );
}

export function CheckboxDisabledDemo() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Checkbox isDisabled>Off</Checkbox>
      <Checkbox defaultSelected isDisabled>
        On
      </Checkbox>
      <Checkbox isIndeterminate isDisabled>
        Indeterminate
      </Checkbox>
    </div>
  );
}

export function CheckboxSizesDemo() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <Checkbox size="md" description="16px box">
        Medium
      </Checkbox>
      <Checkbox size="lg" description="20px box">
        Large
      </Checkbox>
      <Checkbox size="xl" description="24px box">
        Extra large
      </Checkbox>
    </div>
  );
}

export function CheckboxMessagesDemo() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <Checkbox description="We send it to the address on your account.">
        Email me a receipt
      </Checkbox>
      <Checkbox
        isInvalid
        description="Review this option before continuing."
        errorMessage="You must accept the terms to continue."
      >
        Accept terms and conditions
      </Checkbox>
    </div>
  );
}

export function CheckboxGroupDemo() {
  const [channels, setChannels] = useState<string[]>(['email']);

  return (
    <div className="grid w-full max-w-sm gap-4">
      <CheckboxGroup
        name="channels"
        value={channels}
        onChange={setChannels}
        isRequired
        description="Where should we send updates?"
      >
        {({ isDisabled, isRequired }) => (
          <>
            <FieldLabel isDisabled={isDisabled} isRequired={isRequired}>
              Notification channels
            </FieldLabel>
            <Checkbox value="email">Email</Checkbox>
            <Checkbox value="sms">SMS</Checkbox>
            <Checkbox value="push">Push notifications</Checkbox>
          </>
        )}
      </CheckboxGroup>
      <p className="type-body-sm-regular text-base-muted" role="status">
        Selected: {channels.length ? channels.join(', ') : 'None'}
      </p>
    </div>
  );
}
