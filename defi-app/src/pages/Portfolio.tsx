import { useState, useMemo } from 'react';
import type { Pool, HeldPosition, CalculatedMetrics } from '../types/pool';
import { addPositionToDb, removePositionFromDb, updatePositionInDb } from '../utils/heldPositions';
import { getCachedData, getPoolMetrics, fetchPoolHistoryWithCache, isCacheValid } from '../utils/historicalData';
import { MetricInfo } from '../components/MetricInfo';
import { PoolSearchInput } from '../components/PoolSearchInput';
import { PoolInfoCard } from '../components/PoolInfoCard';

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
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [newAmount, setNewAmount] = useState('');
  const [newEntryDate, setNewEntryDate] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [fetchingPoolId, setFetchingPoolId] = useState<string | null>(null);

  // Get list of pool IDs already in portfolio
  const heldPoolIds = useMemo(() => positions.map(p => p.poolId), [positions]);

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
  const projectedMonthlyEarnings = projectedAnnualEarnings / 12;
  const projectedDailyEarnings = projectedAnnualEarnings / 365;

  // Organic APY - weighted by base yield only (excludes reward tokens)
  const organicApy = useMemo(() => {
    if (totalValue === 0) return 0;
    return positionsWithPools.reduce((sum, { position, pool }) => {
      const baseApy = pool.apyBase || 0;
      return sum + (baseApy * position.amountUsd / totalValue);
    }, 0);
  }, [positionsWithPools, totalValue]);

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
    const amount = parseFloat(newAmount);

    if (!selectedPool) {
      setError('Please select a pool');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    setSaving(true);
    try {
      const poolIdToFetch = selectedPool.pool;

      await addPositionToDb({
        poolId: selectedPool.pool,
        amountUsd: amount,
        entryDate: newEntryDate || undefined,
        notes: newNotes || undefined,
      });

      if (onRefreshPositions) {
        await onRefreshPositions();
      }

      // Auto-fetch historical data if not already cached
      if (!isCacheValid(poolIdToFetch)) {
        fetchPoolHistoryWithCache(poolIdToFetch).then(() => {
          // Trigger re-render by refreshing positions again
          if (onRefreshPositions) {
            onRefreshPositions();
          }
        }).catch(err => {
          console.error('Failed to fetch historical data:', err);
        });
      }

      setSelectedPool(null);
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

  const handleFetchHistory = async (poolId: string) => {
    setFetchingPoolId(poolId);
    try {
      await fetchPoolHistoryWithCache(poolId, true);
      // Trigger re-render by refreshing positions
      if (onRefreshPositions) {
        await onRefreshPositions();
      }
    } finally {
      setFetchingPoolId(null);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
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
            Organic APY
            <MetricInfo metric="organicApy" value={organicApy} />
          </div>
          <div className="text-lg md:text-2xl font-bold text-blue-400">{organicApy.toFixed(2)}%</div>
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
            Monthly
            <MetricInfo metric="monthlyEarnings" value={projectedMonthlyEarnings} />
          </div>
          <div className="text-lg md:text-2xl font-bold text-emerald-400">{formatCurrency(projectedMonthlyEarnings)}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {positionsWithPools.map(({ position, pool, alerts }) => {
                const isEditing = editingId === position.poolId;

                return (
                  <div key={position.poolId}>
                    {isEditing ? (
                      /* Edit form shown separately */
                      <div className="bg-slate-800 rounded-lg p-4 ring-2 ring-blue-500/50">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-yellow-400">★</span>
                          <span className="text-white font-medium">{pool.symbol}</span>
                          <span className="text-slate-400 text-sm">{pool.project} · {pool.chain}</span>
                        </div>
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
                        <div className="flex gap-2 mt-4">
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
                      <PoolInfoCard
                        pool={pool}
                        mode="portfolio"
                        position={position}
                        totalPortfolioValue={totalValue}
                        alerts={alerts}
                        onEdit={handleStartEdit}
                        onRemove={handleRemove}
                        onFetchHistory={handleFetchHistory}
                        isFetching={fetchingPoolId === position.poolId}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Position Form */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-md font-medium text-white mb-4">Add Position</h3>
            <div className="space-y-4">
              {/* Pool Search */}
              <div>
                <label className="block text-xs sm:text-sm text-slate-400 mb-1">Find Pool *</label>
                <PoolSearchInput
                  pools={pools}
                  onSelect={(pool) => { setSelectedPool(pool); setError(''); }}
                  selectedPool={selectedPool}
                  onClear={() => setSelectedPool(null)}
                  excludePoolIds={heldPoolIds}
                />
              </div>

              {/* Amount and other fields - show when pool is selected */}
              {selectedPool && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm text-slate-400 mb-1">Amount (USD) *</label>
                    <input
                      type="number"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="1000"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      autoFocus
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
              )}
            </div>
            {error && (
              <p className="text-sm text-red-400 mt-2">{error}</p>
            )}
            {selectedPool && (
              <button
                onClick={handleAdd}
                disabled={saving}
                className="mt-4 w-full sm:w-auto px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Adding...' : 'Add Position'}
              </button>
            )}
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
