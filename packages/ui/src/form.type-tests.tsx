import type { CalendarDate } from '@internationalized/date';
import { Checkbox, CheckboxGroup } from './checkbox';
import { ComboBox } from './combobox';
import { DateField } from './date-field';
import { DatePicker } from './date-picker';
import { toErrorMessage } from './form';
import { Input } from './input';
import { RadioGroup } from './radio';
import { Select } from './select';
import { TagGroup } from './tags';
import { TextArea } from './textarea';

/** Mirrors React Hook Form's `ControllerRenderProps`. */
interface RhfField<TValue> {
  name: string;
  value: TValue;
  onChange: (...event: unknown[]) => void;
  onBlur: () => void;
  ref: (instance: unknown) => void;
  disabled?: boolean;
}

declare function rhfField<TValue>(value: TValue): RhfField<TValue>;

/** Mirrors the parts of TanStack Form's `FieldApi` used by Veli fields. */
interface TanStackField<TValue> {
  name: string;
  state: { value: TValue; meta: { isTouched: boolean; isValid: boolean; errors: unknown[] } };
  handleChange: (value: TValue) => void;
  handleBlur: () => void;
}

declare function tanstackField<TValue>(value: TValue): TanStackField<TValue>;

export function FormBindingTypeExpectations() {
  const email = rhfField('');
  const bio = rhfField('');
  const { ref: countryRef, ...country } = rhfField<string | null>(null);
  const city = rhfField<string | null>(null);
  const plan = rhfField('basic');
  const terms = rhfField(false);
  const tags = rhfField<readonly string[]>([]);
  const channels = rhfField<string[]>([]);
  const startDate = rhfField<CalendarDate | null>(null);
  const { ref: endDateRef, ...endDate } = rhfField<CalendarDate | null>(null);

  const title = tanstackField('');
  const tsCountry = tanstackField<string | null>(null);
  const tsDate = tanstackField<CalendarDate | null>(null);
  const tsChannels = tanstackField<string[]>([]);
  const tsPlan = tanstackField('basic');
  const titleInvalid = title.state.meta.isTouched && !title.state.meta.isValid;
  const schemaIssues: { message: string; path?: PropertyKey[] }[] = [];

  return (
    <>
      <Input {...email} label="Email" />
      <TextArea {...bio} label="Bio" />
      <Select {...country} triggerRef={countryRef} label="Country" />
      <ComboBox {...city} label="City" />
      <RadioGroup {...plan} aria-label="Plan" />
      <Checkbox
        name={terms.name}
        isSelected={terms.value}
        onChange={terms.onChange}
        onBlur={terms.onBlur}
      >
        Accept terms
      </Checkbox>
      <CheckboxGroup {...channels} aria-label="Channels" errorMessage="Pick one">
        <Checkbox value="email">Email</Checkbox>
      </CheckboxGroup>
      <TagGroup
        aria-label="Tags"
        selectionMode="multiple"
        selectedKeys={tags.value}
        onSelectionChange={(keys) => keys !== 'all' && tags.onChange([...keys].map(String))}
      />
      <DateField {...startDate} label="Start" />
      <DatePicker {...endDate} triggerRef={endDateRef} label="End" />

      <Input
        label="Title"
        name={title.name}
        value={title.state.value}
        onChange={title.handleChange}
        onBlur={title.handleBlur}
        isInvalid={titleInvalid}
        errorMessage={toErrorMessage(title.state.meta.errors)}
      />
      <Select
        label="Country"
        name={tsCountry.name}
        value={tsCountry.state.value}
        onChange={tsCountry.handleChange}
        onBlur={tsCountry.handleBlur}
      />
      <DateField
        label="TanStack start"
        name={tsDate.name}
        value={tsDate.state.value}
        onChange={tsDate.handleChange}
        onBlur={tsDate.handleBlur}
      />
      <CheckboxGroup
        aria-label="TanStack channels"
        name={tsChannels.name}
        value={tsChannels.state.value}
        onChange={tsChannels.handleChange}
        onBlur={tsChannels.handleBlur}
      >
        <Checkbox value="sms">SMS</Checkbox>
      </CheckboxGroup>
      <RadioGroup
        aria-label="TanStack plan"
        name={tsPlan.name}
        value={tsPlan.state.value}
        onChange={tsPlan.handleChange}
        onBlur={tsPlan.handleBlur}
      />
      <Input label="Schema errors" isInvalid errorMessage={toErrorMessage(schemaIssues)} />

      {/* @ts-expect-error string onChange is incompatible with a numeric value */}
      <Select value={1} onChange={(value: string | null) => value} label="Key mismatch" />
    </>
  );
}
