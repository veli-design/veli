import * as React from 'react';
import { FieldError, Text } from 'react-aria-components';
import { cva } from 'class-variance-authority';

/**
 * Flat bottom underline on ::after (avoids inset shadow corner curl on rounded shells).
 * 2px bar × scaleY(0.75) ≈ 1.5px at rest; scaleY(1) = 2px when active/focused.
 * Transform is set via a single shorthand (no transition) to avoid hover flicker.
 */
const underlineRestTransform = 'after:[transform:translateZ(0)_scaleY(0.75)]';
const underlineActiveTransform = 'after:[transform:translateZ(0)_scaleY(1)]';
const underlineHoverRestTransform = 'hover:after:[transform:translateZ(0)_scaleY(0.75)]';
const underlineFocusActiveTransform =
  'focus-within:after:[transform:translateZ(0)_scaleY(1)] focus-within:hover:after:[transform:translateZ(0)_scaleY(1)]';

export const defaultFieldUnderlineShell = `overflow-hidden after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-0 after:h-[2px] after:w-full after:origin-bottom after:content-[''] ${underlineRestTransform}`;

export const defaultFieldUnderlineRest = `after:bg-text-input-stroke-default hover:after:bg-text-input-stroke-hover ${underlineHoverRestTransform}`;

export const defaultFieldUnderlinePressed = `after:bg-text-input-stroke-pressed hover:after:bg-text-input-stroke-pressed ${underlineActiveTransform}`;

export const defaultFieldUnderlineFocusPressed = `focus-within:after:bg-text-input-stroke-pressed focus-within:hover:after:bg-text-input-stroke-pressed ${underlineFocusActiveTransform}`;

export const defaultFieldUnderlineDisabled = `after:bg-text-input-stroke-disabled ${underlineRestTransform}`;

export const defaultFieldUnderlineError = `after:bg-text-input-stroke-error hover:after:bg-text-input-stroke-error ${underlineHoverRestTransform}`;

export const defaultFieldUnderlineErrorPressed = `after:bg-text-input-stroke-error hover:after:bg-text-input-stroke-error ${underlineActiveTransform}`;

export const defaultFieldUnderlineErrorFocusPressed = `focus-within:after:bg-text-input-stroke-error focus-within:hover:after:bg-text-input-stroke-error ${underlineFocusActiveTransform}`;

export const fieldRootVariants = cva('flex w-full flex-col gap-1.5 font-sans antialiased');

