# Current Status

> **⚠️ CRITICAL:** When updating this document, always use DeFiLlama-friendly naming:
> 
> - Use DeFiLlama **symbol** (e.g., GTUSDCP, not "Gauntlet USDC Prime")
> - Include **pool_id** for each position
> - Include DeFiLlama **URL** for easy cross-reference
> - This enables direct comparison with yield tool outputs

**Last Updated:** December 16, 2025  
**Portfolio Value:** $18,251 (£14,371)  
**Phase:** Core expansion complete, concentration fixed

---

## Portfolio Summary

| Category | Value | % | Target | Status |
|----------|-------|---|--------|--------|
| Stablecoins | $12,773 | 70.0% | 70% | ✅ Perfect |
| wstETH | $5,478 | 30.0% | 30% | ✅ Perfect |
| **Total Deployed** | **$18,251** | 100% | | |

**Changes since Dec 13:**
- Weekly £1,500 deposit deployed (~$1,300 to Euler, ~$400 to wstETH)
- Euler scaled from $592 (5.2%) to $1,891 (14.8% of stables)
- wstETH increased from 1.338 to 1.533 tokens
- Concentration issue fully resolved—all positions now 11-16% of stables
- 70/30 split now perfect (was 69.4/30.6)
- Portfolio +$1,708 (+10.3%) from deposits

---

## Active Positions

### Stablecoins (70.0% = $12,773)

| Protocol | DeFiLlama Symbol | Network | Value | % of Stables | APY | Annual Yield | Pool ID | Status |
|----------|------------------|---------|-------|--------------|-----|--------------|---------|--------|
| **Pendle** | **SUSDAI** | **Arbitrum** | **$2,041** | **16.0%** | **15.00%** | **$306** | 43a38685-aa22-4d99-9c2f-bd34a980de01 | **🟡 Satellite - PT token** |
| Morpho | GTUSDCP | Base | $1,903 | 14.9% | 5.60% | $107 | e0672197-9f3e-4414-bca5-e6b4c90aa469 | ✅ Gauntlet curator |
| Morpho | STEAKUSDC | Base | $1,901 | 14.9% | 5.61% | $107 | 7820bd3c-461a-4811-9f0b-1d39c1503c3f | ✅ Steakhouse curator |
| Euler V2 | USDC | Arbitrum | $1,891 | 14.8% | 6.41% | $121 | 91a13ad5-0687-4d6f-a789-da86b149d817 | ✅ Scaled up |
| Spark | SUSDS | Ethereum | $1,881 | 14.7% | 4.25% | $80 | d8c4eff5-c8a9-46fc-a888-057c4c668e72 | ✅ MakerDAO backing |
| Aave V3 | SGHO | Ethereum | $1,715 | 13.4% | 5.71% | $98 | ff2a68af-030c-4697-b0a1-b62a738eaef0 | ✅ GHO savings |
| **Wildcat** | **WMTUSDC** | **Ethereum** | **$1,441** | **11.3%** | **10.50%** | **$151** | 57885844-7b3f-49b3-969b-9405b165fa78 | **🟡 Satellite - Wintermute** |
| **Total** | | | **$12,773** | 100% | **7.59%** | **$970** | | |

**Protocol breakdown:**
- Morpho: $3,804 (29.8%) across 2 independent vaults with different curators
- Aave/Spark: $3,596 (28.1%) - Spark is Aave V3 fork, shares codebase
- Euler V2: $1,891 (14.8%) - Scaled up from 5.2%, now within target
- **Satellites: $3,482 (27.3%)** - Wildcat private credit + Pendle PT token

**Concentration status:** ✅ All positions between 11-16% of stables. No position exceeds 25% limit.

### Growth (30.0% = $5,478)

| Asset | Network | Balance | Value | APY | Status |
|-------|---------|---------|-------|-----|--------|
| wstETH | Ethereum | 1.533 wstETH | $5,478 | 2.51% | ✅ Active |

### Gas Reserves (Not in portfolio %)

