# DeFi Yield Tracker - Data Sources & Export Format

**Version:** 1.0  
**Created:** December 13, 2025  
**Purpose:** Explain where data comes from and what the AI export contains

---

## Data Flow Overview

```
External APIs â†’ Yield Tracker â†’ Your Portfolio â†’ AI Export â†’ Claude Analysis
     â†“              â†“              â†“              â†“              â†“
DefiLlama      Processing     Live Positions   Structured     Insights
Alchemy        Caching        + Metadata       JSON           + Decisions
CoinGecko      Calculations   + Analytics      + Prompt
```

---

## Data Sources

### 1. DefiLlama API

**What it provides:**
- Pool data: APY, TVL, protocol name, chain, token symbols
- Historical data: 90 days of APY/TVL snapshots
- Token prices: USD values for yield calculations

**Update frequency:**
- Current pool data: ~5 minutes (DefiLlama's refresh)
- Historical data: Daily snapshots (stored by DefiLlama)
- Prices: Real-time on request

**Example pool data:**
```json
{
  "pool": "43a38685-aa22-4d99-9c2f-bd34a980de01",
  "symbol": "SUSDAI",
  "project": "pendle",
  "chain": "Arbitrum",
  "apy": 15.0,
  "apyBase": 10.58,
  "apyReward": 4.42,
  "tvlUsd": 86390000,
  "predictions": {
    "predictedClass": "Stable",
    "binnedConfidence": 3
  }
}
```

**What the tracker calculates from this:**
- Avg30 APY: Mean of last 30 days of `apy` values
- Avg90 APY: Mean of last 90 days of `apy` values
- Volatility (Ïƒ): Standard deviation of `apy` values
- Organic %: `apyBase / apy * 100`
- TVL 30d change: `(currentTVL - tvl30daysAgo) / tvl30daysAgo * 100`

**Caching strategy:**
- Historical data cached 24 hours in localStorage
- Reduces API calls (DefiLlama has no rate limit but courtesy caching)
- Auto-prunes entries older than 7 days

### 2. Alchemy API

**What it provides:**
- Token balances for a given wallet address
- Token metadata (name, symbol, decimals)
- Works across Ethereum, Arbitrum, Polygon, Optimism, Base

**When it's called:**
- Only when you click "Import from Wallet"
- Scans selected chains for ERC-20 tokens
- One-time fetch per scan (not continuous polling)

**Example response:**
```json
{
  "address": "0x661cac5d1685ea8a4d33f2dfcf112cb7d541a27f",
  "tokenBalances": [
    {
      "contractAddress": "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
      "tokenBalance": "1338000000000000000",
      "metadata": {
        "name": "Wrapped liquid staked Ether 2.0",
        "symbol": "wstETH",
        "decimals": 18
      }
    }
  ]
}
```

**What the tracker does:**
1. Fetches balances for selected chains
2. Converts token amounts (uses decimals)
3. Attempts auto-match to DefiLlama pools (by symbol + chain)
4. Falls back to "unmapped" if no match found
5. You manually link unmapped tokens to correct pools

**Price fetching:**
- Uses DefiLlama prices API: `/prices/current/{chain}:{tokenAddress}`
- Calculates USD value: `balance * price`

### 3. CoinGecko API

**What it provides:**
- Current prices for crypto assets
- 24h and 7d price changes
- Market cap and rank

**When it's called:**
- Every 30 seconds for price watchlist
- Only for coins you've added to watchlist (default: ETH, BTC, SOL)

**Rate limits:**
- Free tier: 10-50 calls/minute
- Watchlist auto-refresh: 2 calls/minute (well within limits)

**Example response:**
```json
{
  "ethereum": {
    "usd": 3099,
    "usd_24h_change": -4.48,
    "usd_7d_change": 1.98,
    "usd_market_cap": 372000000000
  }
}
```

### 4. User Input (Manual Positions)

**What you provide:**
- Amount invested
- Entry date
- Entry APY (optional override for fixed-rate products)
- Notes (optional)

**How it's stored:**
- Cloud: Supabase PostgreSQL (if logged in)
- Local: Browser localStorage (if not logged in)

**Live value calculation:**
- If linked to DefiLlama pool: Uses current pool data + your amount
- If wallet-imported: Uses scanned balance + live price
- If manual: You update value yourself (or re-scan wallet)

---

## Portfolio Export Format

### Standard Export Structure

When you click "Export for AI", you get a JSON object with this structure:

```json
{
  "exportType": "portfolio",
  "timestamp": "2025-12-13T10:30:00Z",
  "portfolio": {
    "summary": {
      "totalValue": 16543.21,
      "weightedAPY": 6.13,
      "projectedEarnings": {
        "annual": 1014.00,
        "monthly": 84.53,
        "daily": 2.78
      }
    },
    "positions": [
      {
        "pool_id": "43a38685-aa22-4d99-9c2f-bd34a980de01",
        "symbol": "SUSDAI",
        "protocol": "pendle",
        "chain": "Arbitrum",
        "amount": 2052.33,
        "value": 2057.00,
        "apy": 15.00,
        "fixedAPY": true,
        "entryDate": "2025-12-11",
        "entryAPY": 14.94,
        "notes": "PT token maturing Feb 19, 2026",
        "projectedEarnings": {
          "annual": 308.55,
          "monthly": 25.71,
          "daily": 0.85
        },
        "percentOfPortfolio": 12.4,
        "historicalData": {
          "avg30": 13.2,
          "avg90": 13.1,
          "volatility": 0.22,
          "organicPercent": 92,
          "tvl30dChange": 21577
        }
      }
      // ... more positions
    ],
    "allocations": {
      "byPool": [
        {"symbol": "SUSDAI", "value": 2057, "percent": 12.4},
        {"symbol": "GTUSDCP", "value": 1902, "percent": 11.5}
        // ... etc
      ],
      "byChain": [
        {"chain": "Ethereum", "value": 10095, "percent": 61.0},
        {"chain": "Base", "value": 3806, "percent": 23.0},
        {"chain": "Arbitrum", "value": 2652, "percent": 16.0}
      ],
      "byAssetType": [
        {"type": "Stablecoins", "value": 11486, "percent": 69.4},
        {"type": "Growth (wstETH)", "value": 5056, "percent": 30.6}
      ]
    },
    "riskMetrics": {
      "largestPosition": {
        "symbol": "SUSDAI",
        "percent": 17.9,
        "limit": 25.0,
        "status": "OK"
      },
      "protocolCount": 7,
      "chainDiversification": {
        "ethereum": 61.0,
        "base": 23.0,
        "arbitrum": 16.0
      }
    }
  },
  "aiPrompt": "Review this DeFi portfolio and provide: 1) Health assessment..."
}
```

### AI-Optimized Prompts

When you select an analysis type, the export includes a pre-built prompt:

**"Find Opportunities":**
```json
{
  "aiPrompt": "Based on this portfolio ($16,543 total, 6.13% weighted APY), analyze available pools and suggest 2-3 additions that would: 1) Improve blended APY, 2) Maintain risk profile, 3) Add protocol/chain diversification. Current positions: SUSDAI (17.9%), GTUSDCP (16.6%), STEAKUSDC (16.5%)..."
}
```

**"Review Portfolio":**
```json
{
  "aiPrompt": "Conduct a health check on this DeFi portfolio: 1) Allocation analysis (target 70/30 stables/growth), 2) Concentration risk (max 25% per protocol), 3) APY performance vs targets (6-8%), 4) Diversification assessment, 5) Rebalancing recommendations..."
}
```

**"Top 10 Pools":**
```json
{
  "aiPrompt": "From these filtered pools, identify the top 10 opportunities considering: 1) Risk-adjusted yield (organic %, volatility, TVL trends), 2) Protocol maturity, 3) Mechanism diversification, 4) Current vs historical APY (spot underpriced yields). Exclude protocols I already hold..."
}
```

**"Verify High APY":**
```json
{
  "aiPrompt": "These pools claim >10% APY. For each, verify sustainability by analyzing: 1) Organic % (>90% = sustainable), 2) Volatility (Ïƒ <3.0 = stable), 3) TVL trend (growing/stable = healthy), 4) Current vs Avg90 (spike = temporary), 5) Protocol history and mechanism..."
}
```

### Custom Prompts

You can write your own:
```
"Compare my Morpho positions (GTUSDCP vs STEAKUSDC). Should I consolidate into one curator or keep both for diversification?"
```

The export includes full portfolio data + your custom question.

---

## Data Accuracy & Verification

### DefiLlama Reliability

**Generally accurate:**
- APY: Pulls from protocol contracts (e.g., Aave's utilization-based rate)
- TVL: Sums on-chain balances
- Prices: Aggregated from multiple DEXes

**Known discrepancies:**
- Temporary spikes (liquidity events, flash loans)
- Protocol interface may show different number (timing lag)
- Incentive programs sometimes miscalculated

**Mitigation:**
- Cross-check critical decisions with protocol dashboards
- Use 90-day averages (smooths out anomalies)
- Verify large positions on-chain (Etherscan, Arbiscan)

### Wallet Scanning Accuracy

**High accuracy for:**
- Standard ERC-20 tokens (USDC, wstETH, etc.)
- Major protocols (Aave, Morpho, Pendle)
- Well-documented token contracts

**Potential issues:**
- Exotic LP tokens (may not auto-match to pools)
- Rebasing tokens (balances change automatically)
- Vault tokens (shows vault token, not underlying)

**Example:** 
- Your Morpho positions show as "gtUSDCp" and "steakUSDC" (vault tokens)
- These correctly map to Gauntlet/Steakhouse vaults
- The underlying USDC isn't shown separately (it's wrapped in the vault)

### Price Data Lag

**CoinGecko:** 1-2 minute lag behind exchanges  
**DefiLlama:** Real-time for most assets  
**Alchemy:** Balances are instant, prices from DefiLlama

**Impact:** Portfolio value may differ by 0.1-0.5% from exact on-chain calculation

**Acceptable for:** Strategic decisions, weekly monitoring  
**Not suitable for:** Day trading, liquidation monitoring

---

## Export Use Cases

### Daily Check-In

**Export:** Portfolio summary  
**Prompt:** "What changed today?"

**Claude receives:**
- Total value (compare vs yesterday's mental note)
- Weighted APY (major shifts?)
- Alerts (any red flags?)

**Response time:** <30 seconds

**Example output:**
```
Portfolio value: $16,543 (+$127 from yesterday, +0.8%)
Weighted APY: 6.13% (unchanged)
No alerts triggered
Key changes:
- PT-sUSDai gained $4 (maturity approaching)
- wstETH up $123 (ETH price +4.1%)
```

### Weekly Deposit Planning

**Export:** Portfolio + top 10 filtered pools  
**Prompt:** "I have Â£1,500 to deploy. Where should it go?"

**Claude receives:**
- Current positions + allocation %
- Filtered pools (your saved view)
- Target allocation (70/30)

**Response time:** 1-2 minutes

**Example output:**
```
Current allocation: 69.4/30.6 (stables/growth) - on target

Recommendations for Â£1,500 deployment:
1. Â£750 to Euler V2 USDC (grow from 5.2% to 10% of stables)
2. Â£450 to wstETH (maintain 30% growth allocation)
3. Â£300 to SGHO (diversify Aave exposure beyond Spark fork)

Rationale: Euler V2 is underweight vs target. wstETH maintains ratio. SGHO adds yield to existing Aave position.
```

### Monthly Review

**Export:** Full portfolio with historical data  
**Prompt:** "Review Portfolio"

**Claude receives:**
- All positions with entry dates and APYs
- Historical performance
- Risk metrics

**Response time:** 2-3 minutes

**Example output:**
```
Portfolio Health: âœ… Strong

Allocation: 69.4/30.6 (target 70/30) - on target
Concentration: Largest position 17.9% (limit 25%) - compliant
APY: 6.13% blended (target 6-8%) - in range
Protocol count: 7 (target 4-6) - slightly high

Performance vs Entry:
- PT-sUSDai: 15.0% current vs 14.94% entry (+0.06%) âœ…
- GTUSDCP: 5.61% current vs 5.80% entry (-0.19%) âš ï¸
- wstETH: 2.53% current vs 2.60% entry (-0.07%) âœ…

Recommendations:
1. Consider consolidating Morpho vaults (2 positions, same mechanism)
2. GTUSDCP APY compression expected (market-wide trend)
3. No rebalancing needed - allocations within tolerance
```

---

## Privacy Considerations

### What Leaves Your Browser

**To DefiLlama:**
- Pool IDs (public data)
- No wallet addresses
- No position amounts

**To Alchemy:**
- Wallet address (public blockchain data)
- Chosen chains to scan
- No transaction signing capability

**To CoinGecko:**
- Token symbols (public data)
- No personal identifiers

**To Claude (AI export):**
- Portfolio snapshot (amounts, values, dates)
- Stored in your Claude conversation history
- Not shared with other users

### What Stays Local

**If not logged in:**
- All position data (localStorage only)
- Saved views
- Cache data
- Nothing leaves your browser except API calls above

**If logged in:**
- Position data synced to Supabase
- Encrypted at rest
- Row-level security (only you can access)
- Supabase team cannot decrypt your data

---

## Troubleshooting Export Issues

### "Export shows $0 for position"

**Cause:** Pool not linked to DefiLlama, or price fetch failed

**Fix:** 
1. Check if position is mapped (unmapped positions have no APY data)
2. Re-scan wallet to refresh balances
3. Manually enter amount if auto-fetch fails

### "APY shows 0.00%"

**Cause:** Pool has no historical data, or DefiLlama outage

**Fix:**
1. Check DefiLlama directly for that pool
2. Use "Fixed APY Override" if known (e.g., PT tokens)
3. Wait for historical data to populate (new pools)

### "Claude says 'incomplete data'"

**Cause:** Missing critical fields in export

**Fix:**
1. Ensure all positions are linked to pools
2. Re-export after updating positions
3. Check if DefiLlama API is accessible

### "Wallet scan finds no tokens"

**Cause:** Wrong chain selected, or wallet has no ERC-20 tokens

**Fix:**
1. Verify wallet address is correct (0x...)
2. Select correct chains (Ethereum vs Arbitrum vs Base)
3. Check wallet on Etherscan to confirm tokens exist
4. Some wallets hold only native ETH (no tokens to import)

---

## Best Practices

### Export Cadence

**Daily:** Quick portfolio summary (total value, any alerts)  
**Weekly:** Deposit planning (compare portfolio vs opportunities)  
**Monthly:** Deep review (performance, allocation, rebalancing)

### Data Verification

**Before large decisions:**
1. Cross-check APY with protocol dashboard
2. Verify TVL on DefiLlama directly
3. Check on-chain balances (Etherscan) for critical positions

**Regular checks:**
- Compare portfolio value to wallet scan (should match within 1-2%)
- Verify weighted APY against manual calculation occasionally
- Spot-check historical data against protocol announcements

### AI Export Tips

**Be specific in custom prompts:**
âŒ "Analyze my portfolio"
âœ… "Compare Morpho GTUSDCP vs STEAKUSDC. Should I consolidate?"

**Use pre-built prompts when possible:**
- They're optimized for structured output
- Claude knows what metrics to prioritize
- Faster analysis

**Export frequently:**
- JSON is small (10-50KB)
- Doesn't cost API credits
- Creates snapshots for comparison

---

**Document Version:** 1.0  
**Last Updated:** December 13, 2025  
**Related:** YIELD_TRACKER_PRODUCT.md (full feature overview)  
**Status:** Production data flow, actively used
