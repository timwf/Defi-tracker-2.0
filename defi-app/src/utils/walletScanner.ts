import type { ScannedToken, TokenTransaction } from '../types/pool';

// Chain configurations for Alchemy API
const CHAIN_CONFIG: Record<string, { alchemyNetwork: string; nativeSymbol: string; nativeName: string; coingeckoId: string }> = {
  Ethereum: { alchemyNetwork: 'eth-mainnet', nativeSymbol: 'ETH', nativeName: 'Ethereum', coingeckoId: 'ethereum' },
  Arbitrum: { alchemyNetwork: 'arb-mainnet', nativeSymbol: 'ETH', nativeName: 'Ethereum', coingeckoId: 'ethereum' },
  Polygon: { alchemyNetwork: 'polygon-mainnet', nativeSymbol: 'MATIC', nativeName: 'Polygon', coingeckoId: 'matic-network' },
  Optimism: { alchemyNetwork: 'opt-mainnet', nativeSymbol: 'ETH', nativeName: 'Ethereum', coingeckoId: 'ethereum' },
  Base: { alchemyNetwork: 'base-mainnet', nativeSymbol: 'ETH', nativeName: 'Ethereum', coingeckoId: 'ethereum' },
};

export const SUPPORTED_CHAINS = Object.keys(CHAIN_CONFIG);

interface AlchemyTokenBalance {
  contractAddress: string;
  tokenBalance: string;
}

interface AlchemyTokenMetadata {
  name: string | null;
  symbol: string | null;
  decimals: number | null;
  logo: string | null;
}

// Price cache
const priceCache: Map<string, { price: number; timestamp: number }> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// DeFiLlama chain name mapping (for their price API)
const DEFILLAMA_CHAINS: Record<string, string> = {
  'Ethereum': 'ethereum',
  'Arbitrum': 'arbitrum',
  'Polygon': 'polygon',
  'Optimism': 'optimism',
  'Base': 'base',
};

function getAlchemyUrl(chain: string): string {
  const config = CHAIN_CONFIG[chain];
  if (!config) throw new Error(`Unsupported chain: ${chain}`);
  const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
  if (!apiKey) throw new Error('VITE_ALCHEMY_API_KEY not configured');
  return `https://${config.alchemyNetwork}.g.alchemy.com/v2/${apiKey}`;
}

async function getTokenBalances(walletAddress: string, chain: string): Promise<AlchemyTokenBalance[]> {
  const url = getAlchemyUrl(chain);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'alchemy_getTokenBalances',
      params: [walletAddress, 'erc20'],
      id: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch token balances for ${chain}: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`Alchemy error for ${chain}: ${data.error.message}`);
  }

  return data.result?.tokenBalances || [];
}

async function getTokenMetadata(tokenAddress: string, chain: string): Promise<AlchemyTokenMetadata> {
  const url = getAlchemyUrl(chain);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'alchemy_getTokenMetadata',
      params: [tokenAddress],
      id: 1,
    }),
  });

  if (!response.ok) {
    return { name: null, symbol: null, decimals: null, logo: null };
  }

  const data = await response.json();
  return data.result || { name: null, symbol: null, decimals: null, logo: null };
}

async function getNativeBalance(walletAddress: string, chain: string): Promise<string> {
  const url = getAlchemyUrl(chain);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [walletAddress, 'latest'],
      id: 1,
    }),
  });

  if (!response.ok) {
    return '0x0';
  }

  const data = await response.json();
  return data.result || '0x0';
}

function hexToDecimal(hex: string): bigint {
  if (!hex || hex === '0x0' || hex === '0x') return BigInt(0);
  return BigInt(hex);
}

