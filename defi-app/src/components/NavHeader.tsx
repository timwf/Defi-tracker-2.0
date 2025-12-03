import { NavLink } from 'react-router-dom';

interface NavHeaderProps {
  poolCount: number;
  lastUpdated: number | null;
  onRefresh: () => void;
  loading: boolean;
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

export function NavHeader({ poolCount, lastUpdated, onRefresh, loading }: NavHeaderProps) {
  return (
    <header className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
      <nav className="flex gap-2">
        <NavLink
          to="/pools"
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
            `px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
              isActive
                ? 'bg-yellow-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
            }`
          }
        >
          Portfolio
        </NavLink>
      </nav>
    </header>
  );
}
