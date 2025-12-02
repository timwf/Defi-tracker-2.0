export interface Pool {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apyBase: number | null;
  apyReward: number | null;
  apy: number;
  rewardTokens: string[] | null;
  stablecoin: boolean;
  ilRisk: string;
  exposure: string;
  predictions: {
    predictedClass: string;
    predictedProbability: number;
    binnedConfidence: number;
  } | null;
  poolMeta: string | null;
  mu: number;
  sigma: number;
  count: number;
  outlier: boolean;
  underlyingTokens: string[] | null;
  il7d: number | null;
  apyBase7d: number | null;
  apyMean30d: number | null;
  volumeUsd1d: number | null;
  volumeUsd7d: number | null;
  apyBaseInception: number | null;
  apyPct1D: number | null;
  apyPct7D: number | null;
  apyPct30D: number | null;
}

export interface PoolsResponse {
  status: string;
  data: Pool[];
}

export interface Filters {
  chains: string[];
  projects: string[];
  stablecoinOnly: boolean;
  tvlMin: number;
  apyMin: number;
  apyMax: number;
  search: string;
}

export type SortField = 'symbol' | 'project' | 'chain' | 'tvlUsd' | 'apy' | 'apyBase' | 'apyPct1D' | 'apyPct7D' | 'apyPct30D' | 'sigma';
export type SortDirection = 'asc' | 'desc';

export interface SavedView {
  name: string;
  filters: Filters;
  sortField: SortField;
  sortDirection: SortDirection;
  createdAt: number;
}

// Historical data types
export interface HistoricalDataPoint {
  timestamp: string;
  tvlUsd: number;
  apy: number;
  apyBase: number | null;
  apyReward: number | null;
}

export interface PoolHistoricalData {
  poolId: string;
  data: HistoricalDataPoint[];
  fetchedAt: number;
}

export interface CalculatedMetrics {
  base90: number;
  volatility: number;
  organicPct: number;
  tvlChange30d: number;
  riskAdjustedYield: number;
  dataPoints: number;
  oldestDate: string;
}

// User's held positions
export interface HeldPosition {
  poolId: string;
  addedAt: number;
  notes?: string;
}
