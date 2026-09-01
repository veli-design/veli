'use client';

import * as React from 'react';
import { useContext } from 'react';
import {
  Button as AriaButton,
  Disclosure as AriaDisclosure,
  DisclosureGroup as AriaDisclosureGroup,
  DisclosurePanel as AriaDisclosurePanel,
  DisclosureStateContext,
  Heading,
  type DisclosureGroupProps as AriaDisclosureGroupProps,
  type DisclosurePanelProps as AriaDisclosurePanelProps,
  type DisclosureProps as AriaDisclosureProps,
  type HeadingProps,
} from 'react-aria-components';
import { CaretDown, CaretRight } from 'phosphor-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const accordionVariants = cva('w-full font-sans antialiased');

const accordionItemVariants = cva('last:[&_[data-accordion-header]]:border-b-0');

const accordionHeaderWrapperVariants = cva('border-b border-base-subtle pb-0.5');

const accordionTriggerVariants = cva(
  'flex w-full items-center gap-2 rounded-xl text-base-strong outline-none transition-colors duration-normal ease-out data-[disabled]:pointer-events-none data-[disabled]:text-disabled data-[hovered]:bg-accordion-hover data-[pressed]:bg-accordion-pressed data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-bg-surface-base',
  {
    variants: {
      size: {
        md: 'py-3 type-body-sm-medium',
        lg: 'py-4 type-body-md-medium',
      },
      alignment: {
        left: 'justify-between text-start',
        right: 'justify-start text-start',
      },
      flushed: {
        true: 'px-1.5',
        false: 'px-4',
      },
    },
    defaultVariants: {
      size: 'md',
      alignment: 'left',
      flushed: false,
    },
  },
);

const AccordionSizeContext = React.createContext<'md' | 'lg'>('md');
const AccordionAlignmentContext = React.createContext<'left' | 'right'>('left');
const AccordionFlushedContext = React.createContext(false);

const accordionChevronWrapperVariants = cva(
  'inline-flex shrink-0 transition-transform duration-normal ease-in-out',
  {
    variants: {
      alignment: {
        left: '',
        right: 'p-1',
      },
      isExpanded: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { alignment: 'left', isExpanded: true, className: '-rotate-180' },
      { alignment: 'right', isExpanded: true, className: 'rotate-90' },
    ],
    defaultVariants: {
      alignment: 'left',
      isExpanded: false,
    },
  },
);

