'use client';

import * as React from 'react';
import {
  Button as AriaButton,
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
  SelectionIndicator,
  TabListStateContext,
  RouterProvider,
  type TabProps as AriaTabProps,
  type TabsProps as AriaTabsProps,
} from 'react-aria-components';
import { CaretDownIcon } from '@phosphor-icons/react';
import { twMerge } from 'tailwind-merge';
import { Menu, MenuItem, MenuPopover, MenuTrigger } from './menu.js';
import { useVeliLanguage, useVeliRouter } from './provider-shared.js';
import { webkitDhivehiTextBaselineClassName } from './typography-shared.js';

export type TabsSize = 'sm' | 'md' | 'lg';

export type TabsItemLinkProps = Pick<
  AriaTabProps,
  | 'href'
  | 'hrefLang'
  | 'target'
  | 'rel'
  | 'download'
  | 'ping'
  | 'referrerPolicy'
  | 'routerOptions'
  | 'render'
>;

export type TabsItem = TabsItemLinkProps & {
  id: string | number;
  label: React.ReactNode;
  panel?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  isDisabled?: boolean;
};

export type TabsOverflowItem = Pick<
  TabsItem,
  | 'id'
  | 'label'
  | 'leading'
  | 'trailing'
  | 'isDisabled'
  | 'href'
  | 'hrefLang'
  | 'target'
  | 'rel'
  | 'download'
  | 'ping'
  | 'referrerPolicy'
  | 'routerOptions'
  | 'render'
>;

function getTabsItemLinkProps(item: TabsItem | TabsOverflowItem): TabsItemLinkProps {
  const linkProps: TabsItemLinkProps = {};

  if (item.href != null) linkProps.href = item.href;
  if (item.hrefLang != null) linkProps.hrefLang = item.hrefLang;
  if (item.target != null) linkProps.target = item.target;
  if (item.rel != null) linkProps.rel = item.rel;
  if (item.download != null) linkProps.download = item.download;
  if (item.ping != null) linkProps.ping = item.ping;
  if (item.referrerPolicy != null) linkProps.referrerPolicy = item.referrerPolicy;
  if (item.routerOptions != null) linkProps.routerOptions = item.routerOptions;
  if (item.render != null) linkProps.render = item.render;

  return linkProps;
}

export interface TabsProps extends Omit<AriaTabsProps, 'children' | 'className'> {
  items: readonly [TabsItem, TabsItem, ...TabsItem[]];
  overflowItems?: readonly TabsItem[];
  size?: TabsSize;
  listAriaLabel?: string;
  className?: string;
  tabListClassName?: string;
  tabClassName?: string;
  panelClassName?: string;
}

const tabSelectionIndicatorClassName =
  'absolute -bottom-1 inset-inline-start-0 h-0.5 w-full rounded-sm bg-tabs-border-active motion-safe:transition-[translate,width] motion-safe:duration-normal motion-safe:ease-in-out motion-reduce:transition-none';

const tabBaseClassName =
  'relative mb-0.5 inline-flex cursor-pointer items-center rounded-lg whitespace-nowrap text-base-default antialiased outline-none motion-safe:transition-colors motion-safe:duration-normal motion-safe:ease-in-out motion-reduce:transition-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-icon-base';

const tabSizeClassName: Record<TabsSize, string> = {
  sm: 'p-2',
  md: 'px-2 py-2.5',
  lg: 'px-2 py-2.5',
};

const tabLabelPaddingClassName: Record<TabsSize, string> = {
  sm: 'px-1.5',
  md: 'px-2',
  lg: 'px-2',
};

const tabLabelTypeClassName: Record<
  TabsSize,
  { regular: string; medium: string; reserve: string }
> = {
  sm: {
    regular: 'type-body-sm-regular',
    medium: 'type-body-sm-medium',
    reserve: 'type-body-sm-medium',
  },
  md: {
    regular: 'type-body-md-regular',
    medium: 'type-body-md-medium',
    reserve: 'type-body-md-medium',
  },
  lg: {
    regular: 'type-body-lg-regular',
    medium: 'type-body-lg-medium',
    reserve: 'type-body-lg-medium',
  },
};

const hiddenTabClassName =
  'pointer-events-none absolute h-px w-px overflow-hidden border-0 p-0 opacity-0 [-webkit-clip-path:inset(50%)] [clip-path:inset(50%)]';

