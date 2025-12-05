import type { Pool, CalculatedMetrics, HeldPosition } from '../types/pool';
import { getCachedData, getPoolMetrics } from '../utils/historicalData';
import { formatTvl, formatApy, formatChange, formatSigma, formatPrediction } from '../utils/filterPools';
import { Sparkline } from './Sparkline';
import { MetricInfo } from './MetricInfo';

interface PoolInfoCardProps {
  pool: Pool;
  mode: 'browse' | 'portfolio';
  // Browse mode props
  isHeld?: boolean;
  onToggleHeld?: (poolId: string, isHeld: boolean) => void;
  onFetchHistory?: (poolId: string) => Promise<void>;
  isFetching?: boolean;
  // Portfolio mode props
  position?: HeldPosition;
  totalPortfolioValue?: number;
  onEdit?: (position: HeldPosition) => void;
  onRemove?: (poolId: string) => void;
  alerts?: PositionAlert[];
}

interface PositionAlert {
  type: 'warning' | 'danger';
  message: string;
}

// Helper to get APY history from cache
function getApyHistory(poolId: string): number[] {
  const cached = getCachedData(poolId);
  if (!cached?.data) return [];
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return cached.data
    .filter(d => new Date(d.timestamp).getTime() >= thirtyDaysAgo)
    .map(d => d.apy);
}

// Helper to get TVL history from cache
function getTvlHistory(poolId: string): number[] {
  const cached = getCachedData(poolId);
  if (!cached?.data) return [];
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return cached.data
    .filter(d => new Date(d.timestamp).getTime() >= thirtyDaysAgo)
    .map(d => d.tvlUsd);
}

