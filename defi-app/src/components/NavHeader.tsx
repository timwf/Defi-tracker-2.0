import { NavLink } from 'react-router-dom';

interface NavHeaderProps {
  poolCount: number;
}

export function NavHeader({ poolCount }: NavHeaderProps) {
  return (
    <header className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">DeFi Yield Tracker</h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          DefiLlama &middot; {poolCount.toLocaleString()} pools
        </p>
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
