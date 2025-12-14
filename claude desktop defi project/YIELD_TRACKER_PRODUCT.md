# DeFi Yield Tracker - Product Overview

**Version:** 1.0  
**Created:** December 13, 2025  
**Type:** Web application for DeFi portfolio management and yield research  
**URL:** [Your deployment URL]

---

## What It Is

A DeFi yield aggregator that surfaces historical analytics directly in the pool browsing interface. Unlike traditional aggregators that only show current APY/TVL, this tool provides 90-day trends, volatility metrics, and organic yield percentages before you invest.

**Core value proposition:** Make better investment decisions by seeing the full pictureâ€”not just today's numbers.

---

## Key Features

### 1. Pool Discovery & Research

**Data source:** DefiLlama API (17,000+ pools across 50+ chains)

- Real-time APY and TVL for all pools
- Search by symbol, protocol, or chain
- Direct links to DefiLlama for detailed pool pages
- Table and card view toggle

**Filtering capabilities:**
- Multi-chain selection (Ethereum, Arbitrum, Base, Optimism, Polygon, etc.)
- Multi-protocol selection (Aave, Morpho, Pendle, Curve, etc.)
- Token symbol filter
- Stablecoin-only toggle
- TVL range ($5M-$10M, supports K/M/B notation)
- APY range (0-20%, customizable)
- URL persistence (shareable filtered views)

**Saved views:**
- Save custom filter combinations with names
- Quick-load saved searches
- Store up to 20+ views
- Cloud sync via Supabase (when logged in)

### 2. Historical Analytics

**What makes this different:** Historical metrics are shown IN THE POOLS TABLE, not buried in separate pages.

**Calculated metrics:**
- **Avg30 APY:** 30-day rolling average (spot yield compression)
- **Avg90 APY:** 90-day rolling average (long-term stability)
- **Volatility (Ïƒ):** Standard deviation of APY (green <1.5, yellow 1.5-3.0, red >3.0)
- **Organic %:** Percentage of yield from base protocol vs temporary incentives
- **30-Day TVL Change:** Capital flow indicator (growing/stable/declining)
- **Sparkline charts:** Visual APY and TVL trends over 30 days
- **ML Prediction:** DefiLlama's directional forecast (Up/Down/Stable + confidence %)

**Data collection:**
- Batch fetch historical data for filtered pools
- 90-day lookback window
- Smart caching (24-hour expiry, auto-pruning)
- Progress indicator with cancel support
- Only fetches data for visible/filtered pools (performance optimization)

**Color-coded flags:**
- ðŸŸ¢ Green: Healthy metrics (low volatility, high organic %, stable TVL)
- ðŸŸ¡ Yellow: Moderate risk (some volatility or incentive dependency)
- ðŸ”´ Red: Warning (high volatility, low organic %, declining TVL)

### 3. Portfolio Tracking

**Purpose:** Track actual positions across protocols with live value updates

**Position data:**
- Amount invested
- Entry date
- Entry APY (or fixed APY override for PT tokens)
- Current value (live from wallet scan or manual entry)
- Custom notes
- DeFiLlama pool link

**Analytics dashboard:**
- Total portfolio value
- Weighted APY (accurate blended calculation)
- Projected earnings (daily/monthly/annual)
- Allocation breakdown by:
  - Pool (individual positions)
  - Chain (Ethereum vs L2s)
  - Asset type (stablecoins vs growth assets)
- APY sparklines per position
- Historical trend charts

**Portfolio alerts:**
- APY drop warnings (vs 90-day average)
- TVL decline warnings (>20% in 30 days)
- Low organic yield warnings (<80%)
- High volatility warnings (Ïƒ >3.0)

### 4. Wallet Integration

**Data source:** Alchemy API + DefiLlama pricing

**Supported chains:**
- Ethereum mainnet
- Arbitrum
- Polygon
- Optimism
- Base

**Functionality:**
- Scan wallet address for token balances
- Fetch USD prices via DefiLlama
- Auto-detect positions across all chains
- Import tokens as portfolio positions
- Link wallet tokens to DeFi pools

**Workflow:**
1. Enter wallet address (0x...)
2. Select chains to scan
3. App fetches all token balances
4. Displays found tokens with USD values
5. Select tokens to import
6. Map to DeFiLlama pools (auto-match or manual)
7. Positions added to portfolio with live tracking

**Unmapped positions:**
- Tokens that don't auto-match to pools appear in "Unmapped" section
- Manually search and link to correct DeFiLlama pool
- Handles edge cases (Wildcat vaults, newer protocols, LP tokens)

### 5. Price Watchlist

**Data source:** CoinGecko API