| Network | Token | Amount | Value | Notes |
|---------|-------|--------|-------|-------|
| Ethereum L1 | ETH | ~0.001 ETH | ~$4 | Low - add more if needed |
| Base | ETH | ~0.001 ETH | ~$4 | For Base transactions |
| Arbitrum | ETH | ~0.001 ETH | ~$4 | For Arbitrum transactions |

---

## DeFiLlama Pool References

| Position | DeFiLlama Symbol | Pool ID | DeFiLlama URL |
|----------|------------------|---------|---------------|
| Pendle PT-sUSDai (Arbitrum) | SUSDAI | 43a38685-aa22-4d99-9c2f-bd34a980de01 | [view](https://defillama.com/yields/pool/43a38685-aa22-4d99-9c2f-bd34a980de01) |
| Morpho Gauntlet USDC Prime (Base) | GTUSDCP | e0672197-9f3e-4414-bca5-e6b4c90aa469 | [view](https://defillama.com/yields/pool/e0672197-9f3e-4414-bca5-e6b4c90aa469) |
| Morpho Steakhouse USDC (Base) | STEAKUSDC | 7820bd3c-461a-4811-9f0b-1d39c1503c3f | [view](https://defillama.com/yields/pool/7820bd3c-461a-4811-9f0b-1d39c1503c3f) |
| Euler V2 USDC (Arbitrum) | USDC | 91a13ad5-0687-4d6f-a789-da86b149d817 | [view](https://defillama.com/yields/pool/91a13ad5-0687-4d6f-a789-da86b149d817) |
| Spark sUSDS (Ethereum) | SUSDS | d8c4eff5-c8a9-46fc-a888-057c4c668e72 | [view](https://defillama.com/yields/pool/d8c4eff5-c8a9-46fc-a888-057c4c668e72) |
| Aave V3 sGHO (Ethereum) | SGHO | ff2a68af-030c-4697-b0a1-b62a738eaef0 | [view](https://defillama.com/yields/pool/ff2a68af-030c-4697-b0a1-b62a738eaef0) |
| Wildcat Wintermute USDC (Ethereum) | WMTUSDC | 57885844-7b3f-49b3-969b-9405b165fa78 | [view](https://defillama.com/yields/pool/57885844-7b3f-49b3-969b-9405b165fa78) |
| Lido wstETH (Ethereum) | STETH | 747c1d2a-c668-4682-b9f9-296708a3dd90 | [view](https://defillama.com/yields/pool/747c1d2a-c668-4682-b9f9-296708a3dd90) |

---

## Performance

### Current APY (December 16, 2025)

| Position | Value | APY | Annual Yield |
|----------|-------|-----|--------------|
| Pendle PT-sUSDai | $2,041 | 15.00% | $306 |
| Morpho GTUSDCP | $1,903 | 5.60% | $107 |
| Morpho STEAKUSDC | $1,901 | 5.61% | $107 |
| Euler V2 USDC | $1,891 | 6.41% | $121 |
| Spark SUSDS | $1,881 | 4.25% | $80 |
| Aave SGHO | $1,715 | 5.71% | $98 |
| Wildcat Wintermute | $1,441 | 10.50% | $151 |
| wstETH | $5,478 | 2.51% | $137 |
| **Total** | **$18,251** | **6.07%** | **$1,107** |

**Blended Stablecoin APY:** 7.59% ✅ (target: 6-8%)  
**Blended Portfolio APY:** 6.07% ✅ (target: 5-7%)  
**Monthly Passive Income:** ~$92/month (£72/month)

### Performance vs Target

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Stablecoin APY | 6-8% | 7.59% | ✅ In target range |
| Portfolio APY | 5-7% | 6.07% | ✅ In target range |
| Annual yield | - | $1,107 | ✅ On track |
| 70/30 split | 70/30 | 70.0/30.0 | ✅ Perfect |

---

## Compliance Status

| Rule | Target | Current | Status |
|------|--------|---------|--------|
| Max per protocol | 25% | 16.0% (Pendle) | ✅ Met |
| Min protocols | 4 | 8 positions across 6 protocols | ✅ Exceeded |
| Anchor minimum | 15% | 28.1% (SGHO + Spark) | ✅ Exceeded |
| 70/30 split | 70/30 | 70.0/30.0 | ✅ Perfect |

**Diversification notes:**
- 8 positions across 6 protocol families
- 5 core protocols: Aave (SGHO), Spark (sUSDS), Morpho (2 vaults), Euler V2
- 2 satellites: Wildcat, Pendle
- Morpho: 2 vaults with different curators (Gauntlet, Steakhouse)
- Aave codebase: 2 instances (SGHO, Spark sUSDS) - acceptable correlation
- All positions between 11-16% of stablecoins ✅

---

## Network Allocation

| Network | Stablecoins | wstETH | Total | % |
|---------|-------------|--------|-------|---|
| Ethereum L1 | $5,037 | $5,478 | $10,515 | 57.6% |
| Arbitrum | $3,932 | $0 | $3,932 | 21.5% |
| Base | $3,804 | $0 | $3,804 | 20.8% |
| **Total** | **$12,773** | **$5,478** | **$18,251** | 100% |

**Network diversification:** 58% L1, 22% Arbitrum, 21% Base ✅ Well balanced

---

## Recent Changes (Dec 13-16)

### Deposit Allocation (£1,500)

1. **Euler V2 USDC (Arbitrum):** $592 → $1,891 (+$1,299)
   - Scaled from 5.2% to 14.8% of stables
   - Now within target allocation range

2. **wstETH:** 1.338 → 1.533 tokens (+0.195, ~$400)
   - Maintains 30% growth allocation

### Performance Impact

- Stablecoin APY: 7.80% → 7.59% (-0.21%, slight Euler dilution)
- Portfolio APY: 6.13% → 6.07% (-0.06%, stable)
- Annual income: $1,014 → $1,107 (+$93, +9.2%)
- Monthly passive: $84.50 → $92 (+$7.50)

### Concentration Fixed

Previous issue: Euler was overweight at 57% of stables (Dec 11)

Resolution timeline:
- Dec 11: 57% (post-migration from previous positions)
- Dec 13: 5.2% (repositioned)
- Dec 16: 14.8% ✅ Scaled to target range

All positions now 11-16% of stablecoins. No concentration violations.

---

## Risk Monitoring

### TVL Trends (30-day change)

| Position | TVL 30d Change | Status |
|----------|----------------|--------|
| GTUSDCP | +29.3% | ✅ Growing |
| SUSDS | +22.8% | ✅ Growing |
| STEAKUSDC | +6.3% | ✅ Growing |
| SGHO | +5.0% | ✅ Growing |
| wstETH | -4.0% | ✅ Stable |
| Euler USDC | -13.4% | 🟡 Monitor |
| **WMTUSDC** | **-21.9%** | **🟡 Monitor** |

**Euler USDC:** -13.4% TVL decline. Not yet concerning ($1.85M TVL still adequate for your position). Monitor next 30 days.

**Wildcat WMTUSDC:** -21.9% TVL decline ($41M → ~$32M implied). Watch for continued outflows. Still well above exit trigger (-30%).

### ML Predictions

| Position | Prediction | Confidence |
|----------|------------|------------|
| GTUSDCP | Down | 56% |
| STEAKUSDC | Down | 55% |
| Euler USDC | Stable/Up | 80% |
| SUSDS | Stable/Up | 70% |
| SGHO | Stable/Up | 85% |
| WMTUSDC | Stable/Up | 62% |
| SUSDAI | Stable/Up | 62% |
| wstETH | Stable/Up | 74% |

**Morpho vaults:** Slight downward pressure predicted. Expected given market-wide yield compression. Not actionable.

---

## Upcoming Actions

| Date | Action | Priority |
|------|--------|----------|
| Dec 21 | Weekly deposit #5 (£1,500) | High |
| Dec 21 | Monitor WMTUSDC TVL (continued decline?) | Medium |
| Dec 28 | Monthly review + document updates | High |
| Feb 19, 2026 | PT-sUSDai maturity | High |

**Next deposit allocation (Dec 21):**
- All positions now within 11-16% range
- Prioritize underweight positions: WMTUSDC (11.3%), SGHO (13.4%)
- Maintain 70/30 split

---

## Satellite Strategy Progress

### Current State (2 of 3 Deployed)

| Position | Protocol | Mechanism | Amount | APY | Status |
|----------|----------|-----------|--------|-----|--------|
| 1 | Wildcat | Wintermute private credit | $1,441 | 10.50% | ✅ Deployed Dec 10 |
| 2 | Pendle | PT-sUSDai (fixed-rate) | $2,041 | 15.00% | ✅ Deployed Dec 11 |
| 3 | TBD | TBD | ~$500-700 | TBD | 🔄 Decision pending |

**Target allocation:** ~$3,500-4,000 total across 3 positions  
**Currently deployed:** $3,482 (27.3% of stables) ✅

**Mechanism diversification achieved:**
- Private credit (Wildcat): Borrower default risk
- Fixed-rate tokenization (Pendle): Smart contract + maturity risk

**Next decision:** January 2026 after validating both satellites for 4+ weeks

---

## Key Metrics at a Glance

| Metric | Value |
|--------|-------|
| **Total Portfolio** | $18,251 (£14,371) |
| **Stablecoin APY** | 7.59% |
| **Total APY** | 6.07% |
| **Monthly Income** | $92 (£72) |
| **Annual Income** | $1,107 (£871) |
| **Deployed / Target** | £14,371 / £40,000 (35.9%) |
| **Active Positions** | 8 across 6 protocols |
| **Core Protocols** | 5 (Aave, Spark, Morpho x2, Euler) |
| **Satellites** | 2 (Wildcat, Pendle) |
| **Network Split** | 58% L1, 22% Arbitrum, 21% Base |
| **Largest Position** | 16.0% (Pendle PT-sUSDai) |
| **Smallest Position** | 11.3% (Wildcat WMTUSDC) |

---

## Historical Performance

### Portfolio Growth (Nov 10 - Dec 16, 2025)

| Date | Portfolio Value | Weekly Change | Notes |
|------|-----------------|---------------|-------|
| Nov 10 | ~$0 | - | Strategy start |
| Nov 24 | ~$6,500 | - | Initial positions |
| Dec 1 | $10,183 | +56.6% | Post-migration |
| Dec 6 | $12,389 | +21.7% | Added SGHO + deposit |
| Dec 10 | $12,719 | +2.7% | First satellite deployed |
| Dec 11 | $14,678 | +15.4% | Second satellite + Morpho swap |
| Dec 13 | $16,543 | +12.7% | Euler V2 added + wstETH increase |
| Dec 16 | $18,251 | +10.3% | Euler scaled + wstETH increase |

**36-day performance:** $0 → $18,251 (deployment phase)

**APY trajectory:**
- Dec 1: 4.3% blended (all core positions)
- Dec 6: 4.27% blended (stETH drag)
- Dec 10: 5.04% blended (Wildcat boost)
- Dec 11: 6.43% blended (Pendle boost) ✅
- Dec 13: 6.13% blended (wstETH dilution to 70/30)
- Dec 16: 6.07% blended (stable) ✅

---

**Document Version:** 7.0  
**Last Updated:** December 16, 2025  
**Major Changes:**
- Weekly £1,500 deposit deployed (Euler + wstETH)
- Euler scaled from 5.2% to 14.8% of stables
- wstETH increased from 1.338 to 1.533 tokens
- All positions now 11-16% of stables—concentration fully resolved
- 70/30 split now perfect (was 69.4/30.6)
- 8 positions across 6 protocol families

**Next Update:** After Dec 21 weekly deposit  
**Next Review:** Dec 28 monthly review
