'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Ref,
} from 'react';
import {
  CheckIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  MouseScrollIcon,
} from '@phosphor-icons/react';
import { Button } from '@veli-design/react/button';
import { Divider } from '@veli-design/react/divider';
import { Menu, MenuItem, MenuPopover, MenuTrigger } from '@veli-design/react/menu';
import { Search } from '@veli-design/react/search';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import {
  Header,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  type Key,
  type Selection,
} from 'react-aria-components';

import {
  INFO_PANEL_GLOW_DARK_FALLBACK,
  INFO_PANEL_GLOW_FALLBACK,
  SwitcherItemContent,
  SwitcherLargeIcon,
  switcherItemClassName,
  tileGridClass,
  type SiteHeaderSwitcherItem,
} from './app-switcher-tiles';
import {
  infoPanelFadeTransition,
  searchResultExitTransition,
  searchResultReducedTransition,
  searchResultTransition,
} from './motion';
import {
  SCROLL_HINT_FRACTION,
  bottomFadeOn,
  bottomFadeSoft,
  hintVisible,
  topFadeOn,
  useScrollEdges,
  type ScrollEdges,
} from './use-switcher-scroll';

export type SiteHeaderAppSwitcherLabels = {
  browse: string;
  introPrefix: string;
  introEmphasis: string;
  apps: string;
  sites: string;
  appsBlurb: string;
  sitesBlurb: string;
  youAreHere: string;
  scrollToViewMore: string;
  searchAppsAndSites: string;
  search: string;
  filter: string;
  showAll: string;
  appsOnly: string;
  sitesOnly: string;
  showingApps: (count: number) => { lead: string; countLabel: string };
  showingSites: (count: number) => { lead: string; countLabel: string };
  searchSummary: (
    query: string,
    appCount: number,
    siteCount: number,
  ) => { countLabel: string; rest: string };
  noAppsMatch: (query: string) => string;
  noSitesMatch: (query: string) => string;
  noAppsOrSitesMatch: (query: string) => string;
};

export type AppSwitcherFilter = 'all' | 'apps' | 'sites';

/** Hide Veli MenuItem's leading selection check so the mark sits at the end. */
const menuItemCheckEndClassName = '[&>div>span:first-child]:hidden';

function menuSelectionEndIcon(isSelected: boolean) {
  return isSelected ? (
    <CheckIcon size={16} weight="regular" className="text-icon-primary" aria-hidden />
  ) : undefined;
}

function readGridColumns(root: HTMLElement | null) {
  const grid = root?.querySelector('[role="listbox"], [role="grid"]');
  if (!(grid instanceof HTMLElement)) return 1;
  const count = getComputedStyle(grid)
    .gridTemplateColumns.split(' ')
    .filter((part) => part.length > 0 && part !== 'none').length;
  return Math.max(1, count);
}

/** Highlight step. Vertical moves stay in column across apps, then sites. */
function nextSwitcherIndex({
  index,
  key,
  columns,
  length,
  appCount,
  rtl,
}: {
  index: number;
  key: string;
  columns: number;
  length: number;
  appCount: number;
  rtl: boolean;
}) {
  if (length === 0) return 0;
  const step = Math.max(1, columns);

  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    const delta = key === 'ArrowRight' ? (rtl ? -1 : 1) : rtl ? 1 : -1;
    const next = index + delta;
    return next < 0 || next >= length ? index : next;
  }

  const singleSection = appCount <= 0 || appCount >= length;
  if (singleSection) {
    const delta = key === 'ArrowDown' ? step : -step;
    const next = index + delta;
    return next < 0 || next >= length ? index : next;
  }

  const inApps = index < appCount;
  const sectionStart = inApps ? 0 : appCount;
  const sectionLen = inApps ? appCount : length - appCount;
  const local = index - sectionStart;
  const col = local % step;

  if (key === 'ArrowDown') {
    const nextLocal = local + step;
    if (nextLocal < sectionLen) return sectionStart + nextLocal;
    if (!inApps) return index;
    const siteCount = length - appCount;
    if (siteCount === 0) return index;
    return appCount + Math.min(col, siteCount - 1);
  }

  const nextLocal = local - step;
  if (nextLocal >= 0) return sectionStart + nextLocal;
  if (inApps || appCount === 0) return index;
  const lastRowStart = Math.floor((appCount - 1) / step) * step;
  const target = lastRowStart + col;
  return target < appCount ? target : appCount - 1;
}

