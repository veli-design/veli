import { VeliProvider } from '@tradenetcorp/veli-ui/provider';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Tooltip, TooltipTrigger } from '@tradenetcorp/veli-ui/tooltip';

// Keep release regressions in the existing States story without adding demo-only APIs.
export async function verifyButtonRegressions(canvasElement: HTMLElement) {
  const container = document.createElement('div');
  canvasElement.append(container);
  const root = createRoot(container);
  const canvas = within(container);
  const user = userEvent.setup();
  const onSubmit = fn((event: React.FormEvent) => event.preventDefault());
  const onReset = fn();
  const onLocalPress = fn();
  const cleanup = fn();
  const ref = fn(() => cleanup);
  const render = (pending: boolean) => {
    flushSync(() => {
      root.render(
        <>
          <form onSubmit={onSubmit} onReset={onReset}>
            <input aria-label="Form value" defaultValue="Original" />
            <Button type="submit" isLoading={pending} ref={ref}>
              Save form
            </Button>
            <Button type="reset" isPending={pending}>
              Reset form
            </Button>
          </form>
          <Button
            className="h-8"
            render={(props) => <button {...props} data-custom-render="true" />}
            onPress={onLocalPress}
            isPending={pending}
          >
            Custom action
          </Button>
          <Button iconOnly className="size-8" aria-label="Small action">
            +
          </Button>
          <div className="w-20">
            <Button
              isPending
              className={pending ? 'w-16' : undefined}
              aria-label="Saving in a narrow space"
            />
          </div>
        </>,
      );
    });
  };

  try {
    // Figma uses the same nominal heights with distinct bilingual typography.
    for (const language of ['en', 'dv'] as const) {
      flushSync(() => {
        root.render(
          <VeliProvider language={language}>
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <div key={size} data-size={size}>
                <Button size={size}>{language === 'dv' ? 'ކުރިއަށް' : 'Continue'}</Button>
                <Button as="a" href="#" size={size}>
                  {language === 'dv' ? 'ކުރިއަށް' : 'Continue'}
                </Button>
                <Button size={size} isPending aria-label="Loading" />
                <Button size={size} iconOnly aria-label="Add">
                  +
                </Button>
              </div>
            ))}
          </VeliProvider>,
        );
      });
      await document.fonts.ready;
      for (const row of container.querySelectorAll<HTMLElement>('[data-size]')) {
        const height = { xs: 28, sm: 36, md: 44, lg: 52, xl: 60 }[
          row.dataset.size as 'xs' | 'sm' | 'md' | 'lg' | 'xl'
        ];
        for (const button of row.querySelectorAll<HTMLElement>('button, a')) {
          await expect(button.offsetHeight).toBe(height);
        }
      }
    }
    render(false);
    const submit = canvas.getByRole('button', { name: 'Save form' });
    const reset = canvas.getByRole('button', { name: 'Reset form' });
    const input = canvas.getByRole('textbox', { name: 'Form value' });
    const custom = canvas.getByRole('button', { name: 'Custom action' });
    const icon = canvas.getByRole('button', { name: 'Small action' });
    const narrow = canvas.getByRole('button', { name: /Saving in a narrow space/ });
    await expect(custom).toHaveAttribute('data-custom-render', 'true');
    await expect(custom.offsetHeight).toBe(32);
    await expect([icon.offsetWidth, icon.offsetHeight]).toEqual([32, 32]);
    await expect(narrow.offsetWidth).toBeLessThanOrEqual(narrow.parentElement!.clientWidth);
    await user.click(custom);
    await expect(onLocalPress).toHaveBeenCalledTimes(1);
    await user.type(input, ' edited');
    submit.focus();
    const width = submit.offsetWidth;

    render(true);
    await expect(narrow.offsetWidth).toBe(64);
    await expect(submit).toHaveFocus();
    await expect(submit.offsetWidth).toBe(width);
    await expect(submit).toHaveAttribute('type', 'submit');
    await expect(submit).toHaveAttribute('aria-busy', 'true');
    await expect(submit).toHaveAttribute('aria-disabled', 'true');
    await expect(custom).toHaveAttribute('data-pending');
    await user.keyboard('{Enter} ');
    await user.click(submit);
    await user.click(reset);
    await user.click(custom);
    await user.click(input);
    await user.keyboard('{Enter}');
    await expect(onSubmit).not.toHaveBeenCalled();
    await expect(onReset).not.toHaveBeenCalled();
    await expect(input).toHaveValue('Original edited');
    await expect(onLocalPress).toHaveBeenCalledTimes(1);

    submit.focus();
    render(false);
    await expect(submit).toHaveFocus();
    await expect(submit).not.toHaveAttribute('aria-busy');
    await user.keyboard('{Enter}');
    await expect(onSubmit).toHaveBeenCalledTimes(1);
    await user.click(reset);
    await expect(onReset).toHaveBeenCalledTimes(1);
    await expect(input).toHaveValue('Original');
    await expect(cleanup).not.toHaveBeenCalled();
  } finally {
    flushSync(() => root.unmount());
    container.remove();
  }
  await expect(cleanup).toHaveBeenCalledTimes(1);
}