const accordionChevronIconVariants = cva('text-icon-base', {
  variants: {
    isDisabled: {
      true: 'text-icon-disabled',
      false: '',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const accordionPanelVariants = cva(
  'h-(--disclosure-panel-height) overflow-clip motion-safe:transition-[height] motion-safe:duration-normal motion-safe:ease-in-out',
);

const accordionPanelContentVariants = cva('pb-4 pt-1 text-base-default', {
  variants: {
    size: {
      md: 'type-body-sm-regular',
      lg: 'type-body-md-regular',
    },
    flushed: {
      true: 'px-1.5',
      false: 'px-4',
    },
  },
  defaultVariants: {
    size: 'md',
    flushed: false,
  },
});

const accordionPanelIndentVariants = cva('', {
  variants: {
    alignment: {
      left: '',
      right: 'pl-8',
    },
  },
  defaultVariants: {
    alignment: 'left',
  },
});

export type AccordionItemData = {
  id: string | number;
  label: React.ReactNode;
  content: React.ReactNode;
  isDisabled?: boolean;
};

export interface AccordionProps
  extends
    Omit<AriaDisclosureGroupProps, 'children' | 'className'>,
    VariantProps<typeof accordionTriggerVariants> {
  items?: readonly AccordionItemData[];
  children?: React.ReactNode;
  className?: string;
  itemClassName?: string;
  triggerClassName?: string;
  panelClassName?: string;
}

export interface AccordionItemProps extends Omit<AriaDisclosureProps, 'className'> {
  className?: string;
}

export interface AccordionHeaderProps
  extends
    Omit<HeadingProps, 'className' | 'children'>,
    VariantProps<typeof accordionTriggerVariants> {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export interface AccordionPanelProps
  extends
    Omit<AriaDisclosurePanelProps, 'className' | 'children'>,
    VariantProps<typeof accordionPanelContentVariants>,
    Pick<VariantProps<typeof accordionTriggerVariants>, 'alignment'> {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function AccordionItem({ className, ...props }: AccordionItemProps) {
  return <AriaDisclosure {...props} className={twMerge(accordionItemVariants(), className)} />;
}

export function AccordionHeader({
  children,
  className,
  size,
  alignment,
  flushed,
  icon,
  level = 3,
  ...props
}: AccordionHeaderProps) {
  const contextSize = useContext(AccordionSizeContext);
  const contextAlignment = useContext(AccordionAlignmentContext);
  const contextFlushed = useContext(AccordionFlushedContext);
  const resolvedSize = size ?? contextSize;
  const resolvedAlignment = alignment ?? contextAlignment;
  const resolvedFlushed = flushed ?? contextFlushed;

  const state = useContext(DisclosureStateContext);
  const isExpanded = state?.isExpanded ?? false;

  return (
    <div
      data-accordion-header
      className={twMerge(accordionHeaderWrapperVariants(), isExpanded && 'border-b-0 pb-0')}
    >
      <Heading {...props} level={level} className="m-0">
        <AriaButton
          slot="trigger"
          className={twMerge(
            accordionTriggerVariants({
              size: resolvedSize,
              alignment: resolvedAlignment,
              flushed: resolvedFlushed,
            }),
            className,
          )}
        >
          {({ isDisabled }) =>
            resolvedAlignment === 'right' ? (
              <>
                {icon ?? (
                  <span
                    className={accordionChevronWrapperVariants({
                      alignment: resolvedAlignment,
                      isExpanded,
                    })}
                  >
                    <CaretRight
                      aria-hidden
                      size={16}
                      weight="regular"
                      className={accordionChevronIconVariants({ isDisabled })}
                    />
                  </span>
                )}
                <span className="min-w-0 flex-1 text-start">{children}</span>
              </>
            ) : (
              <>
                <span className="min-w-0 flex-1">{children}</span>
                {icon ?? (
                  <span
                    className={accordionChevronWrapperVariants({
                      alignment: resolvedAlignment,
                      isExpanded,
                    })}
                  >
                    <CaretDown
                      aria-hidden
                      size={16}
                      weight="regular"
                      className={accordionChevronIconVariants({ isDisabled })}
                    />
                  </span>
                )}
              </>
            )
          }
        </AriaButton>
      </Heading>
    </div>
  );
}

export function AccordionPanel({
  children,
  className,
  contentClassName,
  size,
  alignment,
  flushed,
  ...props
}: AccordionPanelProps) {
  const contextSize = useContext(AccordionSizeContext);
  const contextAlignment = useContext(AccordionAlignmentContext);
  const contextFlushed = useContext(AccordionFlushedContext);
  const resolvedSize = size ?? contextSize;
  const resolvedAlignment = alignment ?? contextAlignment;
  const resolvedFlushed = flushed ?? contextFlushed;

  return (
    <AriaDisclosurePanel {...props} className={twMerge(accordionPanelVariants(), className)}>
      <div
        className={twMerge(
          accordionPanelContentVariants({
            size: resolvedSize,
            flushed: resolvedFlushed,
          }),
          contentClassName,
        )}
      >
        <div className={accordionPanelIndentVariants({ alignment: resolvedAlignment })}>
          {children}
        </div>
      </div>
    </AriaDisclosurePanel>
  );
}

export function Accordion({
  items,
  children,
  className,
  itemClassName,
  triggerClassName,
  panelClassName,
  size = 'md',
  alignment = 'left',
  flushed = false,
  ...props
}: AccordionProps) {
  return (
    <AccordionSizeContext.Provider value={size ?? 'md'}>
      <AccordionAlignmentContext.Provider value={alignment ?? 'left'}>
        <AccordionFlushedContext.Provider value={flushed ?? false}>
          <AriaDisclosureGroup {...props} className={twMerge(accordionVariants(), className)}>
            {items
              ? items.map((item) => (
                  <AccordionItem
                    key={item.id}
                    id={item.id}
                    isDisabled={item.isDisabled}
                    className={itemClassName}
                  >
                    <AccordionHeader
                      size={size}
                      alignment={alignment}
                      flushed={flushed}
                      className={triggerClassName}
                    >
                      {item.label}
                    </AccordionHeader>
                    <AccordionPanel
                      size={size}
                      alignment={alignment}
                      flushed={flushed}
                      className={panelClassName}
                    >
                      {item.content}
                    </AccordionPanel>
                  </AccordionItem>
                ))
              : children}
          </AriaDisclosureGroup>
        </AccordionFlushedContext.Provider>
      </AccordionAlignmentContext.Provider>
    </AccordionSizeContext.Provider>
  );
}
