'use client';

import { useCallback, useId, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Radio, RadioGroup } from 'react-aria-components';
import { Avatar } from '@tradenetcorp/veli-ui/avatar';
import { Badge, type BadgeIntent } from '@tradenetcorp/veli-ui/badge';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Divider } from '@tradenetcorp/veli-ui/divider';
import { Modal } from '@tradenetcorp/veli-ui/modal';
import { Popover, PopoverDialog, PopoverTrigger } from '@tradenetcorp/veli-ui/popover';

export type AccountPanelState = {
  isDisabled?: boolean;
  isPending?: boolean;
  /** Localized failure text; the host owns retry and error clearing. */
  error?: string;
};

export type AccountPanelAccount = AccountPanelState & {
  id: string;
  displayName: string;
  secondaryText?: string;
  avatar?: { src?: string; initials?: string };
  /** Host-provided presentation, e.g. a translated primary-user badge. */
  badge?: string;
  badgeIntent?: BadgeIntent;
  lang?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
};

export type AccountPanelGroup = {
  id: string;
  label?: string;
  accounts: readonly AccountPanelAccount[];
};

export type AccountPanelAction = AccountPanelState & {
  label: string;
  onPress: () => void;
};

export type AccountPanelLabels = {
  trigger: string;
  dialog: string;
  close: string;
  otherAccounts: string;
  loading: string;
  pending: string;
  disabled: string;
};

export type AccountPanelProps = {
  selectedAccount: AccountPanelAccount;
  /** Already filtered and ordered; exclude the selected account. */
  accountGroups?: readonly AccountPanelGroup[];
  labels: AccountPanelLabels;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  error?: string;
  /** Omit to present additional accounts as non-interactive list items. */
  onAccountSelect?: (id: string) => void;
  signOut: AccountPanelAction;
  accountManagement?: AccountPanelAction;
  emptyState?: { title: string; description?: string; action?: AccountPanelAction };
  /** Optional desktop-only preference UI. The host applies and persists changes. */
  appearance?: {
    label: string;
    value: string;
    options: readonly { id: string; label: string; icon?: ReactNode; isDisabled?: boolean }[];
    onChange: (value: string) => void;
    isDisabled?: boolean;
  };
  className?: string;
  panelClassName?: string;
};

// Matches the default Tailwind sm breakpoint used by the extraction baseline.
const mobileQuery = '(width < 640px)';
const isMobileViewport = () => window.matchMedia(mobileQuery).matches;
const serverViewport = () => false;

function AccountAvatar({ account, size }: { account: AccountPanelAccount; size: '44' | '60' }) {
  // The name is already adjacent or supplied by the trigger. Avoid duplicate announcements.
  return (
    <span aria-hidden="true" className="shrink-0">
      <Avatar
        size={size}
        appearance="neutral"
        src={account.avatar?.src}
        initials={account.avatar?.initials ?? account.displayName}
        type={account.avatar?.src ? 'image' : 'initials'}
        alt={account.displayName}
      />
    </span>
  );
}

function hasState(state: AccountPanelState) {
  return Boolean(state.isPending || state.isDisabled || state.error);
}

function StateMessage({ state, labels }: { state: AccountPanelState; labels: AccountPanelLabels }) {
  return (
    <>
      {state.isPending && <span role="status">{labels.pending}</span>}
      {state.isDisabled && !state.isPending && <span>{labels.disabled}</span>}
      {state.error && <span role="alert">{state.error}</span>}
    </>
  );
}

function PanelAction({
  action,
  labels,
  danger = false,
}: {
  action: AccountPanelAction;
  labels: AccountPanelLabels;
  danger?: boolean;
}) {
  const stateId = useId();
  return (
    <div className="flex flex-col gap-1">
      <Button
        intent={danger ? 'danger' : 'secondary'}
        appearance={danger ? 'fill' : 'transparent'}
        size="md"
        className={danger ? 'w-full' : undefined}
        isDisabled={action.isDisabled}
        isPending={action.isPending}
        aria-describedby={
          action.isPending || action.isDisabled || action.error ? stateId : undefined
        }
        onPress={() => {
          if (!action.isPending && !action.isDisabled) action.onPress();
        }}
      >
        {action.label}
      </Button>
      {hasState(action) && (
        <div id={stateId} className="type-body-sm-regular text-base-muted">
          <StateMessage state={action} labels={labels} />
        </div>
      )}
    </div>
  );
}

