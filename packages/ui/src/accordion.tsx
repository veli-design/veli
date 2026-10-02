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

const accordionItemVariants = cva(
  'relative pb-0.5 pt-0.5 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:translate-y-1/2 after:border-b after:border-base-subtle',
);

const accordionTriggerVariants = cva(
  'flex w-full items-center gap-0 rounded-xl text-base-strong outline-none motion-safe:transition-colors motion-safe:duration-fast motion-safe:ease-out data-[hovered]:bg-accordion-hover data-[pressed]:bg-accordion-pressed data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-bg-surface-base',
  {
    variants: {
      size: {
        md: 'py-2.5 type-body-sm-medium',
        lg: 'py-4 type-body-md-medium',
      },
      alignment: {
        left: 'justify-between text-start',
        right: 'justify-start text-start',
      },
      flushed: {
        true: 'ps-0 pe-1.5',
        false: 'px-4',
      },
    },
    compoundVariants: [{ alignment: 'right', flushed: true, className: 'ps-1.5' }],
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
  'inline-flex size-4 shrink-0 motion-safe:transition-transform motion-safe:duration-normal motion-safe:ease-in-out',
  {
    variants: {
      alignment: {
        left: '',
        right: '',
      },
      isExpanded: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { alignment: 'left', isExpanded: true, className: '-rotate-180' },
      { alignment: 'right', isExpanded: false, className: 'rtl:rotate-180' },
      { alignment: 'right', isExpanded: true, className: 'rotate-90' },
    ],
    defaultVariants: {
      alignment: 'left',
      isExpanded: false,
    },
  },
);

const accordionPanelVariants = cva(
  'h-(--disclosure-panel-height) overflow-clip motion-safe:transition-[height] motion-safe:duration-normal motion-safe:ease-in-out',
);

const accordionPanelContentVariants = cva(
  'pb-4.5 pt-0.5 text-start text-base-default [overflow-wrap:anywhere]',
  {
    variants: {
      size: {
        md: 'type-body-sm-regular',
        lg: 'type-body-md-regular',
      },
      flushed: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      flushed: false,
    },
  },
);

const accordionPanelIndentVariants = cva('', {
  variants: {
    alignment: { left: 'pe-10.5', right: 'pe-5.5' },
    flushed: { true: '', false: '' },
  },
  compoundVariants: [
    { alignment: 'left', flushed: false, className: 'ps-5.5' },
    { alignment: 'left', flushed: true, className: 'ps-1.5' },
    { alignment: 'right', flushed: false, className: 'ps-10.5' },
    { alignment: 'right', flushed: true, className: 'ps-8' },
  ],
  defaultVariants: { alignment: 'left', flushed: false },
});

export type AccordionItemData = {
  id: string | number;
  label: React.ReactNode;
  content: React.ReactNode;
};

export interface AccordionProps
  extends
    Omit<AriaDisclosureGroupProps, 'children' | 'className' | 'isDisabled'>,
    VariantProps<typeof accordionTriggerVariants> {
  items?: readonly AccordionItemData[];
  children?: React.ReactNode;
  className?: string;
  itemClassName?: string;
  triggerClassName?: string;
  panelClassName?: string;
}

export interface AccordionItemProps extends Omit<AriaDisclosureProps, 'className' | 'isDisabled'> {
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
  const disclosureProps = { ...props } as AriaDisclosureProps;
  delete disclosureProps.isDisabled;

  return (
    <AriaDisclosure {...disclosureProps} className={twMerge(accordionItemVariants(), className)} />
  );
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
    <div data-accordion-header>
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
          <span
            aria-hidden
            className={twMerge(
              'inline-flex h-6 w-5 shrink-0 items-center justify-center text-icon-base',
              resolvedAlignment === 'left' && 'order-1',
            )}
          >
            {icon ?? (
              <span
                className={accordionChevronWrapperVariants({
                  alignment: resolvedAlignment,
                  isExpanded,
                })}
              >
                {resolvedAlignment === 'right' ? (
                  <CaretRight aria-hidden size={16} weight="regular" />
                ) : (
                  <CaretDown aria-hidden size={16} weight="regular" />
                )}
              </span>
            )}
          </span>
          <span className="min-w-0 flex-1 px-1.5 text-start [overflow-wrap:anywhere]">
            {children}
          </span>
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
        <div
          className={accordionPanelIndentVariants({
            alignment: resolvedAlignment,
            flushed: resolvedFlushed,
          })}
        >
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
  const groupProps = { ...props } as AriaDisclosureGroupProps;
  delete groupProps.isDisabled;

  return (
    <AccordionSizeContext.Provider value={size ?? 'md'}>
      <AccordionAlignmentContext.Provider value={alignment ?? 'left'}>
        <AccordionFlushedContext.Provider value={flushed ?? false}>
          <AriaDisclosureGroup {...groupProps} className={twMerge(accordionVariants(), className)}>
            {items
              ? items.map((item) => (
                  <AccordionItem key={item.id} id={item.id} className={itemClassName}>
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
