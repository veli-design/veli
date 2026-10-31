'use client';

import * as React from 'react';
import {
  Focusable as AriaFocusable,
  Link as AriaLink,
  type LinkProps,
  type LinkRenderProps,
} from 'react-aria-components';
import {
  Focusable as HookFocusable,
  mergeProps,
  useFocusRing,
  useHover,
  useLink,
} from 'react-aria';
import { filterDOMProps } from 'react-aria/filterDOMProps';

export type NavigationAnchorState = LinkRenderProps & { isPending: boolean };
type AnchorProps = React.ComponentPropsWithRef<'a'> & Record<string, unknown>;

interface NavigationAnchorProps extends Omit<LinkProps, 'render' | 'onClick'> {
  ref: React.RefObject<HTMLAnchorElement | null>;
  isPending?: boolean;
  excludeFromTabOrder?: boolean;
  'aria-busy'?: React.AriaAttributes['aria-busy'];
  'aria-current'?: React.AriaAttributes['aria-current'];
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  render?: (props: AnchorProps, state: NavigationAnchorState) => React.ReactElement;
}

/** Internal anchor for components that have already resolved their LinkContext. */
export function NavigationAnchor({
  ref,
  render,
  isDisabled = false,
  isPending = false,
  onClick,
  slot,
  children,
  'aria-busy': ariaBusy,
  ...props
}: NavigationAnchorProps) {
  const inactive = isDisabled || isPending;
  // An empty href is a native current-document link. RAC treats it as a span.
  const isEmptyHref = props.href === '';
  const isCurrent = Boolean(props['aria-current'] && props['aria-current'] !== 'false');
  // A custom router link is replaced by a plain anchor while pending. Retain focus.
  const restoreFocus = React.useRef(false);
  const anchorRef = React.useCallback(
    (node: HTMLAnchorElement | null) => {
      if (!node) {
        restoreFocus.current = Boolean(
          ref.current && ref.current === ref.current.ownerDocument.activeElement,
        );
      }
      ref.current = node;
      if (node && restoreFocus.current) {
        restoreFocus.current = false;
        if (!node.hasAttribute('data-disabled')) node.focus({ preventScroll: true });
      }
    },
    [ref],
  );
  const blockActivation = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const renderAnchor = (domProps: AnchorProps, linkState: LinkRenderProps): React.JSX.Element => {
    const state = { ...linkState, isCurrent, isPending };
    const anchorProps: AnchorProps = {
      ...domProps,
      href: inactive ? undefined : render ? props.href : domProps.href,
      hrefLang: props.hrefLang,
      role: inactive ? 'link' : domProps.role,
      slot: slot ?? undefined,
      tabIndex: isDisabled
        ? -1
        : isPending
          ? props.excludeFromTabOrder
            ? -1
            : 0
          : domProps.tabIndex,
      'aria-busy': isPending ? true : ariaBusy,
      'data-disabled': isDisabled || undefined,
      'data-pending': isPending || undefined,
      'data-current': isCurrent || undefined,
      'aria-disabled': inactive || undefined,
      'data-pressed': state.isPressed || undefined,
      'data-hovered': state.isHovered || undefined,
      'data-focused': state.isFocused || undefined,
      'data-focus-visible': state.isFocusVisible || undefined,
      // Run native click cancellation before React Aria or the custom router.
      onClick: (event) => {
        onClick?.(event);
        domProps.onClick?.(event);
      },
      onClickCapture: inactive ? blockActivation : domProps.onClickCapture,
      onAuxClickCapture: inactive ? blockActivation : domProps.onAuxClickCapture,
      onKeyDownCapture: inactive
        ? (event) => {
            if (event.key === 'Enter' || event.key === ' ') blockActivation(event);
            else domProps.onKeyDownCapture?.(event);
          }
        : domProps.onKeyDownCapture,
      className:
        typeof props.className === 'function'
          ? props.className({ ...state, defaultClassName: undefined })
          : props.className,
      style:
        typeof props.style === 'function'
          ? props.style({ ...state, defaultStyle: {} })
          : props.style,
      children:
        typeof children === 'function'
          ? children({ ...state, defaultChildren: undefined })
          : children,
    };
    return render && !inactive ? (
      render(anchorProps, state)
    ) : (
      <a {...anchorProps}>{anchorProps.children}</a>
    );
  };

  // Custom router renderers own navigation. These disabled props also keep a native
  // anchor stable while React Aria's Link would otherwise switch its root to a span.
  const { linkProps, isPressed } = useLink(
    {
      ...props,
      href: !render && isEmptyHref ? '' : undefined,
      elementType: 'a',
      isDisabled: inactive,
      autoFocus: !inactive && props.autoFocus,
    },
    ref,
  );
  const { hoverProps, isHovered } = useHover({ ...props, isDisabled: inactive });
  const { focusProps, isFocused, isFocusVisible } = useFocusRing({
    autoFocus: !inactive && props.autoFocus,
  });
  const state = {
    isDisabled: inactive,
    isCurrent,
    isPressed,
    isHovered,
    isFocused,
    isFocusVisible,
  };
  const unroutedProps = mergeProps(
    filterDOMProps(props, { global: true }),
    linkProps,
    hoverProps,
    focusProps,
  ) as AnchorProps;
  if (render || isEmptyHref) {
    // eslint-disable-next-line react-hooks/refs -- The renderer forwards the ref without reading it.
    const anchor = renderAnchor({ ...unroutedProps, ref: anchorRef }, state);
    return AriaFocusable === HookFocusable ? (
      anchor
    ) : (
      <AriaFocusable isDisabled={inactive}>{anchor}</AriaFocusable>
    );
  }
  return (
    <AriaLink
      {...props}
      ref={anchorRef}
      // Context was merged by the caller. Do not merge handlers or refs a second time.
      slot={null}
      // Keep RAC's root an anchor. Inactive anchors receive only disabled hook props below.
      isDisabled={false}
      // eslint-disable-next-line jsx-a11y/no-autofocus -- Preserve explicit autofocus only while enabled.
      autoFocus={!inactive && props.autoFocus}
      onPress={inactive ? undefined : props.onPress}
      onPressStart={inactive ? undefined : props.onPressStart}
      onPressEnd={inactive ? undefined : props.onPressEnd}
      onPressUp={inactive ? undefined : props.onPressUp}
      onPressChange={inactive ? undefined : props.onPressChange}
      onFocus={inactive ? undefined : props.onFocus}
      onBlur={inactive ? undefined : props.onBlur}
      onFocusChange={inactive ? undefined : props.onFocusChange}
      // The shared hover/focus-ring props keep state continuous when becoming inactive.
      onHoverStart={undefined}
      onHoverEnd={undefined}
      onHoverChange={undefined}
      className={undefined}
      style={undefined}
      render={(domProps, linkState) =>
        renderAnchor(
          (inactive
            ? { ...unroutedProps, ref: domProps.ref }
            : mergeProps(domProps, hoverProps, focusProps)) as AnchorProps,
          { ...linkState, ...state, isPressed: !inactive && linkState.isPressed },
        )
      }
    />
  );
}
