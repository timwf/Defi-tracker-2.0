import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Pool, PoolsResponse, Filters, SortField, SortDirection, SavedView, HeldPosition } from './types/pool';
import { FiltersPanel } from './components/Filters';
import { PoolTable } from './components/PoolTable';
import { SavedViews } from './components/SavedViews';
import { HistoricalFetch } from './components/HistoricalFetch';
import { MyPositions } from './components/MyPositions';
import { filterPools, getUniqueChains, getUniqueProjects, getAvailableChainsForProjects, getAvailableProjectsForChains } from './utils/filterPools';
import { getSavedViews, saveView, deleteView } from './utils/savedViews';
import { fetchMultiplePoolsHistory, fetchPoolHistoryWithCache, type FetchProgress } from './utils/historicalData';
import { getHeldPositions, addHeldPosition, removeHeldPosition } from './utils/heldPositions';

const DEFAULT_FILTERS: Filters = {
  chains: [],
  projects: [],
  stablecoinOnly: false,
  tvlMin: 0,
  apyMin: 0,
  apyMax: 1000,
  search: '',
};

function App() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<SortField>('tvlUsd');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);

  // Historical data state
  const [isFetchingHistorical, setIsFetchingHistorical] = useState(false);
  const [fetchingPoolId, setFetchingPoolId] = useState<string | null>(null);
  const [historicalDataVersion, setHistoricalDataVersion] = useState(0);

  // Held positions state
  const [heldPositions, setHeldPositions] = useState<HeldPosition[]>([]);

  useEffect(() => {
    fetchPools();
    setSavedViews(getSavedViews());
    setHeldPositions(getHeldPositions());
  }, []);

  async function fetchPools() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://yields.llama.fi/pools');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: PoolsResponse = await response.json();
      setPools(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pools');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveView = (name: string) => {
    const view: SavedView = {
      name,
      filters,
      sortField,
      sortDirection,
      createdAt: Date.now(),
    };
    setSavedViews(saveView(view));
  };

  const handleLoadView = (view: SavedView) => {
    setFilters(view.filters);
    setSortField(view.sortField);
    setSortDirection(view.sortDirection);
  };

  const handleDeleteView = (name: string) => {
    setSavedViews(deleteView(name));
  };

  // Held positions handlers
  const handleAddPosition = useCallback((poolId: string) => {
    setHeldPositions(addHeldPosition(poolId));
  }, []);

  const handleRemovePosition = useCallback((poolId: string) => {
    setHeldPositions(removeHeldPosition(poolId));
  }, []);

  const handleToggleHeld = useCallback((poolId: string, isCurrentlyHeld: boolean) => {
    if (isCurrentlyHeld) {
      setHeldPositions(removeHeldPosition(poolId));
    } else {
      setHeldPositions(addHeldPosition(poolId));
    }
  }, []);

  const heldPoolIds = useMemo(
    () => heldPositions.map((p) => p.poolId),
    [heldPositions]
  );

  // All chains and projects (for reference)
  const allChains = useMemo(() => getUniqueChains(pools), [pools]);
  const allProjects = useMemo(() => getUniqueProjects(pools), [pools]);

  // Dynamic: chains available based on selected projects
  const availableChains = useMemo(
    () => getAvailableChainsForProjects(pools, filters.projects),
    [pools, filters.projects]
  );

  // Dynamic: projects available based on selected chains
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

      // Handle null values
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
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Historical data fetch handlers
  const handleFetchPools = useCallback(
    async (poolIds: string[], onProgress: (p: FetchProgress) => void) => {
      await fetchMultiplePoolsHistory(poolIds, onProgress);
      setHistoricalDataVersion((v) => v + 1);
    },
    []
  );

  const handleFetchSinglePool = useCallback(async (poolId: string) => {
    setFetchingPoolId(poolId);
    try {
      await fetchPoolHistoryWithCache(poolId, true);
      setHistoricalDataVersion((v) => v + 1);
    } finally {
      setFetchingPoolId(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-[1800px] mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">DeFi Yield Tracker</h1>
          <p className="text-slate-400">
            Data from DefiLlama &middot; {pools.length.toLocaleString()} total pools
          </p>
        </header>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
            {error}
            <button onClick={fetchPools} className="ml-4 underline hover:no-underline">
              Retry
            </button>
          </div>
        )}

        <MyPositions
          positions={heldPositions}
          pools={pools}
          onAddPosition={handleAddPosition}
          onRemovePosition={handleRemovePosition}
        />

        <SavedViews
          views={savedViews}
          onLoadView={handleLoadView}
          onSaveView={handleSaveView}
          onDeleteView={handleDeleteView}
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
            onToggleHeld={handleToggleHeld}
          />
        )}

        {filteredAndSortedPools.length > 100 && (
          <div className="mt-4 text-center text-slate-400 text-sm">
            Showing first 100 results. Use filters to narrow down.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
