import type { Pool, CalculatedMetrics, Filters, HeldPosition } from '../types/pool';
import { getPoolMetrics, getCachedData } from './historicalData';

// Analysis types for AI export
export type AnalysisType =
  | 'find-opportunities'
  | 'review-portfolio'
  | 'top-10-pools'
  | 'verify-high-apy'
  | 'custom';

export interface AnalysisOption {
  id: AnalysisType;
  label: string;
  description: string;
  prompt: string;
}

const HELD_POSITION_INSTRUCTIONS = `
IMPORTANT - IDENTIFYING HELD POSITIONS:
- My current portfolio positions are marked with "isHeldPosition": true in each pool object
- The "heldPositions" array at the top level contains details of my positions (poolId, amountUsd, entryDate, notes)
- ONLY pools with "isHeldPosition": true are positions I currently hold
- Do NOT guess or assume positions - check the actual isHeldPosition field for each pool`;

export const ANALYSIS_OPTIONS: AnalysisOption[] = [
  {
    id: 'find-opportunities',
    label: 'Find Opportunities',
    description: 'Discover the best new pools to invest in',
    prompt: `Analyze this DeFi pool data to find the best investment opportunities for me.
${HELD_POSITION_INSTRUCTIONS}

Prioritize pools that have:
- High organic yield (base APY vs reward APY ratio)
- Low volatility over the past 90 days
- Growing or stable TVL (not declining)
- Sustainable yield (current APY close to 90-day average)

Flag any pools that look attractive on the surface but have warning signs (high reward dependency, declining TVL, extreme volatility).

For your top recommendations, research each protocol via web search to verify:
- Protocol reputation and audit history
- Recent news or security incidents
- Team background and track record
- Token emission schedules that might affect rewards

If any pool is missing historical data, search for recent information about that protocol's yield sustainability.

Recommend your top 5 opportunities with full reasoning, including both data analysis and research findings.`
  },
  {
    id: 'review-portfolio',
    label: 'Review Portfolio',
    description: 'Assess current positions and find better alternatives',
    prompt: `Review my current DeFi portfolio positions.
${HELD_POSITION_INSTRUCTIONS}

For each held position (isHeldPosition: true), assess:
- Is the current APY above or below the 90-day average?
- Is TVL growing, stable, or declining?
- What percentage of yield is organic vs incentive-based?
- Are there any red flags (high volatility, low organic %, TVL drops)?

Then compare my held positions against the other pools in this export (isHeldPosition: false). Are there better alternatives I should consider swapping into? Highlight any pools that significantly outperform my current positions on a risk-adjusted basis.

For any position showing warning signs or missing historical data, perform web searches to find:
- Recent protocol news or announcements
- Any security incidents or exploits
- Changes to tokenomics or reward programs
- Community sentiment on Twitter/Discord

Provide an overall portfolio health score and specific recommendations for each held position, backed by both data and research.`
  },
  {
    id: 'top-10-pools',
    label: 'Top 10 Pools',
    description: 'Rank pools by risk-adjusted yield',
    prompt: `Rank the top 10 pools in this data based on risk-adjusted yield.
${HELD_POSITION_INSTRUCTIONS}

For each pool, analyze:
- Current APY vs 90-day average (is it running hot or cold?)
- Yield sustainability (organic % and volatility)
- TVL trend (growing/stable/declining)
- Risk factors (IL risk, exposure type, chain risk)
- Whether I already hold this position (isHeldPosition field)

For each pool in your top 10, perform web searches to verify:
- Protocol security (audits, past incidents)
- Team reputation and longevity
- Sustainability of reward emissions
- Any recent news that might affect the pool

If historical data is missing for any pool, search for yield history and community feedback.

Present as a ranked list with full analysis for each, combining on-chain data with research findings. Note any trade-offs (e.g., "higher yield but more volatile" or "lower yield but very stable"). Indicate which pools I already hold.`
  },
  {
    id: 'verify-high-apy',
    label: 'Verify High APY',
    description: 'Investigate if high yields are sustainable',
    prompt: `Investigate the highest APY pools in this data for sustainability and red flags.
${HELD_POSITION_INSTRUCTIONS}

For each high-APY pool, determine:
- Is the APY mostly organic (base) or incentive-based (rewards)?
- How does current APY compare to the 90-day average?
- Is the APY volatile or consistent?
- Is TVL growing (confidence) or declining (people leaving)?
- What's the IL risk and exposure type?
- Whether I currently hold this position (check isHeldPosition field)

For EVERY high-APY pool, you MUST perform web searches to investigate:
- Where is the yield coming from? (trading fees, lending interest, token emissions, ponzinomics?)
- Protocol audit status and security history
- Token emission schedule - are rewards about to dry up?
- Recent news, Twitter sentiment, governance proposals
- Any red flags from the community (rug pull concerns, team issues, etc.)

Classify each as: "Sustainable", "Risky but potentially worth it", or "Avoid - likely unsustainable"

Be skeptical. If you can't verify the source of high yields through research, flag it as suspicious. Flag any of my held positions that fall into concerning categories.`
  },
  {
    id: 'custom',
    label: 'Custom Analysis',
    description: 'Write your own prompt',
    prompt: ''
  }
];

