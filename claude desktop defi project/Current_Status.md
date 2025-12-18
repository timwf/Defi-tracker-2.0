# Current Status

> **⚠️ CRITICAL:** When updating this document, always use DeFiLlama-friendly naming:
> 
> - Use DeFiLlama **symbol** (e.g., GTUSDCP, not "Gauntlet USDC Prime")
> - Include **pool_id** for each position
> - Include DeFiLlama **URL** for easy cross-reference
> - This enables direct comparison with yield tool outputs

**Last Updated:** December 18, 2025  
**Portfolio Value:** $20,135 (£15,830)  
**Phase:** Core expansion continuing (7 protocols active)

---

## Portfolio Summary

| Category | Value | % | Target | Status |
|----------|-------|---|--------|--------|
| Stablecoins | $14,084 | 69.9% | 70% | ✅ On target |
| wstETH | $6,051 | 30.1% | 30% | ✅ Perfect |
| **Total Deployed** | **$20,135** | 100% | | |

**Changes since Dec 13:**
- Added £1,500 deposit (Dec 18): £970 to SGHO, £530 to wstETH
- SGHO grew from $1,713 to $3,004 (now largest stablecoin position)
- wstETH increased from 1.533 to 1.736 tokens
- Perfect 70/30 allocation achieved
- Stablecoin blended APY: 7.80% → 6.93% (SGHO dilution expected)
- Total portfolio APY: 6.13% → 5.85% (within target range)
- Portfolio +$3,592 (+21.7%) since Dec 13

---

## Active Positions

### Stablecoins (69.9% = $14,084)

| Protocol | DeFiLlama Symbol | Network | Value | % of Stables | APY | Annual Yield | Pool ID | Status |
|----------|------------------|---------|-------|--------------|-----|--------------|---------|--------|
| **Aave V3** | **SGHO** | **Ethereum** | **$3,004** | **21.3%** | **5.71%** | **$172** | ff2a68af-030c-4697-b0a1-b62a738eaef0 | **✅ Anchor - now largest** |
| **Pendle** | **SUSDAI** | **Arbitrum** | **$2,059** | **14.6%** | **15.00%** | **$309** | 43a38685-aa22-4d99-9c2f-bd34a980de01 | **🟡 Satellite #2 - PT token** |
| Morpho | GTUSDCP | Base | $1,904 | 13.5% | 5.63% | $107 | e0672197-9f3e-4414-bca5-e6b4c90aa469 | ✅ Gauntlet curator |
| Morpho | STEAKUSDC | Base | $1,902 | 13.5% | 5.63% | $107 | 7820bd3c-461a-4811-9f0b-1d39c1503c3f | ✅ Steakhouse curator |
| Euler V2 | USDC | Arbitrum | $1,892 | 13.4% | 5.47% | $103 | 91a13ad5-0687-4d6f-a789-da86b149d817 | ✅ Core position |
| Spark | SUSDS | Ethereum | $1,881 | 13.4% | 4.00% | $75 | d8c4eff5-c8a9-46fc-a888-057c4c668e72 | ✅ MakerDAO backing |
| **Wildcat** | **WMTUSDC** | **Ethereum** | **$1,441** | **10.2%** | **10.50%** | **$151** | 57885844-7b3f-49b3-969b-9405b165fa78 | **🟡 Satellite #1 - Wintermute** |
| **Total** | | | **$14,084** | 100% | **6.93%** | **$977** | | |

**Protocol breakdown:**
- Aave ecosystem: $4,885 (34.7%) - SGHO + Spark (Aave fork)
- Morpho: $3,806 (27.0%) across 2 independent vaults with different curators
- **Satellites: $3,500 (24.9%)** - Wildcat private credit + Pendle PT token
- Euler V2: $1,892 (13.4%) - Arbitrum position

**Satellite status:**
- Position 1: Wildcat Wintermute @ 10.5% APY ($1,441)
- Position 2: Pendle PT-sUSDai @ 15.0% APY ($2,059) - matures Feb 19, 2026
- Position 3: TBD (~$500-700 remaining allocation)

### Growth (30.1% = $6,051)

| Asset | Network | Balance | Value | APY | Status |
|-------|---------|---------|-------|-----|--------|
| wstETH | Ethereum | 1.736 wstETH | $6,051 | 2.54% | ✅ Active |

**Note:** wstETH (wrapped staked ETH - non-rebasing version)

### Gas Reserves (Not in portfolio %)

| Network | Token | Amount | Value | Notes |
|---------|-------|--------|-------|-------|
| Ethereum L1 | ETH | ~0.001 ETH | ~$4 | Minimal - top up if needed |
| Base | ETH | ~0.001 ETH | ~$4 | For Base transactions |
| Arbitrum | ETH | ~0.001 ETH | ~$4 | For Arbitrum transactions |

---

## DeFiLlama Pool References

