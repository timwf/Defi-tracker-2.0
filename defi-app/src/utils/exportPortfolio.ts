import type { Pool, HeldPosition, CalculatedMetrics, UnmappedPosition } from '../types/pool';
import { getPoolMetrics } from './historicalData';

export interface PortfolioExport {
  exportedAt: string;
  summary: {
    totalValueUsd: number;
    weightedApy: number;
    organicApy: number;
    projectedEarnings: {
      annual: number;
      monthly: number;
      daily: number;
    };
    riskBreakdown: {
      stablecoinPct: number;
      volatilePct: number;
      organicYieldPct: number;
    };
    allocationByChain: Record<string, { valueUsd: number; percentage: number }>;
  };
  positions: Array<{
    poolId: string;
    symbol: string;
    project: string;
    chain: string;
    amountUsd: number;
    allocationPct: number;
    currentApy: number;
    effectiveApy: number;
    apyBase: number | null;
    apyReward: number | null;
    tvlUsd: number;
    stablecoin: boolean;
    entryDate: string | null;
    addedAt: string;
    notes: string | null;
    fixedApy: number | null;
    source: 'manual' | 'wallet';
    walletAddress: string | null;
    tokenAddress: string | null;
    tokenBalance: number | null;
    tokenSymbol: string | null;
    predictions: {
      predictedClass: string;
      predictedProbability: number;
    } | null;
    metrics: {
      base90: number;
      volatility: number;
      organicPct: number;
      tvlChange30d: number;
      riskAdjustedYield: number;
      dataPoints: number;
    } | null;
  }>;
  unmappedPositions: Array<{
    id: string;
    walletAddress: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string | null;
    tokenName: string | null;
    balanceFormatted: number;
    usdValue: number | null;
    importedAt: string;
  }>;
}

export function generatePortfolioExport(
  positions: HeldPosition[],
  pools: Pool[],
  unmappedPositions: UnmappedPosition[]
): PortfolioExport {
  // Match positions with pools
  const positionsWithPools = positions
    .map(pos => {
      const pool = pools.find(p => p.pool === pos.poolId);
      if (!pool) return null;
      const metrics = getPoolMetrics(pos.poolId);
      return { position: pos, pool, metrics };
    })
    .filter((x): x is { position: HeldPosition; pool: Pool; metrics: CalculatedMetrics | null } => x !== null);

  // Calculate totals
  const totalValue = positionsWithPools.reduce((sum, { position }) => sum + position.amountUsd, 0);

  const weightedApy = totalValue === 0 ? 0 : positionsWithPools.reduce((sum, { position, pool }) => {
    const effectiveApy = position.fixedApy ?? pool.apy;
    return sum + (effectiveApy * position.amountUsd / totalValue);
  }, 0);

  const organicApy = totalValue === 0 ? 0 : positionsWithPools.reduce((sum, { position, pool }) => {
    const baseApy = pool.apyBase || 0;
    return sum + (baseApy * position.amountUsd / totalValue);
  }, 0);

  // Risk breakdown
  let stablecoinValue = 0;
  let volatileValue = 0;
  let organicYieldValue = 0;
  const byChain: Record<string, number> = {};

  positionsWithPools.forEach(({ position, pool }) => {
    byChain[pool.chain] = (byChain[pool.chain] || 0) + position.amountUsd;
    if (pool.stablecoin) {
      stablecoinValue += position.amountUsd;
    } else {
      volatileValue += position.amountUsd;
    }
    const baseApy = pool.apyBase || 0;
    const totalApy = pool.apy || 1;
    organicYieldValue += position.amountUsd * (baseApy / totalApy);
  });

  const projectedAnnual = totalValue * (weightedApy / 100);

  // Build chain allocation
  const allocationByChain: Record<string, { valueUsd: number; percentage: number }> = {};
  Object.entries(byChain).forEach(([chain, value]) => {
    allocationByChain[chain] = {
      valueUsd: value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    };
  });

  // Build position details
  const exportedPositions = positionsWithPools.map(({ position, pool, metrics }) => ({
    poolId: position.poolId,
    symbol: pool.symbol,
    project: pool.project,
    chain: pool.chain,
    amountUsd: position.amountUsd,
    allocationPct: totalValue > 0 ? (position.amountUsd / totalValue) * 100 : 0,
    currentApy: pool.apy,
    effectiveApy: position.fixedApy ?? pool.apy,
    apyBase: pool.apyBase,
    apyReward: pool.apyReward,
    tvlUsd: pool.tvlUsd,
    stablecoin: pool.stablecoin,
    entryDate: position.entryDate || null,
    addedAt: new Date(position.addedAt).toISOString(),
    notes: position.notes || null,
    fixedApy: position.fixedApy ?? null,
    source: position.source || 'manual',
    walletAddress: position.walletAddress || null,
    tokenAddress: position.tokenAddress || null,
    tokenBalance: position.tokenBalance ?? null,
    tokenSymbol: position.tokenSymbol || null,
    predictions: pool.predictions ? {
      predictedClass: pool.predictions.predictedClass,
      predictedProbability: pool.predictions.predictedProbability,
    } : null,
    metrics: metrics ? {
      base90: metrics.base90,
      volatility: metrics.volatility,
      organicPct: metrics.organicPct,
      tvlChange30d: metrics.tvlChange30d,
      riskAdjustedYield: metrics.riskAdjustedYield,
      dataPoints: metrics.dataPoints,
    } : null,
  }));

  // Build unmapped positions
  const exportedUnmapped = unmappedPositions.map(up => ({
    id: up.id,
    walletAddress: up.walletAddress,
    chain: up.chain,
    tokenAddress: up.tokenAddress,
    tokenSymbol: up.tokenSymbol,
    tokenName: up.tokenName,
    balanceFormatted: up.balanceFormatted,
    usdValue: up.usdValue,
    importedAt: new Date(up.importedAt).toISOString(),
  }));

  return {
    exportedAt: new Date().toISOString(),
    summary: {
      totalValueUsd: totalValue,
      weightedApy,
      organicApy,
      projectedEarnings: {
        annual: projectedAnnual,
        monthly: projectedAnnual / 12,
        daily: projectedAnnual / 365,
      },
      riskBreakdown: {
        stablecoinPct: totalValue > 0 ? (stablecoinValue / totalValue) * 100 : 0,
        volatilePct: totalValue > 0 ? (volatileValue / totalValue) * 100 : 0,
        organicYieldPct: totalValue > 0 ? (organicYieldValue / totalValue) * 100 : 0,
      },
      allocationByChain,
    },
    positions: exportedPositions,
    unmappedPositions: exportedUnmapped,
  };
}

export function downloadPortfolioJson(
  positions: HeldPosition[],
  pools: Pool[],
  unmappedPositions: UnmappedPosition[]
): void {
  const exportData = generatePortfolioExport(positions, pools, unmappedPositions);
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `portfolio-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
