# Current Status

> **âš ï¸ CRITICAL:** When updating this document, always use DeFiLlama-friendly naming:
> 
> - Use DeFiLlama **symbol** (e.g., GTUSDCP, not "Gauntlet USDC Prime")
> - Include **pool_id** for each position
> - Include DeFiLlama **URL** for easy cross-reference
> - This enables direct comparison with yield tool outputs

**Last Updated:** December 13, 2025  
**Portfolio Value:** $16,543 (Â£13,018)  
**Phase:** Core expansion complete (5 protocols active)

---

## Portfolio Summary

| Category | Value | % | Target | Status |
|----------|-------|---|--------|--------|
| Stablecoins | $11,486 | 69.4% | 70% | âœ… On target |
| wstETH | $5,056 | 30.6% | 30% | âœ… Perfect |
| **Total Deployed** | **$16,543** | 100% | | |

**Changes since Dec 11:**
- Added Euler V2 USDC core position @ 5.80% APY (Arbitrum)
- Increased wstETH by 0.379 tokens â†’ 1.338 total
- Expanded to 5 core stablecoin protocols (was 4)
- Stablecoin blended APY: 7.82% â†’ 7.80% (stable)
- Total portfolio APY: 6.43% â†’ 6.13% (slight compression)
- Portfolio +$1,864 (+12.7%) from deposits

---

## Active Positions

### Stablecoins (69.4% = $11,486)

| Protocol | DeFiLlama Symbol | Network | Value | % of Stables | APY | Annual Yield | Pool ID | Status |
|----------|------------------|---------|-------|--------------|-----|--------------|---------|--------|
| **Pendle** | **SUSDAI** | **Arbitrum** | **$2,057** | **17.9%** | **15.00%** | **$309** | 43a38685-aa22-4d99-9c2f-bd34a980de01 | **ðŸŸ¡ Satellite #2 - PT token** |
| Morpho | GTUSDCP | Base | $1,902 | 16.6% | 5.61% | $107 | e0672197-9f3e-4414-bca5-e6b4c90aa469 | âœ… Gauntlet curator |
| Morpho | STEAKUSDC | Base | $1,900 | 16.5% | 5.61% | $107 | ba68527f-8ec2-4c55-827a-8f4673ae047c | âœ… Steakhouse curator |
| Spark | SUSDS | Ethereum | $1,880 | 16.4% | 4.25% | $80 | d8c4eff5-c8a9-46fc-a888-057c4c668e72 | âœ… MakerDAO backing |
| Aave V3 | SGHO | Ethereum | $1,714 | 14.9% | 5.76% | $99 | ff2a68af-030c-4697-b0a1-b62a738eaef0 | âœ… GHO savings |
| **Wildcat** | **WMTUSDC** | **Ethereum** | **$1,441** | **12.5%** | **10.50%** | **$151** | 57885844-7b3f-49b3-969b-9405b165fa78 | **ðŸŸ¡ Satellite #1 - Wintermute** |
| **Euler V2** | **USDC** | **Arbitrum** | **$592** | **5.2%** | **5.80%** | **$34** | 91a13ad5-0687-4d6f-a789-da86b149d817 | **âœ… NEW Core - EVK Vault eUSDC-6** |
| **Total** | | | **$11,486** | 100% | **7.80%** | **$896** | | |

**Protocol breakdown:**
- Morpho: $3,802 (33.1%) across 2 independent vaults with different curators
- Aave/Spark: $3,594 (31.3%) - Spark is Aave V3 fork, shares codebase
- **Satellites: $3,498 (30.4%)** - Wildcat private credit + Pendle PT token
- **Euler V2: $592 (5.2%)** - New addition, will grow

**Satellite status:**
- Position 1: Wildcat Wintermute @ 10.5% APY ($1,441)
- Position 2: Pendle PT-sUSDai @ 15.0% APY ($2,057)
- Position 3: TBD (~$500-700 remaining allocation)

### Growth (30.6% = $5,056)

