import { Checkbox, CheckboxGroup } from '@veli-design/react/checkbox';
import { FieldDescription, FieldError, FieldLabel } from '@veli-design/react/field';
import { Radio, RadioGroup } from '@veli-design/react/radio';

export function FieldUsageDemo() {
  return (
    <RadioGroup className="max-w-md gap-3" defaultValue="pro">
      <FieldLabel>Plan</FieldLabel>
      <FieldDescription>You can change this later.</FieldDescription>
      <Radio value="basic">Basic</Radio>
      <Radio value="pro">Pro</Radio>
    </RadioGroup>
  );
}

export function FieldCheckboxGroupDemo() {
  return (
    <CheckboxGroup className="max-w-md gap-3" defaultValue={['email']}>
      <FieldLabel>Notification channels</FieldLabel>
      <FieldDescription>Where should we send updates?</FieldDescription>
      <Checkbox value="email">Email</Checkbox>
      <Checkbox value="sms">SMS</Checkbox>
    </CheckboxGroup>
  );
}

export function FieldValidationDemo() {
  return (
    <RadioGroup className="max-w-md gap-3" isInvalid>
      <FieldLabel>Plan</FieldLabel>
      <Radio value="basic">Basic</Radio>
      <Radio value="pro">Pro</Radio>
      <FieldError>Choose a plan to continue.</FieldError>
    </RadioGroup>
  );
}
