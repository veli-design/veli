import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { MenuItem } from '@veli-design/react/menu';
import { useVeliLanguage } from '@veli-design/react/provider';
import { Tag, TagButton, TagDropdown, TagGroup } from '@veli-design/react/tags';

const copy = {
  en: {
    fill: 'Fill',
    outline: 'Outline',
    tourism: 'Tourism',
    fisheries: 'Fisheries',
    transport: 'Transport',
    documents: 'Documents',
    forms: 'Forms',
    permits: 'Permits',
    reports: 'Reports',
    guidance: 'Related guidance',
    choose:
      'Select Documents, then use the arrow to choose sub-labels. Press the label to clear it.',
  },
  dv: {
    fill: 'ފިލް',
    outline: 'އައުޓްލައިން',
    tourism: 'ފަތުރުވެރިކަން',
    fisheries: 'މަސްވެރިކަން',
    transport: 'ޓްރާންސްޕޯޓް',
    documents: 'ލިޔެކިޔުންތައް',
    forms: 'ފޯމުތައް',
    permits: 'ހުއްދަތައް',
    reports: 'ރިޕޯޓްތައް',
    guidance: 'ގުޅޭ އިރުޝާދު',
    choose:
      'ލިޔެކިޔުންތައް ޚިޔާރުކުރައްވާ. އިތުރު ލޭބަލްތައް ޚިޔާރުކުރުމަށް ތިރިއަށް ދައްކާ ތިރިޔަށް ފިތާލައްވާ.',
  },
} as const;

function useTagExampleText() {
  return copy[useVeliLanguage().language];
}

export function TagsAppearancesDemo() {
  const text = useTagExampleText();
  return (
    <div className="flex flex-col gap-6">
      {(['fill', 'outline'] as const).map((appearance) => (
        <TagGroup
          key={appearance}
          label={text[appearance]}
          appearance={appearance}
          selectionMode="multiple"
          defaultSelectedKeys={['tourism']}
        >
          <Tag id="tourism">{text.tourism}</Tag>
          <Tag id="fisheries">{text.fisheries}</Tag>
          <Tag id="transport" isDisabled>
            {text.transport}
          </Tag>
        </TagGroup>
      ))}
    </div>
  );
}

export function TagsStandaloneDemo() {
  const text = useTagExampleText();
  const [selected, setSelected] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <TagButton isSelected={selected} onPress={() => setSelected((value) => !value)}>
        {text.documents}
      </TagButton>
      <TagButton
        as="a"
        appearance="outline"
        href="https://www.gov.mv"
        target="_blank"
        rel="noreferrer"
      >
        {text.guidance}
      </TagButton>
    </div>
  );
}

export function TagsDropdownDemo() {
  const text = useTagExampleText();
  const [selected, setSelected] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const items = [
    { id: 'forms', label: text.forms },
    { id: 'permits', label: text.permits },
    { id: 'reports', label: text.reports },
  ];

  return (
    <div className="space-y-3">
      <TagDropdown
        isSelected={selected}
        onSelect={() => setSelected(true)}
        label={text.documents}
        items={items}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        onDeselect={() => setSelected(false)}
        renderSelection={(selection) => {
          const selectedItems = items.filter(
            (item) => selection === 'all' || selection.has(item.id),
          );
          return selectedItems.length === 1
            ? selectedItems[0].label
            : selectedItems.length > 1
              ? selectedItems.length
              : null;
        }}
      >
        {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
      </TagDropdown>

      <p className="type-body-sm-regular text-base-muted">{text.choose}</p>
    </div>
  );
}
