'use client';

import * as React from 'react';
import {
  Button as AriaButton,
  ButtonContext,
  LinkContext,
  useSlottedContext,
  useContextProps,
  type ButtonProps as AriaButtonProps,
  type LinkProps as AriaLinkProps,
  type LinkRenderProps,
  Label,
  ListStateContext,
  TagGroupContext,
  RootMenuTriggerStateContext,
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagList as AriaTagList,
  type TagGroupProps as AriaTagGroupProps,
  type TagListProps as AriaTagListProps,
  type TagListRenderProps,
  type TagProps as AriaTagProps,
  type TagRenderProps,
  type Selection,
} from 'react-aria-components';
import { NavigationAnchor } from './navigation-anchor.js';
import { CheckIcon, XIcon, CaretDownIcon } from '@phosphor-icons/react';
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
import { Menu, MenuPopover, MenuTrigger, type MenuProps, type MenuTriggerProps } from './menu.js';

const TagGroupDisabledContext = React.createContext(false);
const TagGroupSizeContext = React.createContext<TagSize | undefined>(undefined);
const TagGroupAppearanceContext = React.createContext<TagAppearance>('fill');

type TagListState = React.ContextType<typeof ListStateContext>;

type TagKey = NonNullable<AriaTagProps['id']>;

type TagSelectionSnapshot = {
  linkKeys: Set<TagKey>;
  selectAllKeys: Set<TagKey>;
};

function getTagSelectionSnapshot(state: NonNullable<TagListState>): TagSelectionSnapshot {
  const linkKeys: TagSelectionSnapshot['linkKeys'] = new Set();
  const selectAllKeys: TagSelectionSnapshot['selectAllKeys'] = new Set();
  for (const item of state.collection) {
    if (item.props.href != null) linkKeys.add(item.key);
    else if (state.selectionManager.canSelectItem(item.key)) selectAllKeys.add(item.key);
  }
  return { linkKeys, selectAllKeys };
}

function normalizeTagSelection(selection: Selection, snapshot: TagSelectionSnapshot): Selection {
  if (!snapshot.linkKeys.size) return selection;
  if (selection === 'all') return snapshot.selectAllKeys;
  if (![...selection].some((key) => snapshot.linkKeys.has(key))) return selection;
  // RAC's Selection subclass carries range anchors. Clone it without losing those boundaries.
  const Constructor = selection.constructor as new (keys: Iterable<TagKey>) => Set<TagKey>;
  const result = new Constructor(selection);
  for (const key of snapshot.linkKeys) result.delete(key);
  return result;
}

function materializeTagSelection(keys: 'all' | Iterable<TagKey> | undefined): Selection {
  if (keys === 'all') return 'all';
  return keys instanceof Set ? keys : new Set(keys);
}

function TagCollectionState({
  stateRef,
  onSnapshot,
}: {
  stateRef: React.RefObject<TagListState>;
  onSnapshot: (snapshot: TagSelectionSnapshot) => void;
}) {
  const state = React.useContext(ListStateContext);
  React.useLayoutEffect(() => {
    if (!state) return;
    stateRef.current = state;
    onSnapshot(getTagSelectionSnapshot(state));
    return () => {
      stateRef.current = null;
    };
  }, [state, stateRef, onSnapshot]);
  return null;
}

function TagMenuState({
  stateRef,
}: {
  stateRef: React.RefObject<React.ContextType<typeof RootMenuTriggerStateContext>>;
}) {
  const state = React.useContext(RootMenuTriggerStateContext);
  React.useLayoutEffect(() => {
    stateRef.current = state;
    return () => {
      stateRef.current = null;
    };
  }, [state, stateRef]);
  return null;
}

