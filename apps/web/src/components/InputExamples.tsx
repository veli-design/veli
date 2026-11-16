import { Input } from '@veli-design/react/input';
import { LinkSimpleIcon } from '@phosphor-icons/react';

export function InputUsageDemo() {
  return (
    <div className="w-[320px]">
      <Input
        label="Email"
        type="email"
        isOptional
        placeholder="name@example.com"
        description="Helper text"
      />
    </div>
  );
}

export function InputAppearancesDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="Default" placeholder="Enter value" />
      <Input appearance="outline" label="Outline" placeholder="Enter value" />
    </div>
  );
}

export function InputValidationDemo() {
  return (
    <div className="w-[320px]">
      <Input
        label="Email"
        type="email"
        isInvalid
        errorMessage="Enter a valid email address."
        endContent={<LinkSimpleIcon size={20} />}
      />
    </div>
  );
}
