import * as React from 'react';
import { FieldError, Text } from 'react-aria-components';
import { getRenderableMessage, messageVariants } from './field-shared-variants';

export interface FieldMessageProps {
  isInvalid: boolean;
  size?: 'sm' | 'md' | 'lg';
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
}

export function FieldMessage({
  isInvalid,
  size = 'md',
  description,
  errorMessage,
}: FieldMessageProps) {
  if (isInvalid) {
    const renderedError = getRenderableMessage(errorMessage);

    if (renderedError !== undefined) {
      return (
        <Text slot="errorMessage" className={messageVariants({ size, tone: 'danger' })}>
          {renderedError}
        </Text>
      );
    }

    return <FieldError className={messageVariants({ size, tone: 'danger' })} />;
  }

  const renderedDescription = getRenderableMessage(description);

  if (renderedDescription === undefined) {
    return null;
  }

  return (
    <Text slot="description" className={messageVariants({ size, tone: 'subtle' })}>
      {renderedDescription}
    </Text>
  );
}

export interface StaticFieldMessageProps {
  size?: 'sm' | 'md' | 'lg';
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
}

export function StaticFieldMessage({
  size = 'md',
  description,
  errorMessage,
}: StaticFieldMessageProps) {
  const renderedError = getRenderableMessage(errorMessage);

  if (renderedError !== undefined) {
    return (
      <Text slot="errorMessage" className={messageVariants({ size, tone: 'danger' })}>
        {renderedError}
      </Text>
    );
  }

  const renderedDescription = getRenderableMessage(description);

  if (renderedDescription === undefined) {
    return null;
  }

  return (
    <Text slot="description" className={messageVariants({ size, tone: 'subtle' })}>
      {renderedDescription}
    </Text>
  );
}
