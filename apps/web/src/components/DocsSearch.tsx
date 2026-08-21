import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Command, MagnifyingGlass } from 'phosphor-react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Kbd } from '@tradenetcorp/veli-ui/kbd';

const loadDocsSearchDialog = () => import('./DocsSearchDialog');
const DocsSearchDialog = lazy(loadDocsSearchDialog);

type DocsSearchProps = {
  enableShortcut?: boolean;
};

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

export function DocsSearch({ enableShortcut = true }: DocsSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRenderDialog, setShouldRenderDialog] = useState(false);

  const openSearch = useCallback(() => {
    setShouldRenderDialog(true);
    setIsOpen(true);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => setIsOpen(open), []);

  useEffect(() => {
    if (!enableShortcut) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isCommandShortcut =
        event.key.toLocaleLowerCase() === 'k' &&
        event.metaKey !== event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        !event.isComposing &&
        !event.repeat;

      if (!isCommandShortcut || isEditableTarget(event.target)) return;
      if (event.defaultPrevented) return;

      event.preventDefault();
      openSearch();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcut, openSearch]);

  return (
    <div className="docs-search-root">
      <Button
        className="docs-search-trigger"
        intent="secondary"
        appearance="ghost"
        size="sm"
        aria-label="Search documentation"
        aria-haspopup="dialog"
        aria-keyshortcuts={enableShortcut ? 'Meta+K Control+K' : undefined}
        aria-expanded={isOpen}
        onPress={openSearch}
        onMouseEnter={() => void loadDocsSearchDialog()}
        onFocus={() => void loadDocsSearchDialog()}
      >
        <MagnifyingGlass size={20} aria-hidden="true" />
        <span className="docs-search-trigger__label">Search</span>
        <span className="docs-search-trigger__shortcut" aria-hidden="true">
          <Kbd>
            <Command size={12} aria-hidden="true" />
          </Kbd>
          <Kbd>K</Kbd>
        </span>
      </Button>

      {shouldRenderDialog ? (
        <Suspense
          fallback={
            isOpen ? (
              <span className="sr-only" role="status" aria-live="polite">
                Opening documentation search…
              </span>
            ) : null
          }
        >
          <DocsSearchDialog isOpen={isOpen} onOpenChange={handleOpenChange} />
        </Suspense>
      ) : null}
    </div>
  );
}
