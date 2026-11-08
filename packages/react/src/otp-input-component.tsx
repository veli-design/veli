'use client';

import * as React from 'react';
import {
  Button as AriaButton,
  Group,
  Input as AriaInput,
  Label,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';
import { InfoIcon } from '@phosphor-icons/react';
import { twMerge } from 'tailwind-merge';
import {
  defaultFieldUnderlineError,
  defaultFieldUnderlineErrorPressed,
  defaultFieldUnderlinePressed,
  defaultFieldUnderlineRest,
  defaultFieldUnderlineShell,
  FieldMessage,
  fieldHeaderActionVariants,
  fieldHeaderInfoTooltipTriggerVariants,
  fieldHeaderLabelVariants,
  fieldHeaderRequiredIndicatorVariants,
  fieldHeaderSupplementaryVariants,
  fieldHelperTone,
  getFieldOptionalLabel,
  outlineFieldStrokeErrorPressed,
  outlineFieldStrokePressed,
  shouldShowFieldOptional,
} from './field-shared.js';
import {
  alphabetSpec,
  createOTPDocument,
  planOTPClipboard,
  projectOTPTrack,
  reduceOTPDocument,
  resolveOTPLayout,
  selectionForDocument,
  type OTPAlphabet,
  type OTPDocument,
  type OTPDocumentEvent,
  type OTPLayoutProps,
  type OTPMotion,
  type OTPSlotView,
  type OTPTrackView,
} from './otp-input-model.js';
import { useVeliLanguage } from './provider.js';
import { assignRef, type RefProp } from './ref.js';
import { Tooltip, TooltipTrigger } from './tooltip.js';

export type { OTPAlphabet, OTPSlotView } from './otp-input-model.js';

export type OTPInputSize = 'sm' | 'md' | 'lg';
export type OTPInputAppearance = 'default' | 'outline';

const otpInputRootVariants = cva('flex w-full flex-col font-sans antialiased');

// Transparent row. Slot rings sit outside the boxes, so this must not clip or paint a shell.
const otpGroupClassName = 'group relative flex w-fit items-center';

// 16px keeps iOS from zooming on focus.
const otpNativeInputClassName =
  'absolute inset-0 z-[2] size-full border-0 bg-transparent p-0 text-[16px] text-transparent caret-transparent outline-none selection:bg-transparent disabled:cursor-not-allowed autofill:[transition:background-color_0s_600000s] autofill:[-webkit-text-fill-color:transparent] [&:-webkit-autofill]:[transition:background-color_0s_600000s] [&:-webkit-autofill]:[-webkit-text-fill-color:transparent]';

// The native input covers the row, so slot :hover never fires. group-hover paints every rest box.
const otpSlotFocusRing =
  'group-has-[input[data-focus-visible]]:data-[caret]:ring-2 group-has-[input[data-focus-visible]]:data-[caret]:ring-border-focus group-has-[input[data-focus-visible]]:data-[caret]:ring-offset-2 group-has-[input[data-focus-visible]]:data-[caret]:ring-offset-bg-surface-raised';

const otpSlotVariants = cva(
  `relative flex shrink-0 items-center justify-center rounded-field transition-[background-color,box-shadow] duration-normal ease-out motion-reduce:transition-none ${otpSlotFocusRing}`,
  {
    variants: {
      appearance: {
        default: '',
        outline: 'group-has-[input[data-focus-visible]]:data-[caret]:shadow-none',
      },
      size: {
        sm: 'h-9 w-9 type-body-sm-regular',
        md: 'h-11 w-11 type-body-sm-regular',
        lg: 'h-13 w-13 type-body-md-regular',
      },
      isDisabled: {
        true: 'cursor-not-allowed bg-text-input-bg-hover text-disabled',
        false: 'text-base-strong',
      },
      isInvalid: {
        true: '',
        false: '',
      },
      isReadOnly: {
        true: '',
        false: '',
      },
      isActive: {
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
        isActive: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineRest} bg-text-input-bg group-hover:bg-text-input-bg-hover group-hover:after:bg-text-input-stroke-hover`,
      },
      {
        appearance: 'default',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        isActive: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlinePressed} bg-text-input-bg-pressed`,
      },
      {
        appearance: 'default',
        isDisabled: false,
        isInvalid: true,
        isActive: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineError} bg-text-input-bg group-hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'default',
        isDisabled: false,
        isInvalid: true,
        isActive: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineErrorPressed} bg-text-input-bg group-hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'default',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        isActive: false,
        className:
          'bg-text-input-bg shadow-[inset_0_0_0_1px_var(--veli-color-text-input-stroke-default)] group-hover:bg-text-input-bg-hover group-hover:shadow-[inset_0_0_0_1.5px_var(--veli-color-text-input-stroke-hover)]',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        isActive: true,
        className: `bg-text-input-bg-pressed ${outlineFieldStrokePressed}`,
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: true,
        isActive: false,
        className:
          'bg-text-input-bg shadow-[inset_0_0_0_1px_var(--veli-color-text-input-stroke-error)] group-hover:bg-text-input-bg-hover group-hover:shadow-[inset_0_0_0_1.5px_var(--veli-color-text-input-stroke-error)]',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: true,
        isActive: true,
        className: `bg-text-input-bg ${outlineFieldStrokeErrorPressed}`,
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
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
      isActive: false,
    },
  },
);