const tabBarScrollClassName =
  'w-full max-w-full overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden motion-safe:scroll-smooth';

const tabBarUnderlineClassName =
  'relative inline-flex max-w-full min-w-0 items-end border-b-2 border-tabs-border-inactive';

const tabLabelGridClassName =
  'inline-grid justify-items-center [&>*]:col-start-1 [&>*]:row-start-1';

const tabsOverflowDefaultLabels = {
  en: 'More',
  dv: 'އިތުރު',
} as const;

function getFirstEnabledTabId(
  items: readonly TabsItem[],
  overflowItems?: readonly TabsItem[],
): string | number {
  for (const item of items) {
    if (!item.isDisabled) {
      return item.id;
    }
  }

  if (overflowItems) {
    for (const item of overflowItems) {
      if (!item.isDisabled) {
        return item.id;
      }
    }
  }

  return items[0].id;
}

function TabLabel({
  children,
  isSelected,
  size,
}: {
  children: React.ReactNode;
  isSelected: boolean;
  size: TabsSize;
}) {
  const type = tabLabelTypeClassName[size];

  return (
    <span className={twMerge(tabLabelGridClassName, tabLabelPaddingClassName[size])}>
      <span aria-hidden="true" className={twMerge('invisible inline-block', type.reserve)}>
        {children}
      </span>
      <span
        className={twMerge(
          'inline-block',
          webkitDhivehiTextBaselineClassName,
          isSelected ? `${type.medium} text-base-strong` : type.regular,
        )}
      >
        {children}
      </span>
    </span>
  );
}

function TabSlot({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex shrink-0 items-center p-0.5">{children}</span>;
}

const tabsOverflowTriggerAttribute = 'data-tabs-overflow-trigger';

type TabIndicatorPosition = {
  width: number;
  x: number;
};

function measureTabBarIndicatorPosition(
  container: HTMLElement,
  target: HTMLElement,
): TabIndicatorPosition {
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  return {
    width: targetRect.width,
    x: targetRect.left - containerRect.left,
  };
}

function useTabBarIndicatorPosition({
  containerRef,
  selectedKey,
  overflowItemIds,
  tabElementsRef,
  overflowTriggerRef,
  version,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  selectedKey: string | number | null;
  overflowItemIds: ReadonlySet<string | number>;
  tabElementsRef: React.MutableRefObject<Map<string | number, HTMLElement>>;
  overflowTriggerRef: React.MutableRefObject<HTMLElement | null>;
  version: number;
}) {
  const [position, setPosition] = React.useState<TabIndicatorPosition | null>(null);

  const measure = React.useCallback(() => {
    const container = containerRef.current;
    if (!container || selectedKey == null) {
      setPosition(null);
      return false;
    }

    const target = overflowItemIds.has(selectedKey)
      ? overflowTriggerRef.current
      : tabElementsRef.current.get(selectedKey);

    if (!target) {
      setPosition(null);
      return false;
    }

    setPosition(measureTabBarIndicatorPosition(container, target));
    return true;
  }, [containerRef, overflowItemIds, overflowTriggerRef, selectedKey, tabElementsRef]);
  const measureRef = React.useRef(measure);

  React.useLayoutEffect(() => {
    measureRef.current = measure;
  }, [measure]);

  React.useLayoutEffect(() => {
    measure();
  }, [measure, version]);

  React.useEffect(() => {
    let frame = 0;
    let attempts = 0;
    const runMeasure = () => measureRef.current();

    const retry = () => {
      if (runMeasure() || attempts >= 30) {
        return;
      }

      attempts += 1;
      frame = requestAnimationFrame(retry);
    };

    if (!runMeasure()) {
      frame = requestAnimationFrame(retry);
    }

    const container = containerRef.current;
    if (!container) {
      return () => cancelAnimationFrame(frame);
    }

    const resizeObserver = new ResizeObserver(runMeasure);
    resizeObserver.observe(container);

    const target = overflowItemIds.has(selectedKey ?? '')
      ? overflowTriggerRef.current
      : selectedKey != null
        ? tabElementsRef.current.get(selectedKey)
        : null;
    if (target) {
      resizeObserver.observe(target);
    }

    window.addEventListener('resize', runMeasure);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('resize', runMeasure);
    };
  }, [containerRef, overflowItemIds, overflowTriggerRef, selectedKey, tabElementsRef, version]);

  return position;
}

