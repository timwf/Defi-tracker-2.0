import type { ScannedToken, TokenTransaction } from '../types/pool';
// Note: @drift-labs/sdk is installed but NOT imported here because it uses Node.js-only
// modules (node-cache) that crash in browser builds. If Drift integration is needed,
// use dynamic imports with try/catch. For now, Drift positions should be tracked manually.

// Chain configurations for Alchemy API
const CHAIN_CONFIG: Record<string, { alchemyNetwork: string; nativeSymbol: string; nativeName: string; coingeckoId: string }> = {
  Ethereum: { alchemyNetwork: 'eth-mainnet', nativeSymbol: 'ETH', nativeName: 'Ethereum', coingeckoId: 'ethereum' },
  Arbitrum: { alchemyNetwork: 'arb-mainnet', nativeSymbol: 'ETH', nativeName: 'Ethereum', coingeckoId: 'ethereum' },
  Polygon: { alchemyNetwork: 'polygon-mainnet', nativeSymbol: 'MATIC', nativeName: 'Polygon', coingeckoId: 'matic-network' },
  Optimism: { alchemyNetwork: 'opt-mainnet', nativeSymbol: 'ETH', nativeName: 'Ethereum', coingeckoId: 'ethereum' },
  Base: { alchemyNetwork: 'base-mainnet', nativeSymbol: 'ETH', nativeName: 'Ethereum', coingeckoId: 'ethereum' },
};

// EVM chains from CHAIN_CONFIG + Solana
export const SUPPORTED_CHAINS = [...Object.keys(CHAIN_CONFIG), 'Solana'];

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
  'Solana': 'solana',
};

// Solana configuration
const SOLANA_CONFIG = {
  network: 'solana-mainnet',
  nativeSymbol: 'SOL',
  nativeName: 'Solana',
  decimals: 9,
  coingeckoId: 'solana',
};

// SPL Token Program ID (standard for all SPL tokens)
const SPL_TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

function getSolanaRpcUrl(): string {
  const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
  if (!apiKey) throw new Error('VITE_ALCHEMY_API_KEY not configured');
  return `https://solana-mainnet.g.alchemy.com/v2/${apiKey}`;
}

async function getSolanaBalance(walletAddress: string): Promise<number> {
  const url = getSolanaRpcUrl();

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'getBalance',
      params: [walletAddress],
      id: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Solana balance: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`Solana RPC error: ${data.error.message}`);
  }

  // Balance is in lamports (1 SOL = 1e9 lamports)
  const lamports = data.result?.value ?? 0;
  return lamports / 1e9;
}

interface SolanaTokenAccount {
  mint: string;
  amount: string;
  decimals: number;
}

async function getSolanaTokenAccounts(walletAddress: string): Promise<SolanaTokenAccount[]> {
  const url = getSolanaRpcUrl();

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'getTokenAccountsByOwner',
      params: [
        walletAddress,
        { programId: SPL_TOKEN_PROGRAM_ID },
        { encoding: 'jsonParsed' },
      ],
      id: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Solana token accounts: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`Solana RPC error: ${data.error.message}`);
  }

  const accounts: SolanaTokenAccount[] = [];
  const tokenAccounts = data.result?.value || [];

  for (const account of tokenAccounts) {
    const parsed = account.account?.data?.parsed?.info;
    if (!parsed) continue;

    const amount = parsed.tokenAmount?.amount;
    const decimals = parsed.tokenAmount?.decimals;
    const mint = parsed.mint;

    // Skip zero balances
    if (!amount || amount === '0') continue;

    accounts.push({
      mint,
      amount,
      decimals: decimals ?? 0,
    });
  }

  return accounts;
}