**Default tracking:** ETH, BTC, SOL  
**Customizable:** Add/remove any CoinGecko-listed asset

**Display:**
- Current price
- 24-hour change (% and $)
- 7-day change
- Market cap
- Market rank
- Auto-refresh every 30 seconds

**Use case:** Monitor ETH price for gas fee planning, track broader market sentiment

### 6. Data Export

**Format:** JSON with comprehensive portfolio snapshot

**Standard export includes:**
- All positions (amount, APY, value, entry date)
- Total portfolio metrics (value, weighted APY, earnings)
- Allocation breakdowns (by pool, chain, asset type)
- Individual position analytics
- Timestamp and export metadata

**AI-optimized export:**

Pre-built analysis prompts for Claude:
- "Find Opportunities" â†’ Compare portfolio vs available pools, suggest additions
- "Review Portfolio" â†’ Health check, risk analysis, allocation assessment
- "Top 10 Pools" â†’ Best yield opportunities from filtered view
- "Verify High APY" â†’ Cross-check claimed yields against historical data
- Custom prompts â†’ Freeform analysis requests

**Export workflow:**
1. Click "Export for AI"
2. Select analysis type (or write custom prompt)
3. App generates JSON with embedded instructions
4. Copy to clipboard
5. Paste into Claude
6. Get instant structured analysis

**Why this matters:** Replaces manual screenshot â†’ description â†’ calculation workflow. Claude receives complete, structured data instead of having to parse images or guess context.

### 7. Authentication & Sync

**Provider:** Supabase (PostgreSQL + Auth)

**Authentication:**
- Email/password registration
- Secure session management
- Optional (works offline without login)

**Cloud sync (when logged in):**
- Portfolio positions
- Saved filter views
- Unmapped position mappings
- Auto-sync on changes
- Conflict resolution (last-write-wins)

**Offline mode (no login):**
- Full functionality via localStorage
- Data persists in browser
- Manual export for backup
- Auto-migration to cloud on first login

---

## Data Sources

### DefiLlama API

**Base URL:** `https://yields.llama.fi`

**Endpoints used:**
- `/pools` â†’ All yield pools (current APY, TVL, project, chain, etc.)
- `/chart/{pool_id}` â†’ Historical data (90 days of APY/TVL)
- `/prices/current` â†’ Token USD prices

**Data accuracy:** DefiLlama is industry-standard aggregator, used by billions in TVL tracking

