import type { Pool, Filters } from '../types/pool';

export function filterPools(pools: Pool[], filters: Filters): Pool[] {
  return pools.filter((pool) => {
    // Chain filter
    if (filters.chains.length > 0 && !filters.chains.includes(pool.chain)) {
      return false;
    }

    // Project filter
    if (filters.projects.length > 0 && !filters.projects.includes(pool.project)) {
      return false;
    }

    // Stablecoin filter
    if (filters.stablecoinOnly && !pool.stablecoin) {
      return false;
    }

    // TVL minimum
    if (pool.tvlUsd < filters.tvlMin) {
      return false;
    }

    // APY range
    if (pool.apy < filters.apyMin || pool.apy > filters.apyMax) {
      return false;
    }

    // Search by symbol
    if (filters.search && !pool.symbol.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    return true;
  });
}

export function getUniqueChains(pools: Pool[]): string[] {
  const chains = new Set(pools.map((p) => p.chain));
  return Array.from(chains).sort();
}

export function getUniqueProjects(pools: Pool[]): string[] {
  const projects = new Set(pools.map((p) => p.project));
  return Array.from(projects).sort();
}

// Get chains available based on selected projects (or all if none selected)
export function getAvailableChainsForProjects(pools: Pool[], selectedProjects: string[]): string[] {
  if (selectedProjects.length === 0) {
    return getUniqueChains(pools);
  }
  const filteredPools = pools.filter((p) => selectedProjects.includes(p.project));
  return getUniqueChains(filteredPools);
}

// Get projects available based on selected chains (or all if none selected)
export function getAvailableProjectsForChains(pools: Pool[], selectedChains: string[]): string[] {
  if (selectedChains.length === 0) {
    return getUniqueProjects(pools);
  }
  const filteredPools = pools.filter((p) => selectedChains.includes(p.chain));
  return getUniqueProjects(filteredPools);
}

export function formatTvl(tvl: number): string {
  if (tvl >= 1_000_000_000) {
    return `$${(tvl / 1_000_000_000).toFixed(2)}B`;
  }
  if (tvl >= 1_000_000) {
    return `$${(tvl / 1_000_000).toFixed(2)}M`;
  }
  if (tvl >= 1_000) {
    return `$${(tvl / 1_000).toFixed(2)}K`;
  }
  return `$${tvl.toFixed(2)}`;
}

export function formatApy(apy: number | null): string {
  if (apy === null) return '-';
  return `${apy.toFixed(2)}%`;
}

export function formatChange(change: number | null): { text: string; color: string } {
  if (change === null) return { text: '-', color: 'text-slate-500' };
  const sign = change >= 0 ? '+' : '';
  const color = change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-slate-400';
  return { text: `${sign}${change.toFixed(2)}%`, color };
}

export function formatSigma(sigma: number | null): { text: string; color: string } {
  if (sigma === null) return { text: '-', color: 'text-slate-500' };
  let color = 'text-green-400';
  if (sigma >= 1.5) color = 'text-yellow-400';
  if (sigma >= 3.0) color = 'text-red-400';
  return { text: sigma.toFixed(2), color };
}

export function formatPrediction(predictions: { predictedClass: string; predictedProbability: number } | null): { text: string; color: string } {
  if (!predictions || !predictions.predictedClass) return { text: '-', color: 'text-slate-500' };
  const { predictedClass, predictedProbability } = predictions;
  let color = 'text-slate-400';
  if (predictedClass.includes('Up')) color = 'text-green-400';
  if (predictedClass.includes('Down')) color = 'text-red-400';
  return { text: `${predictedClass} (${predictedProbability}%)`, color };
}
