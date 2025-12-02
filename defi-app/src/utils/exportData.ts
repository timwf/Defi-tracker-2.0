import type { Pool, CalculatedMetrics, Filters, HeldPosition } from '../types/pool';
import { getPoolMetrics, getCachedData } from './historicalData';

export interface ExportedPool {
  // Basic info
  poolId: string;
  symbol: string;
  project: string;
  chain: string;

  // Current metrics from API
  tvlUsd: number;
  apy: number;
  apyBase: number | null;
  apyReward: number | null;
  stablecoin: boolean;

  // API-provided changes
  apyPct1D: number | null;
  apyPct7D: number | null;
  apyPct30D: number | null;

  // API-provided analysis
  sigma: number;
  mu: number;
  outlier: boolean;
  ilRisk: string;
  exposure: string;
  predictions: {
    predictedClass: string;
    predictedProbability: number;
    binnedConfidence: number;
  } | null;

  // Volume data
  volumeUsd1d: number | null;
  volumeUsd7d: number | null;

  // Other API fields
  apyMean30d: number | null;
  apyBase7d: number | null;
  il7d: number | null;
  count: number;
  rewardTokens: string[] | null;
  underlyingTokens: string[] | null;
  poolMeta: string | null;

  // Calculated historical metrics (if available)
  historical: {
    hasData: boolean;
    base90: number | null;
    volatility: number | null;
    organicPct: number | null;
    tvlChange30d: number | null;
    dataPoints: number | null;
    oldestDate: string | null;
    trend: 'up' | 'down' | 'stable' | null;
  };

  // User's position status
  isHeldPosition: boolean;

  // DefiLlama link
  defiLlamaUrl: string;
}

export interface ExportData {
  exportedAt: string;
  poolCount: number;
  heldPositionCount: number;
  filters: Filters;
  heldPositions: HeldPosition[];
  pools: ExportedPool[];
}

function getTrend(currentApyBase: number | null, base90: number | null): 'up' | 'down' | 'stable' | null {
  if (currentApyBase === null || base90 === null) return null;
  const diff = currentApyBase - base90;
  if (Math.abs(diff) < 0.1) return 'stable';
  return diff > 0 ? 'up' : 'down';
}

export function exportPoolsForAI(
  pools: Pool[],
  filters: Filters,
  heldPositions: HeldPosition[]
): ExportData {
  const heldPoolIds = heldPositions.map(p => p.poolId);

  const exportedPools: ExportedPool[] = pools.map((pool) => {
    const metrics: CalculatedMetrics | null = getPoolMetrics(pool.pool);
    const hasHistoricalData = getCachedData(pool.pool) !== null;

    return {
      // Basic info
      poolId: pool.pool,
      symbol: pool.symbol,
      project: pool.project,
      chain: pool.chain,

      // Current metrics from API
      tvlUsd: pool.tvlUsd,
      apy: pool.apy,
      apyBase: pool.apyBase,
      apyReward: pool.apyReward,
      stablecoin: pool.stablecoin,

      // API-provided changes
      apyPct1D: pool.apyPct1D,
      apyPct7D: pool.apyPct7D,
      apyPct30D: pool.apyPct30D,

      // API-provided analysis
      sigma: pool.sigma,
      mu: pool.mu,
      outlier: pool.outlier,
      ilRisk: pool.ilRisk,
      exposure: pool.exposure,
      predictions: pool.predictions,

      // Volume data
      volumeUsd1d: pool.volumeUsd1d,
      volumeUsd7d: pool.volumeUsd7d,

      // Other API fields
      apyMean30d: pool.apyMean30d,
      apyBase7d: pool.apyBase7d,
      il7d: pool.il7d,
      count: pool.count,
      rewardTokens: pool.rewardTokens,
      underlyingTokens: pool.underlyingTokens,
      poolMeta: pool.poolMeta,

      // Calculated historical metrics
      historical: {
        hasData: hasHistoricalData,
        base90: metrics?.base90 ?? null,
        volatility: metrics?.volatility ?? null,
        organicPct: metrics?.organicPct ?? null,
        tvlChange30d: metrics?.tvlChange30d ?? null,
        dataPoints: metrics?.dataPoints ?? null,
        oldestDate: metrics?.oldestDate ?? null,
        trend: getTrend(pool.apyBase, metrics?.base90 ?? null),
      },

      // User's position status
      isHeldPosition: heldPoolIds.includes(pool.pool),

      // DefiLlama link
      defiLlamaUrl: `https://defillama.com/yields/pool/${pool.pool}`,
    };
  });

  return {
    exportedAt: new Date().toISOString(),
    poolCount: exportedPools.length,
    heldPositionCount: heldPositions.length,
    filters,
    heldPositions,
    pools: exportedPools,
  };
}

export function downloadExport(data: ExportData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `defi-pools-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyExportToClipboard(data: ExportData): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  return navigator.clipboard.writeText(json);
}