const otpCaretBarVariants = cva(
  'pointer-events-none absolute top-1/2 h-4 w-px -translate-y-1/2 bg-text-base-strong animate-pulse motion-reduce:animate-none',
  {
    variants: {
      position: {
        append: 'left-1/2',
        trailing: 'right-0',
      },
    },
  },
);

const infoTooltipDefaultAriaLabels = {
  en: 'More information',
  dv: 'އިތުރު މަޢުލޫމާތު',
} as const;

const keyMotions: Partial<Record<string, OTPMotion>> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'start',
  ArrowDown: 'end',
  Home: 'start',
  End: 'end',
};

const metaKeyMotions: Partial<Record<string, OTPMotion>> = {
  ArrowLeft: 'start',
  ArrowRight: 'end',
};

interface OTPSlotChrome {
  size: OTPInputSize;
  appearance: OTPInputAppearance;
  isDisabled: boolean;
  isInvalid: boolean;
  isReadOnly: boolean;
}

const OTPSlotChromeContext = React.createContext<OTPSlotChrome | null>(null);

function useOTPSlotChrome() {
  const chrome = React.useContext(OTPSlotChromeContext);
  if (!chrome) {
    throw new Error('OTPInputSlot must be rendered by OTPInput through renderSlot.');
  }
  return chrome;
}

function writeSelection(input: HTMLInputElement, doc: OTPDocument) {
  if (input.ownerDocument.activeElement !== input) return;
  const { start, end } = selectionForDocument(doc);
  if (input.selectionStart !== start || input.selectionEnd !== end) {
    input.setSelectionRange(start, end);
  }
}

function slotIndexAt(container: Element, clientX: number) {
  let nearest: number | null = null;
  let nearestDistance = Infinity;
  for (const slot of container.querySelectorAll<HTMLElement>('[data-otp-index]')) {
    const rect = slot.getBoundingClientRect();
    const distance = Math.max(rect.left - clientX, clientX - rect.right, 0);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = Number(slot.dataset.otpIndex);
    }
  }
  return nearest;
}

type OTPAriaProps = Omit<
  AriaTextFieldProps,
  | 'children'
  | 'className'
  | 'style'
  | 'validate'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'type'
  | 'pattern'
  | 'inputMode'
  | 'maxLength'
  | 'minLength'
  | 'autoComplete'
  | 'autoCorrect'
  | 'autoCapitalize'
  | 'spellCheck'
  | 'enterKeyHint'
>;

export type OTPInputProps = OTPAriaProps &
  OTPLayoutProps &
  RefProp<HTMLInputElement> & {
    value?: string;
    defaultValue?: string;
    /** Sanitized string. Fires only when that string changes. */
    onChange?: (value: string) => void;
    /** Fires once per user edit that fills the code. Never from a controlled `value` change. */
    onComplete?: (code: string) => void;
    validate?: AriaTextFieldProps['validate'];
    /** Default `digits`. Owns inputMode, pattern, autoCapitalize, and spellCheck. */
    alphabet?: OTPAlphabet;
    size?: OTPInputSize;
    appearance?: OTPInputAppearance;
    label?: React.ReactNode;
    infoTooltip?: React.ReactNode;
    infoTooltipAriaLabel?: string;
    /** Shows a localized Optional caption beside the label. Hidden when `isRequired` is set. */
    isOptional?: boolean;
    action?: React.ReactNode;
    description?: React.ReactNode;
    errorMessage?: React.ReactNode;
    showRequiredIndicator?: boolean;
    /** Default `one-time-code`. */
    autoComplete?: React.InputHTMLAttributes<HTMLInputElement>['autoComplete'];
    /** Default `done`. */
    enterKeyHint?: React.InputHTMLAttributes<HTMLInputElement>['enterKeyHint'];
    className?: string;
    /**
     * Called once per slot, in order. A custom body should render `OTPInputSlot`
     * so the cell keeps its box, caret, and `data-otp-index`.
     */
    renderSlot?: (slot: OTPSlotView) => React.ReactNode;
    /**
     * Glyph between groups. Omitted, a hyphen shows when there are two or more
     * groups. `null` hides the glyph and keeps the group gap.
     */
    separator?: React.ReactNode;
  };

