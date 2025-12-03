import { useState } from 'react';
import type { Filters } from '../types/pool';

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
  const [chainsExpanded, setChainsExpanded] = useState(false);
  const [protocolsExpanded, setProtocolsExpanded] = useState(false);
  const [protocolSearch, setProtocolSearch] = useState('');

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayItem = (arr: string[], item: string): string[] => {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
  };

  return (
    <div className="bg-slate-800 p-3 sm:p-4 rounded-lg mb-4 space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Search */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Search</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="e.g. USDC"
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* TVL Min */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
            TVL: ${(filters.tvlMin / 1_000_000).toFixed(1)}M+
          </label>
          <input
            type="range"
            min={0}
            max={100_000_000}
            step={1_000_000}
            value={filters.tvlMin}
            onChange={(e) => updateFilter('tvlMin', Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* APY Range */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
            APY: {filters.apyMin}-{filters.apyMax}%
          </label>
          <div className="flex gap-1 sm:gap-2">
            <input
              type="number"
              value={filters.apyMin}
              onChange={(e) => updateFilter('apyMin', Number(e.target.value))}
              placeholder="Min"
              className="w-1/2 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs sm:text-sm"
            />
            <input
              type="number"
              value={filters.apyMax}
              onChange={(e) => updateFilter('apyMax', Number(e.target.value))}
              placeholder="Max"
              className="w-1/2 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Stablecoin Toggle */}
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.stablecoinOnly}
              onChange={(e) => updateFilter('stablecoinOnly', e.target.checked)}
              className="mr-2 w-4 h-4"
            />
            <span className="text-xs sm:text-sm text-slate-300">Stables only</span>
          </label>
        </div>
      </div>

      {/* Chain Filter - Accordion */}
      <div>
        <button
          onClick={() => setChainsExpanded(!chainsExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <span>{chainsExpanded ? '▼' : '▶'}</span>
            Chains ({availableChains.length})
            {filters.chains.length > 0 && (
              <span className="text-blue-400">• {filters.chains.length} selected</span>
            )}
          </span>
          {filters.chains.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateFilter('chains', []);
              }}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Clear
            </button>
          )}
        </button>
        {chainsExpanded && (
          <div className="flex flex-wrap gap-1 p-1 mt-2">
            {allChains.map((chain) => {
              const isAvailable = availableChains.includes(chain);
              const isSelected = filters.chains.includes(chain);

              return (
                <button
                  key={chain}
                  onClick={() => isAvailable && updateFilter('chains', toggleArrayItem(filters.chains, chain))}
                  disabled={!isAvailable && !isSelected}
                  className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : isAvailable
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {chain}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Filter - Accordion */}
      <div>
        <button
          onClick={() => setProtocolsExpanded(!protocolsExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <span>{protocolsExpanded ? '▼' : '▶'}</span>
            Protocols ({availableProjects.length})
            {filters.projects.length > 0 && (
              <span className="text-green-400">• {filters.projects.length} selected</span>
            )}
          </span>
          {filters.projects.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateFilter('projects', []);
              }}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Clear
            </button>
          )}
        </button>
        {protocolsExpanded && (
          <>
            <div className="mt-2 mb-2">
              <input
                type="text"
                value={protocolSearch}
                onChange={(e) => setProtocolSearch(e.target.value)}
                placeholder="Search protocols..."
                className="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div className="flex flex-wrap gap-1 p-1">
              {allProjects
                .filter((project) => project.toLowerCase().includes(protocolSearch.toLowerCase()))
                .map((project) => {
                  const isAvailable = availableProjects.includes(project);
                  const isSelected = filters.projects.includes(project);

                  return (
                    <button
                      key={project}
                      onClick={() => isAvailable && updateFilter('projects', toggleArrayItem(filters.projects, project))}
                      disabled={!isAvailable && !isSelected}
                      className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                        isSelected
                          ? 'bg-green-600 text-white'
                          : isAvailable
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {project}
                    </button>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
