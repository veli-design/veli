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
  type TabsProps as AriaTabsProps,
} from 'react-aria-components';
import { CaretDown } from 'phosphor-react';
import { twMerge } from 'tailwind-merge';
import { Menu, MenuItem, MenuPopover, MenuTrigger } from './menu';
import { useVeliLanguage } from './provider';
import { webkitDhivehiTextBaselineClassName } from './typography-shared';

export type TabsItem = {
  id: string | number;
  label: React.ReactNode;
  panel: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  isDisabled?: boolean;
};

export type TabsOverflowItem = Pick<
  TabsItem,
  'id' | 'label' | 'leading' | 'trailing' | 'isDisabled'
>;

export interface TabsProps extends Omit<AriaTabsProps, 'children' | 'className'> {
  items: readonly [TabsItem, TabsItem, ...TabsItem[]];
  overflowItems?: readonly TabsItem[];
  listAriaLabel?: string;
  className?: string;
  tabListClassName?: string;
  tabClassName?: string;
  panelClassName?: string;
}

const tabSelectionIndicatorClassName =
  'absolute -bottom-1 left-0 h-0.5 w-full rounded-sm bg-tabs-border-active motion-safe:transition-[translate,width] motion-safe:duration-200 motion-reduce:transition-none';

const tabBaseClassName =
  'relative mb-0.5 inline-flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 whitespace-nowrap text-text-default-default antialiased transition-colors outline-none [&_svg]:shrink-0 [&_svg]:text-icon-default-default';

const hiddenTabClassName =
  'pointer-events-none absolute h-px w-px overflow-hidden border-0 p-0 opacity-0 [-webkit-clip-path:inset(50%)] [clip-path:inset(50%)]';

const tabLabelGridClassName = 'inline-grid [&>*]:col-start-1 [&>*]:row-start-1';
const tabLabelRegularClassName = `inline-block type-body-sm-regular ${webkitDhivehiTextBaselineClassName}`;
const tabLabelSelectedClassName = `inline-block type-body-sm-medium text-text-default-strong ${webkitDhivehiTextBaselineClassName}`;

function TabLabel({ children, isSelected }: { children: React.ReactNode; isSelected: boolean }) {
  return (
    <span className={tabLabelGridClassName}>
      <span aria-hidden="true" className="invisible inline-block type-body-sm-medium">
        {children}
      </span>
      <span className={isSelected ? tabLabelSelectedClassName : tabLabelRegularClassName}>
        {children}
      </span>
    </span>
  );
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
      className="pointer-events-none absolute -bottom-0.5 left-0 h-0.5 rounded-sm bg-tabs-border-active motion-safe:transition-[left,width] motion-safe:duration-200 motion-reduce:transition-none"
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
    isFocusVisible?: boolean;
    isHovered?: boolean;
    isPressed?: boolean;
    isDisabled?: boolean;
    tabClassName?: string;
  },
) {
  return twMerge(
    tabBaseClassName,
    options?.isDisabled &&
      'pointer-events-none cursor-not-allowed text-text-disabled-disabled [&_svg]:text-icon-disabled-disabled',
    options?.isHovered && 'bg-tabs-hover',
    options?.isPressed && 'bg-tabs-pressed',
    isSelected && '[&_svg]:text-icon-default-strong',
    options?.isFocusVisible && 'ring-2 ring-border-focus ring-offset-2',
    options?.tabClassName,
  );
}

export interface TabsOverflowProps {
  items: readonly TabsOverflowItem[];
  selectedKey?: string | number | null;
  onSelectTab?: (key: string | number) => void;
  label?: React.ReactNode;
  menuLabel?: string;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  triggerRef?: React.Ref<HTMLButtonElement>;
}

