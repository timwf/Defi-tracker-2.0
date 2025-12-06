import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

interface NavHeaderProps {
  poolCount: number;
  lastUpdated: number | null;
  onRefresh: () => void;
  loading: boolean;
  positionCount?: number;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

const POOLS_SEARCH_KEY = 'defi-tracker-pools-search';

export function NavHeader({
  poolCount,
  lastUpdated,
  onRefresh,
  loading,
  positionCount,
}: NavHeaderProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Remember the last pools search params in sessionStorage
  useEffect(() => {
    if (location.pathname === '/pools') {
      sessionStorage.setItem(POOLS_SEARCH_KEY, location.search);
    }
  }, [location]);

  // Build the pools link - preserve search params when navigating back
  const getPoolsLink = () => {
    if (location.pathname === '/pools') {
      return `/pools${location.search}`;
    }
    const savedSearch = sessionStorage.getItem(POOLS_SEARCH_KEY) || '';
    return `/pools${savedSearch}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 -mx-4 px-4 py-3 mb-4 sm:mb-6 sm:static sm:mx-0 sm:px-0 sm:py-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">DeFi Yield Tracker</h1>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="text-slate-400">
            DefiLlama &middot; {poolCount.toLocaleString()} pools
          </span>
          {lastUpdated && (
            <>
              <span className="text-slate-600">&middot;</span>
              <span className="text-slate-500">Updated {formatTimeAgo(lastUpdated)}</span>
            </>
          )}
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`text-slate-400 hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`}
            title="Refresh pool data"
          >
            ↻
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <nav className="flex gap-2">
          <NavLink
            to={getPoolsLink()}
            className={({ isActive }) =>
              `px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                isActive
                  ? 'bg-yellow-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`
            }
          >
            Pools
          </NavLink>
          <NavLink
            to="/portfolio"
            className={({ isActive }) =>
              `px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-colors relative ${
                isActive
                  ? 'bg-yellow-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`
            }
          >
            Portfolio
            {positionCount !== undefined && positionCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {positionCount}
              </span>
            )}
          </NavLink>
        </nav>
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
          {user ? (
            <>
              <span className="text-slate-400 text-xs sm:text-sm hidden sm:inline truncate max-w-[150px]">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

    </header>
  );
}