// Fetch token prices using DeFiLlama API (CORS-friendly, no rate limits)
async function fetchTokenPrices(
  tokens: { chain: string; tokenAddress: string }[]
): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>();

  // Check cache first
  const tokensToFetch: { chain: string; tokenAddress: string }[] = [];
  for (const token of tokens) {
    const cacheKey = `${token.chain}:${token.tokenAddress.toLowerCase()}`;
    const cached = priceCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      priceMap.set(cacheKey, cached.price);
    } else {
      tokensToFetch.push(token);
    }
  }

  if (tokensToFetch.length === 0) return priceMap;

  // Build DeFiLlama coins parameter: "chain:address,chain:address,..."
  const coins = tokensToFetch
    .map(t => {
      const llamaChain = DEFILLAMA_CHAINS[t.chain];
      return llamaChain ? `${llamaChain}:${t.tokenAddress.toLowerCase()}` : null;
    })
    .filter(Boolean)
    .join(',');

  if (!coins) return priceMap;

  try {
    const response = await fetch(
      `https://coins.llama.fi/prices/current/${coins}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (response.ok) {
      const data = await response.json();
      const coinPrices = data.coins || {};

      for (const token of tokensToFetch) {
        const llamaChain = DEFILLAMA_CHAINS[token.chain];
        if (!llamaChain) continue;

        const key = `${llamaChain}:${token.tokenAddress.toLowerCase()}`;
        const priceData = coinPrices[key];
        if (priceData?.price) {
          const mapKey = `${token.chain}:${token.tokenAddress.toLowerCase()}`;
          priceMap.set(mapKey, priceData.price);
          priceCache.set(mapKey, { price: priceData.price, timestamp: Date.now() });
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch prices from DeFiLlama:', err);
  }

  return priceMap;
}

// Fetch native token price using DeFiLlama
async function fetchNativePrice(chain: string): Promise<number | null> {
  const config = CHAIN_CONFIG[chain];
  if (!config) return null;

  const cacheKey = `native:${chain}`;
  const cached = priceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  // Use coingecko ID mapping for native tokens
  const nativeCoins: Record<string, string> = {
    'ethereum': 'coingecko:ethereum',
    'matic-network': 'coingecko:matic-network',
  };

  const coin = nativeCoins[config.coingeckoId] || `coingecko:${config.coingeckoId}`;

  try {
    const response = await fetch(
      `https://coins.llama.fi/prices/current/${coin}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (response.ok) {
      const data = await response.json();
      const price = data.coins?.[coin]?.price;
      if (typeof price === 'number') {
        priceCache.set(cacheKey, { price, timestamp: Date.now() });
        return price;
      }
    }
  } catch (err) {
    console.warn(`Failed to fetch native price for ${chain}:`, err);
  }

  return null;
}

// Fetch underlying token prices for stablecoin vaults
// Takes an array of token addresses with their chains and returns price info
export interface UnderlyingTokenPrice {
  address: string;
  chain: string;
  symbol: string | null;
  price: number;
  depegPct: number; // Percentage off from $1.00 peg
}

