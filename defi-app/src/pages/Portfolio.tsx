import { useState, useMemo } from 'react';
import type { Pool, HeldPosition, CalculatedMetrics } from '../types/pool';
import { addPositionToDb, removePositionFromDb, updatePositionInDb } from '../utils/heldPositions';
import { getCachedData, getPoolMetrics } from '../utils/historicalData';
import { Sparkline } from '../components/Sparkline';
import { MetricInfo } from '../components/MetricInfo';

interface PortfolioProps {
  positions: HeldPosition[];
  pools: Pool[];
  onPositionsChange: (positions: HeldPosition[]) => void;
  onRefreshPositions?: () => Promise<void>;
}

interface PositionWithPool {
  position: HeldPosition;
  pool: Pool;
  metrics: CalculatedMetrics | null;
  apyHistory: number[];
  yesterdayApy: number | null;
  alerts: PositionAlert[];
}

interface PositionAlert {
  type: 'warning' | 'danger';
  message: string;
}

export function Portfolio({ positions, pools, onRefreshPositions }: PortfolioProps) {
  const [newPoolId, setNewPoolId] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newEntryDate, setNewEntryDate] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Get positions with pool info, metrics, and alerts
  const positionsWithPools = useMemo<PositionWithPool[]>(() => {
    return positions
      .map(pos => {
        const pool = pools.find(p => p.pool === pos.poolId);
        if (!pool) return null;

        const metrics = getPoolMetrics(pos.poolId);
        const cached = getCachedData(pos.poolId);

        // Get last 30 days of APY for sparkline
        const apyHistory: number[] = [];
        let yesterdayApy: number | null = null;
        if (cached?.data && cached.data.length > 0) {
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          const recentData = cached.data.filter(d => new Date(d.timestamp).getTime() >= thirtyDaysAgo);
          apyHistory.push(...recentData.map(d => d.apy));

          // Get yesterday's APY (second to last entry, as last is today)
          if (cached.data.length >= 2) {
            yesterdayApy = cached.data[cached.data.length - 2].apy;
          }
        }

        // Generate alerts
        const alerts: PositionAlert[] = [];

        if (metrics) {
          // APY dropped significantly from 30d average
          if (metrics.base90 > 0 && pool.apy < metrics.base90 * 0.5) {
            alerts.push({
              type: 'danger',
              message: `APY dropped ${((1 - pool.apy / metrics.base90) * 100).toFixed(0)}% from 90d avg`
            });
          } else if (metrics.base90 > 0 && pool.apy < metrics.base90 * 0.75) {
            alerts.push({
              type: 'warning',
              message: `APY down ${((1 - pool.apy / metrics.base90) * 100).toFixed(0)}% from 90d avg`
            });
          }

          // TVL dropped significantly
          if (metrics.tvlChange30d < -30) {
            alerts.push({
              type: 'danger',
              message: `TVL down ${Math.abs(metrics.tvlChange30d).toFixed(0)}% in 30d`
            });
          } else if (metrics.tvlChange30d < -15) {
            alerts.push({
              type: 'warning',
              message: `TVL down ${Math.abs(metrics.tvlChange30d).toFixed(0)}% in 30d`
            });
          }

          // Low organic yield
          if (metrics.organicPct < 30) {
            alerts.push({
              type: 'warning',
              message: `Only ${metrics.organicPct}% organic yield`
            });
          }

          // High volatility
          if (metrics.volatility > 5) {
            alerts.push({
              type: 'warning',
              message: `High APY volatility (${metrics.volatility.toFixed(1)})`
            });
          }
        }

        return { position: pos, pool, metrics, apyHistory, yesterdayApy, alerts };
      })
      .filter((x): x is PositionWithPool => x !== null);
  }, [positions, pools]);

  // Portfolio calculations
  const totalValue = useMemo(() =>
    positions.reduce((sum, p) => sum + p.amountUsd, 0),
    [positions]
  );

  const weightedApy = useMemo(() => {
    if (totalValue === 0) return 0;
    return positionsWithPools.reduce((sum, { position, pool }) => {
      return sum + (pool.apy * position.amountUsd / totalValue);
    }, 0);
  }, [positionsWithPools, totalValue]);

  // Calculate yesterday's weighted APY for comparison
  const yesterdayWeightedApy = useMemo(() => {
    if (totalValue === 0) return null;
    let hasYesterdayData = false;
    const weighted = positionsWithPools.reduce((sum, { position, yesterdayApy }) => {
      if (yesterdayApy !== null) {
        hasYesterdayData = true;
        return sum + (yesterdayApy * position.amountUsd / totalValue);
      }
      return sum;
    }, 0);
    return hasYesterdayData ? weighted : null;
  }, [positionsWithPools, totalValue]);

  const weightedApyChange = yesterdayWeightedApy !== null ? weightedApy - yesterdayWeightedApy : null;

  const projectedAnnualEarnings = totalValue * (weightedApy / 100);
  const projectedDailyEarnings = projectedAnnualEarnings / 365;

  // Risk breakdown
  const riskBreakdown = useMemo(() => {
    const byChain: Record<string, number> = {};
    let stablecoinValue = 0;
    let volatileValue = 0;
    let organicYieldValue = 0;

    positionsWithPools.forEach(({ position, pool }) => {
      byChain[pool.chain] = (byChain[pool.chain] || 0) + position.amountUsd;
      if (pool.stablecoin) {
        stablecoinValue += position.amountUsd;
      } else {
        volatileValue += position.amountUsd;
      }
      // Organic = base APY vs reward APY
      const baseApy = pool.apyBase || 0;
      const totalApy = pool.apy || 1;
      organicYieldValue += position.amountUsd * (baseApy / totalApy);
    });

    return {
      byChain,
      stablecoinValue,
      volatileValue,
      organicYieldPct: totalValue > 0 ? (organicYieldValue / totalValue) * 100 : 0,
    };
  }, [positionsWithPools, totalValue]);

  const handleAdd = async () => {
    const trimmedId = newPoolId.trim();
    const amount = parseFloat(newAmount);

    if (!trimmedId) {
      setError('Pool ID is required');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    const pool = pools.find(p => p.pool === trimmedId);
    if (!pool) {
      setError('Pool ID not found in current data');
      return;
    }

    if (positions.some(p => p.poolId === trimmedId)) {
      setError('Pool already in your portfolio');
      return;
    }

    setSaving(true);
    try {
      await addPositionToDb({
        poolId: trimmedId,
        amountUsd: amount,
        entryDate: newEntryDate || undefined,
        notes: newNotes || undefined,
      });

      if (onRefreshPositions) {
        await onRefreshPositions();
      }

      setNewPoolId('');
      setNewAmount('');
      setNewEntryDate('');
      setNewNotes('');
      setError('');
    } catch (err) {
      setError('Failed to add position');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (poolId: string) => {
    setSaving(true);
    try {
      await removePositionFromDb(poolId);
      if (onRefreshPositions) {
        await onRefreshPositions();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (position: HeldPosition) => {
    setEditingId(position.poolId);
    setEditAmount(position.amountUsd.toString());
    setEditNotes(position.notes || '');
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) return;

    setSaving(true);
    try {
      await updatePositionInDb(editingId, {
        amountUsd: amount,
        notes: editNotes || undefined,
      });
      if (onRefreshPositions) {
        await onRefreshPositions();
      }
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="group bg-slate-800 rounded-lg p-3 md:p-4">
          <div className="text-xs md:text-sm text-slate-400 mb-1 flex items-center">
            Total Value
            <MetricInfo metric="totalValue" value={totalValue} />
          </div>
          <div className="text-lg md:text-2xl font-bold text-white">{formatCurrency(totalValue)}</div>
        </div>
        <div className="group bg-slate-800 rounded-lg p-3 md:p-4">
          <div className="text-xs md:text-sm text-slate-400 mb-1 flex items-center">
            Weighted APY
            <MetricInfo metric="weightedApy" value={weightedApy} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-2xl font-bold text-green-400">{weightedApy.toFixed(2)}%</span>
            {weightedApyChange !== null && (
              <span className={`text-xs md:text-sm ${weightedApyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {weightedApyChange >= 0 ? '↑' : '↓'}{Math.abs(weightedApyChange).toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <div className="group bg-slate-800 rounded-lg p-3 md:p-4">
          <div className="text-xs md:text-sm text-slate-400 mb-1 flex items-center">
            Annual
            <MetricInfo metric="annualEarnings" value={projectedAnnualEarnings} />
          </div>
          <div className="text-lg md:text-2xl font-bold text-emerald-400">{formatCurrency(projectedAnnualEarnings)}</div>
        </div>
        <div className="group bg-slate-800 rounded-lg p-3 md:p-4">
          <div className="text-xs md:text-sm text-slate-400 mb-1 flex items-center">
            Daily
            <MetricInfo metric="dailyEarnings" value={projectedDailyEarnings} />
          </div>
          <div className="text-lg md:text-2xl font-bold text-emerald-400">{formatCurrency(projectedDailyEarnings)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Positions List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white">Positions ({positionsWithPools.length})</h2>

          {positionsWithPools.length === 0 ? (
            <div className="bg-slate-800 rounded-lg p-8 text-center text-slate-400">
              No positions yet. Add your first position below.
            </div>
          ) : (
            <div className="space-y-3">
              {positionsWithPools.map(({ position, pool, metrics, apyHistory, yesterdayApy, alerts }) => {
                const allocation = totalValue > 0 ? (position.amountUsd / totalValue) * 100 : 0;
                const projectedEarning = position.amountUsd * (pool.apy / 100);
                const isEditing = editingId === position.poolId;

                return (
                  <div
                    key={position.poolId}
                    className={`bg-slate-800 rounded-lg p-4 ${alerts.some(a => a.type === 'danger') ? 'ring-1 ring-red-500/50' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <span className="text-yellow-400 text-lg sm:text-xl">★</span>
                        <div className="min-w-0">
                          <div className="text-white font-medium text-sm sm:text-base">
                            {pool.symbol}
                            <span className="text-slate-400 font-normal ml-2 text-xs sm:text-sm">
                              {pool.project} · {pool.chain}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <a
                              href={`https://defillama.com/yields/pool/${position.poolId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              DefiLlama
                            </a>
                            <span className="text-slate-600 hidden sm:inline">·</span>
                            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                              {position.poolId.substring(0, 12)}...
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-6 sm:ml-0">
                        {!isEditing && (
                          <>
                            <button
                              onClick={() => handleStartEdit(position)}
                              disabled={saving}
                              className="text-slate-400 hover:text-blue-400 text-xs sm:text-sm px-2 py-1 disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemove(position.poolId)}
                              disabled={saving}
                              className="text-slate-400 hover:text-red-400 text-xs sm:text-sm px-2 py-1 disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="mt-3 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-400">Amount (USD)</label>
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400">Notes</label>
                            <input
                              type="text"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            disabled={saving}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 text-sm disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Alerts */}
                        {alerts.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
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

                        {/* APY Sparkline - larger and more prominent */}
                        {apyHistory.length >= 2 && (
                          <div className="mt-3 bg-slate-900/50 rounded p-2">
                            <div className="text-slate-500 text-xs mb-1">30-Day APY Trend</div>
                            <Sparkline data={apyHistory} width={280} height={40} />
                          </div>
                        )}

                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 text-sm">
                          <div className="group">
                            <div className="text-slate-400 text-xs flex items-center">
                              Amount
                              <MetricInfo metric="amount" value={position.amountUsd} />
                            </div>
                            <div className="text-white font-medium">{formatCurrency(position.amountUsd)}</div>
                          </div>
                          <div className="group">
                            <div className="text-slate-400 text-xs flex items-center">
                              APY
                              <MetricInfo metric="apy" value={pool.apy} pool={pool} metrics={metrics ?? undefined} />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-green-400 font-medium">{pool.apy.toFixed(2)}%</span>
                              {yesterdayApy !== null && (
                                <span className={`text-xs ${pool.apy >= yesterdayApy ? 'text-green-400' : 'text-red-400'}`}>
                                  {pool.apy >= yesterdayApy ? '↑' : '↓'}
                                  {Math.abs(pool.apy - yesterdayApy).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="group">
                            <div className="text-slate-400 text-xs flex items-center">
                              Base APY
                              <MetricInfo metric="apyBase" value={pool.apyBase ?? 0} pool={pool} />
                            </div>
                            <div className="text-slate-300 font-medium">{(pool.apyBase ?? 0).toFixed(2)}%</div>
                          </div>
                          <div className="group">
                            <div className="text-slate-400 text-xs flex items-center">
                              Reward APY
                              <MetricInfo metric="apyReward" value={pool.apyReward ?? 0} pool={pool} />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-purple-400 font-medium">{(pool.apyReward ?? 0).toFixed(2)}%</span>
                              {pool.apy > 0 && (
                                <span className="text-slate-500 text-xs">
                                  ({((pool.apyReward ?? 0) / pool.apy * 100).toFixed(0)}%)
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="group">
                            <div className="text-slate-400 text-xs flex items-center">
                              Avg30
                              <MetricInfo metric="avg30" value={pool.apyMean30d} pool={pool} />
                            </div>
                            <div className="flex items-center gap-1">
                              {pool.apyMean30d !== null ? (
                                <>
                                  <span className="text-cyan-400 font-medium">{pool.apyMean30d.toFixed(2)}%</span>
                                  <span className={pool.apy > pool.apyMean30d ? 'text-green-400' : 'text-red-400'}>
                                    {pool.apy > pool.apyMean30d ? '↑' : '↓'}
                                  </span>
                                </>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </div>
                          </div>
                          <div className="group">
                            <div className="text-slate-400 text-xs flex items-center">
                              Avg90
                              <MetricInfo metric="avg90" value={metrics?.base90} pool={pool} metrics={metrics ?? undefined} />
                            </div>
                            <div className="flex items-center gap-1">
                              {metrics?.base90 !== undefined ? (
                                <>
                                  <span className="text-cyan-400 font-medium">{metrics.base90.toFixed(2)}%</span>
                                  {(pool.apyBase ?? 0) !== 0 && (
                                    <span className={(pool.apyBase ?? 0) > metrics.base90 ? 'text-green-400' : 'text-red-400'}>
                                      {(pool.apyBase ?? 0) > metrics.base90 ? '↑' : '↓'}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </div>
                          </div>
                          <div className="group">
                            <div className="text-slate-400 text-xs flex items-center">
                              TVL
                              <MetricInfo metric="tvl" value={pool.tvlUsd} pool={pool} metrics={metrics ?? undefined} />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-white font-medium">
                                {pool.tvlUsd >= 1_000_000
                                  ? `$${(pool.tvlUsd / 1_000_000).toFixed(1)}M`
                                  : `$${(pool.tvlUsd / 1_000).toFixed(0)}K`}
                              </span>
                              {metrics && (
                                <span className={`text-xs ${metrics.tvlChange30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {metrics.tvlChange30d >= 0 ? '+' : ''}{metrics.tvlChange30d.toFixed(0)}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="group">
                            <div className="text-slate-400 text-xs flex items-center">
                              Allocation
                              <MetricInfo metric="allocation" value={allocation} />
                            </div>
                            <div className="text-white font-medium">{allocation.toFixed(1)}%</div>
                          </div>
                          <div className="group">
                            <div className="text-slate-400 text-xs flex items-center">
                              Annual
                              <MetricInfo metric="annualEarnings" value={projectedEarning} />
                            </div>
                            <div className="text-emerald-400 font-medium">{formatCurrency(projectedEarning)}</div>
                          </div>
                          {position.notes && (
                            <div className="col-span-2 sm:col-span-3 md:col-span-6">
                              <div className="text-slate-400 text-xs">Notes</div>
                              <div className="text-slate-300 text-xs">{position.notes}</div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Position Form */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-md font-medium text-white mb-4">Add Position</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-xs sm:text-sm text-slate-400 mb-1">Pool ID *</label>
                <input
                  type="text"
                  value={newPoolId}
                  onChange={(e) => { setNewPoolId(e.target.value); setError(''); }}
                  placeholder="e.g., aa70268e-4b52..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-slate-400 mb-1">Amount (USD) *</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-slate-400 mb-1">Entry Date</label>
                <input
                  type="date"
                  value={newEntryDate}
                  onChange={(e) => setNewEntryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-slate-400 mb-1">Notes</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-400 mt-2">{error}</p>
            )}
            <button
              onClick={handleAdd}
              disabled={saving}
              className="mt-4 w-full sm:w-auto px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Adding...' : 'Add Position'}
            </button>
          </div>
        </div>

        {/* Right Column: Charts & Risk */}
        <div className="space-y-4">
          {/* Allocation Chart */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-md font-medium text-white mb-4">Allocation by Pool</h3>
            {positionsWithPools.length === 0 ? (
              <div className="text-slate-500 text-sm">No positions to display</div>
            ) : (
              <div className="space-y-2">
                {positionsWithPools.map(({ position, pool }) => {
                  const allocation = totalValue > 0 ? (position.amountUsd / totalValue) * 100 : 0;
                  return (
                    <div key={position.poolId}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300 truncate">{pool.symbol}</span>
                        <span className="text-slate-400">{allocation.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: `${allocation}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chain Allocation */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-md font-medium text-white mb-4">Allocation by Chain</h3>
            {Object.keys(riskBreakdown.byChain).length === 0 ? (
              <div className="text-slate-500 text-sm">No positions to display</div>
            ) : (
              <div className="space-y-2">
                {Object.entries(riskBreakdown.byChain)
                  .sort(([, a], [, b]) => b - a)
                  .map(([chain, value]) => {
                    const pct = totalValue > 0 ? (value / totalValue) * 100 : 0;
                    return (
                      <div key={chain}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">{chain}</span>
                          <span className="text-slate-400">{pct.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Risk Breakdown */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-md font-medium text-white mb-4">Risk Breakdown</h3>
            <div className="space-y-3">
              <div className="group">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300 flex items-center">
                    Stablecoin
                    <MetricInfo metric="stablecoinAllocation" value={totalValue > 0 ? (riskBreakdown.stablecoinValue / totalValue) * 100 : 0} />
                  </span>
                  <span className="text-slate-400">
                    {totalValue > 0 ? ((riskBreakdown.stablecoinValue / totalValue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${totalValue > 0 ? (riskBreakdown.stablecoinValue / totalValue) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="group">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300 flex items-center">
                    Volatile Assets
                    <MetricInfo metric="volatileAllocation" value={totalValue > 0 ? (riskBreakdown.volatileValue / totalValue) * 100 : 0} />
                  </span>
                  <span className="text-slate-400">
                    {totalValue > 0 ? ((riskBreakdown.volatileValue / totalValue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${totalValue > 0 ? (riskBreakdown.volatileValue / totalValue) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="group">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300 flex items-center">
                    Organic Yield
                    <MetricInfo metric="organicYield" value={riskBreakdown.organicYieldPct} />
                  </span>
                  <span className="text-slate-400">{riskBreakdown.organicYieldPct.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${riskBreakdown.organicYieldPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
