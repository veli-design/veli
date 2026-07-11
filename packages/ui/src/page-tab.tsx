'use client';

import * as React from 'react';
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
  type TabsProps as AriaTabsProps,
} from 'react-aria-components';
import { twMerge } from 'tailwind-merge';

export type PageTabItem = {
  id: string | number;
  label: React.ReactNode;
  panel: React.ReactNode;
  isDisabled?: boolean;
};

export interface PageTabProps extends Omit<AriaTabsProps, 'children' | 'className'> {
  items: readonly [PageTabItem, PageTabItem, ...PageTabItem[]];
  listAriaLabel?: string;
  isCentered?: boolean;
  className?: string;
  tabListClassName?: string;
  tabClassName?: string;
  panelClassName?: string;
}

export function PageTab({
  items,
  listAriaLabel = 'Tabs',
  isCentered = true,
  className,
  tabListClassName,
  tabClassName,
  panelClassName,
  selectedKey,
  defaultSelectedKey,
  ...props
}: PageTabProps) {
  const selectionProps =
    selectedKey !== undefined
      ? { selectedKey }
      : { defaultSelectedKey: defaultSelectedKey ?? items[0].id };

  return (
    <AriaTabs {...props} {...selectionProps} className={twMerge('w-full', className)}>
      <AriaTabList
        aria-label={listAriaLabel}
        className={twMerge(
          'flex w-full rounded-full border border-base-subtle bg-surface-raised p-[4px] lg:w-fit',
          isCentered && 'mx-auto',
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
                'inline-flex w-full items-center justify-center rounded-full px-[16px] py-[16px] type-body-lg-semibold whitespace-nowrap antialiased transition-colors duration-slow ease-out outline-none md:px-[40px] md:py-[20px] md:type-subtitle-semibold data-[disabled]:pointer-events-none data-[disabled]:text-disabled',
                state.isSelected
                  ? 'bg-button-primary text-primary-inverted'
                  : 'bg-transparent text-base-muted data-[hovered]:text-base data-[pressed]:bg-button-secondary-subtle-hover',
                state.isFocusVisible && 'ring-2 ring-border-focus ring-offset-2',
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
          className={twMerge('pt-[16px] type-body-md-regular text-base', panelClassName)}
        >
          {item.panel}
        </AriaTabPanel>
      ))}
    </AriaTabs>
  );
}