**Update frequency:**
- Pool data: Every 5 minutes (their API refresh)
- Historical data: Cached 24 hours (your app's optimization)
- Prices: Real-time on demand

### Alchemy API

**Purpose:** Wallet token balance scanning

**Endpoints used:**
- `alchemy_getTokenBalances` â†’ ERC-20 token holdings
- `alchemy_getTokenMetadata` â†’ Token names/symbols/decimals

**Chains supported:** Ethereum, Arbitrum, Polygon, Optimism, Base

**Rate limits:** Generous free tier (handles typical usage)

### CoinGecko API

**Purpose:** Price watchlist

**Endpoint:** `/simple/price` with market data

**Free tier:** 10-50 calls/minute (more than enough for 30s refresh)

---

## Technical Architecture

### Frontend

- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Recharts (sparklines and charts)

### Backend Services

- Supabase (auth + PostgreSQL for cloud sync)
- DefiLlama API (pool data)
- Alchemy API (wallet scanning)
- CoinGecko API (price watchlist)

### Storage

**Dual-layer approach:**
- **localStorage:** Offline mode, instant persistence
- **Supabase PostgreSQL:** Cloud sync for logged-in users

**Migration:** Auto-migrates localStorage â†’ Supabase on first login

### Hosting

- Vercel (deployment + analytics)
- Edge functions for API proxying (if needed)

---

## Use Cases

### 1. Weekly Deposit Planning

**Scenario:** You have Â£1,500 to deploy, need to find best allocation.

**Workflow:**
1. Load saved view "Core Protocols 4-8% APY"
2. Sort by Avg90 (most stable long-term yield)
3. Check organic % >95% (filter out incentive-driven pools)
4. Compare current APY vs Avg90 (find underpriced opportunities)
5. Check TVL 30d change (avoid bleeding pools)
6. Export top 3 candidates â†’ Claude for final analysis

**Time:** 5 minutes vs 30 minutes manual research

### 2. Monthly Portfolio Review

**Scenario:** Check if positions are performing as expected.

**Workflow:**
1. Open portfolio dashboard
2. Review weighted APY (target: 6-8%)
3. Check allocation drift (target: 70/30 stables/growth)
4. Scan alerts for red flags
5. Export portfolio â†’ Claude with "Review Portfolio" prompt
6. Claude analyzes: health check, risk assessment, rebalancing suggestions

**Time:** 10 minutes vs 1 hour with DeBank CSV + spreadsheet

### 3. Satellite Strategy Research

**Scenario:** Find 7-15% APY opportunities for satellite allocation.

**Workflow:**
1. Filter: APY 7-15%, TVL $5M+, Stables only
2. Sort by Organic % descending (highest sustainable yield)
3. Check Volatility <3.0 (filter out erratic pools)
4. Review TVL trends (growing or stable only)
5. Click pool â†’ DefiLlama for protocol details
6. Add to watchlist or deploy

**Time:** 15 minutes to evaluate 20+ candidates

### 4. Daily Position Monitoring

**Scenario:** Quick check that nothing's broken.

**Workflow:**
1. Open portfolio dashboard
2. Scan for red alert badges
3. Check weighted APY (major drop = investigate)
4. Review price watchlist (ETH spiked? gas planning)
5. Export â†’ Claude with "What changed today?" custom prompt

**Time:** 2 minutes

### 5. New Protocol Evaluation

**Scenario:** Someone mentions a new high-yield protocol, verify if it's legitimate.

**Workflow:**
1. Search protocol name in pools table
2. Fetch historical data (90 days)
3. Check:
   - Organic % (>90% = sustainable, <80% = incentive-dependent)
   - Volatility (high Ïƒ = unstable)
   - TVL trend (declining = red flag)
   - Avg30 vs current APY (spiking = suspicious)
4. Compare vs similar protocols
5. Export pool data â†’ Claude for risk assessment

**Time:** 5 minutes vs hours of manual research

---

## Limitations & Known Issues

### Data Accuracy

**DefiLlama dependency:** If DefiLlama data is wrong, the app shows wrong data. This is rare but possible.

**Mitigation:** Cross-reference critical decisions with protocol dashboards (Aave, Morpho, etc.)

### Historical Data Coverage

**Not all pools have 90 days of data:**
- New pools: Limited history (e.g., 21 days)
- Newer protocols: Sparse data points
- App handles gracefully but metrics less reliable

**Indicator:** "Days" badge shows how much history is available

### Wallet Scanning Limitations

**Alchemy free tier:** Rate limits may apply for very active scanning (rare)

**Unsupported tokens:** Some exotic tokens may not return metadata correctly

**No NFT support:** Only ERC-20 tokens detected

### Price Data

**CoinGecko delays:** Prices may lag 1-2 minutes behind exchange data

**Not suitable for:** Day trading or real-time arbitrage

### Export File Size

**Large portfolios (50+ positions):** JSON export can be 50-100KB

**Workaround:** Still well within Claude's context window, no practical issue

---

## Privacy & Security

### Data Storage

**Local (no login):**
- All data in browser localStorage
- Never leaves your device
- Clear browser data = lose positions

**Cloud (logged in):**
- Positions and views stored in Supabase PostgreSQL
- Encrypted at rest
- Only accessible to your account

### API Keys

**No wallet private keys stored:** Wallet scanning is read-only via Alchemy

**No trading permissions:** App cannot move funds

**Supabase security:** Row-level security policies enforce data isolation

### Third-Party APIs

**Data sent to:**
- DefiLlama: Pool IDs (public data)
- Alchemy: Wallet address (public blockchain data)
- CoinGecko: Token symbols (public data)

**NOT sent:**
- Wallet seed phrases
- Private keys
- Transaction signing data

---

## Future Enhancements (Potential)

### Short-term (Next 3 months)

- Gas price tracking (L1 + L2s)
- Protocol news feed integration
- Advanced risk scoring algorithm
- Multi-wallet portfolio (combine multiple addresses)
- Historical position performance tracking

### Medium-term (6-12 months)

- Mobile app (React Native)
- Automated rebalancing suggestions
- Integration with on-chain execution (via Wallet Connect)
- Telegram/Discord alerts for portfolio events

### Long-term (12+ months)

- AI-powered yield prediction
- Strategy backtesting (simulate historical performance)
- Social features (share portfolios, copy strategies)
- Tax reporting integration

---

## Support & Documentation

**Product docs:** This file  
**Data source explainer:** YIELD_TRACKER_DATA_SOURCES.md  
**Integration with strategy:** See updated WEEKLY_WORKFLOW.md, PORTFOLIO_TRACKING_PROCESS.md

**Issues/bugs:** [Your issue tracker URL]

**Feature requests:** [Your feedback channel]

---

**Document Version:** 1.0  
**Last Updated:** December 13, 2025  
**Status:** Production-ready, actively used  
**Maintained by:** Tim Fowler
