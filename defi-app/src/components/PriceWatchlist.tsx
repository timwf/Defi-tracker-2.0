import { useState, useEffect } from 'react';
import { usePrices } from '../contexts/PriceContext';
import type { WatchlistCoin } from '../utils/priceWatchlist';

export function PriceWatchlist() {
  const {
    watchlist,
    prices,
    loading,
    error,
    refreshPrices,
    addCoin,
    removeCoin,
    searchForCoins,
  } = usePrices();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WatchlistCoin[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Search for coins
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchForCoins(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchForCoins]);

  const handleAddCoin = (coin: WatchlistCoin) => {
    addCoin(coin);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  };

  const handleRemoveCoin = (coinId: string) => {
    removeCoin(coinId);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
  };

  const formatChange = (change: number | null | undefined) => {
    if (change === null || change === undefined) return { text: '-', color: 'text-slate-500' };
    const color = change >= 0 ? 'text-green-400' : 'text-red-400';
    const prefix = change >= 0 ? '+' : '';
    return { text: `${prefix}${change.toFixed(2)}%`, color };
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-medium text-white">Price Watchlist</h3>
        <div className="flex items-center gap-2">
          {!showSearch && (
            <button
              onClick={() => setShowSearch(true)}
              className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
            >
              + Add
            </button>
          )}
          <button
            onClick={refreshPrices}
            disabled={loading}
            className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50"
          >
            {loading ? '...' : '↻'}
          </button>
        </div>
      </div>

      {/* Search Input */}
      {showSearch && (
        <div className="mb-4 relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coins..."
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="px-3 py-2 bg-slate-600 text-slate-300 rounded hover:bg-slate-500 text-sm"
            >
              Cancel
            </button>
          </div>

          {/* Search Results Dropdown */}
          {(searchResults.length > 0 || searching) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              {searching ? (
                <div className="px-3 py-2 text-slate-400 text-sm">Searching...</div>
              ) : (
                searchResults.map(coin => (
                  <button
                    key={coin.id}
                    onClick={() => handleAddCoin(coin)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-600 flex items-center justify-between"
                  >
                    <span className="text-white text-sm">{coin.name}</span>
                    <span className="text-slate-400 text-xs">{coin.symbol}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-red-400 text-xs mb-3">{error}</div>
      )}

      {/* Price List */}
      {watchlist.length === 0 ? (
        <div className="text-slate-500 text-sm text-center py-4">
          No coins in watchlist. Click "+ Add" to add some.
        </div>
      ) : (
        <div className="space-y-2">
          {watchlist.map(coin => {
            const priceData = prices.find(p => p.id === coin.id);
            const change24h = formatChange(priceData?.price_change_percentage_24h);
            const change7d = formatChange(priceData?.price_change_percentage_7d);

            return (
              <div
                key={coin.id}
                className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0 group"
              >
                <div className="flex items-center gap-2">
                  {priceData?.image && (
                    <img src={priceData.image} alt={coin.symbol} className="w-6 h-6 rounded-full" />
                  )}
                  <div>
                    <span className="text-white font-medium text-sm">{coin.symbol}</span>
                    <span className="text-slate-500 text-xs ml-1 hidden sm:inline">{coin.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-white font-medium text-sm">
                      {priceData ? formatPrice(priceData.current_price) : '-'}
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className={change24h.color}>{change24h.text}</span>
                      <span className="text-slate-600">|</span>
                      <span className={change7d.color}>{change7d.text}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveCoin(coin.id)}
                    className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                    title="Remove from watchlist"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-xs text-slate-600 mt-3 text-right">
        via CoinGecko · updates every 30s
      </div>
    </div>
  );
}
