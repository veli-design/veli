'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type Ref,
} from 'react';
import {
  CaretDownIcon,
  CheckIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
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
  EASE_DRAWER_CSS,
  expandTilesTransition,
  infoPanelFadeTransition,
  searchResultExitTransition,
  searchResultReducedTransition,
  searchResultTransition,
} from './motion';

/** Collapsed tiles per section — one full row matching `tileGridClass` column counts. */
const COLLAPSED_TILE_COUNT = { base: 3, md: 4, xl: 5 } as const;
const BP_MD = 768;
const BP_XL = 1280;

export type SiteHeaderAppSwitcherLabels = {
  browse: string;
  introPrefix: string;
  introEmphasis: string;
  apps: string;
  sites: string;
  appsBlurb: string;
  sitesBlurb: string;
  youAreHere: string;
  viewMore: string;
  viewLess: string;
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

function visibleSwitcherItems(
  items: SiteHeaderSwitcherItem[],
  collapsedCount: number,
  expanded: boolean,
  searching: boolean,
  layout: 'grid' | 'list',
) {
  if (layout === 'list' || searching || expanded) return items;
  return items.slice(0, collapsedCount);
}

/** Grid/list highlight step. Vertical moves stay column-aligned across apps → sites. */
function nextSwitcherIndex({
  index,
  key,
  columns,
  length,
  appCount,
  layout,
  rtl,
}: {
  index: number;
  key: string;
  columns: number;
  length: number;
  appCount: number;
  layout: 'grid' | 'list';
  rtl: boolean;
}) {
  if (length === 0) return 0;
  const step = Math.max(1, columns);

  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    const delta = key === 'ArrowRight' ? (rtl ? -1 : 1) : rtl ? 1 : -1;
    const next = index + delta;
    return next < 0 || next >= length ? index : next;
  }

  const singleSection = layout === 'list' || appCount <= 0 || appCount >= length;
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

function getCollapsedTileCount(width: number) {
  if (width >= BP_XL) return COLLAPSED_TILE_COUNT.xl;
  if (width >= BP_MD) return COLLAPSED_TILE_COUNT.md;
  return COLLAPSED_TILE_COUNT.base;
}

function subscribeViewport(onChange: () => void) {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

function useCollapsedTileCount() {
  return useSyncExternalStore(
    subscribeViewport,
    () => getCollapsedTileCount(window.innerWidth),
    () => COLLAPSED_TILE_COUNT.xl,
  );
}

function ViewMore({
  expanded,
  onToggle,
  prefersReducedMotion,
  viewMore,
  viewLess,
}: {
  expanded: boolean;
  onToggle: () => void;
  prefersReducedMotion: boolean | null;
  viewMore: string;
  viewLess: string;
}) {
  return (
    <div className="relative flex w-full items-center justify-center gap-2.5 px-4 py-1">
      <div className="bg-border-base-muted h-px min-w-0 flex-1" />
      <Button
        intent="primary"
        appearance="ghost"
        size="xs"
        onPress={onToggle}
        aria-expanded={expanded}
      >
        {expanded ? viewLess : viewMore}
        <motion.span
          className="inline-flex"
          animate={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          transition={prefersReducedMotion ? { duration: 0 } : expandTilesTransition}
        >
          <CaretDownIcon size={12} weight="bold" aria-hidden />
        </motion.span>
      </Button>
      <div className="bg-border-base-muted h-px min-w-0 flex-1" />
    </div>
  );
}

/** Extra grid rows expand above View more; overflow is clipped so the divider never overlaps tiles. */
function ExpandableTileRest({
  expanded,
  prefersReducedMotion,
  children,
}: {
  expanded: boolean;
  prefersReducedMotion: boolean | null;
  children: ReactNode;
}) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateRows: expanded ? '1fr' : '0fr',
        transition: prefersReducedMotion
          ? undefined
          : `grid-template-rows 300ms ${EASE_DRAWER_CSS}`,
      }}
    >
      <div className="min-h-0 overflow-hidden" {...(!expanded ? { inert: true as const } : {})}>
        {children}
      </div>
    </div>
  );
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
  layout,
  selectedId,
  youAreHereLabel,
  onPreview,
}: {
  item: SiteHeaderSwitcherItem;
  layout: 'grid' | 'list';
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
        switcherItemClassName({
          layout,
          highlighted: isFocused || isHovered || highlighted,
        })
      }
      onFocus={() => onPreview(item.id)}
      onHoverStart={() => onPreview(item.id)}
    >
      <SwitcherItemContent item={item} youAreHereLabel={youAreHereLabel} layout={layout} />
    </ListBoxItem>
  );
}

