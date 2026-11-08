import * as React from 'react';
import { OTPInput, OTPInputSeparator, OTPInputSlot } from './otp-input.js';

export function OTPInputTypeExpectations() {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <OTPInput ref={inputRef} label="Code" />
      <OTPInput label="Code" length={4} />
      <OTPInput
        label="Backup code"
        groups={[4, 4]}
        alphabet="alphanumeric-upper"
        separator={<OTPInputSeparator>·</OTPInputSeparator>}
        renderSlot={(slot) => <OTPInputSlot slot={slot} className="font-mono" />}
      />

      {/* @ts-expect-error length and groups are mutually exclusive */}
      <OTPInput label="Code" length={6} groups={[3, 3]} />

      {/* @ts-expect-error groups needs at least one size */}
      <OTPInput label="Code" groups={[]} />

      {/* @ts-expect-error the alphabet owns inputMode */}
      <OTPInput label="Code" inputMode="text" />

      {/* @ts-expect-error alphabets are a closed set */}
      <OTPInput label="Code" alphabet="hex" />

      <OTPInput
        label="Code"
        renderSlot={() => (
          // @ts-expect-error slot views only come from the root's projection
          <OTPInputSlot slot={{ index: 0, char: null, caret: 'none' }} />
        )}
      />
    </>
  );
}
