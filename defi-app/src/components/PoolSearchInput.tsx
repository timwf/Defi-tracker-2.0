import { useState, useMemo, useRef, useEffect } from 'react';
import type { Pool } from '../types/pool';

interface PoolSearchInputProps {
  pools: Pool[];
  onSelect: (pool: Pool) => void;
  selectedPool: Pool | null;
  onClear: () => void;
  excludePoolIds?: string[];
}

export function PoolSearchInput({ pools, onSelect, selectedPool, onClear, excludePoolIds = [] }: PoolSearchInputProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter pools based on search query
  const filteredPools = useMemo(() => {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase().trim();

    // Check for exact pool ID match first (UUID format)
    const exactMatch = pools.find(pool =>
      pool.pool.toLowerCase() === queryLower && !excludePoolIds.includes(pool.pool)
    );
    if (exactMatch) return [exactMatch];

    // Also check for partial pool ID match (in case of copy/paste issues)
    if (queryLower.length > 8 && queryLower.includes('-')) {
      const partialIdMatches = pools.filter(pool =>
        pool.pool.toLowerCase().includes(queryLower) && !excludePoolIds.includes(pool.pool)
      );
      if (partialIdMatches.length > 0) return partialIdMatches.slice(0, 15);
    }

    // Split query into individual terms
    const terms = queryLower.split(/\s+/).filter(t => t.length > 0);
    if (terms.length === 0) return [];

    return pools
      .filter(pool => {
        // Exclude already held pools
        if (excludePoolIds.includes(pool.pool)) return false;

        // Combine all searchable fields into one string
        const searchableText = `${pool.symbol} ${pool.chain} ${pool.project} ${pool.pool}`.toLowerCase();

        // ALL terms must match somewhere in the searchable text
        return terms.every(term => searchableText.includes(term));
      })
      .slice(0, 15); // Limit to 15 results
  }, [pools, query, excludePoolIds]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredPools]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredPools.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(i => Math.min(i + 1, filteredPools.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredPools[highlightedIndex]) {
          handleSelect(filteredPools[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (pool: Pool) => {
    onSelect(pool);
    setQuery('');
    setIsOpen(false);
  };

  const formatTvl = (tvl: number) => {
    if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(1)}M`;
    if (tvl >= 1_000) return `$${(tvl / 1_000).toFixed(0)}K`;
    return `$${tvl.toFixed(0)}`;
  };

  // If a pool is selected, show it with clear option
  if (selectedPool) {
    return (
      <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-medium">{selectedPool.symbol}</div>
            <div className="text-sm text-slate-400">
              {selectedPool.project} on {selectedPool.chain}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm">
              <span className="text-green-400">{selectedPool.apy.toFixed(2)}% APY</span>
              <span className="text-slate-400">{formatTvl(selectedPool.tvlUsd)} TVL</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-slate-400 hover:text-red-400 p-1"
            title="Clear selection"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search by symbol, chain, protocol, or pool ID..."
          className="w-full pl-9 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>

      {/* Dropdown results */}
      {isOpen && query.trim() && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-80 overflow-y-auto"
        >
          {filteredPools.length === 0 ? (
            <div className="p-3 text-sm text-slate-400 text-center">
              No pools found matching "{query}"
            </div>
          ) : (
            filteredPools.map((pool, index) => (
              <button
                key={pool.pool}
                type="button"
                onClick={() => handleSelect(pool)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full text-left p-3 border-b border-slate-700 last:border-b-0 transition-colors ${
                  index === highlightedIndex ? 'bg-slate-700' : 'hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-white font-medium truncate">{pool.symbol}</div>
                    <div className="text-xs text-slate-400 truncate">
                      {pool.project} · {pool.chain}
                    </div>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <div className="text-green-400 text-sm font-medium">{pool.apy.toFixed(2)}%</div>
                    <div className="text-xs text-slate-500">{formatTvl(pool.tvlUsd)}</div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
