import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  fetchPrices,
  searchCoins,
  type CoinPrice,
  type WatchlistCoin,
} from '../utils/priceWatchlist';

interface PriceContextType {
  watchlist: WatchlistCoin[];
  prices: CoinPrice[];
  loading: boolean;
  error: string | null;
  refreshPrices: () => Promise<void>;
  addCoin: (coin: WatchlistCoin) => void;
  removeCoin: (coinId: string) => void;
  searchForCoins: (query: string) => Promise<WatchlistCoin[]>;
  getPrice: (coinId: string) => number | null;
}

const PriceContext = createContext<PriceContextType | null>(null);

export function PriceProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistCoin[]>([]);
  const [prices, setPrices] = useState<CoinPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load watchlist on mount
  useEffect(() => {
    setWatchlist(getWatchlist());
  }, []);

  // Fetch prices when watchlist changes
  const refreshPrices = useCallback(async () => {
    if (watchlist.length === 0) {
      setPrices([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const coinIds = watchlist.map(c => c.id);
      const data = await fetchPrices(coinIds);
      setPrices(data);
    } catch (err) {
      setError('Failed to load prices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [watchlist]);

  useEffect(() => {
    refreshPrices();
    // Refresh prices every 30 seconds
    const interval = setInterval(refreshPrices, 30000);
    return () => clearInterval(interval);
  }, [refreshPrices]);

  const addCoin = useCallback((coin: WatchlistCoin) => {
    const updated = addToWatchlist(coin);
    setWatchlist(updated);
  }, []);

  const removeCoin = useCallback((coinId: string) => {
    const updated = removeFromWatchlist(coinId);
    setWatchlist(updated);
  }, []);

  const searchForCoins = useCallback(async (query: string): Promise<WatchlistCoin[]> => {
    if (!query || query.length < 2) return [];
    try {
      const results = await searchCoins(query);
      // Filter out coins already in watchlist
      return results.filter(r => !watchlist.find(w => w.id === r.id));
    } catch (err) {
      console.error('Search failed:', err);
      return [];
    }
  }, [watchlist]);

  // Get price for a specific coin by ID
  const getPrice = useCallback((coinId: string): number | null => {
    const priceData = prices.find(p => p.id === coinId);
    return priceData?.current_price ?? null;
  }, [prices]);

  return (
    <PriceContext.Provider
      value={{
        watchlist,
        prices,
        loading,
        error,
        refreshPrices,
        addCoin,
        removeCoin,
        searchForCoins,
        getPrice,
      }}
    >
      {children}
    </PriceContext.Provider>
  );
}

export function usePrices() {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error('usePrices must be used within a PriceProvider');
  }
  return context;
}