function AccountRow({
  account,
  onSelect,
  labels,
}: {
  account: AccountPanelAccount;
  onSelect?: (id: string) => void;
  labels: AccountPanelLabels;
}) {
  const stateId = useId();
  const content = (
    <>
      <AccountAvatar account={account} size="44" />
      <span className="flex min-w-0 flex-1 flex-col gap-1 text-start">
        <span
          lang={account.lang}
          dir={account.dir ?? 'auto'}
          className="type-body-md-semibold truncate text-base-strong"
        >
          {account.displayName}
        </span>
        {account.secondaryText && (
          <span
            lang={account.lang}
            dir={account.dir ?? 'auto'}
            className="type-body-sm-regular truncate text-base-muted"
          >
            {account.secondaryText}
          </span>
        )}
        {account.badge && (
          <Badge
            intent={account.badgeIntent ?? 'info'}
            appearance="subtle"
            size="sm"
            className="w-fit"
          >
            {account.badge}
          </Badge>
        )}
      </span>
    </>
  );
  return (
    <li className="min-w-0">
      {onSelect ? (
        <Button
          intent="secondary"
          appearance="ghost"
          className="w-full justify-start rounded-2xl p-3 [&>span]:w-full [&>span]:justify-start [&>span]:gap-3 [&>span]:px-0"
          isDisabled={account.isDisabled}
          isPending={account.isPending}
          aria-describedby={
            account.isPending || account.isDisabled || account.error ? stateId : undefined
          }
          onPress={() => {
            if (!account.isPending && !account.isDisabled) onSelect(account.id);
          }}
        >
          {content}
        </Button>
      ) : (
        <div className="flex min-w-0 items-center gap-3 p-3">{content}</div>
      )}
      {hasState(account) && (
        <div id={stateId} className="type-body-sm-regular px-3 text-base-muted">
          <StateMessage state={account} labels={labels} />
        </div>
      )}
    </li>
  );
}

