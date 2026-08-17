import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { MagnifyingGlass } from 'phosphor-react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Kbd } from '@tradenetcorp/veli-ui/kbd';

const searchTriggerSelector = 'button[aria-label="Search documentation"]';
const loadDocsSearchDialog = () => import('./DocsSearchDialog');
const DocsSearchDialog = lazy(loadDocsSearchDialog);

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

function getShortcutModifier() {
  if (typeof navigator === 'undefined') return '⌘';

  const navigatorWithUserAgentData = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const platform = navigatorWithUserAgentData.userAgentData?.platform ?? navigator.userAgent;
  return /Mac|iPhone|iPad|iPod/.test(platform) ? '⌘' : 'Ctrl';
}

export function DocsSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRenderDialog, setShouldRenderDialog] = useState(false);
  const [shortcutModifier] = useState(getShortcutModifier);

  const openSearch = useCallback(() => {
    setShouldRenderDialog(true);
    setIsOpen(true);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => setIsOpen(open), []);

  useEffect(() => {
    const trigger = document.querySelector<HTMLButtonElement>(searchTriggerSelector);
    trigger?.setAttribute('aria-haspopup', 'dialog');
    trigger?.setAttribute('aria-keyshortcuts', 'Meta+K Control+K');

    return () => {
      trigger?.removeAttribute('aria-haspopup');
      trigger?.removeAttribute('aria-keyshortcuts');
    };
  }, []);

  useEffect(() => {
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
  }, [openSearch]);

  return (
    <>
      <Button
        className="docs-search-trigger"
        intent="secondary"
        appearance="ghost"
        size="sm"
        aria-label="Search documentation"
        aria-expanded={isOpen}
        onPress={openSearch}
        onMouseEnter={() => void loadDocsSearchDialog()}
        onFocus={() => void loadDocsSearchDialog()}
      >
        <MagnifyingGlass size={16} aria-hidden="true" />
        <span className="docs-search-trigger__label">Search</span>
        <span className="docs-search-trigger__shortcut" aria-hidden="true">
          <Kbd>{shortcutModifier}</Kbd>
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
    </>
  );
}
