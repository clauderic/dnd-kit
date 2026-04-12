import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { navigate } from 'astro:transitions/client';
import { useDebouncedCallback } from 'use-debounce';
import { type DecoratedNavigationPage } from '@mintlify/models';
import { openAssistant } from './Assistant/events';

const SEARCH_OPEN_EVENT = 'open-search';

export function openSearch() {
  window.dispatchEvent(new CustomEvent(SEARCH_OPEN_EVENT));
}

const SUBDOMAIN = import.meta.env.PUBLIC_MINTLIFY_SUBDOMAIN;
const API_KEY = import.meta.env.PUBLIC_MINTLIFY_ASSISTANT_KEY;

const normalizePath = (path: string | undefined): string => {
  if (!path) return '/';
  let normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.endsWith('index')) {
    normalized = normalized.replace('index', '');
  }
  return normalized;
};

const SEARCH_HISTORY_KEY = 'mintlify-search-history';
const MAX_HISTORY_ITEMS = 5;
const DEBOUNCE_DELAY_IN_MS = 100;

type ApiSearchResult = {
  content: string;
  path: string;
  metadata: DecoratedNavigationPage;
};

type SearchItem = {
  id: string;
  title: string;
  content: string; // May contain <mark> tags
  link: string;
  breadcrumbs: string[];
  isLegacy?: boolean;
};

