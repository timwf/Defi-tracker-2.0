import { useState, useMemo, useEffect, useRef } from 'react';
import type { Pool, HeldPosition, CalculatedMetrics, UnmappedPosition } from '../types/pool';
import { addPositionToDb, removePositionFromDb, updatePositionInDb } from '../utils/heldPositions';
import { getCachedData, getPoolMetrics, fetchPoolHistoryWithCache, isCacheValid } from '../utils/historicalData';
import { fetchUnmappedPositions } from '../utils/unmappedPositions';
import { refreshTokenBalance, getAllTokenTransfers, getVaultUnderlyingValue, getVaultDepositedAmount, getPTCostBasis } from '../utils/walletScanner';
import { downloadPortfolioJson } from '../utils/exportPortfolio';
import { formatTvl } from '../utils/filterPools';
import { fetchAllUtilization } from '../utils/protocolUtilization';
import { MetricInfo } from '../components/MetricInfo';
import { PoolSearchInput } from '../components/PoolSearchInput';
import { PoolInfoCard } from '../components/PoolInfoCard';
import { PriceWatchlist } from '../components/PriceWatchlist';
import { WalletImportModal } from '../components/WalletImportModal';
import { UnmappedPositionsList } from '../components/UnmappedPositionsList';

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
  const [editFixedApy, setEditFixedApy] = useState('');
  const [editIsShareBased, setEditIsShareBased] = useState(false);
  const [editUseApyForYield, setEditUseApyForYield] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchingPoolId, setFetchingPoolId] = useState<string | null>(null);
  const [refreshingPoolId, setRefreshingPoolId] = useState<string | null>(null);
  const [autoFetchProgress, setAutoFetchProgress] = useState<{ current: number; total: number } | null>(null);
  const [walletRefreshProgress, setWalletRefreshProgress] = useState<{ current: number; total: number } | null>(null);

  // Sorting state for portfolio positions
  type PortfolioSortField = 'amount' | 'apy' | 'tvl' | 'symbol' | 'chain' | 'project';
  const [portfolioSortField, setPortfolioSortField] = useState<PortfolioSortField>('amount');
  const [portfolioSortDirection, setPortfolioSortDirection] = useState<'asc' | 'desc'>('desc');
  const hasAutoFetched = useRef(false);
  const hasAutoRefreshedWallet = useRef(false);

  // Wallet import state
  const [showWalletImport, setShowWalletImport] = useState(false);
  const [unmappedPositions, setUnmappedPositions] = useState<UnmappedPosition[]>([]);

  // Protocol utilization state
  const [utilizationData, setUtilizationData] = useState<Map<string, { utilization: number; totalSupply?: number; totalBorrow?: number; source: string }>>(new Map());

  // Get list of pool IDs already in portfolio
  const heldPoolIds = useMemo(() => positions.map(p => p.poolId), [positions]);

  // Find orphaned positions (positions without matching pools)
  const orphanedPositions = useMemo(() => {
    return positions.filter(pos => !pools.find(p => p.pool === pos.poolId));
  }, [positions, pools]);

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

  // Sorted positions for display
  const sortedPositions = useMemo(() => {
    return [...positionsWithPools].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (portfolioSortField) {
        case 'amount':
          aVal = a.position.amountUsd;
          bVal = b.position.amountUsd;
          break;
        case 'apy':
          aVal = a.position.fixedApy ?? a.pool.apy;
          bVal = b.position.fixedApy ?? b.pool.apy;
          break;
        case 'tvl':
          aVal = a.pool.tvlUsd;
          bVal = b.pool.tvlUsd;
          break;
        case 'symbol':
          aVal = a.pool.symbol;
          bVal = b.pool.symbol;
          break;
        case 'chain':
          aVal = a.pool.chain;
          bVal = b.pool.chain;
          break;
        case 'project':
          aVal = a.pool.project;
          bVal = b.pool.project;
          break;
        default:
          aVal = a.position.amountUsd;
          bVal = b.position.amountUsd;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return portfolioSortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return portfolioSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [positionsWithPools, portfolioSortField, portfolioSortDirection]);

  const handlePortfolioSort = (field: PortfolioSortField) => {
    if (field === portfolioSortField) {
      setPortfolioSortDirection(portfolioSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setPortfolioSortField(field);
      setPortfolioSortDirection('desc');
    }
  };

  // Portfolio calculations - only include positions with matching pools
  const totalValue = useMemo(() =>
    positionsWithPools.reduce((sum, { position }) => sum + position.amountUsd, 0),
    [positionsWithPools]
  );

  const weightedApy = useMemo(() => {
    if (totalValue === 0) return 0;
    return positionsWithPools.reduce((sum, { position, pool }) => {
      // Use fixedApy if set, otherwise use pool's current APY
      const effectiveApy = position.fixedApy ?? pool.apy;
      return sum + (effectiveApy * position.amountUsd / totalValue);
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

  // Load unmapped positions on mount
  useEffect(() => {
    loadUnmappedPositions();
  }, []);

  const loadUnmappedPositions = async () => {
    try {
      const unmapped = await fetchUnmappedPositions();
      setUnmappedPositions(unmapped);
    } catch (err) {
      console.error('Failed to load unmapped positions:', err);
    }
  };

  // Auto-fetch stale historical data on page load
  useEffect(() => {
    if (pools.length === 0 || positions.length === 0 || hasAutoFetched.current) return;

    const stalePositions = positions.filter(pos => !isCacheValid(pos.poolId));
    if (stalePositions.length === 0) {
      hasAutoFetched.current = true;
      return;
    }

    hasAutoFetched.current = true;

    const fetchStaleData = async () => {
      setAutoFetchProgress({ current: 0, total: stalePositions.length });

      for (let i = 0; i < stalePositions.length; i++) {
        try {
          await fetchPoolHistoryWithCache(stalePositions[i].poolId);
        } catch (err) {
          console.error('Failed to fetch history for', stalePositions[i].poolId, err);
        }
        setAutoFetchProgress({ current: i + 1, total: stalePositions.length });
        if (i < stalePositions.length - 1) {
          await new Promise(r => setTimeout(r, 1500)); // Rate limit
        }
      }

      setAutoFetchProgress(null);
      if (onRefreshPositions) {
        onRefreshPositions();
      }
    };

    fetchStaleData();
  }, [pools.length, positions.length, onRefreshPositions]);

  // Auto-refresh wallet positions on page load
  useEffect(() => {
    if (pools.length === 0 || positions.length === 0 || hasAutoRefreshedWallet.current) return;

    const walletPositions = positions.filter(
      pos => pos.source === 'wallet' && pos.walletAddress && pos.tokenAddress
    );

    if (walletPositions.length === 0) {
      hasAutoRefreshedWallet.current = true;
      return;
    }

    hasAutoRefreshedWallet.current = true;

    const refreshWalletPositions = async () => {
      setWalletRefreshProgress({ current: 0, total: walletPositions.length });

      for (let i = 0; i < walletPositions.length; i++) {
        const pos = walletPositions[i];
        const pool = pools.find(p => p.pool === pos.poolId);

        if (pool && pos.walletAddress && pos.tokenAddress) {
          try {
            const result = await refreshTokenBalance(
              pos.walletAddress,
              pos.tokenAddress,
              pool.chain
            );

            if (result) {
              const updates: Parameters<typeof updatePositionInDb>[1] = {
                tokenBalance: result.balance,
                tokenSymbol: result.symbol || pos.tokenSymbol,
                amountUsd: result.usdValue ?? pos.amountUsd,
              };

              // Fetch full transaction history if not already present
              if (!pos.transactions || pos.transactions.length === 0) {
                try {
                  const txData = await getAllTokenTransfers(
                    pos.walletAddress,
                    pos.tokenAddress,
                    pool.chain
                  );
                  if (txData) {
                    updates.firstAcquiredAt = txData.firstAcquiredAt;
                    updates.transactions = txData.transactions;
                    updates.initialTokenBalance = txData.totalDeposited;
                  }
                } catch (err) {
                  console.error('Failed to fetch transaction history:', pos.poolId, err);
                }
              }

              // If share-based vault, get underlying value via convertToAssets
              if (pos.isShareBased) {
                try {
                  const vaultResult = await getVaultUnderlyingValue(
                    pos.tokenAddress,
                    result.balanceRaw,
                    pool.chain
                  );

                  if (vaultResult) {
                    updates.underlyingValue = vaultResult.underlyingValue;
                    // Use underlying value for USD amount (assuming stablecoin = $1)
                    updates.amountUsd = vaultResult.underlyingValue;
                  }

                  // Get actual deposited amount by tracking underlying token transfers TO the vault
                  const depositResult = await getVaultDepositedAmount(
                    pos.tokenAddress,
                    pos.walletAddress!,
                    pool.chain
                  );

                  if (depositResult) {
                    updates.actualDepositedUsd = depositResult.totalDeposited;
                  }

                } catch (err) {
                  console.error('Failed to get vault underlying value:', pos.poolId, err);
                }
              }

              // If Pendle PT token, get cost basis from purchase transactions
              if (pool.project === 'pendle' || (result.symbol?.startsWith('PT-') && !pos.isShareBased)) {
                try {
                  const costBasis = await getPTCostBasis(
                    pos.tokenAddress,
                    pos.walletAddress!,
                    pool.chain
                  );
                  if (costBasis && costBasis.totalCost > 0) {
                    updates.actualDepositedUsd = costBasis.totalCost;
                  }
                } catch (err) {
                  console.error('Failed to get PT cost basis:', pos.poolId, err);
                }
              }

              await updatePositionInDb(pos.poolId, updates);
            }
          } catch (err) {
            console.error('Failed to refresh wallet position:', pos.poolId, err);
          }
        }

        setWalletRefreshProgress({ current: i + 1, total: walletPositions.length });

        if (i < walletPositions.length - 1) {
          await new Promise(r => setTimeout(r, 1500)); // Rate limit
        }
      }

      setWalletRefreshProgress(null);
      if (onRefreshPositions) {
        onRefreshPositions();
      }
    };

    refreshWalletPositions();
  }, [pools.length, positions.length, onRefreshPositions]);

  // Fetch protocol-specific utilization data for positions
  useEffect(() => {
    if (positions.length === 0 || pools.length === 0) return;

    const positionsToFetch = positions
      .map(pos => {
        const pool = pools.find(p => p.pool === pos.poolId);
        if (!pool || !pos.tokenAddress) return null;
        return {
          protocol: pool.project,
          tokenAddress: pos.tokenAddress,
          chain: pool.chain,
          poolId: pos.poolId
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (positionsToFetch.length === 0) return;

    fetchAllUtilization(positionsToFetch).then(data => {
      setUtilizationData(data);
    }).catch(err => {
      console.error('Failed to fetch utilization data:', err);
    });
  }, [positions, pools]);

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
    setEditFixedApy(position.fixedApy?.toString() || '');
    setEditIsShareBased(position.isShareBased || false);
    setEditUseApyForYield(position.useApyForYield || false);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) return;

    // If empty string, explicitly set to undefined to clear the fixed APY
    const fixedApyValue = editFixedApy.trim() === '' ? null : parseFloat(editFixedApy);

    setSaving(true);
    try {
      await updatePositionInDb(editingId, {
        amountUsd: amount,
        notes: editNotes || undefined,
        fixedApy: fixedApyValue === null ? undefined : (isNaN(fixedApyValue) ? undefined : fixedApyValue),
        isShareBased: editIsShareBased,
        useApyForYield: editUseApyForYield,
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

  const handleRefreshWalletPosition = async (poolId: string) => {
    const position = positions.find(p => p.poolId === poolId);
    if (!position?.walletAddress || !position?.tokenAddress) {
      console.error('Cannot refresh: missing wallet or token address');
      return;
    }

    // Find the pool to get the chain
    const pool = pools.find(p => p.pool === poolId);
    if (!pool) {
      console.error('Cannot refresh: pool not found');
      return;
    }

    setRefreshingPoolId(poolId);
    try {
      const result = await refreshTokenBalance(
        position.walletAddress,
        position.tokenAddress,
        pool.chain
      );

      if (result) {
        const updates: Parameters<typeof updatePositionInDb>[1] = {
          tokenBalance: result.balance,
          tokenSymbol: result.symbol || position.tokenSymbol,
          amountUsd: result.usdValue ?? position.amountUsd,
        };

        // Always re-fetch transaction history on manual refresh to catch new deposits
        try {
          const txData = await getAllTokenTransfers(
            position.walletAddress,
            position.tokenAddress,
            pool.chain
          );
          if (txData) {
            updates.firstAcquiredAt = txData.firstAcquiredAt;
            updates.transactions = txData.transactions;
            updates.initialTokenBalance = txData.totalDeposited;
          }
        } catch (err) {
          console.error('Failed to fetch transaction history:', poolId, err);
        }

        // If share-based vault, get underlying value via convertToAssets
        if (position.isShareBased) {
          try {
            const vaultResult = await getVaultUnderlyingValue(
              position.tokenAddress,
              result.balanceRaw,
              pool.chain
            );

            if (vaultResult) {
              updates.underlyingValue = vaultResult.underlyingValue;
              // Use underlying value for USD amount (assuming stablecoin = $1)
              updates.amountUsd = vaultResult.underlyingValue;
            }

            // Get actual deposited amount by tracking underlying token transfers TO the vault
            const depositResult = await getVaultDepositedAmount(
              position.tokenAddress,
              position.walletAddress!,
              pool.chain
            );

            if (depositResult) {
              updates.actualDepositedUsd = depositResult.totalDeposited;
            }
          } catch (err) {
            console.error('Failed to get vault underlying value:', poolId, err);
          }
        }

        await updatePositionInDb(poolId, updates);

        if (onRefreshPositions) {
          await onRefreshPositions();
        }
      }
    } catch (err) {
      console.error('Failed to refresh wallet position:', err);
    } finally {
      setRefreshingPoolId(null);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const handleExportJson = () => {
    downloadPortfolioJson(positions, pools, unmappedPositions);
  };

  return (
    <div className="space-y-6">
      {/* Orphaned positions warning */}
      {orphanedPositions.length > 0 && (
        <div className="bg-amber-900/50 border border-amber-600 text-amber-200 px-4 py-3 rounded-lg text-sm">
          <div className="flex items-start gap-2">
            <span className="text-amber-400">⚠</span>
            <div className="flex-1">
              <p className="font-medium mb-1">
                {orphanedPositions.length} position{orphanedPositions.length > 1 ? 's' : ''} no longer found in DefiLlama
              </p>
              <p className="text-amber-300/80 text-xs mb-2">
                These pools may have been deprecated or removed. You can remove them to clean up your portfolio.
              </p>
              <div className="flex flex-wrap gap-2">
                {orphanedPositions.map(pos => (
                  <div key={pos.poolId} className="flex items-center gap-1 bg-amber-900/50 px-2 py-1 rounded text-xs">
                    <span className="text-amber-300 truncate max-w-[120px]" title={pos.poolId}>
                      {pos.poolId.slice(0, 8)}...
                    </span>
                    <span className="text-amber-400">${pos.amountUsd.toFixed(0)}</span>
                    <button
                      onClick={() => handleRemove(pos.poolId)}
                      className="ml-1 text-amber-400 hover:text-amber-200"
                      title="Remove position"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-fetch progress banner */}
      {autoFetchProgress && (
        <div className="bg-purple-900/50 text-purple-200 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Refreshing historical data... {autoFetchProgress.current}/{autoFetchProgress.total} positions
        </div>
      )}

      {/* Wallet refresh progress banner */}
      {walletRefreshProgress && (
        <div className="bg-purple-900/50 text-purple-200 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Refreshing wallet balances... {walletRefreshProgress.current}/{walletRefreshProgress.total} positions
        </div>
      )}

      {/* Header with Export */}
      <div className="flex justify-end">
        <button
          onClick={handleExportJson}
          disabled={positions.length === 0}
          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export portfolio as JSON"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export JSON
        </button>
      </div>

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
          {/* Unmapped Positions (from wallet import) */}
          <UnmappedPositionsList
            unmappedPositions={unmappedPositions}
            pools={pools}
            onPositionLinked={() => {
              loadUnmappedPositions();
              if (onRefreshPositions) onRefreshPositions();
            }}
            onPositionDeleted={() => loadUnmappedPositions()}
          />

          <h2 className="text-lg font-semibold text-white">Positions ({positionsWithPools.length})</h2>

          {/* Summary Table */}
          {positionsWithPools.length > 0 && (
            <div className="bg-slate-800 rounded-lg overflow-x-auto">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-xs">
                    <th
                      className="text-left py-2 px-3 font-medium cursor-pointer hover:text-white select-none"
                      onClick={() => handlePortfolioSort('symbol')}
                    >
                      Pool {portfolioSortField === 'symbol' && (portfolioSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="text-right py-2 px-3 font-medium cursor-pointer hover:text-white select-none"
                      onClick={() => handlePortfolioSort('amount')}
                    >
                      Amount {portfolioSortField === 'amount' && (portfolioSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="text-right py-2 px-3 font-medium cursor-pointer hover:text-white select-none"
                      onClick={() => handlePortfolioSort('apy')}
                    >
                      APY {portfolioSortField === 'apy' && (portfolioSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="text-right py-2 px-3 font-medium cursor-pointer hover:text-white select-none"
                      onClick={() => handlePortfolioSort('tvl')}
                    >
                      TVL {portfolioSortField === 'tvl' && (portfolioSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-center py-2 px-3 font-medium">Pred</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPositions.map(({ position, pool, metrics }) => {
                    const tvlChange = metrics?.tvlChange30d;
                    const pred = pool.predictions;

                    const scrollToCard = () => {
                      const el = document.getElementById(`position-${position.poolId}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Brief highlight effect
                        el.classList.add('ring-2', 'ring-yellow-500/50');
                        setTimeout(() => el.classList.remove('ring-2', 'ring-yellow-500/50'), 1500);
                      }
                    };

                    return (
                      <tr
                        key={position.poolId}
                        className="border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer"
                        onClick={scrollToCard}
                      >
                        <td className="py-2 px-3">
                          <span className="text-white font-medium">{pool.symbol}</span>
                          <span className="text-slate-500 text-xs ml-1 hidden sm:inline">{pool.project}</span>
                        </td>
                        <td className="text-right py-2 px-3 text-slate-300">
                          {formatCurrency(position.amountUsd)}
                        </td>
                        <td className="text-right py-2 px-3">
                          {position.fixedApy !== undefined ? (
                            <>
                              <span className="text-purple-400">{position.fixedApy.toFixed(1)}%</span>
                              <span className="text-slate-500 ml-1 text-xs">F</span>
                            </>
                          ) : (
                            <>
                              <span className="text-green-400">{pool.apy.toFixed(1)}%</span>
                              {pool.apyPct1D !== null && (
                                <span className={`ml-1 ${pool.apyPct1D >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {pool.apyPct1D >= 0 ? '▲' : '▼'}
                                </span>
                              )}
                            </>
                          )}
                        </td>
                        <td className="text-right py-2 px-3">
                          <span className="text-slate-300">{formatTvl(pool.tvlUsd)}</span>
                          {tvlChange !== undefined && (
                            <span className={`ml-1 ${tvlChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {tvlChange >= 0 ? '▲' : '▼'}
                            </span>
                          )}
                        </td>
                        <td className="text-center py-2 px-3">
                          {pred?.predictedClass ? (
                            <span className={
                              pred.predictedClass.toLowerCase().includes('up') ? 'text-green-400' :
                              pred.predictedClass.toLowerCase().includes('down') ? 'text-red-400' :
                              'text-yellow-400'
                            }>
                              {pred.predictedClass.toLowerCase().includes('up') ? '↗' :
                               pred.predictedClass.toLowerCase().includes('down') ? '↘' : '→'}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {positionsWithPools.length === 0 ? (
            <div className="bg-slate-800 rounded-lg p-8 text-center text-slate-400">
              No positions yet. Add your first position below.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedPositions.map(({ position, pool, alerts }) => {
                const isEditing = editingId === position.poolId;

                return (
                  <div key={position.poolId} id={`position-${position.poolId}`} className="transition-all duration-300">
                    {isEditing ? (
                      /* Edit form shown separately */
                      <div className="bg-slate-800 rounded-lg p-4 ring-2 ring-blue-500/50">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-yellow-400">★</span>
                          <span className="text-white font-medium">{pool.symbol}</span>
                          <span className="text-slate-400 text-sm">{pool.project} · {pool.chain}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-slate-400">Amount (USD)</label>
                            {position.source === 'wallet' ? (
                              <div className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-400 text-sm">
                                ${parseFloat(editAmount).toLocaleString()}
                                <span className="text-xs text-slate-500 ml-1">(from wallet)</span>
                              </div>
                            ) : (
                              <input
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                              />
                            )}
                          </div>
                          <div>
                            <label className="text-xs text-slate-400">Fixed APY %</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editFixedApy}
                              onChange={(e) => setEditFixedApy(e.target.value)}
                              placeholder={pool.apy.toFixed(2)}
                              className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500"
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
                        {/* Share-based vault toggle - only show for wallet positions */}
                        {position.source === 'wallet' && (
                          <div className="mt-3 p-3 bg-slate-700/50 rounded-lg space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editIsShareBased}
                                onChange={(e) => setEditIsShareBased(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-500 bg-slate-600 text-cyan-500 focus:ring-cyan-500"
                              />
                              <div>
                                <div className="text-sm text-slate-300">Share-based vault (ERC-4626)</div>
                                <div className="text-xs text-slate-500">Enable to calculate yield from underlying value, not token balance</div>
                              </div>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editUseApyForYield}
                                onChange={(e) => setEditUseApyForYield(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-500 bg-slate-600 text-orange-500 focus:ring-orange-500"
                              />
                              <div>
                                <div className="text-sm text-slate-300">Use APY for yield calculation</div>
                                <div className="text-xs text-slate-500">
                                  Override deposit tracking - calculate yield as: deposited × APY × days held
                                  {editFixedApy && <span className="text-orange-400"> (using fixed {editFixedApy}%)</span>}
                                </div>
                              </div>
                            </label>
                          </div>
                        )}
                        {editFixedApy && (
                          <div className="text-xs text-purple-400 mt-2">
                            Fixed APY will be used for portfolio calculations instead of the live rate ({pool.apy.toFixed(2)}%)
                          </div>
                        )}
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
                        onRefreshWalletPosition={handleRefreshWalletPosition}
                        isRefreshing={refreshingPoolId === position.poolId}
                        protocolUtilization={utilizationData.get(position.poolId)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Position Form */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium text-white">Add Position</h3>
              <button
                type="button"
                onClick={() => setShowWalletImport(true)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import from Wallet
              </button>
            </div>
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
          {/* Price Watchlist */}
          <PriceWatchlist />

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

      {/* Wallet Import Modal */}
      <WalletImportModal
        isOpen={showWalletImport}
        onClose={() => setShowWalletImport(false)}
        onImportComplete={() => loadUnmappedPositions()}
      />
    </div>
  );
}
