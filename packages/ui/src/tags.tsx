'use client';

import * as React from 'react';
import {
  Button as AriaButton,
  Label,
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagList as AriaTagList,
  type TagGroupProps as AriaTagGroupProps,
  type TagListProps as AriaTagListProps,
  type TagListRenderProps,
  type TagProps as AriaTagProps,
  type TagRenderProps,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { StaticFieldMessage } from './field-shared';
import { getTextFromReactNode, normalizeAccessibleText, warnDev } from './a11y';

const tagGroupRootVariants = cva('flex w-full flex-col gap-[6px] font-sans antialiased');

const TagGroupDisabledContext = React.createContext(false);

const labelVariants = cva('type-body-sm-regular', {
  variants: {
    isDisabled: {
      true: 'text-disabled',
      false: 'text-base',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const tagListVariants = cva(
  'flex flex-wrap gap-[8px] rounded-[10px] outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-bg-surface-base',
);

const emptyStateVariants = cva(
  'rounded-[12px] border border-dashed border-base-subtle px-[12px] py-[10px] type-body-sm-regular text-base-subtle',
);

const tagVariants = cva(
  'group inline-flex max-w-full items-center gap-[6px] rounded-full border border-transparent px-[10px] py-[6px] type-body-sm-medium antialiased outline-none transition-colors data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-bg-surface-base',
  {
    variants: {
      isSelected: {
        true: 'bg-button-primary-subtle text-primary-muted',
        false: 'bg-button-secondary-subtle text-base',
      },
      isDisabled: {
        true: 'bg-button-disabled text-disabled',
        false: '',
      },
      isLink: {
        true: 'cursor-pointer text-links',
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
          'hover:bg-button-secondary-subtle-hover active:bg-button-secondary-subtle-pressed',
      },
      {
        isSelected: true,
        isDisabled: false,
        isLink: false,
        className: 'hover:bg-button-primary-subtle-hover active:bg-button-primary-subtle-pressed',
      },
      {
        isSelected: false,
        isDisabled: false,
        isLink: true,
        className:
          'bg-button-primary-subtle hover:bg-button-primary-subtle-hover hover:text-links-hover active:bg-button-primary-subtle-pressed active:text-links-hover',
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
  },
);

const tagTextVariants = cva('min-w-0 truncate');

const selectionIconVariants = cva('flex h-[14px] w-[14px] shrink-0 items-center justify-center');

const removeButtonVariants = cva(
  'flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-0',
  {
    variants: {
      isDisabled: {
        true: 'cursor-not-allowed text-disabled',
        false: 'text-current hover:bg-ash-alpha-200 active:bg-ash-alpha-300',
      },
    },
    defaultVariants: {
      isDisabled: false,
    },
  },
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

export interface TagGroupProps<T extends object> extends Omit<
  AriaTagGroupProps,
  'children' | 'className' | 'style'
> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  isDisabled?: boolean;
  items?: Iterable<T>;
  children?: React.ReactNode | ((item: T) => React.ReactNode);
  renderEmptyState?: (props: TagListRenderProps) => React.ReactNode;
  className?: string;
  listClassName?: string;
}

export interface TagProps extends Omit<AriaTagProps, 'children' | 'className' | 'style'> {
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
  isDisabled = false,
  className,
  listClassName,
  ...props
}: TagGroupProps<T>) {
  const setRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) {
        return;
      }

      if (isDisabled) {
        node.setAttribute('aria-disabled', 'true');
      } else {
        node.removeAttribute('aria-disabled');
      }
    },
    [isDisabled],
  );

  return (
    <TagGroupDisabledContext.Provider value={isDisabled}>
      <AriaTagGroup
        {...props}
        ref={setRootRef}
        data-disabled={isDisabled || undefined}
        className={twMerge(tagGroupRootVariants(), className)}
      >
        {label ? <Label className={labelVariants({ isDisabled })}>{label}</Label> : null}
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
        <StaticFieldMessage description={description} errorMessage={errorMessage} />
      </AriaTagGroup>
    </TagGroupDisabledContext.Provider>
  );
}

function getTagText(children: TagProps['children'], textValue: string | undefined) {
  const normalizedTextValue = normalizeAccessibleText(textValue);

  if (normalizedTextValue) {
    return normalizedTextValue;
  }

  if (typeof children === 'function') {
    return undefined;
  }

  return getTextFromReactNode(children);
}

function getPrimitiveTagIdText(id: TagProps['id']) {
  return typeof id === 'string' || typeof id === 'number'
    ? normalizeAccessibleText(String(id))
    : undefined;
}

export function Tag({
  children,
  className,
  href,
  id,
  isDisabled,
  removeButtonLabel,
  textValue,
  ...props
}: TagProps) {
  const isGroupDisabled = React.useContext(TagGroupDisabledContext);
  const isTagDisabled = isGroupDisabled || isDisabled;
  const tagText = getTagText(children, textValue);
  const fallbackTagText = tagText ?? getPrimitiveTagIdText(id);
  const customRemoveButtonLabel =
    typeof removeButtonLabel === 'function' ? removeButtonLabel(tagText) : removeButtonLabel;
  const normalizedCustomRemoveButtonLabel = normalizeAccessibleText(customRemoveButtonLabel);
  const resolvedRemoveButtonLabel =
    normalizedCustomRemoveButtonLabel ??
    (fallbackTagText ? `Remove ${fallbackTagText}` : 'Remove tag');
  const usesGenericRemoveButtonLabel = !normalizedCustomRemoveButtonLabel && !fallbackTagText;

  warnDev(
    customRemoveButtonLabel == null || Boolean(normalizedCustomRemoveButtonLabel),
    'Veli UI: Tag removeButtonLabel must resolve to a non-empty string.',
  );

  return (
    <AriaTag
      {...props}
      id={id}
      href={href}
      textValue={tagText}
      isDisabled={isTagDisabled}
      className={(state) =>
        twMerge(
          tagVariants({
            isSelected: state.isSelected,
            isDisabled: state.isDisabled,
            isLink: href != null,
            allowsRemoving: state.allowsRemoving,
          }),
          className,
        )
      }
    >
      {(state) => {
        const content = typeof children === 'function' ? children(state) : children;
        if (state.allowsRemoving) {
          warnDev(
            !usesGenericRemoveButtonLabel,
            'Veli UI: removable Tag with complex content needs textValue or removeButtonLabel for a useful remove button label.',
          );
        }

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