// Animate measured collection changes without retaining removed interactive rows.
function useTagLayoutMotion(ref: React.RefObject<HTMLDivElement | null>) {
  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    type Layout = { left: number; top: number; width: number; height: number };
    let previous = new Map<HTMLElement, Layout>();
    let initialized = false;
    const animations = new Set<Animation>();
    const ghosts = new Set<HTMLElement>();
    const measure = (animateChanges = true) => {
      const next = new Map(
        Array.from(root.querySelectorAll<HTMLElement>('[role="row"]')).map((node) => [
          node,
          {
            left: node.offsetLeft,
            top: node.offsetTop,
            width: node.offsetWidth,
            height: node.offsetHeight,
          },
        ]),
      );
      const styles = getComputedStyle(root);
      const duration = Number.parseFloat(styles.getPropertyValue('--veli-duration-normal'));
      const easing = styles.getPropertyValue('--veli-ease-in-out').trim();
      if (animateChanges && initialized && !reduced.matches && duration && easing) {
        const animate = (node: HTMLElement, frames: Keyframe[], exit = false) => {
          for (const current of animations) {
            if (current.effect instanceof KeyframeEffect && current.effect.target === node)
              current.cancel();
          }
          const animation = node.animate(frames, { duration, easing });
          animations.add(animation);
          const finish = () => {
            animations.delete(animation);
            if (exit) {
              node.remove();
              ghosts.delete(node);
            }
          };
          animation.onfinish = finish;
          animation.oncancel = finish;
        };
        next.forEach((rect, node) => {
          const before = previous.get(node);
          if (!before) {
            animate(node, [
              { opacity: 0, scale: '0.6' },
              { opacity: 1, scale: '1' },
            ]);
          } else if (before && (rect.left !== before.left || rect.top !== before.top)) {
            animate(node, [
              { translate: `${before.left - rect.left}px ${before.top - rect.top}px` },
              { translate: '0px 0px' },
            ]);
          }
        });
        previous.forEach((rect, node) => {
          if (next.has(node)) return;
          const ghost = node.cloneNode(true) as HTMLElement;
          ghost.dataset.tagGhost = '';
          ghost.inert = true;
          ghost.setAttribute('aria-hidden', 'true');
          ghost.removeAttribute('role');
          for (const element of [ghost, ...ghost.querySelectorAll('[id]')])
            element.removeAttribute('id');
          Object.assign(ghost.style, {
            position: 'absolute',
            margin: '0',
            pointerEvents: 'none',
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
          });
          ghosts.add(ghost);
          root.appendChild(ghost);
          animate(
            ghost,
            [
              { opacity: 1, scale: '1' },
              { opacity: 0, scale: '0.6' },
            ],
            true,
          );
        });
      }
      for (const node of previous.keys()) if (!next.has(node)) resizeObserver.unobserve(node);
      for (const node of next.keys()) if (!previous.has(node)) resizeObserver.observe(node);
      previous = next;
      initialized = true;
    };
    const resizeObserver = new ResizeObserver(() => measure(false));
    resizeObserver.observe(root);
    measure(false);
    const observer = new MutationObserver((records) => {
      // Our visual exit copies must not trigger another layout pass mid-animation.
      if (
        records.some(
          (record) =>
            !(record.target as Element).closest?.('[data-tag-ghost]') &&
            [...record.addedNodes, ...record.removedNodes].some(
              (node) => !(node instanceof HTMLElement && node.hasAttribute('data-tag-ghost')),
            ),
        )
      )
        measure();
    });
    observer.observe(root, { childList: true, subtree: true });
    const stop = () => {
      for (const animation of animations) animation.cancel();
      for (const ghost of ghosts) ghost.remove();
    };
    reduced.addEventListener('change', stop);
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      reduced.removeEventListener('change', stop);
      stop();
    };
  }, [ref]);
}

export type TagAppearance = 'fill' | 'outline';

export type TagSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const localizedTagText = {
  en: {
    noTagsAvailable: 'No tags available.',
    removeTag: 'Remove {tag}',
    removeGenericTag: 'Remove tag',
    linkDestination: 'Link: {href}',
    chooseSublabels: 'Choose sub-labels for {tag}',
  },
  dv: {
    noTagsAvailable: 'އެއްވެސް ޓެގެއް ލިބޭކަށް ނެތް.',
    removeTag: '{tag} އުނިކުރޭ',
    removeGenericTag: 'ޓެގް އުނިކުރޭ',
    linkDestination: 'ލިންކް: {href}',
    chooseSublabels: '{tag} ގެ އިތުރު ލޭބަލްތައް ޚިޔާރުކުރައްވާ',
  },
} as const;

const tagListVariants = cva(
  'relative flex min-w-0 flex-wrap gap-2 rounded-lg outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-bg-surface-base forced-colors:data-[focus-visible]:outline-solid forced-colors:data-[focus-visible]:outline-2 forced-colors:data-[focus-visible]:outline-offset-2',
);

const emptyStateVariants = cva(
  'min-w-0 rounded-xl border border-dashed border-base-subtle px-3 py-2.5 type-body-sm-regular text-base-default [overflow-wrap:anywhere]',
);

