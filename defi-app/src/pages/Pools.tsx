import { useMemo, useCallback } from 'react';
import type { Pool, Filters, SortField, SortDirection, SavedView, HeldPosition } from '../types/pool';
import { FiltersPanel } from '../components/Filters';
import { PoolTable } from '../components/PoolTable';
import { SavedViews } from '../components/SavedViews';
import { HistoricalFetch } from '../components/HistoricalFetch';
import { filterPools, getUniqueChains, getUniqueProjects, getAvailableChainsForProjects, getAvailableProjectsForChains } from '../utils/filterPools';
import { fetchMultiplePoolsHistory, fetchPoolHistoryWithCache, type FetchProgress } from '../utils/historicalData';

interface PoolsPageProps {
  pools: Pool[];
  loading: boolean;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  sortDirection: SortDirection;
  setSortDirection: (dir: SortDirection) => void;
  savedViews: SavedView[];
  onSaveView: (name: string) => void;
  onLoadView: (view: SavedView) => void;
  onDeleteView: (name: string) => void;
  heldPositions: HeldPosition[];
  onToggleHeld: (poolId: string, isHeld: boolean) => void;
  isFetchingHistorical: boolean;
  setIsFetchingHistorical: (v: boolean) => void;
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
  setSortField,
  sortDirection,
  setSortDirection,
  savedViews,
  onSaveView,
  onLoadView,
  onDeleteView,
  heldPositions,
  onToggleHeld,
  isFetchingHistorical,
  setIsFetchingHistorical,
  fetchingPoolId,
  setFetchingPoolId,
  historicalDataVersion,
  setHistoricalDataVersion,
}: PoolsPageProps) {
  const heldPoolIds = useMemo(
    () => heldPositions.map((p) => p.poolId),
    [heldPositions]
  );

  const allChains = useMemo(() => getUniqueChains(pools), [pools]);
  const allProjects = useMemo(() => getUniqueProjects(pools), [pools]);

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

    return combined.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === null) aVal = 0;
      if (bVal === null) bVal = 0;

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

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleFetchPools = useCallback(
    async (poolIds: string[], onProgress: (p: FetchProgress) => void) => {
      await fetchMultiplePoolsHistory(poolIds, onProgress);
      setHistoricalDataVersion((v) => v + 1);
    },
    [setHistoricalDataVersion]
  );

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
      />

      <FiltersPanel
        filters={filters}
        onFiltersChange={setFilters}
        availableChains={availableChains}
        availableProjects={availableProjects}
        allChains={allChains}
        allProjects={allProjects}
      />

      <HistoricalFetch
        visiblePoolIds={visiblePoolIds}
        visiblePools={visiblePools}
        filters={filters}
        heldPositions={heldPositions}
        onFetchStart={() => setIsFetchingHistorical(true)}
        onFetchComplete={() => setIsFetchingHistorical(false)}
        onFetchPools={handleFetchPools}
        isFetching={isFetchingHistorical}
      />

      <div className="mb-4 text-sm text-slate-400">
        Showing {visiblePools.length.toLocaleString()} of {filteredAndSortedPools.length.toLocaleString()} pools
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