function OTPTrack({
  track,
  renderSlot,
  separator,
}: {
  track: OTPTrackView;
  renderSlot: OTPInputProps['renderSlot'];
  separator: React.ReactNode;
}) {
  return (
    <div
      aria-hidden
      dir="ltr"
      className="pointer-events-none relative z-[1] flex items-center gap-3"
    >
      {track.groups.map((group) => (
        <React.Fragment key={group.groupIndex}>
          {group.groupIndex > 0 && separator !== null ? (separator ?? <OTPInputSeparator />) : null}
          <div className="flex items-center gap-2">
            {group.slots.map((slot) => (
              <React.Fragment key={slot.index}>
                {renderSlot ? renderSlot(slot) : <OTPInputSlot slot={slot} />}
              </React.Fragment>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export function OTPInput({
  length,
  groups,
  value,
  defaultValue,
  onChange,
  onComplete,
  onFocusChange,
  validate,
  alphabet = 'digits',
  size = 'md',
  appearance = 'default',
  label,
  infoTooltip,
  infoTooltipAriaLabel,
  isOptional = false,
  action,
  description,
  errorMessage,
  showRequiredIndicator = true,
  autoComplete = 'one-time-code',
  enterKeyHint = 'done',
  className,
  renderSlot,
  separator,
  ref,
  ...props
}: OTPInputProps) {
  const languageConfig = useVeliLanguage();
  const layout = resolveOTPLayout(groups ? { groups } : { length });
  const spec = alphabetSpec(alphabet);
  const [stored, setStored] = React.useState(() =>
    createOTPDocument(value ?? defaultValue, layout, alphabet),
  );
  const doc = reduceOTPDocument(
    stored,
    { type: 'external', raw: value ?? stored.text },
    layout,
    alphabet,
  ).document;
  // Keep stored aligned while controlled so dropping `value` does not revive a stale draft.
  if (value !== undefined && doc !== stored) {
    setStored(doc);
  }
  const [isFocused, setIsFocused] = React.useState(false);
  const isEditable = !props.isDisabled && !props.isReadOnly;
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const setInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  function dispatch(event: OTPDocumentEvent) {
    const result = reduceOTPDocument(doc, event, layout, alphabet);
    if (result.document === doc) return false;
    setStored(result.document);
    if (result.document.text !== doc.text) onChange?.(result.document.text);
    if (result.completed) onComplete?.(result.document.text);
    return true;
  }

  function restoreSelection() {
    const input = inputRef.current;
    if (input) writeSelection(input, doc);
  }

  const beforeInputRef = React.useRef<(event: InputEvent) => void>(() => {});
  React.useLayoutEffect(() => {
    beforeInputRef.current = (event) => {
      if (!isEditable || event.data == null) return;
      if (event.inputType === 'insertText') {
        if (dispatch({ type: 'insert', data: event.data })) event.preventDefault();
        return;
      }
      // Some mobile autofill paths use this without a following change event.
      if (event.inputType === 'insertReplacementText') {
        if (dispatch({ type: 'replace', raw: event.data })) event.preventDefault();
      }
    };
  });

  React.useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const listener = (event: InputEvent) => beforeInputRef.current(event);
    input.addEventListener('beforeinput', listener);
    return () => input.removeEventListener('beforeinput', listener);
  }, []);

  React.useLayoutEffect(() => {
    if (isFocused && inputRef.current) writeSelection(inputRef.current, doc);
  }, [doc, isFocused]);

  const track = projectOTPTrack(doc, layout, isFocused);
  const resolvedInfoTooltipAriaLabel =
    infoTooltipAriaLabel ?? infoTooltipDefaultAriaLabels[languageConfig.language];

  return (
    <AriaTextField
      {...props}
      value={doc.text}
      onChange={(raw) => {
        // A rejected edit leaves React to restore the controlled value, which
        // moves the native caret; put it back once that restore has run.
        if (!dispatch({ type: 'value', raw })) queueMicrotask(restoreSelection);
      }}
      onFocusChange={(focused) => {
        setIsFocused(focused);
        onFocusChange?.(focused);
      }}
      validate={validate}
      className={twMerge(otpInputRootVariants(), className)}
    >
      {({ isDisabled, isInvalid, isReadOnly, isRequired }) => {
        const showOptionalLabel = shouldShowFieldOptional(isOptional, isRequired);

        return (
          <>
            {label ||
            infoTooltip ||
            showOptionalLabel ||
            action ||
            (showRequiredIndicator && isRequired) ? (
              <div className="flex w-full items-center gap-2 pb-2">
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
                </div>
                {action ? (
                  <div className={fieldHeaderActionVariants({ isDisabled })}>{action}</div>
                ) : null}
              </div>
            ) : null}

            <Group className={otpGroupClassName}>
              <OTPSlotChromeContext.Provider
                value={{ size, appearance, isDisabled, isInvalid, isReadOnly }}
              >
                <OTPTrack track={track} renderSlot={renderSlot} separator={separator} />
              </OTPSlotChromeContext.Provider>
              <AriaInput
                ref={setInputRef}
                dir="ltr"
                autoComplete={autoComplete}
                enterKeyHint={enterKeyHint}
                inputMode={spec.inputMode}
                pattern={spec.pattern}
                autoCapitalize={spec.autoCapitalize}
                autoCorrect={spec.autoCorrect}
                spellCheck={spec.spellCheck}
                className={otpNativeInputClassName}
                onKeyDown={(event) => {
                  const motion =
                    (event.metaKey ? metaKeyMotions[event.key] : undefined) ??
                    keyMotions[event.key];
                  if (motion) {
                    event.preventDefault();
                    dispatch({ type: 'motion', motion });
                  } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a') {
                    event.preventDefault();
                  }
                }}
                onPaste={(event) => {
                  const plan = planOTPClipboard(
                    event.clipboardData.getData('text'),
                    layout,
                    alphabet,
                  );
                  if (plan.kind === 'nativeInsert') return;
                  event.preventDefault();
                  if (plan.kind === 'replace' && isEditable) {
                    dispatch({ type: 'replace', raw: plan.raw });
                  }
                }}
                onClick={(event) => {
                  const container = event.currentTarget.parentElement;
                  const slotIndex = container ? slotIndexAt(container, event.clientX) : null;
                  if (slotIndex === null || !dispatch({ type: 'point', slotIndex })) {
                    restoreSelection();
                  }
                }}
              />
            </Group>

            <div className="empty:hidden [&:not(:empty)]:pt-1">
              <FieldMessage
                isInvalid={isInvalid}
                size={size}
                description={description}
                descriptionTone={fieldHelperTone(isDisabled)}
                errorMessage={errorMessage}
              />
            </div>
          </>
        );
      }}
    </AriaTextField>
  );
}

export interface OTPInputSlotProps {
  /** A view from `renderSlot`. */
  slot: OTPSlotView;
  className?: string;
}

export function OTPInputSlot({ slot, className }: OTPInputSlotProps) {
  const { size, appearance, isDisabled, isInvalid, isReadOnly } = useOTPSlotChrome();
  const isActive = slot.caret !== 'none';

  return (
    <span
      aria-hidden
      data-otp-index={slot.index}
      data-caret={slot.caret === 'none' ? undefined : slot.caret}
      className={twMerge(
        otpSlotVariants({ appearance, size, isDisabled, isInvalid, isReadOnly, isActive }),
        className,
      )}
    >
      {slot.char}
      {slot.caret === 'overtype' ? (
        <span className="pointer-events-none absolute inset-x-0.5 bottom-0 z-[1] h-0.5 rounded-full bg-text-base-strong animate-pulse motion-reduce:animate-none" />
      ) : null}
      {slot.caret === 'append' || slot.caret === 'trailing' ? (
        <span className={otpCaretBarVariants({ position: slot.caret })} />
      ) : null}
    </span>
  );
}

export interface OTPInputSeparatorProps {
  children?: React.ReactNode;
  className?: string;
}

export function OTPInputSeparator({ children = '-', className }: OTPInputSeparatorProps) {
  return (
    <span aria-hidden className={twMerge('flex shrink-0 items-center text-base-subtle', className)}>
      {children}
    </span>
  );
}
