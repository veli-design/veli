import * as React from 'react';
import {
  DateField as AriaDateField,
  FieldError,
  Label,
  Text,
  type DateFieldProps as AriaDateFieldProps,
  type DateValue,
} from 'react-aria-components';
import { twMerge } from 'tailwind-merge';
import {
  DateSegments,
  fieldLabelRowVariants,
  fieldLabelVariants,
  fieldMetaVariants,
  fieldRootVariants,
  fieldShellVariants,
  messageVariants,
} from './date-shared';

export interface DateFieldProps<T extends DateValue>
  extends Omit<AriaDateFieldProps<T>, 'children' | 'className' | 'style'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  labelSupplementary?: React.ReactNode;
  showRequiredIndicator?: boolean;
  className?: string;
  inputClassName?: string;
}

export function DateField<T extends DateValue>({
  label,
  description,
  errorMessage,
  labelSupplementary,
  showRequiredIndicator = true,
  className,
  inputClassName,
  ...props
}: DateFieldProps<T>) {
  const showRequired = showRequiredIndicator && Boolean(props.isRequired);

  return (
    <AriaDateField {...props} className={twMerge(fieldRootVariants(), className)}>
      {({ isDisabled, isInvalid, isReadOnly }) => (
        <>
          {label || labelSupplementary || showRequired ? (
            <div className={fieldLabelRowVariants()}>
              <div className="flex min-w-0 items-center gap-1.5">
                {label ? <Label className={fieldLabelVariants({ isDisabled })}>{label}</Label> : null}
                {labelSupplementary ? (
                  <span className={fieldMetaVariants({ isDisabled })}>{labelSupplementary}</span>
                ) : null}
                {showRequired ? (
                  <span className={fieldMetaVariants({ tone: 'danger', isDisabled })}>*</span>
                ) : null}
              </div>
            </div>
          ) : null}

          <div
            className={twMerge(
              fieldShellVariants({
                isDisabled,
                isInvalid,
                isReadOnly,
              }),
              inputClassName
            )}
          >
            <DateSegments />
          </div>

          {isInvalid ? (
            <FieldError className={messageVariants({ tone: 'danger' })}>{errorMessage}</FieldError>
          ) : description ? (
            <Text slot="description" className={messageVariants()}>
              {description}
            </Text>
          ) : null}
        </>
      )}
    </AriaDateField>
  );
}
