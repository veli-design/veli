import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  useFieldControlProps,
  type FieldControlProps,
  type FieldProps,
} from './field';

declare function expectType<T>(value: T): void;

export function FieldTypeExpectations() {
  const orientation: NonNullable<FieldProps['orientation']> = 'responsive';
  const controlProps: FieldControlProps = useFieldControlProps();

  expectType<'vertical' | 'horizontal' | 'responsive'>(orientation);
  expectType<string | undefined>(controlProps.id);
  expectType<string | undefined>(controlProps['aria-labelledby']);
  expectType<string | undefined>(controlProps['aria-describedby']);
  expectType<boolean | undefined>(controlProps['aria-invalid']);
  expectType<boolean | undefined>(controlProps['aria-required']);
  expectType<boolean | undefined>(controlProps.disabled);

  return (
    <>
      <Field orientation="horizontal" isInvalid isRequired size="lg">
        <FieldLabel>Email</FieldLabel>
        <FieldControl>
          <input type="email" />
        </FieldControl>
        <FieldDescription>We never share your email.</FieldDescription>
        <FieldError errors={[{ message: 'Required' }, 'Too short']} />
      </Field>
      <FieldError errors={undefined} />
      <FieldError>Choose another username.</FieldError>
      {/* @ts-expect-error orientation must be a supported Field layout */}
      <Field orientation="diagonal" />
    </>
  );
}
