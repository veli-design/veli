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
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { StaticFieldMessage } from './field-shared';
import { fieldHeaderLabelVariants, fieldRootVariants } from './field-shared-variants';
import { getTextFromReactNode, normalizeAccessibleText, warnDev } from './a11y';
import { useVeliLanguage } from './provider';

const TagGroupDisabledContext = React.createContext(false);
const TagGroupSizeContext = React.createContext<TagSize | undefined>(undefined);

export type TagSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const localizedTagText = {
  en: {
    noTagsAvailable: 'No tags available.',
    removeTag: 'Remove {tag}',
    removeGenericTag: 'Remove tag',
  },
  dv: {
    noTagsAvailable: 'އެއްވެސް ޓެގެއް ލިބޭކަށް ނެތް.',
    removeTag: '{tag} އުނިކުރޭ',
    removeGenericTag: 'ޓެގް އުނިކުރޭ',
  },
} as const;

const tagListVariants = cva(
  'flex flex-wrap gap-2 rounded-lg outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-bg-surface-base',
);

const emptyStateVariants = cva(
  'rounded-xl border border-dashed border-border-default-subtle px-3 py-2.5 type-body-sm-regular text-text-default-subtle',
);

const tagVariants = cva(
  'group inline-flex max-w-full items-center rounded-full border border-transparent antialiased outline-none transition-colors data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-bg-surface-base',
  {
    variants: {
      size: {
        xs: 'h-7 gap-1 px-2 type-caption-medium',
        sm: 'h-8 gap-1 px-2 type-caption-medium',
        md: 'h-9 gap-1.5 px-2.5 type-body-sm-medium',
        lg: 'h-10 gap-1.5 px-3 type-body-sm-medium',
        xl: 'h-11 gap-2 px-3 type-body-md-medium',
      },
      isSelected: {
        true: 'bg-button-primary-subtle-default text-text-primary-muted',
        false: 'bg-button-secondary-subtle-default text-text-default-default',
      },
      isDisabled: {
        true: 'bg-button-disabled-disabled text-text-disabled-disabled',
        false: '',
      },
      isLink: {
        true: 'cursor-pointer text-text-links-default',
        false: 'cursor-default',
      },
      allowsRemoving: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { size: 'xs', allowsRemoving: true, className: 'pe-1' },
      { size: 'sm', allowsRemoving: true, className: 'pe-1' },
      { size: 'md', allowsRemoving: true, className: 'pe-1.5' },
      { size: 'lg', allowsRemoving: true, className: 'pe-2' },
      { size: 'xl', allowsRemoving: true, className: 'pe-2' },
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
          'bg-button-primary-subtle-default hover:bg-button-primary-subtle-hover hover:text-text-links-hover active:bg-button-primary-subtle-pressed active:text-text-links-hover',
      },
      {
        isDisabled: true,
        isLink: true,
        className: 'cursor-not-allowed',
      },
    ],
    defaultVariants: {
      size: 'sm',
      isSelected: false,
      isDisabled: false,
      isLink: false,
      allowsRemoving: false,
    },
  },
);

const tagTextVariants = cva('min-w-0 truncate');

