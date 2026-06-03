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