// Fetch native SOL price
async function fetchSolPrice(): Promise<number | null> {
  const cacheKey = 'native:Solana';
  const cached = priceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  try {
    const response = await fetch(
      'https://coins.llama.fi/prices/current/coingecko:solana',
      { headers: { 'Accept': 'application/json' } }
    );

    if (response.ok) {
      const data = await response.json();
      const price = data.coins?.['coingecko:solana']?.price;
      if (typeof price === 'number') {
        priceCache.set(cacheKey, { price, timestamp: Date.now() });
        return price;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch SOL price:', err);
  }

  return null;
}

// Scan Solana wallet for tokens
// Drift spot market configurations (market index -> token info)
const DRIFT_SPOT_MARKETS: Record<number, { symbol: string; name: string; mint: string; decimals: number }> = {
  0: { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
  1: { symbol: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
  2: { symbol: 'mSOL', name: 'Marinade Staked SOL', mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', decimals: 9 },
  3: { symbol: 'wBTC', name: 'Wrapped Bitcoin', mint: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh', decimals: 8 },
  4: { symbol: 'wETH', name: 'Wrapped Ether', mint: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', decimals: 8 },
  5: { symbol: 'USDT', name: 'Tether USD', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
  6: { symbol: 'jitoSOL', name: 'Jito Staked SOL', mint: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn', decimals: 9 },
  7: { symbol: 'PYTH', name: 'Pyth Network', mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', decimals: 6 },
  8: { symbol: 'bSOL', name: 'BlazeStake Staked SOL', mint: 'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1', decimals: 9 },
  9: { symbol: 'JTO', name: 'Jito', mint: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL', decimals: 9 },
  10: { symbol: 'WIF', name: 'dogwifhat', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', decimals: 6 },
  15: { symbol: 'dSOL', name: 'Drift Staked SOL', mint: 'Dso1bDeDjCQxTrWHqUUi63oBvV7Mdm6WaobLbQ7gnPQ', decimals: 9 },
};

interface DriftPosition {
  marketIndex: number;
  symbol: string;
  name: string;
  mint: string;
  balance: number;
  decimals: number;
  isDeposit: boolean;
}

// Fetch Drift protocol positions for a wallet
// Currently disabled - the @drift-labs/sdk uses Node.js-only modules (node-cache)
// that crash in browser builds. Drift positions should be tracked manually for now.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchDriftPositions(_walletAddress: string): Promise<DriftPosition[]> {
  // Drift SDK integration disabled - returns empty array
  // To re-enable, would need to use a server-side API or find a browser-compatible approach
  return [];
}

async function scanSolanaWallet(
  walletAddress: string,
  onProgress?: (chain: string, status: 'scanning' | 'done' | 'error' | 'fetching_prices') => void
): Promise<ScannedToken[]> {
  const tokens: ScannedToken[] = [];

  onProgress?.('Solana', 'scanning');

  try {
    // Get native SOL balance
    const solBalance = await getSolanaBalance(walletAddress);
    if (solBalance > 0) {
      const solPrice = await fetchSolPrice();
      tokens.push({
        chain: 'Solana',
        tokenAddress: 'So11111111111111111111111111111111111111112', // Wrapped SOL mint (used as identifier)
        tokenSymbol: SOLANA_CONFIG.nativeSymbol,
        tokenName: SOLANA_CONFIG.nativeName,
        balanceRaw: Math.floor(solBalance * 1e9).toString(),
        balanceFormatted: solBalance,
        decimals: SOLANA_CONFIG.decimals,
        usdValue: solPrice ? solBalance * solPrice : null,
      });
    }

    // Get SPL token accounts
    const tokenAccounts = await getSolanaTokenAccounts(walletAddress);

    for (const account of tokenAccounts) {
      const balanceFormatted = Number(account.amount) / Math.pow(10, account.decimals);

      tokens.push({
        chain: 'Solana',
        tokenAddress: account.mint,
        tokenSymbol: null, // Will try to get from price API
        tokenName: null,
        balanceRaw: account.amount,
        balanceFormatted,
        decimals: account.decimals,
        usdValue: null, // Will be filled in with price fetch
      });
    }

    // Drift protocol positions - disabled for now
    // The Drift SDK requires getProgramAccounts which hits rate limits on Alchemy
    // and is blocked by public Solana RPC. Would need Helius or dedicated RPC.
    // For now, Drift positions should be tracked manually.
    //
    // To re-enable: uncomment below and use Helius RPC in fetchDriftPositions
    // try {
    //   const driftPositions = await fetchDriftPositions(walletAddress);
    //   for (const position of driftPositions) {
    //     if (position.isDeposit) {
    //       tokens.push({
    //         chain: 'Solana',
    //         tokenAddress: position.mint,
    //         tokenSymbol: `${position.symbol} (Drift)`,
    //         tokenName: `${position.name} - Drift Deposit`,
    //         balanceRaw: Math.floor(position.balance * Math.pow(10, position.decimals)).toString(),
    //         balanceFormatted: position.balance,
    //         decimals: position.decimals,
    //         usdValue: null,
    //       });
    //     }
    //   }
    // } catch (err) {
    //   console.warn('Failed to fetch Drift positions:', err);
    // }

    onProgress?.('Solana', 'done');
  } catch (err) {
    console.error('Error scanning Solana wallet:', err);
    onProgress?.('Solana', 'error');
  }

  return tokens;
}

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

    // Get the underlying asset address by calling asset()
    // Function selector for asset(): 0x38d52e0f
    let underlyingDecimals = 6; // Default for USDC
    try {
      const assetResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: vaultAddress,
            data: '0x38d52e0f', // asset()
          }, 'latest'],
          id: 2,
        }),
      });

      if (assetResponse.ok) {
        const assetData = await assetResponse.json();
        if (assetData.result && assetData.result !== '0x') {
          // Extract address from the 32-byte response (last 20 bytes)
          const underlyingAddress = '0x' + assetData.result.slice(-40);
          const underlyingMetadata = await getTokenMetadata(underlyingAddress, chain);
          underlyingDecimals = underlyingMetadata.decimals ?? 6;
        }
      }
    } catch {
      // Fall back to default decimals
    }

    const underlyingValue = formatBalance(underlyingRaw, underlyingDecimals);

    return { underlyingValue, underlyingDecimals };
  } catch (err) {
    console.error('[convertToAssets] Error:', err);
    return null;
  }
}

// Alternative deposit tokens that can be converted to the underlying asset via PSM/swap
// For sUSDS vault, users can deposit with USDC or DAI which get converted to USDS
const ALTERNATIVE_DEPOSIT_TOKENS: Record<string, Record<string, string[]>> = {
  'Ethereum': {
    // USDS address -> also track USDC and DAI (both convertible via PSM)
    '0xdc035d45d973e3ec169d2276ddab16f1e407384f': [
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    ],
  },
};

// Get actual USD deposited to an ERC-4626 vault by tracking deposit transactions
// Strategy: Find txs where user received vault shares, then find underlying token outflows in those txs
export async function getVaultDepositedAmount(
  vaultAddress: string,
  walletAddress: string,
  chain: string
): Promise<{ totalDeposited: number; underlyingAddress: string; underlyingDecimals: number } | null> {
  if (!CHAIN_CONFIG[chain]) return null;

  try {
    const url = getAlchemyUrl(chain);

    // Step 1: Get the underlying asset address by calling asset() on the vault
    const assetResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: vaultAddress,
          data: '0x38d52e0f', // asset() function selector
        }, 'latest'],
        id: 1,
      }),
    });

    if (!assetResponse.ok) return null;

    const assetData = await assetResponse.json();
    if (!assetData.result || assetData.result === '0x') {
      console.warn('[getVaultDepositedAmount] asset() call failed');
      return null;
    }

    // Extract address from the 32-byte response (last 20 bytes)
    const underlyingAddress = '0x' + assetData.result.slice(-40);

    // Get underlying token decimals
    const underlyingMetadata = await getTokenMetadata(underlyingAddress, chain);
    const underlyingDecimals = underlyingMetadata.decimals ?? 6;

    // Step 2: Get all transactions where user RECEIVED vault shares (deposit = receiving shares)
    const shareReceiveResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [{
          fromBlock: '0x0',
          toBlock: 'latest',
          toAddress: walletAddress,
          contractAddresses: [vaultAddress],
          category: ['erc20'],
          withMetadata: true,
          order: 'asc',
        }],
        id: 2,
      }),
    });

    if (!shareReceiveResponse.ok) return null;

    const shareReceiveData = await shareReceiveResponse.json();
    const shareReceives: AssetTransfer[] = shareReceiveData.result?.transfers || [];

    // Get unique tx hashes where user received vault shares (these are deposit txs)
    const depositTxHashes = new Set(shareReceives.map(t => t.hash));

    if (depositTxHashes.size === 0) {
      return { totalDeposited: 0, underlyingAddress, underlyingDecimals };
    }

    // Step 3: Get ALL outgoing transfers of underlying token from user
    const underlyingOutResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [{
          fromBlock: '0x0',
          toBlock: 'latest',
          fromAddress: walletAddress,
          contractAddresses: [underlyingAddress],
          category: ['erc20'],
          withMetadata: true,
          order: 'asc',
        }],
        id: 3,
      }),
    });

    if (!underlyingOutResponse.ok) return null;

    const underlyingOutData = await underlyingOutResponse.json();
    const underlyingOuts: AssetTransfer[] = underlyingOutData.result?.transfers || [];

    // Combine all token outflows (underlying + alternatives like USDC/DAI for USDS)
    let allTokenOuts: AssetTransfer[] = [...underlyingOuts];

    // Check for alternative deposit tokens (e.g., USDC can be deposited into sUSDS via PSM)
    const altTokens = ALTERNATIVE_DEPOSIT_TOKENS[chain]?.[underlyingAddress.toLowerCase()];
    if (altTokens && altTokens.length > 0) {
      for (const altToken of altTokens) {
        const altResponse = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'alchemy_getAssetTransfers',
            params: [{
              fromBlock: '0x0',
              toBlock: 'latest',
              fromAddress: walletAddress,
              contractAddresses: [altToken],
              category: ['erc20'],
              withMetadata: true,
              order: 'asc',
            }],
            id: 4,
          }),
        });

        if (altResponse.ok) {
          const altData = await altResponse.json();
          const altOuts: AssetTransfer[] = altData.result?.transfers || [];
          if (altOuts.length > 0) {
            allTokenOuts = [...allTokenOuts, ...altOuts];
          }
        }
      }
    }

    // Sum all token outflows that occurred in deposit transactions
    let totalDeposited = 0;
    const matchedTxs: string[] = [];
    for (const transfer of allTokenOuts) {
      if (depositTxHashes.has(transfer.hash) && !matchedTxs.includes(transfer.hash)) {
        totalDeposited += transfer.value ?? 0;
        matchedTxs.push(transfer.hash);
      }
    }

    return { totalDeposited, underlyingAddress, underlyingDecimals };
  } catch (err) {
    console.error('[getVaultDepositedAmount] Error:', err);
    return null;
  }
}

