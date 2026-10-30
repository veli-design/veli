import * as React from 'react';
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

export const defaultFieldUnderlineRest = `after:bg-text-input-stroke hover:after:bg-text-input-stroke-hover ${underlineHoverRestTransform}`;

export const defaultFieldUnderlinePressed = `after:bg-text-input-stroke-pressed hover:after:bg-text-input-stroke-pressed ${underlineActiveTransform}`;

export const defaultFieldUnderlineFocusPressed = `focus-within:after:bg-text-input-stroke-pressed focus-within:hover:after:bg-text-input-stroke-pressed ${underlineFocusActiveTransform}`;

export const defaultFieldUnderlineError = `after:bg-text-input-stroke-error hover:after:bg-text-input-stroke-error ${underlineHoverRestTransform}`;

export const defaultFieldUnderlineErrorPressed = `after:bg-text-input-stroke-error hover:after:bg-text-input-stroke-error ${underlineActiveTransform}`;

export const defaultFieldUnderlineErrorFocusPressed = `focus-within:after:bg-text-input-stroke-error focus-within:hover:after:bg-text-input-stroke-error ${underlineFocusActiveTransform}`;

/**
 * Outline stroke as an inset box-shadow (Figma strokeAlign INSIDE).
 * Rest 1px, hover 1.5px, active/focus-within 2px — outer box never changes.
 * Hide the inner stroke when the keyboard focus ring is shown on the given focus target.
 * Class strings must stay complete literals so Tailwind can detect them.
 */
export const outlineFieldStrokeError =
  'shadow-[inset_0_0_0_1px_var(--veli-color-text-input-stroke-error)] [&:hover:not(:focus-within)]:shadow-[inset_0_0_0_1.5px_var(--veli-color-text-input-stroke-error)] focus-within:shadow-[inset_0_0_0_2px_var(--veli-color-text-input-stroke-error)]';

export const outlineFieldStrokeSuccess =
  'shadow-[inset_0_0_0_1px_var(--veli-color-border-success-emphasis)] [&:hover:not(:focus-within)]:shadow-[inset_0_0_0_1.5px_var(--veli-color-border-success-emphasis)] focus-within:shadow-[inset_0_0_0_2px_var(--veli-color-border-success-emphasis)]';

export const outlineFieldStrokePressed =
  'shadow-[inset_0_0_0_2px_var(--veli-color-text-input-stroke-pressed)] hover:shadow-[inset_0_0_0_2px_var(--veli-color-text-input-stroke-pressed)]';

export const outlineFieldStrokeErrorPressed =
  'shadow-[inset_0_0_0_2px_var(--veli-color-text-input-stroke-error)] hover:shadow-[inset_0_0_0_2px_var(--veli-color-text-input-stroke-error)]';

export const outlineFieldStrokeRest = {
  input:
    'shadow-[inset_0_0_0_1px_var(--veli-color-text-input-stroke-default)] [&:hover:not(:focus-within)]:shadow-[inset_0_0_0_1.5px_var(--veli-color-text-input-stroke-hover)] [&:focus-within:not(:has(input[data-focus-visible]))]:shadow-[inset_0_0_0_2px_var(--veli-color-text-input-stroke-pressed)]',
  textarea:
    'shadow-[inset_0_0_0_1px_var(--veli-color-text-input-stroke-default)] [&:hover:not(:focus-within)]:shadow-[inset_0_0_0_1.5px_var(--veli-color-text-input-stroke-hover)] [&:focus-within:not(:has(textarea[data-focus-visible]))]:shadow-[inset_0_0_0_2px_var(--veli-color-text-input-stroke-pressed)]',
  dateField:
    'shadow-[inset_0_0_0_1px_var(--veli-color-text-input-stroke-default)] [&:hover:not(:focus-within)]:shadow-[inset_0_0_0_1.5px_var(--veli-color-text-input-stroke-hover)] [&:focus-within:not(:has(span[data-focus-visible])):not(:has(button[data-focus-visible]))]:shadow-[inset_0_0_0_2px_var(--veli-color-text-input-stroke-pressed)]',
} as const;