/** Fades for search results. Size changes reflow instantly; only position is animated. */
function searchResultMotion(prefersReducedMotion: boolean | null) {
  return {
    layout: prefersReducedMotion ? false : ('position' as const),
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0, transition: searchResultExitTransition },
    transition: prefersReducedMotion ? searchResultReducedTransition : searchResultTransition,
  };
}

function SwitcherListBoxItem({
  item,
  selectedId,
  youAreHereLabel,
  onPreview,
}: {
  item: SiteHeaderSwitcherItem;
  selectedId: string;
  youAreHereLabel: string;
  onPreview: (id: string) => void;
}) {
  const highlighted = selectedId === item.id;

  return (
    <ListBoxItem
      id={item.id}
      textValue={item.name}
      href={item.external ? item.href : undefined}
      data-switcher-item={item.id}
      data-highlighted={highlighted ? 'true' : undefined}
      className={({ isFocused, isHovered }) =>
        switcherItemClassName(isFocused || isHovered || highlighted)
      }
      onFocus={() => onPreview(item.id)}
      onHoverStart={() => onPreview(item.id)}
    >
      <SwitcherItemContent item={item} youAreHereLabel={youAreHereLabel} />
    </ListBoxItem>
  );
}

function SwitcherSectionHeader({
  title,
  blurb,
  searching,
  headingClassName,
  prefersReducedMotion,
}: {
  title: string;
  blurb: string;
  searching: boolean;
  headingClassName: string;
  prefersReducedMotion: boolean | null;
}) {
  const compactHeading = searching;

  return (
    <Header className="col-span-full">
      <div className={`relative ${compactHeading ? 'ps-0 pt-6 pb-2 xl:ps-4' : headingClassName}`}>
        <p
          className={
            compactHeading
              ? 'type-body-md-semibold text-text-base-strong'
              : 'type-subtitle-semibold text-text-base-strong xl:type-body-md-medium'
          }
        >
          {title}
        </p>
        <AnimatePresence mode="popLayout" initial={false}>
          {!compactHeading ? (
            <motion.p
              key="blurb"
              className="type-body-sm-regular text-text-base hidden xl:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: searchResultExitTransition }}
              transition={
                prefersReducedMotion ? searchResultReducedTransition : searchResultTransition
              }
            >
              {blurb}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </Header>
  );
}

function SearchResults({
  listBoxRef,
  query,
  searching,
  filter,
  apps,
  sites,
  showSites,
  selectedId,
  labels,
  onPreview,
  onActivate,
  prefersReducedMotion,
}: {
  listBoxRef: Ref<HTMLDivElement>;
  query: string;
  searching: boolean;
  filter: AppSwitcherFilter;
  apps: SiteHeaderSwitcherItem[];
  sites: SiteHeaderSwitcherItem[];
  showSites: boolean;
  selectedId: string;
  labels: SiteHeaderAppSwitcherLabels;
  onPreview: (id: string) => void;
  onActivate: (item: SiteHeaderSwitcherItem) => void;
  prefersReducedMotion: boolean | null;
}) {
  const appCount = apps.length;
  const siteCount = showSites ? sites.length : 0;
  const total = appCount + siteCount;
  const summary = labels.searchSummary(query, appCount, siteCount);
  const filterSummary =
    filter === 'apps'
      ? labels.showingApps(appCount)
      : filter === 'sites'
        ? labels.showingSites(siteCount)
        : null;
  const resultMotion = searchResultMotion(prefersReducedMotion);
  const emptyMotion = {
    initial: prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, transform: 'translateY(8px) scale(0.98)' },
    animate: { opacity: 1, transform: 'translateY(0px) scale(1)' },
    exit: { opacity: 0, transition: searchResultExitTransition },
    transition: resultMotion.transition,
  };
  const showApps = filter !== 'sites' && (!searching || appCount > 0);
  const showSiteGroup = filter !== 'apps' && showSites && (!searching || siteCount > 0);
  const shownApps = useMemo(() => (showApps ? apps : []), [apps, showApps]);
  const shownSites = useMemo(() => (showSiteGroup ? sites : []), [showSiteGroup, sites]);
  const noMatches =
    filter === 'apps'
      ? labels.noAppsMatch(query)
      : filter === 'sites'
        ? labels.noSitesMatch(query)
        : showSites
          ? labels.noAppsOrSitesMatch(query)
          : labels.noAppsMatch(query);
  const announcement = !searching
    ? filterSummary && total > 0
      ? `${filterSummary.lead}${filterSummary.countLabel}`
      : ''
    : total > 0
      ? filterSummary
        ? `${filterSummary.lead}${filterSummary.countLabel}`
        : `${summary.countLabel}${summary.rest}`
      : noMatches;

  const itemsById = useMemo(() => {
    const map = new Map<string, SiteHeaderSwitcherItem>();
    for (const item of shownApps) map.set(item.id, item);
    for (const item of shownSites) map.set(item.id, item);
    return map;
  }, [shownApps, shownSites]);

  const onAction = (key: Key) => {
    const item = itemsById.get(String(key));
    if (!item || item.external) return;
    onActivate(item);
  };

  return (
    <LayoutGroup>
      <div className="flex min-h-0 flex-1 flex-col">
        <output className="sr-only" aria-live="polite">
          {announcement}
        </output>
        <AnimatePresence mode="popLayout" initial={false}>
          {filterSummary && total > 0 ? (
            <motion.p
              key="filter-summary"
              className="type-body-sm-regular text-text-base-muted border-border-base-muted mb-4 border-b ps-0 pt-4 pb-4 xl:ps-4"
              {...resultMotion}
            >
              {filterSummary.lead}
              <span className="type-body-sm-medium text-text-base-strong">
                {filterSummary.countLabel}
              </span>
            </motion.p>
          ) : searching && total > 0 ? (
            <motion.p
              key="summary"
              className="type-body-sm-regular text-text-base-muted ps-0 pt-4 pb-2 xl:ps-4"
              {...resultMotion}
            >
              <span className="type-body-sm-medium text-text-base-strong">
                {summary.countLabel}
              </span>
              {summary.rest}
            </motion.p>
          ) : null}
        </AnimatePresence>

        {total > 0 ? (
          <div
            ref={listBoxRef}
            role="region"
            aria-label={labels.browse}
            className="flex flex-col outline-none"
          >
            {showApps ? (
              <ListBox
                aria-label={labels.apps}
                layout="grid"
                orientation="vertical"
                selectionMode="none"
                escapeKeyBehavior="none"
                shouldFocusOnHover
                onAction={onAction}
                className={`${tileGridClass} pt-4 outline-none`}
                renderEmptyState={() => null}
              >
                <ListBoxSection id="apps" className="contents">
                  <SwitcherSectionHeader
                    title={labels.apps}
                    blurb={labels.appsBlurb}
                    searching={searching}
                    headingClassName="flex flex-col gap-2 ps-0 pt-0 pb-2 xl:ps-4"
                    prefersReducedMotion={prefersReducedMotion}
                  />
                  {shownApps.map((item) => (
                    <SwitcherListBoxItem
                      key={item.id}
                      item={item}
                      selectedId={selectedId}
                      youAreHereLabel={labels.youAreHere}
                      onPreview={onPreview}
                    />
                  ))}
                </ListBoxSection>
              </ListBox>
            ) : null}
            {showSiteGroup ? (
              <ListBox
                aria-label={labels.sites}
                layout="grid"
                orientation="vertical"
                selectionMode="none"
                escapeKeyBehavior="none"
                shouldFocusOnHover
                onAction={onAction}
                className={`${tileGridClass} outline-none ${
                  showApps ? 'border-border-base-muted mt-4 border-t pt-4' : 'pt-4'
                }`}
                renderEmptyState={() => null}
              >
                <ListBoxSection id="sites" className="contents">
                  <SwitcherSectionHeader
                    title={labels.sites}
                    blurb={labels.sitesBlurb}
                    searching={searching}
                    headingClassName="flex flex-col gap-2 ps-0 pt-4 pb-2 xl:ps-4 xl:pt-0"
                    prefersReducedMotion={prefersReducedMotion}
                  />
                  {shownSites.map((item) => (
                    <SwitcherListBoxItem
                      key={item.id}
                      item={item}
                      selectedId={selectedId}
                      youAreHereLabel={labels.youAreHere}
                      onPreview={onPreview}
                    />
                  ))}
                </ListBoxSection>
              </ListBox>
            ) : null}
          </div>
        ) : null}

        <AnimatePresence mode="popLayout" initial={false}>
          {filter === 'all' && searching && total > 0 && appCount === 0 ? (
            <motion.p
              key="no-apps"
              className="type-body-sm-medium text-text-base border-border-base-muted border-t ps-0 pt-4 pb-2 xl:ps-4"
              {...resultMotion}
            >
              {labels.noAppsMatch(query)}
            </motion.p>
          ) : null}
          {filter === 'all' && searching && total > 0 && showSites && siteCount === 0 ? (
            <motion.p
              key="no-sites"
              className="type-body-sm-medium text-text-base border-border-base-muted border-t ps-0 pt-4 pb-2 xl:ps-4"
              {...resultMotion}
            >
              {labels.noSitesMatch(query)}
            </motion.p>
          ) : null}

          {searching && total === 0 ? (
            <motion.div
              key="empty"
              className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-28"
              {...emptyMotion}
            >
              <MagnifyingGlassIcon size={32} className="text-text-base" aria-hidden />
              <p className="type-body-md-medium text-text-base text-center">{noMatches}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}

function isTextEntryTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
  );
}

function isMenuTriggerTarget(target: EventTarget | null) {
  // React Aria emits `true`, which has the same ARIA meaning as `menu`.
  return (
    target instanceof Element &&
    Boolean(target.closest('button[aria-haspopup="menu"], button[aria-haspopup="true"]'))
  );
}

function isInteractiveChromeTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        'button, a, [role="button"], [role="link"], [role="menuitem"], [role="menuitemradio"]',
      ),
    )
  );
}