export interface ExportedPool {
  // Basic info
  poolId: string;
  symbol: string;
  project: string;
  chain: string;

  // Current metrics from API
  tvlUsd: number;
  apy: number;
  apyBase: number | null;
  apyReward: number | null;
  stablecoin: boolean;

  // API-provided changes
  apyPct1D: number | null;
  apyPct7D: number | null;
  apyPct30D: number | null;

  // API-provided analysis
  sigma: number;
  mu: number;
  outlier: boolean;
  ilRisk: string;
  exposure: string;
  predictions: {
    predictedClass: string;
    predictedProbability: number;
    binnedConfidence: number;
  } | null;

  // Volume data
  volumeUsd1d: number | null;
  volumeUsd7d: number | null;

  // Other API fields
  apyMean30d: number | null;
  apyBase7d: number | null;
  il7d: number | null;
  count: number;
  rewardTokens: string[] | null;
  underlyingTokens: string[] | null;
  poolMeta: string | null;

  // Calculated historical metrics (if available)
  historical: {
    hasData: boolean;
    base90: number | null;
    volatility: number | null;
    organicPct: number | null;
    tvlChange30d: number | null;
    dataPoints: number | null;
    oldestDate: string | null;
    trend: 'up' | 'down' | 'stable' | null;
  };

  // User's position status
  isHeldPosition: boolean;

  // DefiLlama link
  defiLlamaUrl: string;
}

export interface ExportData {
  analysisPrompt: string;
  exportedAt: string;
  poolCount: number;
  heldPositionCount: number;
  filters: Filters;
  heldPositions: HeldPosition[];
  pools: ExportedPool[];
}

function getTrend(currentApyBase: number | null, base90: number | null): 'up' | 'down' | 'stable' | null {
  if (currentApyBase === null || base90 === null) return null;
  const diff = currentApyBase - base90;
  if (Math.abs(diff) < 0.1) return 'stable';
  return diff > 0 ? 'up' : 'down';
}

export function exportPoolsForAI(
  pools: Pool[],
  filters: Filters,
  heldPositions: HeldPosition[],
  analysisPrompt: string
): ExportData {
  const heldPoolIds = heldPositions.map(p => p.poolId);

  const exportedPools: ExportedPool[] = pools.map((pool) => {
    const metrics: CalculatedMetrics | null = getPoolMetrics(pool.pool);
    const hasHistoricalData = getCachedData(pool.pool) !== null;

    return {
      // Basic info
      poolId: pool.pool,
      symbol: pool.symbol,
      project: pool.project,
      chain: pool.chain,

      // Current metrics from API
      tvlUsd: pool.tvlUsd,
      apy: pool.apy,
      apyBase: pool.apyBase,
      apyReward: pool.apyReward,
      stablecoin: pool.stablecoin,

      // API-provided changes
      apyPct1D: pool.apyPct1D,
      apyPct7D: pool.apyPct7D,
      apyPct30D: pool.apyPct30D,

      // API-provided analysis
      sigma: pool.sigma,
      mu: pool.mu,
      outlier: pool.outlier,
      ilRisk: pool.ilRisk,
      exposure: pool.exposure,
      predictions: pool.predictions,

      // Volume data
      volumeUsd1d: pool.volumeUsd1d,
      volumeUsd7d: pool.volumeUsd7d,

      // Other API fields
      apyMean30d: pool.apyMean30d,
      apyBase7d: pool.apyBase7d,
      il7d: pool.il7d,
      count: pool.count,
      rewardTokens: pool.rewardTokens,
      underlyingTokens: pool.underlyingTokens,
      poolMeta: pool.poolMeta,

      // Calculated historical metrics
      historical: {
        hasData: hasHistoricalData,
        base90: metrics?.base90 ?? null,
        volatility: metrics?.volatility ?? null,
        organicPct: metrics?.organicPct ?? null,
        tvlChange30d: metrics?.tvlChange30d ?? null,
        dataPoints: metrics?.dataPoints ?? null,
        oldestDate: metrics?.oldestDate ?? null,
        trend: getTrend(pool.apyBase, metrics?.base90 ?? null),
      },

      // User's position status
      isHeldPosition: heldPoolIds.includes(pool.pool),

      // DefiLlama link
      defiLlamaUrl: `https://defillama.com/yields/pool/${pool.pool}`,
    };
  });

  return {
    analysisPrompt,
    exportedAt: new Date().toISOString(),
    poolCount: exportedPools.length,
    heldPositionCount: heldPositions.length,
    filters,
    heldPositions,
    pools: exportedPools,
  };
}

export function downloadExport(data: ExportData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `defi-pools-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyExportToClipboard(data: ExportData): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  return navigator.clipboard.writeText(json);
}
