'use client';

import * as React from 'react';
import {
  Button as AriaButton,
  Label,
  ListStateContext,
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
import { StaticFieldMessage } from './field-shared.js';
import {
  fieldHeaderLabelVariants,
  fieldRootVariants,
  hasRenderableMessage,
} from './field-shared-variants.js';
import { getTextFromReactNode, normalizeAccessibleText, warnDev } from './a11y.js';
import { useVeliLanguage } from './provider.js';

const TagGroupDisabledContext = React.createContext(false);
const TagGroupSizeContext = React.createContext<TagSize | undefined>(undefined);

type TagListState = React.ContextType<typeof ListStateContext>;

function TagRemovalState({ stateRef }: { stateRef: React.RefObject<TagListState> }) {
  const state = React.useContext(ListStateContext);

  React.useLayoutEffect(() => {
    if (!state) {
      return;
    }
    stateRef.current = state;
    return () => {
      stateRef.current = null;
    };
  }, [state, stateRef]);

  return null;
}

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
  'flex min-w-0 flex-wrap gap-2 rounded-lg outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-bg-surface-base forced-colors:data-[focus-visible]:outline-solid forced-colors:data-[focus-visible]:outline-2 forced-colors:data-[focus-visible]:outline-offset-2',
);

const emptyStateVariants = cva(
  'min-w-0 rounded-xl border border-dashed border-base-subtle px-3 py-2.5 type-body-sm-regular text-base-subtle [overflow-wrap:anywhere]',
);

const tagVariants = cva(
  'group inline-flex min-w-0 max-w-full items-center rounded-full border border-transparent antialiased outline-none transition-colors duration-normal ease-out motion-reduce:transition-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-bg-surface-base forced-colors:data-[focus-visible]:outline-solid forced-colors:data-[focus-visible]:outline-2 forced-colors:data-[focus-visible]:outline-offset-2',
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
        true: 'bg-button-primary-subtle-default text-primary-muted',
        false: 'bg-button-secondary-subtle-default text-base-default',
      },
      isDisabled: {
        true: 'bg-button-disabled text-disabled',
        false: '',
      },
      isLink: {
        true: 'cursor-pointer',
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
          'bg-button-primary-subtle-default text-links hover:bg-button-primary-subtle-hover hover:text-links-hover active:bg-button-primary-subtle-pressed active:text-links-hover',
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
  'flex shrink-0 items-center justify-center rounded-full outline-none transition-colors duration-normal ease-out motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-0 forced-colors:focus-visible:outline-solid forced-colors:focus-visible:outline-2',
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
        true: 'cursor-not-allowed text-disabled',
        false: 'text-current hover:bg-neutral-alpha-200 active:bg-neutral-alpha-300',
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
  onRemove,
  renderEmptyState,
  isDisabled = false,
  size,
  className,
  listClassName,
  ...props
}: TagGroupProps<T>) {
  const languageConfig = useVeliLanguage();
  const text = localizedTagText[languageConfig.language];
  const removalStateRef = React.useRef<TagListState>(null);
  const handleRemove = React.useCallback<NonNullable<AriaTagGroupProps['onRemove']>>(
    (keys) => {
      const state = removalStateRef.current;
      if (isDisabled || !state || !onRemove) {
        return;
      }

      // React Aria includes disabled selected keys in keyboard bulk removal.
      // Read its collection directly to retain numeric/string Key identity and
      // cover both disabledKeys and individual Tag isDisabled props.
      const removableKeys = new Set(
        [...keys].filter(
          (key) => !state.disabledKeys.has(key) && !state.collection.getItem(key)?.props.isDisabled,
        ),
      );
      if (removableKeys.size > 0) {
        onRemove(removableKeys);
      }
    },
    [isDisabled, onRemove],
  );
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
          onRemove={onRemove ? handleRemove : undefined}
          ref={setRootRef}
          data-disabled={isDisabled || undefined}
          className={twMerge(
            fieldRootVariants(),
            'min-w-0 [&>[slot=description]]:[overflow-wrap:anywhere] [&>[slot=errorMessage]]:[overflow-wrap:anywhere]',
            className,
          )}
        >
          <TagRemovalState stateRef={removalStateRef} />
          {hasRenderableMessage(label) ? (
            <Label
              className={twMerge(
                fieldHeaderLabelVariants({ isDisabled }),
                'min-w-0 [overflow-wrap:anywhere]',
              )}
            >
              {label}
            </Label>
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
                // React Aria's default references the tag as well as the button.
                // Our localized label already contains the tag text.
                aria-labelledby=""
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