export async function fetchUnderlyingTokenPrices(
  tokens: { address: string; chain: string }[]
): Promise<UnderlyingTokenPrice[]> {
  if (tokens.length === 0) return [];

  // Build DeFiLlama coins parameter
  const coins = tokens
    .map(t => {
      const llamaChain = DEFILLAMA_CHAINS[t.chain];
      return llamaChain ? `${llamaChain}:${t.address.toLowerCase()}` : null;
    })
    .filter(Boolean)
    .join(',');

  if (!coins) return [];

  try {
    const response = await fetch(
      `https://coins.llama.fi/prices/current/${coins}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) return [];

    const data = await response.json();
    const coinPrices = data.coins || {};

    const results: UnderlyingTokenPrice[] = [];

    for (const token of tokens) {
      const llamaChain = DEFILLAMA_CHAINS[token.chain];
      if (!llamaChain) continue;

      const key = `${llamaChain}:${token.address.toLowerCase()}`;
      const priceData = coinPrices[key];

      if (priceData?.price) {
        const price = priceData.price;
        const depegPct = (price - 1) * 100; // How far off from $1.00

        results.push({
          address: token.address,
          chain: token.chain,
          symbol: priceData.symbol || null,
          price,
          depegPct,
        });
      }
    }

    return results;
  } catch (err) {
    console.warn('Failed to fetch underlying token prices:', err);
    return [];
  }
}

function formatBalance(balanceRaw: bigint, decimals: number): number {
  if (decimals === 0) return Number(balanceRaw);
  const divisor = BigInt(10 ** decimals);
  const whole = balanceRaw / divisor;
  const remainder = balanceRaw % divisor;
  return Number(whole) + Number(remainder) / Number(divisor);
}

// ERC-4626 convertToAssets function selector: 0x07a2d13a
// convertToAssets(uint256 shares) returns (uint256 assets)
export async function getVaultUnderlyingValue(
  vaultAddress: string,
  sharesBalance: bigint,
  chain: string
): Promise<{ underlyingValue: number; underlyingDecimals: number } | null> {
  if (!CHAIN_CONFIG[chain]) return null;

  try {
    const url = getAlchemyUrl(chain);

    // Encode the function call: convertToAssets(uint256)
    // Function selector: 0x07a2d13a
    // Pad shares to 32 bytes
    const sharesHex = sharesBalance.toString(16).padStart(64, '0');
    const callData = `0x07a2d13a${sharesHex}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: vaultAddress,
          data: callData,
        }, 'latest'],
        id: 1,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.error || !data.result || data.result === '0x') {
      console.warn('[convertToAssets] Call failed:', data.error?.message || 'empty result');
      return null;
    }

    const underlyingRaw = BigInt(data.result);

    // Get underlying token decimals by calling asset() then getting metadata
    // For now, assume same decimals as shares (common for stablecoin vaults)
    // We can enhance this later to call asset() if needed
    const metadata = await getTokenMetadata(vaultAddress, chain);
    const decimals = metadata.decimals ?? 6; // Default to 6 for USDC-based vaults

    const underlyingValue = formatBalance(underlyingRaw, decimals);

    console.log('[convertToAssets]', {
      vaultAddress,
      sharesBalance: sharesBalance.toString(),
      underlyingRaw: underlyingRaw.toString(),
      underlyingValue,
      decimals,
    });

    return { underlyingValue, underlyingDecimals: decimals };
  } catch (err) {
    console.error('[convertToAssets] Error:', err);
    return null;
  }
}

export async function scanWalletTokens(
  walletAddress: string,
  chains: string[],
  onProgress?: (chain: string, status: 'scanning' | 'done' | 'error' | 'fetching_prices') => void
): Promise<ScannedToken[]> {
  const allTokens: ScannedToken[] = [];

  for (const chain of chains) {
    if (!CHAIN_CONFIG[chain]) continue;

    onProgress?.(chain, 'scanning');

    try {
      // Get native balance
      const nativeBalanceHex = await getNativeBalance(walletAddress, chain);
      const nativeBalanceRaw = hexToDecimal(nativeBalanceHex);

      if (nativeBalanceRaw > BigInt(0)) {
        const config = CHAIN_CONFIG[chain];
        const nativeBalance = formatBalance(nativeBalanceRaw, 18);
        const nativePrice = await fetchNativePrice(chain);

        allTokens.push({
          chain,
          tokenAddress: '0x0000000000000000000000000000000000000000', // Native token address
          tokenSymbol: config.nativeSymbol,
          tokenName: config.nativeName,
          balanceRaw: nativeBalanceRaw.toString(),
          balanceFormatted: nativeBalance,
          decimals: 18,
          usdValue: nativePrice ? nativeBalance * nativePrice : null,
        });
      }

      // Get ERC-20 token balances
      const tokenBalances = await getTokenBalances(walletAddress, chain);

      // Filter out zero balances
      const nonZeroBalances = tokenBalances.filter(t => {
        const balance = hexToDecimal(t.tokenBalance);
        return balance > BigInt(0);
      });

      // Fetch metadata for each token (batch if many tokens)
      for (const token of nonZeroBalances) {
        try {
          const metadata = await getTokenMetadata(token.contractAddress, chain);
          const balanceRaw = hexToDecimal(token.tokenBalance);
          const decimals = metadata.decimals ?? 18;

          // Debug log for token addresses
          console.log(`Token: ${metadata.symbol} (${metadata.name}) - Address: ${token.contractAddress.toLowerCase()}`);

          allTokens.push({
            chain,
            tokenAddress: token.contractAddress.toLowerCase(),
            tokenSymbol: metadata.symbol,
            tokenName: metadata.name,
            balanceRaw: balanceRaw.toString(),
            balanceFormatted: formatBalance(balanceRaw, decimals),
            decimals,
            usdValue: null, // Will be filled in below
          });
        } catch (err) {
          console.warn(`Failed to get metadata for ${token.contractAddress}:`, err);
        }
      }

      onProgress?.(chain, 'done');
    } catch (err) {
      console.error(`Error scanning ${chain}:`, err);
      onProgress?.(chain, 'error');
    }
  }

  // Fetch USD prices for all ERC-20 tokens
  const erc20Tokens = allTokens.filter(t => t.tokenAddress !== '0x0000000000000000000000000000000000000000');
  if (erc20Tokens.length > 0) {
    onProgress?.('prices', 'fetching_prices');

    const priceMap = await fetchTokenPrices(
      erc20Tokens.map(t => ({ chain: t.chain, tokenAddress: t.tokenAddress }))
    );

    // Apply prices to tokens
    for (const token of allTokens) {
      if (token.tokenAddress === '0x0000000000000000000000000000000000000000') continue;

      const key = `${token.chain}:${token.tokenAddress.toLowerCase()}`;
      const price = priceMap.get(key);
      if (price) {
        token.usdValue = token.balanceFormatted * price;
      }
    }
  }

  // Sort by USD value (tokens without USD value go to end)
  return allTokens.sort((a, b) => {
    if (a.usdValue !== null && b.usdValue !== null) {
      return b.usdValue - a.usdValue;
    }
    if (a.usdValue !== null) return -1;
    if (b.usdValue !== null) return 1;
    return b.balanceFormatted - a.balanceFormatted;
  });
}

