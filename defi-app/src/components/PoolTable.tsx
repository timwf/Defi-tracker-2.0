import type { Pool, SortField, SortDirection, CalculatedMetrics } from '../types/pool';
import { formatTvl, formatApy, formatChange, formatSigma, formatPrediction } from '../utils/filterPools';
import { getPoolMetrics, getCacheAge, getCachedData } from '../utils/historicalData';
import { Sparkline } from './Sparkline';
import { MetricInfo } from './MetricInfo';

function getRewardPct(pool: Pool): number | null {
  if (pool.apy === 0 || pool.apy === null) return null;
  const reward = pool.apyReward ?? 0;
  return (reward / pool.apy) * 100;
}

function getApyHistory(poolId: string): number[] {
  const cached = getCachedData(poolId);
  if (!cached?.data) return [];
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return cached.data
    .filter(d => new Date(d.timestamp).getTime() >= thirtyDaysAgo)
    .map(d => d.apy);
}

interface PoolTableProps {
  pools: Pool[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onFetchSinglePool?: (poolId: string) => Promise<void>;
  fetchingPoolId?: string | null;
  historicalDataVersion: number; // Increment to trigger re-render when data changes
  heldPoolIds: string[];
  onToggleHeld?: (poolId: string, isCurrentlyHeld: boolean) => void;
}

function formatMetricValue(value: number | undefined, suffix = '%'): string {
  if (value === undefined) return '-';
  return `${value.toFixed(2)}${suffix}`;
}

function getVolatilityColor(vol: number | undefined): string {
  if (vol === undefined) return 'text-slate-500';
  if (vol < 1.5) return 'text-green-400';
  if (vol < 3) return 'text-yellow-400';
  return 'text-red-400';
}

function getOrganicColor(pct: number | undefined): string {
  if (pct === undefined) return 'text-slate-500';
  if (pct >= 95) return 'text-green-400';
  if (pct >= 80) return 'text-yellow-400';
  if (pct >= 50) return 'text-orange-400';
  return 'text-red-400';
}

function getTvlFlowColor(change: number | undefined): string {
  if (change === undefined) return 'text-slate-500';
  if (change >= -10) return 'text-green-400';
  if (change >= -25) return 'text-yellow-400';
  return 'text-red-400';
}

export function PoolTable({
  pools,
  sortField,
  sortDirection,
  onSort,
  onFetchSinglePool,
  fetchingPoolId,
  historicalDataVersion,
  heldPoolIds,
  onToggleHeld,
}: PoolTableProps) {
  const SortHeader = ({ field, label, tooltip }: { field: SortField; label: string; tooltip?: string }) => (
    <th
      onClick={() => onSort(field)}
      className="px-3 py-2 text-left text-xs font-semibold text-slate-300 cursor-pointer hover:bg-slate-700 transition-colors whitespace-nowrap"
      title={tooltip}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortField === field && (
          <span className="text-blue-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  );

  const Header = ({ label, tooltip }: { label: string; tooltip?: string }) => (
    <th
      className="px-3 py-2 text-left text-xs font-semibold text-slate-300 whitespace-nowrap"
      title={tooltip}
    >
      {label}
    </th>
  );

  // Force re-render when historicalDataVersion changes
  void historicalDataVersion;

  // Mobile card view component
  const MobilePoolCard = ({ pool }: { pool: Pool }) => {
    const metrics: CalculatedMetrics | null = getPoolMetrics(pool.pool);
    const cachedData = getCachedData(pool.pool);
    const hasHistoricalData = cachedData !== null;
    const dataPoints = cachedData?.data?.length || 0;
    const hasEnoughData = dataPoints >= 7;
    const fetchStatus = !hasHistoricalData ? 'none' : hasEnoughData ? 'good' : 'limited';
    const isFetching = fetchingPoolId === pool.pool;
    const isHeld = heldPoolIds.includes(pool.pool);
    const apyHistory = getApyHistory(pool.pool);
    const rewardPct = getRewardPct(pool);

    return (
      <div className={`bg-slate-800 rounded-lg p-3 ${isHeld ? 'ring-1 ring-yellow-500/50' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium truncate">{pool.symbol}</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {pool.project} · {pool.chain}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="text-green-400 font-bold">{formatApy(pool.apy)}</span>
              {apyHistory.length >= 2 && (
                <Sparkline data={apyHistory} width={50} height={18} />
              )}
              <MetricInfo metric="apy" value={pool.apy} pool={pool} />
            </div>
            <div className="flex items-center justify-end gap-1 text-xs text-slate-400">
              {formatTvl(pool.tvlUsd)}
              <MetricInfo metric="tvl" value={pool.tvlUsd} pool={pool} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
          <div>
            <div className="flex items-center gap-1 text-slate-500">Base <MetricInfo metric="apyBase" value={pool.apyBase} pool={pool} /></div>
            <div className="text-slate-300">{formatApy(pool.apyBase)}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-slate-500">Reward <MetricInfo metric="apyReward" value={pool.apyReward} pool={pool} /></div>
            <div className="text-purple-400">
              {formatApy(pool.apyReward)}
              {rewardPct !== null && <span className="text-slate-500 ml-1">({rewardPct.toFixed(0)}%)</span>}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-slate-500">1D <MetricInfo metric="change1d" value={pool.apyPct1D} pool={pool} /></div>
            <div className={formatChange(pool.apyPct1D).color}>{formatChange(pool.apyPct1D).text}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-slate-500">7D <MetricInfo metric="change7d" value={pool.apyPct7D} pool={pool} /></div>
            <div className={formatChange(pool.apyPct7D).color}>{formatChange(pool.apyPct7D).text}</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-2 text-xs border-t border-slate-700 pt-2">
          <div>
            <div className="flex items-center gap-1 text-slate-500">σ <MetricInfo metric="sigma" value={pool.sigma} pool={pool} /></div>
            <div className={formatSigma(pool.sigma).color}>{formatSigma(pool.sigma).text}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-slate-500">Stable <MetricInfo metric="stablecoin" value={pool.stablecoin} pool={pool} /></div>
            <div className={pool.stablecoin ? 'text-green-400' : 'text-slate-500'}>
              {pool.stablecoin ? 'Yes' : 'No'}
            </div>
          </div>
          <div className="col-span-2">
            <div className="flex items-center gap-1 text-slate-500">Prediction <MetricInfo metric="prediction" value={pool.predictions} pool={pool} /></div>
            <div className={formatPrediction(pool.predictions).color}>
              {formatPrediction(pool.predictions).text}
            </div>
          </div>
        </div>

        {/* Average APY row - always show if Avg30 available */}
        {(pool.apyMean30d !== null || metrics) && (
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs border-t border-slate-700 pt-2">
            <div>
              <div className="flex items-center gap-1 text-slate-500">Avg30 <MetricInfo metric="avg30" value={pool.apyMean30d} pool={pool} /></div>
              {pool.apyMean30d !== null ? (
                <div className="flex items-center gap-1">
                  <span className="text-cyan-400">{pool.apyMean30d.toFixed(1)}%</span>
                  <span className={pool.apy > pool.apyMean30d ? 'text-green-400' : 'text-red-400'}>
                    {pool.apy > pool.apyMean30d ? '↑' : '↓'}
                  </span>
                </div>
              ) : <div className="text-slate-500">-</div>}
            </div>
            <div>
              <div className="flex items-center gap-1 text-slate-500">Avg90 <MetricInfo metric="avg90" value={metrics?.base90} pool={pool} metrics={metrics ?? undefined} /></div>
              {metrics ? (
                <div className="flex items-center gap-1">
                  <span className="text-cyan-400">{metrics.base90.toFixed(1)}%</span>
                  {pool.apyBase !== null && (
                    <span className={pool.apyBase > metrics.base90 ? 'text-green-400' : 'text-red-400'}>
                      {pool.apyBase > metrics.base90 ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              ) : <div className="text-slate-500">-</div>}
            </div>
          </div>
        )}

        {metrics && (
          <div className="grid grid-cols-4 gap-2 mt-2 text-xs border-t border-slate-700 pt-2">
            <div>
              <div className="flex items-center gap-1 text-slate-500">Days <MetricInfo metric="days" value={metrics.dataPoints} pool={pool} metrics={metrics} /></div>
              <div className="text-slate-400">{metrics.dataPoints}</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-slate-500">Vol <MetricInfo metric="volatility" value={metrics.volatility} pool={pool} metrics={metrics} /></div>
              <div className={getVolatilityColor(metrics.volatility)}>{metrics.volatility.toFixed(1)}</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-slate-500">Org% <MetricInfo metric="organicPct" value={metrics.organicPct} pool={pool} metrics={metrics} /></div>
              <div className={getOrganicColor(metrics.organicPct)}>{metrics.organicPct}%</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-slate-500">TVL Δ <MetricInfo metric="tvlChange" value={metrics.tvlChange30d} pool={pool} metrics={metrics} /></div>
              <div className={getTvlFlowColor(metrics.tvlChange30d)}>
                {metrics.tvlChange30d >= 0 ? '+' : ''}{metrics.tvlChange30d}%
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700">
          <div className="flex items-center gap-2">
            {onFetchSinglePool && (
              <button
                onClick={() => onFetchSinglePool(pool.pool)}
                disabled={isFetching}
                className={`px-2 py-1 rounded text-xs ${
                  isFetching
                    ? 'bg-purple-600 text-white'
                    : fetchStatus === 'good' || fetchStatus === 'limited'
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-slate-700 text-slate-400'
                }`}
                title={
                  fetchStatus === 'good'
                    ? `${dataPoints} days of data`
                    : fetchStatus === 'limited'
                    ? `New pool - only ${dataPoints} days of data available`
                    : 'Fetch historical data'
                }
              >
                {isFetching ? '...' : fetchStatus === 'good' ? `✓ ${dataPoints}d` : fetchStatus === 'limited' ? `✓ ${dataPoints}d` : '↓ Fetch'}
              </button>
            )}
            {onToggleHeld && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleHeld(pool.pool, isHeld);
                }}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  isHeld
                    ? 'bg-slate-600 text-yellow-400 hover:bg-red-900/50 hover:text-red-400'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-slate-900'
                }`}
                title={isHeld ? 'Remove from portfolio' : 'Add to portfolio'}
              >
                {isHeld ? 'In Portfolio' : '+ Add'}
              </button>
            )}
          </div>
          <a
            href={`https://defillama.com/yields/pool/${pool.pool}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:underline"
          >
            DefiLlama →
          </a>
        </div>
      </div>
    );
  };

  const sortOptions: { field: SortField; label: string; group?: string }[] = [
    // Primary metrics
    { field: 'tvlUsd', label: 'TVL' },
    { field: 'apy', label: 'APY' },
    { field: 'apyBase', label: 'Base APY' },
    { field: 'apyReward', label: 'Reward APY' },
    // Identifiers
    { field: 'symbol', label: 'Symbol' },
    { field: 'project', label: 'Protocol' },
    { field: 'chain', label: 'Chain' },
    { field: 'stablecoin', label: 'Stablecoin' },
    // Averages
    { field: 'apyMean30d', label: 'Avg 30D' },
    { field: 'base90', label: 'Avg 90D *' },
    // Changes
    { field: 'apyPct1D', label: '1D Change' },
    { field: 'apyPct7D', label: '7D Change' },
    { field: 'apyPct30D', label: '30D Change' },
    // Volatility
    { field: 'sigma', label: 'Sigma (σ)' },
    { field: 'volatility', label: 'Volatility *' },
    // Historical metrics (require fetch)
    { field: 'organicPct', label: 'Organic % *' },
    { field: 'tvlChange30d', label: 'TVL Change *' },
  ];

  return (
    <>
      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {/* Mobile sort controls */}
        <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg">
          <span className="text-xs text-slate-400">Sort:</span>
          <select
            value={sortField}
            onChange={(e) => onSort(e.target.value as SortField)}
            className="flex-1 px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white"
          >
            {sortOptions.map((opt) => (
              <option key={opt.field} value={opt.field}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => onSort(sortField)}
            className="px-3 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white"
          >
            {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>

        {pools.map((pool) => (
          <MobilePoolCard key={pool.pool} pool={pool} />
        ))}
        {pools.length === 0 && (
          <div className="text-center py-8 text-slate-400">No pools match your filters</div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-auto max-h-[calc(100vh-300px)] rounded-lg border border-slate-700">
      <table className="w-full">
        <thead className="bg-slate-800 sticky top-0 z-10">
          <tr>
            <Header label="" tooltip="Click ↓ to fetch historical data for this pool. Green ✓ = data cached." />
            <SortHeader field="symbol" label="Symbol" tooltip="Pool token symbol. ★ = You hold this position (click star to toggle)." />
            <SortHeader field="project" label="Protocol" tooltip="DeFi protocol name. Consider protocol risk: Aave/Compound = battle-tested, newer protocols = higher risk but potentially higher rewards." />
            <SortHeader field="chain" label="Chain" tooltip="Blockchain network. Ethereum = highest security, L2s (Arbitrum, Optimism, Base) = lower fees but bridge risk." />
            <SortHeader field="tvlUsd" label="TVL" tooltip="Total Value Locked in USD. Higher TVL = more liquidity & generally safer. $50M+ = large, $10-50M = medium, <$10M = smaller/riskier." />
            <SortHeader field="apy" label="APY" tooltip="Total Annual Percentage Yield = Base + Rewards. This is what you'd earn if rates stayed constant for a year. Beware: high APY often comes from temporary incentives." />
            <SortHeader field="apyBase" label="Base" tooltip="Base APY from protocol fees/interest. This is ORGANIC yield - sustainable and not dependent on token incentives. Focus on this for long-term positions." />
            <SortHeader field="apyReward" label="Reward" tooltip="Additional APY from token incentives. WARNING: Reward APY can disappear when incentive programs end. Don't chase high reward APY without checking sustainability." />
            {/* Average APY columns */}
            <SortHeader field="apyMean30d" label="Avg30" tooltip="30-DAY AVERAGE APY from DefiLlama API. Shows the mean APY over the past 30 days. Compare with current APY to spot trends." />
            <SortHeader field="base90" label="Avg90" tooltip="90-DAY AVERAGE Base APY (requires historical fetch). Calculated: mean of daily apyBase over last 90 days. Arrow shows trend: ↑ green = current above average (improving), ↓ red = current below average (declining). Pools without fetched data will sort to bottom." />
            <Header label="Days" tooltip="DAYS OF DATA available in DefiLlama. More days = more reliable metrics. 365+ = established pool, 90-365 = maturing, <90 = newer/less data to analyze." />
            <SortHeader field="volatility" label="Vol" tooltip="APY VOLATILITY = standard deviation of Base APY over 90 days. Calculated: σ of daily apyBase values. Green <1.5 = stable/predictable, Yellow 1.5-3 = moderate swings, Red >3 = highly volatile/unpredictable yields. Requires historical fetch." />
            <SortHeader field="organicPct" label="Org%" tooltip="ORGANIC PERCENTAGE = (Base APY / Total APY) × 100. Calculated: average over 90 days. Green 95%+ = sustainable yield, Yellow 80-95% = some incentive dependency, Orange 50-80% = heavily incentivized, Red <50% = mostly temporary rewards. Requires historical fetch." />
            <SortHeader field="tvlChange30d" label="TVL Δ" tooltip="30-DAY TVL CHANGE. Calculated: ((current - 30d ago) / 30d ago) × 100. Green >-10% = stable/growing (healthy), Yellow -10 to -25% = declining (monitor), Red <-25% = capital exodus (warning sign - others leaving). Requires historical fetch." />
            {/* Standard columns */}
            <SortHeader field="apyPct1D" label="1D" tooltip="APY CHANGE last 24 hours. From DefiLlama API. Green = APY increased, Red = decreased. Large daily swings may indicate volatility." />
            <SortHeader field="apyPct7D" label="7D" tooltip="APY CHANGE last 7 days. From DefiLlama API. More meaningful than 1D for spotting trends. Sustained green = improving, sustained red = declining." />
            <SortHeader field="sigma" label="σ" tooltip="SIGMA (DefiLlama's volatility). From API - their calculation of APY standard deviation. Green <1.5 = stable, Yellow 1.5-3 = moderate, Red >3 = high volatility. Similar to Vol column but API-provided." />
            <Header label="Prediction" tooltip="DEFILLAMA ML PREDICTION. Their machine learning model predicts APY direction. Shows predicted class (Up/Down/Stable) with confidence %. Use as one input, not gospel - ML predictions have limits." />
            <SortHeader field="stablecoin" label="Stable" tooltip="STABLECOIN POOL. Yes = pool contains stablecoins (USDC, USDT, DAI, etc). Stablecoin pools typically have lower impermanent loss risk but may have lower yields. Sort to group stablecoin pools together." />
            <Header label="Link" tooltip="View full pool details on DefiLlama including charts, historical data, and more pool metadata." />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {pools.map((pool) => {
            const change1D = formatChange(pool.apyPct1D);
            const change7D = formatChange(pool.apyPct7D);
            const sigma = formatSigma(pool.sigma);
            const prediction = formatPrediction(pool.predictions);

            // Get historical metrics if available
            const metrics: CalculatedMetrics | null = getPoolMetrics(pool.pool);
            const cachedData = getCachedData(pool.pool);
            const hasHistoricalData = cachedData !== null;
            const dataPoints = cachedData?.data?.length || 0;
            const hasEnoughData = dataPoints >= 7;
            const cacheAge = hasHistoricalData ? getCacheAge(pool.pool) : null;
            const isFetching = fetchingPoolId === pool.pool;
            const isHeld = heldPoolIds.includes(pool.pool);

            // Determine fetch status: not fetched, fetched but limited data, fetched with good data
            const fetchStatus = !hasHistoricalData ? 'none' : hasEnoughData ? 'good' : 'limited';

            return (
              <tr key={pool.pool} className={`hover:bg-slate-800/50 transition-colors ${isHeld ? 'bg-yellow-900/20' : ''}`}>
                <td className="px-2 py-2">
                  {onFetchSinglePool && (
                    <button
                      onClick={() => onFetchSinglePool(pool.pool)}
                      disabled={isFetching}
                      className={`w-6 h-6 rounded text-xs flex items-center justify-center transition-colors ${
                        isFetching
                          ? 'bg-purple-600 text-white animate-pulse'
                          : fetchStatus === 'good' || fetchStatus === 'limited'
                          ? 'bg-green-900/50 text-green-400 hover:bg-green-800/50'
                          : 'bg-slate-700 text-slate-400 hover:bg-purple-600 hover:text-white'
                      }`}
                      title={
                        isFetching
                          ? 'Fetching...'
                          : fetchStatus === 'good'
                          ? `${dataPoints} days of data (${cacheAge})`
                          : fetchStatus === 'limited'
                          ? `New pool - only ${dataPoints} days of data (${cacheAge})`
                          : 'Fetch historical data'
                      }
                    >
                      {isFetching ? '...' : fetchStatus === 'good' || fetchStatus === 'limited' ? '✓' : '↓'}
                    </button>
                  )}
                </td>
                <td className="px-3 py-2 text-sm font-medium text-white">
                  <div className="flex items-center gap-2">
                    {pool.symbol}
                    {onToggleHeld && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onToggleHeld(pool.pool, isHeld);
                        }}
                        className={`px-2 py-0.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                          isHeld
                            ? 'bg-slate-600 text-yellow-400 hover:bg-red-900/50 hover:text-red-400'
                            : 'bg-yellow-500 hover:bg-yellow-600 text-slate-900'
                        }`}
                        title={isHeld ? 'Remove from portfolio' : 'Add to portfolio'}
                      >
                        {isHeld ? 'In Portfolio' : '+ Add'}
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-slate-300 group">
                  <div className="flex items-center gap-1">
                    {pool.project}
                    <MetricInfo metric="project" value={pool.project} pool={pool} />
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-slate-300 group">
                  <div className="flex items-center gap-1">
                    {pool.chain}
                    <MetricInfo metric="chain" value={pool.chain} pool={pool} />
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-slate-300 group">
                  <div className="flex items-center gap-1">
                    {formatTvl(pool.tvlUsd)}
                    <MetricInfo metric="tvl" value={pool.tvlUsd} pool={pool} />
                  </div>
                </td>
                <td className="px-3 py-2 text-sm font-medium group">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">{formatApy(pool.apy)}</span>
                    {(() => {
                      const apyHistory = getApyHistory(pool.pool);
                      return apyHistory.length >= 2 ? <Sparkline data={apyHistory} width={50} height={18} /> : null;
                    })()}
                    <MetricInfo metric="apy" value={pool.apy} pool={pool} />
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-slate-300 group">
                  <div className="flex items-center gap-1">
                    {formatApy(pool.apyBase)}
                    <MetricInfo metric="apyBase" value={pool.apyBase} pool={pool} />
                  </div>
                </td>
                <td className="px-3 py-2 text-xs group">
                  <div className="flex items-center gap-1">
                    <span className="text-purple-400">{formatApy(pool.apyReward)}</span>
                    {(() => {
                      const rewardPct = getRewardPct(pool);
                      return rewardPct !== null ? <span className="text-slate-500">({rewardPct.toFixed(0)}%)</span> : null;
                    })()}
                    <MetricInfo metric="apyReward" value={pool.apyReward} pool={pool} />
                  </div>
                </td>
                {/* Average APY columns */}
                <td className="px-3 py-2 text-xs group">
                  <div className="flex items-center gap-1">
                    {pool.apyMean30d !== null ? (
                      <>
                        <span className="text-cyan-400">{pool.apyMean30d.toFixed(2)}%</span>
                        {pool.apy !== null && (
                          <span className={pool.apy > pool.apyMean30d ? 'text-green-400' : 'text-red-400'}>
                            {pool.apy > pool.apyMean30d ? '↑' : '↓'}
                          </span>
                        )}
                      </>
                    ) : '-'}
                    <MetricInfo metric="avg30" value={pool.apyMean30d} pool={pool} />
                  </div>
                </td>
                <td className="px-3 py-2 text-xs group">
                  <div className="flex items-center gap-1">
                    {metrics?.base90 !== undefined ? (
                      <>
                        <span className="text-cyan-400">{metrics.base90.toFixed(2)}%</span>
                        {pool.apyBase !== null && (
                          <span className={pool.apyBase > metrics.base90 ? 'text-green-400' : 'text-red-400'}>
                            {pool.apyBase > metrics.base90 ? '↑' : '↓'}
                          </span>
                        )}
                      </>
                    ) : fetchStatus === 'limited' ? <span className="text-blue-400">New</span> : '-'}
                    <MetricInfo metric="avg90" value={metrics?.base90} pool={pool} metrics={metrics ?? undefined} isNewPool={fetchStatus === 'limited'} />
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-slate-400 group">
                  <div className="flex items-center gap-1">
                    {metrics?.dataPoints !== undefined ? metrics.dataPoints : fetchStatus === 'limited' ? <span className="text-blue-400">New</span> : '-'}
                    <MetricInfo metric="days" value={metrics?.dataPoints} pool={pool} metrics={metrics ?? undefined} isNewPool={fetchStatus === 'limited'} />
                  </div>
                </td>
                <td className={`px-3 py-2 text-xs ${metrics?.volatility !== undefined ? getVolatilityColor(metrics.volatility) : ''} group`}>
                  <div className="flex items-center gap-1">
                    {metrics?.volatility !== undefined ? formatMetricValue(metrics.volatility, '') : fetchStatus === 'limited' ? <span className="text-blue-400">New</span> : '-'}
                    <MetricInfo metric="volatility" value={metrics?.volatility} pool={pool} metrics={metrics ?? undefined} isNewPool={fetchStatus === 'limited'} />
                  </div>
                </td>
                <td className={`px-3 py-2 text-xs ${metrics?.organicPct !== undefined ? getOrganicColor(metrics.organicPct) : ''} group`}>
                  <div className="flex items-center gap-1">
                    {metrics?.organicPct !== undefined ? `${metrics.organicPct}%` : fetchStatus === 'limited' ? <span className="text-blue-400">New</span> : '-'}
                    <MetricInfo metric="organicPct" value={metrics?.organicPct} pool={pool} metrics={metrics ?? undefined} isNewPool={fetchStatus === 'limited'} />
                  </div>
                </td>
                <td className={`px-3 py-2 text-xs ${metrics?.tvlChange30d !== undefined ? getTvlFlowColor(metrics.tvlChange30d) : ''} group`}>
                  <div className="flex items-center gap-1">
                    {metrics?.tvlChange30d !== undefined
                      ? `${metrics.tvlChange30d >= 0 ? '+' : ''}${metrics.tvlChange30d}%`
                      : fetchStatus === 'limited' ? <span className="text-blue-400">New</span> : '-'}
                    <MetricInfo metric="tvlChange" value={metrics?.tvlChange30d} pool={pool} metrics={metrics ?? undefined} isNewPool={fetchStatus === 'limited'} />
                  </div>
                </td>
                {/* Standard columns */}
                <td className={`px-3 py-2 text-xs ${change1D.color} group`}>
                  <div className="flex items-center gap-1">
                    {change1D.text}
                    <MetricInfo metric="change1d" value={pool.apyPct1D} pool={pool} />
                  </div>
                </td>
                <td className={`px-3 py-2 text-xs ${change7D.color} group`}>
                  <div className="flex items-center gap-1">
                    {change7D.text}
                    <MetricInfo metric="change7d" value={pool.apyPct7D} pool={pool} />
                  </div>
                </td>
                <td className={`px-3 py-2 text-xs ${sigma.color} group`}>
                  <div className="flex items-center gap-1">
                    {sigma.text}
                    <MetricInfo metric="sigma" value={pool.sigma} pool={pool} />
                  </div>
                </td>
                <td className={`px-3 py-2 text-xs ${prediction.color} group`}>
                  <div className="flex items-center gap-1">
                    {prediction.text}
                    <MetricInfo metric="prediction" value={pool.predictions} pool={pool} />
                  </div>
                </td>
                <td className="px-3 py-2 text-xs group">
                  <div className="flex items-center gap-1">
                    {pool.stablecoin ? (
                      <span className="text-green-400">Yes</span>
                    ) : (
                      <span className="text-slate-500">No</span>
                    )}
                    <MetricInfo metric="stablecoin" value={pool.stablecoin} pool={pool} />
                  </div>
                </td>
                <td className="px-3 py-2 text-xs">
                  <a
                    href={`https://defillama.com/yields/pool/${pool.pool}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    View
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {pools.length === 0 && (
        <div className="text-center py-8 text-slate-400">No pools match your filters</div>
      )}
      </div>
    </>
  );
}
