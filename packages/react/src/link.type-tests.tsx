import { createRef } from 'react';
import { Link } from './link.js';

export function LinkTypeExpectations() {
  const ref = createRef<HTMLAnchorElement>();

  return (
    <>
      <Link ref={ref} href="/account" target="_blank" rel="noreferrer" download="account.txt">
        Account
      </Link>
      <Link href="/account" aria-current="page" onPress={() => ref.current?.focus()}>
        {({ isCurrent, isDisabled }) => (isCurrent && !isDisabled ? 'Current account' : 'Account')}
      </Link>
      <Link
        href="/account"
        render={(props, state) =>
          state.isDisabled || !('href' in props) ? (
            <span {...props} />
          ) : (
            <a {...props}>{props.children}</a>
          )
        }
      >
        Account
      </Link>
      {/* @ts-expect-error Link does not allow styling overrides */}
      <Link className="text-red-500">Account</Link>
      {/* @ts-expect-error Link does not allow inline style overrides */}
      <Link style={{ color: 'red' }}>Account</Link>
      {/* @ts-expect-error Link refs use the React Aria anchor contract */}
      <Link ref={createRef<HTMLButtonElement>()}>Account</Link>
      <Link size="sm">Small standalone link</Link>
      <Link size="md">Medium standalone link</Link>
      <Link size="lg">Large standalone link</Link>
      {/* @ts-expect-error size is restricted to the public scale */}
      <Link size="xl">Account</Link>
      {/* @ts-expect-error inheritance is selected by omitting size */}
      <Link size="inherit">Account</Link>
    </>
  );
}
