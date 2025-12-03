import type { PoolHistoricalData, HistoricalDataPoint, CalculatedMetrics } from '../types/pool';

const CACHE_KEY = 'defi-tracker-historical';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory cache to avoid repeated localStorage parsing
let memoryCache: Record<string, PoolHistoricalData> | null = null;
let memoryCacheTimestamp = 0;
const MEMORY_CACHE_TTL = 1000; // 1 second TTL for memory cache

// Memoized metrics cache (declared early for use in saveToCache)
let metricsCache: Map<string, CalculatedMetrics | null> = new Map();
let metricsCacheVersion = 0;

// Cache management
export function getCache(): Record<string, PoolHistoricalData> {
  const now = Date.now();

  // Return memory cache if still valid
  if (memoryCache && (now - memoryCacheTimestamp) < MEMORY_CACHE_TTL) {
    return memoryCache;
  }

  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) {
      memoryCache = {};
    } else {
      memoryCache = JSON.parse(stored);
    }
    memoryCacheTimestamp = now;
    return memoryCache!;
  } catch {
    memoryCache = {};
    memoryCacheTimestamp = now;
    return {};
  }
}

// Invalidate memory cache (call after saving)
export function invalidateMemoryCache(): void {
  memoryCache = null;
  memoryCacheTimestamp = 0;
}

export function saveToCache(poolId: string, data: HistoricalDataPoint[]): void {
  const cache = getCache();

  // Only keep last 90 days of data to save space
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const trimmedData = data.filter(d => new Date(d.timestamp) >= ninetyDaysAgo);

  cache[poolId] = {
    poolId,
    data: trimmedData,
    fetchedAt: Date.now(),
  };

  // Prune expired entries before saving
  const now = Date.now();
  for (const id of Object.keys(cache)) {
    if (now - cache[id].fetchedAt > CACHE_EXPIRY_MS) {
      delete cache[id];
    }
  }

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    // Quota exceeded - clear oldest entries and retry
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      pruneOldestEntries(cache, 10);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch {
        // Still failing - clear half the cache
        pruneOldestEntries(cache, Math.floor(Object.keys(cache).length / 2));
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      }
    }
  }

  invalidateMemoryCache(); // Force refresh on next read
  // Clear the memoized metrics for this pool
  metricsCache.delete(poolId);
  metricsCacheVersion++;
}

// Remove oldest N entries from cache
function pruneOldestEntries(cache: Record<string, PoolHistoricalData>, count: number): void {
  const entries = Object.entries(cache).sort((a, b) => a[1].fetchedAt - b[1].fetchedAt);
  for (let i = 0; i < Math.min(count, entries.length); i++) {
    delete cache[entries[i][0]];
  }
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
  _batchSize = 1, // Ignored - always sequential now
  forceRefresh = false,
  signal?: AbortSignal
): Promise<Map<string, HistoricalDataPoint[]>> {
  const results = new Map<string, HistoricalDataPoint[]>();

  // Process one at a time with delay to avoid rate limits
  for (let i = 0; i < poolIds.length; i++) {
    if (signal?.aborted) break;

    const poolId = poolIds[i];

    try {
      // Check cache first
      if (!forceRefresh && isCacheValid(poolId)) {
        const cached = getCachedData(poolId);
        results.set(poolId, cached?.data || []);
        onProgress({ current: i + 1, total: poolIds.length, poolId, status: 'cached' });
      } else {
        const data = await fetchPoolHistory(poolId);
        saveToCache(poolId, data);
        results.set(poolId, data);
        onProgress({ current: i + 1, total: poolIds.length, poolId, status: 'fetching' });
      }
    } catch (error) {
      console.error(`Failed to fetch ${poolId}:`, error);
      onProgress({ current: i + 1, total: poolIds.length, poolId, status: 'error' });
      results.set(poolId, []);
    }

    // Delay between requests to avoid rate limits (1.5 seconds)
    if (i < poolIds.length - 1 && !signal?.aborted) {
      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, 1500);
        signal?.addEventListener('abort', () => {
          clearTimeout(timeout);
          resolve(undefined);
        });
      });
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

// Get metrics for a pool (from cache) - memoized
export function getPoolMetrics(poolId: string): CalculatedMetrics | null {
  // Check if we have memoized result
  if (metricsCache.has(poolId)) {
    return metricsCache.get(poolId) ?? null;
  }

  const cached = getCachedData(poolId);
  if (!cached) {
    metricsCache.set(poolId, null);
    return null;
  }

  const metrics = calculateMetrics(cached.data);
  metricsCache.set(poolId, metrics);
  return metrics;
}

// Get all metrics as a map (for efficient sorting)
export function getAllPoolMetrics(): Map<string, CalculatedMetrics> {
  const cache = getCache();
  const result = new Map<string, CalculatedMetrics>();

  for (const poolId of Object.keys(cache)) {
    const metrics = getPoolMetrics(poolId);
    if (metrics) {
      result.set(poolId, metrics);
    }
  }

  return result;
}

// Clear metrics cache (call when historical data changes)
export function invalidateMetricsCache(): void {
  metricsCache.clear();
  metricsCacheVersion++;
}

// Get current metrics cache version (for React dependencies)
export function getMetricsCacheVersion(): number {
  return metricsCacheVersion;
}

// Check how many pools have cached data
export function getCacheStats(): { total: number; valid: number; poolIds: string[] } {
  const cache = getCache();
  const poolIds = Object.keys(cache);
  const valid = poolIds.filter(id => isCacheValid(id)).length;
  return { total: poolIds.length, valid, poolIds };
}

// Get pool IDs that don't have valid cache (need fetching)
export function getUncachedPoolIds(poolIds: string[]): string[] {
  return poolIds.filter(id => !isCacheValid(id));
}

// Clear all cached data
export function clearCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
