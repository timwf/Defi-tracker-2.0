import type { ScannedToken } from '../types/pool';

// Chain configurations for Alchemy API
const CHAIN_CONFIG: Record<string, { alchemyNetwork: string; nativeSymbol: string; nativeName: string }> = {
  Ethereum: { alchemyNetwork: 'eth-mainnet', nativeSymbol: 'ETH', nativeName: 'Ethereum' },
  Arbitrum: { alchemyNetwork: 'arb-mainnet', nativeSymbol: 'ETH', nativeName: 'Ethereum' },
  Polygon: { alchemyNetwork: 'polygon-mainnet', nativeSymbol: 'MATIC', nativeName: 'Polygon' },
  Optimism: { alchemyNetwork: 'opt-mainnet', nativeSymbol: 'ETH', nativeName: 'Ethereum' },
  Base: { alchemyNetwork: 'base-mainnet', nativeSymbol: 'ETH', nativeName: 'Ethereum' },
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

function formatBalance(balanceRaw: bigint, decimals: number): number {
  if (decimals === 0) return Number(balanceRaw);
  const divisor = BigInt(10 ** decimals);
  const whole = balanceRaw / divisor;
  const remainder = balanceRaw % divisor;
  return Number(whole) + Number(remainder) / Number(divisor);
}

export async function scanWalletTokens(
  walletAddress: string,
  chains: string[],
  onProgress?: (chain: string, status: 'scanning' | 'done' | 'error') => void
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
        allTokens.push({
          chain,
          tokenAddress: '0x0000000000000000000000000000000000000000', // Native token address
          tokenSymbol: config.nativeSymbol,
          tokenName: config.nativeName,
          balanceRaw: nativeBalanceRaw.toString(),
          balanceFormatted: formatBalance(nativeBalanceRaw, 18),
          decimals: 18,
          usdValue: null, // Could fetch from CoinGecko if needed
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
            usdValue: null,
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

  // Sort by balance (estimated value - tokens without USD value go to end)
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
