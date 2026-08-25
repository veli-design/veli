import type * as React from 'react';

/** React 19 treats refs as ordinary component props. */
export interface RefProp<T> {
  ref?: React.Ref<T>;
}

export function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}
