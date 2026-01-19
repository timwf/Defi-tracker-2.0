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
  // Lending pool metrics (from poolsBorrow endpoint)
  totalSupplyUsd?: number;
  totalBorrowUsd?: number;
  borrowable?: boolean;
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
  | 'sigma' | 'stablecoin' | 'utilization'
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

// Transaction record for cost basis tracking
export interface TokenTransaction {
  timestamp: number;
  amount: number;        // token amount
  priceUsd: number | null; // price at time of transaction
  valueUsd: number | null; // amount * priceUsd
  type: 'deposit' | 'withdrawal';
  txHash?: string;
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
  tokenBalance?: number; // Raw token quantity (for wallet imports)
  tokenSymbol?: string; // Token symbol (for wallet imports)
  // Entry tracking (from blockchain)
  firstAcquiredAt?: number; // Timestamp of first transfer to wallet
  entryPriceUsd?: number; // USD price of token at first acquisition
  initialAmountUsd?: number; // Initial USD value at acquisition
  initialTokenBalance?: number; // Initial token quantity at first acquisition
  // Full transaction history for accurate cost basis
  transactions?: TokenTransaction[];
  totalCostBasis?: number;      // sum of all deposit values
  avgEntryPrice?: number;       // totalCostBasis / total tokens deposited
  // ERC-4626 vault settings
  isShareBased?: boolean;       // User override: treat as share-based vault (use convertToAssets)
  underlyingValue?: number;     // Cached underlying value from convertToAssets
  actualDepositedUsd?: number;  // Actual underlying tokens deposited to vault (from on-chain transfers)
  // Yield calculation override
  useApyForYield?: boolean;     // Use APY-based yield calculation instead of deposit tracking (uses fixedApy if set, else pool.apy)
  // Category assignment
  categoryId?: string;          // User-defined category for organization
  // Token-based manual positions (value derived from watchlist price)
  watchlistCoinId?: string;     // CoinGecko coin ID for price lookup (e.g., "solana")
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

// Fiat deposit tracking for P&L calculation
export type DepositCurrency = 'USD' | 'GBP' | 'EUR';

export interface Deposit {
  id: string;
  date: string;              // ISO date string (YYYY-MM-DD)
  amount: number;            // Original amount in source currency
  currency: DepositCurrency;
  amountUsd: number;         // USD equivalent at time of deposit
  exchangeRate: number;      // Exchange rate used (1 for USD)
  createdAt: number;         // Timestamp when record was created
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
