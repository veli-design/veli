'use client';

import { FieldDescription, FieldError, FieldLabel } from '@veli-design/react/field';
import { Radio, RadioGroup } from '@veli-design/react/radio';

export function DeliveryMethod() {
  return (
    <RadioGroup isRequired isInvalid>
      <FieldLabel>Delivery method</FieldLabel>
      <FieldDescription>Choose how you want to receive documents.</FieldDescription>
      <Radio value="collection">Collection</Radio>
      <Radio value="post">Post</Radio>
      <FieldError>Choose a delivery method to continue.</FieldError>
    </RadioGroup>
  );
}
