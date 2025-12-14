# DeFi Yield Tracker

A DeFi yield aggregator with **historical analytics built into the pool browsing experience** — see 90-day trends, volatility, and organic yield percentage before you invest.

## Key Differentiator: Historical Data in Pools View

Most yield aggregators only show current APY/TVL. This tool surfaces historical metrics **directly in the pools table**, so you can spot red flags at a glance:

- **90-Day Average APY** — Is current yield above or below normal?
- **APY Volatility** — How stable are returns?
- **Organic Yield %** — How much is real yield vs temporary incentives?
- **30-Day TVL Change** — Is capital flowing in or out?
- **Sparkline Charts** — Visual 30-day APY and TVL trends
- **ML Predictions** — DefiLlama's directional forecasts (Up/Down/Stable)

---

## Features

### Pool Discovery
- Real-time data from DefiLlama API (5,000+ pools)
- Search by symbol, project, or chain
- Table view with sortable columns + card view toggle
- Direct links to DefiLlama for each pool

### Advanced Filtering
- Multi-chain filter (Ethereum, Arbitrum, Base, Optimism, Polygon, etc.)
- Multi-protocol filter (Aave, Uniswap, Curve, Pendle, etc.)
- Token symbol filter
- Stablecoin-only toggle
- TVL and APY range filters (supports K/M/B notation)
- URL-persisted filters for sharing
- Save/load named filter combinations

### Historical Analytics
- Batch fetch 90-day historical data for filtered pools
- Smart caching (24-hour expiry, auto-prunes old entries)
- Progress indicator with cancellation support
- Calculated metrics: average APY, volatility, organic %, TVL change
- Color-coded indicators (green = healthy, red = warning)

### Portfolio Tracking
- Add positions with amount, entry date, and notes
- Fixed APY override for fixed-rate products (e.g., Pendle PT tokens)
- Dedicated portfolio page with analytics
- Total value, weighted APY, projected earnings (daily/monthly/annual)
- Allocation breakdown by pool, chain, and asset type
- APY sparklines and historical trends per position

### Wallet Integration
- Scan Ethereum addresses across multiple chains (Ethereum, Arbitrum, Polygon, Optimism, Base)
- Auto-detect wallet token balances via Alchemy API
- USD price fetching via DeFiLlama API
- Auto-refresh token balances on page load
- Unmapped positions list for tokens not yet linked to pools
- Link wallet tokens to tracked DeFi pools

### Price Watchlist
- Track crypto prices in real-time (default: ETH, BTC, SOL)
- Add/remove coins to watchlist
- CoinGecko API integration with 30-second auto-refresh
- 24h and 7d price change indicators
- Market cap and rank display

### Risk Alerts
- APY drop warnings (vs 90-day average)
- TVL decline warnings
- Low organic yield warnings
- High volatility warnings

### Data Export
- JSON export with all portfolio metrics
- AI-optimized export with pre-built analysis prompts:
  - Find Opportunities
  - Review Portfolio
  - Top 10 Pools
  - Verify High APY
  - Custom prompts
- Full portfolio snapshot including positions, allocations, and risk metrics

### Authentication & Sync
- Email/password auth via Supabase
- Cloud sync for positions, saved views, and unmapped positions
- Works fully offline with localStorage fallback
- Auto-migration to cloud on first login

---

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Supabase (auth + PostgreSQL)
- DefiLlama API (pools + token prices)
- Alchemy API (wallet scanning)
- CoinGecko API (price watchlist)
- Vercel Analytics

---

## Getting Started

```bash
cd defi-app
npm install
npm run dev
```

Create a `.env` file with your credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ALCHEMY_API_KEY=your_alchemy_key
```
