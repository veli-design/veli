import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Key } from 'react';
import { Autocomplete } from 'react-aria-components';
import { CaretRight, CircleNotch, MagnifyingGlass } from 'phosphor-react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Divider } from '@tradenetcorp/veli-ui/divider';
import { Menu, MenuItem } from '@tradenetcorp/veli-ui/menu';
import { Modal } from '@tradenetcorp/veli-ui/modal';
import { Search } from '@tradenetcorp/veli-ui/search';
import type { DocsSearchItem } from '../lib/docs-search';

type DocsSearchDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const maximumResults = 36;
const maximumSectionsPerPage = 4;

function normalizeSearchText(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
}

function scoreSearchItem(item: DocsSearchItem, normalizedQuery: string, queryTokens: string[]) {
  const pageTitle = normalizeSearchText(item.pageTitle);
  const title = normalizeSearchText(item.title);
  const description = normalizeSearchText(item.description);
  const content = normalizeSearchText(item.content);
  const searchableText = `${pageTitle} ${title} ${description} ${content}`;

  if (!queryTokens.every((token) => searchableText.includes(token))) return null;

  let score = item.kind === 'page' ? 80 : 0;

  if (item.category === 'Components') score += 120;

  if (pageTitle === normalizedQuery) score += 1_200;
  else if (pageTitle.startsWith(normalizedQuery)) score += 900;
  else if (pageTitle.includes(normalizedQuery)) score += 650;

  if (title === normalizedQuery) score += 1_000;
  else if (title.startsWith(normalizedQuery)) score += 760;
  else if (title.includes(normalizedQuery)) score += 560;

  if (description.includes(normalizedQuery)) score += 320;
  if (content.includes(normalizedQuery)) score += 220;

  for (const token of queryTokens) {
    if (title.startsWith(token)) score += 90;
    else if (title.includes(token)) score += 60;
    if (description.includes(token)) score += 30;
    if (content.includes(token)) score += 12;
  }

  return score;
}

function getSearchResults(index: DocsSearchItem[], query: string) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return index
      .filter((item) => item.kind === 'page')
      .sort((first, second) => first.order - second.order);
  }

  const queryTokens = normalizedQuery.split(' ');
  const rankedItems = index
    .flatMap((item) => {
      const score = scoreSearchItem(item, normalizedQuery, queryTokens);
      return score == null ? [] : [{ item, score }];
    })
    .sort((first, second) => second.score - first.score || first.item.order - second.item.order);
  const sectionCounts = new Map<string, number>();
  const results: DocsSearchItem[] = [];

  for (const { item } of rankedItems) {
    if (item.kind === 'section') {
      const pageKey = `${item.category}:${item.pageTitle}`;
      const sectionCount = sectionCounts.get(pageKey) ?? 0;
      if (sectionCount >= maximumSectionsPerPage) continue;
      sectionCounts.set(pageKey, sectionCount + 1);
    }

    results.push(item);
    if (results.length >= maximumResults) break;
  }

  return results;
}

function isDocsSearchItem(value: unknown): value is DocsSearchItem {
  if (!value || typeof value !== 'object') return false;

  const item = value as Partial<DocsSearchItem>;
  return (
    typeof item.id === 'string' &&
    typeof item.href === 'string' &&
    (item.category === 'Foundations' || item.category === 'Components') &&
    (item.kind === 'page' || item.kind === 'section') &&
    typeof item.pageTitle === 'string' &&
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    typeof item.content === 'string' &&
    typeof item.order === 'number'
  );
}

