// Protocol-specific utilization fetching
// Fetches utilization rates from protocol APIs for vaults/positions

interface UtilizationResult {
  utilization: number; // 0-100 percentage
  totalSupply?: number;
  totalBorrow?: number;
  source: string;
}

// Chain ID mapping for Morpho API
const CHAIN_IDS: Record<string, number> = {
  'Ethereum': 1,
  'Base': 8453,
  'Arbitrum': 42161,
  'Optimism': 10,
};

// Euler subgraph endpoints
const EULER_SUBGRAPHS: Record<string, string> = {
  'Ethereum': 'https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-mainnet/latest/gn',
  'Base': 'https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-base/latest/gn',
  'Arbitrum': 'https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-arbitrum/latest/gn',
  'Optimism': 'https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-optimism/latest/gn',
};

// Cache for utilization data (5 minute TTL)
const utilizationCache = new Map<string, { data: UtilizationResult; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(protocol: string, address: string, chain: string): string {
  return `${protocol}:${address.toLowerCase()}:${chain}`;
}

function getCached(key: string): UtilizationResult | null {
  const cached = utilizationCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: UtilizationResult): void {
  utilizationCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Fetch utilization for a Morpho vault by querying its underlying market allocations
 */
export async function fetchMorphoVaultUtilization(
  vaultAddress: string,
  chain: string
): Promise<UtilizationResult | null> {
  const cacheKey = getCacheKey('morpho', vaultAddress, chain);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const chainId = CHAIN_IDS[chain];
  if (!chainId) return null;

  try {
    const query = `
      query GetVaultUtilization($address: String!, $chainId: Int!) {
        vaultByAddress(address: $address, chainId: $chainId) {
          address
          name
          state {
            totalAssets
            totalAssetsUsd
            allocation {
              market {
                uniqueKey
                loanAsset { symbol }
                state {
                  utilization
                  supplyAssetsUsd
                  borrowAssetsUsd
                }
              }
              supplyAssetsUsd
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.morpho.org/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { address: vaultAddress, chainId },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const vault = data?.data?.vaultByAddress;

    if (!vault?.state?.allocation || vault.state.allocation.length === 0) {
      return null;
    }

    // Calculate weighted average utilization across all underlying markets
    let totalWeight = 0;
    let weightedUtilization = 0;
    let totalSupply = 0;
    let totalBorrow = 0;

    for (const alloc of vault.state.allocation) {
      if (alloc.market?.state?.utilization !== undefined && alloc.supplyAssetsUsd > 0) {
        const marketUtil = alloc.market.state.utilization * 100; // Convert to percentage
        const weight = alloc.supplyAssetsUsd;
        weightedUtilization += marketUtil * weight;
        totalWeight += weight;
        totalSupply += alloc.market.state.supplyAssetsUsd || 0;
        totalBorrow += alloc.market.state.borrowAssetsUsd || 0;
      }
    }

    if (totalWeight === 0) return null;

    const result: UtilizationResult = {
      utilization: weightedUtilization / totalWeight,
      totalSupply,
      totalBorrow,
      source: 'morpho-api',
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('[Morpho Utilization] Error:', err);
    return null;
  }
}

/**
 * Fetch utilization for an Euler v2 vault
 */
export async function fetchEulerVaultUtilization(
  vaultAddress: string,
  chain: string
): Promise<UtilizationResult | null> {
  const cacheKey = getCacheKey('euler', vaultAddress, chain);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const subgraphUrl = EULER_SUBGRAPHS[chain];
  if (!subgraphUrl) return null;

  try {
    const query = `
      query GetVaultStatus($address: ID!) {
        vault(id: $address) {
          id
          totalShares
          totalBorrows
          cash
          interestAccumulator
        }
        vaultStatuses(
          where: { vault: $address }
          orderBy: timestamp
          orderDirection: desc
          first: 1
        ) {
          totalShares
          totalBorrows
          cash
          supplyApy
          borrowApy
        }
      }
    `;

    const response = await fetch(subgraphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { address: vaultAddress.toLowerCase() },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const status = data?.data?.vaultStatuses?.[0];

    if (!status) return null;

    // Calculate utilization: totalBorrows / (totalBorrows + cash)
    const totalBorrows = parseFloat(status.totalBorrows) || 0;
    const cash = parseFloat(status.cash) || 0;
    const totalSupply = totalBorrows + cash;

    if (totalSupply === 0) return null;

    const result: UtilizationResult = {
      utilization: (totalBorrows / totalSupply) * 100,
      totalSupply,
      totalBorrow: totalBorrows,
      source: 'euler-subgraph',
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('[Euler Utilization] Error:', err);
    return null;
  }
}

/**
 * Main function to fetch utilization based on protocol
 */
export async function fetchProtocolUtilization(
  protocol: string,
  tokenAddress: string,
  chain: string
): Promise<UtilizationResult | null> {
  const protocolLower = protocol.toLowerCase();

  // Morpho vaults (v1 = MetaMorpho vaults)
  if (protocolLower === 'morpho-v1' || protocolLower === 'morpho') {
    return fetchMorphoVaultUtilization(tokenAddress, chain);
  }

  // Euler v2
  if (protocolLower === 'euler-v2' || protocolLower === 'euler') {
    return fetchEulerVaultUtilization(tokenAddress, chain);
  }

  // Protocols that don't have traditional utilization
  // (staking, yield trading, etc.)
  const noUtilizationProtocols = [
    'lido', 'rocketpool', 'pendle', 'convex', 'yearn',
    'sky-lending', // sUSDS is a savings wrapper, not lending
    'aave-v3', // stkGHO is staking, not lending
  ];

  if (noUtilizationProtocols.includes(protocolLower)) {
    return null;
  }

  return null;
}

/**
 * Batch fetch utilization for multiple positions
 */
export async function fetchAllUtilization(
  positions: Array<{ protocol: string; tokenAddress?: string; chain: string; poolId: string }>
): Promise<Map<string, UtilizationResult>> {
  const results = new Map<string, UtilizationResult>();

  // Fetch in parallel with rate limiting
  const batchSize = 3;
  for (let i = 0; i < positions.length; i += batchSize) {
    const batch = positions.slice(i, i + batchSize);
    const promises = batch.map(async (pos) => {
      if (!pos.tokenAddress) return null;
      const result = await fetchProtocolUtilization(pos.protocol, pos.tokenAddress, pos.chain);
      if (result) {
        results.set(pos.poolId, result);
      }
      return result;
    });
    await Promise.all(promises);

    // Small delay between batches
    if (i + batchSize < positions.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  return results;
}