export function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Interface for transfer history
interface AssetTransfer {
  blockNum: string;
  from: string;
  to: string;
  value: number | null;
  asset: string | null;
  hash: string;
  metadata: {
    blockTimestamp: string;
  };
}

// Fetch the first transfer of a token to a wallet (for entry date tracking)
export async function getFirstTokenTransfer(
  walletAddress: string,
  tokenAddress: string,
  chain: string
): Promise<{ timestamp: number; amount: number } | null> {
  if (!CHAIN_CONFIG[chain]) return null;

  try {
    const url = getAlchemyUrl(chain);

    // Fetch incoming transfers for this token to the wallet
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [{
          fromBlock: '0x0',
          toBlock: 'latest',
          toAddress: walletAddress,
          contractAddresses: [tokenAddress],
          category: ['erc20'],
          withMetadata: true,
          order: 'asc', // Oldest first
          maxCount: '0x1', // Only need the first one
        }],
        id: 1,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const transfers: AssetTransfer[] = data.result?.transfers || [];

    if (transfers.length === 0) return null;

    const firstTransfer = transfers[0];
    const timestamp = new Date(firstTransfer.metadata.blockTimestamp).getTime();
    const amount = firstTransfer.value ?? 0;

    return { timestamp, amount };
  } catch (err) {
    console.error('Error fetching first transfer:', err);
    return null;
  }
}