function TabsBarIndicator({
  containerRef,
  selectedKey,
  overflowItemIds,
  tabElementsRef,
  overflowTriggerRef,
  version,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  selectedKey: string | number | null;
  overflowItemIds: ReadonlySet<string | number>;
  tabElementsRef: React.MutableRefObject<Map<string | number, HTMLElement>>;
  overflowTriggerRef: React.MutableRefObject<HTMLElement | null>;
  version: number;
}) {
  const position = useTabBarIndicatorPosition({
    containerRef,
    selectedKey,
    overflowItemIds,
    tabElementsRef,
    overflowTriggerRef,
    version,
  });

  if (!position) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-0.5 left-0 h-0.5 rounded-sm bg-tabs-border-active motion-safe:transition-[left,width] motion-safe:duration-normal motion-safe:ease-in-out motion-reduce:transition-none"
      style={{
        width: position.width,
        left: position.x,
      }}
    />
  );
}

function getTabClassName(
  isSelected: boolean,
  options?: {
    size?: TabsSize;
    isFocusVisible?: boolean;
    isHovered?: boolean;
    isPressed?: boolean;
    isDisabled?: boolean;
    tabClassName?: string;
  },
) {
  const size = options?.size ?? 'sm';

  return twMerge(
    tabBaseClassName,
    tabSizeClassName[size],
    options?.isDisabled &&
      'pointer-events-none cursor-not-allowed text-disabled [&_svg]:text-icon-disabled',
    options?.isHovered && 'bg-tabs-hover',
    options?.isPressed && 'bg-tabs-pressed',
    isSelected && '[&_svg]:text-icon-base-strong',
    options?.isFocusVisible && 'ring-2 ring-border-focus ring-offset-2',
    options?.tabClassName,
  );
}

export interface TabsOverflowProps {
  items: readonly TabsOverflowItem[];
  selectedKey?: string | number | null;
  onSelectTab?: (key: string | number) => void;
  size?: TabsSize;
  label?: React.ReactNode;
  menuLabel?: string;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  triggerRef?: React.Ref<HTMLButtonElement>;
}

/**
 * Overflow "More" trigger used by `Tabs` when `overflowItems` are provided.
 * Prefer configuring overflow through `Tabs`; this export is for advanced
 * composition inside an active React Aria tab list state.
 */
