import type { Pool, CalculatedMetrics } from '../types/pool';

export type MetricType =
  // Pool metrics
  | 'symbol' | 'project' | 'chain' | 'tvl' | 'apy' | 'apyBase' | 'apyReward'
  | 'avg30' | 'avg90' | 'days' | 'volatility' | 'organicPct' | 'tvlChange'
  | 'change1d' | 'change7d' | 'change30d' | 'sigma' | 'prediction' | 'stablecoin'
  // Portfolio metrics
  | 'totalValue' | 'weightedApy' | 'annualEarnings' | 'dailyEarnings'
  | 'amount' | 'allocation'
  // Risk metrics
  | 'stablecoinAllocation' | 'volatileAllocation' | 'organicYield';

interface MetricDefinition {
  title: string;
  brief: string;
  detailed: string;
  interpretation?: (value: any, pool?: Pool, metrics?: CalculatedMetrics) => string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function formatDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export const metricDefinitions: Record<MetricType, MetricDefinition> = {
  // === POOL IDENTIFIERS ===
  symbol: {
    title: 'Pool Symbol',
    brief: 'The token symbol(s) representing this liquidity pool.',
    detailed: 'Pool symbols indicate which tokens are in this liquidity pool. For example, "USDC-ETH" means the pool holds USDC and ETH. Some pools have single tokens (like lending pools), while others have multiple tokens (like AMM pairs).\n\nThe yellow star indicates pools you\'ve marked as held positions.',
  },

  project: {
    title: 'Protocol',
    brief: 'The DeFi protocol that operates this pool.',
    detailed: 'The protocol is the smart contract platform running this pool. Consider protocol risk when investing:\n\n**Lower Risk:** Aave, Compound, Curve, Uniswap - battle-tested with billions in TVL and years of history.\n\n**Medium Risk:** Newer protocols with audits and growing TVL.\n\n**Higher Risk:** Very new protocols, unaudited, or low TVL. Higher potential returns often come with higher protocol risk.',
  },

  chain: {
    title: 'Blockchain',
    brief: 'The blockchain network where this pool operates.',
    detailed: 'Different chains have different characteristics:\n\n**Ethereum:** Highest security and liquidity, but higher gas fees.\n\n**L2s (Arbitrum, Optimism, Base):** Lower fees, good security via Ethereum, but adds bridge risk.\n\n**Alt L1s (Avalanche, BSC, Polygon):** Lower fees, but different security models.\n\nConsider: Do you already have funds on this chain? Bridging adds risk and fees.',
  },

  // === PRIMARY METRICS ===
  tvl: {
    title: 'Total Value Locked (TVL)',
    brief: 'The total USD value of assets deposited in this pool.',
    detailed: 'TVL indicates pool size and liquidity. Higher TVL generally means:\n\n- More stable rates (less sensitive to single deposits/withdrawals)\n- Lower slippage for swaps\n- More "battle-tested" by the market\n\n**Thresholds:**\n- $50M+ = Large, established pool\n- $10-50M = Medium, solid liquidity\n- $1-10M = Smaller, more volatile\n- <$1M = Very small, higher risk',
    interpretation: (value: number) => {
      if (value >= 50_000_000) return `${formatCurrency(value)} is a large, well-established pool with deep liquidity.`;
      if (value >= 10_000_000) return `${formatCurrency(value)} is a medium-sized pool with solid liquidity.`;
      if (value >= 1_000_000) return `${formatCurrency(value)} is a smaller pool - rates may be more volatile.`;
      return `${formatCurrency(value)} is very small - higher risk of rate swings and potential liquidity issues.`;
    },
  },

  apy: {
    title: 'Total APY',
    brief: 'Annual Percentage Yield - your total expected return if rates stay constant.',
    detailed: 'APY = Base APY + Reward APY. This is what you\'d earn over a year if current rates stayed the same.\n\n**Important:** APY is NOT guaranteed. It can change daily based on:\n- Pool utilization\n- Token prices\n- Reward emissions\n- Market conditions\n\nHigh APY often means high risk. Always check what portion is base (sustainable) vs rewards (temporary).',
    interpretation: (value: number) => {
      const daily = value / 365;
      const monthlyOn1k = (1000 * value / 100) / 12;
      return `At ${value.toFixed(2)}% APY, $1,000 would earn ~$${monthlyOn1k.toFixed(2)}/month or ~$${daily.toFixed(3)}% per day (if rates stay constant).`;
    },
  },

  apyBase: {
    title: 'Base APY',
    brief: 'Organic yield from trading fees, interest, or protocol revenue.',
    detailed: 'Base APY is the "real" sustainable yield from:\n\n- **DEXs:** Trading fees from swaps\n- **Lending:** Interest from borrowers\n- **Staking:** Protocol revenue share\n\nThis is the most important number for long-term positions because it\'s not dependent on temporary token incentives. A pool with 5% base APY is often better than 20% that\'s mostly rewards.',
    interpretation: (value: number, pool?: Pool) => {
      if (!pool) return `Base APY is ${value?.toFixed(2) ?? 0}%.`;
      const pct = pool.apy > 0 ? ((value ?? 0) / pool.apy * 100) : 0;
      return `Base APY of ${(value ?? 0).toFixed(2)}% represents ${pct.toFixed(0)}% of total yield - ${pct >= 80 ? 'highly sustainable' : pct >= 50 ? 'moderately sustainable' : 'heavily dependent on rewards'}.`;
    },
  },

  apyReward: {
    title: 'Reward APY',
    brief: 'Additional yield from token incentives (may be temporary).',
    detailed: 'Reward APY comes from token emissions - protocols give away tokens to attract liquidity. This can be very lucrative but comes with risks:\n\n**Risks:**\n- Rewards can end suddenly\n- Reward tokens may drop in price\n- Often attracts mercenary capital\n\n**When rewards are good:**\n- New protocol building TVL\n- Established protocol with sustainable emissions\n- Reward token has utility beyond speculation',
    interpretation: (value: number, pool?: Pool) => {
      if (!pool || !value) return 'No reward APY for this pool.';
      const pct = pool.apy > 0 ? (value / pool.apy * 100) : 0;
      if (pct > 70) return `${value.toFixed(2)}% reward APY (${pct.toFixed(0)}% of total) - this yield is heavily dependent on incentives that may end.`;
      if (pct > 30) return `${value.toFixed(2)}% reward APY (${pct.toFixed(0)}% of total) - moderate incentive dependency.`;
      return `${value.toFixed(2)}% reward APY (${pct.toFixed(0)}% of total) - mostly organic yield with bonus rewards.`;
    },
  },

  // === AVERAGE APY ===
  avg30: {
    title: '30-Day Average APY',
    brief: 'The mean APY over the past 30 days.',
    detailed: 'The 30-day average smooths out daily fluctuations to show recent performance trends.\n\n**How to use:**\n- Current APY > Avg30 with green arrow = APY trending up recently\n- Current APY < Avg30 with red arrow = APY trending down\n\nCompare with 90-day average to see if this is a short-term spike or sustained trend.',
    interpretation: (value: number, pool?: Pool) => {
      if (!pool || value === null) return 'No 30-day average available.';
      const diff = pool.apy - value;
      const pctDiff = value > 0 ? (diff / value * 100) : 0;
      if (pctDiff > 20) return `Current APY is ${pctDiff.toFixed(0)}% above the 30-day average - recent improvement.`;
      if (pctDiff < -20) return `Current APY is ${Math.abs(pctDiff).toFixed(0)}% below the 30-day average - recent decline.`;
      return `Current APY is within ${Math.abs(pctDiff).toFixed(0)}% of the 30-day average - relatively stable.`;
    },
  },

  avg90: {
    title: '90-Day Average Base APY',
    brief: 'The mean base APY over the past 90 days (requires historical data fetch).',
    detailed: 'The 90-day average of BASE APY (not total) gives the best picture of sustainable yield. This filters out:\n\n- Short-term rate spikes\n- Temporary reward programs\n- Market noise\n\n**Interpretation:**\n- Current Base > Avg90 (green arrow) = Pool performing above historical average\n- Current Base < Avg90 (red arrow) = Pool underperforming its history',
    interpretation: (value: number, pool?: Pool) => {
      if (!pool || value === undefined) return 'Fetch historical data to see 90-day average.';
      const base = pool.apyBase ?? 0;
      const diff = base - value;
      const pctDiff = value > 0 ? (diff / value * 100) : 0;
      if (pctDiff > 15) return `Current base APY is ${pctDiff.toFixed(0)}% above 90-day average - outperforming.`;
      if (pctDiff < -15) return `Current base APY is ${Math.abs(pctDiff).toFixed(0)}% below 90-day average - underperforming.`;
      return `Current base APY is close to 90-day average - consistent performance.`;
    },
  },

  // === HISTORICAL METRICS ===
  days: {
    title: 'Days of Data',
    brief: 'How many days of historical data DefiLlama has for this pool.',
    detailed: 'More data means more reliable historical analysis. Pools need time to prove themselves.\n\n**Thresholds:**\n- 365+ days = Established, reliable historical metrics\n- 90-365 days = Maturing pool, good data available\n- 30-90 days = Newer pool, limited analysis\n- <30 days = Very new, approach with caution',
    interpretation: (value: number) => {
      if (value == null) return 'No data age available - historical data may not be loaded yet.';
      const launchDate = formatDate(value);
      if (value >= 365) return `${value} days of data (since ~${launchDate}) - well-established pool with reliable metrics.`;
      if (value >= 90) return `${value} days of data (since ~${launchDate}) - good amount of history to analyze.`;
      if (value >= 30) return `${value} days of data (since ~${launchDate}) - relatively new, limited historical analysis.`;
      return `Only ${value} days of data (since ~${launchDate}) - very new pool, be cautious.`;
    },
  },

  volatility: {
    title: 'APY Volatility',
    brief: 'Standard deviation of base APY over 90 days - how much rates swing.',
    detailed: 'Volatility measures how unpredictable the APY is. High volatility means the yield you see today might be very different next week.\n\n**Thresholds:**\n- <1.5 = Stable, predictable yields (green)\n- 1.5-3 = Moderate swings, expect some variation (yellow)\n- >3 = Highly volatile, rates can change dramatically (red)\n\nLow volatility is especially important for stablecoin strategies.',
    interpretation: (value: number) => {
      if (value == null) return 'No volatility data available - historical data may not be loaded yet.';
      if (value < 1.5) return `Volatility of ${value.toFixed(2)} is low - this pool has very stable, predictable yields.`;
      if (value < 3) return `Volatility of ${value.toFixed(2)} is moderate - expect some rate fluctuations but generally stable.`;
      return `Volatility of ${value.toFixed(2)} is high - APY can swing significantly, not ideal for stable income strategies.`;
    },
  },

  organicPct: {
    title: 'Organic Yield %',
    brief: 'What percentage of yield comes from base APY vs temporary rewards.',
    detailed: 'Organic % = (Base APY / Total APY) x 100\n\nThis is crucial for sustainability:\n\n**Thresholds:**\n- 95%+ (green) = Almost all yield is sustainable\n- 80-95% (yellow) = Mostly organic with some incentives\n- 50-80% (orange) = Significant reward dependency\n- <50% (red) = Mostly temporary incentives\n\nHigh organic % means yield will likely persist even if rewards end.',
    interpretation: (value: number) => {
      if (value == null) return 'No organic yield data available - historical data may not be loaded yet.';
      const rewardPct = 100 - value;
      if (value >= 95) return `${value}% organic - virtually all yield is sustainable protocol revenue.`;
      if (value >= 80) return `${value}% organic - solid base yield with ${rewardPct}% from incentives.`;
      if (value >= 50) return `${value}% organic - significant dependence on incentives (${rewardPct}% from rewards).`;
      return `Only ${value}% organic - ${rewardPct}% of yield comes from temporary incentives that may end.`;
    },
  },

  tvlChange: {
    title: '30-Day TVL Change',
    brief: 'How much the pool\'s TVL has changed in the last 30 days.',
    detailed: 'TVL change indicates capital flow:\n\n**Growing TVL (green):**\n- Market confidence in the pool\n- Attractive yields drawing capital\n- Protocol is healthy\n\n**Declining TVL (red):**\n- Investors leaving (why?)\n- Possibly lower yields elsewhere\n- Could signal problems\n\n**Thresholds:**\n- >-10% = Stable or growing (green)\n- -10% to -25% = Declining (yellow)\n- <-25% = Significant outflows (red)',
    interpretation: (value: number) => {
      if (value == null) return 'No TVL change data available - historical data may not be loaded yet.';
      if (value > 10) return `TVL up ${value.toFixed(0)}% in 30 days - strong capital inflows, growing confidence.`;
      if (value > -10) return `TVL change of ${value >= 0 ? '+' : ''}${value.toFixed(0)}% - relatively stable capital.`;
      if (value > -25) return `TVL down ${Math.abs(value).toFixed(0)}% in 30 days - moderate outflows, investigate why.`;
      return `TVL down ${Math.abs(value).toFixed(0)}% in 30 days - significant capital exodus, approach with caution.`;
    },
  },

  // === CHANGE METRICS ===
  change1d: {
    title: '1-Day APY Change',
    brief: 'How much the APY changed in the last 24 hours.',
    detailed: 'Daily changes show short-term momentum but can be noisy. Large daily swings may indicate:\n\n- High utilization changes (lending)\n- Large deposits/withdrawals\n- Token price movements (for rewards)\n\nDon\'t overreact to single-day changes - look at 7D and 30D for trends.',
    interpretation: (value: number) => {
      if (!value) return 'No change data available.';
      if (Math.abs(value) < 5) return `${value >= 0 ? '+' : ''}${value.toFixed(1)}% - minimal daily movement.`;
      if (value > 0) return `+${value.toFixed(1)}% in 24h - short-term uptick (could be noise).`;
      return `${value.toFixed(1)}% in 24h - short-term decline (check if part of longer trend).`;
    },
  },

  change7d: {
    title: '7-Day APY Change',
    brief: 'How much the APY changed over the last week.',
    detailed: '7-day change is more meaningful than daily - it smooths out day-to-day noise.\n\n**Look for:**\n- Sustained green = genuine improvement trend\n- Sustained red = declining yields\n- Large swings = volatile pool\n\nCombine with 30D change to understand if this is a new trend or continuation.',
    interpretation: (value: number) => {
      if (!value) return 'No change data available.';
      if (Math.abs(value) < 10) return `${value >= 0 ? '+' : ''}${value.toFixed(1)}% over 7 days - relatively stable.`;
      if (value > 0) return `+${value.toFixed(1)}% over 7 days - positive short-term trend.`;
      return `${value.toFixed(1)}% over 7 days - declining trend, monitor closely.`;
    },
  },

  change30d: {
    title: '30-Day APY Change',
    brief: 'How much the APY changed over the last month.',
    detailed: '30-day change shows medium-term momentum and filters out most noise.\n\n**Interpretation:**\n- Large positive = Pool heating up (but is it sustainable?)\n- Large negative = Cooling off (others may be leaving)\n- Small changes = Stable, predictable pool',
    interpretation: (value: number) => {
      if (!value) return 'No 30-day change data available.';
      if (Math.abs(value) < 15) return `${value >= 0 ? '+' : ''}${value.toFixed(1)}% over 30 days - stable monthly performance.`;
      if (value > 0) return `+${value.toFixed(1)}% over 30 days - significant improvement this month.`;
      return `${value.toFixed(1)}% over 30 days - notable decline this month.`;
    },
  },

  sigma: {
    title: 'Sigma (DefiLlama Volatility)',
    brief: 'DefiLlama\'s calculated standard deviation of APY.',
    detailed: 'Similar to our Volatility metric but calculated by DefiLlama. Lower is better for stable yields.\n\n**Thresholds:**\n- <1.5 (green) = Stable, predictable\n- 1.5-3 (yellow) = Moderate variability\n- >3 (red) = Highly volatile',
    interpretation: (value: number) => {
      if (value < 1.5) return `Sigma of ${value.toFixed(2)} indicates stable, predictable yields.`;
      if (value < 3) return `Sigma of ${value.toFixed(2)} shows moderate APY variability.`;
      return `Sigma of ${value.toFixed(2)} indicates high volatility - yields swing significantly.`;
    },
  },

  prediction: {
    title: 'ML Prediction',
    brief: 'DefiLlama\'s machine learning prediction for APY direction.',
    detailed: 'DefiLlama uses ML to predict if APY will go up, down, or stay stable. Shows predicted class and confidence %.\n\n**Caveats:**\n- ML predictions are not guarantees\n- Confidence % indicates model certainty\n- Use as one input among many, not as sole decision factor\n- Past patterns don\'t guarantee future results',
  },

  stablecoin: {
    title: 'Stablecoin Pool',
    brief: 'Whether this pool contains stablecoins (USDC, USDT, DAI, etc.).',
    detailed: 'Stablecoin pools have different characteristics:\n\n**Pros:**\n- Lower impermanent loss risk\n- More predictable value\n- Good for yield farming without price exposure\n\n**Cons:**\n- Generally lower yields than volatile pairs\n- Still have smart contract and stablecoin risks\n\nIdeal for conservative strategies or stable income needs.',
  },

  // === PORTFOLIO METRICS ===
  totalValue: {
    title: 'Total Portfolio Value',
    brief: 'The sum of all your position amounts in USD.',
    detailed: 'This is the total value you\'ve recorded across all your DeFi positions.\n\n**Note:** This is based on the amounts you entered, not live on-chain data. Make sure to update your position amounts if the underlying value has changed significantly.',
  },

  weightedApy: {
    title: 'Weighted APY',
    brief: 'Your portfolio\'s average APY, weighted by position size.',
    detailed: 'This calculates your expected overall yield by weighting each position\'s APY by its share of your portfolio.\n\n**Formula:**\nWeighted APY = Σ(Position APY × Position Value) / Total Portfolio Value\n\nLarger positions have more impact on this number than smaller ones.',
    interpretation: (value: number) => {
      const monthlyOn10k = (10000 * value / 100) / 12;
      return `At ${value.toFixed(2)}% weighted APY, a $10,000 portfolio would earn ~$${monthlyOn10k.toFixed(0)}/month.`;
    },
  },

  annualEarnings: {
    title: 'Projected Annual Earnings',
    brief: 'Estimated yearly earnings based on current APYs.',
    detailed: 'This projects your total earnings over a year if all current APYs remain constant.\n\n**Important:** This is a projection, not a guarantee. APYs change constantly, so actual earnings will differ. Use this for planning, not precise forecasting.',
    interpretation: (value: number) => {
      return `Projected ${formatCurrency(value)}/year (${formatCurrency(value/12)}/month) if current rates hold.`;
    },
  },

  dailyEarnings: {
    title: 'Projected Daily Earnings',
    brief: 'Estimated daily earnings based on current APYs.',
    detailed: 'Your projected daily yield across all positions. This compounds over time if you reinvest.\n\n**Note:** Daily values fluctuate more than annual projections. This is a rough guide, not exact income.',
    interpretation: (value: number) => {
      return `~${formatCurrency(value)}/day, or ~${formatCurrency(value * 7)}/week at current rates.`;
    },
  },

  amount: {
    title: 'Position Amount',
    brief: 'The USD value you have in this position.',
    detailed: 'This is the amount you\'ve recorded for this position. Remember to update it if:\n\n- You add or remove funds\n- The underlying token prices change significantly\n- You harvest and compound rewards\n\nAccurate amounts ensure accurate portfolio projections.',
  },

  allocation: {
    title: 'Position Allocation',
    brief: 'What percentage of your portfolio is in this position.',
    detailed: 'Shows how concentrated your portfolio is in each position.\n\n**Diversification guidelines:**\n- >50% in one position = Very concentrated risk\n- 20-50% = Significant exposure\n- 10-20% = Moderate allocation\n- <10% = Well diversified\n\nConsider your risk tolerance when allocating.',
    interpretation: (value: number) => {
      if (value > 50) return `${value.toFixed(1)}% allocation - very concentrated, consider diversifying.`;
      if (value > 25) return `${value.toFixed(1)}% allocation - significant exposure to this position.`;
      return `${value.toFixed(1)}% allocation - reasonable diversification.`;
    },
  },

  // === RISK METRICS ===
  stablecoinAllocation: {
    title: 'Stablecoin Allocation',
    brief: 'What percentage of your portfolio is in stablecoin pools.',
    detailed: 'Stablecoin positions have lower volatility but typically lower yields.\n\n**Allocation guidance:**\n- Higher % = More stable, lower risk, lower return\n- Lower % = More volatile exposure, higher risk/return\n\nBalance based on your risk tolerance and market outlook.',
    interpretation: (value: number) => {
      if (value > 80) return `${value.toFixed(0)}% in stablecoins - very conservative, low volatility exposure.`;
      if (value > 50) return `${value.toFixed(0)}% in stablecoins - balanced approach leaning conservative.`;
      if (value > 20) return `${value.toFixed(0)}% in stablecoins - moderate stable allocation.`;
      return `${value.toFixed(0)}% in stablecoins - mostly exposed to volatile assets.`;
    },
  },

  volatileAllocation: {
    title: 'Volatile Asset Allocation',
    brief: 'What percentage of your portfolio is in non-stablecoin pools.',
    detailed: 'Volatile positions can have higher yields but come with price exposure.\n\n**Risks:**\n- Impermanent loss on LP positions\n- Token price declines\n- Higher emotional stress during drawdowns\n\n**Benefits:**\n- Potential for higher yields\n- Upside if tokens appreciate',
    interpretation: (value: number) => {
      if (value > 80) return `${value.toFixed(0)}% in volatile assets - high exposure to price movements.`;
      if (value > 50) return `${value.toFixed(0)}% in volatile assets - significant price exposure.`;
      return `${value.toFixed(0)}% in volatile assets - limited price exposure.`;
    },
  },

  organicYield: {
    title: 'Portfolio Organic Yield',
    brief: 'How much of your portfolio\'s yield comes from base APY vs rewards.',
    detailed: 'This measures sustainability across your entire portfolio.\n\n**Higher organic % means:**\n- More sustainable income\n- Less dependency on incentives\n- Better for long-term holding\n\n**Lower organic % means:**\n- More yield from temporary rewards\n- May need to rotate when incentives end\n- Higher maintenance required',
    interpretation: (value: number) => {
      if (value > 80) return `${value.toFixed(0)}% organic - your portfolio yield is highly sustainable.`;
      if (value > 50) return `${value.toFixed(0)}% organic - decent sustainability with some incentive dependency.`;
      return `${value.toFixed(0)}% organic - significant portion of yield from temporary incentives.`;
    },
  },
};

export function getMetricInfo(
  metric: MetricType,
  value?: any,
  pool?: Pool,
  metrics?: CalculatedMetrics
): { title: string; brief: string; detailed: string; interpretation?: string } {
  const def = metricDefinitions[metric];
  if (!def) {
    return {
      title: metric,
      brief: 'No information available for this metric.',
      detailed: '',
    };
  }

  return {
    title: def.title,
    brief: def.brief,
    detailed: def.detailed,
    interpretation: def.interpretation?.(value, pool, metrics),
  };
}
