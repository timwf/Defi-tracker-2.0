import { useMemo, useCallback, useRef, useState } from 'react';
import type { Pool, Filters, SortField, SortDirection, SavedView, HeldPosition } from '../types/pool';
import { FiltersPanel } from '../components/Filters';
import { PoolTable } from '../components/PoolTable';
import { PoolInfoCard } from '../components/PoolInfoCard';
import { SavedViews } from '../components/SavedViews';
import { HistoricalFetch } from '../components/HistoricalFetch';
import { filterPools, getUniqueChains, getUniqueProjects, getAvailableChainsForProjects, getAvailableProjectsForChains } from '../utils/filterPools';
import { fetchMultiplePoolsHistory, fetchPoolHistoryWithCache, getAllPoolMetrics, type FetchProgress } from '../utils/historicalData';

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
}: PoolsPageProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [forceShowHeld, setForceShowHeld] = useState(true);

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

    // Optionally include held positions even if they don't match filters
    const heldNotInFiltered = forceShowHeld
      ? pools.filter(
          (p) => heldPoolIds.includes(p.pool) && !filtered.some((f) => f.pool === p.pool)
        )
      : [];

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
  }, [pools, filters, sortField, sortDirection, heldPoolIds, forceShowHeld]);

  const visiblePools = useMemo(
    () => filteredAndSortedPools.slice(0, 100),
    [filteredAndSortedPools]
  );

  const visiblePoolIds = useMemo(
    () => visiblePools.map((p) => p.pool),
    [visiblePools]
  );

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
            forceShowHeld={forceShowHeld}
            onForceShowHeldChange={setForceShowHeld}
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
          forceShowHeld={forceShowHeld}
          onForceShowHeldChange={setForceShowHeld}
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
        />
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing {visiblePools.length.toLocaleString()} of {filteredAndSortedPools.length.toLocaleString()} pools
          </div>
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
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
        {/* Sort controls - always on mobile, only for cards view on desktop */}
        <div className={`flex items-center gap-2 bg-slate-800 p-2 rounded-lg ${viewMode === 'table' ? 'md:hidden' : ''}`}>
          <span className="text-xs text-slate-400">Sort:</span>
          <select
            value={sortField}
            onChange={(e) => handleSort(e.target.value as SortField)}
            className="flex-1 md:flex-none px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white"
          >
            <option value="tvlUsd">TVL</option>
            <option value="apy">APY</option>
            <option value="apyBase">Base APY</option>
            <option value="apyReward">Reward APY</option>
            <option value="symbol">Symbol</option>
            <option value="project">Protocol</option>
            <option value="chain">Chain</option>
            <option value="stablecoin">Stablecoin</option>
            <option value="apyMean30d">Avg 30D</option>
            <option value="base90">Avg 90D *</option>
            <option value="apyPct1D">1D Change</option>
            <option value="apyPct7D">7D Change</option>
            <option value="apyPct30D">30D Change</option>
            <option value="sigma">Sigma</option>
            <option value="volatility">Volatility *</option>
            <option value="organicPct">Organic % *</option>
            <option value="tvlChange30d">TVL Change *</option>
          </select>
          <button
            onClick={() => handleSort(sortField)}
            className="px-3 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white"
          >
            {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-slate-400">Loading pools...</div>
        </div>
      ) : (
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
          viewMode={viewMode}
        />
      )}

      {filteredAndSortedPools.length > 100 && (
        <div className="mt-4 text-center text-slate-400 text-sm">
          Showing first 100 results. Use filters to narrow down.
        </div>
      )}
    </>
  );
}
