import { useState, useRef, useEffect, useMemo } from 'react';

// Token groups like DefiLlama
const TOKEN_GROUPS: Record<string, string[]> = {
  'ALL_USD_STABLES': ['USDC', 'USDT', 'DAI', 'FRAX', 'LUSD', 'SUSD', 'TUSD', 'USDD', 'USDP', 'GUSD', 'BUSD', 'CUSD', 'EUSD', 'DOLA', 'MIM', 'ALUSD', 'SUSD', 'USDS', 'CRVUSD', 'GHO', 'PYUSD'],
  'ALL_BITCOINS': ['WBTC', 'BTC', 'BTCB', 'TBTC', 'SBTC', 'RENBTC', 'HBTC', 'CBBTC'],
  'ALL_ETH': ['ETH', 'WETH', 'STETH', 'WSTETH', 'RETH', 'CBETH', 'FRXETH', 'SFRXETH', 'METH', 'WEETH', 'SWETH', 'ANKRETH', 'OETH'],
};

interface TokensDropdownProps {
  availableTokens: string[];
  selectedTokens: string[];
  onChange: (tokens: string[]) => void;
}

export function TokensDropdown({ availableTokens, selectedTokens, onChange }: TokensDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get unique base tokens from symbols (e.g., "USDC-WETH" -> ["USDC", "WETH"])
  const allTokens = useMemo(() => {
    const tokens = new Set<string>();
    availableTokens.forEach(symbol => {
      // Split by common separators
      const parts = symbol.split(/[-_\/]/);
      parts.forEach(part => {
        // Clean up token names
        const clean = part.toUpperCase().trim();
        if (clean.length > 0 && clean.length < 15) {
          tokens.add(clean);
        }
      });
    });
    return Array.from(tokens).sort();
  }, [availableTokens]);

  // Filter tokens by search
  const filteredTokens = useMemo(() => {
    if (!search) return allTokens;
    const q = search.toUpperCase();
    return allTokens.filter(t => t.includes(q));
  }, [allTokens, search]);

  // Check if a group is fully selected
  const isGroupSelected = (groupTokens: string[]) => {
    const available = groupTokens.filter(t => allTokens.includes(t));
    return available.length > 0 && available.every(t => selectedTokens.includes(t));
  };

  // Toggle a single token
  const toggleToken = (token: string) => {
    if (selectedTokens.includes(token)) {
      onChange(selectedTokens.filter(t => t !== token));
    } else {
      onChange([...selectedTokens, token]);
    }
  };

  // Toggle a group
  const toggleGroup = (groupName: string) => {
    const groupTokens = TOKEN_GROUPS[groupName].filter(t => allTokens.includes(t));
    if (isGroupSelected(groupTokens)) {
      onChange(selectedTokens.filter(t => !groupTokens.includes(t)));
    } else {
      const newTokens = new Set([...selectedTokens, ...groupTokens]);
      onChange(Array.from(newTokens));
    }
  };

  const clearAll = () => onChange([]);
  const selectAll = () => onChange([...allTokens]);

  const selectedCount = selectedTokens.length;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors ${
          selectedCount > 0
            ? 'bg-purple-600/20 border-purple-500 text-purple-300'
            : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
        }`}
      >
        <span>Tokens</span>
        {selectedCount > 0 && (
          <span className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded">
            {selectedCount}
          </span>
        )}
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-72 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-96 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-slate-700">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
          </div>

          {/* Clear/Toggle all */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
            <button
              onClick={clearAll}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Clear
            </button>
            <button
              onClick={selectAll}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Toggle all
            </button>
          </div>

          {/* Token list */}
          <div className="max-h-64 overflow-y-auto">
            {/* Groups */}
            {Object.entries(TOKEN_GROUPS).map(([groupName, groupTokens]) => {
              const availableInGroup = groupTokens.filter(t => allTokens.includes(t));
              if (availableInGroup.length === 0) return null;

              const isSelected = isGroupSelected(groupTokens);

              return (
                <button
                  key={groupName}
                  onClick={() => toggleGroup(groupName)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{groupName}</span>
                    <span className="text-xs text-purple-400">Only</span>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected ? 'bg-purple-500 border-purple-500' : 'border-slate-500'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Divider */}
            <div className="border-t border-slate-700 my-1" />

            {/* Individual tokens */}
            {filteredTokens.map(token => {
              const isSelected = selectedTokens.includes(token);
              return (
                <button
                  key={token}
                  onClick={() => toggleToken(token)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700 transition-colors"
                >
                  <span className="text-slate-300">{token}</span>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected ? 'bg-purple-500 border-purple-500' : 'border-slate-500'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
