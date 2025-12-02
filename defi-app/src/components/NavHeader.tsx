import { NavLink } from 'react-router-dom';

interface NavHeaderProps {
  poolCount: number;
}

export function NavHeader({ poolCount }: NavHeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">DeFi Yield Tracker</h1>
        <p className="text-slate-400 text-sm">
          Data from DefiLlama &middot; {poolCount.toLocaleString()} total pools
        </p>
      </div>
      <nav className="flex gap-2">
        <NavLink
          to="/pools"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg font-medium transition-colors ${
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
            `px-4 py-2 rounded-lg font-medium transition-colors ${
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