export function TabsOverflow({
  items,
  selectedKey: selectedKeyProp,
  onSelectTab,
  size = 'sm',
  label,
  menuLabel = 'More tabs',
  className,
  triggerClassName,
  popoverClassName,
  triggerRef,
}: TabsOverflowProps) {
  const { direction, language, lang } = useVeliLanguage();
  const state = React.useContext(TabListStateContext);
  const selectedKey = selectedKeyProp ?? state?.selectedKey ?? null;
  const defaultLabel =
    tabsOverflowDefaultLabels[language === 'dv' ? 'dv' : 'en'] ?? tabsOverflowDefaultLabels.en;
  const selectTab =
    onSelectTab ??
    (state
      ? (key: string | number) => {
          state.selectionManager.setSelectedKeys([key]);
        }
      : undefined);

  // React Aria builds the tab collection in a hidden tree without tab state.
  if (!selectTab) {
    return null;
  }

  const selectedOverflowItem = items.find((item) => item.id === selectedKey);
  const isSelected = selectedOverflowItem != null;
  const triggerLabel = isSelected ? selectedOverflowItem.label : (label ?? defaultLabel);

  return (
    <div className={twMerge('relative shrink-0', className)}>
      <MenuTrigger>
        <AriaButton
          ref={triggerRef}
          {...{ [tabsOverflowTriggerAttribute]: '' }}
          className={(buttonState) =>
            getTabClassName(isSelected, {
              size,
              isFocusVisible: buttonState.isFocusVisible,
              isHovered: buttonState.isHovered,
              isPressed: buttonState.isPressed,
              tabClassName: triggerClassName,
            })
          }
        >
          {isSelected && selectedOverflowItem.leading ? (
            <TabSlot>{selectedOverflowItem.leading}</TabSlot>
          ) : null}
          <TabLabel isSelected={isSelected} size={size}>
            {triggerLabel}
          </TabLabel>
          <TabSlot>
            <CaretDownIcon aria-hidden="true" size={16} />
          </TabSlot>
        </AriaButton>
        <MenuPopover className={popoverClassName}>
          <Menu
            aria-label={menuLabel}
            dir={direction}
            lang={lang}
            selectedKeys={selectedKey != null ? [selectedKey] : []}
            selectionMode="single"
            onAction={(key) => {
              selectTab(key);
            }}
          >
            {items.map((item) => (
              <MenuItem
                key={item.id}
                id={item.id}
                isDisabled={item.isDisabled}
                size={size}
                className="cursor-pointer"
                startIcon={item.leading}
                endIcon={item.trailing}
                {...getTabsItemLinkProps(item)}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </MenuPopover>
      </MenuTrigger>
    </div>
  );
}

function TabItem({
  item,
  size,
  tabClassName,
  showSelectionIndicator = true,
  onTabElementChange,
}: {
  item: TabsItem | TabsOverflowItem;
  size: TabsSize;
  tabClassName?: string;
  showSelectionIndicator?: boolean;
  onTabElementChange?: (id: string | number, element: HTMLElement | null) => void;
}) {
  const tabElementRef = React.useCallback(
    (element: HTMLElement | null) => {
      onTabElementChange?.(item.id, element);
    },
    [item.id, onTabElementChange],
  );

  return (
    <AriaTab
      ref={tabElementRef}
      id={item.id}
      isDisabled={item.isDisabled}
      {...getTabsItemLinkProps(item)}
      className={(state) =>
        getTabClassName(state.isSelected, {
          size,
          isFocusVisible: state.isFocusVisible,
          isHovered: state.isHovered,
          isPressed: state.isPressed,
          isDisabled: state.isDisabled,
          tabClassName,
        })
      }
    >
      {(state) => (
        <>
          {item.leading ? <TabSlot>{item.leading}</TabSlot> : null}
          <TabLabel isSelected={state.isSelected} size={size}>
            {item.label}
          </TabLabel>
          {item.trailing ? <TabSlot>{item.trailing}</TabSlot> : null}
          {showSelectionIndicator ? (
            <SelectionIndicator className={tabSelectionIndicatorClassName} />
          ) : null}
        </>
      )}
    </AriaTab>
  );
}

function useLazyRef<T>(createValue: () => T): React.MutableRefObject<T> {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = createValue();
  }

  return ref as React.MutableRefObject<T>;
}

export function Tabs({
  items,
  overflowItems,
  size = 'sm',
  listAriaLabel = 'Tabs',
  className,
  tabListClassName,
  tabClassName,
  panelClassName,
  selectedKey: selectedKeyProp,
  defaultSelectedKey,
  onSelectionChange,
  keyboardActivation,
  ...props
}: TabsProps) {
  const veliRouter = useVeliRouter();
  const [uncontrolledKey, setUncontrolledKey] = React.useState(
    () => defaultSelectedKey ?? getFirstEnabledTabId(items, overflowItems),
  );
  const isControlled = selectedKeyProp !== undefined;
  const currentSelectedKey = isControlled ? selectedKeyProp : uncontrolledKey;

  const handleSelectionChange = React.useCallback(
    (key: React.Key) => {
      const nextKey = key as string | number;
      if (!isControlled) {
        setUncontrolledKey(nextKey);
      }
      onSelectionChange?.(nextKey);
    },
    [isControlled, onSelectionChange],
  );

  const allPanelItems = React.useMemo(
    () => (overflowItems ? [...items, ...overflowItems] : items),
    [items, overflowItems],
  );
  const hasLinkItems = allPanelItems.some((item) => item.href != null);

  const hasOverflow = overflowItems != null && overflowItems.length > 0;
  const overflowItemIds = React.useMemo(
    () => new Set(overflowItems?.map((item) => item.id) ?? []),
    [overflowItems],
  );
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const tabBarRef = React.useRef<HTMLDivElement>(null);
  const tabElementsRef = useLazyRef(() => new Map<string | number, HTMLElement>());
  const overflowTriggerRef = React.useRef<HTMLElement | null>(null);
  const [indicatorVersion, setIndicatorVersion] = React.useState(0);

  const handleTabElementChange = React.useCallback(
    (id: string | number, element: HTMLElement | null) => {
      if (element) {
        tabElementsRef.current.set(id, element);
      } else {
        tabElementsRef.current.delete(id);
      }
      setIndicatorVersion((version) => version + 1);
    },
    [tabElementsRef],
  );

  const handleOverflowTriggerChange = React.useCallback((element: HTMLElement | null) => {
    overflowTriggerRef.current = element;
    setIndicatorVersion((version) => version + 1);
  }, []);

  React.useEffect(() => {
    if (currentSelectedKey == null) {
      return;
    }

    const target = overflowItemIds.has(currentSelectedKey)
      ? overflowTriggerRef.current
      : tabElementsRef.current.get(currentSelectedKey);

    target?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
    });
  }, [currentSelectedKey, overflowItemIds, tabElementsRef, indicatorVersion]);

  const navigateLinkTab = React.useCallback(
    (href: string, routerOptions: Parameters<NonNullable<typeof veliRouter>['navigate']>[1]) => {
      veliRouter?.navigate(href, routerOptions);
      // React Aria's linkBehavior:'selection' calls router.open then restores the
      // previous selectedKeys. Re-apply the link tab selection after that reset.
      const match = allPanelItems.find((item) => item.href === href);
      if (match == null) {
        return;
      }
      void Promise.resolve().then(() => {
        handleSelectionChange(match.id);
      });
    },
    [allPanelItems, handleSelectionChange, veliRouter],
  );

  const panels = allPanelItems.map((item) => {
    const hasPanel = item.panel !== undefined;

    return (
      <AriaTabPanel
        key={item.id}
        id={item.id}
        className={twMerge(
          hasPanel
            ? 'block w-full pt-4 type-body-md-regular text-base-default'
            : hiddenTabClassName,
          hasPanel ? panelClassName : undefined,
        )}
      >
        {item.panel}
      </AriaTabPanel>
    );
  });

  const tabsProps = {
    ...props,
    keyboardActivation: keyboardActivation ?? (hasLinkItems ? 'manual' : undefined),
    selectedKey: currentSelectedKey,
    onSelectionChange: handleSelectionChange,
  };

  const tree = (
    <AriaTabs {...tabsProps} className={twMerge('w-full', className)}>
      <div ref={scrollContainerRef} className={tabBarScrollClassName}>
        <div ref={tabBarRef} className={twMerge(tabBarUnderlineClassName, tabListClassName)}>
          <AriaTabList aria-label={listAriaLabel} className="inline-flex min-w-0">
            {items.map((item) => (
              <TabItem
                key={item.id}
                item={item}
                size={size}
                tabClassName={tabClassName}
                showSelectionIndicator={!hasOverflow}
                onTabElementChange={handleTabElementChange}
              />
            ))}
            {overflowItems?.map((item) => (
              <AriaTab
                key={item.id}
                id={item.id}
                // Keep overflow tabs in the collection for panels/selection, but
                // exclude them from keyboard navigation; the More menu selects them.
                isDisabled
                aria-hidden="true"
                className={hiddenTabClassName}
                {...getTabsItemLinkProps(item)}
              >
                {item.label}
              </AriaTab>
            ))}
          </AriaTabList>
          {hasOverflow ? (
            <TabsOverflow
              items={overflowItems}
              selectedKey={currentSelectedKey}
              onSelectTab={handleSelectionChange}
              size={size}
              triggerRef={handleOverflowTriggerChange}
            />
          ) : null}
          {hasOverflow ? (
            <TabsBarIndicator
              containerRef={tabBarRef}
              selectedKey={currentSelectedKey}
              overflowItemIds={overflowItemIds}
              tabElementsRef={tabElementsRef}
              overflowTriggerRef={overflowTriggerRef}
              version={indicatorVersion}
            />
          ) : null}
        </div>
      </div>
      {panels}
    </AriaTabs>
  );

  // React Aria resets selection for href tabs; wrap with a router that re-applies
  // selection and forwards to VeliProvider.navigate when configured.
  if (!hasLinkItems || veliRouter == null) {
    return tree;
  }

  return (
    <RouterProvider navigate={navigateLinkTab} useHref={veliRouter.useHref}>
      {tree}
    </RouterProvider>
  );
}
