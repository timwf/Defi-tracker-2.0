import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import type { Pool, PoolsResponse, SavedView, HeldPosition } from './types/pool';
import type { FetchProgress } from './utils/historicalData';
import { fetchPoolHistoryWithCache, isCacheValid, fetchMultiplePoolsHistory } from './utils/historicalData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavHeader } from './components/NavHeader';
import { AddPositionModal } from './components/AddPositionModal';
import { PoolsPage } from './pages/Pools';
import { Portfolio } from './pages/Portfolio';
import { Login } from './pages/Login';
import { useUrlFilters } from './hooks/useUrlFilters';
import {
  fetchPositions,
  addPositionToDb,
  removePositionFromDb,
  migrateLocalToSupabase,
  getLocalPositions
} from './utils/heldPositions';
import {
  fetchViews,
  saveViewToDb,
  deleteViewFromDb,
  migrateLocalViewsToSupabase,
  getLocalViews
} from './utils/savedViews';

function AppContent() {
  const { user } = useAuth();
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);

  // URL-based filter and sort state
  const {
    filters,
    setFilters,
    sortField,
    sortDirection,
    setSort,
    hasActiveFilters,
    clearFilters,
    applyView,
  } = useUrlFilters();

  // Historical data state
  const [isFetchingHistorical, setIsFetchingHistorical] = useState(false);
  const [fetchProgress, setFetchProgress] = useState<FetchProgress | null>(null);
  const [fetchingPoolId, setFetchingPoolId] = useState<string | null>(null);
  const [historicalDataVersion, setHistoricalDataVersion] = useState(0);

  // Track uncached pools for mobile header fetch button
  const [uncachedPoolIds, setUncachedPoolIds] = useState<string[]>([]);
  const [fetchButtonVisible, setFetchButtonVisible] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Held positions state
  const [heldPositions, setHeldPositions] = useState<HeldPosition[]>([]);

  // Add position modal state
  const [addPositionModalOpen, setAddPositionModalOpen] = useState(false);
  const [pendingPoolId, setPendingPoolId] = useState<string | null>(null);

  // Migration notification
  const [migrationMessage, setMigrationMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPools();
  }, []);

  // Load user data when user changes (or load from localStorage if not logged in)
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Load from localStorage for non-authenticated users
      loadLocalData();
    }
  }, [user]);

  async function loadLocalData() {
    const [positions, views] = await Promise.all([
      fetchPositions(),
      fetchViews(),
    ]);
    setHeldPositions(positions);
    setSavedViews(views);
  }

  async function loadUserData() {
    // Check for local data to migrate
    const localPositions = getLocalPositions();
    const localViews = getLocalViews();

    if (localPositions.length > 0 || localViews.length > 0) {
      // Migrate local data
      const migratedPositions = await migrateLocalToSupabase();
      const migratedViews = await migrateLocalViewsToSupabase();

      if (migratedPositions > 0 || migratedViews > 0) {
        setMigrationMessage(
          `Migrated ${migratedPositions} positions and ${migratedViews} saved views to your account.`
        );
        setTimeout(() => setMigrationMessage(null), 5000);
      }
    }

    // Load from Supabase
    const [positions, views] = await Promise.all([
      fetchPositions(),
      fetchViews(),
    ]);

    setHeldPositions(positions);
    setSavedViews(views);
  }

  async function fetchPools() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://yields.llama.fi/pools');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: PoolsResponse = await response.json();
      setPools(data.data);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pools');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveView = async (name: string) => {
    const view: SavedView = {
      name,
      filters,
      sortField,
      sortDirection,
      createdAt: Date.now(),
    };
    await saveViewToDb(view);
    const views = await fetchViews();
    setSavedViews(views);
  };

  const handleLoadView = (view: SavedView) => {
    applyView(view.filters, view.sortField, view.sortDirection);
  };

  const handleDeleteView = async (name: string) => {
    await deleteViewFromDb(name);
    const views = await fetchViews();
    setSavedViews(views);
  };

  const handleToggleHeld = useCallback(async (poolId: string, isCurrentlyHeld: boolean) => {
    if (isCurrentlyHeld) {
      // Removing - do it directly
      // Save scroll position before state changes
      const scrollY = window.scrollY;

      // Temporarily lock scroll position using CSS
      const html = document.documentElement;
      html.style.scrollBehavior = 'auto';
      html.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      await removePositionFromDb(poolId);
      const positions = await fetchPositions();
      setHeldPositions(positions);

      // Restore scroll after React re-renders
      requestAnimationFrame(() => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        html.style.overflow = '';
        html.style.scrollBehavior = '';
        window.scrollTo(0, scrollY);
      });
    } else {
      // Adding - show modal to get amount and entry date
      setPendingPoolId(poolId);
      setAddPositionModalOpen(true);
    }
  }, []);

  const handleAddPosition = useCallback(async (amountUsd: number, entryDate: string) => {
    if (!pendingPoolId) return;

    // Save scroll position before state changes
    const scrollY = window.scrollY;

    // Temporarily lock scroll position using CSS
    const html = document.documentElement;
    html.style.scrollBehavior = 'auto';
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    await addPositionToDb({ poolId: pendingPoolId, amountUsd, entryDate });
    const positions = await fetchPositions();
    setHeldPositions(positions);

    // Auto-fetch historical data if not already cached
    const poolIdToFetch = pendingPoolId;
    setPendingPoolId(null);

    if (!isCacheValid(poolIdToFetch)) {
      // Fetch in background without blocking UI
      fetchPoolHistoryWithCache(poolIdToFetch).then(() => {
        setHistoricalDataVersion(v => v + 1);
      }).catch(err => {
        console.error('Failed to fetch historical data:', err);
      });
    }

    // Restore scroll after React re-renders
    requestAnimationFrame(() => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      html.style.overflow = '';
      html.style.scrollBehavior = '';
      window.scrollTo(0, scrollY);
    });
  }, [pendingPoolId]);

  const handlePositionsChange = useCallback(async (positions: HeldPosition[]) => {
    // This is called from Portfolio page with full positions array
    // For now, just update the state - individual updates are handled in Portfolio
    setHeldPositions(positions);
  }, []);

  const refreshPositions = useCallback(async () => {
    const positions = await fetchPositions();
    setHeldPositions(positions);
  }, []);

  // Mobile header fetch handler
  const handleMobileFetch = useCallback(async () => {
    if (uncachedPoolIds.length === 0) return;

    abortControllerRef.current = new AbortController();
    setIsFetchingHistorical(true);
    setFetchProgress({ current: 0, total: uncachedPoolIds.length, poolId: '', status: 'fetching' });

    await fetchMultiplePoolsHistory(
      uncachedPoolIds,
      (p) => {
        setFetchProgress(p);
        if (p.status === 'fetching' || p.status === 'cached') {
          setHistoricalDataVersion((v) => v + 1);
        }
      },
      3,
      false,
      abortControllerRef.current.signal
    );

    setHistoricalDataVersion((v) => v + 1);
    setIsFetchingHistorical(false);
    setFetchProgress(null);
    abortControllerRef.current = null;
  }, [uncachedPoolIds]);

  const handleCancelMobileFetch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsFetchingHistorical(false);
    setFetchProgress(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-[1800px] mx-auto">
        <NavHeader
          poolCount={pools.length}
          lastUpdated={lastUpdated}
          onRefresh={fetchPools}
          loading={loading}
          positionCount={heldPositions.length}
          needsFetchingCount={uncachedPoolIds.length}
          isFetching={isFetchingHistorical}
          fetchProgress={fetchProgress}
          onFetchClick={handleMobileFetch}
          onCancelFetch={handleCancelMobileFetch}
          fetchButtonVisible={fetchButtonVisible}
        />

        {migrationMessage && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded mb-4">
            {migrationMessage}
          </div>
        )}

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
                sortDirection={sortDirection}
                setSort={setSort}
                savedViews={savedViews}
                onSaveView={handleSaveView}
                onLoadView={handleLoadView}
                onDeleteView={handleDeleteView}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
                heldPositions={heldPositions}
                onToggleHeld={handleToggleHeld}
                isFetchingHistorical={isFetchingHistorical}
                setIsFetchingHistorical={setIsFetchingHistorical}
                fetchProgress={fetchProgress}
                setFetchProgress={setFetchProgress}
                fetchingPoolId={fetchingPoolId}
                setFetchingPoolId={setFetchingPoolId}
                historicalDataVersion={historicalDataVersion}
                setHistoricalDataVersion={setHistoricalDataVersion}
                onUncachedPoolIdsChange={setUncachedPoolIds}
                onFetchButtonVisibilityChange={setFetchButtonVisible}
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
                onRefreshPositions={refreshPositions}
              />
            }
          />
        </Routes>
      </div>

      {/* Add Position Modal */}
      <AddPositionModal
        isOpen={addPositionModalOpen}
        onClose={() => {
          setAddPositionModalOpen(false);
          setPendingPoolId(null);
        }}
        onAdd={handleAddPosition}
        pool={pendingPoolId ? pools.find(p => p.pool === pendingPoolId) || null : null}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
      <Analytics />
    </BrowserRouter>
  );
}

// Re-export useAuth for components that need it
export { useAuth } from './context/AuthContext';

export default App;
