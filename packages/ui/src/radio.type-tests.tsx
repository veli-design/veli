import { useRef } from 'react';
import { Radio, RadioGroup, type RadioGroupProps } from './radio.js';
import { FieldLabel, FieldDescription } from './field.js';

export function RadioTypeExpectations() {
  const rootRef = useRef<HTMLLabelElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const group: RadioGroupProps = {
    value: 'a',
    onChange: (value: string) => void value,
    name: 'choice',
    orientation: 'horizontal',
    isRequired: true,
    validationBehavior: 'native',
    description: 'Choose one',
    errorMessage: 'Required',
  };
  return (
    <>
      <RadioGroup {...group}>
        <FieldLabel>Choice</FieldLabel>
        <Radio value="a" ref={rootRef} inputRef={inputRef} description="Option details" size="lg">
          A
        </Radio>
        <Radio value="b" aria-label="B" isDisabled />
      </RadioGroup>
      <RadioGroup isReadOnly defaultValue="a">
        {({ isInvalid }) => (
          <>
            <FieldDescription>{isInvalid ? 'Invalid' : 'Read only'}</FieldDescription>
            <Radio value="a">A</Radio>
          </>
        )}
      </RadioGroup>
      {/* @ts-expect-error Radio must belong to a group and have a value */}
      <Radio />
      {/* @ts-expect-error Figma specifies medium and large sizes */}
      <Radio value="a" size="sm" />
      {/* @ts-expect-error Veli excludes inline style overrides */}
      <Radio value="a" style={{ color: 'red' }} />
      {/* @ts-expect-error option children are content, not a render function */}
      <Radio value="a">{() => 'A'}</Radio>
    </>
  );
}