export const outlineFieldStrokeFocusVisibleHide = {
  input:
    'has-[input[data-focus-visible]]:shadow-none has-[input[data-focus-visible]]:hover:shadow-none',
  textarea:
    'has-[textarea[data-focus-visible]]:shadow-none has-[textarea[data-focus-visible]]:hover:shadow-none',
  dateField:
    'has-[span[data-focus-visible]]:shadow-none has-[span[data-focus-visible]]:hover:shadow-none has-[button[data-focus-visible]]:shadow-none has-[button[data-focus-visible]]:hover:shadow-none',
} as const;

/**
 * Chromium paints autofilled inputs with a user-agent `!important` background and text colour
 * that author `!important` cannot override. Transitions outrank every `!important` declaration,
 * so an effectively infinite delay keeps the native input transparent over the field shell.
 * Both selectors are listed because older Chromium only matches `:-webkit-autofill`.
 * Disabled autofill keeps the muted token so `disabled:text-disabled` is not overridden.
 */
export const fieldInputAutofill =
  'autofill:[transition:background-color_0s_600000s] autofill:[-webkit-text-fill-color:var(--veli-color-text-base-strong)] autofill:caret-text-base-strong disabled:autofill:[-webkit-text-fill-color:var(--veli-color-text-disabled)] disabled:autofill:caret-text-disabled [&:-webkit-autofill]:[transition:background-color_0s_600000s] [&:-webkit-autofill]:[-webkit-text-fill-color:var(--veli-color-text-base-strong)] [&:-webkit-autofill]:caret-text-base-strong disabled:[&:-webkit-autofill]:[-webkit-text-fill-color:var(--veli-color-text-disabled)] disabled:[&:-webkit-autofill]:caret-text-disabled';

export const fieldRootVariants = cva('flex w-full flex-col gap-1.5 font-sans antialiased');

export const fieldHeaderLabelVariants = cva('', {
  variants: {
    size: {
      sm: 'type-body-sm-regular',
      md: 'type-body-sm-regular',
      lg: 'type-body-md-regular',
    },
    isDisabled: {
      true: 'text-base-muted',
      false: 'text-base-default',
    },
  },
  defaultVariants: {
    size: 'md',
    isDisabled: false,
  },
});

export const fieldHeaderSupplementaryVariants = cva('', {
  variants: {
    size: {
      sm: 'type-caption-regular',
      md: 'type-caption-regular',
      lg: 'type-body-sm-regular',
    },
    isDisabled: {
      true: 'text-disabled',
      false: 'text-base-subtle',
    },
  },
  defaultVariants: {
    size: 'md',
    isDisabled: false,
  },
});

// Figma keeps the required asterisk on text/danger/muted when the field is disabled.
export const fieldHeaderRequiredIndicatorVariants = cva('type-caption-regular text-danger-muted', {
  variants: {
    isDisabled: {
      true: '',
      false: '',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

export const fieldHeaderActionVariants = cva('shrink-0 type-body-sm-medium', {
  variants: {
    isDisabled: {
      true: 'text-disabled',
      false: 'text-links',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

export const fieldHeaderInfoTooltipTriggerVariants = cva(
  'inline-flex size-4 shrink-0 items-center justify-center rounded-xs border-0 bg-transparent p-0 outline-none transition-colors duration-normal ease-out motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface-raised',
  {
    variants: {
      isDisabled: {
        true: 'cursor-not-allowed text-icon-disabled',
        false: 'cursor-help text-icon-base',
      },
    },
    defaultVariants: {
      isDisabled: false,
    },
  },
);

export const messageVariants = cva('', {
  variants: {
    size: {
      sm: 'type-caption-regular',
      md: 'type-caption-regular',
      lg: 'type-body-sm-regular',
    },
    tone: {
      subtle: 'text-base-subtle',
      muted: 'text-base-muted',
      disabled: 'text-disabled',
      danger: 'text-danger-muted',
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'subtle',
  },
});

/** Enabled helpers use text/base/muted. Disabled helpers use text/disabled. */
export function fieldHelperTone(isDisabled: boolean): 'muted' | 'disabled' {
  return isDisabled ? 'disabled' : 'muted';
}

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

  if (
    React.isValidElement<{ children?: React.ReactNode }>(message) &&
    message.type === React.Fragment
  ) {
    return hasRenderableMessage(message.props.children);
  }

  return true;
}

function getRenderableMessage(message: React.ReactNode) {
  return hasRenderableMessage(message) ? message : undefined;
}

export { getRenderableMessage };
