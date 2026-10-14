'use client';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type Ref,
} from 'react';
import { CaretDownIcon, FunnelSimpleIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Divider } from '@tradenetcorp/veli-ui/divider';
import { Search } from '@tradenetcorp/veli-ui/search';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';

import {
  INFO_PANEL_GLOW_DARK_FALLBACK,
  INFO_PANEL_GLOW_FALLBACK,
  ItemTile,
  SwitcherLargeIcon,
  TileGrid,
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
  searchSummary: (
    query: string,
    appCount: number,
    siteCount: number,
  ) => { countLabel: string; rest: string };
  noAppsMatch: (query: string) => string;
  noSitesMatch: (query: string) => string;
  noAppsOrSitesMatch: (query: string) => string;
};

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
    <div className="flex w-full items-center justify-center gap-2.5 px-4 py-1">
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

type SearchResultMotion = ReturnType<typeof searchResultMotion>;

function SearchTileGrid({
  items,
  selectedId,
  youAreHereLabel,
  onPreview,
  onActivate,
  resultMotion,
}: {
  items: SiteHeaderSwitcherItem[];
  selectedId: string;
  youAreHereLabel: string;
  onPreview: (id: string) => void;
  onActivate: (item: SiteHeaderSwitcherItem) => void;
  resultMotion: SearchResultMotion;
}) {
  return (
    <div className={`${tileGridClass} relative`}>
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map((item) => (
          <motion.div key={item.id} className="min-w-0" {...resultMotion}>
            <ItemTile
              item={item}
              selected={selectedId === item.id}
              youAreHereLabel={youAreHereLabel}
              onPreview={() => onPreview(item.id)}
              onActivate={() => onActivate(item)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function SearchMatchGroup({
  ref,
  title,
  blurb,
  searching,
  expanded,
  onToggleExpanded,
  headingClassName,
  items,
  selectedId,
  youAreHereLabel,
  viewMore,
  viewLess,
  onPreview,
  onActivate,
  prefersReducedMotion,
  resultMotion,
}: {
  ref?: Ref<HTMLDivElement>;
  title: string;
  blurb: string;
  searching: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
  headingClassName: string;
  items: SiteHeaderSwitcherItem[];
  selectedId: string;
  youAreHereLabel: string;
  viewMore: string;
  viewLess: string;
  onPreview: (id: string) => void;
  onActivate: (item: SiteHeaderSwitcherItem) => void;
  prefersReducedMotion: boolean | null;
  resultMotion: SearchResultMotion;
}) {
  const collapsedCount = useCollapsedTileCount();
  const hasMore = !searching && items.length > collapsedCount;
  const shown = searching ? items : items.slice(0, collapsedCount);
  const rest = items.slice(collapsedCount);
  const showRest = hasMore && expanded;

  return (
    <motion.div ref={ref} className="flex flex-col" {...resultMotion}>
      <div className={`relative ${searching ? 'ps-0 pt-6 pb-2 xl:ps-4' : headingClassName}`}>
        <p
          className={
            searching
              ? 'type-body-md-semibold text-text-base-strong'
              : 'type-subtitle-semibold text-text-base-strong xl:type-body-md-medium'
          }
        >
          {title}
        </p>
        <AnimatePresence mode="popLayout" initial={false}>
          {!searching ? (
            <motion.p
              key="blurb"
              className="type-body-sm-regular text-text-base hidden xl:block"
              {...resultMotion}
            >
              {blurb}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
      <div className="py-4 xl:p-4">
        <SearchTileGrid
          items={shown}
          selectedId={selectedId}
          youAreHereLabel={youAreHereLabel}
          onPreview={onPreview}
          onActivate={onActivate}
          resultMotion={resultMotion}
        />
        {hasMore ? (
          <>
            <div
              className="grid"
              style={{
                gridTemplateRows: showRest ? '1fr' : '0fr',
                transition: prefersReducedMotion
                  ? undefined
                  : `grid-template-rows 300ms ${EASE_DRAWER_CSS}`,
              }}
            >
              <div className="min-h-0 overflow-hidden" inert={!showRest}>
                <TileGrid
                  items={rest}
                  selectedId={selectedId}
                  youAreHereLabel={youAreHereLabel}
                  onPreview={onPreview}
                  onActivate={onActivate}
                />
              </div>
            </div>
            <ViewMore
              expanded={expanded}
              onToggle={onToggleExpanded}
              prefersReducedMotion={prefersReducedMotion}
              viewMore={viewMore}
              viewLess={viewLess}
            />
          </>
        ) : null}
      </div>
    </motion.div>
  );
}

function SearchResults({
  query,
  searching,
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
  query: string;
  searching: boolean;
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
  const appCount = apps.length;
  const siteCount = showSites ? sites.length : 0;
  const total = appCount + siteCount;
  const summary = labels.searchSummary(query, appCount, siteCount);
  const resultMotion = searchResultMotion(prefersReducedMotion);
  const groupProps = {
    selectedId,
    youAreHereLabel: labels.youAreHere,
    viewMore: labels.viewMore,
    viewLess: labels.viewLess,
    onPreview,
    onActivate,
    prefersReducedMotion,
    resultMotion,
    searching,
  };
  const emptyMotion = {
    initial: prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, transform: 'translateY(8px) scale(0.98)' },
    animate: { opacity: 1, transform: 'translateY(0px) scale(1)' },
    exit: { opacity: 0, transition: searchResultExitTransition },
    transition: resultMotion.transition,
  };
  const showApps = !searching || appCount > 0;
  const showSiteGroup = showSites && (!searching || siteCount > 0);
  const noMatches = showSites ? labels.noAppsOrSitesMatch(query) : labels.noAppsMatch(query);
  const announcement = !searching
    ? ''
    : total > 0
      ? `${summary.countLabel}${summary.rest}`
      : noMatches;

  return (
    <LayoutGroup>
      <div className="flex min-h-0 flex-1 flex-col">
        <output className="sr-only" aria-live="polite">
          {announcement}
        </output>
        <AnimatePresence mode="popLayout" initial={false}>
          {searching && total > 0 ? (
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

          {showApps ? (
            <SearchMatchGroup
              key="apps"
              title={labels.apps}
              blurb={labels.appsBlurb}
              expanded={appsExpanded}
              onToggleExpanded={onToggleApps}
              headingClassName="flex flex-col gap-2 ps-0 pt-0 pb-2 xl:ps-4 xl:pt-6"
              items={apps}
              {...groupProps}
            />
          ) : null}
          {showSiteGroup ? (
            <SearchMatchGroup
              key="sites"
              title={labels.sites}
              blurb={labels.sitesBlurb}
              expanded={sitesExpanded}
              onToggleExpanded={onToggleSites}
              headingClassName="flex flex-col gap-2 ps-0 pt-4 pb-2 xl:ps-4 xl:pt-6"
              items={sites}
              {...groupProps}
            />
          ) : null}

          {searching && total > 0 && appCount === 0 ? (
            <motion.p
              key="no-apps"
              className="type-body-sm-medium text-text-base border-border-base-muted border-t ps-0 pt-4 pb-2 xl:ps-4"
              {...resultMotion}
            >
              {labels.noAppsMatch(query)}
            </motion.p>
          ) : null}
          {searching && total > 0 && showSites && siteCount === 0 ? (
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

function SearchFilterRow({
  inputRef,
  query,
  onQueryChange,
  labels,
}: {
  inputRef?: Ref<HTMLInputElement>;
  query: string;
  onQueryChange: (value: string) => void;
  labels: Pick<SiteHeaderAppSwitcherLabels, 'searchAppsAndSites' | 'search' | 'filter'>;
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
        <Button
          intent="secondary"
          appearance="transparent"
          size="md"
          iconOnly
          aria-label={labels.filter}
        >
          <FunnelSimpleIcon size={16} weight="bold" aria-hidden />
        </Button>
      </span>
      <span className="hidden xl:contents">
        <Button intent="secondary" appearance="transparent" size="md">
          <FunnelSimpleIcon size={16} weight="bold" aria-hidden />
          {labels.filter}
        </Button>
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
  const [appsExpanded, setAppsExpanded] = useState(false);
  const [sitesExpanded, setSitesExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const pendingCaretRef = useRef<number | null>(null);

  if (initialId !== trackedInitialId) {
    setTrackedInitialId(initialId);
    setSelectedId(initialId);
    setQuery('');
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
  const selected = allItems.find((item) => item.id === selectedId) ?? apps[0] ?? sites[0];

  const q = query.trim().toLowerCase();
  const filteredApps = apps.filter((item) => !q || item.name.toLowerCase().includes(q));
  const filteredSites = sites.filter((item) => !q || item.name.toLowerCase().includes(q));

  useEffect(() => {
    const list = listRef.current;
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

  const activateItem = (item: SiteHeaderSwitcherItem) => {
    if (item.external) {
      window.location.assign(item.href);
      onClose();
      return;
    }
    onNavigate(item.href);
    onClose();
  };

  if (!selected) return null;

  return (
    <div
      ref={panelRef}
      className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden px-6 pt-4 pb-6 xl:flex-row xl:gap-6 xl:px-12 xl:pt-8 xl:pb-12"
    >
      <div className="flex min-h-0 w-full max-w-[952px] flex-1 flex-col gap-6 xl:shrink-0 xl:gap-4">
        <div className="flex shrink-0 flex-col gap-6 xl:gap-4">
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
              labels={labels}
            />
          </div>
        </div>

        <div className="xl:border-base-muted flex min-h-0 flex-1 flex-col overflow-hidden xl:rounded-[32px] xl:border">
          <div className="hidden shrink-0 xl:block xl:px-5 xl:pt-4">
            <SearchFilterRow
              inputRef={desktopSearchRef}
              query={query}
              onQueryChange={setQuery}
              labels={labels}
            />
          </div>
          <motion.div
            ref={listRef}
            layoutScroll
            className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain xl:px-4 xl:pb-4"
          >
            <SearchResults
              query={query.trim()}
              searching={Boolean(q)}
              apps={filteredApps}
              sites={filteredSites}
              showSites={sites.length > 0}
              appsExpanded={appsExpanded}
              sitesExpanded={sitesExpanded}
              onToggleApps={() => setAppsExpanded((value) => !value)}
              onToggleSites={() => setSitesExpanded((value) => !value)}
              selectedId={selectedId}
              labels={labels}
              prefersReducedMotion={prefersReducedMotion}
              onPreview={setSelectedId}
              onActivate={activateItem}
            />
          </motion.div>
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
                    <h3 className="type-subtitle-semibold text-text-base-strong">
                      {selected.name}
                    </h3>
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