const tagVariants = cva(
  'group relative inline-flex min-w-0 max-w-full shrink-0 items-center rounded-full antialiased outline-none [transition-property:background-color,color,border-color,border-radius,scale] [transition-duration:var(--veli-duration-normal),var(--veli-duration-normal),var(--veli-duration-normal),var(--veli-duration-normal),var(--veli-duration-fast)] [transition-timing-function:var(--veli-ease-out),var(--veli-ease-out),var(--veli-ease-out),var(--veli-ease-in-out),var(--veli-ease-out-quad)] data-[pressed]:scale-[1.045] motion-reduce:data-[pressed]:scale-100 motion-reduce:transition-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-tag-focus data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-bg-surface-base forced-colors:data-[focus-visible]:outline-solid forced-colors:data-[focus-visible]:outline-2 forced-colors:data-[focus-visible]:outline-offset-2',
  {
    variants: {
      size: {
        xs: 'h-7 gap-1 px-2.5 type-caption-medium',
        sm: 'h-8 gap-1 px-3 type-caption-medium',
        md: 'h-9 gap-1.5 px-3.5 type-body-sm-medium',
        lg: 'h-10 gap-2 px-4 type-body-sm-medium',
        xl: 'h-11 gap-2.5 px-5 type-body-md-medium',
      },
      appearance: { fill: '', outline: 'border' },
      isSelected: { true: '', false: '' },
      isDisabled: { true: 'cursor-not-allowed', false: '' },
      isLink: { true: 'cursor-pointer no-underline', false: 'cursor-default' },
      allowsRemoving: { true: '', false: '' },
    },
    compoundVariants: [
      { size: 'xs', allowsRemoving: true, className: 'pe-1.5' },
      { size: 'sm', allowsRemoving: true, className: 'pe-1.5' },
      { size: 'md', allowsRemoving: true, className: 'pe-2' },
      { size: 'lg', allowsRemoving: true, className: 'pe-2.5' },
      { size: 'xl', allowsRemoving: true, className: 'pe-3' },
      {
        appearance: 'fill',
        isSelected: false,
        isDisabled: false,
        className:
          'bg-tag-fill-bg text-tag-fill-foreground data-[hovered]:bg-tag-fill-bg-hover data-[pressed]:bg-tag-fill-bg-pressed',
      },
      {
        appearance: 'fill',
        isSelected: true,
        isDisabled: false,
        className:
          'bg-tag-fill-selected-bg text-tag-fill-selected-foreground data-[hovered]:bg-tag-fill-selected-bg-hover data-[pressed]:bg-tag-fill-selected-bg-pressed',
      },
      {
        appearance: 'outline',
        isSelected: false,
        isDisabled: false,
        className:
          'border-tag-outline-border bg-transparent text-tag-outline-foreground data-[hovered]:border-tag-outline-border-hover data-[hovered]:bg-tag-outline-bg-hover data-[pressed]:border-tag-outline-border-hover data-[pressed]:bg-tag-outline-bg-pressed',
      },
      {
        appearance: 'outline',
        isSelected: true,
        isDisabled: false,
        className:
          'border-tag-outline-selected-border bg-tag-outline-selected-bg text-tag-outline-selected-foreground data-[hovered]:bg-tag-outline-selected-bg-hover data-[pressed]:bg-tag-outline-selected-bg-pressed',
      },
      {
        isLink: true,
        isDisabled: false,
        className:
          'text-tag-link-foreground data-[hovered]:text-tag-link-foreground-hover data-[pressed]:text-tag-link-foreground-hover',
      },
      {
        appearance: 'fill',
        isDisabled: true,
        className: 'bg-tag-disabled-bg text-tag-disabled-foreground',
      },
      {
        appearance: 'outline',
        isDisabled: true,
        className: 'border-tag-disabled-border bg-transparent text-tag-disabled-foreground',
      },
      { isDisabled: true, className: 'cursor-not-allowed' },
    ],
    defaultVariants: {
      size: 'sm',
      appearance: 'fill',
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
  'relative flex shrink-0 items-center justify-center rounded-full outline-none transition-colors duration-normal ease-out motion-reduce:transition-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-tag-focus forced-colors:data-[focus-visible]:outline-solid forced-colors:data-[focus-visible]:outline-2 before:absolute before:start-1/2 before:top-1/2 before:min-h-6 before:min-w-6 before:-translate-x-1/2 before:-translate-y-1/2 rtl:before:translate-x-1/2',
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
        true: 'cursor-not-allowed text-tag-disabled-foreground',
        false:
          'cursor-pointer text-current data-[hovered]:bg-tag-remove-hover data-[pressed]:bg-tag-remove-pressed',
      },
      onSelectedFill: {
        true: 'data-[hovered]:bg-tag-fill-selected-remove-hover data-[pressed]:bg-tag-fill-selected-remove-pressed',
        false: '',
      },
    },
    defaultVariants: { size: 'sm', isDisabled: false, onSelectedFill: false },
  },
);