export async function verifyButtonLinkRegressions(canvasElement: HTMLElement) {
  const container = document.createElement('div');
  canvasElement.append(container);
  const root = createRoot(container);
  const canvas = within(container);
  const user = userEvent.setup();
  const navigate = fn();
  const onPress = fn();
  const onClick = fn();
  const cancelNavigation = fn((event: React.MouseEvent<HTMLAnchorElement>) =>
    event.preventDefault(),
  );
  const cleanup = fn();
  const ref = fn(() => cleanup);
  const render = (isPending: boolean, isDisabled = false) => {
    flushSync(() => {
      root.render(
        <VeliProvider navigate={navigate}>
          <Button as="a" href="/cancel" onClick={cancelNavigation}>
            Canceled destination
          </Button>
          <Button
            as="a"
            href="/button-account"
            isPending={isPending}
            isDisabled={isDisabled}
            ref={ref}
            onPress={onPress}
          >
            Account destination
          </Button>
          <Button
            as="a"
            href="/button-adapter"
            isLoading={isPending}
            isDisabled={isDisabled}
            render={(props) => (
              <a
                {...props}
                href={props.href}
                data-adapter="true"
                onClick={(event) => {
                  onClick();
                  event.preventDefault();
                  props.onClick?.(event);
                }}
              >
                {props.children}
              </a>
            )}
          >
            Adapter destination
          </Button>
        </VeliProvider>,
      );
    });
  };
  try {
    render(false);
    const link = canvas.getByRole('link', { name: 'Account destination' });
    let adapter = canvas.getByRole('link', { name: 'Adapter destination' });
    await expect(link.tagName).toBe('A');
    await expect(ref).toHaveBeenCalledWith(link);
    await expect(container.querySelector('button')).toBeNull();
    await user.click(link);
    await expect(navigate).toHaveBeenCalledTimes(1);
    await expect(onPress).toHaveBeenCalledTimes(1);
    link.focus();
    await user.keyboard('{Enter}');
    await expect(navigate).toHaveBeenCalledTimes(2);
    await expect(onPress).toHaveBeenCalledTimes(2);
    await user.keyboard(' ');
    await expect(navigate).toHaveBeenCalledTimes(2);
    await expect(onPress).toHaveBeenCalledTimes(2);
    const canceled = canvas.getByRole('link', { name: 'Canceled destination' });
    await user.click(canceled);
    canceled.focus();
    await user.keyboard('{Enter}');
    await expect(cancelNavigation).toHaveBeenCalledTimes(2);
    await expect(navigate).toHaveBeenCalledTimes(2);
    await user.click(adapter);
    await expect(onClick).toHaveBeenCalledTimes(1);
    await expect(navigate).toHaveBeenCalledTimes(2);
    link.focus();
    const width = link.offsetWidth;
    render(true);
    await expect(canvas.getByRole('link', { name: 'Account destination' })).toBe(link);
    await expect(link).toHaveFocus();
    await expect(link.offsetWidth).toBe(width);
    await expect(link).toHaveAttribute('aria-busy', 'true');
    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(link).not.toHaveAttribute('href');
    adapter = canvas.getByRole('link', { name: 'Adapter destination' });
    await expect(adapter).not.toHaveAttribute('href');
    await user.click(link);
    await user.keyboard('{Enter} ');
    await user.pointer({ target: link, keys: '[MouseMiddle]' });
    await user.click(adapter);
    await expect(navigate).toHaveBeenCalledTimes(2);
    await expect(onPress).toHaveBeenCalledTimes(2);
    await expect(onClick).toHaveBeenCalledTimes(1);
    render(false, true);
    adapter = canvas.getByRole('link', { name: 'Adapter destination' });
    await expect(link).not.toHaveAttribute('href');
    await expect(link).toHaveAttribute('data-disabled');
    await user.click(link);
    await user.keyboard('{Enter}');
    await user.click(adapter);
    await expect(navigate).toHaveBeenCalledTimes(2);
    await expect(onPress).toHaveBeenCalledTimes(2);
    await expect(onClick).toHaveBeenCalledTimes(1);
    link.focus();
    render(false);
    await expect(link).toHaveFocus();
    await expect(link).toHaveAttribute('href', '/button-account');
    await expect(cleanup).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    await expect(navigate).toHaveBeenCalledTimes(3);
    await expect(onPress).toHaveBeenCalledTimes(3);
  } finally {
    flushSync(() => root.unmount());
    container.remove();
  }
  await expect(cleanup).toHaveBeenCalledTimes(1);
}

