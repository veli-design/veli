'use client';

import { FieldDescription, FieldError, FieldLabel } from '@tradenetcorp/veli-ui/field';
import { Radio, RadioGroup } from '@tradenetcorp/veli-ui/radio';

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