export function TabsOverflow({
  items,
  selectedKey: selectedKeyProp,
  onSelectTab,
  label,
  menuLabel = 'More tabs',
  className,
  triggerClassName,
  popoverClassName,
  triggerRef,
}: TabsOverflowProps) {
  const { direction, lang } = useVeliLanguage();
  const state = React.useContext(TabListStateContext);
  const selectedKey = selectedKeyProp ?? state?.selectedKey ?? null;
  const defaultLabel = direction === 'rtl' ? 'އިތުރު' : 'More';
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
              isFocusVisible: buttonState.isFocusVisible,
              isHovered: buttonState.isHovered,
              isPressed: buttonState.isPressed,
              tabClassName: triggerClassName,
            })
          }
        >
          {isSelected && selectedOverflowItem.leading ? (
            <span className="shrink-0">{selectedOverflowItem.leading}</span>
          ) : null}
          <TabLabel isSelected={isSelected}>{triggerLabel}</TabLabel>
          <CaretDown aria-hidden="true" size={16} />
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
                size="sm"
                className="cursor-pointer"
                startIcon={item.leading}
                endIcon={item.trailing}
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
  tabClassName,
  showSelectionIndicator = true,
  onTabElementChange,
}: {
  item: TabsItem | TabsOverflowItem;
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
      className={(state) =>
        getTabClassName(state.isSelected, {
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
          {item.leading ? <span className="shrink-0">{item.leading}</span> : null}
          <TabLabel isSelected={state.isSelected}>{item.label}</TabLabel>
          {item.trailing ? <span className="shrink-0">{item.trailing}</span> : null}
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
  listAriaLabel = 'Tabs',
  className,
  tabListClassName,
  tabClassName,
  panelClassName,
  selectedKey: selectedKeyProp,
  defaultSelectedKey,
  onSelectionChange,
  ...props
}: TabsProps) {
  const [uncontrolledKey, setUncontrolledKey] = React.useState(defaultSelectedKey ?? items[0].id);
  const isControlled = selectedKeyProp !== undefined;
  const currentSelectedKey = isControlled ? selectedKeyProp : uncontrolledKey;

  const handleSelectionChange = (key: React.Key) => {
    const nextKey = key as string | number;
    if (!isControlled) {
      setUncontrolledKey(nextKey);
    }
    onSelectionChange?.(nextKey);
  };

  const allPanelItems = overflowItems ? [...items, ...overflowItems] : items;

  const hasOverflow = overflowItems != null && overflowItems.length > 0;
  const overflowItemIds = React.useMemo(
    () => new Set(overflowItems?.map((item) => item.id) ?? []),
    [overflowItems],
  );
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

  const tabList = (
    <AriaTabList
      aria-label={listAriaLabel}
      className={twMerge('flex', hasOverflow && 'inline-flex max-w-full', tabListClassName)}
    >
      {items.map((item) => (
        <TabItem
          key={item.id}
          item={item}
          tabClassName={tabClassName}
          showSelectionIndicator={!hasOverflow}
          onTabElementChange={handleTabElementChange}
        />
      ))}
      {overflowItems?.map((item) => (
        <AriaTab
          key={item.id}
          id={item.id}
          isDisabled={item.isDisabled}
          className={hiddenTabClassName}
        >
          {item.label}
        </AriaTab>
      ))}
    </AriaTabList>
  );

  const panels = allPanelItems.map((item) => (
    <AriaTabPanel
      key={item.id}
      id={item.id}
      className={twMerge(
        'block w-full pt-4 type-body-md-regular text-text-default-default',
        panelClassName,
      )}
    >
      {item.panel}
    </AriaTabPanel>
  ));

  const tabsProps = {
    ...props,
    selectedKey: currentSelectedKey,
    onSelectionChange: handleSelectionChange,
  };

  if (!hasOverflow) {
    return (
      <AriaTabs {...tabsProps} className={twMerge('w-full', className)}>
        <AriaTabList
          aria-label={listAriaLabel}
          className={twMerge('flex border-b-2 border-tabs-border-inactive', tabListClassName)}
        >
          {items.map((item) => (
            <TabItem key={item.id} item={item} tabClassName={tabClassName} />
          ))}
        </AriaTabList>
        {panels}
      </AriaTabs>
    );
  }

  return (
    <div className={twMerge('flex w-full flex-col', className)}>
      <div
        ref={tabBarRef}
        className={twMerge(
          'relative inline-flex max-w-full items-end border-b-2 border-tabs-border-inactive',
          tabListClassName,
        )}
      >
        <AriaTabs {...tabsProps} className="contents">
          {tabList}
        </AriaTabs>
        <TabsOverflow
          items={overflowItems}
          selectedKey={currentSelectedKey}
          onSelectTab={handleSelectionChange}
          triggerRef={handleOverflowTriggerChange}
        />
        <TabsBarIndicator
          containerRef={tabBarRef}
          selectedKey={currentSelectedKey}
          overflowItemIds={overflowItemIds}
          tabElementsRef={tabElementsRef}
          overflowTriggerRef={overflowTriggerRef}
          version={indicatorVersion}
        />
      </div>
      <AriaTabs {...tabsProps} className="w-full">
        <AriaTabList aria-label={listAriaLabel} className={hiddenTabClassName}>
          {allPanelItems.map((item) => (
            <AriaTab key={item.id} id={item.id} isDisabled={item.isDisabled}>
              {item.label}
            </AriaTab>
          ))}
        </AriaTabList>
        {panels}
      </AriaTabs>
    </div>
  );
}
