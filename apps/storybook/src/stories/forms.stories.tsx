import { useState, type FormEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from '@tanstack/react-form';
import { Controller, useForm as useReactHookForm } from 'react-hook-form';
import { Button } from '@veli-design/react/button';
import { Checkbox, CheckboxGroup } from '@veli-design/react/checkbox';
import { DatePicker } from '@veli-design/react/date-picker';
import {
  Form,
  dateValueToIsoDate,
  isoDateToDateValue,
  toErrorMessage,
} from '@veli-design/react/form';
import { Input } from '@veli-design/react/input';
import { Radio, RadioGroup } from '@veli-design/react/radio';
import { Select, SelectItem } from '@veli-design/react/select';

const meta = {
  title: 'Patterns/Forms',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

type RhfValues = {
  email: string;
  country: string | null;
  plan: string;
  channels: string[];
  startDate: string | null;
  terms: boolean;
};

export const ReactHookForm: Story = {
  render: function ReactHookFormStory() {
    const {
      control,
      handleSubmit,
      formState: { errors },
    } = useReactHookForm<RhfValues>({
      defaultValues: {
        email: '',
        country: null,
        plan: 'basic',
        channels: [],
        startDate: null,
        terms: false,
      },
    });
    const [submitted, setSubmitted] = useState<RhfValues | null>(null);

    return (
      <Form
        className="mx-auto max-w-md gap-4"
        onSubmit={handleSubmit((values) => setSubmitted(values))}
      >
        <Controller
          name="email"
          control={control}
          rules={{ required: 'Email is required' }}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              label="Email"
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="country"
          control={control}
          rules={{ required: 'Country is required' }}
          render={({ field: { ref, ...field }, fieldState }) => (
            <Select
              {...field}
              triggerRef={ref}
              label="Country"
              placeholder="Choose a country"
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            >
              <SelectItem id="mv">Maldives</SelectItem>
              <SelectItem id="lk">Sri Lanka</SelectItem>
              <SelectItem id="sg">Singapore</SelectItem>
            </Select>
          )}
        />
        <Controller
          name="plan"
          control={control}
          render={({ field }) => (
            <RadioGroup {...field} aria-label="Plan">
              <Radio value="basic">Basic</Radio>
              <Radio value="pro">Pro</Radio>
            </RadioGroup>
          )}
        />
        <Controller
          name="channels"
          control={control}
          rules={{ validate: (value) => value.length > 0 || 'Pick at least one channel' }}
          render={({ field, fieldState }) => (
            <CheckboxGroup
              {...field}
              aria-label="Notification channels"
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            >
              <Checkbox value="email">Email</Checkbox>
              <Checkbox value="sms">SMS</Checkbox>
            </CheckboxGroup>
          )}
        />
        <Controller
          name="startDate"
          control={control}
          render={({ field: { ref, ...field } }) => (
            <DatePicker
              {...field}
              triggerRef={ref}
              value={isoDateToDateValue(field.value)}
              onChange={(date) => field.onChange(dateValueToIsoDate(date))}
              label="Start date"
            />
          )}
        />
        <Controller
          name="terms"
          control={control}
          rules={{ validate: (value) => value || 'You must accept the terms' }}
          render={({ field, fieldState }) => (
            <Checkbox
              name={field.name}
              isSelected={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            >
              I accept the terms
            </Checkbox>
          )}
        />
        <Button type="submit">Submit</Button>
        {Object.keys(errors).length > 0 ? (
          <p className="type-body-sm-regular text-danger-muted">Fix the highlighted fields.</p>
        ) : null}
        {submitted ? (
          <pre className="overflow-auto rounded-md bg-ash-alpha-100 p-3 type-caption-regular">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        ) : null}
      </Form>
    );
  },
};

type TanStackValues = {
  fullName: string;
  country: string | null;
  channels: string[];
  emails: { address: string }[];
};

const tanStackDefaults: TanStackValues = {
  fullName: '',
  country: null,
  channels: [],
  emails: [{ address: '' }],
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Touched-gated errors, array fields, reset, and an external submit button. */
export const TanStackForm: Story = {
  render: function TanStackFormStory() {
    const [submitted, setSubmitted] = useState<TanStackValues | null>(null);
    const form = useForm({
      defaultValues: tanStackDefaults,
      onSubmit: ({ value }) => {
        setSubmitted(value);
      },
    });

    return (
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <Form
          id="tanstack-profile"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="fullName"
            validators={{
              onChange: ({ value }) => (value.trim() ? undefined : 'Name is required'),
            }}
          >
            {(field) => (
              <Input
                name={field.name}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                isInvalid={field.state.meta.isTouched && !field.state.meta.isValid}
                errorMessage={toErrorMessage(field.state.meta.errors)}
                label="Full name"
              />
            )}
          </form.Field>
          <form.Field
            name="country"
            validators={{
              onChange: ({ value }) => (value ? undefined : 'Country is required'),
            }}
          >
            {(field) => (
              <Select
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                isInvalid={field.state.meta.isTouched && !field.state.meta.isValid}
                errorMessage={toErrorMessage(field.state.meta.errors)}
                onChange={field.handleChange}
                label="Country"
                placeholder="Choose a country"
              >
                <SelectItem id="mv">Maldives</SelectItem>
                <SelectItem id="sg">Singapore</SelectItem>
              </Select>
            )}
          </form.Field>
          <form.Field
            name="channels"
            validators={{
              onChange: ({ value }) => (value.length > 0 ? undefined : 'Pick at least one channel'),
            }}
          >
            {(field) => (
              <CheckboxGroup
                name={field.name}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                isInvalid={field.state.meta.isTouched && !field.state.meta.isValid}
                errorMessage={toErrorMessage(field.state.meta.errors)}
                aria-label="Notification channels"
                description="Where should we send updates?"
              >
                <Checkbox value="email">Email</Checkbox>
                <Checkbox value="sms">SMS</Checkbox>
                <Checkbox value="push">Push</Checkbox>
              </CheckboxGroup>
            )}
          </form.Field>
          <form.Field name="emails" mode="array">
            {(emailsField) => (
              <div className="flex flex-col gap-3">
                {emailsField.state.value.map((_, index) => (
                  <form.Field
                    key={index}
                    name={`emails[${index}].address`}
                    validators={{
                      onChange: ({ value }) =>
                        emailPattern.test(value) ? undefined : 'Enter a valid email address',
                    }}
                  >
                    {(field) => (
                      <Input
                        name={field.name}
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        isInvalid={field.state.meta.isTouched && !field.state.meta.isValid}
                        errorMessage={toErrorMessage(field.state.meta.errors)}
                        type="email"
                        label={`Email ${index + 1}`}
                        action={
                          emailsField.state.value.length > 1 ? (
                            <Button
                              type="button"
                              intent="secondary"
                              appearance="ghost"
                              size="sm"
                              onPress={() => emailsField.removeValue(index)}
                            >
                              Remove
                            </Button>
                          ) : undefined
                        }
                      />
                    )}
                  </form.Field>
                ))}
                <Button
                  type="button"
                  intent="secondary"
                  appearance="transparent"
                  isDisabled={emailsField.state.value.length >= 3}
                  onPress={() => emailsField.pushValue({ address: '' })}
                >
                  Add email
                </Button>
              </div>
            )}
          </form.Field>
        </Form>
        <div className="flex gap-2">
          <Button type="submit" form="tanstack-profile">
            Submit
          </Button>
          <Button
            type="button"
            intent="secondary"
            appearance="transparent"
            onPress={() => {
              form.reset();
              setSubmitted(null);
            }}
          >
            Reset
          </Button>
        </div>
        {submitted ? (
          <pre className="overflow-auto rounded-md bg-ash-alpha-100 p-3 type-caption-regular">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        ) : null}
      </div>
    );
  },
};

type OsmField = {
  hash: string;
  label: string;
  component: 'TextField' | 'SelectField' | 'BooleanField';
  value: string | null;
  enum?: string[];
  required?: boolean;
};

/** Mimics osm-web-2's string-valued schema renderer contract. */
export const OsmStyleSchema: Story = {
  render: function OsmStyleSchemaStory() {
    const [fields, setFields] = useState<OsmField[]>([
      {
        hash: 'full-name',
        label: 'Full name',
        component: 'TextField',
        value: '',
        required: true,
      },
      {
        hash: 'island',
        label: 'Island',
        component: 'SelectField',
        value: null,
        enum: ['Male', 'Hulhumale', 'Addu'],
        required: true,
      },
      {
        hash: 'resident',
        label: 'Resident',
        component: 'BooleanField',
        value: 'false',
      },
    ]);
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [submitted, setSubmitted] = useState<Record<string, string | boolean> | null>(null);

    const updateFieldValue = (hash: string, value: string | null) => {
      setFields((prev) => prev.map((field) => (field.hash === hash ? { ...field, value } : field)));
      setErrors((prev) => ({ ...prev, [hash]: null }));
    };

    const onSubmit = (event: FormEvent) => {
      event.preventDefault();
      const nextErrors: Record<string, string | null> = {};
      for (const field of fields) {
        if (field.required && (field.value == null || field.value === '')) {
          nextErrors[field.hash] = 'This field is required';
        }
      }
      setErrors(nextErrors);
      if (Object.values(nextErrors).some(Boolean)) {
        return;
      }

      const payload: Record<string, string | boolean> = {};
      for (const field of fields) {
        if (field.component === 'BooleanField') {
          payload[field.hash] = field.value === 'true';
        } else if (typeof field.value === 'string') {
          payload[field.hash] = field.value.trim();
        }
      }
      setSubmitted(payload);
    };

    return (
      <Form className="mx-auto max-w-md gap-4" onSubmit={onSubmit}>
        {fields.map((field) => {
          const errorMessage = errors[field.hash];
          const isInvalid = Boolean(errorMessage);

          if (field.component === 'TextField') {
            return (
              <Input
                key={field.hash}
                name={field.hash}
                label={field.label}
                value={field.value ?? ''}
                onChange={(value) => updateFieldValue(field.hash, value)}
                isRequired={field.required}
                isInvalid={isInvalid}
                errorMessage={errorMessage}
              />
            );
          }

          if (field.component === 'SelectField') {
            return (
              <Select
                key={field.hash}
                name={field.hash}
                label={field.label}
                value={field.value}
                onChange={(key) => updateFieldValue(field.hash, key)}
                isRequired={field.required}
                isInvalid={isInvalid}
                errorMessage={errorMessage}
                placeholder="Choose an option"
              >
                {(field.enum ?? []).map((option) => (
                  <SelectItem key={option} id={option}>
                    {option}
                  </SelectItem>
                ))}
              </Select>
            );
          }

          return (
            <Checkbox
              key={field.hash}
              name={field.hash}
              isSelected={field.value === 'true'}
              onChange={(isSelected) => updateFieldValue(field.hash, isSelected ? 'true' : 'false')}
            >
              {field.label}
            </Checkbox>
          );
        })}
        <Button type="submit">Submit</Button>
        {submitted ? (
          <pre className="overflow-auto rounded-md bg-ash-alpha-100 p-3 type-caption-regular">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        ) : null}
      </Form>
    );
  },
};
