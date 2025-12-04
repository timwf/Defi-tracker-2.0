import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Filters, SortField, SortDirection } from '../types/pool';

const DEFAULT_FILTERS: Filters = {
  chains: [],
  projects: [],
  stablecoinOnly: false,
  tvlMin: 0,
  apyMin: 0,
  apyMax: 1000,
  search: '',
};

const DEFAULT_SORT_FIELD: SortField = 'tvlUsd';
const DEFAULT_SORT_DIRECTION: SortDirection = 'desc';

// Valid sort fields for validation
const VALID_SORT_FIELDS: SortField[] = [
  'symbol', 'project', 'chain', 'tvlUsd', 'apy', 'apyBase',
  'apyReward', 'apyMean30d', 'apyPct1D', 'apyPct7D', 'apyPct30D',
  'sigma', 'stablecoin', 'base90', 'volatility', 'organicPct', 'tvlChange30d'
];

function parseFiltersFromUrl(searchParams: URLSearchParams): Filters {
  return {
    chains: searchParams.get('chains')?.split(',').filter(Boolean) || [],
    projects: searchParams.get('projects')?.split(',').filter(Boolean) || [],
    stablecoinOnly: searchParams.get('stable') === 'true',
    tvlMin: parseFloat(searchParams.get('tvlMin') || '0') || 0,
    apyMin: parseFloat(searchParams.get('apyMin') || '0') || 0,
    apyMax: parseFloat(searchParams.get('apyMax') || '1000') || 1000,
    search: searchParams.get('search') || '',
  };
}

function parseSortFromUrl(searchParams: URLSearchParams): { sortField: SortField; sortDirection: SortDirection } {
  const field = searchParams.get('sort') as SortField;
  const direction = searchParams.get('dir') as SortDirection;

  return {
    sortField: VALID_SORT_FIELDS.includes(field) ? field : DEFAULT_SORT_FIELD,
    sortDirection: direction === 'asc' || direction === 'desc' ? direction : DEFAULT_SORT_DIRECTION,
  };
}

function filtersToUrlParams(filters: Filters, sortField: SortField, sortDirection: SortDirection): URLSearchParams {
  const params = new URLSearchParams();

  // Only add non-default values to keep URL clean
  if (filters.chains.length > 0) {
    params.set('chains', filters.chains.join(','));
  }
  if (filters.projects.length > 0) {
    params.set('projects', filters.projects.join(','));
  }
  if (filters.stablecoinOnly) {
    params.set('stable', 'true');
  }
  if (filters.tvlMin > 0) {
    params.set('tvlMin', filters.tvlMin.toString());
  }
  if (filters.apyMin > 0) {
    params.set('apyMin', filters.apyMin.toString());
  }
  if (filters.apyMax < 1000) {
    params.set('apyMax', filters.apyMax.toString());
  }
  if (filters.search) {
    params.set('search', filters.search);
  }
  if (sortField !== DEFAULT_SORT_FIELD) {
    params.set('sort', sortField);
  }
  if (sortDirection !== DEFAULT_SORT_DIRECTION) {
    params.set('dir', sortDirection);
  }

  return params;
}

function areFiltersEqual(a: Filters, b: Filters): boolean {
  return (
    a.stablecoinOnly === b.stablecoinOnly &&
    a.tvlMin === b.tvlMin &&
    a.apyMin === b.apyMin &&
    a.apyMax === b.apyMax &&
    a.search === b.search &&
    a.chains.length === b.chains.length &&
    a.projects.length === b.projects.length &&
    a.chains.every((c, i) => c === b.chains[i]) &&
    a.projects.every((p, i) => p === b.projects[i])
  );
}

export function useUrlFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse current state from URL
  const filters = useMemo(() => parseFiltersFromUrl(searchParams), [searchParams]);
  const { sortField, sortDirection } = useMemo(() => parseSortFromUrl(searchParams), [searchParams]);

  // Check if we have any active filters (not default)
  const hasActiveFilters = useMemo(() => {
    return !areFiltersEqual(filters, DEFAULT_FILTERS) ||
           sortField !== DEFAULT_SORT_FIELD ||
           sortDirection !== DEFAULT_SORT_DIRECTION;
  }, [filters, sortField, sortDirection]);

  // Update URL when filters change
  const setFilters = useCallback((newFilters: Filters) => {
    const params = filtersToUrlParams(newFilters, sortField, sortDirection);
    setSearchParams(params, { replace: true });
  }, [sortField, sortDirection, setSearchParams]);

  const setSortField = useCallback((newSortField: SortField) => {
    const params = filtersToUrlParams(filters, newSortField, sortDirection);
    setSearchParams(params, { replace: true });
  }, [filters, sortDirection, setSearchParams]);

  const setSortDirection = useCallback((newSortDirection: SortDirection) => {
    const params = filtersToUrlParams(filters, sortField, newSortDirection);
    setSearchParams(params, { replace: true });
  }, [filters, sortField, setSearchParams]);

  // Clear all filters and reset to defaults
  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  // Apply a saved view (sets all filters and sort at once)
  const applyView = useCallback((viewFilters: Filters, viewSortField: SortField, viewSortDirection: SortDirection) => {
    const params = filtersToUrlParams(viewFilters, viewSortField, viewSortDirection);
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  return {
    filters,
    setFilters,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    hasActiveFilters,
    clearFilters,
    applyView,
  };
}

export { DEFAULT_FILTERS };
