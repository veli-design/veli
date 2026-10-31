'use client';

import * as React from 'react';
import {
  Separator as AriaSeparator,
  type SeparatorProps as AriaSeparatorProps,
} from 'react-aria-components';
import { CaretCircleDownIcon } from '@phosphor-icons/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const dividerColorVariants = cva('', {
  variants: {
    appearance: {
      subtle: 'border-base-subtle',
      muted: 'border-base-muted',
      strong: 'border-base-strong',
      emphasis: 'border-base-emphasis',
    },
  },
  defaultVariants: {
    appearance: 'subtle',
  },
});

const dividerLineVariants = cva('min-w-0 flex-1 border-0 border-t', {
  variants: {
    appearance: {
      subtle: 'border-base-subtle',
      muted: 'border-base-muted',
      strong: 'border-base-strong',
      emphasis: 'border-base-emphasis',
    },
  },
  defaultVariants: {
    appearance: 'subtle',
  },
});

const dividerVariants = cva('shrink-0 border-0', {
  variants: {
    orientation: {
      horizontal: 'w-full border-t',
      vertical: 'h-full min-h-6 self-stretch border-l',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

const dividerCaptionClassName = 'shrink-0 type-caption-regular text-base-muted';
const dividerActionClassName =
  'inline-flex w-full min-w-0 cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-start font-sans antialiased outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface-base forced-colors:focus-visible:[outline:2px_solid_Highlight] forced-colors:focus-visible:outline-offset-2';

type DividerSharedProps = Omit<
  AriaSeparatorProps,
  | 'className'
  | 'style'
  | 'onClick'
  | 'orientation'
  | 'aria-orientation'
  | 'role'
  | 'elementType'
  | 'isDecorative'
  | 'render'
  | 'slot'
> &
  VariantProps<typeof dividerColorVariants> & {
    className?: string;
    orientation?: 'horizontal' | 'vertical';
    text?: React.ReactNode;
    /** Shows the Figma CaretCircleDown icon beside the divider label. */
    showIcon?: boolean;
  };

type StaticDividerProps = DividerSharedProps & {
  onClick?: undefined;
};

type InteractiveDividerProps = DividerSharedProps & {
  /** Accessible name required for the interactive divider button. */
  'aria-label': string;
  orientation?: 'horizontal';
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

/**
 * A semantic separator with optional text and appearance treatments. When an
 * `onClick` callback is supplied, it becomes a full-width labeled button for
 * caller-managed expandable content.
 */
export type DividerProps = StaticDividerProps | InteractiveDividerProps;

function hasDividerText(text: React.ReactNode) {
  return text !== undefined && text !== null && text !== false;
}

function getTextSeparatorLabel(text: React.ReactNode) {
  if (typeof text === 'string' || typeof text === 'number') {
    return String(text);
  }

  return undefined;
}

function DividerContent({
  appearance,
  isExpanded = false,
  showIcon,
  text,
}: Pick<DividerSharedProps, 'appearance' | 'showIcon' | 'text'> & { isExpanded?: boolean }) {
  return (
    <>
      <span aria-hidden="true" className={dividerLineVariants({ appearance })} />
      {showIcon && (
        <CaretCircleDownIcon
          aria-hidden="true"
          focusable="false"
          size={16}
          className={twMerge(
            'shrink-0 text-icon-base-muted motion-safe:transition-transform motion-safe:duration-normal motion-safe:ease-in-out motion-reduce:transition-none',
            isExpanded && 'rotate-180',
          )}
        />
      )}
      {hasDividerText(text) && <span className={dividerCaptionClassName}>{text}</span>}
      <span aria-hidden="true" className={dividerLineVariants({ appearance })} />
    </>
  );
}

export function Divider(props: DividerProps) {
  const {
    className,
    orientation = 'horizontal',
    appearance = 'subtle',
    text,
    showIcon = false,
    onClick,
    ...elementProps
  } = props;
  const ariaExpanded = 'aria-expanded' in elementProps ? elementProps['aria-expanded'] : undefined;
  const isExpanded = ariaExpanded === true || ariaExpanded === 'true';

  if (onClick) {
    const ariaLabel = props['aria-label'];
    if (typeof ariaLabel !== 'string' || !ariaLabel.trim()) {
      throw new Error('Divider with onClick requires a non-empty aria-label.');
    }

    return (
      <button
        {...elementProps}
        type="button"
        onClick={onClick}
        className={twMerge(dividerActionClassName, className)}
      >
        <DividerContent
          appearance={appearance}
          isExpanded={isExpanded}
          showIcon={showIcon}
          text={text}
        />
      </button>
    );
  }

  if (orientation === 'horizontal' && (hasDividerText(text) || showIcon)) {
    const ariaProps = Object.fromEntries(
      Object.entries(elementProps).filter(
        ([name]) => name.startsWith('aria-') && name !== 'aria-orientation',
      ),
    ) as AriaSeparatorProps;
    const wrapperProps = Object.fromEntries(
      Object.entries(elementProps).filter(([name]) => !name.startsWith('aria-')),
    );

    return (
      <div {...wrapperProps} className={twMerge('flex w-full items-center gap-1.5', className)}>
        <AriaSeparator
          {...ariaProps}
          aria-label={elementProps['aria-label'] ?? getTextSeparatorLabel(text)}
          aria-labelledby={elementProps['aria-labelledby']}
          orientation="horizontal"
          elementType="div"
          className="sr-only"
        />
        <DividerContent appearance={appearance} showIcon={showIcon} text={text} />
      </div>
    );
  }

  return (
    <AriaSeparator
      {...elementProps}
      orientation={orientation}
      elementType={orientation === 'horizontal' ? 'div' : undefined}
      className={twMerge(
        dividerVariants({ orientation }),
        dividerColorVariants({ appearance }),
        className,
      )}
    />
  );
}
