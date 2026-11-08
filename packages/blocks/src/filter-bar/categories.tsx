'use client';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Selection } from 'react-aria-components';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { Button } from '@veli-design/react/button';
import { TagButton, TagDropdown } from '@veli-design/react/tags';
import { Sheet } from '@veli-design/react/sheet';
import { CaretDownIcon } from '@phosphor-icons/react';
import { FilterCheckbox } from './sections';
import { useFilterBarMobile } from './mobile';
import { MenuItem } from '@veli-design/react/menu';
import { useVeliLanguage } from '@veli-design/react/provider';
import { useFilterBar } from './root';
import { getFilterLabelIds as labelIds } from './state';
import type { FilterCategory, FilterBarMessages } from './types';
/** Animate block-owned geometry when a category switches between Veli Tag types. */
function CategoryTransition({
  categoryId,
  advanced,
  children,
}: {
  categoryId: string;
  advanced: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const previous = useRef<{ width: number; advanced: boolean } | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const width = element.getBoundingClientRect().width;
    const last = previous.current;
    previous.current = { width, advanced };
    if (
      !last ||
      last.advanced === advanced ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;

    const tokens = getComputedStyle(element);
    const time = tokens.getPropertyValue('--veli-duration-normal').trim();
    const duration = parseFloat(time) * (time.endsWith('ms') ? 1 : 1000);
    const easing = tokens.getPropertyValue('--veli-ease-out').trim();
    if (!Number.isFinite(duration) || !easing || !element.animate) return;
    const animation = element.animate(
      [
        { width: `${last.width}px`, opacity: 0.4, overflow: 'clip' },
        { width: `${width}px`, opacity: 1, overflow: 'clip' },
      ],
      { duration, easing },
    );
    return () => animation.cancel();
  });

  return (
    <div
      ref={ref}
      data-filter-category={categoryId}
      data-filter-tag-mode={advanced ? 'advanced' : 'browse'}
      className="flex w-max shrink-0 items-center"
    >
      {children}
    </div>
  );
}

