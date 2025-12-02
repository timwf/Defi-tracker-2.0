import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { Pool, PoolsResponse, Filters, SortField, SortDirection, SavedView, HeldPosition } from './types/pool';
import { NavHeader } from './components/NavHeader';
import { PoolsPage } from './pages/Pools';
import { Portfolio } from './pages/Portfolio';
import { getSavedViews, saveView, deleteView } from './utils/savedViews';
import { getHeldPositions, removeHeldPosition, addHeldPosition } from './utils/heldPositions';

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

  const handleToggleHeld = useCallback((poolId: string, isCurrentlyHeld: boolean) => {
    if (isCurrentlyHeld) {
      setHeldPositions(removeHeldPosition(poolId));
    } else {
      // When toggling from pool table, add with 0 amount (user can edit in portfolio)
      setHeldPositions(addHeldPosition({ poolId, amountUsd: 0 }));
    }
  }, []);

  const handlePositionsChange = useCallback((positions: HeldPosition[]) => {
    setHeldPositions(positions);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 p-4">
        <div className="max-w-[1800px] mx-auto">
          <NavHeader poolCount={pools.length} />

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
              {error}
              <button onClick={fetchPools} className="ml-4 underline hover:no-underline">
                Retry
              </button>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Navigate to="/pools" replace />} />
            <Route
              path="/pools"
              element={
                <PoolsPage
                  pools={pools}
                  loading={loading}
                  filters={filters}
                  setFilters={setFilters}
                  sortField={sortField}
                  setSortField={setSortField}
                  sortDirection={sortDirection}
                  setSortDirection={setSortDirection}
                  savedViews={savedViews}
                  onSaveView={handleSaveView}
                  onLoadView={handleLoadView}
                  onDeleteView={handleDeleteView}
                  heldPositions={heldPositions}
                  onToggleHeld={handleToggleHeld}
                  isFetchingHistorical={isFetchingHistorical}
                  setIsFetchingHistorical={setIsFetchingHistorical}
                  fetchingPoolId={fetchingPoolId}
                  setFetchingPoolId={setFetchingPoolId}
                  historicalDataVersion={historicalDataVersion}
                  setHistoricalDataVersion={setHistoricalDataVersion}
                />
              }
            />
            <Route
              path="/portfolio"
              element={
                <Portfolio
                  positions={heldPositions}
                  pools={pools}
                  onPositionsChange={handlePositionsChange}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
