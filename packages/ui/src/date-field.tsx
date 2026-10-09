'use client';

import * as React from 'react';
import { Info } from 'phosphor-react';
import {
  Button as AriaButton,
  DateField as AriaDateField,
  Group,
  Label,
  type DateFieldProps as AriaDateFieldProps,
  type DateValue,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { DateSegments, fieldRootVariants, fieldShellVariants } from './date-shared.js';
import {
  FieldMessage,
  fieldHeaderInfoTooltipTriggerVariants,
  fieldHeaderLabelVariants,
  fieldHeaderRequiredIndicatorVariants,
  fieldHeaderSupplementaryVariants,
  getFieldOptionalLabel,
  shouldShowFieldOptional,
} from './field-shared.js';
import { useVeliLanguage } from './provider.js';
import { Tooltip, TooltipTrigger } from './tooltip.js';

type DateFieldAppearance = VariantProps<typeof fieldShellVariants>['appearance'];
type DateFieldSize = VariantProps<typeof fieldShellVariants>['size'];

const errorIconVariants = cva('relative z-[1] flex shrink-0 items-center justify-center', {
  variants: {
    isDisabled: {
      true: 'text-disabled',
      false: 'text-danger-muted',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const infoTooltipDefaultAriaLabels = {
  en: 'More information',
  dv: 'އިތުރު މަޢުލޫމާތު',
} as const;

function focusDateSegmentFromShell(event: React.MouseEvent<HTMLElement>, isDisabled: boolean) {
  if (isDisabled) return;

  const target = event.target as HTMLElement;
  if (target.closest('[role="spinbutton"], button, a, [role="button"]')) {
    return;
  }

  const segment = event.currentTarget.querySelector<HTMLElement>('[role="spinbutton"]');
  if (!segment) return;

  event.preventDefault();
  segment.focus();
}

export interface DateFieldProps<T extends DateValue>
  extends
    Omit<AriaDateFieldProps<T>, 'children' | 'className' | 'style'>,
    Omit<
      VariantProps<typeof fieldShellVariants>,
      'appearance' | 'isDisabled' | 'isInvalid' | 'isReadOnly' | 'isOpen' | 'size'
    > {
  appearance?: DateFieldAppearance;
  size?: DateFieldSize;
  label?: React.ReactNode;
  infoTooltip?: React.ReactNode;
  infoTooltipAriaLabel?: string;
  isOptional?: boolean;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  showRequiredIndicator?: boolean;
  className?: string;
  inputClassName?: string;
}

export function DateField<T extends DateValue>({
  label,
  infoTooltip,
  infoTooltipAriaLabel,
  isOptional = false,
  description,
  errorMessage,
  showRequiredIndicator = true,
  className,
  inputClassName,
  appearance = 'default',
  size = 'md',
  ...props
}: DateFieldProps<T>) {
  const languageConfig = useVeliLanguage();
  const resolvedInfoTooltipAriaLabel =
    infoTooltipAriaLabel ?? infoTooltipDefaultAriaLabels[languageConfig.language];

  return (
    <AriaDateField {...props} className={twMerge(fieldRootVariants(), className)}>
      {({ isDisabled, isInvalid, isReadOnly, state }) => {
        const showRequired = showRequiredIndicator && state.isRequired;
        const showOptionalLabel = shouldShowFieldOptional(isOptional, state.isRequired);

        return (
          <>
            {label || infoTooltip || showOptionalLabel || showRequired ? (
              <div className="flex w-full items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {label ? (
                    <Label className={fieldHeaderLabelVariants({ size, isDisabled })}>
                      {label}
                    </Label>
                  ) : null}
                  {infoTooltip ? (
                    <TooltipTrigger>
                      <AriaButton
                        type="button"
                        aria-label={resolvedInfoTooltipAriaLabel}
                        className={fieldHeaderInfoTooltipTriggerVariants({ isDisabled })}
                        isDisabled={isDisabled}
                      >
                        <Info size={16} aria-hidden />
                      </AriaButton>
                      <Tooltip
                        placement="top"
                        lang={languageConfig.lang}
                        dir={languageConfig.direction}
                      >
                        {infoTooltip}
                      </Tooltip>
                    </TooltipTrigger>
                  ) : null}
                  {showOptionalLabel ? (
                    <span className={fieldHeaderSupplementaryVariants({ size, isDisabled })}>
                      {getFieldOptionalLabel(languageConfig.language)}
                    </span>
                  ) : null}
                  {showRequired ? (
                    <span className={fieldHeaderRequiredIndicatorVariants({ isDisabled })}>*</span>
                  ) : null}
                </div>
              </div>
            ) : null}

            <Group
              className={twMerge(
                fieldShellVariants({
                  appearance,
                  size,
                  isDisabled,
                  isInvalid,
                  isReadOnly,
                }),
                inputClassName,
              )}
              onMouseDown={(event) => focusDateSegmentFromShell(event, isDisabled)}
            >
              <DateSegments size={size ?? 'md'} />
              {isInvalid ? (
                <div className={errorIconVariants({ isDisabled })} aria-hidden>
                  <Info size={size === 'lg' ? 20 : 16} weight="fill" />
                </div>
              ) : null}
            </Group>

            <FieldMessage
              isInvalid={isInvalid}
              size={size ?? 'md'}
              description={description}
              errorMessage={errorMessage}
            />
          </>
        );
      }}
    </AriaDateField>
  );
}