export default function DocsSearchDialog({ isOpen, onOpenChange }: DocsSearchDialogProps) {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<DocsSearchItem[]>([]);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const loadPromiseRef = useRef<Promise<void> | null>(null);

  const loadSearchIndex = useCallback(() => {
    if (loadState === 'loaded') return Promise.resolve();
    if (loadPromiseRef.current) return loadPromiseRef.current;

    setLoadState('loading');
    const loadPromise = fetch('/search-index.json', {
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Search index request failed with ${response.status}`);

        const payload: unknown = await response.json();
        if (!Array.isArray(payload) || !payload.every(isDocsSearchItem)) {
          throw new Error('Search index response was invalid');
        }

        setIndex(payload);
        setLoadState('loaded');
      })
      .catch(() => {
        setLoadState('error');
      })
      .finally(() => {
        loadPromiseRef.current = null;
      });

    loadPromiseRef.current = loadPromise;
    return loadPromise;
  }, [loadState]);

  useEffect(() => {
    if (!isOpen) return;

    void loadSearchIndex();
    const frame = requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [isOpen, loadSearchIndex]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) setQuery('');
      onOpenChange(open);
    },
    [onOpenChange],
  );

  const results = useMemo(() => getSearchResults(index, query), [index, query]);
  const resultById = useMemo(() => new Map(results.map((item) => [item.id, item])), [results]);
  const resultLabel = `${results.length} result${results.length === 1 ? '' : 's'}`;

  const openResult = useCallback(
    (id: Key) => {
      const result = resultById.get(String(id));
      if (!result) return;

      handleOpenChange(false);
      window.location.assign(result.href);
    },
    [handleOpenChange, resultById],
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      size="lg"
      aria-label="Search documentation"
      className="docs-search-modal max-w-[673px] rounded-2xl motion-reduce:transform-none motion-reduce:transition-none"
      overlayClassName="docs-search-overlay bg-black/60 motion-reduce:transition-none"
    >
      <Modal.Content className="docs-search-command">
        <Autocomplete<DocsSearchItem>
          inputValue={query}
          onInputChange={setQuery}
          filter={() => true}
        >
          <Search
            ref={searchInputRef}
            className="docs-search-field"
            value={query}
            onChange={setQuery}
            aria-label="Search documentation"
            placeholder="Search"
            autoComplete="off"
            spellCheck={false}
            variant="default"
            size="lg"
          />

          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {loadState === 'loaded' ? resultLabel : ''}
          </p>

          <div className="docs-search-results">
            {loadState === 'loading' || loadState === 'idle' ? (
              <div className="docs-search-state" role="status">
                <CircleNotch className="docs-search-state__spinner" size={20} aria-hidden="true" />
                <span>Loading documentation…</span>
              </div>
            ) : loadState === 'error' ? (
              <div className="docs-search-state" role="alert">
                <p>Search could not be loaded.</p>
                <Button
                  intent="secondary"
                  appearance="transparent"
                  size="sm"
                  onPress={() => void loadSearchIndex()}
                >
                  Try again
                </Button>
              </div>
            ) : (
              <>
                <p className="docs-search-suggestions">Suggestions</p>
                <Divider className="docs-search-divider" />
                <Menu
                  aria-label="Search results"
                  className="docs-search-results__menu"
                  dependencies={[results]}
                  onAction={openResult}
                  renderEmptyState={() => (
                    <div className="docs-search-empty">
                      <MagnifyingGlass size={24} aria-hidden="true" />
                      <p>No documentation found.</p>
                      <span>Try a component, foundation, prop, or phrase.</span>
                    </div>
                  )}
                >
                  {results.map((item) => {
                    const description =
                      item.kind === 'section'
                        ? `${item.pageTitle} · ${item.description || 'Documentation section'}`
                        : item.description;

                    return (
                      <MenuItem
                        key={item.id}
                        id={item.id}
                        size="md"
                        textValue={`${item.pageTitle} ${item.title} ${item.description}`}
                        className="docs-search-result data-[focused]:bg-menu-hover"
                      >
                        {() => (
                          <div className="docs-search-result__content">
                            <div className="docs-search-result__text">
                              <span className="docs-search-result__label">{item.title}</span>
                              <span className="docs-search-result__description">{description}</span>
                            </div>
                            <CaretRight size={16} aria-hidden="true" />
                          </div>
                        )}
                      </MenuItem>
                    );
                  })}
                </Menu>
              </>
            )}
          </div>
        </Autocomplete>
      </Modal.Content>
    </Modal>
  );
}