// Fetch historical token price from DeFiLlama
export async function fetchHistoricalPrice(
  tokenAddress: string,
  chain: string,
  timestamp: number
): Promise<number | null> {
  const llamaChain = DEFILLAMA_CHAINS[chain];
  if (!llamaChain) return null;

  // Convert timestamp to seconds for DeFiLlama API
  const timestampSeconds = Math.floor(timestamp / 1000);
  const coin = `${llamaChain}:${tokenAddress.toLowerCase()}`;

  try {
    const response = await fetch(
      `https://coins.llama.fi/prices/historical/${timestampSeconds}/${coin}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const price = data.coins?.[coin]?.price;

    return typeof price === 'number' ? price : null;
  } catch (err) {
    console.error('Error fetching historical price:', err);
    return null;
  }
}

// Get entry data for a token (first transfer date, price at that time)
export async function getTokenEntryData(
  walletAddress: string,
  tokenAddress: string,
  chain: string
): Promise<{
  firstAcquiredAt: number;
  entryPriceUsd: number | null;
  initialTokenBalance: number;
  initialAmountUsd: number | null;
} | null> {
  const firstTransfer = await getFirstTokenTransfer(walletAddress, tokenAddress, chain);

  if (!firstTransfer) return null;

  const entryPriceUsd = await fetchHistoricalPrice(
    tokenAddress,
    chain,
    firstTransfer.timestamp
  );

  return {
    firstAcquiredAt: firstTransfer.timestamp,
    entryPriceUsd,
    initialTokenBalance: firstTransfer.amount,
    initialAmountUsd: entryPriceUsd ? firstTransfer.amount * entryPriceUsd : null,
  };
}

// Get ALL token transfers (deposits) - for yield tracking
export async function getAllTokenTransfers(
  walletAddress: string,
  tokenAddress: string,
  chain: string
): Promise<{
  transactions: TokenTransaction[];
  firstAcquiredAt: number;
  totalDeposited: number;
} | null> {
  if (!CHAIN_CONFIG[chain]) return null;

  try {
    const url = getAlchemyUrl(chain);

    // Fetch ALL incoming transfers (deposits)
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [{
          fromBlock: '0x0',
          toBlock: 'latest',
          toAddress: walletAddress,
          contractAddresses: [tokenAddress],
          category: ['erc20'],
          withMetadata: true,
          order: 'asc', // Oldest first
        }],
        id: 1,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const transfers: AssetTransfer[] = data.result?.transfers || [];

    if (transfers.length === 0) return null;

    // Build transaction list (no historical price fetching needed for stablecoin yield tracking)
    const transactions: TokenTransaction[] = [];
    let totalDeposited = 0;

    for (const transfer of transfers) {
      const timestamp = new Date(transfer.metadata.blockTimestamp).getTime();
      const amount = transfer.value ?? 0;

      transactions.push({
        timestamp,
        amount,
        priceUsd: null, // Not needed for yield tracking
        valueUsd: null, // Not needed for yield tracking
        type: 'deposit',
        txHash: transfer.hash,
      });

      totalDeposited += amount;
    }

    const firstAcquiredAt = transactions[0]?.timestamp ?? 0;

    return {
      transactions,
      firstAcquiredAt,
      totalDeposited,
    };
  } catch (err) {
    console.error('Error fetching all transfers:', err);
    return null;
  }
}

// Refresh a single token's balance and price
export async function refreshTokenBalance(
  walletAddress: string,
  tokenAddress: string,
  chain: string
): Promise<{ balance: number; symbol: string | null; usdValue: number | null } | null> {
  if (!CHAIN_CONFIG[chain]) return null;

  try {
    // Get token balance
    const url = getAlchemyUrl(chain);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getTokenBalances',
        params: [walletAddress, [tokenAddress]],
        id: 1,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const tokenBalances = data.result?.tokenBalances || [];
    const tokenData = tokenBalances[0];

    if (!tokenData || !tokenData.tokenBalance) return null;

    const balanceRaw = hexToDecimal(tokenData.tokenBalance);
    if (balanceRaw === BigInt(0)) return null;

    // Get token metadata
    const metadata = await getTokenMetadata(tokenAddress, chain);
    const decimals = metadata.decimals ?? 18;
    const balance = formatBalance(balanceRaw, decimals);

    console.log('[Balance Debug]', {
      tokenAddress,
      chain,
      symbol: metadata.symbol,
      decimals,
      balanceRawHex: tokenData.tokenBalance,
      balanceRaw: balanceRaw.toString(),
      balanceFormatted: balance,
    });

    // Get price from DeFiLlama
    const priceMap = await fetchTokenPrices([{ chain, tokenAddress }]);
    const priceKey = `${chain}:${tokenAddress.toLowerCase()}`;
    const price = priceMap.get(priceKey);

    return {
      balance,
      symbol: metadata.symbol,
      usdValue: price ? balance * price : null,
    };
  } catch (err) {
    console.error('Error refreshing token balance:', err);
    return null;
  }
}