/**
 * Keys from the switcher panel, or the dialog surface itself (initial focus).
 * Nav/actions outside the panel stay out of scope; mark them inert while open.
 */
function isSwitcherKeyboardScope(panel: HTMLElement, target: Node) {
  if (panel.contains(target)) return true;
  const dialog = panel.closest('[role="dialog"]');
  if (!dialog) return false;
  if (target === dialog) return true;
  // Logo/close lives in the dialog chrome outside the panel. Skip inert subtrees
  // (faded nav / host actions) so their keys are never redirected into Search.
  if (target instanceof Element && target.closest('[inert]')) return false;
  return dialog.contains(target);
}

function visibleSearchInput(candidates: Array<HTMLInputElement | null>) {
  return candidates.find((input) => input && input.getClientRects().length > 0) ?? null;
}

function FilterMenu({
  iconOnly,
  filter,
  onFilterChange,
  labels,
}: {
  iconOnly?: boolean;
  filter: AppSwitcherFilter;
  onFilterChange: (filter: AppSwitcherFilter) => void;
  labels: Pick<SiteHeaderAppSwitcherLabels, 'filter' | 'showAll' | 'appsOnly' | 'sitesOnly'>;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel =
    filter === 'apps' ? labels.appsOnly : filter === 'sites' ? labels.sitesOnly : labels.showAll;
  const onSelectionChange = (keys: Selection) => {
    const key = [...keys][0];
    if (key === 'all' || key === 'apps' || key === 'sites') onFilterChange(key);
    setOpen(false);
  };

  return (
    <span className="relative inline-flex">
      <MenuTrigger isOpen={open} onOpenChange={setOpen}>
        {iconOnly ? (
          <Button
            intent="secondary"
            appearance="transparent"
            size="md"
            iconOnly
            aria-label={filter === 'all' ? labels.filter : `${labels.filter}: ${selectedLabel}`}
          >
            <FunnelSimpleIcon size={16} weight="bold" aria-hidden />
          </Button>
        ) : (
          <Button
            intent="secondary"
            appearance="transparent"
            size="md"
            aria-label={filter === 'all' ? labels.filter : `${labels.filter}: ${selectedLabel}`}
          >
            <FunnelSimpleIcon size={16} weight="bold" aria-hidden />
            {labels.filter}
          </Button>
        )}
        <MenuPopover placement="bottom end" className="z-70 w-[198px] min-w-[198px]">
          <Menu
            aria-label={labels.filter}
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={new Set([filter])}
            onSelectionChange={onSelectionChange}
          >
            {(
              [
                ['all', labels.showAll],
                ['apps', labels.appsOnly],
                ['sites', labels.sitesOnly],
              ] as const
            ).map(([id, label]) => (
              <MenuItem
                key={id}
                id={id}
                size="sm"
                className={menuItemCheckEndClassName}
                endIcon={menuSelectionEndIcon(filter === id)}
              >
                {label}
              </MenuItem>
            ))}
          </Menu>
        </MenuPopover>
      </MenuTrigger>
      {filter !== 'all' ? (
        <span
          className="bg-icon-primary pointer-events-none absolute end-1 top-1 size-2 rounded-full"
          aria-hidden
        />
      ) : null}
    </span>
  );
}

function SearchFilterRow({
  inputRef,
  query,
  onQueryChange,
  filter,
  onFilterChange,
  labels,
}: {
  inputRef?: Ref<HTMLInputElement>;
  query: string;
  onQueryChange: (value: string) => void;
  filter: AppSwitcherFilter;
  onFilterChange: (filter: AppSwitcherFilter) => void;
  labels: Pick<
    SiteHeaderAppSwitcherLabels,
    'searchAppsAndSites' | 'search' | 'filter' | 'showAll' | 'appsOnly' | 'sitesOnly'
  >;
}) {
  return (
    <div className="flex w-full items-center gap-2">
      <div className="min-w-0 flex-1">
        <Search
          ref={inputRef}
          aria-label={labels.searchAppsAndSites}
          placeholder={labels.search}
          appearance="outline"
          size="md"
          value={query}
          onChange={onQueryChange}
        />
      </div>
      <span className="xl:hidden">
        <FilterMenu iconOnly filter={filter} onFilterChange={onFilterChange} labels={labels} />
      </span>
      <span className="hidden xl:contents">
        <FilterMenu filter={filter} onFilterChange={onFilterChange} labels={labels} />
      </span>
    </div>
  );
}

function SwitcherScrollChrome({
  edges,
  label,
  onHint,
}: {
  edges: ScrollEdges;
  label: string;
  onHint: () => void;
}) {
  const showHint = hintVisible(edges);
  const showBottom = bottomFadeOn(edges);
  const soft = bottomFadeSoft(edges);
  const showTop = topFadeOn(edges);

  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-px top-0 z-10 h-14 bg-linear-to-b from-surface-raised to-transparent transition-opacity duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
          showTop ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-px bottom-0 z-10 transition-[opacity,height] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none xl:rounded-b-[32px] ${
          showBottom ? (soft ? 'h-8 opacity-60' : 'h-24 opacity-100') : 'h-8 opacity-0'
        }`}
        style={{
          background: soft
            ? 'linear-gradient(transparent, var(--veli-color-bg-surface-raised))'
            : 'linear-gradient(transparent, var(--veli-color-bg-surface-raised) 70%)',
        }}
      />
      <button
        type="button"
        tabIndex={showHint ? 0 : -1}
        aria-hidden={showHint ? undefined : true}
        onClick={(event) => {
          onHint();
          event.currentTarget.blur();
        }}
        className={`type-body-sm-medium text-text-base-strong absolute inset-x-0 bottom-1.5 z-20 mx-auto flex w-max items-center rounded-full bg-transparent px-6 py-2 transition-[opacity,transform,background-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-neutral-alpha-200 motion-reduce:translate-y-0 motion-reduce:transition-none ${
          showHint
            ? 'pointer-events-auto translate-y-0 cursor-pointer opacity-100'
            : 'pointer-events-none translate-y-1.5 opacity-0'
        }`}
      >
        <span className="inline-flex items-center gap-1.5 transition-transform duration-[80ms] ease-out active:scale-[1.045]">
          <MouseScrollIcon size={16} weight="bold" aria-hidden />
          {label}
        </span>
      </button>
    </>
  );
}

export type AppSwitcherProps = {
  onClose: () => void;
  apps: SiteHeaderSwitcherItem[];
  sites: SiteHeaderSwitcherItem[];
  labels: SiteHeaderAppSwitcherLabels;
  titleId: string;
  onNavigate: (href: string) => void;
  /** Default selected tile id; falls back to the first app. */
  defaultSelectedId?: string;
};

export function AppSwitcher({
  onClose,
  apps,
  sites,
  labels,
  titleId,
  onNavigate,
  defaultSelectedId,
}: AppSwitcherProps) {
  const prefersReducedMotion = useReducedMotion();
  const initialId = defaultSelectedId ?? apps[0]?.id ?? sites[0]?.id ?? '';
  const [selectedId, setSelectedId] = useState(initialId);
  const [trackedInitialId, setTrackedInitialId] = useState(initialId);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<AppSwitcherFilter>('all');
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const listBoxRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const pendingCaretRef = useRef<number | null>(null);
  const pendingScrollRef = useRef<string | null>(null);

  // Sync highlight to a new default selection without wiping in-progress search/filter
  // (AppSwitcher remounts on close→open, which resets those).
  if (initialId !== trackedInitialId) {
    setTrackedInitialId(initialId);
    setSelectedId(initialId);
  }

  useEffect(() => {
    // Capture so printable keys / Backspace reach Search before RAC listbox consumes them.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const isPrintable = event.key.length === 1;
      const isBackspace = event.key === 'Backspace';
      if (!isPrintable && !isBackspace) return;

      const panel = panelRef.current;
      if (!panel || panel.closest('[inert]')) return;
      const target = event.target;
      // Dialog surface holds initial focus; it's an ancestor of the panel, not inside it.
      if (!(target instanceof Node) || !isSwitcherKeyboardScope(panel, target)) return;
      // Search (and any other field) keeps native editing while focused.
      if (isTextEntryTarget(target)) return;
      if (isMenuTriggerTarget(target)) return;
      if (isPrintable && event.key === ' ' && isInteractiveChromeTarget(target)) return;

      const input = visibleSearchInput([mobileSearchRef.current, desktopSearchRef.current]);
      if (!input) return;

      event.preventDefault();
      event.stopPropagation();
      input.focus();
      if (isBackspace) {
        if (!input.value) return;
        const next = input.value.slice(0, -1);
        pendingCaretRef.current = next.length;
        setQuery(next);
        return;
      }

      const next = input.value + event.key;
      pendingCaretRef.current = next.length;
      setQuery(next);
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, []);

  useLayoutEffect(() => {
    const caret = pendingCaretRef.current;
    if (caret == null) return;
    pendingCaretRef.current = null;
    visibleSearchInput([mobileSearchRef.current, desktopSearchRef.current])?.setSelectionRange(
      caret,
      caret,
    );
  }, [query]);

  const allItems = useMemo(() => [...apps, ...sites], [apps, sites]);

  const q = query.trim().toLowerCase();
  const filteredApps = useMemo(
    () => apps.filter((item) => !q || item.name.toLowerCase().includes(q)),
    [apps, q],
  );
  const filteredSites = useMemo(
    () => sites.filter((item) => !q || item.name.toLowerCase().includes(q)),
    [sites, q],
  );
  const searching = Boolean(q);
  const { navigable, navigableAppCount } = useMemo(() => {
    const shownApps = filter === 'sites' ? [] : filteredApps;
    const shownSites = filter === 'apps' || sites.length === 0 ? [] : filteredSites;
    return {
      navigable: [...shownApps, ...shownSites],
      navigableAppCount: shownApps.length,
    };
  }, [filter, filteredApps, filteredSites, sites.length]);

  const activeSelectedId =
    navigable.length === 0 || navigable.some((item) => item.id === selectedId)
      ? selectedId
      : (navigable[0]?.id ?? selectedId);
  const selected = allItems.find((item) => item.id === activeSelectedId) ?? apps[0] ?? sites[0];
  const scrollKey = `${filter}|${q}|${filteredApps.length}|${filteredSites.length}`;
  const edges = useScrollEdges(scrollRef, scrollKey);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = 0;
  }, [filter, q]);

  useEffect(() => {
    const id = pendingScrollRef.current;
    if (!id) return;
    pendingScrollRef.current = null;
    const node = scrollRef.current?.querySelector(`[data-switcher-item="${CSS.escape(id)}"]`);
    if (node instanceof HTMLElement) node.scrollIntoView({ block: 'nearest' });
  }, [activeSelectedId]);

  const applyFilter = (next: AppSwitcherFilter) => {
    setFilter(next);
    const shownApps = next === 'sites' ? [] : filteredApps;
    const shownSites = next === 'apps' || sites.length === 0 ? [] : filteredSites;
    const first = shownApps[0] ?? shownSites[0];
    if (first) setSelectedId(first.id);
  };

  const scrollByHint = () => {
    const el = scrollRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({
      top: Math.round(el.clientHeight * SCROLL_HINT_FRACTION),
      behavior: reduce ? 'auto' : 'smooth',
    });
  };

  const activateItem = useCallback(
    (item: SiteHeaderSwitcherItem) => {
      if (item.external) {
        window.location.assign(item.href);
        onClose();
        return;
      }
      onNavigate(item.href);
      onClose();
    },
    [onClose, onNavigate],
  );

  const focusSwitcherOption = useCallback((id: string) => {
    const option = listBoxRef.current?.querySelector(`[data-switcher-item="${CSS.escape(id)}"]`);
    if (option instanceof HTMLElement) {
      option.focus();
      return;
    }
    listBoxRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const panel = panelRef.current;
      if (!panel || panel.closest('[inert]')) return;
      const target = event.target;
      // Host page controls (e.g. a sibling textarea) must keep their own keys.
      // Dialog surface holds initial focus and must still drive arrows/Enter.
      if (!(target instanceof Node) || !isSwitcherKeyboardScope(panel, target)) return;
      if (target instanceof Element && target.closest('[role="menu"]')) return;
      // Filter menu trigger owns ArrowDown/Up/Enter for opening the menu.
      if (isMenuTriggerTarget(target)) return;

      const input = visibleSearchInput([mobileSearchRef.current, desktopSearchRef.current]);
      const inSearch = target === input;
      const inTextEntry = isTextEntryTarget(target);
      // Non-search fields inside the panel keep native editing (and host slots if any).
      if (inTextEntry && !inSearch) return;

      // Arrow keys move across apps and sites, including while an option is focused.
      const inSwitcherOption =
        target instanceof Element && target.closest('[role="listbox"], [role="option"]');

      const arrow =
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight';

      if (arrow) {
        if (navigable.length === 0) return;
        // Arrows always move the highlight (including while Search is focused).
        event.preventDefault();
        event.stopPropagation();
        const rtl = getComputedStyle(panel).direction === 'rtl';
        const current = navigable.findIndex((item) => item.id === activeSelectedId);
        const index = current < 0 ? 0 : current;
        const nextIndex = nextSwitcherIndex({
          index,
          key: event.key,
          columns: readGridColumns(listBoxRef.current),
          length: navigable.length,
          appCount: navigableAppCount,
          rtl,
        });
        const id = navigable[nextIndex]?.id;
        if (!id) return;
        pendingScrollRef.current = id;
        setSelectedId(id);
        focusSwitcherOption(id);
        return;
      }

      if (inSwitcherOption) return;
      if (event.key !== 'Enter') return;
      if (!inSearch && isInteractiveChromeTarget(target)) return;
      const item = navigable.find((entry) => entry.id === activeSelectedId) ?? navigable[0];
      if (!item) return;
      event.preventDefault();
      activateItem(item);
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [activateItem, activeSelectedId, focusSwitcherOption, navigable, navigableAppCount]);

  if (!selected) return null;

  return (
    <div
      ref={panelRef}
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pt-4 pb-6 xl:flex-row xl:gap-6 xl:px-12 xl:pt-8 xl:pb-12"
    >
      <div className="flex min-h-0 w-full max-w-[952px] flex-1 flex-col gap-4 xl:shrink-0">
        <div className="flex shrink-0 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 id={titleId} className="type-subtitle-semibold text-text-base-strong">
              {labels.browse}
            </h2>
            <p className="type-body-md-regular text-text-base">
              {labels.introPrefix}{' '}
              <span className="type-body-md-medium">{labels.introEmphasis}</span>
            </p>
          </div>

          <div className="xl:hidden">
            <SearchFilterRow
              inputRef={mobileSearchRef}
              query={query}
              onQueryChange={setQuery}
              filter={filter}
              onFilterChange={applyFilter}
              labels={labels}
            />
          </div>
        </div>

        <div className="border-border-base-muted relative flex min-h-[360px] flex-[1_0_360px] flex-col overflow-hidden rounded-3xl border min-[600px]:min-h-[420px] min-[600px]:flex-[1_0_420px] xl:rounded-[32px] xl:p-4">
          <div className="relative z-20 hidden shrink-0 bg-surface-raised xl:block">
            <SearchFilterRow
              inputRef={desktopSearchRef}
              query={query}
              onQueryChange={setQuery}
              filter={filter}
              onFilterChange={applyFilter}
              labels={labels}
            />
          </div>
          <div className="relative min-h-0 flex-1">
            <div
              ref={scrollRef}
              data-switcher-scroll=""
              className="absolute inset-0 overflow-y-auto overscroll-contain pb-[72px]"
            >
              <SearchResults
                listBoxRef={listBoxRef}
                query={query.trim()}
                searching={searching}
                filter={filter}
                apps={filter === 'sites' ? [] : filteredApps}
                sites={filter === 'apps' ? [] : filteredSites}
                showSites={filter !== 'apps' && sites.length > 0}
                selectedId={activeSelectedId}
                labels={labels}
                prefersReducedMotion={prefersReducedMotion}
                onPreview={setSelectedId}
                onActivate={activateItem}
              />
            </div>
            <SwitcherScrollChrome
              edges={edges}
              label={labels.scrollToViewMore}
              onHint={scrollByHint}
            />
          </div>
        </div>
      </div>

      <aside className="hidden min-h-0 w-[424px] shrink-0 flex-col xl:flex xl:pt-[76px]">
        <div className="relative flex h-full min-h-[320px] flex-col overflow-auto rounded-[32px] p-10">
          {/*
            Theme via `.dark` (not React context) so Storybook/document theme switches
            always paint the correct glow. Hosts may override with --veli-header-info-panel-glow
            on :root / .dark.
          */}
          <span
            className="pointer-events-none absolute inset-0 rounded-[32px] dark:hidden"
            style={{
              backgroundImage: `var(--veli-header-info-panel-glow, ${INFO_PANEL_GLOW_FALLBACK})`,
            }}
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-0 hidden rounded-[32px] dark:block"
            style={{
              backgroundImage: `var(--veli-header-info-panel-glow, ${INFO_PANEL_GLOW_DARK_FALLBACK})`,
            }}
            aria-hidden
          />
          <div className="relative flex h-full min-h-0 flex-col">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={selected.id}
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : infoPanelFadeTransition}
                className="flex flex-col gap-12"
              >
                <div className="flex flex-col gap-6">
                  <SwitcherLargeIcon item={selected} />
                  <div className="flex flex-col gap-2 ps-1 pb-6">
                    <h3 className="type-subtitle-semibold text-text-base">{selected.name}</h3>
                    <p className="type-body-sm-regular text-text-base">{selected.description}</p>
                  </div>
                </div>

                {selected.sections?.length ? (
                  <div className="flex flex-col gap-6 px-1">
                    {selected.sections.map((section) => (
                      <div key={section.title} className="flex flex-col gap-2">
                        <Divider appearance="muted" className="w-full" />
                        <div className="text-text-base flex flex-col gap-2">
                          <p className="type-body-md-medium">{section.title}</p>
                          <p className="type-body-sm-regular whitespace-pre-wrap">{section.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </aside>
    </div>
  );
}
