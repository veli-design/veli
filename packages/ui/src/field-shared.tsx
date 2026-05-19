import * as React from 'react';
import { FieldError, Text } from 'react-aria-components';
import { cva } from 'class-variance-authority';

export const messageVariants = cva('type-caption-12-regular', {
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
    return (
      <FieldError className={messageVariants({ tone: 'danger' })}>
        {getRenderableMessage(errorMessage)}
      </FieldError>
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