// Common stablecoins and yield tokens to check for PT token purchases (by chain)
const STABLECOINS_BY_CHAIN: Record<string, { address: string; symbol: string; decimals: number }[]> = {
  'Arbitrum': [
    { address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831', symbol: 'USDC', decimals: 6 },
    { address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', symbol: 'USDC.e', decimals: 6 },
    { address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', symbol: 'USDT', decimals: 6 },
    { address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', symbol: 'DAI', decimals: 18 },
    // Yield-bearing tokens commonly used in Pendle
    { address: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', symbol: 'WBTC', decimals: 8 },
    { address: '0x1c22531aa9747d76fff8f0a43b37954ca67d28e0', symbol: 'sUSDai', decimals: 18 },
  ],
  'Ethereum': [
    { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC', decimals: 6 },
    { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT', decimals: 6 },
    { address: '0x6b175474e89094c44da98b954eedeac495271d0f', symbol: 'DAI', decimals: 18 },
  ],
  'Base': [
    { address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', symbol: 'USDC', decimals: 6 },
  ],
};

// Get cost basis for PT tokens by tracking stablecoin outflows in purchase transactions
export async function getPTCostBasis(
  ptTokenAddress: string,
  walletAddress: string,
  chain: string
): Promise<{ totalCost: number; purchaseTxCount: number } | null> {
  if (!CHAIN_CONFIG[chain]) return null;

  try {
    const url = getAlchemyUrl(chain);

    // Step 1: Find all transactions where user received PT tokens
    const ptReceiveResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [{
          fromBlock: '0x0',
          toBlock: 'latest',
          toAddress: walletAddress,
          contractAddresses: [ptTokenAddress],
          category: ['erc20'],
          withMetadata: true,
          order: 'asc',
        }],
        id: 1,
      }),
    });

    if (!ptReceiveResponse.ok) return null;

    const ptReceiveData = await ptReceiveResponse.json();
    const ptReceives: AssetTransfer[] = ptReceiveData.result?.transfers || [];

    // Get unique tx hashes where user received PT tokens (these are purchase txs)
    const purchaseTxHashes = new Set(ptReceives.map(t => t.hash));

    if (purchaseTxHashes.size === 0) {
      return { totalCost: 0, purchaseTxCount: 0 };
    }

    // Step 2: For each stablecoin, find outflows that match purchase tx hashes
    const stablecoins = STABLECOINS_BY_CHAIN[chain] || [];
    let totalCost = 0;
    const matchedTxs: string[] = [];

    for (const stable of stablecoins) {
      const stableOutResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'alchemy_getAssetTransfers',
          params: [{
            fromBlock: '0x0',
            toBlock: 'latest',
            fromAddress: walletAddress,
            contractAddresses: [stable.address],
            category: ['erc20'],
            withMetadata: true,
            order: 'asc',
          }],
          id: 2,
        }),
      });

      if (!stableOutResponse.ok) continue;

      const stableOutData = await stableOutResponse.json();
      const stableOuts: AssetTransfer[] = stableOutData.result?.transfers || [];

      // Find stablecoin outflows that occurred in PT purchase transactions
      for (const transfer of stableOuts) {
        if (purchaseTxHashes.has(transfer.hash) && !matchedTxs.includes(transfer.hash)) {
          totalCost += transfer.value ?? 0;
          matchedTxs.push(transfer.hash);
        }
      }
    }

    return { totalCost, purchaseTxCount: matchedTxs.length };
  } catch (err) {
    console.error('[getPTCostBasis] Error:', err);
    return null;
  }
}

