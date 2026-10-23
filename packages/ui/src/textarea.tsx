'use client';

import * as React from 'react';
import {
  Button as AriaButton,
  Group,
  Label,
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { InfoIcon } from '@phosphor-icons/react';
import {
  defaultFieldUnderlineError,
  defaultFieldUnderlineErrorFocusPressed,
  defaultFieldUnderlineFocusPressed,
  defaultFieldUnderlineRest,
  defaultFieldUnderlineShell,
  FieldMessage,
  fieldHeaderInfoTooltipTriggerVariants,
  fieldHelperTone,
  fieldHeaderLabelVariants,
  fieldHeaderRequiredIndicatorVariants,
  fieldHeaderSupplementaryVariants,
  fieldInputAutofill,
  getFieldOptionalLabel,
  shouldShowFieldOptional,
} from './field-shared.js';
import { type VeliDirection, useVeliLanguage } from './provider.js';
import { Tooltip, TooltipTrigger } from './tooltip.js';
import { webkitDhivehiTextBaselineClassName } from './typography-shared.js';
import { twMerge } from 'tailwind-merge';
import { type RefProp } from './ref.js';

const textareaRootVariants = cva('flex w-full flex-col gap-1.5 font-sans antialiased');

const inlineSlotVariants = cva('flex shrink-0 items-center justify-center', {
  variants: {
    isDisabled: {
      true: 'text-disabled',
      false: 'text-base-subtle',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const characterCounterVariants = cva(
  'inline-flex shrink-0 items-center type-body-sm-regular tabular-nums text-base-subtle',
  {
    variants: {
      isDisabled: {
        true: 'text-disabled',
        false: '',
      },
    },
    defaultVariants: {
      isDisabled: false,
    },
  },
);

const shellMinHeights = {
  sm: 120,
  md: 146,
  lg: 173,
} as const;

/**
 * Outline stroke as an inset box-shadow (Figma strokeAlign INSIDE).
 * Rest 1px, hover 1.5px, active/focus-within 2px — outer box never changes.
 * Hide the inner stroke when the keyboard focus ring is shown.
 */
const outlineFieldStrokeRest =
  'shadow-[inset_0_0_0_1px_var(--veli-color-text-input-stroke-default)] [&:hover:not(:focus-within)]:shadow-[inset_0_0_0_1.5px_var(--veli-color-text-input-stroke-hover)] [&:focus-within:not(:has(textarea[data-focus-visible]))]:shadow-[inset_0_0_0_2px_var(--veli-color-text-input-stroke-pressed)]';

const outlineFieldStrokeError =
  'shadow-[inset_0_0_0_1px_var(--veli-color-text-input-stroke-error)] [&:hover:not(:focus-within)]:shadow-[inset_0_0_0_1.5px_var(--veli-color-text-input-stroke-error)] focus-within:shadow-[inset_0_0_0_2px_var(--veli-color-text-input-stroke-error)]';

const outlineFieldStrokeFocusVisibleHide =
  'has-[textarea[data-focus-visible]]:shadow-none has-[textarea[data-focus-visible]]:hover:shadow-none';

const fieldShellVariants = cva(
  'relative flex w-full items-start rounded-md overflow-hidden transition-[background-color,box-shadow] duration-normal ease-out motion-reduce:transition-none has-[textarea[data-focus-visible]]:ring-2 has-[textarea[data-focus-visible]]:ring-border-focus has-[textarea[data-focus-visible]]:ring-offset-2 has-[textarea[data-focus-visible]]:ring-offset-bg-surface-raised',
  {
    variants: {
      appearance: {
        default: '',
        outline: '',
      },
      size: {
        sm: 'min-h-[120px] py-2 px-3',
        md: 'min-h-[146px] py-3 px-4',
        lg: 'min-h-[173px] py-3.5 px-4',
      },
      isDisabled: {
        true: 'cursor-not-allowed',
        false: 'cursor-text',
      },
      isInvalid: {
        true: '',
        false: '',
      },
      isReadOnly: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        appearance: 'default',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineRest} ${defaultFieldUnderlineFocusPressed} bg-text-input-bg hover:bg-text-input-bg-hover focus-within:bg-text-input-bg-pressed focus-within:hover:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'default',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'default',
        isDisabled: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'default',
        isInvalid: true,
        isDisabled: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineError} ${defaultFieldUnderlineErrorFocusPressed} bg-text-input-bg hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'default',
        isDisabled: true,
        isInvalid: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'default',
        isDisabled: true,
        isReadOnly: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        className: `${outlineFieldStrokeRest} ${outlineFieldStrokeFocusVisibleHide} bg-text-input-bg [&:hover:not(:focus-within)]:bg-text-input-bg-hover focus-within:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isDisabled: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isInvalid: true,
        isDisabled: false,
        className: `${outlineFieldStrokeError} bg-text-input-bg [&:hover:not(:focus-within)]:bg-text-input-bg-hover focus-within:bg-text-input-bg`,
      },
      {
        appearance: 'outline',
        isDisabled: true,
        isInvalid: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isDisabled: true,
        isReadOnly: true,
        className: 'bg-text-input-bg-hover',
      },
    ],
    defaultVariants: {
      appearance: 'default',
      size: 'md',
      isDisabled: false,
      isInvalid: false,
      isReadOnly: false,
    },
  },
);

type TextAreaAppearance = VariantProps<typeof fieldShellVariants>['appearance'];
type TextAreaSize = VariantProps<typeof fieldShellVariants>['size'];

const textareaElementVariants = cva(
  `relative z-0 h-full min-h-[inherit] min-w-0 flex-1 resize-none border-0 bg-transparent text-base-strong outline-none placeholder:text-base-inactive disabled:text-disabled ${fieldInputAutofill} [&:lang(dv)]:!font-[var(--veli-font-dhivehi-faseyha)] ${webkitDhivehiTextBaselineClassName}`,
  {
    variants: {
      size: {
        sm: '-mx-3 -my-2 px-3 py-2 type-body-sm-regular',
        md: '-mx-4 -my-3 px-4 py-3 type-body-sm-regular',
        lg: '-mx-4 -my-3.5 px-4 py-3.5 type-body-md-regular',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const resizeIndicatorVariants = cva(
  'absolute bottom-1 end-1 z-[1] flex size-4 shrink-0 touch-none items-center justify-center border-0 bg-transparent p-0 outline-none transition-colors duration-normal ease-out motion-reduce:transition-none',
  {
    variants: {
      isDisabled: {
        true: 'cursor-not-allowed text-disabled',
        false: 'cursor-ns-resize text-base-subtle',
      },
    },
    defaultVariants: {
      isDisabled: false,
    },
  },
);

const infoTooltipDefaultAriaLabels = {
  en: 'More information',
  dv: 'އިތުރު މަޢުލޫމާތު',
} as const;

function clampHeight(value: number, min: number, max?: number) {
  let result = Math.max(value, min);

  if (max != null) {
    result = Math.min(result, max);
  }

  return result;
}

interface UseVerticalTextAreaResizeOptions {
  shellRef: React.RefObject<HTMLElement | null>;
  enabled: boolean;
  minHeight: number;
  maxHeight?: number;
}

function useVerticalTextAreaResize({
  shellRef,
  enabled,
  minHeight,
  maxHeight,
}: UseVerticalTextAreaResizeOptions) {
  const [shellHeight, setShellHeight] = React.useState<number | undefined>(undefined);
  const dragStateRef = React.useRef<{ startY: number; startHeight: number } | null>(null);

  const clearDragState = React.useCallback(() => {
    dragStateRef.current = null;

    if (typeof document === 'undefined') {
      return;
    }

    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const endDrag = React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!dragStateRef.current) return;

      clearDragState();

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    [clearDragState],
  );

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!enabled || !shellRef.current) return;

      event.preventDefault();
      event.stopPropagation();

      dragStateRef.current = {
        startY: event.clientY,
        startHeight: shellRef.current.getBoundingClientRect().height,
      };

      event.currentTarget.setPointerCapture(event.pointerId);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    },
    [enabled, shellRef],
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!dragStateRef.current) return;

      const { startY, startHeight } = dragStateRef.current;
      const nextHeight = clampHeight(startHeight + (event.clientY - startY), minHeight, maxHeight);

      setShellHeight(nextHeight);
    },
    [minHeight, maxHeight],
  );

  React.useEffect(() => {
    return clearDragState;
  }, [clearDragState]);

  return {
    shellStyle: shellHeight != null ? ({ height: shellHeight } as const) : undefined,
    resizeHandleProps: enabled
      ? {
          onPointerDown: handlePointerDown,
          onPointerMove: handlePointerMove,
          onPointerUp: endDrag,
          onPointerCancel: endDrag,
        }
      : undefined,
  };
}

function focusTextAreaFromShell(event: React.MouseEvent<HTMLElement>, isDisabled: boolean) {
  if (isDisabled) return;

  const textarea = event.currentTarget.querySelector('textarea');
  if (!textarea) return;

  const target = event.target as HTMLElement;
  if (
    target === textarea ||
    target.closest(
      'input, textarea, button, a, select, [role="button"], [data-textarea-resize-handle]',
    )
  ) {
    return;
  }

  event.preventDefault();
  textarea.focus();
}

function getInitialCharacterCount(
  value: TextAreaProps['value'],
  defaultValue: TextAreaProps['defaultValue'],
) {
  const initial = value ?? defaultValue ?? '';

  return typeof initial === 'string' ? initial.length : 0;
}

function TextAreaResizeIndicator({ direction }: { direction: VeliDirection }) {
  return (
    <svg aria-hidden className="size-4" viewBox="0 0 16 16" fill="none">
      <g transform={direction === 'rtl' ? 'translate(16 0) scale(-1 1)' : undefined}>
        <path d="M14 10L10 14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        <path d="M14 6L6 14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function CharacterCounterRing({ value, max }: { value: number; max: number }) {
  const size = 14;
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;

  return (
    <svg aria-hidden className="size-3.5 shrink-0" viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        className="stroke-border-neutral"
        fill="none"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        className="stroke-border-success-emphasis"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress)}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

export interface TextAreaProps
  extends
    Omit<AriaTextFieldProps, 'children' | 'className' | 'style' | 'spellCheck'>,
    Omit<
      VariantProps<typeof fieldShellVariants>,
      'appearance' | 'isDisabled' | 'isInvalid' | 'isReadOnly' | 'size'
    >,
    RefProp<HTMLTextAreaElement> {
  appearance?: TextAreaAppearance;
  size?: TextAreaSize;
  label?: React.ReactNode;
  infoTooltip?: React.ReactNode;
  infoTooltipAriaLabel?: string;
  isOptional?: boolean;
  labelIcon?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  showRequiredIndicator?: boolean;
  showCharacterCounter?: boolean;
  isResizable?: boolean;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
  autoCapitalize?: React.TextareaHTMLAttributes<HTMLTextAreaElement>['autoCapitalize'];
  autoComplete?: React.TextareaHTMLAttributes<HTMLTextAreaElement>['autoComplete'];
  autoCorrect?: React.TextareaHTMLAttributes<HTMLTextAreaElement>['autoCorrect'];
  enterKeyHint?: React.TextareaHTMLAttributes<HTMLTextAreaElement>['enterKeyHint'];
  inputMode?: React.TextareaHTMLAttributes<HTMLTextAreaElement>['inputMode'];
  maxLength?: React.TextareaHTMLAttributes<HTMLTextAreaElement>['maxLength'];
  minLength?: React.TextareaHTMLAttributes<HTMLTextAreaElement>['minLength'];
  placeholder?: string;
  rows?: React.TextareaHTMLAttributes<HTMLTextAreaElement>['rows'];
  spellCheck?: React.TextareaHTMLAttributes<HTMLTextAreaElement>['spellCheck'];
  wrap?: React.TextareaHTMLAttributes<HTMLTextAreaElement>['wrap'];
}

export function TextArea({
  label,
  infoTooltip,
  infoTooltipAriaLabel,
  isOptional = false,
  labelIcon,
  description,
  errorMessage,
  showRequiredIndicator = true,
  showCharacterCounter,
  isResizable = true,
  minHeight,
  maxHeight,
  className,
  appearance = 'default',
  size = 'md',
  autoCapitalize,
  autoComplete,
  autoCorrect,
  enterKeyHint,
  inputMode,
  maxLength,
  minLength,
  placeholder,
  rows,
  spellCheck,
  wrap,
  value,
  defaultValue,
  onChange,
  isDisabled: isDisabledProp,
  isReadOnly: isReadOnlyProp,
  ref,
  ...props
}: TextAreaProps) {
  const languageConfig = useVeliLanguage();
  const shellRef = React.useRef<HTMLDivElement>(null);
  const resolvedInfoTooltipAriaLabel =
    infoTooltipAriaLabel ?? infoTooltipDefaultAriaLabels[languageConfig.language];
  const resolvedMinHeight = minHeight ?? shellMinHeights[size ?? 'md'];
  const [uncontrolledCharacterCount, setUncontrolledCharacterCount] = React.useState(() =>
    getInitialCharacterCount(value, defaultValue),
  );
  const characterCount = typeof value === 'string' ? value.length : uncontrolledCharacterCount;
  const shouldShowCharacterCounter = showCharacterCounter ?? maxLength != null;
  const { shellStyle, resizeHandleProps } = useVerticalTextAreaResize({
    shellRef,
    enabled: isResizable && !isDisabledProp && !isReadOnlyProp,
    minHeight: resolvedMinHeight,
    maxHeight,
  });

  const handleChange = (nextValue: string) => {
    if (typeof value !== 'string') {
      setUncontrolledCharacterCount(nextValue.length);
    }

    onChange?.(nextValue);
  };

  return (
    <AriaTextField
      {...props}
      isDisabled={isDisabledProp}
      isReadOnly={isReadOnlyProp}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      className={twMerge(textareaRootVariants(), className)}
    >
      {({ isDisabled, isInvalid, isReadOnly, isRequired }) => {
        const showResizeIndicator = isResizable && !isDisabled && !isReadOnly;
        const showOptionalLabel = shouldShowFieldOptional(isOptional, isRequired);

        return (
          <>
            {label ||
            infoTooltip ||
            showOptionalLabel ||
            labelIcon ||
            (showRequiredIndicator && isRequired) ||
            shouldShowCharacterCounter ? (
              <div className="flex w-full items-center justify-between gap-2">
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
                        <InfoIcon size={16} aria-hidden />
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
                  {showRequiredIndicator && isRequired ? (
                    <span className={fieldHeaderRequiredIndicatorVariants({ isDisabled })}>*</span>
                  ) : null}
                  {labelIcon ? (
                    <span className={inlineSlotVariants({ isDisabled })}>{labelIcon}</span>
                  ) : null}
                </div>
                {shouldShowCharacterCounter && maxLength != null ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className={characterCounterVariants({ isDisabled })} dir="ltr">
                      {characterCount}/{maxLength}
                    </span>
                    <CharacterCounterRing max={maxLength} value={characterCount} />
                  </div>
                ) : null}
              </div>
            ) : null}

            <Group
              ref={shellRef}
              style={{ minHeight: resolvedMinHeight, ...shellStyle }}
              className={fieldShellVariants({
                appearance,
                size,
                isDisabled,
                isInvalid,
                isReadOnly,
              })}
              onMouseDown={(event) => focusTextAreaFromShell(event, isDisabled)}
            >
              <AriaTextArea
                ref={ref}
                autoCapitalize={autoCapitalize}
                autoComplete={autoComplete}
                autoCorrect={autoCorrect}
                enterKeyHint={enterKeyHint}
                inputMode={inputMode}
                maxLength={maxLength}
                minLength={minLength}
                placeholder={placeholder}
                rows={rows}
                spellCheck={spellCheck}
                wrap={wrap}
                className={textareaElementVariants({ size })}
              />
              {showResizeIndicator && resizeHandleProps ? (
                <div
                  aria-hidden
                  data-textarea-resize-handle
                  className={resizeIndicatorVariants({ isDisabled })}
                  {...resizeHandleProps}
                >
                  <TextAreaResizeIndicator direction={languageConfig.direction} />
                </div>
              ) : null}
            </Group>

            <FieldMessage
              isInvalid={isInvalid}
              size={size ?? 'md'}
              description={description}
              descriptionTone={fieldHelperTone(isDisabled)}
              errorMessage={errorMessage}
            />
          </>
        );
      }}
    </AriaTextField>
  );
}
