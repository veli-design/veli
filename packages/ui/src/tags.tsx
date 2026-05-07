import * as React from 'react';
import {
  Button as AriaButton,
  Label,
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagList as AriaTagList,
  Text,
  type TagGroupProps as AriaTagGroupProps,
  type TagListProps as AriaTagListProps,
  type TagListRenderProps,
  type TagProps as AriaTagProps,
  type TagRenderProps,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const tagGroupRootVariants = cva('flex w-full flex-col gap-[6px] font-sans antialiased');

const labelVariants = cva('text-[14px] leading-[20px]', {
  variants: {
    isDisabled: {
      true: 'text-fg-text-disabled-disabled',
      false: 'text-fg-text-default-default',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const tagListVariants = cva(
  'flex flex-wrap gap-[8px] rounded-[10px] outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-fg-border-focus data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-bg-surface-surface-bg'
);

const messageVariants = cva('type-caption-12-regular', {
  variants: {
    tone: {
      subtle: 'text-fg-text-default-subtle',
      danger: 'text-fg-text-danger-muted',
    },
  },
  defaultVariants: {
    tone: 'subtle',
  },
});

const emptyStateVariants = cva(
  'rounded-[12px] border border-dashed border-fg-border-default-subtle px-[12px] py-[10px] text-[14px] leading-[20px] text-fg-text-default-subtle'
);

const tagVariants = cva(
  'group inline-flex max-w-full items-center gap-[6px] rounded-full border border-transparent px-[10px] py-[6px] text-[14px] leading-[20px] font-medium antialiased outline-none transition-colors data-[focus-visible]:ring-2 data-[focus-visible]:ring-fg-border-focus data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-bg-surface-surface-bg',
  {
    variants: {
      isSelected: {
        true: 'bg-bg-button-primary-subtle-default text-fg-text-primary-muted',
        false: 'bg-bg-button-secondary-subtle-default text-fg-text-default-default',
      },
      isDisabled: {
        true: 'bg-bg-button-disabled-disabled text-fg-text-disabled-disabled',
        false: '',
      },
      isLink: {
        true: 'cursor-pointer text-fg-text-links-default',
        false: 'cursor-default',
      },
      allowsRemoving: {
        true: 'pr-[6px]',
        false: '',
      },
    },
    compoundVariants: [
      {
        isSelected: false,
        isDisabled: false,
        isLink: false,
        className:
          'hover:bg-bg-button-secondary-subtle-hover active:bg-bg-button-secondary-subtle-pressed',
      },
      {
        isSelected: true,
        isDisabled: false,
        isLink: false,
        className:
          'hover:bg-bg-button-primary-subtle-hover active:bg-bg-button-primary-subtle-pressed',
      },
      {
        isSelected: false,
        isDisabled: false,
        isLink: true,
        className:
          'bg-bg-button-primary-subtle-default hover:bg-bg-button-primary-subtle-hover hover:text-fg-text-links-hover active:bg-bg-button-primary-subtle-pressed active:text-fg-text-links-hover',
      },
      {
        isDisabled: true,
        isLink: true,
        className: 'cursor-not-allowed',
      },
    ],
    defaultVariants: {
      isSelected: false,
      isDisabled: false,
      isLink: false,
      allowsRemoving: false,
    },
  }
);

const tagTextVariants = cva('min-w-0 truncate');

const selectionIconVariants = cva('flex h-[14px] w-[14px] shrink-0 items-center justify-center');

const removeButtonVariants = cva(
  'flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-fg-border-focus focus-visible:ring-offset-0',
  {
    variants: {
      isDisabled: {
        true: 'cursor-not-allowed text-fg-text-disabled-disabled',
        false:
          'text-current hover:bg-gray-alpha-200 active:bg-gray-alpha-300',
      },
    },
    defaultVariants: {
      isDisabled: false,
    },
  }
);

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-[14px] w-[14px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 8.25 6.5 11l6-6.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-[12px] w-[12px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4 12 12" />
      <path d="M12 4 4 12" />
    </svg>
  );
}

export interface TagGroupProps<T extends object>
  extends Omit<AriaTagGroupProps, 'children' | 'className' | 'style'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  items?: Iterable<T>;
  children?: React.ReactNode | ((item: T) => React.ReactNode);
  renderEmptyState?: (props: TagListRenderProps) => React.ReactNode;
  className?: string;
  listClassName?: string;
}

export interface TagProps
  extends Omit<AriaTagProps, 'children' | 'className' | 'style'> {
  children?: React.ReactNode | ((state: TagRenderProps) => React.ReactNode);
  className?: string;
  removeButtonLabel?: string | ((tagText: string | undefined) => string);
}

export function TagGroup<T extends object>({
  label,
  description,
  errorMessage,
  items,
  children,
  renderEmptyState,
  className,
  listClassName,
  ...props
}: TagGroupProps<T>) {
  return (
    <AriaTagGroup {...props} className={twMerge(tagGroupRootVariants(), className)}>
      {label ? <Label className={labelVariants({ isDisabled: false })}>{label}</Label> : null}
      <AriaTagList
        items={items}
        renderEmptyState={
          renderEmptyState
            ? renderEmptyState
            : () => <div className={emptyStateVariants()}>No tags available.</div>
        }
        className={twMerge(tagListVariants(), listClassName)}
      >
        {children as AriaTagListProps<T>['children']}
      </AriaTagList>
      {description ? (
        <Text slot="description" className={messageVariants({ tone: 'subtle' })}>
          {description}
        </Text>
      ) : null}
      {errorMessage ? (
        <Text slot="errorMessage" className={messageVariants({ tone: 'danger' })}>
          {errorMessage}
        </Text>
      ) : null}
    </AriaTagGroup>
  );
}

function getTagText(
  children: TagProps['children'],
  textValue: string | undefined
) {
  if (textValue) {
    return textValue;
  }

  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }

  return undefined;
}

export function Tag({
  children,
  className,
  href,
  removeButtonLabel,
  textValue,
  ...props
}: TagProps) {
  const tagText = getTagText(children, textValue);
  const resolvedRemoveButtonLabel =
    typeof removeButtonLabel === 'function'
      ? removeButtonLabel(tagText)
      : removeButtonLabel ?? (tagText ? `Remove ${tagText}` : 'Remove tag');

  return (
    <AriaTag
      {...props}
      href={href}
      textValue={textValue}
      className={(state) =>
        twMerge(
          tagVariants({
            isSelected: state.isSelected,
            isDisabled: state.isDisabled,
            isLink: href != null,
            allowsRemoving: state.allowsRemoving,
          }),
          className
        )
      }
    >
      {(state) => {
        const content = typeof children === 'function' ? children(state) : children;

        return (
          <>
            {state.isSelected ? (
              <span className={selectionIconVariants()}>
                <CheckIcon />
              </span>
            ) : null}
            <span className={tagTextVariants()}>{content}</span>
            {state.allowsRemoving ? (
              <AriaButton
                slot="remove"
                aria-label={resolvedRemoveButtonLabel}
                className={removeButtonVariants({ isDisabled: state.isDisabled })}
              >
                <CloseIcon />
              </AriaButton>
            ) : null}
          </>
        );
      }}
    </AriaTag>
  );
}
