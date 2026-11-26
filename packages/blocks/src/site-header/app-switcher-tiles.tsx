import { type ReactNode } from 'react';
import { SignInIcon } from '@phosphor-icons/react';

/** Fallback when the host has not set --veli-header-site-tile-gradient. */
export const SITE_TILE_GRADIENT_FALLBACK =
  'radial-gradient(circle at 50% 0%, rgb(155 180 155 / 0.04) 0%, rgb(44 66 11 / 0.09) 100%)';

/** Dark-mode fallback when the host has not set --veli-header-site-tile-gradient. */
export const SITE_TILE_GRADIENT_DARK_FALLBACK =
  'radial-gradient(circle at 50% 0%, rgb(14 14 13 / 0.4) 0%, rgb(37 38 36 / 0.55) 100%)';

/** Fallback when the host has not set --veli-header-govmv-tile-gradient. */
export const GOVMV_TILE_GRADIENT_FALLBACK =
  'radial-gradient(circle at 50% 2%, #5bccca 0%, #47a8a9 25%, #348388 50%, #205f68 75%, #0c3a47 100%)';

/**
 * Fallback when the host has not set --veli-header-info-panel-glow.
 * Uses green-200 so light (#d5ffd3) and dark (#071900) track the document theme.
 */
export const INFO_PANEL_GLOW_FALLBACK =
  'linear-gradient(to bottom, var(--veli-color-green-200) 0%, transparent 32.5%)';

export type SiteHeaderSwitcherSection = {
  title: string;
  body: string;
};

/** Bold lead-in + body for info-card paragraphs (Gov.mv handoff layout). */
export type SiteHeaderSwitcherInfoParagraph = {
  leadIn: string;
  body: string;
};

export type SiteHeaderSwitcherItem = {
  id: string;
  name: string;
  kind: 'app' | 'site';
  href: string;
  description: string;
  external?: boolean;
  /** Marks the tile the user is currently on ("You are here"). */
  current?: boolean;
  /**
   * Optional corner badge on the tile icon. Use `signin` when the destination
   * requires authentication (matches gov.mv Site Directory). Independent of
   * `current` — do not set both for the same tile in normal product data.
   */
  badge?: 'signin';
  /** Light-mode tile artwork URL. */
  iconSrc?: string;
  /** Dark-mode tile artwork URL; falls back to iconSrc. */
  iconDarkSrc?: string;
  /** Optional larger artwork for the info panel. */
  largeIconSrc?: string;
  largeIconDarkSrc?: string;
  /** Optional gradient for a solid emblem tile (CSS background-image value). */
  tileGradient?: string;
  /** Emblem overlay URL used with tileGradient (ministry-style tiles). */
  emblemSrc?: string;
  sections?: SiteHeaderSwitcherSection[];
  /**
   * When set, the info card shows these paragraphs (bold lead-in + body) instead
   * of the title, description, and sections layout.
   */
  infoParagraphs?: SiteHeaderSwitcherInfoParagraph[];
  /**
   * Host-supplied search text keyed by language id (`en`, `dv`, or a BCP-47 tag
   * such as `dv-MV`). When present, search uses only the active language's entry
   * and never falls back to another language or to `name`. Omit the active
   * language (or pass an empty string / empty list) when that language has no
   * searchable label — in Dhivehi mode the item then matches nothing instead of
   * silently matching its English name. Intentionally Latin labels shown in
   * Dhivehi (for example `Gov.mv`) belong under the `dv` entry. When the map is
   * omitted entirely, English mode still matches `name`; Dhivehi mode matches
   * nothing.
   */
  searchNames?: Partial<Record<string, string | readonly string[]>>;
};

function SignInBadge() {
  return (
    <span className="bg-status-neutral-emphasis col-start-1 row-start-1 ms-9 mt-0 flex rounded-xl p-1 text-white shadow-sm">
      <SignInIcon size={12} weight="bold" aria-hidden />
    </span>
  );
}

function TileIconWithBadge({
  item,
  selected,
}: {
  item: SiteHeaderSwitcherItem;
  selected?: boolean;
}) {
  const icon = <SwitcherTileIcon item={item} selected={selected} />;
  if (item.badge !== 'signin') return icon;
  return (
    <span className="relative inline-grid size-14 place-items-start">
      <span className="col-start-1 row-start-1">{icon}</span>
      <SignInBadge />
    </span>
  );
}

function AppIconShell({
  children = null,
  gradient,
  darkGradient,
  selected,
  /** Full-bleed artwork already includes fill and corners; skip inset depth. */
  artwork = false,
  className = '',
}: {
  children?: ReactNode;
  gradient?: string;
  darkGradient?: string;
  selected?: boolean;
  artwork?: boolean;
  className?: string;
}) {
  // Current-app ring: primary/700 only — no white gap stroke on the artwork.
  const chrome = selected
    ? 'overflow-visible shadow-[0_0_0_3px_var(--veli-color-primary-700)]'
    : '';
  const depth = artwork
    ? ''
    : 'shadow-[inset_0_0_8px_0_var(--veli-color-effects-shadow-depth-100)]';
  return (
    <div className={`relative size-14 shrink-0 rounded-[20px] ${chrome} ${className}`}>
      <div className={`absolute inset-0 overflow-hidden rounded-[20px] ${depth}`}>
        {gradient && darkGradient ? (
          <>
            <span
              className="absolute inset-0 dark:hidden"
              style={{ backgroundImage: gradient }}
              aria-hidden
            />
            <span
              className="absolute inset-0 hidden dark:block"
              style={{ backgroundImage: darkGradient }}
              aria-hidden
            />
          </>
        ) : gradient ? (
          <span className="absolute inset-0" style={{ backgroundImage: gradient }} aria-hidden />
        ) : null}
        {children}
      </div>
    </div>
  );
}