export interface FilterBarCategoriesProps {
  labels: Pick<
    FilterBarMessages,
    'all' | 'previousCategories' | 'nextCategories' | 'chooseLabels' | 'done'
  >;
  /** Show overflow arrows on mobile and desktop. Defaults to true. */
  showScrollArrows?: boolean;
  className?: string;
}
export function FilterBarCategories({
  labels: messages,
  showScrollArrows,
  className = '',
}: FilterBarCategoriesProps) {
  const { categories, value, isDisabled, setSelection, browse: selectCategory } = useFilterBar();
  const { direction } = useVeliLanguage();
  const mobile = useFilterBarMobile();
  const arrowsEnabled = showScrollArrows ?? true;
  const advanced = value.mode === 'advanced';
  const [quickCategoryId, setQuickCategoryId] = useState<string | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [overflow, setOverflow] = useState({ previous: false, next: false });
  const browse = (id: string | null) => {
    setQuickCategoryId(null);
    selectCategory(id);
  };
  useEffect(() => {
    const rail = railRef.current;
    const track = trackRef.current;
    if (!rail || !track) return;
    const update = () => {
      const offset = Math.abs(rail.scrollLeft);
      const next = { previous: offset > 1, next: offset + rail.clientWidth < rail.scrollWidth - 1 };
      // Edge controls never change rail geometry; move focus before hiding a focused arrow.
      if ((!arrowsEnabled || !next.previous) && document.activeElement === previousRef.current) {
        trackRef.current
          ?.querySelector<HTMLButtonElement>('button:not(:disabled)')
          ?.focus({ preventScroll: true });
      }
      if ((!arrowsEnabled || !next.next) && document.activeElement === nextRef.current) {
        const buttons =
          trackRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
        buttons?.item(buttons.length - 1)?.focus({ preventScroll: true });
      }
      setOverflow((previous) =>
        previous.previous === next.previous && previous.next === next.next ? previous : next,
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(rail);
    observer.observe(track);
    rail.addEventListener('scroll', update, { passive: true });
    return () => {
      observer.disconnect();
      rail.removeEventListener('scroll', update);
    };
  }, [direction, arrowsEnabled]);

  const mobileSelection = `${value.categoryId}:${JSON.stringify(value.selections)}`;
  useLayoutEffect(() => {
    if (!mobile) return;
    const rail = railRef.current;
    const active = trackRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!rail || !active) return;
    const viewport = rail.getBoundingClientRect();
    const target = active.getBoundingClientRect();
    const delta =
      target.right > viewport.right
        ? target.right - viewport.right + 4
        : target.left < viewport.left
          ? target.left - viewport.left - 4
          : 0;
    if (delta) rail.scrollBy({ left: delta, behavior: 'instant' });
  }, [mobile, mobileSelection]);

  const showPrevious = arrowsEnabled && overflow.previous;
  const showNext = arrowsEnabled && overflow.next;
  const fadeWidth = arrowsEnabled ? 'w-28 to-[calc(100%-2.75rem)]' : 'w-4 to-100%';
  const scroll = (forward: boolean) => {
    const rail = railRef.current;
    rail?.scrollBy({
      left: (forward ? 1 : -1) * (direction === 'rtl' ? -1 : 1) * rail.clientWidth * 0.75,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  };
  const selectionText = (category: FilterCategory) => {
    const labels =
      category.children?.filter((item) => labelIds(category, value).includes(item.id)) ?? [];
    return labels.length === 1 ? labels[0].label : labels.length > 1 ? String(labels.length) : null;
  };
  const changeQuickSelection = (category: FilterCategory, keys: Selection) => {
    setSelection(
      category,
      keys === 'all'
        ? (category.children?.filter((item) => !item.isDisabled).map((item) => item.id) ?? [])
        : [...keys].map(String),
      'quick',
    );
  };
  return (
    <div
      className={`relative isolate flex min-w-0 flex-1 items-center max-[600px]:-mx-[var(--filter-bar-mobile-gutter,0px)] max-[600px]:w-[calc(100%+2*var(--filter-bar-mobile-gutter,0px))] max-[600px]:flex-none ${className}`}
    >
      <div
        aria-hidden={!showPrevious}
        inert={!showPrevious}
        className={`absolute inset-y-0 start-0 z-10 flex items-center transition-opacity duration-normal ease-out motion-reduce:transition-none ${showPrevious ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <Button
          ref={previousRef}
          intent="secondary"
          appearance="transparent"
          size="md"
          iconOnly
          aria-label={messages.previousCategories}
          isDisabled={isDisabled || !showPrevious}
          onPress={() => scroll(false)}
        >
          <CaretLeftIcon aria-hidden className="size-4 rtl:rotate-180" />
        </Button>
      </div>
      <div className="relative min-w-0 flex-1">
        <div
          ref={railRef}
          className="min-w-0 flex-1 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onFocusCapture={(event) => {
            // Portal focus bubbles through React ancestors; only scroll actual rail controls.
            if (!(event.target instanceof HTMLElement) || !railRef.current?.contains(event.target))
              return;
            const viewport = railRef.current.getBoundingClientRect();
            const target = event.target.getBoundingClientRect();
            // Calling scrollIntoView for an already-visible tag interrupts native smooth scrolling.
            if (target.left < viewport.left || target.right > viewport.right)
              event.target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          }}
        >
          <div
            ref={trackRef}
            className="flex w-max items-center gap-2 px-1 max-[600px]:px-[var(--filter-bar-mobile-gutter,var(--veli-spacing-1))]"
          >
            <TagButton
              size={mobile ? 'lg' : 'xl'}
              isSelected={!advanced && value.categoryId === null}
              isDisabled={isDisabled}
              onPress={() => browse(null)}
            >
              {messages.all}
            </TagButton>
            {categories.map((category) => {
              const primary = !advanced && value.categoryId === category.id;
              const selected = Boolean(value.selections[category.id]);
              const ids = labelIds(category, value);
              return (
                <CategoryTransition key={category.id} categoryId={category.id} advanced={advanced}>
                  {mobile && !advanced && category.children?.length ? (
                    <Sheet.Trigger
                      isOpen={
                        quickCategoryId === category.id && !isDisabled && !category.isDisabled
                      }
                      onOpenChange={(open) => setQuickCategoryId(open ? category.id : null)}
                    >
                      <TagButton
                        aria-haspopup="dialog"
                        size="lg"
                        isSelected={primary}
                        isDisabled={isDisabled || category.isDisabled}
                        onPress={() => {
                          if (!primary) selectCategory(category.id);
                        }}
                      >
                        <span className="inline-flex max-w-[calc(100vw-7rem)] items-center gap-2 whitespace-nowrap">
                          <span className="min-w-0 truncate">{category.label}</span>
                          {selectionText(category) ? (
                            <>
                              <span
                                aria-hidden
                                className="h-3 w-px shrink-0 bg-tag-fill-selected-divider"
                              />
                              <span className="min-w-0 max-w-24 truncate type-body-sm-regular text-tag-fill-selected-value">
                                {selectionText(category)}
                              </span>
                            </>
                          ) : null}
                          <CaretDownIcon aria-hidden className="size-4 shrink-0" />
                        </span>
                      </TagButton>
                      <Sheet position="bottom" size="full" height="content">
                        <Sheet.Handle />
                        <Sheet.Header>
                          <Sheet.Title>{category.label}</Sheet.Title>
                          <Sheet.Close aria-label={messages.done} />
                        </Sheet.Header>
                        <Sheet.Body>
                          <div role="group" aria-label={category.label}>
                            {category.children.map((option) => (
                              <FilterCheckbox
                                key={option.id}
                                isSelected={ids.includes(option.id)}
                                isDisabled={isDisabled || category.isDisabled || option.isDisabled}
                                onChange={(selected) =>
                                  changeQuickSelection(
                                    category,
                                    new Set(
                                      selected
                                        ? [...ids, option.id]
                                        : ids.filter((id) => id !== option.id),
                                    ),
                                  )
                                }
                              >
                                {option.label}
                              </FilterCheckbox>
                            ))}
                          </div>
                        </Sheet.Body>
                        <Sheet.Footer>
                          <div className="flex w-full justify-end pb-[env(safe-area-inset-bottom)]">
                            <Button slot="close">{messages.done}</Button>
                          </div>
                        </Sheet.Footer>
                      </Sheet>
                    </Sheet.Trigger>
                  ) : !advanced && category.children?.length ? (
                    <TagDropdown
                      key={category.id}
                      size={mobile ? 'lg' : 'xl'}
                      label={category.label}
                      isSelected={primary}
                      isDisabled={isDisabled || category.isDisabled}
                      onSelect={() => browse(category.id)}
                      onDeselect={() => browse(null)}
                      dropdownLabel={messages.chooseLabels(category.label)}
                      selectedKeys={ids}
                      onSelectionChange={(keys) => {
                        // TagDropdown also clears children when its label is deselected.
                        // onDeselect commits that complete browse change instead.
                        if (quickCategoryId === category.id) changeQuickSelection(category, keys);
                      }}
                      renderSelection={() => selectionText(category)}
                      isOpen={quickCategoryId === category.id}
                      onOpenChange={(open) => {
                        setQuickCategoryId(open ? category.id : null);
                      }}
                      disabledKeys={category.children
                        .filter((item) => item.isDisabled)
                        .map((item) => item.id)}
                    >
                      {category.children.map((option) => (
                        <MenuItem key={option.id} id={option.id} textValue={option.label}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TagDropdown>
                  ) : (
                    <TagButton
                      key={category.id}
                      size={mobile ? 'lg' : 'xl'}
                      appearance={advanced && selected ? 'outline' : 'fill'}
                      isSelected={advanced ? selected : primary}
                      isDisabled={isDisabled || category.isDisabled}
                      onPress={() => browse(category.id)}
                    >
                      {category.label}
                      {advanced && selected && selectionText(category) ? (
                        <span className="ms-2 inline-flex items-center gap-2">
                          <span aria-hidden className="h-3 w-px shrink-0 bg-border-base-strong" />
                          <span className="type-body-sm-regular text-base-muted">
                            {selectionText(category)}
                          </span>
                        </span>
                      ) : null}
                    </TagButton>
                  )}
                </CategoryTransition>
              );
            })}
          </div>
        </div>
        <div
          aria-hidden
          data-filter-fade="start"
          className={`pointer-events-none absolute inset-y-0 start-0 ${fadeWidth} bg-linear-to-l from-transparent to-bg-surface-base transition-opacity duration-normal ease-out rtl:bg-linear-to-r motion-reduce:transition-none ${overflow.previous ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          aria-hidden
          data-filter-fade="end"
          className={`pointer-events-none absolute inset-y-0 end-0 ${fadeWidth} bg-linear-to-r from-transparent to-bg-surface-base transition-opacity duration-normal ease-out rtl:bg-linear-to-l motion-reduce:transition-none ${overflow.next ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      <div
        aria-hidden={!showNext}
        inert={!showNext}
        className={`absolute inset-y-0 end-0 z-10 flex items-center transition-opacity duration-normal ease-out motion-reduce:transition-none ${showNext ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <Button
          ref={nextRef}
          intent="secondary"
          appearance="transparent"
          size="md"
          iconOnly
          aria-label={messages.nextCategories}
          isDisabled={isDisabled || !showNext}
          onPress={() => scroll(true)}
        >
          <CaretRightIcon aria-hidden className="size-4 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}