function SwitcherSectionHeader({
  title,
  blurb,
  searching,
  layout,
  headingClassName,
  prefersReducedMotion,
}: {
  title: string;
  blurb: string;
  searching: boolean;
  layout: 'grid' | 'list';
  headingClassName: string;
  prefersReducedMotion: boolean | null;
}) {
  const listLayout = layout === 'list';
  const compactHeading = searching && !listLayout;

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
  appsExpanded,
  sitesExpanded,
  onToggleApps,
  onToggleSites,
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
  appsExpanded: boolean;
  sitesExpanded: boolean;
  onToggleApps: () => void;
  onToggleSites: () => void;
  selectedId: string;
  labels: SiteHeaderAppSwitcherLabels;
  onPreview: (id: string) => void;
  onActivate: (item: SiteHeaderSwitcherItem) => void;
  prefersReducedMotion: boolean | null;
}) {
  const collapsedCount = useCollapsedTileCount();
  const appCount = apps.length;
  const siteCount = showSites ? sites.length : 0;
  const total = appCount + siteCount;
  const layout: 'grid' | 'list' = filter === 'all' ? 'grid' : 'list';
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
  const collapseGrid = layout === 'grid' && !searching;
  const shownApps = useMemo(
    () =>
      showApps ? visibleSwitcherItems(apps, collapsedCount, appsExpanded, searching, layout) : [],
    [apps, appsExpanded, collapsedCount, layout, searching, showApps],
  );
  const shownSites = useMemo(
    () =>
      showSiteGroup
        ? visibleSwitcherItems(sites, collapsedCount, sitesExpanded, searching, layout)
        : [],
    [collapsedCount, layout, searching, showSiteGroup, sites, sitesExpanded],
  );
  const appsCollapsed = useMemo(
    () => (showApps && collapseGrid ? apps.slice(0, collapsedCount) : shownApps),
    [apps, collapseGrid, collapsedCount, showApps, shownApps],
  );
  const appsRest = useMemo(
    () => (showApps && collapseGrid ? apps.slice(collapsedCount) : []),
    [apps, collapseGrid, collapsedCount, showApps],
  );
  const sitesCollapsed = useMemo(
    () => (showSiteGroup && collapseGrid ? sites.slice(0, collapsedCount) : shownSites),
    [collapseGrid, collapsedCount, showSiteGroup, shownSites, sites],
  );
  const sitesRest = useMemo(
    () => (showSiteGroup && collapseGrid ? sites.slice(collapsedCount) : []),
    [collapseGrid, collapsedCount, showSiteGroup, sites],
  );
  const appsHasMore = collapseGrid && apps.length > collapsedCount;
  const sitesHasMore = collapseGrid && sites.length > collapsedCount;
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
              className="type-body-sm-regular text-text-base-muted ps-0 pt-4 pb-2 xl:ps-4"
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
              <div className="flex shrink-0 flex-col">
                <ListBox
                  aria-label={labels.apps}
                  layout={layout === 'grid' ? 'grid' : 'stack'}
                  orientation="vertical"
                  selectionMode="none"
                  escapeKeyBehavior="none"
                  shouldFocusOnHover
                  onAction={onAction}
                  className={
                    layout === 'list'
                      ? 'flex flex-col gap-1 px-2 py-2 outline-none'
                      : appsHasMore
                        ? `${tileGridClass} pt-4 outline-none xl:px-4 xl:pt-4`
                        : `${tileGridClass} py-4 outline-none xl:p-4`
                  }
                  renderEmptyState={() => null}
                >
                  <ListBoxSection id="apps" className="contents">
                    <SwitcherSectionHeader
                      title={labels.apps}
                      blurb={labels.appsBlurb}
                      searching={searching}
                      layout={layout}
                      headingClassName="flex flex-col gap-2 ps-0 pt-0 pb-2 xl:ps-4 xl:pt-6"
                      prefersReducedMotion={prefersReducedMotion}
                    />
                    {appsCollapsed.map((item) => (
                      <SwitcherListBoxItem
                        key={item.id}
                        item={item}
                        layout={layout}
                        selectedId={selectedId}
                        youAreHereLabel={labels.youAreHere}
                        onPreview={onPreview}
                      />
                    ))}
                  </ListBoxSection>
                </ListBox>
                {appsHasMore ? (
                  <>
                    <ExpandableTileRest
                      expanded={appsExpanded}
                      prefersReducedMotion={prefersReducedMotion}
                    >
                      <ListBox
                        aria-label={labels.apps}
                        aria-hidden={!appsExpanded}
                        layout="grid"
                        orientation="vertical"
                        selectionMode="none"
                        escapeKeyBehavior="none"
                        shouldFocusOnHover
                        onAction={onAction}
                        className={`${tileGridClass} pt-4 outline-none xl:px-4`}
                        renderEmptyState={() => null}
                      >
                        {appsRest.map((item) => (
                          <SwitcherListBoxItem
                            key={item.id}
                            item={item}
                            layout={layout}
                            selectedId={selectedId}
                            youAreHereLabel={labels.youAreHere}
                            onPreview={onPreview}
                          />
                        ))}
                      </ListBox>
                    </ExpandableTileRest>
                    <div className="relative z-10 pt-2">
                      <ViewMore
                        expanded={appsExpanded}
                        onToggle={onToggleApps}
                        prefersReducedMotion={prefersReducedMotion}
                        viewMore={labels.viewMore}
                        viewLess={labels.viewLess}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
            {showSiteGroup ? (
              <div className="flex shrink-0 flex-col">
                <ListBox
                  aria-label={labels.sites}
                  layout={layout === 'grid' ? 'grid' : 'stack'}
                  orientation="vertical"
                  selectionMode="none"
                  escapeKeyBehavior="none"
                  shouldFocusOnHover
                  onAction={onAction}
                  className={
                    layout === 'list'
                      ? 'flex flex-col gap-1 px-2 py-2 outline-none'
                      : sitesHasMore
                        ? `${tileGridClass} pt-4 outline-none xl:px-4 xl:pt-4`
                        : `${tileGridClass} py-4 outline-none xl:p-4`
                  }
                  renderEmptyState={() => null}
                >
                  <ListBoxSection id="sites" className="contents">
                    <SwitcherSectionHeader
                      title={labels.sites}
                      blurb={labels.sitesBlurb}
                      searching={searching}
                      layout={layout}
                      headingClassName="flex flex-col gap-2 ps-0 pt-4 pb-2 xl:ps-4 xl:pt-6"
                      prefersReducedMotion={prefersReducedMotion}
                    />
                    {sitesCollapsed.map((item) => (
                      <SwitcherListBoxItem
                        key={item.id}
                        item={item}
                        layout={layout}
                        selectedId={selectedId}
                        youAreHereLabel={labels.youAreHere}
                        onPreview={onPreview}
                      />
                    ))}
                  </ListBoxSection>
                </ListBox>
                {sitesHasMore ? (
                  <>
                    <ExpandableTileRest
                      expanded={sitesExpanded}
                      prefersReducedMotion={prefersReducedMotion}
                    >
                      <ListBox
                        aria-label={labels.sites}
                        aria-hidden={!sitesExpanded}
                        layout="grid"
                        orientation="vertical"
                        selectionMode="none"
                        escapeKeyBehavior="none"
                        shouldFocusOnHover
                        onAction={onAction}
                        className={`${tileGridClass} pt-4 outline-none xl:px-4`}
                        renderEmptyState={() => null}
                      >
                        {sitesRest.map((item) => (
                          <SwitcherListBoxItem
                            key={item.id}
                            item={item}
                            layout={layout}
                            selectedId={selectedId}
                            youAreHereLabel={labels.youAreHere}
                            onPreview={onPreview}
                          />
                        ))}
                      </ListBox>
                    </ExpandableTileRest>
                    <div className="relative z-10 pt-2">
                      <ViewMore
                        expanded={sitesExpanded}
                        onToggle={onToggleSites}
                        prefersReducedMotion={prefersReducedMotion}
                        viewMore={labels.viewMore}
                        viewLess={labels.viewLess}
                      />
                    </div>
                  </>
                ) : null}
              </div>
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
  const [appsExpanded, setAppsExpanded] = useState(false);
  const [sitesExpanded, setSitesExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const listBoxRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const pendingCaretRef = useRef<number | null>(null);
  const pendingScrollRef = useRef<string | null>(null);

  if (initialId !== trackedInitialId) {
    setTrackedInitialId(initialId);
    setSelectedId(initialId);
    setQuery('');
    setFilter('all');
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.length !== 1) return;
      if (isTextEntryTarget(event.target)) return;
      if (
        event.key === ' ' &&
        event.target instanceof Element &&
        event.target.closest('button, a, [role="button"], [role="link"]')
      ) {
        return;
      }

      const panel = panelRef.current;
      if (!panel || panel.closest('[inert]')) return;

      const input = visibleSearchInput([mobileSearchRef.current, desktopSearchRef.current]);
      if (!input) return;

      event.preventDefault();
      input.focus();
      const next = input.value + event.key;
      pendingCaretRef.current = next.length;
      setQuery(next);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
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
  const collapsedCount = useCollapsedTileCount();
  const layout: 'grid' | 'list' = filter === 'all' ? 'grid' : 'list';
  const columns = layout === 'list' ? 1 : collapsedCount;
  const searching = Boolean(q);
  const { navigable, navigableAppCount } = useMemo(() => {
    const shownApps =
      filter === 'sites'
        ? []
        : visibleSwitcherItems(filteredApps, collapsedCount, appsExpanded, searching, layout);
    const shownSites =
      filter === 'apps' || sites.length === 0
        ? []
        : visibleSwitcherItems(filteredSites, collapsedCount, sitesExpanded, searching, layout);
    return {
      navigable: [...shownApps, ...shownSites],
      navigableAppCount: shownApps.length,
    };
  }, [
    appsExpanded,
    collapsedCount,
    filter,
    filteredApps,
    filteredSites,
    layout,
    searching,
    sites.length,
    sitesExpanded,
  ]);

  const activeSelectedId =
    navigable.length === 0 || navigable.some((item) => item.id === selectedId)
      ? selectedId
      : (navigable[0]?.id ?? selectedId);
  const selected = allItems.find((item) => item.id === activeSelectedId) ?? apps[0] ?? sites[0];

  useEffect(() => {
    const id = pendingScrollRef.current;
    if (!id) return;
    pendingScrollRef.current = null;
    const node = scrollRef.current?.querySelector(`[data-switcher-item="${CSS.escape(id)}"]`);
    if (node instanceof HTMLElement) node.scrollIntoView({ block: 'nearest' });
  }, [activeSelectedId, filter, query]);

  const applyFilter = (next: AppSwitcherFilter) => {
    setFilter(next);
    const nextLayout = next === 'all' ? 'grid' : 'list';
    const shownApps =
      next === 'sites'
        ? []
        : visibleSwitcherItems(filteredApps, collapsedCount, appsExpanded, searching, nextLayout);
    const shownSites =
      next === 'apps' || sites.length === 0
        ? []
        : visibleSwitcherItems(filteredSites, collapsedCount, sitesExpanded, searching, nextLayout);
    const first = shownApps[0] ?? shownSites[0];
    if (!first) return;
    pendingScrollRef.current = first.id;
    setSelectedId(first.id);
  };

  useEffect(() => {
    const list = scrollRef.current;
    if (!list) return;

    const updateScrollFade = () => {
      const maxFade = Math.min(69, Math.floor(list.clientHeight / 2));
      const remaining = list.scrollHeight - list.clientHeight - list.scrollTop;
      const top = Math.round(Math.min(Math.max(list.scrollTop, 0), maxFade));
      const bottom = Math.round(Math.min(Math.max(remaining, 0), maxFade));
      if (top < 1 && bottom < 1) {
        list.style.removeProperty('mask-image');
        list.style.removeProperty('-webkit-mask-image');
        return;
      }

      const image = `linear-gradient(to bottom, transparent, #000 ${top}px, #000 calc(100% - ${bottom}px), transparent)`;
      list.style.setProperty('mask-image', image);
      list.style.setProperty('-webkit-mask-image', image);
    };

    updateScrollFade();
    list.addEventListener('scroll', updateScrollFade, { passive: true });

    const resizes = new ResizeObserver(updateScrollFade);
    resizes.observe(list);
    const content = list.firstElementChild;
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.removedNodes) {
          if (node instanceof Element) resizes.unobserve(node);
        }
        for (const node of record.addedNodes) {
          if (node instanceof Element) resizes.observe(node);
        }
      }
      updateScrollFade();
    });
    if (content) {
      for (const child of content.children) resizes.observe(child);
      mutations.observe(content, { childList: true });
    }

    return () => {
      list.removeEventListener('scroll', updateScrollFade);
      resizes.disconnect();
      mutations.disconnect();
    };
  }, []);

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
      if (target instanceof Element && target.closest('[role="menu"]')) return;
      // View more lives outside the listboxes so Tab can reach it. Arrow keys still
      // move across apps/sites via navigable order (including while an option is focused).
      const inSwitcherOption =
        target instanceof Element && target.closest('[role="listbox"], [role="option"]');

      const input = visibleSearchInput([mobileSearchRef.current, desktopSearchRef.current]);
      const inSearch = target === input;
      const inTextEntry = isTextEntryTarget(target);
      const arrow =
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight';

      if (arrow) {
        if (navigable.length === 0) return;
        // Keep Left/Right for caret movement while typing in search (or any text field).
        if (inTextEntry && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        const rtl = getComputedStyle(panel).direction === 'rtl';
        const current = navigable.findIndex((item) => item.id === activeSelectedId);
        const index = current < 0 ? 0 : current;
        const nextIndex = nextSwitcherIndex({
          index,
          key: event.key,
          columns,
          length: navigable.length,
          appCount: navigableAppCount,
          layout,
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
      if (
        !inSearch &&
        target instanceof Element &&
        target.closest(
          'button, a, [role="button"], [role="link"], [role="menuitem"], [role="menuitemradio"]',
        )
      ) {
        return;
      }
      const item = navigable.find((entry) => entry.id === activeSelectedId) ?? navigable[0];
      if (!item) return;
      event.preventDefault();
      activateItem(item);
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [
    activateItem,
    activeSelectedId,
    columns,
    focusSwitcherOption,
    layout,
    navigable,
    navigableAppCount,
  ]);

  if (!selected) return null;

  return (
    <div
      ref={panelRef}
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-6 pt-4 pb-6 xl:flex-row xl:gap-6 xl:px-12 xl:pt-8 xl:pb-12"
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

        <div className="xl:border-base-muted flex min-h-0 flex-1 flex-col overflow-hidden xl:rounded-[32px] xl:border xl:p-4">
          <div className="hidden shrink-0 xl:block">
            <SearchFilterRow
              inputRef={desktopSearchRef}
              query={query}
              onQueryChange={setQuery}
              filter={filter}
              onFilterChange={applyFilter}
              labels={labels}
            />
          </div>
          <div
            ref={scrollRef}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
          >
            <SearchResults
              listBoxRef={listBoxRef}
              query={query.trim()}
              searching={searching}
              filter={filter}
              apps={filter === 'sites' ? [] : filteredApps}
              sites={filter === 'apps' ? [] : filteredSites}
              showSites={filter !== 'apps' && sites.length > 0}
              appsExpanded={appsExpanded}
              sitesExpanded={sitesExpanded}
              onToggleApps={() => setAppsExpanded((value) => !value)}
              onToggleSites={() => setSitesExpanded((value) => !value)}
              selectedId={activeSelectedId}
              labels={labels}
              prefersReducedMotion={prefersReducedMotion}
              onPreview={setSelectedId}
              onActivate={activateItem}
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
