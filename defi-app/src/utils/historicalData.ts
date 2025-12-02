import type { PoolHistoricalData, HistoricalDataPoint, CalculatedMetrics } from '../types/pool';

const CACHE_KEY = 'defi-tracker-historical';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Cache management
export function getCache(): Record<string, PoolHistoricalData> {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

export function saveToCache(poolId: string, data: HistoricalDataPoint[]): void {
  const cache = getCache();
  cache[poolId] = {
    poolId,
    data,
    fetchedAt: Date.now(),
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export function getCachedData(poolId: string): PoolHistoricalData | null {
  const cache = getCache();
  return cache[poolId] || null;
}

export function isCacheValid(poolId: string): boolean {
  const cached = getCachedData(poolId);
  if (!cached) return false;
  return Date.now() - cached.fetchedAt < CACHE_EXPIRY_MS;
}

export function getCacheAge(poolId: string): string {
  const cached = getCachedData(poolId);
  if (!cached) return 'Not fetched';

  const ageMs = Date.now() - cached.fetchedAt;
  const hours = Math.floor(ageMs / (1000 * 60 * 60));
  const minutes = Math.floor((ageMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${minutes}m ago`;
  return `${minutes}m ago`;
}

// Fetch historical data for a single pool
export async function fetchPoolHistory(poolId: string): Promise<HistoricalDataPoint[]> {
  const response = await fetch(`https://yields.llama.fi/chart/${poolId}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const result = await response.json();
  return result.data || [];
}

// Fetch with caching
export async function fetchPoolHistoryWithCache(
  poolId: string,
  forceRefresh = false
): Promise<HistoricalDataPoint[]> {
  if (!forceRefresh && isCacheValid(poolId)) {
    const cached = getCachedData(poolId);
    return cached?.data || [];
  }

  const data = await fetchPoolHistory(poolId);
  saveToCache(poolId, data);
  return data;
}

// Batch fetch with rate limiting
export interface FetchProgress {
  current: number;
  total: number;
  poolId: string;
  status: 'fetching' | 'cached' | 'error';
}

export async function fetchMultiplePoolsHistory(
  poolIds: string[],
  onProgress: (progress: FetchProgress) => void,
  delayMs = 1500,
  forceRefresh = false
): Promise<Map<string, HistoricalDataPoint[]>> {
  const results = new Map<string, HistoricalDataPoint[]>();

  for (let i = 0; i < poolIds.length; i++) {
    const poolId = poolIds[i];

    try {
      // Check cache first
      if (!forceRefresh && isCacheValid(poolId)) {
        const cached = getCachedData(poolId);
        results.set(poolId, cached?.data || []);
        onProgress({ current: i + 1, total: poolIds.length, poolId, status: 'cached' });
      } else {
        onProgress({ current: i + 1, total: poolIds.length, poolId, status: 'fetching' });
        const data = await fetchPoolHistory(poolId);
        saveToCache(poolId, data);
        results.set(poolId, data);

        // Rate limit delay (skip on last item)
        if (i < poolIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    } catch (error) {
      console.error(`Failed to fetch ${poolId}:`, error);
      onProgress({ current: i + 1, total: poolIds.length, poolId, status: 'error' });
      results.set(poolId, []);
    }
  }

  return results;
}

// Calculate metrics from historical data
export function calculateMetrics(data: HistoricalDataPoint[]): CalculatedMetrics | null {
  if (!data || data.length < 7) return null;

  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Filter to last 90 days
  const recent90 = data.filter(d => new Date(d.timestamp) >= ninetyDaysAgo);

  if (recent90.length < 7) return null;

  // Base90: 90-day average of apyBase (or apy if apyBase is null)
  const baseValues = recent90.map(d => d.apyBase ?? d.apy).filter(v => v !== null) as number[];
  const base90 = baseValues.reduce((a, b) => a + b, 0) / baseValues.length;

  // Volatility: standard deviation
  const mean = base90;
  const squaredDiffs = baseValues.map(v => Math.pow(v - mean, 2));
  const volatility = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / baseValues.length);

  // Organic %: average of (apyBase / apy * 100)
  const organicValues = recent90
    .filter(d => d.apy > 0)
    .map(d => ((d.apyBase ?? d.apy) / d.apy) * 100);
  const organicPct = organicValues.length > 0
    ? organicValues.reduce((a, b) => a + b, 0) / organicValues.length
    : 100;

  // TVL change 30d
  const recent30 = data.filter(d => new Date(d.timestamp) >= thirtyDaysAgo);
  const currentTvl = data[data.length - 1]?.tvlUsd || 0;
  const oldTvl = recent30[0]?.tvlUsd || currentTvl;
  const tvlChange30d = oldTvl > 0 ? ((currentTvl - oldTvl) / oldTvl) * 100 : 0;

  // Risk-adjusted yield (simplified version)
  // RiskAdj = Base90 - (volatility * 0.1) - incentive_risk
  const volPenalty = volatility * 0.1 + Math.pow(Math.max(0, volatility - 3), 1.5);
  const incentiveRisk = base90 * (1 - organicPct / 100) * 0.5;
  const riskAdjustedYield = base90 - volPenalty - incentiveRisk;

  return {
    base90: Math.round(base90 * 100) / 100,
    volatility: Math.round(volatility * 100) / 100,
    organicPct: Math.round(organicPct),
    tvlChange30d: Math.round(tvlChange30d * 10) / 10,
    riskAdjustedYield: Math.round(riskAdjustedYield * 100) / 100,
    dataPoints: data.length,
    oldestDate: data[0]?.timestamp.split('T')[0] || '',
  };
}

// Get metrics for a pool (from cache)
export function getPoolMetrics(poolId: string): CalculatedMetrics | null {
  const cached = getCachedData(poolId);
  if (!cached) return null;
  return calculateMetrics(cached.data);
}

// Check how many pools have cached data
export function getCacheStats(): { total: number; valid: number; poolIds: string[] } {
  const cache = getCache();
  const poolIds = Object.keys(cache);
  const valid = poolIds.filter(id => isCacheValid(id)).length;
  return { total: poolIds.length, valid, poolIds };
}

// Clear all cached data
export function clearCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