// Helper to get yesterday's APY
function getYesterdayApy(poolId: string): number | null {
  const cached = getCachedData(poolId);
  if (!cached?.data || cached.data.length < 2) return null;
  return cached.data[cached.data.length - 2].apy;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function getOrganicColor(pct: number | undefined): string {
  if (pct === undefined) return 'text-slate-500';
  if (pct >= 95) return 'text-green-400';
  if (pct >= 80) return 'text-yellow-400';
  if (pct >= 50) return 'text-orange-400';
  return 'text-red-400';
}

function getVolatilityColor(vol: number | undefined): string {
  if (vol === undefined) return 'text-slate-500';
  if (vol < 1.5) return 'text-green-400';
  if (vol < 3) return 'text-yellow-400';
  return 'text-red-400';
}

function getVolatilityLabel(vol: number | undefined): string {
  if (vol === undefined) return '';
  if (vol < 1.5) return 'stable';
  if (vol < 3) return 'moderate';
  return 'volatile';
}

function getTvlChangeColor(change: number | undefined): string {
  if (change === undefined) return 'text-slate-500';
  if (change >= 0) return 'text-green-400';
  if (change >= -15) return 'text-yellow-400';
  return 'text-red-400';
}

export function PoolInfoCard({
  pool,
  mode,
  isHeld = false,
  onToggleHeld,
  onFetchHistory,
  isFetching = false,
  position,
  totalPortfolioValue = 0,
  onEdit,
  onRemove,
  alerts = [],
}: PoolInfoCardProps) {
  const metrics: CalculatedMetrics | null = getPoolMetrics(pool.pool);
  const cachedData = getCachedData(pool.pool);
  const hasHistoricalData = cachedData !== null;
  const dataPoints = cachedData?.data?.length || 0;

  const apyHistory = getApyHistory(pool.pool);
  const tvlHistory = getTvlHistory(pool.pool);
  const yesterdayApy = getYesterdayApy(pool.pool);
  const apyChange = yesterdayApy !== null ? pool.apy - yesterdayApy : null;

  // Calculate reward percentage
  const rewardPct = pool.apy > 0 && pool.apyReward ? (pool.apyReward / pool.apy) * 100 : 0;
  const basePct = 100 - rewardPct;

  // Portfolio calculations
  const allocation = position && totalPortfolioValue > 0
    ? (position.amountUsd / totalPortfolioValue) * 100
    : 0;
  const annualEarning = position ? position.amountUsd * (pool.apy / 100) : 0;
  const monthlyEarning = annualEarning / 12;
  const dailyEarning = annualEarning / 365;

  // Badges
  const badges: string[] = [];
  if (pool.stablecoin) badges.push('Stablecoin');
  if (pool.exposure === 'multi') badges.push('Multi-asset');
  if (pool.ilRisk === 'yes') badges.push('IL Risk');

  return (
    <div className={`bg-slate-800 rounded-lg overflow-hidden ${
      mode === 'portfolio' ? 'ring-2 ring-yellow-500/50' : ''
    } ${alerts.some(a => a.type === 'danger') ? 'ring-2 ring-red-500/50' : ''}`}>

      {/* HEADER */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {mode === 'portfolio' && <span className="text-yellow-400 text-lg">★</span>}
              <span className="text-white font-semibold text-lg truncate">{pool.symbol}</span>
            </div>
            <div className="text-sm text-slate-400 mt-0.5">
              {pool.project} · {pool.chain}
            </div>
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {badges.map(badge => (
                  <span
                    key={badge}
                    className={`text-xs px-2 py-0.5 rounded ${
                      badge === 'IL Risk'
                        ? 'bg-red-900/50 text-red-300'
                        : badge === 'Stablecoin'
                        ? 'bg-green-900/50 text-green-300'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
          <a
            href={`https://defillama.com/yields/pool/${pool.pool}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 hover:underline whitespace-nowrap"
          >
            DefiLlama →
          </a>
        </div>
      </div>

      {/* APY HERO SECTION */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-400">{formatApy(pool.apy)}</span>
              {apyChange !== null && (
                <span className={`text-sm font-medium ${apyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {apyChange >= 0 ? '↑' : '↓'} {Math.abs(apyChange).toFixed(2)}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Current APY {apyChange !== null && <span className="text-slate-600">vs yesterday</span>}
            </div>
          </div>
          {apyHistory.length >= 2 && (
            <div className="text-right">
              <Sparkline data={apyHistory} width={100} height={32} />
              <div className="text-xs text-slate-500 mt-1">30d trend</div>
            </div>
          )}
        </div>

        {/* Change Pills */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="bg-slate-900/50 rounded px-2 py-1.5 text-center">
            <div className="text-xs text-slate-500">1D</div>
            <div className={`text-sm font-medium ${formatChange(pool.apyPct1D).color}`}>
              {formatChange(pool.apyPct1D).text}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded px-2 py-1.5 text-center">
            <div className="text-xs text-slate-500">7D</div>
            <div className={`text-sm font-medium ${formatChange(pool.apyPct7D).color}`}>
              {formatChange(pool.apyPct7D).text}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded px-2 py-1.5 text-center">
            <div className="text-xs text-slate-500">30D</div>
            <div className={`text-sm font-medium ${formatChange(pool.apyPct30D).color}`}>
              {formatChange(pool.apyPct30D).text}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded px-2 py-1.5 text-center">
            <div className="text-xs text-slate-500">Pred</div>
            <div className={`text-sm font-medium ${formatPrediction(pool.predictions).color}`}>
              {pool.predictions?.predictedClass ? pool.predictions.predictedClass.split('/')[0] : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* YIELD */}
      <div className="p-4 border-b border-slate-700">
        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-3">Yield</div>

        {/* Base / Reward / Organic row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="text-slate-300">
            Base <span className="text-white font-medium">{formatApy(pool.apyBase)}</span>
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300">
            Reward <span className="text-purple-400 font-medium">{formatApy(pool.apyReward)}</span>
            {rewardPct > 0 && <span className="text-slate-500 ml-1">({rewardPct.toFixed(0)}%)</span>}
          </span>
          <span className="text-slate-500">·</span>
          <span className={getOrganicColor(metrics?.organicPct ?? basePct)}>
            {metrics?.organicPct ?? Math.round(basePct)}% organic
          </span>
        </div>

        {/* Averages row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mt-3">
          <span className="text-slate-400 group">
            Avg30{' '}
            {pool.apyMean30d !== null ? (
              <>
                <span className="text-cyan-400">{pool.apyMean30d.toFixed(1)}%</span>
                <span className={pool.apy > pool.apyMean30d ? 'text-green-400' : 'text-red-400'}>
                  {pool.apy > pool.apyMean30d ? ' ↑' : ' ↓'}
                </span>
              </>
            ) : <span className="text-slate-500">-</span>}
            <MetricInfo metric="avg30" value={pool.apyMean30d} pool={pool} />
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 group">
            Avg90{' '}
            {metrics?.base90 !== undefined ? (
              <>
                <span className="text-cyan-400">{metrics.base90.toFixed(1)}%</span>
                {pool.apyBase !== null && (
                  <span className={pool.apyBase > metrics.base90 ? 'text-green-400' : 'text-red-400'}>
                    {pool.apyBase > metrics.base90 ? ' ↑' : ' ↓'}
                  </span>
                )}
              </>
            ) : <span className="text-slate-500">-</span>}
            <MetricInfo metric="avg90" value={metrics?.base90} pool={pool} metrics={metrics ?? undefined} />
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 group">
            Vol{' '}
            <span className={getVolatilityColor(metrics?.volatility)}>
              {metrics?.volatility !== undefined
                ? `${metrics.volatility.toFixed(1)} (${getVolatilityLabel(metrics.volatility)})`
                : '-'
              }
            </span>
            <MetricInfo metric="volatility" value={metrics?.volatility} pool={pool} metrics={metrics ?? undefined} />
          </span>
        </div>
      </div>

      {/* POOL HEALTH */}
      <div className="p-4 border-b border-slate-700">
        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-3">Pool Health</div>

        {/* TVL Hero */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{formatTvl(pool.tvlUsd)}</span>
              {metrics?.tvlChange30d !== undefined && (
                <span className={`text-sm font-medium ${getTvlChangeColor(metrics.tvlChange30d)}`}>
                  {metrics.tvlChange30d >= 0 ? '↑' : '↓'}{Math.abs(metrics.tvlChange30d).toFixed(0)}%
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              TVL {metrics?.tvlChange30d !== undefined && <span className="text-slate-600">30d change</span>}
            </div>
          </div>
          {tvlHistory.length >= 2 && (
            <div className="text-right">
              <Sparkline data={tvlHistory} width={100} height={32} color="#3b82f6" />
              <div className="text-xs text-slate-500 mt-1">30d trend</div>
            </div>
          )}
        </div>

        {/* Health stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
          <div className="group">
            <div className="text-slate-500 text-xs flex items-center gap-1">
              Days
              <MetricInfo metric="days" value={metrics?.dataPoints ?? dataPoints} pool={pool} metrics={metrics ?? undefined} />
            </div>
            <div className="text-slate-300">
              {metrics?.dataPoints ?? (dataPoints > 0 ? dataPoints : pool.count ?? '-')}
            </div>
          </div>
          <div className="group">
            <div className="text-slate-500 text-xs flex items-center gap-1">
              Sigma
              <MetricInfo metric="sigma" value={pool.sigma} pool={pool} />
            </div>
            <div className={formatSigma(pool.sigma).color}>
              {formatSigma(pool.sigma).text}
            </div>
          </div>
          <div className="group">
            <div className="text-slate-500 text-xs flex items-center gap-1">
              Organic
              <MetricInfo metric="organicPct" value={metrics?.organicPct} pool={pool} metrics={metrics ?? undefined} />
            </div>
            <div className={getOrganicColor(metrics?.organicPct)}>
              {metrics?.organicPct !== undefined ? `${metrics.organicPct}%` : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* PORTFOLIO SECTION (only in portfolio mode) */}
      {mode === 'portfolio' && position && (
        <div className="p-4 border-b border-slate-700 bg-yellow-900/10">
          <div className="text-xs text-yellow-500 font-medium uppercase tracking-wide mb-3">Your Position</div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {alerts.map((alert, i) => (
                <span
                  key={i}
                  className={`text-xs px-2 py-1 rounded ${
                    alert.type === 'danger'
                      ? 'bg-red-900/50 text-red-300'
                      : 'bg-yellow-900/50 text-yellow-300'
                  }`}
                >
                  {alert.type === 'danger' ? '!' : '⚠'} {alert.message}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-slate-400 text-xs">Amount</div>
              <div className="text-white font-semibold text-lg">{formatCurrency(position.amountUsd)}</div>
              <div className="text-slate-500 text-xs">{allocation.toFixed(1)}% of portfolio</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">Projected Earnings</div>
              <div className="text-emerald-400 font-semibold">{formatCurrency(annualEarning)}/yr</div>
              <div className="text-slate-500 text-xs">
                {formatCurrency(monthlyEarning)}/mo · {formatCurrency(dailyEarning)}/day
              </div>
            </div>
          </div>

          {position.notes && (
            <div className="mt-3 text-sm">
              <div className="text-slate-500 text-xs">Notes</div>
              <div className="text-slate-300">{position.notes}</div>
            </div>
          )}
        </div>
      )}

      {/* ACTIONS */}
      <div className="p-4 flex items-center justify-between gap-2">
        {mode === 'browse' && (
          <>
            <div className="flex items-center gap-2">
              {onFetchHistory && (
                <button
                  onClick={() => onFetchHistory(pool.pool)}
                  disabled={isFetching}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    isFetching
                      ? 'bg-purple-600 text-white animate-pulse'
                      : hasHistoricalData
                      ? 'bg-green-900/50 text-green-400 hover:bg-green-800/50'
                      : 'bg-slate-700 text-slate-300 hover:bg-purple-600 hover:text-white'
                  }`}
                >
                  {isFetching ? 'Fetching...' : hasHistoricalData ? `✓ ${dataPoints}d data` : '↓ Fetch Data'}
                </button>
              )}
              {onToggleHeld && (
                <button
                  onClick={() => onToggleHeld(pool.pool, isHeld)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    isHeld
                      ? 'bg-slate-600 text-yellow-400 hover:bg-red-900/50 hover:text-red-400'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-slate-900'
                  }`}
                >
                  {isHeld ? 'In Portfolio' : '+ Add'}
                </button>
              )}
            </div>
          </>
        )}

        {mode === 'portfolio' && (
          <div className="flex items-center gap-2">
            {onFetchHistory && (
              <button
                onClick={() => onFetchHistory(pool.pool)}
                disabled={isFetching}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  isFetching
                    ? 'bg-purple-600 text-white animate-pulse'
                    : hasHistoricalData
                    ? 'bg-green-900/50 text-green-400 hover:bg-green-800/50'
                    : 'bg-slate-700 text-slate-300 hover:bg-purple-600 hover:text-white'
                }`}
              >
                {isFetching ? 'Fetching...' : hasHistoricalData ? `✓ ${dataPoints}d` : '↓ Fetch'}
              </button>
            )}
            {onEdit && position && (
              <button
                onClick={() => onEdit(position)}
                className="px-3 py-1.5 rounded text-xs font-medium bg-slate-700 text-slate-300 hover:bg-slate-600"
              >
                Edit
              </button>
            )}
            {onRemove && (
              <button
                onClick={() => onRemove(pool.pool)}
                className="px-3 py-1.5 rounded text-xs font-medium bg-slate-700 text-red-400 hover:bg-red-900/50"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
