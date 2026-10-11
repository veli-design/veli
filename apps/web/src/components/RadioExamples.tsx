import { useState } from 'react';
import { I18nProvider } from 'react-aria-components';
import { Radio, RadioGroup } from '@tradenetcorp/veli-ui/radio';
import { FieldLabel, FieldDescription } from '@tradenetcorp/veli-ui/field';
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
    <div className="grid gap-6 sm:grid-cols-2">
      {(['md', 'lg'] as const).map((size) => (
        <RadioGroup key={size} aria-label={`${size} choices`} defaultValue="a">
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
  const isDhivehi = language === 'Dhivehi';
  return (
    <DocsPreview
      codeKey={`radio-language-${isDhivehi ? 'dv' : 'en'}`}
      controls={
        <DocsPreviewOption
          label="Language"
          value={language}
          options={['English', 'Dhivehi']}
          onChange={setLanguage}
        />
      }
    >
      <I18nProvider locale={isDhivehi ? 'dv-MV' : 'en-GB'}>
        <div lang={isDhivehi ? 'dv' : 'en'} dir={isDhivehi ? 'rtl' : 'ltr'}>
          <RadioGroup defaultValue="a">
            <FieldLabel>{isDhivehi ? 'އޮޕްޝަންތައް' : 'Options'}</FieldLabel>
            <Radio value="a">{isDhivehi ? 'އޮޕްޝަން އޭ' : 'Option A'}</Radio>
            <Radio value="b">{isDhivehi ? 'އޮޕްޝަން ބީ' : 'Option B'}</Radio>
          </RadioGroup>
        </div>
      </I18nProvider>
    </DocsPreview>
  );
}