function PanelContent(props: AccountPanelProps) {
  const { selectedAccount, labels, accountGroups = [], appearance } = props;
  const groups = accountGroups.filter((group) => group.accounts.length > 0);
  const appearanceIndex =
    appearance?.options.findIndex((option) => option.id === appearance.value) ?? -1;
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-6 pb-6 sm:p-4">
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-neutral-alpha-200 px-2 pt-7 pb-8 text-center">
          <AccountAvatar account={selectedAccount} size="60" />
          <div
            lang={selectedAccount.lang}
            dir={selectedAccount.dir ?? 'auto'}
            className="flex w-full min-w-0 flex-col gap-1"
          >
            <p className="type-body-lg-semibold truncate text-base-strong">
              {selectedAccount.displayName}
            </p>
            {selectedAccount.secondaryText && (
              <p className="type-body-md-regular truncate text-base-default">
                {selectedAccount.secondaryText}
              </p>
            )}
          </div>
          {selectedAccount.badge && (
            <Badge intent={selectedAccount.badgeIntent ?? 'info'} appearance="subtle" size="sm">
              {selectedAccount.badge}
            </Badge>
          )}
          {hasState(selectedAccount) && (
            <div className="type-body-sm-regular text-base-muted">
              <StateMessage state={selectedAccount} labels={labels} />
            </div>
          )}
        </div>
        {props.isLoading && (
          <p role="status" className="type-body-sm-regular text-base-muted">
            {labels.loading}
          </p>
        )}
        {props.error && (
          <p role="alert" className="type-body-sm-regular text-base-strong">
            {props.error}
          </p>
        )}
        {groups.length > 0 ? (
          <section aria-label={labels.otherAccounts}>
            <p className="type-body-sm-regular pt-3 pb-2 text-base-default">
              {labels.otherAccounts}
            </p>
            {groups.map((group, index) => (
              <div key={group.id}>
                {index > 0 && <Divider className="my-1 w-full" />}
                {group.label && (
                  <p className="type-body-sm-medium px-3 py-2 text-base-muted">{group.label}</p>
                )}
                <ul aria-label={group.label ?? labels.otherAccounts} className="flex flex-col">
                  {group.accounts.map((account) => (
                    <AccountRow
                      key={account.id}
                      account={account}
                      onSelect={props.onAccountSelect}
                      labels={labels}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ) : !props.isLoading && !props.error && props.emptyState ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center sm:py-6">
            <div className="flex flex-col gap-2">
              <p className="type-body-md-semibold text-base-strong">{props.emptyState.title}</p>
              {props.emptyState.description && (
                <p className="type-body-sm-regular text-base-muted">
                  {props.emptyState.description}
                </p>
              )}
            </div>
            {props.emptyState.action && (
              <PanelAction action={props.emptyState.action} labels={labels} />
            )}
          </div>
        ) : null}
        {props.accountManagement && (
          <PanelAction action={props.accountManagement} labels={labels} />
        )}
      </div>
      <div className="-mx-6 shrink-0 border-t border-border-base-subtle px-6 pt-6 sm:-mx-4 sm:px-4">
        {appearance && (
          <div className="hidden shrink-0 flex-col sm:flex">
            <RadioGroup
              aria-label={appearance.label}
              value={appearance.value}
              onChange={appearance.onChange}
              isDisabled={appearance.isDisabled}
              className="flex flex-col pb-4"
            >
              <span className="type-body-sm-regular pb-4 text-base-default">
                {appearance.label}
              </span>
              <div className="relative isolate flex rounded-full bg-neutral-alpha-200 p-0.5 [--account-panel-direction:1] rtl:[--account-panel-direction:-1]">
                {appearanceIndex >= 0 && (
                  <span
                    aria-hidden="true"
                    data-account-appearance-pill
                    className="pointer-events-none absolute inset-y-0.5 start-0.5 rounded-full bg-button-secondary-subtle transition-transform duration-slow ease-[cubic-bezier(0.34,1.2,0.64,1)] motion-reduce:transition-none"
                    style={{
                      width: `calc((100% - var(--spacing)) / ${appearance.options.length})`,
                      transform: `translateX(calc(${appearanceIndex} * 100% * var(--account-panel-direction)))`,
                    }}
                  />
                )}
                {appearance.options.map((option) => (
                  <Radio
                    key={option.id}
                    value={option.id}
                    isDisabled={option.isDisabled}
                    className="type-body-sm-medium relative z-10 flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-2 py-2.5 text-center text-base-default outline-none transition-colors duration-normal data-[selected]:text-base-strong data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus data-[disabled]:text-disabled motion-reduce:transition-none"
                  >
                    {option.icon && (
                      <span aria-hidden="true" className="flex shrink-0">
                        {option.icon}
                      </span>
                    )}
                    {option.label}
                  </Radio>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}
        <PanelAction action={props.signOut} labels={labels} danger />
      </div>
    </div>
  );
}

function MobileSheet({ props }: { props: AccountPanelProps }) {
  const drag = useRef<{ id: number; y: number; time: number } | null>(null);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  function cancel() {
    drag.current = null;
    setDragging(false);
    setOffset(0);
  }
  return (
    <div
      className="flex min-h-0 flex-1 flex-col rounded-t-4xl bg-surface-raised pb-[env(safe-area-inset-bottom)] transition-transform duration-normal ease-out data-[dragging=true]:transition-none motion-reduce:transition-none"
      style={{ transform: `translateY(${offset}px)` }}
      data-dragging={dragging}
    >
      <div
        data-account-drag-handle
        aria-hidden="true"
        className="flex shrink-0 touch-none justify-center pt-2 pb-6"
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0 || drag.current) return;
          drag.current = { id: event.pointerId, y: event.clientY, time: event.timeStamp };
          setDragging(true);
          setOffset(0);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (drag.current?.id === event.pointerId)
            setOffset(Math.max(0, event.clientY - drag.current.y));
        }}
        onPointerUp={(event) => {
          const start = drag.current;
          if (!start || start.id !== event.pointerId) return;
          const distance = Math.max(0, event.clientY - start.y);
          const height = event.currentTarget.parentElement?.clientHeight ?? Infinity;
          cancel();
          if (
            distance > height * 0.35 ||
            (distance > 40 && distance / Math.max(1, event.timeStamp - start.time) > 0.11)
          )
            props.onOpenChange(false);
        }}
        onPointerCancel={cancel}
        onLostPointerCapture={cancel}
      >
        <span className="h-1 w-15 rounded-full bg-border-base-emphasis" />
      </div>
      <Button
        intent="secondary"
        appearance="ghost"
        size="sm"
        className="sr-only focus:not-sr-only focus:absolute focus:end-6 focus:top-2"
        onPress={() => props.onOpenChange(false)}
      >
        {props.labels.close}
      </Button>
      <PanelContent {...props} />
    </div>
  );
}

export function AccountPanel(props: AccountPanelProps) {
  const { isOpen, onOpenChange } = props;
  const trigger = useRef<HTMLButtonElement>(null);
  const subscribe = useCallback(
    (notify: () => void) => {
      const query = window.matchMedia(mobileQuery);
      function changeViewport() {
        // Close before replacing the overlay's focus scope; keep the avatar mounted.
        if (isOpen) {
          onOpenChange(false);
          trigger.current?.focus({ preventScroll: true });
        }
        notify();
      }
      query.addEventListener('change', changeViewport);
      return () => query.removeEventListener('change', changeViewport);
    },
    [isOpen, onOpenChange],
  );
  const mobile = useSyncExternalStore(subscribe, isMobileViewport, serverViewport);

  return (
    <div className={props.className}>
      <PopoverTrigger isOpen={props.isOpen} onOpenChange={props.onOpenChange}>
        <Button
          ref={trigger}
          intent="secondary"
          appearance="ghost"
          size="md"
          iconOnly
          aria-label={props.labels.trigger}
          isDisabled={props.isDisabled}
        >
          <AccountAvatar account={props.selectedAccount} size="44" />
        </Button>
        {mobile ? (
          <Modal
            aria-label={props.labels.dialog}
            overlayClassName="items-end p-0 backdrop-blur-[calc(var(--spacing)/2)]"
            className={`flex max-h-[85svh] max-w-none overflow-hidden rounded-t-4xl rounded-b-none p-0 motion-safe:transition-[translate,opacity] motion-safe:duration-slow motion-safe:data-[entering]:translate-y-full motion-safe:data-[entering]:scale-100 motion-safe:data-[exiting]:translate-y-full motion-safe:data-[exiting]:scale-100 motion-reduce:transition-none [&_[role=dialog]]:max-h-[85svh] [&_[role=dialog]]:min-h-0 [&_[role=dialog]]:w-full [&_[role=dialog]]:p-0 ${props.panelClassName ?? ''}`}
          >
            <MobileSheet props={props} />
          </Modal>
        ) : (
          <Popover
            placement="bottom end"
            showArrow={false}
            offset={8}
            className={`w-[389px] max-w-[calc(100vw-2rem)] motion-reduce:transition-none max-h-[80vh] [&>div]:max-h-[inherit] [&>div]:rounded-4xl [&>div]:shadow-sm [&>div>div]:max-h-[inherit] motion-reduce:[&>div]:transition-none ${props.panelClassName ?? ''}`}
          >
            <PopoverDialog aria-label={props.labels.dialog} className="max-h-[inherit]">
              <PanelContent {...props} />
            </PopoverDialog>
          </Popover>
        )}
      </PopoverTrigger>
    </div>
  );
}