export function SearchBar() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  }, []);

  // Open/close handlers
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener(SEARCH_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(SEARCH_OPEN_EVENT, handleOpen);
  }, []);

  // Keyboard shortcut: ⌘K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened — try mobile input first, then desktop
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        mobileInputRef.current?.focus() || inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setResults([]);
      setActiveIndex(0);
    }
  }, [isOpen]);

  const performSearch = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mintlify.com/discovery/v1/search/${SUBDOMAIN}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
          },
          body: JSON.stringify({ query: searchQuery, pageSize: 10, filter: { language: 'en' } }),
        },
      );
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();

      const mapped = data.map((item: ApiSearchResult, index: number) => {
        const pathSegments = item.path
          ? item.path.split('/').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
          : [];
        return {
          id: item.path || `result-${index}`,
          title: item.metadata?.title || pathSegments[pathSegments.length - 1] || 'Untitled',
          content: item.metadata?.description || item.content || '',
          link: normalizePath(item.path),
          breadcrumbs: pathSegments,
          isLegacy: pathSegments[0]?.toLowerCase() === 'legacy',
        };
      });

      // Filter: only show legacy results when browsing legacy docs, and vice versa
      const isOnLegacy = window.location.pathname.startsWith('/legacy');
      const filtered = mapped.filter((item: SearchItem) => isOnLegacy ? item.isLegacy : !item.isLegacy);

      // Re-rank: title matches first, then by match quality
      const q = searchQuery.toLowerCase();
      filtered.sort((a: SearchItem, b: SearchItem) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const aExact = aTitle === q;
        const bExact = bTitle === q;
        if (aExact !== bExact) return aExact ? -1 : 1;
        const aStartsWith = aTitle.startsWith(q);
        const bStartsWith = bTitle.startsWith(q);
        if (aStartsWith !== bStartsWith) return aStartsWith ? -1 : 1;
        const aTitleMatch = aTitle.includes(q);
        const bTitleMatch = bTitle.includes(q);
        if (aTitleMatch !== bTitleMatch) return aTitleMatch ? -1 : 1;
        // Prefer shorter paths (more top-level pages)
        return a.breadcrumbs.length - b.breadcrumbs.length;
      });

      setResults(filtered);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useDebouncedCallback((q: string) => {
    performSearch(q);
  }, DEBOUNCE_DELAY_IN_MS);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setActiveIndex(0);
    if (!value.trim()) {
      debouncedSearch.cancel();
      setResults([]);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      debouncedSearch(value);
    }
  };

  const selectResult = (item: SearchItem) => {
    setIsOpen(false);
    navigate(item.link);
    try {
      const newHistory = [item, ...recentSearches.filter((r) => r.id !== item.id)].slice(0, MAX_HISTORY_ITEMS);
      setRecentSearches(newHistory);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch {}
  };

  const displayItems = query.trim() ? results : recentSearches;
  const hasQuery = query.trim().length > 0;
  // Total navigable items: results + "Ask AI" button when there's a query
  const totalItems = displayItems.length + (hasQuery ? 1 : 0);
  const askAiIndex = hasQuery ? displayItems.length : -1;

  const askAi = useCallback(() => {
    setIsOpen(false);
    openAssistant(undefined, query.trim());
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, totalItems - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex === askAiIndex) {
        askAi();
      } else if (displayItems[activeIndex]) {
        selectResult(displayItems[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!mounted) {
    return (
      <div className="relative">
        <div className="relative">
          <div className="w-full h-9 rounded-xl bg-transparent pl-9 pr-14 text-sm border border-stone-200 dark:border-white/10 flex items-center">
            <span className="text-stone-400 dark:text-white/50">Search...</span>
          </div>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="absolute top-1/2 left-3 -translate-y-1/2 text-stone-400 dark:text-white/40 pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <kbd className="absolute top-1/2 right-3 -translate-y-1/2 hidden sm:inline-flex text-xs text-stone-400 dark:text-white/30 pointer-events-none">⌘K</kbd>
        </div>
      </div>
    );
  }

  const hasResults = displayItems.length > 0;
  const showEmpty = !hasQuery || isLoading || results.length > 0 ? false : true;
  const showDropdown = isOpen && (hasResults || showEmpty || hasQuery);

  return (
    <>
      {/* Inline search input (visible on desktop via parent CSS) */}
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="search"
            placeholder="Search..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            className="w-full h-9 rounded-xl bg-transparent pl-9 pr-14 text-sm text-stone-950 dark:text-white outline-none border border-stone-200 dark:border-white/10 hover:border-stone-300 dark:hover:border-white/20 focus:border-stone-300 dark:focus:border-white/20 focus:shadow-[0_1px_3px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] dark:focus:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.06)] transition placeholder:text-stone-400 dark:placeholder:text-white/50 [&::-webkit-search-cancel-button]:appearance-none"
            autoComplete="off"
          />
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="absolute top-1/2 left-3 -translate-y-1/2 text-stone-400 dark:text-white/40 pointer-events-none peer-focus:text-[var(--primary)] transition-colors"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <kbd className="absolute top-1/2 right-3 -translate-y-1/2 hidden sm:inline-flex text-xs text-stone-400 dark:text-white/30 pointer-events-none">⌘K</kbd>
          {isLoading && (
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-stone-400 animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
        </div>

        {/* Desktop: inline click-away + dropdown (hidden on mobile since parent is hidden) */}
        {isOpen && <div className="fixed inset-0 z-[199]" onClick={() => setIsOpen(false)} />}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 z-[200] rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
          {hasResults && (
            <div ref={listRef} className="max-h-[min(400px,60vh)] overflow-y-auto p-1.5">
              {!query.trim() && recentSearches.length > 0 && (
                <div className="px-3 py-1.5 text-xs font-medium text-stone-400 dark:text-stone-500">Recent</div>
              )}
              {displayItems.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  className={`flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    i === activeIndex
                      ? 'bg-stone-100 dark:bg-white/5'
                      : 'hover:bg-stone-50 dark:hover:bg-white/[0.02]'
                  }`}
                  onClick={() => selectResult(item)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                    {item.breadcrumbs.length > 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-stone-400 dark:text-stone-500 truncate">
                        {item.breadcrumbs.map((crumb, j) => (
                          <span key={j} className="flex items-center gap-1">
                            {j > 0 && <span className="text-stone-300 dark:text-stone-600">&gt;</span>}
                            <span className="truncate">{crumb}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="truncate text-sm font-medium text-stone-900 dark:text-white">{item.title}</div>
                    {item.content && (
                      <div
                        className="line-clamp-1 text-xs text-stone-500 dark:text-stone-400 search-highlight"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    )}
                  </div>
                  {i === activeIndex && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 self-center text-stone-300 dark:text-stone-600">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}

          {showEmpty && (
            <div className="px-4 py-6 text-center text-sm text-stone-500 dark:text-stone-400">
              No results found
            </div>
          )}

          {hasQuery && (
            <div className="border-t border-stone-200 dark:border-white/10 p-1.5">
              <button
                type="button"
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeIndex === askAiIndex
                    ? 'bg-stone-100 dark:bg-white/5'
                    : 'hover:bg-stone-50 dark:hover:bg-white/[0.02]'
                }`}
                onClick={askAi}
                onMouseEnter={() => setActiveIndex(askAiIndex)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[var(--primary)]">
                  <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" fill="currentColor" />
                </svg>
                <span className="text-stone-600 dark:text-stone-300">Ask AI about</span>
                <span className="font-medium text-stone-900 dark:text-white truncate">&ldquo;{query.trim()}&rdquo;</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>

    {/* Search overlay — portaled to body for mobile (escapes hidden parent) and ⌘K trigger */}
    {isOpen && createPortal(
      <>
        <div className="lg:hidden fixed inset-0 z-[199] bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        <div className="lg:hidden fixed top-0 left-0 right-0 z-[200] p-4 bg-white dark:bg-gray-900 border-b border-stone-200 dark:border-white/10 shadow-lg">
          <div className="relative">
            <input
              ref={mobileInputRef}
              type="search"
              placeholder="Search..."
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full h-10 rounded-xl bg-stone-50 dark:bg-white/5 pl-9 pr-10 text-sm text-stone-950 dark:text-white outline-none border border-stone-200 dark:border-white/10 focus:border-stone-300 dark:focus:border-white/20 placeholder:text-stone-400 dark:placeholder:text-white/50 [&::-webkit-search-cancel-button]:appearance-none"
              autoComplete="off"
            />
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="absolute top-1/2 left-3 -translate-y-1/2 text-stone-400 dark:text-white/40 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <button type="button" onClick={() => setIsOpen(false)} className="absolute top-1/2 right-3 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-white/70">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          {(hasResults || showEmpty) && (
            <div className="mt-2 max-h-[60vh] overflow-y-auto">
              {hasResults && (
                <div ref={listRef} className="p-1.5">
                  {!query.trim() && recentSearches.length > 0 && (
                    <div className="px-3 py-1.5 text-xs font-medium text-stone-400 dark:text-stone-500">Recent</div>
                  )}
                  {displayItems.map((item, i) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                        i === activeIndex
                          ? 'bg-stone-100 dark:bg-white/5'
                          : 'hover:bg-stone-50 dark:hover:bg-white/[0.02]'
                      }`}
                      onClick={() => selectResult(item)}
                    >
                      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                        <div className="truncate text-sm font-medium text-stone-900 dark:text-white">{item.title}</div>
                        {item.content && (
                          <div
                            className="line-clamp-1 text-xs text-stone-500 dark:text-stone-400 search-highlight"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showEmpty && (
                <div className="px-4 py-6 text-center text-sm text-stone-500 dark:text-stone-400">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>
      </>,
      document.body
    )}
    </>
  );
}

