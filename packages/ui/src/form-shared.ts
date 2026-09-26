/**
 * Collects unique, non-empty messages from form-library errors: strings,
 * `{ message }` objects (React Hook Form errors, Standard Schema issues from
 * Zod / Valibot / ArkType), and arrays of either.
 */
export function getErrorMessages(errors: unknown): string[] {
  const messages = new Set<string>();

  const visit = (error: unknown) => {
    if (typeof error === 'string') {
      if (error !== '') {
        messages.add(error);
      }
      return;
    }

    if (Array.isArray(error)) {
      error.forEach(visit);
      return;
    }

    if (error != null && typeof error === 'object' && 'message' in error) {
      visit((error as { message?: unknown }).message);
    }
  };

  visit(errors);
  return Array.from(messages);
}

/** First message from {@link getErrorMessages}, for a field's `errorMessage` prop. */
export function toErrorMessage(errors: unknown): string | undefined {
  return getErrorMessages(errors)[0];
}