function DualToneFill({ light, dark }: { light: string; dark?: string }) {
  return (
    <>
      <span
        className="absolute inset-0 bg-cover bg-center dark:hidden"
        style={{ backgroundImage: `url('${light}')` }}
        aria-hidden
      />
      <span
        className="absolute inset-0 hidden bg-cover bg-center dark:block"
        style={{ backgroundImage: `url('${dark ?? light}')` }}
        aria-hidden
      />
    </>
  );
}

export function SwitcherTileIcon({
  item,
  selected,
}: {
  item: SiteHeaderSwitcherItem;
  selected?: boolean;
}) {
  const useSiteShell = item.kind === 'site' || Boolean(item.tileGradient || item.emblemSrc);

  if (useSiteShell) {
    const gradient = item.tileGradient;
    return (
      <AppIconShell
        gradient={
          gradient ?? `var(--veli-header-site-tile-gradient, ${SITE_TILE_GRADIENT_FALLBACK})`
        }
        darkGradient={
          gradient
            ? undefined
            : `var(--veli-header-site-tile-gradient, ${SITE_TILE_GRADIENT_DARK_FALLBACK})`
        }
        selected={selected}
      >
        {item.emblemSrc ? (
          <span
            className="absolute start-2.5 top-[7px] block h-[42px] w-9 bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${item.emblemSrc}')` }}
            aria-hidden
          />
        ) : null}
      </AppIconShell>
    );
  }

  if (item.iconSrc) {
    return (
      <AppIconShell selected={selected} artwork>
        <DualToneFill light={item.iconSrc} dark={item.iconDarkSrc} />
      </AppIconShell>
    );
  }

  return (
    <AppIconShell
      gradient={`var(--veli-header-govmv-tile-gradient, ${GOVMV_TILE_GRADIENT_FALLBACK})`}
      selected={selected}
    />
  );
}

export function SwitcherLargeIcon({ item }: { item: SiteHeaderSwitcherItem }) {
  if (item.largeIconSrc) {
    return (
      <div className="relative size-[88px] shrink-0 overflow-hidden rounded-[28px]">
        <DualToneFill light={item.largeIconSrc} dark={item.largeIconDarkSrc} />
      </div>
    );
  }

  if (item.emblemSrc) {
    return (
      <span
        className="block h-[88px] w-[76px] shrink-0 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${item.emblemSrc}')` }}
        aria-hidden
      />
    );
  }

  if (item.iconSrc) {
    return (
      <div className="relative size-[88px] shrink-0 overflow-hidden rounded-[28px]">
        <DualToneFill light={item.iconSrc} dark={item.iconDarkSrc} />
      </div>
    );
  }

  if (item.kind === 'site') {
    return (
      <div
        className="relative size-[88px] shrink-0 overflow-hidden rounded-[28px]"
        style={{
          backgroundImage: `var(--veli-header-site-tile-gradient, ${SITE_TILE_GRADIENT_FALLBACK})`,
        }}
      />
    );
  }

  return (
    <div
      className="relative flex size-[88px] items-center justify-center rounded-[28px]"
      style={{
        backgroundImage: `var(--veli-header-govmv-tile-gradient, ${GOVMV_TILE_GRADIENT_FALLBACK})`,
      }}
    />
  );
}

/** Two fluid columns below sm, three fluid columns from sm until xl, then 165px tracks. */
const tileGridClass =
  'grid grid-cols-2 items-start gap-2 sm:grid-cols-3 xl:grid-cols-[repeat(auto-fill,165px)] xl:justify-between xl:gap-x-1 xl:gap-y-2';

/** Presentational tile chrome for a ListBoxItem. */
export function SwitcherItemContent({
  item,
  youAreHereLabel,
}: {
  item: SiteHeaderSwitcherItem;
  youAreHereLabel: string;
}) {
  const isCurrent = Boolean(item.current);

  return (
    <>
      <TileIconWithBadge item={item} selected={isCurrent} />
      <p className="type-caption-medium text-text-base w-full xl:max-w-[141px]">{item.name}</p>
      {isCurrent ? (
        <span className="type-caption-medium bg-status-info-subtle text-text-primary-strong rounded-3xl px-1.5 py-0.5 text-center tracking-[0.18px] whitespace-nowrap">
          {youAreHereLabel}
        </span>
      ) : null}
    </>
  );
}

export function switcherItemClassName(highlighted: boolean) {
  return `flex w-full xl:w-[165px] cursor-pointer flex-col items-center gap-1.5 rounded-[28px] p-3 text-center outline-none no-underline transition-colors duration-150 ease-[var(--veli-header-ease-drawer,cubic-bezier(0.32,0.72,0,1))] ${
    highlighted ? 'bg-neutral-alpha-200' : 'bg-transparent'
  }`;
}

export { tileGridClass };
