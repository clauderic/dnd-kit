import { useState, useEffect, useCallback } from 'react';
import {
  SearchButton,
  SearchProvider,
  useSearch,
  type SearchResult,
  Icon,
} from '@mintlify/components';
import { navigate } from 'astro:transitions/client';
import { useDebouncedCallback } from 'use-debounce';
import { type DecoratedNavigationPage } from '@mintlify/models';

const SEARCH_OPEN_EVENT = 'open-search';

export function openSearch() {
  window.dispatchEvent(new CustomEvent(SEARCH_OPEN_EVENT));
}

function SearchEventListener() {
  const search = useSearch();

  useEffect(() => {
    const handleOpen = () => search?.open();
    window.addEventListener(SEARCH_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(SEARCH_OPEN_EVENT, handleOpen);
  }, [search]);

  return null;
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

export function SearchBar() {
  const [mounted, setMounted] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load search history:', err);
    }
  }, []);

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
          body: JSON.stringify({
            query: searchQuery,
            pageSize: 10,
            filter: {
              language: 'en',
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();

      const transformedResults: SearchResult[] = data.map(
        (item: ApiSearchResult, index: number) => {
          const pathSegments = item.path
            ? item.path
                .split('/')
                .map(
                  (segment: string) =>
                    segment.charAt(0).toUpperCase() + segment.slice(1),
                )
            : [];

          return {
            id: item.path || `result-${index}`,
            header:
              item.metadata?.title ||
              pathSegments[pathSegments.length - 1] ||
              'Untitled',
            content: item.metadata?.description || item.content || '',
            link: normalizePath(item.path),
            metadata: {
              ...item.metadata,
              breadcrumbs: pathSegments,
              iconName: item.metadata.icon || 'hashtag',
            },
          };
        },
      );

      setResults(transformedResults);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useDebouncedCallback((searchQuery: string) => {
    performSearch(searchQuery);
  }, DEBOUNCE_DELAY_IN_MS);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        debouncedSearch.cancel();
        setResults([]);
        setIsLoading(false);
        return;
      }

      setResults([]);
      setIsLoading(true);
      debouncedSearch(searchQuery);
    },
    [debouncedSearch],
  );

  const handleSelectResult = (result: SearchResult) => {
    navigate(result.link);

    try {
      const newHistory = [
        result,
        ...recentSearches.filter((item) => item.id !== result.id),
      ].slice(0, MAX_HISTORY_ITEMS);

      setRecentSearches(newHistory);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (err) {
      console.error('Failed to save search history:', err);
    }
  };

  const addIconsToResults = (items: SearchResult[]): SearchResult[] => {
    return items.map((item) => {
      const iconName = item.metadata?.iconName || 'hashtag';
      return {
        ...item,
        icon: <Icon icon={iconName} size={16} color="gray" />,
      };
    });
  };

  if (!mounted) {
    return <SearchButton />;
  }

  return (
    <SearchProvider
      searchProps={{
        onSearch: handleSearch,
        results: addIconsToResults(results),
        isLoading,
        onSelectResult: handleSelectResult,
        recentSearches: addIconsToResults(recentSearches),
      }}
    >
      <SearchEventListener />
      <SearchButton />
    </SearchProvider>
  );
}