function TagContent({
  children,
  leading,
  size,
  isSelected = false,
}: {
  children: React.ReactNode;
  leading?: React.ReactNode;
  size: TagSize;
  isSelected?: boolean;
}) {
  return (
    <>
      {isSelected ? (
        <span aria-hidden className={selectionIconVariants({ size })}>
          <CheckIcon weight="regular" />
        </span>
      ) : null}
      {leading ? (
        <span aria-hidden className={tagLeadingVariants({ size })}>
          {leading}
        </span>
      ) : null}
      <span className={tagTextVariants()}>{children}</span>
    </>
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
  appearance?: TagAppearance;
  items?: Iterable<T>;
  children?: React.ReactNode | ((item: T) => React.ReactNode);
  renderEmptyState?: (props: TagListRenderProps) => React.ReactNode;
  className?: string;
  listClassName?: string;
}

export interface TagProps
  extends
    Omit<AriaTagProps, 'children' | 'className' | 'style'>,
    Pick<VariantProps<typeof tagVariants>, 'size' | 'appearance'> {
  children?: React.ReactNode | ((state: TagRenderProps) => React.ReactNode);
  className?: string;
  leading?: React.ReactNode;
  removeButtonLabel?: string | ((tagText: string | undefined) => string);
}

export function TagGroup<T extends object>(inputProps: TagGroupProps<T>) {
  const [resolvedProps, contextRef] = useContextProps(
    inputProps as TagGroupProps<T> & AriaTagGroupProps,
    undefined,
    TagGroupContext,
  );
  const {
    label,
    description,
    errorMessage,
    items,
    children,
    onRemove,
    selectedKeys,
    defaultSelectedKeys,
    onSelectionChange,
    renderEmptyState,
    isDisabled = false,
    size,
    appearance = 'fill',
    className,
    listClassName,
    render,
    slot,
    ...props
  } = resolvedProps;
  const languageConfig = useVeliLanguage();
  const text = localizedTagText[languageConfig.language];
  const removalStateRef = React.useRef<TagListState>(null);
  const [snapshot, setSnapshot] = React.useState<TagSelectionSnapshot>(() => ({
    linkKeys: new Set(),
    selectAllKeys: new Set(),
  }));
  const [uncontrolledSelection, setUncontrolledSelection] = React.useState<Selection>(() => {
    const initial = materializeTagSelection(defaultSelectedKeys);
    return initial === 'all' ? initial : new Set(initial);
  });
  const controlledSelection = React.useMemo(
    () => materializeTagSelection(selectedKeys),
    [selectedKeys],
  );
  const isSelectionControlled = selectedKeys !== undefined;
  const receiveSnapshot = React.useCallback(
    (next: TagSelectionSnapshot) => {
      const equal = (a: Set<TagKey>, b: Set<TagKey>) =>
        a.size === b.size && [...a].every((key) => b.has(key));
      setSnapshot((previous) =>
        equal(previous.linkKeys, next.linkKeys) && equal(previous.selectAllKeys, next.selectAllKeys)
          ? previous
          : next,
      );
      if (!isSelectionControlled)
        setUncontrolledSelection((previous) =>
          previous === 'all' ? previous : normalizeTagSelection(previous, next),
        );
    },
    [isSelectionControlled],
  );
  const changeSelection = (next: Selection) => {
    const state = removalStateRef.current;
    const normalized = normalizeTagSelection(
      next,
      state ? getTagSelectionSnapshot(state) : snapshot,
    );
    if (!isSelectionControlled) setUncontrolledSelection(next === 'all' ? 'all' : normalized);
    onSelectionChange?.(normalized);
  };
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
          (key) =>
            !state.disabledKeys.has(key) &&
            !state.collection.getItem(key)?.props.isDisabled &&
            state.collection.getItem(key)?.props.href == null,
        ),
      );
      if (removableKeys.size > 0) {
        onRemove(removableKeys);
      }
    },
    [isDisabled, onRemove],
  );
  const listRef = React.useRef<HTMLDivElement>(null);
  useTagLayoutMotion(listRef);
  const setRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      contextRef.current = node;
      if (!node) {
        return;
      }

      if (isDisabled) {
        node.setAttribute('aria-disabled', 'true');
      } else {
        node.removeAttribute('aria-disabled');
      }
    },
    [isDisabled, contextRef],
  );

  return (
    <TagGroupDisabledContext.Provider value={isDisabled}>
      <TagGroupSizeContext.Provider value={size}>
        <TagGroupAppearanceContext.Provider value={appearance}>
          <AriaTagGroup
            {...props}
            slot={null}
            render={(domProps, state) => {
              const rootProps = { ...domProps, slot: slot ?? undefined };
              return render ? render(rootProps, state) : <div {...rootProps} />;
            }}
            selectedKeys={normalizeTagSelection(
              selectedKeys === undefined ? uncontrolledSelection : controlledSelection,
              snapshot,
            )}
            onSelectionChange={changeSelection}
            onRemove={onRemove ? handleRemove : undefined}
            ref={setRootRef}
            data-disabled={isDisabled || undefined}
            className={twMerge(
              fieldRootVariants(),
              'min-w-0 [&>[slot=description]]:[overflow-wrap:anywhere] [&>[slot=errorMessage]]:[overflow-wrap:anywhere]',
              className,
            )}
          >
            <TagCollectionState stateRef={removalStateRef} onSnapshot={receiveSnapshot} />
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
              ref={listRef}
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
        </TagGroupAppearanceContext.Provider>
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
  render,
  size: sizeProp,
  appearance: appearanceProp,
  textValue,
  ...props
}: TagProps) {
  const languageConfig = useVeliLanguage();
  const text = localizedTagText[languageConfig.language];
  const isGroupDisabled = React.useContext(TagGroupDisabledContext);
  const groupSize = React.useContext(TagGroupSizeContext);
  const size = sizeProp ?? groupSize ?? 'sm';
  const groupAppearance = React.useContext(TagGroupAppearanceContext);
  const appearance = appearanceProp ?? groupAppearance;
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
            appearance,
            isSelected: state.isSelected && href == null,
            isDisabled: state.isDisabled,
            isLink: href != null,
            allowsRemoving: state.allowsRemoving && href == null,
          }),
          className,
        )
      }
      render={(domProps, state) => {
        // React Aria omits aria-selected for disabled rows even when they are selected.
        // Keep that state exposed whenever the selected check is visible.
        const description =
          domProps['aria-description'] ??
          (href == null ? undefined : text.linkDestination.replace('{href}', href));
        const rowProps = {
          ...domProps,
          ...(href != null
            ? {
                'aria-selected': undefined,
                'data-selected': undefined,
                'data-allows-removing': undefined,
              }
            : state.isSelected
              ? { 'aria-selected': true as const }
              : {}),
          ...(description != null && { 'aria-description': description }),
        };
        return render ? (
          render(
            rowProps,
            href == null ? state : { ...state, isSelected: false, allowsRemoving: false },
          )
        ) : (
          <div {...rowProps} />
        );
      }}
    >
      {(state) => {
        const content =
          typeof children === 'function'
            ? children(
                href == null ? state : { ...state, isSelected: false, allowsRemoving: false },
              )
            : children;
        if (state.allowsRemoving && href == null) {
          warnDev(
            !usesGenericRemoveButtonLabel,
            'Veli UI: removable Tag with complex content needs textValue or removeButtonLabel for a useful remove button label.',
          );
        }

        return (
          <>
            <TagContent size={size} leading={leading} isSelected={state.isSelected && href == null}>
              {content}
            </TagContent>
            {state.allowsRemoving && href == null ? (
              <AriaButton
                slot="remove"
                // React Aria's default references the tag as well as the button.
                // Our localized label already contains the tag text.
                aria-labelledby=""
                aria-label={resolvedRemoveButtonLabel}
                className={removeButtonVariants({
                  size,
                  isDisabled: state.isDisabled,
                  onSelectedFill: state.isSelected && appearance === 'fill',
                })}
              >
                <XIcon aria-hidden weight="regular" />
              </AriaButton>
            ) : null}
          </>
        );
      }}
    </AriaTag>
  );
}

