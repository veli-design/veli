import { useRef, useState } from 'react';
import { ComboBox, ComboBoxItem, ComboBoxSection, type ComboBoxProps } from './combobox.js';

export function ComboBoxTypeExpectations() {
  const [value, onChange] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const props: ComboBoxProps<{ id: string; name: string }, string> = {
    value,
    onChange,
    isOptional: true,
    isReadOnly: true,
    lang: 'dv',
    dir: 'rtl',
    appearance: 'outline',
    size: 'md',
    inputRef: ref,
  };
  return (
    <>
      <ComboBox {...props} defaultItems={[{ id: 'mv', name: 'Maldives' }]}>
        {(item) => (
          <ComboBoxItem textValue={item.name} description="Country">
            {item.name}
          </ComboBoxItem>
        )}
      </ComboBox>
      <ComboBox
        defaultValue={42}
        onChange={(key: number | null) => void key}
        ref={ref}
        labelSupplementary="Custom copy"
      >
        <ComboBoxSection title="Countries">
          <ComboBoxItem id={42}>Maldives</ComboBoxItem>
        </ComboBoxSection>
      </ComboBox>
      {/* @ts-expect-error optional is a boolean, not custom label copy */}
      <ComboBox isOptional="Optional" />
      {/* @ts-expect-error inline styling is excluded */}
      <ComboBox style={{ width: 300 }} />
      {/* @ts-expect-error invalid field size */}
      <ComboBox size="xl" />
      {/* @ts-expect-error value and onChange must share the same key type */}
      <ComboBox value="mv" onChange={(key: number | null) => void key} />
    </>
  );
}
