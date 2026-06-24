import * as React from 'react';
import { FieldError, Text } from 'react-aria-components';
import { getRenderableMessage, messageVariants } from './field-shared-variants';

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
