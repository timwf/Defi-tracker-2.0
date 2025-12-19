# Current Status

> **⚠️ CRITICAL:** When updating this document, always use DeFiLlama-friendly naming:
> 
> - Use DeFiLlama **symbol** (e.g., GTUSDCP, not "Gauntlet USDC Prime")
> - Include **pool_id** for each position
> - Include DeFiLlama **URL** for easy cross-reference
> - This enables direct comparison with yield tool outputs

**Last Updated:** December 19, 2025  
**Portfolio Value:** $22,375 (£17,580)  
**Phase:** Core expansion complete (7 stablecoin protocols + wstETH)

---

## Portfolio Summary

| Category | Value | % | Target | Status |
|----------|-------|---|--------|--------|
| Stablecoins | $15,641 | 69.9% | 70% | ✅ On target |
| wstETH | $6,734 | 30.1% | 30% | ✅ Perfect |
| **Total Deployed** | **$22,375** | 100% | | |

**Changes since Dec 13:**
- Added ~$1,558 USDC to Euler V2 (Arbitrum)
- Added ~0.121 wstETH (staked and wrapped 0.148 ETH)
- Portfolio grew +$2,039 (+10%) from deposits
- Euler now second-largest stablecoin position (22.1% of stables)
- 70/30 split now near-perfect (69.9/30.1)

---

## Active Positions

### Stablecoins (69.9% = $15,641)

| Protocol | DeFiLlama Symbol | Network | Value | % of Stables | APY | Annual Yield | Pool ID | Status |
|----------|------------------|---------|-------|--------------|-----|--------------|---------|--------|
| **Euler V2** | **USDC** | **Arbitrum** | **$3,450** | **22.1%** | **6.16%** | **$213** | 91a13ad5-0687-4d6f-a789-da86b149d817 | **✅ Best core yield** |
| Aave V3 | SGHO | Ethereum | $3,005 | 19.2% | 5.71% | $172 | ff2a68af-030c-4697-b0a1-b62a738eaef0 | ✅ GHO savings |
| **Pendle** | **SUSDAI** | **Arbitrum** | **$2,057** | **13.2%** | **15.00%** | **$309** | 43a38685-aa22-4d99-9c2f-bd34a980de01 | **🟡 Satellite #2 - PT token** |
| Morpho | GTUSDCP | Base | $1,904 | 12.2% | 5.63% | $107 | e0672197-9f3e-4414-bca5-e6b4c90aa469 | ✅ Gauntlet curator |
| Morpho | STEAKUSDC | Base | $1,902 | 12.2% | 5.63% | $107 | 7820bd3c-461a-4811-9f0b-1d39c1503c3f | ✅ Steakhouse curator |
| Spark | SUSDS | Ethereum | $1,881 | 12.0% | 4.00% | $75 | d8c4eff5-c8a9-46fc-a888-057c4c668e72 | ✅ MakerDAO backing |
| **Wildcat** | **WMTUSDC** | **Ethereum** | **$1,441** | **9.2%** | **10.50%** | **$151** | 57885844-7b3f-49b3-969b-9405b165fa78 | **🟡 Satellite #1 - Wintermute** |
| **Total** | | | **$15,641** | 100% | **7.28%** | **$1,134** | | |

**Protocol breakdown:**
- Euler V2: $3,450 (22.1%) - Best-yielding core position
- Aave/Spark: $4,886 (31.2%) - Anchor tier, different mechanisms
- Morpho: $3,806 (24.3%) across 2 independent vaults with different curators
- **Satellites: $3,498 (22.4%)** - Wildcat private credit + Pendle PT token

**Satellite status:**
- Position 1: Wildcat Wintermute @ 10.5% APY ($1,441) - TVL normalized after Nov spike
- Position 2: Pendle PT-sUSDai @ 15.0% APY ($2,057) - Matures Feb 19, 2026
- Position 3: TBD (~$500-700 remaining allocation)

### Growth (30.1% = $6,734)

