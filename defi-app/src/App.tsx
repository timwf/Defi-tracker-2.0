import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import type { Pool, PoolsResponse, Filters, SortField, SortDirection, SavedView, HeldPosition } from './types/pool';
import type { FetchProgress } from './utils/historicalData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavHeader } from './components/NavHeader';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PoolsPage } from './pages/Pools';
import { Portfolio } from './pages/Portfolio';
import { Login } from './pages/Login';
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

const DEFAULT_FILTERS: Filters = {
  chains: [],
  projects: [],
  stablecoinOnly: false,
  tvlMin: 0,
  apyMin: 0,
  apyMax: 1000,
  search: '',
};

function AppContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<SortField>('tvlUsd');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);

  // Historical data state
  const [isFetchingHistorical, setIsFetchingHistorical] = useState(false);
  const [fetchProgress, setFetchProgress] = useState<FetchProgress | null>(null);
  const [fetchingPoolId, setFetchingPoolId] = useState<string | null>(null);
  const [historicalDataVersion, setHistoricalDataVersion] = useState(0);

  // Held positions state
  const [heldPositions, setHeldPositions] = useState<HeldPosition[]>([]);

  // Migration notification
  const [migrationMessage, setMigrationMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPools();
  }, []);

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setSavedViews([]);
      setHeldPositions([]);
    }
  }, [user]);

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
    // Require login to save views
    if (!user) {
      navigate('/login');
      return;
    }

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
    setFilters(view.filters);
    setSortField(view.sortField);
    setSortDirection(view.sortDirection);
  };

  const handleDeleteView = async (name: string) => {
    await deleteViewFromDb(name);
    const views = await fetchViews();
    setSavedViews(views);
  };

  const handleToggleHeld = useCallback(async (poolId: string, isCurrentlyHeld: boolean) => {
    // Require login to add/remove positions
    if (!user) {
      navigate('/login');
      return;
    }

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

    if (isCurrentlyHeld) {
      await removePositionFromDb(poolId);
    } else {
      await addPositionToDb({ poolId, amountUsd: 0 });
    }
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
  }, [user, navigate]);

  const handlePositionsChange = useCallback(async (positions: HeldPosition[]) => {
    // This is called from Portfolio page with full positions array
    // For now, just update the state - individual updates are handled in Portfolio
    setHeldPositions(positions);
  }, []);

  const refreshPositions = useCallback(async () => {
    const positions = await fetchPositions();
    setHeldPositions(positions);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-[1800px] mx-auto">
        <NavHeader poolCount={pools.length} lastUpdated={lastUpdated} onRefresh={fetchPools} loading={loading} positionCount={heldPositions.length} />

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
                fetchProgress={fetchProgress}
                setFetchProgress={setFetchProgress}
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
              <ProtectedRoute>
                <Portfolio
                  positions={heldPositions}
                  pools={pools}
                  onPositionsChange={handlePositionsChange}
                  onRefreshPositions={refreshPositions}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
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
    </BrowserRouter>
  );
}

// Re-export useAuth for components that need it
export { useAuth } from './context/AuthContext';

export default App;