interface StandaloneTagProps {
  size?: TagSize;
  appearance?: TagAppearance;
  leading?: React.ReactNode;
  className?: string;
}

interface TagActionProps extends Omit<AriaButtonProps, 'className' | 'style'>, StandaloneTagProps {
  as?: 'button';
  href?: never;
  /** Controlled selection for filter buttons. Omit for an ordinary action button. */
  isSelected?: boolean;
  ref?: React.ComponentProps<typeof AriaButton>['ref'];
}

type TagNavigationRender = (
  props: React.ComponentPropsWithRef<'a'>,
  state: LinkRenderProps,
) => React.ReactElement;

type TagNavigationProps = Omit<
  AriaLinkProps,
  'className' | 'style' | 'href' | 'render' | 'onClick' | 'onPressUp' | 'onPressChange'
> &
  StandaloneTagProps & {
    as: 'a';
    href?: string;
    isSelected?: never;
    'aria-pressed'?: never;
    ref?: React.Ref<HTMLAnchorElement>;
    render?: TagNavigationRender;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    'aria-current'?: React.AriaAttributes['aria-current'];
  } & ({ href: string } | { render: TagNavigationRender });

export type TagButtonProps<Element extends 'button' | 'a' = 'button'> = Element extends 'a'
  ? TagNavigationProps
  : TagActionProps;

