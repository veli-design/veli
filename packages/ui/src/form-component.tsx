'use client';

import { Form as AriaForm, type FormProps as AriaFormProps } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';

export interface FormProps extends Omit<AriaFormProps, 'className' | 'validationBehavior'> {
  className?: string;
  /**
   * Whether to use native HTML form validation or ARIA attributes.
   *
   * Veli defaults to `'aria'` so form libraries (React Hook Form, TanStack Form)
   * own validation without fighting native constraint validation. Pass `'native'`
   * to restore react-aria-components' default behaviour.
   *
   * @default 'aria'
   */
  validationBehavior?: 'aria' | 'native';
}

/**
 * Form root that defaults `validationBehavior` to `'aria'` so descendant Veli
 * fields defer to library-driven or manually-set `isInvalid` / `errorMessage`
 * instead of native constraint validation.
 *
 * Server-side errors can be passed via `validationErrors` as a map from input
 * `name` to error message(s).
 */
export function Form({ className, validationBehavior = 'aria', ...props }: FormProps) {
  return (
    <AriaForm
      {...props}
      validationBehavior={validationBehavior}
      className={twMerge('flex w-full flex-col gap-4', className)}
    />
  );
}