export async function scanWalletTokens(
  walletAddress: string,
  chains: string[],
  onProgress?: (chain: string, status: 'scanning' | 'done' | 'error' | 'fetching_prices') => void
): Promise<ScannedToken[]> {
  const allTokens: ScannedToken[] = [];

  // Detect address type
  const addressInfo = isValidAddress(walletAddress);

  // Handle Solana addresses
  if (addressInfo.type === 'solana') {
    if (chains.includes('Solana')) {
      const solanaTokens = await scanSolanaWallet(walletAddress, onProgress);
      allTokens.push(...solanaTokens);
    }
    // Skip EVM chains for Solana addresses - return early after price fetch
    // Fetch USD prices for Solana SPL tokens
    const splTokens = allTokens.filter(t =>
      t.chain === 'Solana' &&
      t.tokenAddress !== 'So11111111111111111111111111111111111111112' &&
      t.usdValue === null
    );
    if (splTokens.length > 0) {
      onProgress?.('prices', 'fetching_prices');
      const priceMap = await fetchTokenPrices(
        splTokens.map(t => ({ chain: t.chain, tokenAddress: t.tokenAddress }))
      );
      for (const token of splTokens) {
        const key = `${token.chain}:${token.tokenAddress.toLowerCase()}`;
        const price = priceMap.get(key);
        if (price) {
          token.usdValue = token.balanceFormatted * price;
          // Also try to get symbol from price data
        }
      }
    }
    // Sort and return
    return allTokens.sort((a, b) => {
      if (a.usdValue !== null && b.usdValue !== null) {
        return b.usdValue - a.usdValue;
      }
      if (a.usdValue !== null) return -1;
      if (b.usdValue !== null) return 1;
      return b.balanceFormatted - a.balanceFormatted;
    });
  }

  // Handle EVM addresses - filter out Solana from chains
  const evmChains = chains.filter(c => c !== 'Solana');

  for (const chain of evmChains) {
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

export function isValidSolAddress(address: string): boolean {
  // Solana addresses are base58 encoded, 32-44 characters
  // Excludes 0, O, I, l (not in base58 alphabet)
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

export function isValidAddress(address: string): { valid: boolean; type: 'evm' | 'solana' | null } {
  if (isValidEthAddress(address)) {
    return { valid: true, type: 'evm' };
  }
  if (isValidSolAddress(address)) {
    return { valid: true, type: 'solana' };
  }
  return { valid: false, type: null };
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
): Promise<{ balance: number; balanceRaw: bigint; decimals: number; symbol: string | null; usdValue: number | null } | null> {
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

    // Get price from DeFiLlama
    const priceMap = await fetchTokenPrices([{ chain, tokenAddress }]);
    const priceKey = `${chain}:${tokenAddress.toLowerCase()}`;
    const price = priceMap.get(priceKey);

    return {
      balance,
      balanceRaw: balanceRaw,
      decimals,
      symbol: metadata.symbol,
      usdValue: price ? balance * price : null,
    };
  } catch (err) {
    console.error('Error refreshing token balance:', err);
    return null;
  }
}