function TagAction({
  as: elementType = 'button',
  size = 'sm',
  appearance = 'fill',
  leading,
  className,
  isSelected,
  children,
  render,
  ...props
}: TagActionProps) {
  const context = useSlottedContext(ButtonContext, props.slot);
  const resolvedRender = render ?? context?.render;
  return (
    <AriaButton
      {...props}
      aria-pressed={isSelected ?? props['aria-pressed']}
      render={resolvedRender ?? ((domProps) => React.createElement(elementType, domProps))}
      className={(state) =>
        twMerge(
          tagVariants({ size, appearance, isSelected, isDisabled: state.isDisabled }),
          className,
        )
      }
    >
      {(state) => (
        <TagContent size={size} leading={leading} isSelected={isSelected}>
          {typeof children === 'function' ? children(state) : children}
        </TagContent>
      )}
    </AriaButton>
  );
}

function TagNavigation({ ref: forwardedRef, ...inputProps }: TagNavigationProps) {
  const context = useSlottedContext(LinkContext, inputProps.slot);
  const [mergedProps, ref] = useContextProps(inputProps, forwardedRef, LinkContext);
  const {
    as: _elementType,
    size = 'sm',
    appearance = 'fill',
    leading,
    className,
    children,
    render,
    isDisabled = false,
    onClick,
    ...props
  } = mergedProps;
  void _elementType;
  const resolvedRender = render ?? (context?.render as TagNavigationRender | undefined);
  return (
    <NavigationAnchor
      {...props}
      ref={ref}
      isDisabled={isDisabled}
      onClick={onClick}
      render={resolvedRender}
      style={context?.style}
      className={(state) =>
        twMerge(
          typeof context?.className === 'function'
            ? context.className({ ...state, defaultClassName: undefined })
            : context?.className,
          tagVariants({ size, appearance, isLink: true, isDisabled: state.isDisabled }),
          className,
        )
      }
    >
      {(state) => (
        <TagContent size={size} leading={leading}>
          {typeof children === 'function' ? children(state) : children}
        </TagContent>
      )}
    </NavigationAnchor>
  );
}

/** A standalone action/filter button, or a navigation tag with `as="a"`. */
export function TagButton(props: TagButtonProps<'button' | 'a'>) {
  return props.as === 'a' ? <TagNavigation {...props} /> : <TagAction {...props} />;
}

// A half-height radius interpolates visibly; rounded-full stays clamped until the end.
const dropdownLabelVariants = cva('shrink', {
  variants: {
    size: {
      xs: 'rounded-[calc(var(--veli-spacing-7)/2)]',
      sm: 'rounded-2xl',
      md: 'rounded-[calc(var(--veli-spacing-9)/2)]',
      lg: 'rounded-[calc(var(--veli-spacing-10)/2)]',
      xl: 'rounded-[calc(var(--veli-spacing-11)/2)]',
    },
    isDisabled: {
      true: 'cursor-not-allowed',
      false: 'cursor-pointer',
    },
  },
});
const dropdownCaretVariants = cva('justify-center rounded-s-sm ps-0 pe-0.5', {
  variants: {
    size: {
      xs: 'w-6 rounded-e-[calc(var(--veli-spacing-7)/2)]',
      sm: 'w-7 rounded-e-2xl',
      md: 'w-8 rounded-e-[calc(var(--veli-spacing-9)/2)]',
      lg: 'w-9 pe-1 rounded-e-[calc(var(--veli-spacing-10)/2)]',
      xl: 'w-10 pe-1 rounded-e-[calc(var(--veli-spacing-11)/2)]',
    },
    isDisabled: {
      true: 'cursor-not-allowed',
      false: 'cursor-pointer',
    },
  },
});
const dropdownValueVariants = cva('min-w-0 truncate', {
  variants: {
    size: {
      xs: 'type-caption-regular',
      sm: 'type-caption-regular',
      md: 'type-body-sm-regular',
      lg: 'type-body-sm-regular',
      xl: 'type-body-md-regular',
    },
  },
});
const dropdownDividerVariants = cva('w-px shrink-0', {
  variants: { size: { xs: 'h-2', sm: 'h-2', md: 'h-2.5', lg: 'h-3', xl: 'h-3' } },
});

