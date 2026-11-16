import { useState } from 'react';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';
import { ComboBox, ComboBoxItem, ComboBoxSection } from '@veli-design/react/combobox';

const COUNTRY_OPTIONS = [
  { id: 'mv', name: 'Maldives' },
  { id: 'lk', name: 'Sri Lanka' },
  { id: 'sg', name: 'Singapore' },
  { id: 'my', name: 'Malaysia' },
  { id: 'ae', name: 'United Arab Emirates' },
];

export function ComboBoxUsageDemo() {
  return (
    <div className="w-[320px]">
      <ComboBox
        label="Country"
        placeholder="Choose a country"
        description="Start typing to filter options."
        defaultItems={COUNTRY_OPTIONS}
      >
        {(item) => <ComboBoxItem>{item.name}</ComboBoxItem>}
      </ComboBox>
    </div>
  );
}

export function ComboBoxAppearancesDemo() {
  return (
    <div className="flex w-full flex-wrap justify-center gap-4">
      {(['default', 'outline'] as const).map((appearance) => (
        <div key={appearance} className="w-[320px] max-w-full">
          <ComboBox
            appearance={appearance}
            label={appearance === 'default' ? 'Default' : 'Outline'}
            placeholder="Choose a country"
            defaultItems={COUNTRY_OPTIONS}
          >
            {(item) => <ComboBoxItem>{item.name}</ComboBoxItem>}
          </ComboBox>
        </div>
      ))}
    </div>
  );
}

export function ComboBoxRtlDemo() {
  const [language, setLanguage] = useState('Dhivehi');
  const isDhivehi = language === 'Dhivehi';
  const text = isDhivehi
    ? {
        label: 'ތަން',
        placeholder: 'ތަނެއް ހޯދާ',
        description: 'ބޭނުން ވާ އައިޓަމެއް ސާރޗު ކުރައްވާ',
        locations: { male: 'މާލެ', hulhumale: 'ހުޅުމާލެ', fuvahmulah: 'ފުވައްމުލައް ސިޓީ' },
      }
    : {
        label: 'Location',
        placeholder: 'Search location',
        description: 'Start typing to filter options.',
        locations: { male: "Male'", hulhumale: "Hulhumale'", fuvahmulah: 'Fuvahmulah City' },
      };

  return (
    <DocsPreview
      codeKey={`combobox-language-${isDhivehi ? 'dv' : 'en'}`}
      controls={
        <DocsPreviewOption
          label="Language"
          value={language}
          options={['English', 'Dhivehi']}
          onChange={setLanguage}
        />
      }
    >
      <div className="w-[320px] max-w-full">
        <ComboBox
          key={language}
          lang={isDhivehi ? 'dv' : 'en'}
          dir={isDhivehi ? 'rtl' : 'ltr'}
          label={text.label}
          isOptional
          placeholder={text.placeholder}
          description={text.description}
        >
          {Object.entries(text.locations).map(([id, name]) => (
            <ComboBoxItem key={id} id={id}>
              {name}
            </ComboBoxItem>
          ))}
        </ComboBox>
      </div>
    </DocsPreview>
  );
}

export function ComboBoxExplorationDemo() {
  return (
    <div className="w-[320px]">
      <ComboBox label="Location" placeholder="Search location">
        <ComboBoxSection title="Popular">
          <ComboBoxItem id="male">Male'</ComboBoxItem>
          <ComboBoxItem id="hulhumale">Hulhumale'</ComboBoxItem>
          <ComboBoxItem id="addu">Addu City</ComboBoxItem>
        </ComboBoxSection>
        <ComboBoxSection title="Regional">
          <ComboBoxItem id="fuvahmulah">Fuvahmulah City</ComboBoxItem>
          <ComboBoxItem id="kulhudhuffushi">Kulhudhuffushi City</ComboBoxItem>
        </ComboBoxSection>
      </ComboBox>
    </div>
  );
}

export function ComboBoxValidationDemo() {
  return (
    <div className="flex w-[320px] max-w-full flex-col gap-[16px]">
      <ComboBox
        label="Default"
        description="Helper text"
        placeholder="Choose a country"
        defaultItems={COUNTRY_OPTIONS}
      >
        {(item) => <ComboBoxItem>{item.name}</ComboBoxItem>}
      </ComboBox>
      <ComboBox
        label="Invalid"
        isInvalid
        errorMessage="Select a supported option."
        placeholder="Choose a country"
        defaultItems={COUNTRY_OPTIONS}
      >
        {(item) => <ComboBoxItem>{item.name}</ComboBoxItem>}
      </ComboBox>
    </div>
  );
}