| Asset | Network | Balance | Value | APY | Status |
|-------|---------|---------|-------|-----|--------|
| wstETH | Ethereum | 1.857 wstETH | $6,734 | 2.57% | ✅ Active |

### Gas Reserves (Not in portfolio %)

| Network | Token | Amount | Value | Notes |
|---------|-------|--------|-------|-------|
| Ethereum L1 | ETH | ~0.002 ETH | ~$7 | Minimal - add if needed |
| Base | ETH | ~0.001 ETH | ~$3.50 | For Base transactions |
| Arbitrum | ETH | ~0.001 ETH | ~$3.50 | For Arbitrum transactions |

---

## DeFiLlama Pool References

| Position | DeFiLlama Symbol | Pool ID | DeFiLlama URL |
|----------|------------------|---------|---------------|
| Euler V2 USDC (Arbitrum) | USDC | 91a13ad5-0687-4d6f-a789-da86b149d817 | [view](https://defillama.com/yields/pool/91a13ad5-0687-4d6f-a789-da86b149d817) |
| Aave V3 SGHO (Ethereum) | SGHO | ff2a68af-030c-4697-b0a1-b62a738eaef0 | [view](https://defillama.com/yields/pool/ff2a68af-030c-4697-b0a1-b62a738eaef0) |
| Pendle PT-sUSDai (Arbitrum) | SUSDAI | 43a38685-aa22-4d99-9c2f-bd34a980de01 | [view](https://defillama.com/yields/pool/43a38685-aa22-4d99-9c2f-bd34a980de01) |
| Morpho Gauntlet USDC Prime (Base) | GTUSDCP | e0672197-9f3e-4414-bca5-e6b4c90aa469 | [view](https://defillama.com/yields/pool/e0672197-9f3e-4414-bca5-e6b4c90aa469) |
| Morpho Steakhouse USDC (Base) | STEAKUSDC | 7820bd3c-461a-4811-9f0b-1d39c1503c3f | [view](https://defillama.com/yields/pool/7820bd3c-461a-4811-9f0b-1d39c1503c3f) |
| Spark USDS Savings (Ethereum) | SUSDS | d8c4eff5-c8a9-46fc-a888-057c4c668e72 | [view](https://defillama.com/yields/pool/d8c4eff5-c8a9-46fc-a888-057c4c668e72) |
| Wildcat Wintermute USDC (Ethereum) | WMTUSDC | 57885844-7b3f-49b3-969b-9405b165fa78 | [view](https://defillama.com/yields/pool/57885844-7b3f-49b3-969b-9405b165fa78) |
| Lido wstETH (Ethereum) | STETH | 747c1d2a-c668-4682-b9f9-296708a3dd90 | [view](https://defillama.com/yields/pool/747c1d2a-c668-4682-b9f9-296708a3dd90) |

---

## Performance

### Current APY (December 19, 2025)

| Position | Value | APY | Annual Yield |
|----------|-------|-----|--------------|
| Euler V2 USDC | $3,450 | 6.16% | $213 |
| Aave SGHO | $3,005 | 5.71% | $172 |
| Pendle PT-sUSDai | $2,057 | 15.00% | $309 |
| Morpho GTUSDCP | $1,904 | 5.63% | $107 |
| Morpho STEAKUSDC | $1,902 | 5.63% | $107 |
| Spark SUSDS | $1,881 | 4.00% | $75 |
| Wildcat Wintermute | $1,441 | 10.50% | $151 |
| wstETH | $6,734 | 2.57% | $173 |
| **Total** | **$22,375** | **5.84%** | **$1,306** |

**Blended Stablecoin APY:** 7.28% ✅ (target: 6-8%)  
**Blended Portfolio APY:** 5.84% ✅ (target: 5-7%)  
**Monthly Passive Income:** ~$109/month (£86/month)  
**Daily Passive Income:** ~$3.58/day

### Performance vs Target

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Stablecoin APY | 6-8% | 7.28% | ✅ In target range |
| Portfolio APY | 5-7% | 5.84% | ✅ In target range |
| Annual yield | - | $1,306 | ✅ On track |
| 70/30 split | 70/30 | 69.9/30.1 | ✅ Perfect |

---

## Compliance Status

| Rule | Target | Current | Status |
|------|--------|---------|--------|
| Max per protocol | 25% | 22.1% (Euler) | ✅ Met |
| Min protocols | 4 | 7 total (5 core + 2 satellites) | ✅ Exceeded |
| Anchor minimum | 15% | 31.2% (SGHO + Spark) | ✅ Exceeded |
| 70/30 split | 70/30 | 69.9/30.1 | ✅ Perfect |
| Morpho combined | <25% | 24.3% | ✅ Within limit |

**Diversification notes:**
- 8 active positions across 7 protocol families
- 5 core protocols: Aave, Spark, Morpho (2 vaults), Euler V2
- 2 satellites: Wildcat, Pendle
- Morpho: 2 vaults with different curators (Gauntlet, Steakhouse) - now under 25% combined
- No single position exceeds 22.1% of stablecoins
- All concentration limits now compliant

---

## Network Allocation

| Network | Stablecoins | wstETH | Total | % |
|---------|-------------|--------|-------|---|
| Ethereum L1 | $7,327 | $6,734 | $14,061 | 58.4% |
| Arbitrum | $5,507 | $0 | $5,507 | 24.6% |
| Base | $3,806 | $0 | $3,806 | 17.0% |
| **Total** | **$15,641** | **$6,734** | **$22,375** | 100% |

**Network diversification:** 58% L1, 25% Arbitrum, 17% Base ✅ Well balanced

**Changes from Dec 13:**
- Arbitrum exposure increased from 16% to 24.6% (Euler growth)
- Ethereum decreased from 62% to 58.4%
- Base decreased from 23% to 17%

---

## Recent Changes (Dec 13-19)

### Deposits Made

1. **Euler V2 USDC (Arbitrum):** Added ~$1,558
   - Now largest stablecoin position at $3,450
   - Best risk/reward in core portfolio (6.16% APY, stable)
   
2. **wstETH (Ethereum):** Added ~0.121 tokens
   - Staked 0.148 ETH → wstETH
   - Total now 1.857 wstETH ($6,734)
   - Maintains 30% growth allocation

### Performance Impact

- Stablecoin APY: 7.80% → 7.28% (-0.52%, more capital at lower rates)
- Total portfolio APY: 6.13% → 5.84% (-0.29%, expected with growth)
- Annual income: $1,014 → $1,306 (+$292, +29%)
- Monthly passive: $85 → $109 (+$24)

---

## Wildcat Position Analysis (Dec 19)

**TVL context from DeFiLlama chart:**
- Mid-November: Spiked to ~$55M (yield chasers piling in)
- Current: $39.3M (returned to October baseline)
- This is "hot money leaving after spike" not "distress exodus"

**Key health indicators:**
- APY: Rock solid 10.50% throughout (Wintermute hasn't missed)
- Borrower: Wintermute CEO is Wildcat silent partner
- Protocol: No incidents, payments on schedule

**Assessment:** TVL -25% metric was misleading in isolation. Position healthy. Continue holding.

---

## Upcoming Actions

| Date | Action | Priority |
|------|--------|----------|
| Dec 26 | Weekly deposit #5 (£1,500) | High |
| Dec 28 | Monthly review + strategy assessment | High |
| Jan 2026 | Evaluate satellite position #3 options | Medium |
| Feb 19, 2026 | Pendle PT-sUSDai maturity | High |

**Next deposit allocation (Dec 26):**
- Continue growing Euler toward 25% cap
- Maintain 70/30 split
- Consider if 3rd satellite position warranted

---

## Satellite Strategy Progress

### Current State (2 of 3 Deployed)

| Position | Protocol | Mechanism | Amount | APY | Status |
|----------|----------|-----------|--------|-----|--------|
| 1 | Wildcat | Wintermute private credit | $1,441 | 10.50% | ✅ Deployed Dec 10 |
| 2 | Pendle | PT-sUSDai (fixed-rate) | $2,057 | 15.00% | ✅ Deployed Dec 11 |
| 3 | TBD | TBD | ~$500-700 | TBD | 🔄 Decision pending |

**Target allocation:** ~$3,500-4,000 total across 3 positions  
**Currently deployed:** $3,498 (22.4% of stables) ✅

**Mechanism diversification achieved:**
- Private credit (Wildcat): Borrower default risk
- Fixed-rate tokenization (Pendle): Smart contract + maturity risk
- Third position TBD: Consider Ethena, Morpho isolated markets, or hold

---

## Risk Status

### Protocol Risk Breakdown

| Risk Type | Exposure | Mitigation |
|-----------|----------|------------|
| **Aave codebase** | 31.2% (SGHO + Spark) | Anchor tier, 8+ years operational |
| **Morpho vaults** | 24.3% (2 curators) | Different curators, now under 25% |
| **Euler V2** | 22.1% (USDC vault) | Established tier, dual oversight |
| **Wildcat protocol** | 9.2% (Wintermute) | Emerging tier, private credit |
| **Pendle protocol** | 13.2% (PT-sUSDai) | Established tier, fixed-rate token |

### Expected Annual Loss

**Calculation:**
- Core positions (5 protocols, 78%): ~1.5% expected loss = $183/year
- Wildcat position (9.2%): ~4% expected loss = $58/year
- Pendle position (13.2%): ~2.5% expected loss = $51/year
- **Total expected loss:** ~$292/year

**Actual annual yield:** $1,306/year  
**Net after expected losses:** ~$1,014/year (4.5% net APY)

---

## Quick Reference

### Protocol URLs

| Protocol | URL | Networks |
|----------|-----|----------|
| Euler V2 | app.euler.finance | Ethereum, Arbitrum |
| Pendle | app.pendle.finance | Ethereum, Arbitrum |
| Wildcat | app.wildcat.finance | Ethereum |
| Aave V3 | app.aave.com | Ethereum, Base, Arbitrum |
| Spark | app.spark.fi | Ethereum |
| Morpho | app.morpho.org | Ethereum, Base, Arbitrum |
| Lido (wstETH) | stake.lido.fi | Ethereum |
| DeBank | debank.com | Portfolio tracking |
| DeFiLlama | defillama.com/yields | Yield research |

### Wallet Address

**Wallet 1:** 0x661cac5d1685ea8a4d33f2dfcf112cb7d541a27f

---

## Key Metrics at a Glance

| Metric | Value |
|--------|-------|
| **Total Portfolio** | $22,375 (£17,580) |
| **Stablecoin APY** | 7.28% |
| **Total APY** | 5.84% |
| **Monthly Income** | $109 (£86) |
| **Annual Income** | $1,306 (£1,026) |
| **Deployed / Target** | £17,580 / £40,000 (44.0%) |
| **Active Protocols** | 7 (Euler, Pendle, Wildcat, Morpho x2, Aave, Spark, Lido) |
| **Core Protocols** | 5 (Aave, Spark, Morpho x2, Euler) |
| **Satellites** | 2 (Wildcat, Pendle) |
| **Network Split** | 58% L1, 25% Arbitrum, 17% Base |
| **Largest Position** | 22.1% (Euler V2 USDC) |
| **Smallest Position** | 9.2% (Wildcat) |

---

**Document Version:** 7.0  
**Last Updated:** December 19, 2025  
**Major Changes:**
- Euler V2 grew to $3,450 (22.1% of stables) - now second largest position
- wstETH increased to 1.857 tokens ($6,734)
- Portfolio reached $22,375 (44% of £40k target)
- All concentration limits now compliant
- 70/30 split achieved (69.9/30.1)
- Wildcat TVL decline analyzed - position healthy

**Next Update:** After Dec 26 weekly deposit or significant position changes  
**Next Review:** Dec 28 monthly review