const tagLeadingVariants = cva(
  'inline-flex shrink-0 items-center justify-center leading-none [&_svg]:shrink-0',
  {
    variants: {
      size: {
        xs: '[&_svg]:size-2.5',
        sm: '[&_svg]:size-3',
        md: '[&_svg]:size-3.5',
        lg: '[&_svg]:size-4',
        xl: '[&_svg]:size-4',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
);

const selectionIconVariants = cva('flex shrink-0 items-center justify-center', {
  variants: {
    size: {
      xs: 'size-2.5 [&_svg]:size-2.5',
      sm: 'size-3 [&_svg]:size-3',
      md: 'size-3.5 [&_svg]:size-3.5',
      lg: 'size-4 [&_svg]:size-4',
      xl: 'size-4 [&_svg]:size-4',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

const removeButtonVariants = cva(
  'flex shrink-0 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-0',
  {
    variants: {
      size: {
        xs: 'size-3.5 [&_svg]:size-2',
        sm: 'size-4 [&_svg]:size-2.5',
        md: 'size-5 [&_svg]:size-3',
        lg: 'size-5 [&_svg]:size-3',
        xl: 'size-6 [&_svg]:size-3.5',
      },
      isDisabled: {
        true: 'cursor-not-allowed text-text-disabled-disabled',
        false: 'text-current hover:bg-gray-alpha-200 active:bg-gray-alpha-300',
      },
    },
    defaultVariants: {
      size: 'sm',
      isDisabled: false,
    },
  },
);

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={className}
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

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={className}
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
  size?: TagSize;
  items?: Iterable<T>;
  children?: React.ReactNode | ((item: T) => React.ReactNode);
  renderEmptyState?: (props: TagListRenderProps) => React.ReactNode;
  className?: string;
  listClassName?: string;
}

export interface TagProps
  extends
    Omit<AriaTagProps, 'children' | 'className' | 'style'>,
    Pick<VariantProps<typeof tagVariants>, 'size'> {
  children?: React.ReactNode | ((state: TagRenderProps) => React.ReactNode);
  className?: string;
  leading?: React.ReactNode;
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
  size,
  className,
  listClassName,
  ...props
}: TagGroupProps<T>) {
  const languageConfig = useVeliLanguage();
  const text = localizedTagText[languageConfig.language];
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
      <TagGroupSizeContext.Provider value={size}>
        <AriaTagGroup
          {...props}
          ref={setRootRef}
          data-disabled={isDisabled || undefined}
          className={twMerge(fieldRootVariants(), className)}
        >
          {label ? (
            <Label className={fieldHeaderLabelVariants({ isDisabled })}>{label}</Label>
          ) : null}
          <AriaTagList
            items={items}
            renderEmptyState={
              renderEmptyState
                ? renderEmptyState
                : () => <div className={emptyStateVariants()}>{text.noTagsAvailable}</div>
            }
            className={twMerge(tagListVariants(), listClassName)}
          >
            {children as AriaTagListProps<T>['children']}
          </AriaTagList>
          <StaticFieldMessage description={description} errorMessage={errorMessage} />
        </AriaTagGroup>
      </TagGroupSizeContext.Provider>
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

function formatRemoveTagText(template: string, tag: string) {
  return template.split('{tag}').join(tag);
}

export function Tag({
  children,
  className,
  href,
  id,
  isDisabled,
  leading,
  removeButtonLabel,
  size: sizeProp,
  textValue,
  ...props
}: TagProps) {
  const languageConfig = useVeliLanguage();
  const text = localizedTagText[languageConfig.language];
  const isGroupDisabled = React.useContext(TagGroupDisabledContext);
  const groupSize = React.useContext(TagGroupSizeContext);
  const size = sizeProp ?? groupSize ?? 'sm';
  const isTagDisabled = isGroupDisabled || isDisabled;
  const tagText = getTagText(children, textValue);
  const fallbackTagText = tagText ?? getPrimitiveTagIdText(id);
  const customRemoveButtonLabel =
    typeof removeButtonLabel === 'function' ? removeButtonLabel(tagText) : removeButtonLabel;
  const normalizedCustomRemoveButtonLabel = normalizeAccessibleText(customRemoveButtonLabel);
  const resolvedRemoveButtonLabel =
    normalizedCustomRemoveButtonLabel ??
    (fallbackTagText
      ? formatRemoveTagText(text.removeTag, fallbackTagText)
      : text.removeGenericTag);
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
            size,
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
              <span className={selectionIconVariants({ size })}>
                <CheckIcon />
              </span>
            ) : null}
            {leading ? (
              <span aria-hidden="true" className={tagLeadingVariants({ size })}>
                {leading}
              </span>
            ) : null}
            <span className={tagTextVariants()}>{content}</span>
            {state.allowsRemoving ? (
              <AriaButton
                slot="remove"
                aria-label={resolvedRemoveButtonLabel}
                className={removeButtonVariants({ size, isDisabled: state.isDisabled })}
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
