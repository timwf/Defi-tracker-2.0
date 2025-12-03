import type { Filters } from '../types/pool';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import { ActiveFilters } from './ActiveFilters';

interface FiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availableChains: string[];
  availableProjects: string[];
  allChains: string[];
  allProjects: string[];
}

export function FiltersPanel({
  filters,
  onFiltersChange,
  availableChains,
  availableProjects,
  allChains,
  allProjects,
}: FiltersProps) {
  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const chainOptions = allChains.map((chain) => ({
    value: chain,
    available: availableChains.includes(chain),
  }));

  const projectOptions = allProjects.map((project) => ({
    value: project,
    available: availableProjects.includes(project),
  }));

  const clearAll = () => {
    onFiltersChange({
      chains: [],
      projects: [],
      stablecoinOnly: false,
      tvlMin: 0,
      apyMin: 0,
      apyMax: 1000,
      search: '',
    });
  };

  return (
    <div className="bg-slate-800 p-3 sm:p-4 rounded-lg mb-4 space-y-3">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[150px] max-w-[250px]">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search tokens..."
            className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Chains Dropdown */}
        <MultiSelectDropdown
          label="Chains"
          options={chainOptions}
          selectedValues={filters.chains}
          onChange={(values) => updateFilter('chains', values)}
          colorClass="blue"
        />

        {/* Protocols Dropdown */}
        <MultiSelectDropdown
          label="Protocols"
          options={projectOptions}
          selectedValues={filters.projects}
          onChange={(values) => updateFilter('projects', values)}
          colorClass="green"
        />

        {/* TVL */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-md">
          <span className="text-xs text-slate-400">TVL</span>
          <span className="text-sm text-white">${(filters.tvlMin / 1_000_000).toFixed(1)}M+</span>
          <input
            type="range"
            min={0}
            max={100_000_000}
            step={1_000_000}
            value={filters.tvlMin}
            onChange={(e) => updateFilter('tvlMin', Number(e.target.value))}
            className="w-20 h-1"
          />
        </div>

        {/* APY Range */}
        <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-md">
          <span className="text-xs text-slate-400">APY</span>
          <input
            type="number"
            value={filters.apyMin}
            onChange={(e) => updateFilter('apyMin', Number(e.target.value))}
            className="w-12 px-1 py-0.5 bg-slate-600 border border-slate-500 rounded text-white text-xs text-center"
          />
          <span className="text-slate-500">-</span>
          <input
            type="number"
            value={filters.apyMax}
            onChange={(e) => updateFilter('apyMax', Number(e.target.value))}
            className="w-12 px-1 py-0.5 bg-slate-600 border border-slate-500 rounded text-white text-xs text-center"
          />
          <span className="text-xs text-slate-400">%</span>
        </div>

        {/* Stablecoin Toggle */}
        <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-md cursor-pointer hover:bg-slate-600 transition-colors">
          <input
            type="checkbox"
            checked={filters.stablecoinOnly}
            onChange={(e) => updateFilter('stablecoinOnly', e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-slate-300">Stables</span>
        </label>

        {/* Reset */}
        <button
          onClick={clearAll}
          className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Active Filters Summary */}
      <ActiveFilters
        filters={filters}
        onRemoveChain={(chain) =>
          updateFilter('chains', filters.chains.filter((c) => c !== chain))
        }
        onRemoveProject={(project) =>
          updateFilter('projects', filters.projects.filter((p) => p !== project))
        }
        onClearTvl={() => updateFilter('tvlMin', 0)}
        onClearApy={() => {
          onFiltersChange({ ...filters, apyMin: 0, apyMax: 1000 });
        }}
        onClearStablecoin={() => updateFilter('stablecoinOnly', false)}
        onClearSearch={() => updateFilter('search', '')}
        onClearAll={clearAll}
      />
    </div>
  );
}
