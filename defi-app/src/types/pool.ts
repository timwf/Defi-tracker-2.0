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
  tokens: string[];
  stablecoinOnly: boolean;
  tvlMin: number;
  tvlMax: number;
  apyMin: number;
  apyMax: number;
  search: string;
}

export type SortField =
  | 'symbol' | 'project' | 'chain' | 'tvlUsd' | 'apy' | 'apyBase'
  | 'apyReward' | 'apyMean30d' | 'apyPct1D' | 'apyPct7D' | 'apyPct30D'
  | 'sigma' | 'stablecoin'
  // Historical data fields (require fetch)
  | 'base90' | 'volatility' | 'organicPct' | 'tvlChange30d';
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
  amountUsd: number;
  addedAt: number;
  entryDate?: string; // ISO date string
  notes?: string;
  fixedApy?: number; // Fixed APY override (e.g., for Pendle fixed rates)
  source?: 'manual' | 'wallet'; // How position was added
  walletAddress?: string; // For wallet-imported positions
  tokenAddress?: string; // Token contract address for wallet imports
}

// Scanned token from wallet
export interface ScannedToken {
  chain: string;
  tokenAddress: string;
  tokenSymbol: string | null;
  tokenName: string | null;
  balanceRaw: string; // Store as string to avoid precision loss
  balanceFormatted: number;
  decimals: number;
  usdValue: number | null;
}

// Unmapped position (wallet token not yet linked to a pool)
export interface UnmappedPosition {
  id: string;
  walletAddress: string;
  chain: string;
  tokenAddress: string;
  tokenSymbol: string | null;
  tokenName: string | null;
  balanceRaw: string;
  balanceFormatted: number;
  usdValue: number | null;
  linkedPoolId: string | null;
  importedAt: number;
  linkedAt: number | null;
}