interface TagDropdownBaseProps<T extends object>
  extends
    StandaloneTagProps,
    Pick<
      MenuProps<T>,
      | 'items'
      | 'children'
      | 'selectedKeys'
      | 'defaultSelectedKeys'
      | 'onSelectionChange'
      | 'disabledKeys'
    >,
    Pick<MenuTriggerProps, 'isOpen' | 'defaultOpen' | 'onOpenChange'> {
  label: React.ReactNode;
  /** Name of the caret control and menu. Defaults to a localized label. */
  dropdownLabel?: string;
  isDisabled?: boolean;
  /** Render the sole selected sub-label, a count for two or more, or null when empty. */
  renderSelection: (selection: Selection) => React.ReactNode;
  /** Remove the parent tag from the consumer's selection. Sub-labels are cleared first. */
  onDeselect: () => void;
}

/** Keep mounted to animate parent selection and the attached caret. */
export type TagDropdownProps<T extends object> = TagDropdownBaseProps<T> &
  ({ isSelected?: true; onSelect?: () => void } | { isSelected: boolean; onSelect: () => void });

/** A selected tag with separate deselection and multi-select menu controls. */
export function TagDropdown<T extends object>({
  label,
  size = 'sm',
  appearance = 'fill',
  leading,
  className,
  isDisabled = false,
  dropdownLabel,
  renderSelection,
  onDeselect,
  isSelected = true,
  onSelect,
  items,
  children,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  disabledKeys,
  isOpen,
  defaultOpen = false,
  onOpenChange,
}: TagDropdownProps<T>) {
  const { language } = useVeliLanguage();
  const [uncontrolledKeys, setUncontrolledKeys] = React.useState<Selection>(() =>
    defaultSelectedKeys === 'all' ? 'all' : new Set(defaultSelectedKeys),
  );
  const selection =
    selectedKeys === undefined
      ? uncontrolledKeys
      : selectedKeys === 'all'
        ? 'all'
        : selectedKeys instanceof Set
          ? selectedKeys
          : new Set(selectedKeys);
  const available = isSelected && !isDisabled;
  const [localMenu, setLocalMenu] = React.useState(() => ({
    available,
    isOpen: available && defaultOpen,
    closeRequested: !available && (isOpen ?? defaultOpen),
  }));
  // Reset retained trigger state before committing an unavailable control.
  if (localMenu.available !== available) {
    setLocalMenu({
      available,
      isOpen: available && localMenu.isOpen,
      closeRequested: !available && (isOpen ?? localMenu.isOpen),
    });
  }
  const requestedOpen = isOpen ?? localMenu.isOpen;
  const open = available && requestedOpen;
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const labelRef = React.useRef<HTMLButtonElement>(null);
  const menuStateRef = React.useRef<React.ContextType<typeof RootMenuTriggerStateContext>>(null);
  const lastFocused = React.useRef<HTMLElement | null>(null);
  const closeNotified = React.useRef(false);
  React.useLayoutEffect(() => {
    if (available) {
      closeNotified.current = false;
      return;
    }
    if ((localMenu.closeRequested || requestedOpen) && !closeNotified.current) {
      closeNotified.current = true;
      onOpenChange?.(false);
    }
    const focused = lastFocused.current;
    if (
      focused &&
      (document.activeElement === focused ||
        (document.activeElement === document.body && !focused.isConnected))
    ) {
      (isDisabled ? rootRef.current : labelRef.current)?.focus({ preventScroll: true });
    }
  }, [available, localMenu.closeRequested, requestedOpen, onOpenChange, isDisabled]);
  React.useEffect(() => {
    if (!open && available) lastFocused.current = null;
  }, [open, available]);
  const changeOpen = (next: boolean) => {
    if (isOpen === undefined)
      setLocalMenu((previous) => ({ ...previous, isOpen: next, closeRequested: false }));
    onOpenChange?.(next);
  };
  const changeSelection = (next: Selection) => {
    if (selectedKeys === undefined) setUncontrolledKeys(next);
    onSelectionChange?.(next);
  };
  const deselect = () => {
    changeSelection(new Set());
    changeOpen(false);
    onDeselect();
  };
  const text = getTextFromReactNode(label) ?? '';
  const menuLabel =
    normalizeAccessibleText(dropdownLabel) ??
    localizedTagText[language].chooseSublabels.replace('{tag}', text);
  const value = renderSelection(selection);
  const filled = appearance === 'fill';
  // The split control grows as one pill, never once per segment.
  const colors = twMerge(
    tagVariants({ size, appearance, isSelected, isDisabled }),
    'data-[pressed]:scale-100',
  );
  const valueRef = React.useRef<HTMLSpanElement>(null);
  const valueWasVisible = React.useRef(false);
  const valueText = getTextFromReactNode(value);
  React.useEffect(() => {
    const node = valueRef.current;
    const entering = !valueWasVisible.current;
    valueWasVisible.current = Boolean(node);
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const styles = getComputedStyle(node);
    const duration = Number.parseFloat(styles.getPropertyValue('--veli-duration-normal'));
    const easing = styles.getPropertyValue('--veli-ease-out').trim();
    if (!duration || !easing) return;
    const animation = node.animate(
      [
        {
          opacity: 0,
          translate: entering
            ? styles.direction === 'rtl'
              ? 'var(--veli-spacing-1)'
              : 'calc(-1 * var(--veli-spacing-1))'
            : '0px',
        },
        { opacity: 1, translate: '0px' },
      ],
      { duration, easing },
    );
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => animation.cancel();
    reduced.addEventListener('change', stop);
    return () => {
      reduced.removeEventListener('change', stop);
      stop();
    };
  }, [valueText, isSelected]);

  return (
    <span
      ref={rootRef}
      role="group"
      aria-label={text || menuLabel}
      aria-disabled={isDisabled || undefined}
      tabIndex={-1}
      onFocusCapture={(event) => {
        lastFocused.current = event.target as HTMLElement;
      }}
      className={twMerge(
        'inline-flex min-w-0 max-w-full shrink-0 items-center',
        'group/tag-dropdown outline-none focus-visible:ring-2 focus-visible:ring-tag-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface-base forced-colors:focus-visible:outline-solid forced-colors:focus-visible:outline-2 forced-colors:focus-visible:outline-offset-2 transition-[scale] duration-fast ease-out-quad motion-safe:has-[button[data-pressed]]:scale-[1.045] motion-reduce:transition-none',
        className,
      )}
    >
      <AriaButton
        ref={labelRef}
        isDisabled={isDisabled}
        onPress={isSelected ? deselect : onSelect}
        aria-pressed={isSelected}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && isSelected && !isDisabled) {
            event.preventDefault();
            menuStateRef.current?.open('first');
          }
        }}
        className={twMerge(
          colors,
          dropdownLabelVariants({ size, isDisabled }),
          isSelected && 'rounded-e-sm',
        )}
      >
        <TagContent size={size} leading={leading} isSelected={isSelected}>
          {label}
        </TagContent>
        {isSelected && hasRenderableMessage(value) ? (
          <span ref={valueRef} className="inline-flex min-w-0 items-center gap-[inherit]">
            <span
              aria-hidden
              className={twMerge(
                dropdownDividerVariants({ size }),
                isDisabled
                  ? 'bg-tag-disabled-border'
                  : filled
                    ? 'bg-tag-fill-selected-divider'
                    : 'bg-tag-outline-selected-divider',
              )}
            />
            <span
              className={twMerge(
                dropdownValueVariants({ size }),
                isDisabled
                  ? 'text-tag-disabled-foreground'
                  : filled
                    ? 'text-tag-fill-selected-value'
                    : 'text-tag-outline-selected-value',
              )}
            >
              {value}
            </span>
          </span>
        ) : null}
      </AriaButton>
      <span
        inert={!isSelected}
        aria-hidden={!isSelected || undefined}
        className={twMerge(
          'shrink-0 origin-left rtl:origin-right transition-[width,margin,opacity,scale,translate] duration-normal ease-in-out motion-reduce:transition-none',
          isSelected
            ? [
                { xs: 'w-6', sm: 'w-7', md: 'w-8', lg: 'w-9', xl: 'w-10' }[size],
                filled ? 'ms-px' : 'ms-0.5',
              ]
            : 'w-0 opacity-0 scale-60 -translate-x-full rtl:translate-x-full pointer-events-none',
        )}
      >
        <MenuTrigger isOpen={open} onOpenChange={changeOpen}>
          <TagMenuState stateRef={menuStateRef} />
          <AriaButton
            isDisabled={isDisabled}
            aria-label={menuLabel}
            className={twMerge(
              colors,
              dropdownCaretVariants({ size, isDisabled }),
              filled ? 'data-[focus-visible]:ring-offset-1' : 'data-[focus-visible]:ring-offset-2',
              open &&
                (filled ? 'bg-tag-fill-selected-bg-hover' : 'bg-tag-outline-selected-bg-hover'),
            )}
          >
            <span aria-hidden className={tagLeadingVariants({ size })}>
              <CaretDownIcon
                weight="regular"
                className={twMerge(
                  'transition-transform duration-normal ease-out motion-reduce:transition-none',
                  open && 'rotate-180',
                )}
              />
            </span>
          </AriaButton>
          <MenuPopover placement="bottom end">
            <Menu
              aria-label={menuLabel}
              items={items}
              selectionMode="multiple"
              selectedKeys={selection}
              onSelectionChange={changeSelection}
              disabledKeys={disabledKeys}
            >
              {children}
            </Menu>
          </MenuPopover>
        </MenuTrigger>
      </span>
    </span>
  );
}