| Asset | Network | Balance | Value | APY | Status |
|-------|---------|---------|-------|-----|--------|
| wstETH | Ethereum | 1.338 wstETH | $5,056 | 2.53% | âœ… Active |

**Note:** Now tracking as wstETH (wrapped staked ETH - non-rebasing version)

### Gas Reserves (Not in portfolio %)

| Network | Token | Amount | Value | Notes |
|---------|-------|--------|-------|-------|
| Ethereum L1 | ETH | ~0.001 ETH | ~$3.80 | Low - add more if needed |
| Base | ETH | ~0.001 ETH | ~$3.50 | For Base transactions |
| Arbitrum | ETH | ~0.001 ETH | ~$3.50 | For Arbitrum transactions |

**Note:** L1 gas nearly depleted after staking/wrapping. Consider adding Â£20-30 ETH on L1 for future operations.

---

## DeFiLlama Pool References

| Position | DeFiLlama Symbol | Pool ID | DeFiLlama URL |
|----------|------------------|---------|---------------|
| Pendle PT-sUSDai (Arbitrum) | SUSDAI | 43a38685-aa22-4d99-9c2f-bd34a980de01 | [view](https://defillama.com/yields/pool/43a38685-aa22-4d99-9c2f-bd34a980de01) |
| Morpho Gauntlet USDC Prime (Base) | GTUSDCP | e0672197-9f3e-4414-bca5-e6b4c90aa469 | [view](https://defillama.com/yields/pool/e0672197-9f3e-4414-bca5-e6b4c90aa469) |
| Morpho Steakhouse USDC (Base) | STEAKUSDC | ba68527f-8ec2-4c55-827a-8f4673ae047c | [view](https://defillama.com/yields/pool/ba68527f-8ec2-4c55-827a-8f4673ae047c) |
| Wildcat Wintermute USDC (Ethereum) | WMTUSDC | 57885844-7b3f-49b3-969b-9405b165fa78 | [view](https://defillama.com/yields/pool/57885844-7b3f-49b3-969b-9405b165fa78) |
| Aave V3 SGHO (Ethereum) | SGHO | ff2a68af-030c-4697-b0a1-b62a738eaef0 | [view](https://defillama.com/yields/pool/ff2a68af-030c-4697-b0a1-b62a738eaef0) |
| Spark USDS Savings (Ethereum) | SUSDS | d8c4eff5-c8a9-46fc-a888-057c4c668e72 | [view](https://defillama.com/yields/pool/d8c4eff5-c8a9-46fc-a888-057c4c668e72) |
| Euler V2 USDC (Arbitrum) | USDC | 91a13ad5-0687-4d6f-a789-da86b149d817 | [view](https://defillama.com/yields/pool/91a13ad5-0687-4d6f-a789-da86b149d817) |
| Lido wstETH (Ethereum) | STETH | 747c1d2a-c668-4682-b9f9-296708a3dd90 | [view](https://defillama.com/yields/pool/747c1d2a-c668-4682-b9f9-296708a3dd90) |

---

## Performance

### Current APY (December 13, 2025)

| Position | Value | APY | Annual Yield |
|----------|-------|-----|--------------|
| Pendle PT-sUSDai | $2,057 | 15.00% | $309 |
| Morpho GTUSDCP | $1,902 | 5.61% | $107 |
| Morpho STEAKUSDC | $1,900 | 5.61% | $107 |
| Spark SUSDS | $1,880 | 4.25% | $80 |
| Aave SGHO | $1,714 | 5.76% | $99 |
| Wildcat Wintermute | $1,441 | 10.50% | $151 |
| Euler V2 USDC | $592 | 5.80% | $34 |
| wstETH | $5,056 | 2.53% | $128 |
| **Total** | **$16,543** | **6.13%** | **$1,014** |

**Blended Stablecoin APY:** 7.80% âœ… (target: 6-8%)  
**Blended Portfolio APY:** 6.13% âœ… (target: 5-7%)  
**Monthly Passive Income:** ~$84.50/month (Â£66/month)

### Performance vs Target

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Stablecoin APY | 6-8% | 7.80% | âœ… In target range |
| Portfolio APY | 5-7% | 6.13% | âœ… In target range |
| Annual yield | - | $1,014 | âœ… On track |
| 70/30 split | 70/30 | 69.4/30.6 | âœ… Perfect |

**Note:** Satellite strategy successfully maintaining target ranges. Euler V2 addition provides network diversification without sacrificing yield.

---

## Compliance Status

| Rule | Target | Current | Status |
|------|--------|---------|--------|
| Max per protocol | 25% | 17.9% (Pendle) | âœ… Met |
| Min protocols | 4 | 7 total (5 core + 2 satellites) | âœ… Exceeded |
| Anchor minimum | 15% | 31.3% (SGHO + Spark/Aave fork) | âœ… Exceeded |
| 70/30 split | 70/30 | 69.4/30.6 | âœ… Perfect |

**Diversification notes:**
- 7 independent positions across 6 protocol families
- 5 core protocols: Aave, Spark, Morpho (2 vaults), Euler V2
- 2 satellites: Wildcat, Pendle
- Morpho: 2 vaults with different curators (Gauntlet, Steakhouse)
- Aave codebase: 2 instances (SGHO, Spark sUSDS) - acceptable correlation
- No single position exceeds 17.9% of stablecoins
- Satellites: 2 of 3 deployed (30.4% of stables, within target)

---

## Network Allocation

| Network | Stablecoins | wstETH | Gas | Total | % |
|---------|-------------|--------|-----|-------|---|
| Ethereum L1 | $5,035 | $5,056 | $3.80 | $10,095 | 61.0% |
| Base | $3,802 | $0 | $3.50 | $3,806 | 23.0% |
| Arbitrum | $2,649 | $0 | $3.50 | $2,652 | 16.0% |
| **Total** | **$11,486** | **$5,056** | **$11** | **$16,553** | 100% |

**Network diversification:** 61% L1, 23% Base, 16% Arbitrum âœ… Well balanced

**Changes from last update:**
- Arbitrum exposure increased from 13.6% to 16.0% (Euler addition)
- Ethereum decreased from 63.5% to 61.0%
- Base stable at 23%

---

## Recent Changes (Dec 11-13)

### New Positions

1. **Euler V2 USDC (Arbitrum):** Added $592 @ 5.80% APY
   - Mechanism: Overcollateralized lending vault
   - Curators: Euler DAO + Gauntlet (dual oversight)
   - Protocol: 89 days operational on Arbitrum, $17M TVL
   - Risk: Moderate volatility historically, stable recent 30 days
   - Expected net APY: ~5.3% (after risk adjustment)

2. **wstETH increase:** Added 0.379 tokens â†’ 1.338 total
   - Staked 0.458 ETH on Lido
   - Wrapped to wstETH (non-rebasing version)
   - Network: Ethereum L1

### Performance Impact

- Stablecoin APY: 7.82% â†’ 7.80% (-0.02%, stable)
- Total portfolio APY: 6.43% â†’ 6.13% (-0.30%, wstETH dilution from 26.5% â†’ 30.6%)
- Annual income: Stable at ~$1,014/year
- Monthly passive: $79 â†’ $84.50 (+7%)

**Note:** Portfolio APY drop is expected - adding wstETH at 2.53% to reach 70/30 target naturally lowers blended rate slightly, but keeps us in 5-7% target range.

---

## Upcoming Actions

| Date | Action | Priority |
|------|--------|----------|
| Dec 13 | Monitor Euler interest accrual (first few days) | High |
| Dec 13-14 | Verify all positions showing correctly in DeBank | Medium |
| Dec 19 | Check Wildcat interest (9 days of accrual) | Medium |
| Dec 21 | Weekly deposit #4 (Â£1,500) | High |
| Dec 28 | Monthly review + satellite strategy assessment | High |
| Jan 2026 | Evaluate satellite position #3 options | Medium |

**Next deposit allocation (Dec 21):**
- Bias toward stablecoins to grow Euler position
- Target: Euler from 5.2% â†’ 8-10% of stables
- Maintain 70/30 split overall

---

## Satellite Strategy Progress

### Current State (2 of 3 Deployed)

| Position | Protocol | Mechanism | Amount | APY | Status |
|----------|----------|-----------|--------|-----|--------|
| 1 | Wildcat | Wintermute private credit | $1,441 | 10.50% | âœ… Deployed Dec 10 |
| 2 | Pendle | PT-sUSDai (fixed-rate) | $2,057 | 15.00% | âœ… Deployed Dec 11 |
| 3 | TBD | TBD | ~$500-700 | TBD | ðŸ“„ Decision pending |

**Target allocation:** ~$3,500-4,000 total across 3 positions (24-27% of stables)  
**Currently deployed:** $3,498 (30.4% of stables) âœ…

**Mechanism diversification achieved:**
- Private credit (Wildcat): Borrower default risk
- Fixed-rate tokenization (Pendle): Smart contract + L2 risk + maturity date
- Third position TBD: Consider Ethena, Morpho isolated markets, or hold

**Next decision:** January 2026 after validating both satellite positions for 4+ weeks

---

## Risk Status

### Protocol Risk Breakdown

| Risk Type | Exposure | Mitigation |
|-----------|----------|------------|
| **Aave codebase** | 31.3% (SGHO + Spark) | Anchor tier, 8+ years operational |
| **Morpho vaults** | 33.1% (2 curators) | Different curators, Established tier |
| **Wildcat protocol** | 12.5% (Wintermute) | Emerging tier, private credit mechanism |
| **Pendle protocol** | 17.9% (PT-sUSDai) | Established tier, 3.5 years, fixed-rate token |
| **Euler V2 protocol** | 5.2% (USDC vault) | Established tier, dual curator oversight |

### Borrower Risk Breakdown

| Borrower Type | Exposure | Risk Level |
|---------------|----------|------------|
| **Anonymous pooled** | 31.3% (Aave/Spark) | Low (protocol handles defaults) |
| **Institutional curators** | 38.3% (Gauntlet, Steakhouse, Euler DAO) | Medium-Low (vetted strategies) |
| **Known institution** | 12.5% (Wintermute) | Medium (borrower default possible) |
| **Overcollateralized protocol** | 17.9% (Pendle/Sky) | Medium-Low (smart contract risk) |

### Expected Annual Loss

**Calculation:**
- Core positions (5 protocols, 64%): ~1-2% expected loss = $110-220/year
- Euler position (5.2%): ~2% expected loss = $12/year
- Wildcat position (12.5%): ~4-5% expected loss = $60-70/year
- Pendle position (17.9%): ~2-3% expected loss = $50-70/year
- **Total expected loss:** ~$232-372/year

**Actual annual yield:** $1,014/year  
**Net after expected losses:** $642-782/year (3.9-4.7% net APY)

**Note:** This is conservative modeling. Actual losses may be zero in many years.

---

## Monitoring Status

### Daily (First Week - Euler)

- [ ] Check Euler balance increasing (interest accrual)
- [ ] Verify no issues in Euler Discord
- [ ] Confirm Arbitrum position visible in DeBank

### Weekly (All Positions)

- [ ] DeBank portfolio check
- [ ] Protocol APY stability (>5% drop = investigate)
- [ ] TVL trends (>20% decline = yellow flag)
- [ ] Quick Discord scan for incidents

### Monthly

- [ ] Full performance analysis (actual vs expected APY)
- [ ] Allocation drift check (currently perfect 69.4/30.6)
- [ ] Wildcat borrower health (TVL, reserve ratio, community sentiment)
- [ ] Pendle maturity date tracking (Feb 19, 2026)
- [ ] Euler V2 volatility assessment (is recent stability holding?)
- [ ] Satellite strategy review (add position #3?)

---

## Quick Reference

### Protocol URLs

| Protocol | URL | Networks |
|----------|-----|----------|
| Pendle | app.pendle.finance | Ethereum, Arbitrum |
| Wildcat | app.wildcat.finance | Ethereum |
| Aave V3 | app.aave.com | Ethereum, Base, Arbitrum |
| Spark | app.spark.fi | Ethereum |
| Morpho | app.morpho.org | Ethereum, Base, Arbitrum |
| Euler V2 | app.euler.finance | Ethereum, Arbitrum |
| Lido (wstETH) | stake.lido.fi | Ethereum |
| DeBank | debank.com | Portfolio tracking |
| DeFiLlama | defillama.com/yields | Yield research |

### Wallet Addresses

| Wallet | Address | Purpose | Networks |
|--------|---------|---------|----------|
| Wallet 1 | 0x661cÃ¢â‚¬Â¦a27f | Operational (100% currently) | All |
| Wallet 2 | Not created | Long-term (planned) | Future |

**Full Wallet 1 Address:** 0x661cac5d1685ea8a4d33f2dfcf112cb7d541a27f

---

## Historical Performance

### Portfolio Growth (Nov 10 - Dec 13, 2025)

| Date | Portfolio Value | Weekly Change | Notes |
|------|-----------------|---------------|-------|
| Nov 10 | ~$0 | - | Strategy start |
| Nov 24 | ~$6,500 | - | Initial positions |
| Dec 1 | $10,183 | +56.6% | Post-migration |
| Dec 6 | $12,389 | +21.7% | Added SGHO + deposit |
| Dec 10 | $12,719 | +2.7% | First satellite deployed |
| Dec 11 | $14,678 | +15.4% | Second satellite + Morpho swap |
| Dec 13 | $16,543 | +12.7% | Euler V2 added + wstETH increase |

**33-day performance:** $0 â†’ $16,543 (initial deployment phase)

**APY trajectory:**
- Dec 1: 4.3% blended (all core positions)
- Dec 6: 4.27% blended (stETH drag)
- Dec 10: 5.04% blended (Wildcat boost)
- Dec 11: 6.43% blended (Pendle boost) âœ…
- Dec 13: 6.13% blended (wstETH dilution to reach 70/30) âœ…

---

## Key Metrics at a Glance

| Metric | Value |
|--------|-------|
| **Total Portfolio** | $16,543 (Â£13,018) |
| **Stablecoin APY** | 7.80% |
| **Total APY** | 6.13% |
| **Monthly Income** | $84.50 (Â£66) |
| **Annual Income** | $1,014 (Â£797) |
| **Deployed / Target** | Â£13,018 / Â£40,000 (32.5%) |
| **Active Protocols** | 7 (Pendle, Wildcat, Morpho x2, Aave, Spark, Euler, Lido) |
| **Core Protocols** | 5 (Aave, Spark, Morpho x2, Euler) |
| **Satellites** | 2 (Wildcat, Pendle) |
| **Network Split** | 61% L1, 23% Base, 16% Arbitrum |
| **Largest Position** | 17.9% (Pendle PT-sUSDai) |
| **Smallest Position** | 5.2% (Euler V2 - will grow) |
| **Satellite Progress** | 2 of 3 deployed ($3,498 of ~$3,500-4,000 target) |

---

**Document Version:** 6.0  
**Last Updated:** December 13, 2025  
**Major Changes:**
- Fifth core protocol added: Euler V2 USDC @ 5.80% APY (Arbitrum)
- wstETH increased by 0.379 tokens to reach 70/30 split target
- Portfolio grew Â£1,500 to Â£13,018 total
- Network allocation rebalanced: 61% L1, 23% Base, 16% Arbitrum
- Both APY targets maintained (stables 7.80%, portfolio 6.13%)
- 7 active positions across 6 protocol families

**Next Update:** After Dec 21 weekly deposit or significant position changes  
**Next Review:** Dec 28 monthly review
