'use client';

import * as React from 'react';
import {
  Label as AriaLabel,
  LabelContext,
  Text as AriaText,
  type LabelProps as AriaLabelProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { Divider } from './divider.js';
import {
  fieldHeaderLabelVariants,
  fieldHeaderRequiredIndicatorVariants,
  fieldHeaderSupplementaryVariants,
  getFieldOptionalLabel,
  hasRenderableMessage,
  messageVariants,
  shouldShowFieldOptional,
} from './field-shared.js';
import { getErrorMessages } from './form-shared.js';
import { useVeliLanguage } from './provider.js';

type FieldSize = 'sm' | 'md' | 'lg';
type FieldOrientation = 'vertical' | 'horizontal' | 'responsive';

type FieldContextValue = {
  controlId: string;
  labelId: string;
  descriptionIds: readonly string[];
  errorIds: readonly string[];
  registerDescriptionId: (id: string) => void;
  unregisterDescriptionId: (id: string) => void;
  registerErrorId: (id: string) => void;
  unregisterErrorId: (id: string) => void;
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  isOptional: boolean;
  size: FieldSize;
  orientation: FieldOrientation;
};

const FieldContext = React.createContext<FieldContextValue | null>(null);

function useFieldContext() {
  return React.useContext(FieldContext);
}

/** True when a react-aria-components field is already providing LabelContext. */
function useIsInsideRacLabelable() {
  const labelContext = React.useContext(LabelContext) as Record<string, unknown> | null;
  return labelContext != null && Object.keys(labelContext).length > 0;
}

function useDescribedByRegistration(kind: 'description' | 'error', id: string, active: boolean) {
  const field = useFieldContext();

  React.useEffect(() => {
    if (!field || !active) {
      return;
    }

    if (kind === 'description') {
      field.registerDescriptionId(id);
      return () => field.unregisterDescriptionId(id);
    }

    field.registerErrorId(id);
    return () => field.unregisterErrorId(id);
  }, [active, field, id, kind]);
}

function joinIds(ids: readonly string[]) {
  return ids.length > 0 ? ids.join(' ') : undefined;
}

export type FieldControlProps = {
  id?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  disabled?: boolean;
};

/**
 * Returns accessibility props for a control rendered inside {@link Field}.
 * Spread onto a native or custom control. Explicit props on the control win.
 */
export function useFieldControlProps(): FieldControlProps {
  const field = useFieldContext();

  if (!field) {
    return {};
  }

  return {
    id: field.controlId,
    'aria-labelledby': field.labelId,
    'aria-describedby': joinIds([...field.descriptionIds, ...field.errorIds]),
    'aria-invalid': field.isInvalid || undefined,
    'aria-required': field.isRequired || undefined,
    disabled: field.isDisabled || undefined,
  };
}

export interface FieldControlComponentProps {
  children: React.ReactElement<Record<string, unknown>>;
}

/**
 * Clones its single child with {@link useFieldControlProps}. Child props take
 * precedence over the injected values.
 */
export function FieldControl({ children }: FieldControlComponentProps) {
  const controlProps = useFieldControlProps();
  return React.cloneElement(children, {
    ...controlProps,
    ...children.props,
  });
}

const fieldVariants = cva('group/field flex w-full gap-1.5 font-sans antialiased', {
  variants: {
    orientation: {
      vertical: 'flex-col',
      horizontal: 'flex-row items-center gap-4',
      responsive:
        '@container/field-group flex-col @md/field-group:flex-row @md/field-group:items-center @md/field-group:gap-4',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

export interface FieldProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>,
    VariantProps<typeof fieldVariants> {
  className?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  isOptional?: boolean;
  size?: FieldSize;
  orientation?: FieldOrientation;
}

export function Field({
  children,
  className,
  orientation = 'vertical',
  isInvalid = false,
  isDisabled = false,
  isRequired = false,
  isOptional = false,
  size = 'md',
  id,
  ...props
}: FieldProps) {
  const reactId = React.useId();
  const controlId = `field-control-${reactId}`;
  const labelId = `field-label-${reactId}`;
  const [descriptionIds, setDescriptionIds] = React.useState<string[]>([]);
  const [errorIds, setErrorIds] = React.useState<string[]>([]);

  const registerDescriptionId = React.useCallback((descriptionId: string) => {
    setDescriptionIds((current) =>
      current.includes(descriptionId) ? current : [...current, descriptionId],
    );
  }, []);

  const unregisterDescriptionId = React.useCallback((descriptionId: string) => {
    setDescriptionIds((current) => current.filter((value) => value !== descriptionId));
  }, []);

  const registerErrorId = React.useCallback((errorId: string) => {
    setErrorIds((current) => (current.includes(errorId) ? current : [...current, errorId]));
  }, []);

  const unregisterErrorId = React.useCallback((errorId: string) => {
    setErrorIds((current) => current.filter((value) => value !== errorId));
  }, []);

  const contextValue = React.useMemo<FieldContextValue>(
    () => ({
      controlId,
      labelId,
      descriptionIds,
      errorIds,
      registerDescriptionId,
      unregisterDescriptionId,
      registerErrorId,
      unregisterErrorId,
      isInvalid,
      isDisabled,
      isRequired,
      isOptional,
      size,
      orientation,
    }),
    [
      controlId,
      descriptionIds,
      errorIds,
      isDisabled,
      isInvalid,
      isOptional,
      isRequired,
      labelId,
      orientation,
      registerDescriptionId,
      registerErrorId,
      size,
      unregisterDescriptionId,
      unregisterErrorId,
    ],
  );

  return (
    <FieldContext.Provider value={contextValue}>
      <div
        {...props}
        id={id}
        role="group"
        data-invalid={isInvalid || undefined}
        data-disabled={isDisabled || undefined}
        data-orientation={orientation}
        className={twMerge(fieldVariants({ orientation }), className)}
      >
        {children}
      </div>
    </FieldContext.Provider>
  );
}

export interface FieldSetProps extends Omit<
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>,
  'className'
> {
  className?: string;
}

export function FieldSet({ className, ...props }: FieldSetProps) {
  return (
    <fieldset
      {...props}
      className={twMerge(
        'flex w-full min-w-0 flex-col gap-4 border-0 p-0 font-sans antialiased',
        className,
      )}
    />
  );
}

const fieldLegendVariants = cva('p-0 font-sans antialiased', {
  variants: {
    variant: {
      legend: 'type-subtitle-medium text-base-strong',
      label: 'type-body-sm-regular text-base-default',
    },
  },
  defaultVariants: {
    variant: 'legend',
  },
});

export interface FieldLegendProps
  extends
    Omit<React.HTMLAttributes<HTMLLegendElement>, 'className'>,
    VariantProps<typeof fieldLegendVariants> {
  className?: string;
}

export function FieldLegend({ className, variant = 'legend', ...props }: FieldLegendProps) {
  return <legend {...props} className={twMerge(fieldLegendVariants({ variant }), className)} />;
}

export interface FieldGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  className?: string;
}

export function FieldGroup({ className, ...props }: FieldGroupProps) {
  return (
    <div
      {...props}
      className={twMerge(
        '@container/field-group flex w-full flex-col gap-6 font-sans antialiased',
        className,
      )}
    />
  );
}

export interface FieldContentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  className?: string;
}

export function FieldContent({ className, ...props }: FieldContentProps) {
  return (
    <div
      {...props}
      data-slot="field-content"
      className={twMerge('flex min-w-0 flex-1 flex-col gap-1.5', className)}
    />
  );
}

export interface FieldLabelProps extends Omit<AriaLabelProps, 'className' | 'style'> {
  className?: string;
  size?: FieldSize;
  /** Overrides the surrounding Field state when used inside a built-in control. */
  isDisabled?: boolean;
  /** Overrides the surrounding Field state when used inside a built-in control. */
  isRequired?: boolean;
  isOptional?: boolean;
  showRequiredIndicator?: boolean;
}

export function FieldLabel({
  children,
  className,
  size,
  isDisabled: disabledProp,
  isRequired: requiredProp,
  isOptional,
  showRequiredIndicator = true,
  id,
  htmlFor,
  ...props
}: FieldLabelProps) {
  const field = useFieldContext();
  const insideRac = useIsInsideRacLabelable();
  const languageConfig = useVeliLanguage();
  const resolvedSize = size ?? field?.size ?? 'md';
  const isDisabled = disabledProp ?? field?.isDisabled ?? false;
  const isRequired = requiredProp ?? field?.isRequired ?? false;
  const showOptional = shouldShowFieldOptional(isOptional ?? field?.isOptional, isRequired);

  return (
    <AriaLabel
      {...props}
      id={id ?? (!insideRac ? field?.labelId : undefined)}
      htmlFor={htmlFor ?? (!insideRac ? field?.controlId : undefined)}
      data-slot="field-label"
      className={twMerge(
        'inline-flex min-w-0 items-center gap-2',
        fieldHeaderLabelVariants({ size: resolvedSize, isDisabled }),
        className,
      )}
    >
      {children}
      {showOptional ? (
        <span className={fieldHeaderSupplementaryVariants({ size: resolvedSize, isDisabled })}>
          {getFieldOptionalLabel(languageConfig.language)}
        </span>
      ) : null}
      {showRequiredIndicator && isRequired ? (
        <span className={fieldHeaderRequiredIndicatorVariants({ isDisabled })} aria-hidden>
          *
        </span>
      ) : null}
    </AriaLabel>
  );
}

export interface FieldTitleProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'className'> {
  className?: string;
  size?: FieldSize;
}

export function FieldTitle({ className, size, ...props }: FieldTitleProps) {
  const field = useFieldContext();
  const resolvedSize = size ?? field?.size ?? 'md';
  const isDisabled = field?.isDisabled ?? false;

  return (
    <span
      {...props}
      data-slot="field-title"
      className={twMerge(fieldHeaderLabelVariants({ size: resolvedSize, isDisabled }), className)}
    />
  );
}

export interface FieldDescriptionProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'className'
> {
  className?: string;
  size?: FieldSize;
}

export function FieldDescription({
  children,
  className,
  size,
  id: idProp,
  ...props
}: FieldDescriptionProps) {
  const field = useFieldContext();
  const insideRac = useIsInsideRacLabelable();
  const generatedId = React.useId();
  // Inside RAC groups, let Label/Text slot wiring own the id so aria-describedby
  // matches the rendered node. Outside RAC, FieldContext needs a stable id.
  const id = idProp ?? (insideRac ? undefined : generatedId);
  const resolvedSize = size ?? field?.size ?? 'md';

  const active = hasRenderableMessage(children);
  useDescribedByRegistration('description', id ?? generatedId, active && Boolean(id));

  if (!active) {
    return null;
  }

  return (
    <AriaText
      {...props}
      id={id}
      slot="description"
      data-slot="field-description"
      className={twMerge(messageVariants({ size: resolvedSize, tone: 'subtle' }), className)}
    >
      {children}
    </AriaText>
  );
}

export interface FieldErrorProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'className' | 'children'
> {
  className?: string;
  size?: FieldSize;
  children?: React.ReactNode;
  /**
   * Form-library or Standard Schema errors. Normalized with
   * {@link getErrorMessages}. Ignored when `children` is provided.
   */
  errors?: unknown;
}

export function FieldError({
  children,
  className,
  size,
  errors,
  id: idProp,
  ...props
}: FieldErrorProps) {
  const field = useFieldContext();
  const insideRac = useIsInsideRacLabelable();
  const generatedId = React.useId();
  // Same id ownership rule as FieldDescription: RAC slots vs FieldContext.
  const id = idProp ?? (insideRac ? undefined : generatedId);
  const resolvedSize = size ?? field?.size ?? 'md';
  const messages = children === undefined ? getErrorMessages(errors) : [];

  let content: React.ReactNode = children;
  if (children === undefined) {
    if (messages.length === 0) {
      content = null;
    } else if (messages.length === 1) {
      content = messages[0];
    } else {
      content = (
        <ul className="list-disc ps-4">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      );
    }
  }

  const active = hasRenderableMessage(content);
  useDescribedByRegistration('error', id ?? generatedId, active && Boolean(id));

  if (!active) {
    return null;
  }

  return (
    <AriaText
      {...props}
      id={id}
      slot="errorMessage"
      data-slot="field-error"
      className={twMerge(messageVariants({ size: resolvedSize, tone: 'danger' }), className)}
    >
      {content}
    </AriaText>
  );
}

export interface FieldSeparatorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'className' | 'children'
> {
  className?: string;
  children?: React.ReactNode;
}

export function FieldSeparator({ className, children, ...props }: FieldSeparatorProps) {
  return (
    <div {...props} data-slot="field-separator" className={twMerge('w-full py-1', className)}>
      <Divider text={hasRenderableMessage(children) ? children : undefined} appearance="subtle" />
    </div>
  );
}
