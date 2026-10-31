import { useState } from 'react';
import { I18nProvider } from 'react-aria-components';
import { Radio, RadioGroup } from '@veli-design/react/radio';
import { FieldLabel, FieldDescription } from '@veli-design/react/field';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';

export function RadioUsageDemo() {
  return (
    <RadioGroup defaultValue="email">
      <FieldLabel>Contact method</FieldLabel>
      <Radio value="email">Email</Radio>
      <Radio value="sms">SMS</Radio>
    </RadioGroup>
  );
}

export function RadioSizesDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {(['md', 'lg', 'xl'] as const).map((size) => (
        <RadioGroup key={size} defaultValue="a">
          <FieldLabel>{size.toUpperCase()}</FieldLabel>
          <Radio value="a" size={size}>
            Option A
          </Radio>
          <Radio value="b" size={size}>
            Option B
          </Radio>
        </RadioGroup>
      ))}
    </div>
  );
}

export function RadioMessagesDemo() {
  return (
    <div className="grid max-w-xl gap-6 sm:grid-cols-2">
      <RadioGroup defaultValue="email" description="Choose how we contact you.">
        <FieldLabel>Contact method</FieldLabel>
        <Radio value="email" description="Receive a message in your inbox.">
          Email
        </Radio>
        <Radio value="sms" description="Receive a text on your phone.">
          SMS
        </Radio>
      </RadioGroup>
      <RadioGroup isInvalid errorMessage="Choose a contact method.">
        <FieldLabel>Contact method</FieldLabel>
        <Radio value="email">Email</Radio>
        <Radio value="sms">SMS</Radio>
      </RadioGroup>
    </div>
  );
}

export function RadioStatesDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <RadioGroup aria-label="Disabled choices" defaultValue="a" isDisabled>
        <Radio value="a">Selected, disabled</Radio>
        <Radio value="b">Unselected, disabled</Radio>
      </RadioGroup>
      <RadioGroup aria-label="Read only choices" defaultValue="a" isReadOnly>
        <Radio value="a">Selected, read only</Radio>
        <Radio value="b">Unselected, read only</Radio>
      </RadioGroup>
    </div>
  );
}

export function RadioControlledDemo() {
  const [value, setValue] = useState('email');
  return (
    <RadioGroup value={value} onChange={setValue}>
      <FieldLabel>Contact method</FieldLabel>
      <Radio value="email">Email</Radio>
      <Radio value="sms">SMS</Radio>
      <FieldDescription>Selected: {value}</FieldDescription>
    </RadioGroup>
  );
}

export function RadioRtlDemo() {
  const [language, setLanguage] = useState('Dhivehi');
  const [size, setSize] = useState<'md' | 'lg' | 'xl'>('md');
  const isDhivehi = language === 'Dhivehi';
  return (
    <DocsPreview
      codeKey={`radio-language-${isDhivehi ? 'dv' : 'en'}-${size}`}
      controls={
        <>
          <DocsPreviewOption
            label="Language"
            value={language}
            options={['English', 'Dhivehi']}
            onChange={setLanguage}
          />
          <DocsPreviewOption
            label="Size"
            value={size}
            options={['md', 'lg', 'xl']}
            onChange={(value) => setSize(value as 'md' | 'lg' | 'xl')}
          />
        </>
      }
    >
      <I18nProvider locale={isDhivehi ? 'dv-MV' : 'en-GB'}>
        <div lang={isDhivehi ? 'dv' : 'en'} dir={isDhivehi ? 'rtl' : 'ltr'}>
          <RadioGroup defaultValue="a">
            <FieldLabel>{isDhivehi ? 'އޮޕްޝަންތައް' : 'Options'}</FieldLabel>
            <Radio value="a" size={size}>
              {isDhivehi ? 'އޮޕްޝަން އޭ' : 'Option A'}
            </Radio>
            <Radio value="b" size={size}>
              {isDhivehi ? 'އޮޕްޝަން ބީ' : 'Option B'}
            </Radio>
          </RadioGroup>
        </div>
      </I18nProvider>
    </DocsPreview>
  );
}
