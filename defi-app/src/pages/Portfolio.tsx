import { useState, useMemo } from 'react';
import type { Pool, HeldPosition, CalculatedMetrics } from '../types/pool';
import { addHeldPosition, removeHeldPosition, updatePosition, type AddPositionParams } from '../utils/heldPositions';
import { getCachedData, getPoolMetrics } from '../utils/historicalData';
import { Sparkline } from '../components/Sparkline';

interface PortfolioProps {
  positions: HeldPosition[];
  pools: Pool[];
  onPositionsChange: (positions: HeldPosition[]) => void;
}

interface PositionWithPool {
  position: HeldPosition;
  pool: Pool;
  metrics: CalculatedMetrics | null;
  apyHistory: number[];
  alerts: PositionAlert[];
}

interface PositionAlert {
  type: 'warning' | 'danger';
  message: string;
}

export function Portfolio({ positions, pools, onPositionsChange }: PortfolioProps) {
  const [newPoolId, setNewPoolId] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newEntryDate, setNewEntryDate] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editNotes, setEditNotes] = useState('');

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
        if (cached?.data) {
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          const recentData = cached.data.filter(d => new Date(d.timestamp).getTime() >= thirtyDaysAgo);
          apyHistory.push(...recentData.map(d => d.apy));
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

        return { position: pos, pool, metrics, apyHistory, alerts };
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

  const handleAdd = () => {
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

    const params: AddPositionParams = {
      poolId: trimmedId,
      amountUsd: amount,
      entryDate: newEntryDate || undefined,
      notes: newNotes || undefined,
    };

    onPositionsChange(addHeldPosition(params));
    setNewPoolId('');
    setNewAmount('');
    setNewEntryDate('');
    setNewNotes('');
    setError('');
  };

  const handleRemove = (poolId: string) => {
    onPositionsChange(removeHeldPosition(poolId));
  };

  const handleStartEdit = (position: HeldPosition) => {
    setEditingId(position.poolId);
    setEditAmount(position.amountUsd.toString());
    setEditNotes(position.notes || '');
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) return;

    onPositionsChange(updatePosition(editingId, {
      amountUsd: amount,
      notes: editNotes || undefined,
    }));
    setEditingId(null);
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
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Total Portfolio Value</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Weighted APY</div>
          <div className="text-2xl font-bold text-green-400">{weightedApy.toFixed(2)}%</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Projected Annual</div>
          <div className="text-2xl font-bold text-emerald-400">{formatCurrency(projectedAnnualEarnings)}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Projected Daily</div>
          <div className="text-2xl font-bold text-emerald-400">{formatCurrency(projectedDailyEarnings)}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Positions List */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white">Positions ({positionsWithPools.length})</h2>

          {positionsWithPools.length === 0 ? (
            <div className="bg-slate-800 rounded-lg p-8 text-center text-slate-400">
              No positions yet. Add your first position below.
            </div>
          ) : (
            <div className="space-y-3">
              {positionsWithPools.map(({ position, pool, metrics, apyHistory, alerts }) => {
                const allocation = totalValue > 0 ? (position.amountUsd / totalValue) * 100 : 0;
                const projectedEarning = position.amountUsd * (pool.apy / 100);
                const isEditing = editingId === position.poolId;

                return (
                  <div
                    key={position.poolId}
                    className={`bg-slate-800 rounded-lg p-4 ${alerts.some(a => a.type === 'danger') ? 'ring-1 ring-red-500/50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-400 text-xl">★</span>
                        <div>
                          <div className="text-white font-medium">
                            {pool.symbol}
                            <span className="text-slate-400 font-normal ml-2 text-sm">
                              {pool.project} · {pool.chain}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <a
                              href={`https://defillama.com/yields/pool/${position.poolId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              View on DefiLlama
                            </a>
                            <span className="text-slate-600">·</span>
                            <span className="text-xs text-slate-500 font-mono">
                              {position.poolId.substring(0, 16)}...
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isEditing && (
                          <>
                            <button
                              onClick={() => handleStartEdit(position)}
                              className="text-slate-400 hover:text-blue-400 text-sm px-2 py-1"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemove(position.poolId)}
                              className="text-slate-400 hover:text-red-400 text-sm px-2 py-1"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="mt-3 space-y-3">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="text-xs text-slate-400">Amount (USD)</label>
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-slate-400">Notes</label>
                            <input
                              type="text"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 text-sm"
                          >
                            Save
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

                        <div className="mt-3 grid grid-cols-5 gap-4 text-sm">
                          <div>
                            <div className="text-slate-400">Amount</div>
                            <div className="text-white font-medium">{formatCurrency(position.amountUsd)}</div>
                          </div>
                          <div>
                            <div className="text-slate-400">APY</div>
                            <div className="flex items-center gap-2">
                              <span className="text-green-400 font-medium">{pool.apy.toFixed(2)}%</span>
                              {apyHistory.length >= 2 && (
                                <Sparkline data={apyHistory} width={50} height={16} />
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-400">TVL</div>
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
                          <div>
                            <div className="text-slate-400">Allocation</div>
                            <div className="text-white font-medium">{allocation.toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Annual Earnings</div>
                            <div className="text-emerald-400 font-medium">{formatCurrency(projectedEarning)}</div>
                          </div>
                          {position.notes && (
                            <div className="col-span-5">
                              <div className="text-slate-400">Notes</div>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Pool ID *</label>
                <input
                  type="text"
                  value={newPoolId}
                  onChange={(e) => { setNewPoolId(e.target.value); setError(''); }}
                  placeholder="e.g., aa70268e-4b52-42bf-a116..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Amount (USD) *</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Entry Date (optional)</label>
                <input
                  type="date"
                  value={newEntryDate}
                  onChange={(e) => setNewEntryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Notes (optional)</label>
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
              className="mt-4 px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-500 font-medium"
            >
              Add Position
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
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Stablecoin</span>
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
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Volatile Assets</span>
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
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Organic Yield</span>
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
