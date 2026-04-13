import * as React from "react";
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
  type TabsProps as AriaTabsProps,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";

export type SegmentedTabsItem = {
  id: string | number;
  label: React.ReactNode;
  panel: React.ReactNode;
  isDisabled?: boolean;
};

export interface SegmentedTabsProps
  extends Omit<AriaTabsProps, "children" | "className"> {
  items: readonly [SegmentedTabsItem, SegmentedTabsItem, ...SegmentedTabsItem[]];
  listAriaLabel?: string;
  isCentered?: boolean;
  className?: string;
  tabListClassName?: string;
  tabClassName?: string;
  panelClassName?: string;
}

export function SegmentedTabs({
  items,
  listAriaLabel = "Tabs",
  isCentered = true,
  className,
  tabListClassName,
  tabClassName,
  panelClassName,
  selectedKey,
  defaultSelectedKey,
  ...props
}: SegmentedTabsProps) {
  const selectionProps =
    selectedKey !== undefined
      ? { selectedKey }
      : { defaultSelectedKey: defaultSelectedKey ?? items[0].id };

  return (
    <AriaTabs {...props} {...selectionProps} className={twMerge("w-full", className)}>
      <AriaTabList
        aria-label={listAriaLabel}
        className={twMerge(
          "flex w-full rounded-full border border-fg-border-default-subtle bg-bg-surface-surface-raised p-[4px] lg:w-fit",
          isCentered && "mx-auto",
          tabListClassName,
        )}
      >
        {items.map((item) => (
          <AriaTab
            key={item.id}
            id={item.id}
            isDisabled={item.isDisabled}
            className={(state) =>
              twMerge(
                "inline-flex w-full items-center justify-center rounded-full px-[16px] py-[16px] text-[18px] leading-[28px] font-semibold whitespace-nowrap antialiased transition-colors duration-300 outline-none md:px-[40px] md:py-[20px] md:text-[20px] data-[disabled]:pointer-events-none data-[disabled]:text-fg-text-disabled-disabled",
                state.isSelected
                  ? "bg-bg-button-primary-default text-white"
                  : "bg-transparent text-fg-text-default-muted data-[hovered]:text-fg-text-default-default data-[pressed]:bg-bg-button-secondary-subtle-hover",
                state.isFocusVisible && "ring-2 ring-fg-border-focus ring-offset-2",
                tabClassName,
              )
            }
          >
            {item.label}
          </AriaTab>
        ))}
      </AriaTabList>

      {items.map((item) => (
        <AriaTabPanel
          key={item.id}
          id={item.id}
          className={twMerge(
            "pt-[16px] text-[16px] leading-[24px] text-fg-text-default-default",
            panelClassName,
          )}
        >
          {item.panel}
        </AriaTabPanel>
      ))}
    </AriaTabs>
  );
}
