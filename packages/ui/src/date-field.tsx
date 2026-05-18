"use client";

import * as React from 'react';
import {
  DateField as AriaDateField,
  Label,
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
} from './date-shared';
import { FieldMessage } from './field-shared';

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
  return (
    <AriaDateField {...props} className={twMerge(fieldRootVariants(), className)}>
      {({ isDisabled, isInvalid, isReadOnly, state }) => {
        const showRequired = showRequiredIndicator && state.isRequired;

        return (
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

            <FieldMessage
              isInvalid={isInvalid}
              description={description}
              errorMessage={errorMessage}
            />
          </>
        );
      }}
    </AriaDateField>
  );
}