export const fieldHeaderLabelVariants = cva('type-body-sm-regular', {
  variants: {
    isDisabled: {
      true: 'text-text-disabled-disabled',
      false: 'text-text-default-default',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

export const fieldHeaderMetaVariants = cva('type-caption-regular', {
  variants: {
    tone: {
      subtle: 'text-text-default-subtle',
      danger: 'text-text-danger-muted',
    },
    isDisabled: {
      true: 'text-text-disabled-disabled',
      false: '',
    },
  },
  compoundVariants: [
    {
      tone: 'danger',
      isDisabled: true,
      className: 'text-text-disabled-disabled',
    },
  ],
  defaultVariants: {
    tone: 'subtle',
    isDisabled: false,
  },
});

export const fieldHeaderActionVariants = cva('shrink-0 type-body-sm-medium', {
  variants: {
    isDisabled: {
      true: 'text-text-disabled-disabled',
      false: 'text-text-links-default',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

export const fieldTriggerButtonVariants = cva(
  'relative flex w-full items-center gap-1 rounded-md text-start outline-none transition-[background-color,border-color]',
  {
    variants: {
      appearance: {
        default: '',
        outline: 'border hover:border-[1.5px]',
      },
      size: {
        sm: 'h-9 py-2 px-3',
        md: 'h-11 py-3 px-4',
        lg: 'h-13 py-3.5 px-4',
      },
      isDisabled: {
        true: 'cursor-not-allowed',
        false: 'cursor-pointer',
      },
      isInvalid: {
        true: '',
        false: '',
      },
      isFocusVisible: {
        true: 'ring-2 ring-border-focus ring-offset-2 ring-offset-bg-surface-base',
        false: '',
      },
      isOpen: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        appearance: 'default',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: false,
        isOpen: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineRest} bg-text-input-bg-default hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'default',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlinePressed} bg-text-input-bg-pressed hover:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'default',
        isDisabled: false,
        isInvalid: false,
        isOpen: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlinePressed} bg-text-input-bg-pressed hover:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'default',
        isDisabled: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineDisabled} bg-gray-alpha-200`,
      },
      {
        appearance: 'default',
        isInvalid: true,
        isDisabled: false,
        isFocusVisible: false,
        isOpen: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineError} hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'default',
        isInvalid: true,
        isDisabled: false,
        isFocusVisible: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineErrorPressed} hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'default',
        isInvalid: true,
        isDisabled: false,
        isOpen: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineErrorPressed} hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'default',
        isDisabled: true,
        isInvalid: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineDisabled}`,
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: false,
        isOpen: false,
        className:
          'border-text-input-stroke-default bg-text-input-bg-default hover:border-text-input-stroke-hover hover:bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: true,
        isOpen: false,
        className: 'border-transparent hover:border-transparent',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: true,
        isOpen: true,
        className: 'border-transparent hover:border-transparent',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: false,
        isOpen: true,
        className:
          'border-2 border-text-input-stroke-pressed bg-text-input-bg-pressed hover:border-2 hover:border-text-input-stroke-pressed hover:bg-text-input-bg-pressed',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: true,
        isFocusVisible: false,
        isOpen: true,
        className:
          'border-2 border-text-input-stroke-error hover:border-2 hover:border-text-input-stroke-error',
      },
      {
        appearance: 'outline',
        isDisabled: true,
        className: 'border-text-input-stroke-disabled bg-gray-alpha-200',
      },
      {
        appearance: 'outline',
        isInvalid: true,
        isDisabled: false,
        className:
          'border-text-input-stroke-error bg-text-input-bg-default hover:border-text-input-stroke-error hover:bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isDisabled: true,
        isInvalid: true,
        className: 'border-text-input-stroke-disabled',
      },
    ],
    defaultVariants: {
      appearance: 'default',
      size: 'md',
      isDisabled: false,
      isInvalid: false,
      isFocusVisible: false,
      isOpen: false,
    },
  },
);

export const fieldTriggerValueVariants = cva('min-w-0 flex-1 truncate', {
  variants: {
    size: {
      sm: 'type-body-sm-regular',
      md: 'type-body-sm-regular',
      lg: 'type-body-md-regular',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const fieldInlineSlotVariants = cva('flex shrink-0 items-center justify-center', {
  variants: {
    isDisabled: {
      true: 'text-text-disabled-disabled',
      false: 'text-text-default-subtle',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

export const fieldTriggerIndicatorVariants = cva(
  'flex shrink-0 items-center justify-center rounded-xs transition-transform',
  {
    variants: {
      isDisabled: {
        true: 'text-text-disabled-disabled',
        false: 'text-text-default-subtle',
      },
      isOpen: {
        true: 'rotate-180',
        false: 'rotate-0',
      },
    },
    defaultVariants: {
      isDisabled: false,
      isOpen: false,
    },
  },
);

export const messageVariants = cva('type-caption-regular', {
  variants: {
    tone: {
      subtle: 'text-text-default-subtle',
      danger: 'text-text-danger-muted',
    },
  },
  defaultVariants: {
    tone: 'subtle',
  },
});

export function hasRenderableMessage(message: React.ReactNode): boolean {
  if (message == null || typeof message === 'boolean') {
    return false;
  }

  if (typeof message === 'string') {
    return message.trim().length > 0;
  }

  if (Array.isArray(message)) {
    return message.some(hasRenderableMessage);
  }

  return true;
}

function getRenderableMessage(message: React.ReactNode) {
  return hasRenderableMessage(message) ? message : undefined;
}

export interface FieldMessageProps {
  isInvalid: boolean;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
}

export function FieldMessage({ isInvalid, description, errorMessage }: FieldMessageProps) {
  if (isInvalid) {
    const renderedError = getRenderableMessage(errorMessage);

    if (renderedError !== undefined) {
      return (
        <Text slot="errorMessage" className={messageVariants({ tone: 'danger' })}>
          {renderedError}
        </Text>
      );
    }

    return <FieldError className={messageVariants({ tone: 'danger' })} />;
  }

  const renderedDescription = getRenderableMessage(description);

  if (renderedDescription === undefined) {
    return null;
  }

  return (
    <Text slot="description" className={messageVariants({ tone: 'subtle' })}>
      {renderedDescription}
    </Text>
  );
}

export interface StaticFieldMessageProps {
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
}

export function StaticFieldMessage({ description, errorMessage }: StaticFieldMessageProps) {
  const renderedError = getRenderableMessage(errorMessage);

  if (renderedError !== undefined) {
    return (
      <Text slot="errorMessage" className={messageVariants({ tone: 'danger' })}>
        {renderedError}
      </Text>
    );
  }

  const renderedDescription = getRenderableMessage(description);

  if (renderedDescription === undefined) {
    return null;
  }

  return (
    <Text slot="description" className={messageVariants({ tone: 'subtle' })}>
      {renderedDescription}
    </Text>
  );
}
