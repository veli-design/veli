'use client';

import { useCallback, useId, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { CircleNotch } from 'phosphor-react';
import {
  Button as AriaButton,
  Dialog,
  Modal as AriaModal,
  ModalOverlay,
  Radio,
  RadioGroup,
} from 'react-aria-components';
import { Avatar } from '@tradenetcorp/veli-ui/avatar';
import { Badge, type BadgeIntent } from '@tradenetcorp/veli-ui/badge';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Divider } from '@tradenetcorp/veli-ui/divider';
import { Skeleton } from '@tradenetcorp/veli-ui/skeleton';
import { Alert } from '@tradenetcorp/veli-ui/alert';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { Popover, PopoverDialog, PopoverTrigger } from '@tradenetcorp/veli-ui/popover';

export type AccountPanelState = {
  isPending?: boolean;
};

export type AccountPanelAccount = AccountPanelState & {
  id: string;
  displayName: string;
  secondaryText?: string;
  /** Override the secondary text's language independently, e.g. 'en' for an email. */
  secondaryTextLang?: string;
  secondaryTextDir?: 'ltr' | 'rtl' | 'auto';
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
  /** Account-list retrieval failure. Action failures are presented by the host. */
  error?: string;
  /** The host owns account switching and updates selectedAccount after success. */
  onAccountSelect: (id: string) => void;
  signOut: AccountPanelAction;
  accountManagement?: AccountPanelAction;
  emptyState?: { title: string; description?: string; action?: AccountPanelAction };
  /** Optional desktop-only preference UI. The host applies and persists changes. */
  appearance?: {
    label: string;
    value: string;
    options: readonly { id: string; label: string; icon?: ReactNode }[];
    onChange: (value: string) => void;
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

function StateMessage({ state, labels }: { state: AccountPanelState; labels: AccountPanelLabels }) {
  return (
    <>
      {state.isPending && (
        <span role="status" className="sr-only">
          {labels.pending}
        </span>
      )}
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
    <div className="flex shrink-0 flex-col gap-1">
      <Button
        intent={danger ? 'danger' : 'secondary'}
        appearance={danger ? 'fill' : 'transparent'}
        size="md"
        className={danger ? 'w-full' : undefined}
        isPending={action.isPending}
        aria-describedby={action.isPending ? stateId : undefined}
        onPress={() => {
          if (!action.isPending) action.onPress();
        }}
      >
        {action.label}
      </Button>
      {action.isPending && (
        <div id={stateId} className="sr-only">
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
  onSelect: (id: string) => void;
  labels: AccountPanelLabels;
}) {
  const stateId = useId();
  const content = (
    <>
      {account.isPending ? (
        <span
          aria-hidden="true"
          data-account-pending-avatar
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-avatar-neutral text-base-default"
        >
          <CircleNotch weight="bold" className="size-4 motion-safe:animate-spin" />
        </span>
      ) : (
        <AccountAvatar account={account} size="44" />
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1 text-start">
        <span
          lang={account.lang}
          dir={account.dir ?? 'auto'}
          className="type-body-md-semibold truncate text-base-strong rtl:text-right"
        >
          {account.displayName}
        </span>
        {account.secondaryText && (
          <span
            lang={account.secondaryTextLang ?? account.lang}
            dir={account.secondaryTextDir ?? account.dir ?? 'auto'}
            className="type-body-sm-regular truncate text-base-muted rtl:text-right"
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
      <AriaButton
        type="button"
        className="flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-2xl border-0 bg-transparent p-3 text-start font-sans text-base-strong outline-none data-[hovered]:bg-neutral-alpha-200 data-[pressed]:bg-neutral-alpha-200 data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-bg-surface-raised data-[pending]:cursor-wait forced-colors:data-[focus-visible]:outline-solid forced-colors:data-[focus-visible]:outline-2 forced-colors:data-[focus-visible]:outline-offset-2"
        isPending={account.isPending}
        aria-describedby={account.isPending ? stateId : undefined}
        onPress={() => {
          if (!account.isPending) onSelect(account.id);
        }}
        render={(domProps, { isPending }) => (
          <button
            {...domProps}
            type="button"
            aria-busy={isPending || undefined}
            onClick={isPending ? (event) => event.preventDefault() : domProps.onClick}
          />
        )}
      >
        {content}
      </AriaButton>
      {account.isPending && (
        <div id={stateId} className="sr-only">
          <StateMessage state={account} labels={labels} />
        </div>
      )}
    </li>
  );
}

function PanelContent(props: AccountPanelProps) {
  const { selectedAccount, labels, accountGroups = [], appearance } = props;
  const { language } = useVeliLanguage();
  const groups = accountGroups.filter((group) => group.accounts.length > 0);
  const appearanceIndex =
    appearance?.options.findIndex((option) => option.id === appearance.value) ?? -1;
  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 sm:p-4">
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain pb-4 [&>*]:shrink-0">
        <div
          data-account-profile
          className="flex shrink-0 flex-col items-center gap-3 rounded-2xl bg-neutral-alpha-200 px-2 pt-7 pb-8 text-center"
        >
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
              <p
                lang={selectedAccount.secondaryTextLang}
                dir={selectedAccount.secondaryTextDir}
                className="type-body-md-regular truncate text-base-muted"
              >
                {selectedAccount.secondaryText}
              </p>
            )}
          </div>
          {selectedAccount.badge && (
            <Badge intent={selectedAccount.badgeIntent ?? 'info'} appearance="subtle" size="sm">
              {selectedAccount.badge}
            </Badge>
          )}
          {selectedAccount.isPending && (
            <div className="sr-only">
              <StateMessage state={selectedAccount} labels={labels} />
            </div>
          )}
        </div>
        {props.isLoading && (
          <>
            <p role="status" className="sr-only">
              {labels.loading}
            </p>
            <section aria-label={labels.otherAccounts} aria-busy="true">
              <p className="type-body-sm-regular pt-3 pb-2 text-base-default">
                {labels.otherAccounts}
              </p>
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  data-account-skeleton
                  className="flex items-center gap-3 p-3"
                  aria-hidden="true"
                >
                  <Skeleton className="size-11 shrink-0 rounded-full motion-reduce:animate-none" />
                  <div className="flex flex-1 flex-col gap-1">
                    <Skeleton className="h-6 w-3/4 motion-reduce:animate-none" />
                    <Skeleton className="h-5 w-1/2 motion-reduce:animate-none" />
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
        {props.error && (
          <Alert intent="danger" live="alert">
            <Alert.Title>{props.error}</Alert.Title>
          </Alert>
        )}
        {!props.isLoading && groups.length > 0 ? (
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
              orientation="horizontal"
              value={appearance.value}
              onChange={appearance.onChange}
              className="flex flex-col pb-4"
            >
              <span className="type-body-sm-regular pb-4 text-base-default">
                {appearance.label}
              </span>
              <div
                className="relative isolate grid rounded-full bg-neutral-alpha-200 p-0.5 [--account-panel-direction:1] rtl:[--account-panel-direction:-1]"
                style={{
                  gridTemplateColumns: `repeat(${appearance.options.length}, minmax(0, 1fr))`,
                }}
              >
                {appearanceIndex >= 0 && (
                  <span
                    aria-hidden="true"
                    data-account-appearance-pill
                    className="pointer-events-none absolute inset-y-0.5 start-0.5 rounded-full bg-button-secondary-subtle transition-transform duration-slow ease-[cubic-bezier(0.34,1.2,0.64,1)] motion-reduce:transition-none"
                    style={{
                      width: `calc((100% - var(--veli-spacing-1)) / ${appearance.options.length})`,
                      transform: `translateX(calc(${appearanceIndex} * 100% * var(--account-panel-direction)))`,
                    }}
                  />
                )}
                {appearance.options.map((option) => (
                  <Radio
                    key={option.id}
                    value={option.id}
                    className={`${language === 'dv' ? 'type-body-sm-regular' : 'type-body-sm-medium'} relative z-10 flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-2 py-2.5 text-center text-base-default outline-none transition-colors duration-normal data-[selected]:text-base-strong data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus motion-reduce:transition-none`}
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
  const { lang, direction } = useVeliLanguage();
  return (
    <ModalOverlay
      data-account-sheet-overlay
      isDismissable
      lang={lang}
      dir={direction}
      className="fixed inset-0 z-50 flex min-h-dvh items-end justify-center bg-black/60 backdrop-blur-[6px] transition-opacity duration-normal ease-out data-[entering]:opacity-0 data-[exiting]:opacity-0 motion-reduce:transition-none"
    >
      <MobileSheetSurface props={props} />
    </ModalOverlay>
  );
}

// The headless Modal is the one physical sheet: its background, notch, content and
// footer share both the drag transform and entry/exit translation.
function MobileSheetSurface({ props }: { props: AccountPanelProps }) {
  const { lang, direction } = useVeliLanguage();
  const drag = useRef<{ id: number; y: number; time: number } | null>(null);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  function cancel() {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    setOffset(0);
  }
  return (
    <AriaModal
      data-account-sheet
      lang={lang}
      dir={direction}
      className={`relative flex max-h-[85svh] w-full flex-col overflow-hidden rounded-t-4xl bg-surface-raised text-base-default shadow-sm outline-none transition-[translate,transform,opacity] [transition-duration:var(--veli-duration-slow),var(--veli-duration-normal),var(--veli-duration-slow)] ease-out data-[entering]:translate-y-full data-[entering]:opacity-0 data-[exiting]:translate-y-full data-[exiting]:opacity-0 data-[exiting]:[transition-duration:var(--veli-duration-normal)] data-[dragging=true]:transition-none motion-reduce:transition-none ${props.panelClassName ?? ''}`}
      style={{ transform: `translateY(${offset}px)` }}
      data-dragging={dragging}
    >
      <Dialog
        aria-label={props.labels.dialog}
        lang={lang}
        dir={direction}
        className="relative flex min-h-0 max-h-[inherit] w-full flex-1 flex-col pb-[env(safe-area-inset-bottom)] outline-none"
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
            if (
              distance > height * 0.35 ||
              (distance > 40 && distance / Math.max(1, event.timeStamp - start.time) > 0.11)
            ) {
              // Keep the released offset during the overlay's exit; do not snap home first.
              drag.current = null;
              setOffset(distance);
              setDragging(false);
              props.onOpenChange(false);
            } else {
              cancel();
            }
          }}
          onPointerCancel={cancel}
          onLostPointerCapture={cancel}
        >
          <span className="h-1 w-15 rounded-full bg-neutral-400" />
        </div>
        <div className="absolute end-6 top-2 z-10">
          <AriaButton
            className="type-body-sm-medium sr-only cursor-pointer rounded-full border-0 bg-button-secondary-subtle font-sans text-base-strong outline-none data-[focus-visible]:not-sr-only data-[focus-visible]:px-2 data-[focus-visible]:py-1 data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus forced-colors:data-[focus-visible]:outline-solid forced-colors:data-[focus-visible]:outline-2"
            onPress={() => props.onOpenChange(false)}
          >
            {props.labels.close}
          </AriaButton>
        </div>
        <PanelContent {...props} />
      </Dialog>
    </AriaModal>
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
          className={
            props.isOpen
              ? 'ring-2 ring-border-focus ring-offset-2 ring-offset-bg-surface-raised'
              : undefined
          }
        >
          <AccountAvatar account={props.selectedAccount} size="44" />
        </Button>
        {mobile ? (
          <MobileSheet props={props} />
        ) : (
          <Popover
            placement="bottom end"
            showArrow={false}
            offset={8}
            className={`w-[389px] max-w-[calc(100vw-2rem)] motion-reduce:transition-none max-h-[80vh] [&>div]:max-h-[inherit] [&>div]:rounded-4xl [&>div]:bg-surface-raised [&>div]:shadow-sm [&>div>div]:max-h-[inherit] motion-reduce:[&>div]:transition-none ${props.panelClassName ?? ''}`}
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
