'use client';

import { Radio, RadioGroup } from '@veli-design/react/radio';

export function DeliveryMethod() {
  return (
    <RadioGroup label="Delivery method">
      <Radio value="collection">Collection</Radio>
      <Radio value="post">Post</Radio>
    </RadioGroup>
  );
}
