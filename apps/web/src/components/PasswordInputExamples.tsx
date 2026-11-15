import { PasswordInput } from '@veli-design/react/password-input';

export function PasswordInputUsageDemo() {
  return (
    <div className="w-[320px]">
      <PasswordInput
        label="Password"
        placeholder="Enter a password"
        description="Use at least 8 characters."
      />
    </div>
  );
}

export function PasswordInputAppearancesDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PasswordInput label="Default" placeholder="Enter a password" />
      <PasswordInput appearance="outline" label="Outline" placeholder="Enter a password" />
    </div>
  );
}

export function PasswordInputRequirementsDemo() {
  return (
    <div className="w-[320px]">
      <PasswordInput
        label="Create password"
        placeholder="Enter a password"
        requirements
        showRequirementsWhenEmpty
      />
    </div>
  );
}

export function PasswordInputMatchDemo() {
  return (
    <div className="w-[320px]">
      <PasswordInput
        label="Confirm password"
        defaultValue="SecretPass1!"
        feedbackMessage="Password match"
        feedbackTone="success"
        isSuccess
      />
    </div>
  );
}

export function PasswordInputValidationDemo() {
  return (
    <div className="w-[320px]">
      <PasswordInput
        label="Password"
        defaultValue="secret"
        isInvalid
        errorMessage="This field needs attention."
      />
    </div>
  );
}
