// CoinGecko API for live prices
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const WATCHLIST_STORAGE_KEY = 'defi-tracker-watchlist';

export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  image: string;
  market_cap: number;
  market_cap_rank: number;
}

export interface WatchlistCoin {
  id: string; // CoinGecko ID (e.g., "ethereum")
  symbol: string;
  name: string;
}

// Default coins to start with
const DEFAULT_WATCHLIST: WatchlistCoin[] = [
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
];

// Get watchlist from localStorage
export function getWatchlist(): WatchlistCoin[] {
  try {
    const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!stored) {
      // Initialize with defaults
      saveWatchlist(DEFAULT_WATCHLIST);
      return DEFAULT_WATCHLIST;
    }
    return JSON.parse(stored);
  } catch {
    return DEFAULT_WATCHLIST;
  }
}

// Save watchlist to localStorage
export function saveWatchlist(watchlist: WatchlistCoin[]): void {
  localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
}

// Add coin to watchlist
export function addToWatchlist(coin: WatchlistCoin): WatchlistCoin[] {
  const watchlist = getWatchlist();
  if (!watchlist.find(c => c.id === coin.id)) {
    watchlist.push(coin);
    saveWatchlist(watchlist);
  }
  return watchlist;
}

// Remove coin from watchlist
export function removeFromWatchlist(coinId: string): WatchlistCoin[] {
  const watchlist = getWatchlist().filter(c => c.id !== coinId);
  saveWatchlist(watchlist);
  return watchlist;
}

// Fetch prices for watchlist coins
export async function fetchPrices(coinIds: string[]): Promise<CoinPrice[]> {
  if (coinIds.length === 0) return [];

  const ids = coinIds.join(',');
  const url = `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h,7d`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch prices');
  }

  const data = await response.json();
  return data.map((coin: any) => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    current_price: coin.current_price,
    price_change_percentage_24h: coin.price_change_percentage_24h,
    price_change_percentage_7d: coin.price_change_percentage_7d_in_currency,
    image: coin.image,
    market_cap: coin.market_cap,
    market_cap_rank: coin.market_cap_rank,
  }));
}

// Search for coins by name/symbol
export async function searchCoins(query: string): Promise<WatchlistCoin[]> {
  if (!query || query.length < 2) return [];

  const url = `${COINGECKO_API}/search?query=${encodeURIComponent(query)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to search coins');
  }

  const data = await response.json();
  return data.coins.slice(0, 10).map((coin: any) => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
  }));
}
