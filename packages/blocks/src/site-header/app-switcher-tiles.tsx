import { type ReactNode } from 'react';
import { SignInIcon } from '@phosphor-icons/react';
import { Button as AriaButton } from 'react-aria-components';

/** Fallback when the host has not set --veli-header-site-tile-gradient. */
export const SITE_TILE_GRADIENT_FALLBACK =
  'radial-gradient(circle at 50% 0%, #fbfcfb 0%, #e0e2dd 100%)';

/** Dark-mode fallback when the host has not set --veli-header-site-tile-gradient. */
export const SITE_TILE_GRADIENT_DARK_FALLBACK =
  'radial-gradient(circle at 50% 0%, #0e0e0d 0%, #191a18 50%, #252624 100%)';

/** Fallback when the host has not set --veli-header-govmv-tile-gradient. */
export const GOVMV_TILE_GRADIENT_FALLBACK =
  'radial-gradient(circle at 50% 2%, #5bccca 0%, #47a8a9 25%, #348388 50%, #205f68 75%, #0c3a47 100%)';

/** Fallback when the host has not set --veli-header-info-panel-glow. */
export const INFO_PANEL_GLOW_FALLBACK =
  'radial-gradient(ellipse 100% 80% at 50% 0%, rgb(213 255 211) 0%, rgb(255 255 255 / 0%) 63%)';

/** Dark-mode fallback when the host has not set --veli-header-info-panel-glow. */
export const INFO_PANEL_GLOW_DARK_FALLBACK =
  'radial-gradient(ellipse 236.72% 100% at 50% 0%, rgb(35 115 10) 0%, rgb(18 57 5 / 50%) 31.478%, transparent 62.957%)';

export type SiteHeaderSwitcherSection = {
  title: string;
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
  className = '',
}: {
  children?: ReactNode;
  gradient?: string;
  darkGradient?: string;
  selected?: boolean;
  className?: string;
}) {
  const shellRadius = selected ? 'rounded-[18px]' : 'rounded-[20px]';
  return (
    <div
      className={`relative size-14 shrink-0 rounded-[20px] ${
        selected
          ? 'border-icon-base-inverted border-2 shadow-[0_0_0_2px_var(--veli-color-primary-700)]'
          : ''
      } ${className}`}
    >
      <div
        className={`absolute inset-0 overflow-hidden shadow-[inset_0_0_8px_0_var(--veli-color-effects-shadow-depth-100)] ${shellRadius}`}
      >
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
  if (item.tileGradient || item.emblemSrc) {
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
      <AppIconShell selected={selected}>
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
      <div className="relative size-[95px] shrink-0 overflow-hidden rounded-4xl shadow-md">
        <DualToneFill light={item.largeIconSrc} dark={item.largeIconDarkSrc} />
      </div>
    );
  }

  if (item.emblemSrc) {
    return (
      <span
        className="block size-[95px] shrink-0 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${item.emblemSrc}')` }}
        aria-hidden
      />
    );
  }

  if (item.iconSrc) {
    return (
      <div className="relative size-[95px] shrink-0 overflow-hidden rounded-4xl shadow-md">
        <DualToneFill light={item.iconSrc} dark={item.iconDarkSrc} />
      </div>
    );
  }

  return (
    <div
      className="relative flex size-[95px] items-center justify-center rounded-4xl shadow-md"
      style={{
        backgroundImage: `var(--veli-header-govmv-tile-gradient, ${GOVMV_TILE_GRADIENT_FALLBACK})`,
      }}
    />
  );
}

const tileGridClass =
  'grid grid-cols-3 gap-x-2 gap-y-4 md:grid-cols-4 xl:grid-cols-5 xl:gap-x-14 xl:gap-y-4';

export function ItemTile({
  item,
  selected,
  youAreHereLabel,
  onPreview,
  onActivate,
}: {
  item: SiteHeaderSwitcherItem;
  selected: boolean;
  youAreHereLabel: string;
  onPreview: () => void;
  onActivate?: () => void;
}) {
  const isCurrent = Boolean(item.current);
  const isHover = selected && !isCurrent;
  const className = `flex min-h-[132px] w-full cursor-pointer flex-col items-center gap-1 px-1 py-4 text-center transition-colors duration-150 ease-[var(--veli-header-ease-drawer,cubic-bezier(0.32,0.72,0,1))] xl:rounded-[28px] ${
    isHover ? 'xl:bg-surface-base' : 'xl:bg-transparent'
  }`;

  const body = (
    <>
      <TileIconWithBadge item={item} selected={isCurrent} />
      <p
        className={`type-body-sm-medium text-text-base w-full max-w-28 ${
          item.kind === 'site' ? 'line-clamp-2' : 'truncate'
        }`}
      >
        {item.name}
      </p>
      {isCurrent ? (
        <span className="type-caption-medium bg-status-info-subtle text-text-primary-strong w-full max-w-28 rounded-3xl px-1.5 py-0.5 text-center tracking-[0.18px]">
          {youAreHereLabel}
        </span>
      ) : null}
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        onMouseEnter={onPreview}
        onFocus={onPreview}
        className={`${className} no-underline`}
      >
        {body}
      </a>
    );
  }

  return (
    <AriaButton
      onHoverStart={onPreview}
      onFocus={onPreview}
      onPress={onActivate}
      aria-pressed={selected}
      className={className}
    >
      {body}
    </AriaButton>
  );
}

export function TileGrid({
  items,
  selectedId,
  youAreHereLabel,
  onPreview,
  onActivate,
}: {
  items: SiteHeaderSwitcherItem[];
  selectedId: string;
  youAreHereLabel: string;
  onPreview: (id: string) => void;
  onActivate: (item: SiteHeaderSwitcherItem) => void;
}) {
  return (
    <div className={tileGridClass}>
      {items.map((item) => (
        <ItemTile
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          youAreHereLabel={youAreHereLabel}
          onPreview={() => onPreview(item.id)}
          onActivate={() => onActivate(item)}
        />
      ))}
    </div>
  );
}

export { tileGridClass };
