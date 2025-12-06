import { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import type { Pool, Filters, SortField, SortDirection, SavedView, HeldPosition } from '../types/pool';
import { FiltersPanel } from '../components/Filters';
import { PoolTable } from '../components/PoolTable';
import { PoolInfoCard } from '../components/PoolInfoCard';
import { SavedViews } from '../components/SavedViews';
import { HistoricalFetch } from '../components/HistoricalFetch';
import { filterPools, getUniqueChains, getUniqueProjects, getAvailableChainsForProjects, getAvailableProjectsForChains } from '../utils/filterPools';
import { fetchMultiplePoolsHistory, fetchPoolHistoryWithCache, getAllPoolMetrics, getUncachedPoolIds, type FetchProgress } from '../utils/historicalData';

interface PoolsPageProps {
  pools: Pool[];
  loading: boolean;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  setSort: (field: SortField, direction: SortDirection) => void;
  savedViews: SavedView[];
  onSaveView: (name: string) => void;
  onLoadView: (view: SavedView) => void;
  onDeleteView: (name: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  heldPositions: HeldPosition[];
  onToggleHeld: (poolId: string, isHeld: boolean) => void;
  isFetchingHistorical: boolean;
  setIsFetchingHistorical: (v: boolean) => void;
  fetchProgress: FetchProgress | null;
  setFetchProgress: (p: FetchProgress | null) => void;
  fetchingPoolId: string | null;
  setFetchingPoolId: (id: string | null) => void;
  historicalDataVersion: number;
  setHistoricalDataVersion: (fn: (v: number) => number) => void;
  onUncachedPoolIdsChange?: (poolIds: string[]) => void;
  onFetchButtonVisibilityChange?: (isVisible: boolean) => void;
}

export function PoolsPage({
  pools,
  loading,
  filters,
  setFilters,
  sortField,
  sortDirection,
  setSort,
  savedViews,
  onSaveView,
  onLoadView,
  onDeleteView,
  onClearFilters,
  hasActiveFilters,
  heldPositions,
  onToggleHeld,
  isFetchingHistorical,
  setIsFetchingHistorical,
  fetchProgress,
  setFetchProgress,
  fetchingPoolId,
  setFetchingPoolId,
  historicalDataVersion,
  setHistoricalDataVersion,
  onUncachedPoolIdsChange,
  onFetchButtonVisibilityChange,
}: PoolsPageProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const heldPoolIds = useMemo(
    () => heldPositions.map((p) => p.poolId),
    [heldPositions]
  );

  // AbortController for cancelling fetch
  const abortControllerRef = useRef<AbortController | null>(null);

  const allChains = useMemo(() => getUniqueChains(pools), [pools]);
  const allProjects = useMemo(() => getUniqueProjects(pools), [pools]);
  const allSymbols = useMemo(() => pools.map(p => p.symbol), [pools]);

  const availableChains = useMemo(
    () => getAvailableChainsForProjects(pools, filters.projects),
    [pools, filters.projects]
  );

  const availableProjects = useMemo(
    () => getAvailableProjectsForChains(pools, filters.chains),
    [pools, filters.chains]
  );

  const filteredAndSortedPools = useMemo(() => {
    const filtered = filterPools(pools, filters);

    // Always include held positions, even if they don't match filters
    const heldNotInFiltered = pools.filter(
      (p) => heldPoolIds.includes(p.pool) && !filtered.some((f) => f.pool === p.pool)
    );

    const combined = [...filtered, ...heldNotInFiltered];

    // Historical metric fields that need to be looked up from metrics
    const historicalFields = ['base90', 'volatility', 'organicPct', 'tvlChange30d'] as const;
    const isHistoricalSort = historicalFields.includes(sortField as typeof historicalFields[number]);

    // Pre-compute all metrics once before sorting (avoids repeated lookups)
    const metricsMap = isHistoricalSort ? getAllPoolMetrics() : null;

    return combined.sort((a, b) => {
      let aVal: string | number | boolean | null;
      let bVal: string | number | boolean | null;

      // Check if sorting by a historical metric field
      if (isHistoricalSort && metricsMap) {
        const aMetrics = metricsMap.get(a.pool);
        const bMetrics = metricsMap.get(b.pool);
        aVal = aMetrics?.[sortField as keyof typeof aMetrics] ?? null;
        bVal = bMetrics?.[sortField as keyof typeof bMetrics] ?? null;
      } else {
        aVal = a[sortField as keyof Pool] as string | number | boolean | null;
        bVal = b[sortField as keyof Pool] as string | number | boolean | null;
      }

      // Handle nulls - push them to the end
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      // Handle booleans
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        const aNum = aVal ? 1 : 0;
        const bNum = bVal ? 1 : 0;
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [pools, filters, sortField, sortDirection, heldPoolIds]);

  const visiblePools = useMemo(
    () => filteredAndSortedPools.slice(0, 100),
    [filteredAndSortedPools]
  );

  const visiblePoolIds = useMemo(
    () => visiblePools.map((p) => p.pool),
    [visiblePools]
  );

  // Notify parent of uncached pool IDs for mobile header fetch button
  useEffect(() => {
    if (onUncachedPoolIdsChange) {
      const uncached = getUncachedPoolIds(visiblePoolIds);
      onUncachedPoolIdsChange(uncached);
    }
  }, [visiblePoolIds, historicalDataVersion, onUncachedPoolIdsChange]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction for same field
      setSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to desc
      setSort(field, 'desc');
    }
  };

  const handleFetchPools = useCallback(
    async (poolIds: string[]) => {
      // Create new AbortController for this fetch
      abortControllerRef.current = new AbortController();

      // Set initial progress with correct total (only uncached pools)
      setFetchProgress({ current: 0, total: poolIds.length, poolId: '', status: 'fetching' });

      await fetchMultiplePoolsHistory(
        poolIds,
        (p) => {
          setFetchProgress(p);
          // Update version after each fetch so table populates incrementally
          if (p.status === 'fetching' || p.status === 'cached') {
            setHistoricalDataVersion((v) => v + 1);
          }
        },
        3, // batch size - fetch 3 in parallel
        false,
        abortControllerRef.current.signal
      );
      setHistoricalDataVersion((v) => v + 1);
      abortControllerRef.current = null;
    },
    [setHistoricalDataVersion, setFetchProgress]
  );

  const handleCancelFetch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const handleFetchSinglePool = useCallback(async (poolId: string) => {
    setFetchingPoolId(poolId);
    try {
      await fetchPoolHistoryWithCache(poolId, true);
      setHistoricalDataVersion((v) => v + 1);
    } finally {
      setFetchingPoolId(null);
    }
  }, [setFetchingPoolId, setHistoricalDataVersion]);

  return (
    <>
      <SavedViews
        views={savedViews}
        onLoadView={onLoadView}
        onSaveView={onSaveView}
        onDeleteView={onDeleteView}
        onClearFilters={onClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Desktop: 2-column layout for filters and historical fetch */}
      <div className="hidden md:grid md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2">
          <FiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            availableChains={availableChains}
            availableProjects={availableProjects}
            allChains={allChains}
            allProjects={allProjects}
            allSymbols={allSymbols}
          />
        </div>
        <div>
          <HistoricalFetch
            visiblePoolIds={visiblePoolIds}
            visiblePools={visiblePools}
            filters={filters}
            heldPositions={heldPositions}
            onFetchStart={() => {
              setIsFetchingHistorical(true);
            }}
            onFetchComplete={() => {
              setIsFetchingHistorical(false);
              setFetchProgress(null);
            }}
            onFetchPools={handleFetchPools}
            onCancelFetch={handleCancelFetch}
            onClearCache={() => setHistoricalDataVersion((v) => v + 1)}
            isFetching={isFetchingHistorical}
            progress={fetchProgress}
            historicalDataVersion={historicalDataVersion}
          />
        </div>
      </div>

      {/* Mobile: stacked layout */}
      <div className="md:hidden">
        <FiltersPanel
          filters={filters}
          onFiltersChange={setFilters}
          availableChains={availableChains}
          availableProjects={availableProjects}
          allChains={allChains}
          allProjects={allProjects}
          allSymbols={allSymbols}
        />
        <HistoricalFetch
          visiblePoolIds={visiblePoolIds}
          visiblePools={visiblePools}
          filters={filters}
          heldPositions={heldPositions}
          onFetchStart={() => {
            setIsFetchingHistorical(true);
          }}
          onFetchComplete={() => {
            setIsFetchingHistorical(false);
            setFetchProgress(null);
          }}
          onFetchPools={handleFetchPools}
          onCancelFetch={handleCancelFetch}
          onClearCache={() => setHistoricalDataVersion((v) => v + 1)}
          isFetching={isFetchingHistorical}
          progress={fetchProgress}
          historicalDataVersion={historicalDataVersion}
          onFetchButtonVisibilityChange={onFetchButtonVisibilityChange}
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Showing {visiblePools.length.toLocaleString()} of {filteredAndSortedPools.length.toLocaleString()} pools
        </div>
        {/* View Toggle - desktop only */}
        <div className="hidden md:flex items-center gap-1 bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'cards'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-slate-400">Loading pools...</div>
        </div>
      ) : viewMode === 'table' ? (
        <PoolTable
          pools={visiblePools}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onFetchSinglePool={handleFetchSinglePool}
          fetchingPoolId={fetchingPoolId}
          historicalDataVersion={historicalDataVersion}
          heldPoolIds={heldPoolIds}
          onToggleHeld={onToggleHeld}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visiblePools.map((pool) => (
            <PoolInfoCard
              key={pool.pool}
              pool={pool}
              mode="browse"
              isHeld={heldPoolIds.includes(pool.pool)}
              onToggleHeld={onToggleHeld}
              onFetchHistory={handleFetchSinglePool}
              isFetching={fetchingPoolId === pool.pool}
            />
          ))}
        </div>
      )}

      {filteredAndSortedPools.length > 100 && (
        <div className="mt-4 text-center text-slate-400 text-sm">
          Showing first 100 results. Use filters to narrow down.
        </div>
      )}
    </>
  );
}
