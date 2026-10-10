'use client';

import { useSyncExternalStore } from 'react';
import { Button as AriaButton, Radio, RadioGroup, type Selection } from 'react-aria-components';
import {
  CaretDownIcon,
  CheckIcon,
  GlobeSimpleIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from '@phosphor-icons/react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Menu, MenuItem, MenuPopover, MenuTrigger } from '@tradenetcorp/veli-ui/menu';

export type SiteHeaderColorScheme = 'light' | 'dark' | 'system';
export type SiteHeaderThemeOption = 'light' | 'dark' | 'auto';

export type SiteHeaderLanguageOption = {
  id: string;
  label: string;
  dir?: 'ltr' | 'rtl';
};

export type SiteHeaderControlsLabels = {
  languageLabel: string;
  languageChange: string;
  themeLabel: string;
  themeLight: string;
  themeDark: string;
  themeAuto: string;
};

/** Hide Veli MenuItem's left selection check so we can place it via `endIcon`. */
const menuItemCheckEndClassName = '[&>div>span:first-child]:hidden';

function menuSelectionEndIcon(isSelected: boolean) {
  return isSelected ? (
    <CheckIcon size={16} weight="regular" className="text-icon-primary" aria-hidden />
  ) : undefined;
}

function subscribeDir(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
  return () => observer.disconnect();
}

function getDir() {
  return document.documentElement.dir === 'rtl' ? -1 : 1;
}

function useInlineDirection() {
  return useSyncExternalStore(subscribeDir, getDir, () => 1);
}

export function themeOptionFromScheme(scheme: SiteHeaderColorScheme): SiteHeaderThemeOption {
  if (scheme === 'system') return 'auto';
  return scheme;
}

export function schemeFromThemeOption(option: SiteHeaderThemeOption): SiteHeaderColorScheme {
  if (option === 'auto') return 'system';
  return option;
}

export function HeaderLanguageMenu({
  languages,
  language,
  onLanguageChange,
  labels,
  isDisabled,
  variant = 'icon',
}: {
  languages: SiteHeaderLanguageOption[];
  language: string;
  onLanguageChange: (id: string) => void;
  labels: Pick<SiteHeaderControlsLabels, 'languageLabel' | 'languageChange'>;
  isDisabled?: boolean;
  variant?: 'banner' | 'icon' | 'pill';
}) {
  const onLanguageSelectionChange = (keys: Selection) => {
    if (keys === 'all') return;
    const id = [...keys][0];
    if (typeof id !== 'string') return;
    onLanguageChange(id);
  };

  const isPill = variant === 'pill';
  const isBanner = variant === 'banner';
  const selected = languages.find((entry) => entry.id === language) ?? languages[0];
  const selectedDir = selected?.dir ?? 'ltr';

  return (
    <MenuTrigger>
      {isPill ? (
        <AriaButton
          className="bg-surface-base type-body-sm-medium text-text-base-strong focus-visible:ring-border-focus flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 focus-visible:ring-2 focus-visible:outline-none"
          aria-label={labels.languageChange}
        >
          <GlobeSimpleIcon size={16} weight="regular" aria-hidden />
          <span className="tracking-[0.3px]">{selected?.label}</span>
        </AriaButton>
      ) : isBanner ? (
        <AriaButton
          className="type-caption-medium text-text-links focus-visible:ring-border-focus flex h-4 cursor-pointer items-center gap-1 rounded-lg bg-transparent leading-4 focus-visible:ring-2 focus-visible:outline-none"
          aria-label={labels.languageChange}
        >
          <span
            lang="en"
            dir="ltr"
            className={`flex h-4 items-center leading-4 ${
              selectedDir === 'rtl' ? 'translate-y-[3px]' : ''
            }`}
          >
            {language.toUpperCase()}
          </span>
          <span
            className={`flex size-4 shrink-0 items-center justify-center ${
              selectedDir === 'rtl' ? '-translate-y-px' : ''
            }`}
            aria-hidden
          >
            <CaretDownIcon className="block" size={12} weight="regular" />
          </span>
        </AriaButton>
      ) : (
        <Button
          intent="secondary"
          appearance="transparent"
          size="md"
          iconOnly
          aria-label={labels.languageChange}
          isDisabled={isDisabled}
        >
          <GlobeSimpleIcon size={16} weight="regular" aria-hidden />
        </Button>
      )}
      <MenuPopover
        placement={isPill ? 'top end' : 'bottom end'}
        className={isPill || isBanner ? 'z-70' : undefined}
      >
        <Menu
          aria-label={labels.languageLabel}
          selectionMode="single"
          selectedKeys={new Set([language])}
          onSelectionChange={onLanguageSelectionChange}
          disallowEmptySelection
        >
          {languages.map(({ id, label, dir }) => (
            <MenuItem
              key={id}
              id={id}
              size="sm"
              className={menuItemCheckEndClassName}
              endIcon={menuSelectionEndIcon(language === id)}
            >
              <span lang={id} dir={dir ?? 'ltr'} className="type-body-sm-regular">
                {label}
              </span>
            </MenuItem>
          ))}
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  );
}

/**
 * Theme radio group with a pill that slides behind the selected option.
 * Equal thirds, no gaps — the pill's translateX is index * 100% of its own width.
 */
export function ThemeSegmentedControl({
  selectedTheme,
  onThemeChange,
  labels,
  iconOnly = false,
}: {
  selectedTheme: SiteHeaderThemeOption;
  onThemeChange: (option: SiteHeaderThemeOption) => void;
  labels: Pick<SiteHeaderControlsLabels, 'themeLabel' | 'themeLight' | 'themeDark' | 'themeAuto'>;
  iconOnly?: boolean;
}) {
  const options = [
    { id: 'light' as const, label: labels.themeLight, icon: SunIcon },
    { id: 'dark' as const, label: labels.themeDark, icon: MoonIcon },
    { id: 'auto' as const, label: labels.themeAuto, icon: MonitorIcon },
  ];
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.id === selectedTheme),
  );
  const dirSign = useInlineDirection();

  return (
    <RadioGroup
      aria-label={labels.themeLabel}
      value={selectedTheme}
      onChange={(value) => {
        if (value === 'light' || value === 'dark' || value === 'auto') onThemeChange(value);
      }}
      className="bg-neutral-alpha-200 relative flex items-center rounded-full p-0.5"
    >
      <span
        aria-hidden
        className="bg-button-secondary-subtle absolute start-0.5 top-0.5 bottom-0.5 w-[calc((100%-4px)/3)] rounded-full transition-transform duration-[260ms] ease-[cubic-bezier(0.19,1,0.22,1)]"
        style={{ transform: `translateX(${selectedIndex * 100 * dirSign}%)` }}
      />
      {options.map(({ id, label, icon: Icon }) => (
        <Radio
          key={id}
          value={id}
          aria-label={label}
          className={({ isSelected }) =>
            `relative z-[1] flex cursor-pointer items-center justify-center transition-colors duration-200 ${
              iconOnly
                ? 'h-8 w-10 rounded-full'
                : 'type-body-sm-medium h-10 flex-1 gap-1.5 rounded-full'
            } ${isSelected ? 'text-text-base-strong' : 'text-text-base'}`
          }
        >
          <Icon size={16} weight="regular" aria-hidden />
          {!iconOnly && <span>{label}</span>}
        </Radio>
      ))}
    </RadioGroup>
  );
}