| Position | DeFiLlama Symbol | Pool ID | DeFiLlama URL |
|----------|------------------|---------|---------------|
| Aave V3 SGHO (Ethereum) | SGHO | ff2a68af-030c-4697-b0a1-b62a738eaef0 | [view](https://defillama.com/yields/pool/ff2a68af-030c-4697-b0a1-b62a738eaef0) |
| Pendle PT-sUSDai (Arbitrum) | SUSDAI | 43a38685-aa22-4d99-9c2f-bd34a980de01 | [view](https://defillama.com/yields/pool/43a38685-aa22-4d99-9c2f-bd34a980de01) |
| Morpho Gauntlet USDC Prime (Base) | GTUSDCP | e0672197-9f3e-4414-bca5-e6b4c90aa469 | [view](https://defillama.com/yields/pool/e0672197-9f3e-4414-bca5-e6b4c90aa469) |
| Morpho Steakhouse USDC (Base) | STEAKUSDC | 7820bd3c-461a-4811-9f0b-1d39c1503c3f | [view](https://defillama.com/yields/pool/7820bd3c-461a-4811-9f0b-1d39c1503c3f) |
| Euler V2 USDC (Arbitrum) | USDC | 91a13ad5-0687-4d6f-a789-da86b149d817 | [view](https://defillama.com/yields/pool/91a13ad5-0687-4d6f-a789-da86b149d817) |
| Spark USDS Savings (Ethereum) | SUSDS | d8c4eff5-c8a9-46fc-a888-057c4c668e72 | [view](https://defillama.com/yields/pool/d8c4eff5-c8a9-46fc-a888-057c4c668e72) |
| Wildcat Wintermute USDC (Ethereum) | WMTUSDC | 57885844-7b3f-49b3-969b-9405b165fa78 | [view](https://defillama.com/yields/pool/57885844-7b3f-49b3-969b-9405b165fa78) |
| Lido wstETH (Ethereum) | STETH | 747c1d2a-c668-4682-b9f9-296708a3dd90 | [view](https://defillama.com/yields/pool/747c1d2a-c668-4682-b9f9-296708a3dd90) |

---

## Performance

### Current APY (December 18, 2025)

| Position | Value | APY | Annual Yield |
|----------|-------|-----|--------------|
| Pendle PT-sUSDai | $2,059 | 15.00% | $309 |
| Wildcat Wintermute | $1,441 | 10.50% | $151 |
| Aave SGHO | $3,004 | 5.71% | $172 |
| Morpho GTUSDCP | $1,904 | 5.63% | $107 |
| Morpho STEAKUSDC | $1,902 | 5.63% | $107 |
| Euler V2 USDC | $1,892 | 5.47% | $103 |
| Spark SUSDS | $1,881 | 4.00% | $75 |
| wstETH | $6,051 | 2.54% | $154 |
| **Total** | **$20,135** | **5.85%** | **$1,178** |

**Blended Stablecoin APY:** 6.93% ✅ (target: 6-8%)  
**Blended Portfolio APY:** 5.85% ✅ (target: 5-7%)  
**Monthly Passive Income:** ~$98/month (£77/month)

### Performance vs Target

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Stablecoin APY | 6-8% | 6.93% | ✅ In target range |
| Portfolio APY | 5-7% | 5.85% | ✅ In target range |
| Annual yield | - | $1,178 | ✅ On track |
| 70/30 split | 70/30 | 69.9/30.1 | ✅ Perfect |

---

## Compliance Status

| Rule | Target | Current | Status |
|------|--------|---------|--------|
| Max per protocol | 25% | 21.3% (SGHO) | ✅ Met |
| Min protocols | 4 | 7 total (5 core + 2 satellites) | ✅ Exceeded |
| Anchor minimum | 15% | 34.7% (SGHO + Spark/Aave fork) | ✅ Exceeded |
| 70/30 split | 70/30 | 69.9/30.1 | ✅ Perfect |

**Diversification notes:**
- 8 active positions across 6 protocol families
- 5 core protocols: Aave, Spark, Morpho (2 vaults), Euler V2
- 2 satellites: Wildcat, Pendle
- Morpho: 2 vaults with different curators (Gauntlet, Steakhouse)
- Aave codebase: 2 instances (SGHO, Spark sUSDS) - acceptable correlation
- No single position exceeds 21.3% of stablecoins
- Satellites: 2 of 3 deployed (24.9% of stables, within target)

---

## Network Allocation

| Network | Stablecoins | wstETH | Gas | Total | % |
|---------|-------------|--------|-----|-------|---|
| Ethereum L1 | $6,326 | $6,051 | ~$4 | $12,381 | 61.5% |
| Base | $3,806 | $0 | ~$4 | $3,810 | 18.9% |
| Arbitrum | $3,951 | $0 | ~$4 | $3,955 | 19.6% |
| **Total** | **$14,084** | **$6,051** | **~$12** | **$20,147** | 100% |

**Network diversification:** 61.5% L1, 18.9% Base, 19.6% Arbitrum ✅ Well balanced

---

## Recent Changes (Dec 13-18)

### Dec 18 Deposit

1. **SGHO (Ethereum):** Added ~$1,291 (£970)
   - Grew from $1,713 to $3,004
   - Now largest stablecoin position at 21.3%
   - Anchor tier expansion as planned

2. **wstETH increase:** Added ~0.203 tokens → 1.736 total
   - Added ~$711 (£530)
   - Achieved perfect 30% allocation

### Performance Impact

- Stablecoin APY: 7.80% → 6.93% (-0.87%, expected from adding lower-yield anchor)
- Total portfolio APY: 6.13% → 5.85% (-0.28%)
- Annual income: $1,014 → $1,178 (+16%)
- Monthly passive: $84.50 → $98 (+16%)

---

## Upcoming Actions

| Date | Action | Priority |
|------|--------|----------|
| Dec 25 | Weekly deposit #5 (£1,500) | High |
| Dec 28 | Monthly review + satellite strategy assessment | High |
| Jan 2026 | Evaluate satellite position #3 options | Medium |
| Feb 19, 2026 | PT-sUSDai maturity - plan redemption | High |

**Next deposit allocation (Dec 25):**
- Continue building underweight positions
- SUSDS and Euler now relatively underweight vs SGHO
- Maintain 70/30 split

---

## Satellite Strategy Progress

### Current State (2 of 3 Deployed)

| Position | Protocol | Mechanism | Amount | APY | Status |
|----------|----------|-----------|--------|-----|--------|
| 1 | Wildcat | Wintermute private credit | $1,441 | 10.50% | ✅ Deployed Dec 10 |
| 2 | Pendle | PT-sUSDai (fixed-rate) | $2,059 | 15.00% | ✅ Deployed Dec 11 |
| 3 | TBD | TBD | ~$500-700 | TBD | 🔄 Decision pending |

**Target allocation:** ~$3,500-4,000 total across 3 positions  
**Currently deployed:** $3,500 (24.9% of stables) ✅

**Mechanism diversification achieved:**
- Private credit (Wildcat): Borrower default risk
- Fixed-rate tokenization (Pendle): Smart contract + L2 risk + maturity date
- Third position TBD: Consider Ethena, Morpho isolated markets, or hold

---

## Risk Status

### Protocol Risk Breakdown

| Risk Type | Exposure | Mitigation |
|-----------|----------|------------|
| **Aave codebase** | 34.7% (SGHO + Spark) | Anchor tier, 8+ years operational |
| **Morpho vaults** | 27.0% (2 curators) | Different curators, Established tier |
| **Wildcat protocol** | 10.2% (Wintermute) | Emerging tier, private credit mechanism |
| **Pendle protocol** | 14.6% (PT-sUSDai) | Established tier, 3.5 years, fixed-rate token |
| **Euler V2 protocol** | 13.4% (USDC vault) | Established tier, dual curator oversight |

### Expected Annual Loss

**Calculation:**
- Anchor positions (34.7%): ~0.5% failure rate = $24/year expected loss
- Established positions (55.1%): ~2% failure rate = $155/year expected loss
- Emerging/Satellites (24.9%): ~5% failure rate = $175/year expected loss
- **Total expected loss:** ~$354/year

**Actual annual yield:** $1,178/year  
**Net after expected losses:** $824/year (4.1% net APY)

---

## Key Metrics at a Glance

| Metric | Value |
|--------|-------|
| **Total Portfolio** | $20,135 (£15,830) |
| **Stablecoin APY** | 6.93% |
| **Total APY** | 5.85% |
| **Monthly Income** | $98 (£77) |
| **Annual Income** | $1,178 (£926) |
| **Deployed / Target** | £15,830 / £40,000 (39.6%) |
| **Active Protocols** | 7 (Pendle, Wildcat, Morpho x2, Aave, Spark, Euler, Lido) |
| **Core Protocols** | 5 (Aave, Spark, Morpho x2, Euler) |
| **Satellites** | 2 (Wildcat, Pendle) |
| **Network Split** | 61.5% L1, 18.9% Base, 19.6% Arbitrum |
| **Largest Position** | 21.3% (SGHO) |
| **Smallest Core** | 13.4% (SUSDS, Euler) |
| **Satellite Progress** | 2 of 3 deployed ($3,500) |

---

**Document Version:** 7.0  
**Last Updated:** December 18, 2025  
**Major Changes:**
- Weekly deposit #4: £970 to SGHO, £530 to wstETH
- SGHO now largest stablecoin position (21.3%)
- Perfect 70/30 split achieved (69.9/30.1)
- Portfolio crossed $20k milestone
- wstETH at 1.736 tokens
- Monthly passive income now $98/month

**Next Update:** After Dec 25 weekly deposit  
**Next Review:** Dec 28 monthly review
