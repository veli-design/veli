import { useState } from 'react';
import { Button } from '@veli-design/react/button';
import { Form } from '@veli-design/react/form';
import { OTPInput, OTPInputSeparator, OTPInputSlot } from '@veli-design/react/otp-input';

export function OTPInputUsageDemo() {
  return (
    <div className="w-[320px]">
      <OTPInput
        name="code"
        label="Verification code"
        description="We sent a 6-digit code by SMS."
        groups={[3, 3]}
        action={
          <Button type="button" appearance="ghost" size="sm">
            Resend
          </Button>
        }
      />
    </div>
  );
}

export function OTPInputAppearancesDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <OTPInput label="Default" length={6} />
      <OTPInput appearance="outline" label="Outline" length={6} />
    </div>
  );
}

export function OTPInputBackupCodeDemo() {
  return (
    <div className="w-[320px]">
      <OTPInput
        name="backup"
        label="Backup code"
        alphabet="alphanumeric-upper"
        groups={[4, 4]}
        separator={<OTPInputSeparator>·</OTPInputSeparator>}
        renderSlot={(slot) => <OTPInputSlot slot={slot} className="font-mono" />}
      />
    </div>
  );
}

export function OTPInputFormDemo() {
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  return (
    <div className="w-[320px]">
      <Form
        validationErrors={serverErrors}
        onSubmit={(event) => {
          event.preventDefault();
          setServerErrors({ code: 'That code has expired. Request a new one.' });
        }}
      >
        <OTPInput name="code" label="Verification code" isRequired />
        <Button type="submit">Verify</Button>
      </Form>
    </div>
  );
}
