'use client';
import { useEffect, useRef, useState } from 'react';
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { Button } from '@veli-design/react/button';
import { Search } from '@veli-design/react/search';
import { useFilterBar } from './root';
import { useFilterBarMobile } from './mobile';
export interface FilterBarSearchProps {
  label: string;
  closeLabel: string;
  placeholder?: string;
  /** Layout width of the expanded block-owned wrapper. */
  className?: string;
}
export function FilterBarSearch({
  label,
  closeLabel,
  placeholder,
  className = 'w-64 max-[600px]:w-0 max-[600px]:flex-1',
}: FilterBarSearchProps) {
  const { value, setQuery, isDisabled, setPanelOpen } = useFilterBar();
  const mobile = useFilterBarMobile();
  const [searchOpen, setSearchOpen] = useState(Boolean(value.query));
  const searchVisible = mobile || searchOpen || Boolean(value.query);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const restoreSearchFocus = useRef(false);
  useEffect(() => {
    if (!mobile && searchVisible && searchOpen) {
      const frame = requestAnimationFrame(() => searchRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    } else if (!searchVisible && restoreSearchFocus.current) {
      // Let inert changes settle before returning focus during collapse.
      const frame = requestAnimationFrame(() => {
        searchTriggerRef.current?.focus();
        restoreSearchFocus.current = false;
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [mobile, searchVisible, searchOpen]);

  const closeSearch = () => {
    if (value.query) setQuery('');
    else if (!mobile) {
      restoreSearchFocus.current = true;
      setSearchOpen(false);
    }
  };
  return (
    <div
      data-filter-search
      data-expanded={searchVisible}
      className={`relative min-w-0 shrink-0 max-w-full transition-[width] duration-normal ease-out motion-reduce:transition-none ${mobile ? 'w-0 flex-1' : searchVisible ? className : 'w-11'}`}
    >
      <span
        inert={searchVisible}
        aria-hidden={searchVisible}
        className={`absolute inset-y-0 end-0 flex items-center transition-opacity duration-fast ease-out motion-reduce:transition-none ${searchVisible ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      >
        <Button
          ref={searchTriggerRef}
          intent="secondary"
          appearance="transparent"
          size="md"
          iconOnly
          aria-label={label}
          aria-expanded={searchVisible}
          isDisabled={isDisabled}
          onPress={() => {
            setPanelOpen(false);
            setSearchOpen(true);
          }}
        >
          <MagnifyingGlassIcon aria-hidden weight="bold" className="size-4" />
        </Button>
      </span>
      <div
        inert={!searchVisible}
        aria-hidden={!searchVisible}
        className={`flex w-full min-w-0 items-center gap-1 transition-opacity duration-normal ease-out motion-reduce:transition-none ${searchVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <div className="min-w-0 flex-1">
          <Search
            ref={searchRef}
            aria-label={label}
            placeholder={placeholder ?? label}
            appearance="outline"
            value={value.query}
            onChange={setQuery}
            onFocus={() => setSearchOpen(true)}
            isDisabled={isDisabled}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                closeSearch();
              }
            }}
          />
        </div>
        {!mobile && !value.query ? (
          <Button
            intent="secondary"
            appearance="ghost"
            size="sm"
            iconOnly
            aria-label={closeLabel}
            onPress={closeSearch}
          >
            <XIcon aria-hidden className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