export async function verifyButtonRouterComposition(canvasElement: HTMLElement) {
  const container = document.createElement('div');
  canvasElement.append(container);
  const root = createRoot(container);
  const user = userEvent.setup();
  const providerNavigate = fn();
  const routerNavigate = fn();
  const nativeClick = fn();
  let cancel = false;
  const refCleanup = fn();
  const ref = fn(() => refCleanup);
  function RouterLink(props: React.ComponentPropsWithRef<'a'>) {
    return (
      <a
        {...props}
        href={props.href}
        onClick={(event) => {
          props.onClick?.(event);
          if (!event.defaultPrevented) {
            event.preventDefault();
            routerNavigate(props.href);
          }
        }}
      >
        {props.children}
      </a>
    );
  }
  const render = (isPending: boolean) =>
    flushSync(() =>
      root.render(
        <VeliProvider navigate={providerNavigate} useHref={(href) => `/wrong${href}`}>
          <Button
            as="a"
            isPending={isPending}
            ref={ref}
            onClick={(event) => {
              nativeClick();
              if (cancel) event.preventDefault();
            }}
            render={(props) => <RouterLink {...props} href="/account" />}
          >
            Router account
          </Button>
        </VeliProvider>,
      ),
    );
  try {
    render(false);
    let link = within(container).getByRole('link', { name: 'Router account' });
    refCleanup.mockClear();
    await expect(link).toHaveAttribute('href', '/account');
    await user.click(link);
    await expect(routerNavigate).toHaveBeenCalledTimes(1);
    await expect(providerNavigate).not.toHaveBeenCalled();
    link.focus();
    render(true);
    link = within(container).getByRole('link', { name: 'Router account' });
    await expect(link).toHaveFocus();
    await expect(link).not.toHaveAttribute('href');
    await expect(link).toHaveAttribute('aria-busy', 'true');
    await expect(refCleanup).toHaveBeenCalledTimes(1);
    await user.keyboard('{Enter}');
    await user.click(link);
    await expect(routerNavigate).toHaveBeenCalledTimes(1);
    render(false);
    link = within(container).getByRole('link', { name: 'Router account' });
    await expect(link).toHaveFocus();
    await expect(ref).toHaveBeenLastCalledWith(link);
    await expect(refCleanup).toHaveBeenCalledTimes(2);
    await user.keyboard('{Enter}');
    await expect(routerNavigate).toHaveBeenCalledTimes(2);
    await expect(providerNavigate).not.toHaveBeenCalled();
    await expect(nativeClick).toHaveBeenCalledTimes(2);
    cancel = true;
    await user.keyboard('{Enter}');
    await user.click(link);
    await expect(nativeClick).toHaveBeenCalledTimes(4);
    await expect(routerNavigate).toHaveBeenCalledTimes(2);
  } finally {
    flushSync(() => root.unmount());
    container.remove();
  }
  await expect(refCleanup).toHaveBeenCalledTimes(3);
}

export async function verifyButtonLinkFocusContext(canvasElement: HTMLElement) {
  const container = document.createElement('div');
  canvasElement.append(container);
  const root = createRoot(container);
  const user = userEvent.setup();
  const onFocus = fn();
  const onOpenChange = fn();
  try {
    for (const composed of [false, true]) {
      flushSync(() =>
        root.render(
          <>
            <input aria-label="Before link tooltip" />
            <TooltipTrigger delay={0} closeDelay={0} onOpenChange={onOpenChange}>
              <Button
                as="a"
                href="#tooltip-target"
                onFocus={onFocus}
                render={composed ? (props) => <a {...props}>{props.children}</a> : undefined}
              >
                Tooltip link
              </Button>
              <Tooltip>Link help</Tooltip>
            </TooltipTrigger>
          </>,
        ),
      );
      onFocus.mockClear();
      onOpenChange.mockClear();
      within(container).getByRole('textbox').focus();
      await user.tab();
      const link = within(container).getByRole('link', { name: 'Tooltip link' });
      await expect(link).toHaveFocus();
      await waitFor(() =>
        expect(within(document.body).getByRole('tooltip')).toHaveTextContent('Link help'),
      );
      const tooltip = within(document.body).getByRole('tooltip');
      await expect(link).toHaveAttribute('aria-describedby', tooltip.id);
      await expect(onFocus).toHaveBeenCalledTimes(1);
      await expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
      await user.keyboard('{Escape}');
      await waitFor(() =>
        expect(within(document.body).queryByRole('tooltip')).not.toBeInTheDocument(),
      );
      await expect(onOpenChange).toHaveBeenCalledTimes(2);
    }
  } finally {
    flushSync(() => root.unmount());
    container.remove();
  }
}
