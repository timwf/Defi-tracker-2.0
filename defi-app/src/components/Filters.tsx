import { useState, useEffect, useCallback, memo, useRef } from 'react';
import type { Filters } from '../types/pool';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import { ActiveFilters } from './ActiveFilters';
import { TokensDropdown } from './TokensDropdown';

interface FiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availableChains: string[];
  availableProjects: string[];
  allChains: string[];
  allProjects: string[];
  allSymbols: string[];
}

// Format TVL for display in input (e.g., 1000000 -> "1M")
const formatTvlInput = (value: number): string => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000)}M`;
  if (value >= 1_000) return `${(value / 1_000)}K`;
  return `${value}`;
};

// Parse TVL input (supports "1M", "500K", "1B", or raw numbers)
const parseTvlInput = (input: string): number => {
  const cleaned = input.trim().toUpperCase().replace(/[$,]/g, '');
  if (!cleaned) return 0;

  const match = cleaned.match(/^([\d.]+)\s*([KMB])?$/);
  if (!match) return 0;

  const num = parseFloat(match[1]);
  const suffix = match[2];

  if (suffix === 'B') return num * 1_000_000_000;
  if (suffix === 'M') return num * 1_000_000;
  if (suffix === 'K') return num * 1_000;
  return num;
};

export const FiltersPanel = memo(function FiltersPanel({
  filters,
  onFiltersChange,
  availableChains,
  availableProjects,
  allChains,
  allProjects,
  allSymbols,
}: FiltersProps) {
  // Local state for text inputs - updates immediately for responsive UI
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [localTvlMin, setLocalTvlMin] = useState(filters.tvlMin === 0 ? '' : formatTvlInput(filters.tvlMin));
  const [localTvlMax, setLocalTvlMax] = useState(filters.tvlMax >= 10_000_000_000 ? '' : formatTvlInput(filters.tvlMax));
  const [localApyMin, setLocalApyMin] = useState(filters.apyMin === 0 ? '' : String(filters.apyMin));
  const [localApyMax, setLocalApyMax] = useState(filters.apyMax >= 1000 ? '' : String(filters.apyMax));

  // Track the last value WE sent to parent to avoid sync loops
  const lastSentSearch = useRef(filters.search);
  const lastSentTvl = useRef({ min: filters.tvlMin, max: filters.tvlMax });
  const lastSentApy = useRef({ min: filters.apyMin, max: filters.apyMax });

  // Debounce search - only update parent after 300ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        lastSentSearch.current = localSearch;
        onFiltersChange({ ...filters, search: localSearch });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, filters, onFiltersChange]);

  // Debounce numeric inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      const tvlMin = parseTvlInput(localTvlMin);
      const tvlMax = localTvlMax === '' ? 10_000_000_000 : parseTvlInput(localTvlMax);
      const apyMin = localApyMin === '' ? 0 : Number(localApyMin);
      const apyMax = localApyMax === '' ? 1000 : Number(localApyMax);

      if (tvlMin !== filters.tvlMin || tvlMax !== filters.tvlMax ||
          apyMin !== filters.apyMin || apyMax !== filters.apyMax) {
        lastSentTvl.current = { min: tvlMin, max: tvlMax };
        lastSentApy.current = { min: apyMin, max: apyMax };
        onFiltersChange({ ...filters, tvlMin, tvlMax, apyMin, apyMax });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localTvlMin, localTvlMax, localApyMin, localApyMax, filters, onFiltersChange]);

  // Sync local state ONLY when filters change externally (not from our own updates)
  useEffect(() => {
    // Only sync search if it wasn't a change we made
    if (filters.search !== lastSentSearch.current) {
      setLocalSearch(filters.search);
    }
    lastSentSearch.current = filters.search;
  }, [filters.search]);

  useEffect(() => {
    // Only sync TVL if it wasn't a change we made
    if (filters.tvlMin !== lastSentTvl.current.min || filters.tvlMax !== lastSentTvl.current.max) {
      setLocalTvlMin(filters.tvlMin === 0 ? '' : formatTvlInput(filters.tvlMin));
      setLocalTvlMax(filters.tvlMax >= 10_000_000_000 ? '' : formatTvlInput(filters.tvlMax));
    }
    lastSentTvl.current = { min: filters.tvlMin, max: filters.tvlMax };
  }, [filters.tvlMin, filters.tvlMax]);

  useEffect(() => {
    // Only sync APY if it wasn't a change we made
    if (filters.apyMin !== lastSentApy.current.min || filters.apyMax !== lastSentApy.current.max) {
      setLocalApyMin(filters.apyMin === 0 ? '' : String(filters.apyMin));
      setLocalApyMax(filters.apyMax >= 1000 ? '' : String(filters.apyMax));
    }
    lastSentApy.current = { min: filters.apyMin, max: filters.apyMax };
  }, [filters.apyMin, filters.apyMax]);

  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  }, [filters, onFiltersChange]);

  const chainOptions = allChains.map((chain) => ({
    value: chain,
    available: availableChains.includes(chain),
  }));

  const projectOptions = allProjects.map((project) => ({
    value: project,
    available: availableProjects.includes(project),
  }));

  const clearAll = useCallback(() => {
    setLocalSearch('');
    setLocalTvlMin('');
    setLocalTvlMax('');
    setLocalApyMin('');
    setLocalApyMax('');
    onFiltersChange({
      chains: [],
      projects: [],
      tokens: [],
      stablecoinOnly: false,
      tvlMin: 0,
      tvlMax: 10_000_000_000,
      apyMin: 0,
      apyMax: 1000,
      search: '',
    });
  }, [onFiltersChange]);

  return (
    <div className="bg-slate-800 p-3 sm:p-4 rounded-lg mb-4 space-y-4">
      {/* Row 1: Search (full width on mobile) */}
      <div className="w-full">
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search pools..."
          className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      {/* Row 2: Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Tokens Dropdown */}
        <TokensDropdown
          availableTokens={allSymbols}
          selectedTokens={filters.tokens}
          onChange={(tokens) => updateFilter('tokens', tokens)}
        />

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

        {/* Stablecoin Toggle */}
        <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-md cursor-pointer hover:bg-slate-600 transition-colors">
          <input
            type="checkbox"
            checked={filters.stablecoinOnly}
            onChange={(e) => updateFilter('stablecoinOnly', e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-slate-300">Stables Only</span>
        </label>

        {/* Reset */}
        <button
          onClick={clearAll}
          className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Row 3: TVL and APY Range inputs */}
      <div className="flex flex-wrap items-center gap-3">
        {/* TVL Range */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">TVL:</span>
          <input
            type="text"
            value={localTvlMin}
            onChange={(e) => setLocalTvlMin(e.target.value)}
            placeholder="Min"
            className="w-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-base sm:text-sm text-center focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <span className="text-slate-500">-</span>
          <input
            type="text"
            value={localTvlMax}
            onChange={(e) => setLocalTvlMax(e.target.value)}
            placeholder="Max"
            className="w-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-base sm:text-sm text-center focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* APY Range */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">APY:</span>
          <input
            type="text"
            value={localApyMin}
            onChange={(e) => setLocalApyMin(e.target.value)}
            placeholder="Min"
            className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-base sm:text-sm text-center focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <span className="text-slate-500">-</span>
          <input
            type="text"
            value={localApyMax}
            onChange={(e) => setLocalApyMax(e.target.value)}
            placeholder="Max"
            className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-base sm:text-sm text-center focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <span className="text-sm text-slate-400">%</span>
        </div>
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
        onRemoveToken={(token) =>
          updateFilter('tokens', filters.tokens.filter((t) => t !== token))
        }
        onClearTvl={() => onFiltersChange({ ...filters, tvlMin: 0, tvlMax: 10_000_000_000 })}
        onClearApy={() => {
          onFiltersChange({ ...filters, apyMin: 0, apyMax: 1000 });
        }}
        onClearStablecoin={() => updateFilter('stablecoinOnly', false)}
        onClearSearch={() => updateFilter('search', '')}
        onClearAll={clearAll}
      />
    </div>
  );
});
