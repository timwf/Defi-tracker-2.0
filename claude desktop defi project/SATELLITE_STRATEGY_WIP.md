# Satellite Strategy (Work in Progress)

**Status:** Research & Planning  
**Created:** December 8, 2025  
**Target Launch:** After core reaches 80% allocation  
**Review Cadence:** Weekly during buildout

---

## Overview

**Core-Satellite Split:**
- **Core (80%):** Conservative protocols, 4-6% APY, quarterly monitoring
- **Satellite (20%):** Higher-yield protocols, 7-15% APY, monthly monitoring

**Purpose:**
- Increase blended APY from 4.98% to 6-8% target range
- Accept calculated risk on small positions
- Maintain downside protection via diversification

---

## Current Status (Dec 8, 2025)

| Metric | Value | Notes |
|--------|-------|-------|
| Total portfolio | $12,389 | - |
| Stablecoins | $8,832 (71%) | Subject to 80/20 split |
| stETH | $3,558 (29%) | Core growth component (not in split) |
| Current blended APY | 4.27% | Below 6-8% target |

**Core-Satellite Split (80/20 of Total Portfolio):**

| Allocation | $ Amount | % of Portfolio | Status |
|------------|----------|----------------|--------|
| Core stablecoins | $6,194 | 50% | Current positions |
| Satellite stablecoins | $2,478 | 20% | To be deployed |
| stETH (growth engine) | $3,717 | 30% | Non-negotiable |
| **Core total** | **$9,911** | **80%** | - |
| **Satellite total** | **$2,478** | **20%** | - |

**Note:** 70/30 stable/stETH split maintained (50% core + 20% satellite = 70% stables)

**Current issue:** Stablecoin core yielding 4.98%, but stETH at 2.6% drags blended to 4.27%. Satellite strategy addresses yield gap.

---

## Allocation Framework

### Core (80% = $9,911)

**Breakdown:**
- Core stablecoins: $6,194 (50% of total)
- stETH: $3,717 (30% of total)

**Protocols:** Aave, Morpho (premium curators), Spark, stETH  
**Target APY:** Stables 4-6%, stETH 2.5-3.5%  
**Tiers:** Anchor + Established only  
**Monitoring:** Quarterly  
**Max per protocol:** 25% of stablecoins

### Satellite (20% = $2,478)

**Split across:** 4-6 positions  
**Per position:** $413-620 (3.3-5.0% of portfolio)  
**Target APY:** 8-15%  
**Tiers:** Emerging + Experimental  
**Monitoring:** Monthly  
**Max per position:** 5.5% of portfolio (hard ceiling)

**Position sizing:**

| Satellites | Per Position | % of Portfolio | Loss if 100% failure |
|------------|--------------|----------------|----------------------|
| 4 positions | $620 | 5.0% | $620 |
| 5 positions | $496 | 4.0% | $496 |
| 6 positions | $413 | 3.3% | $413 | protocol:** 25% of stablecoins

### Satellite (20% = ~$2,478)

**Split across:** 4-6 positions  
**Per position:** $413-620 (3.3-5.0% of portfolio)  
**Target APY:** 7-15%  
**Tiers:** Emerging + Experimental  
**Monitoring:** Monthly  
**Max per position:** 5.5% of portfolio (hard ceiling)

---

## Expected Performance

### Blended APY Scenarios

**Current baseline:** 4.27% blended
- Core stables: $8,832 @ 4.98% = $440/year
- stETH: $3,558 @ 2.6% = $92/year

**With satellite deployment:**

| Core Stables | stETH | Satellite APY | Blended | Gain vs Current |
|--------------|-------|---------------|---------|-----------------|
| 5% | 2.6% | 8% | 4.88% | +0.61% |
| 5% | 2.6% | 10% | 5.29% | +1.02% |
| 5% | 2.6% | 12% | 5.68% | +1.41% |
| 5% | 2.6% | 15% | 6.29% | +2.02% |

**Reality check:**
- Target 6-8% blended requires satellites averaging **15%+** consistently
- More realistic: 10-12% satellites â†’ 5.3-5.7% blended
- Still moves you closer to target, but won't fully close gap alone
- If stETH appreciation adds 3-5% annually, total return improves significantly

**Key insight:** Satellites alone won't hit 6-8% target. The strategy is:
1. Satellites boost stablecoin yield to 5.5-6%
2. stETH price appreciation adds 3-5% over time
3. Combined: 6-8%+ total portfolio return

### Risk Budget

**Per position loss tolerance:** 
- 4 satellites: $620 loss = 5% of portfolio (recoverable in 2-3 weeks)
- 5 satellites: $496 loss = 4% of portfolio (recoverable in 2 weeks)
- 6 satellites: $413 loss = 3.3% of portfolio (recoverable in 1-2 weeks)

**Total satellite loss scenario:** $2,478 (20% of portfolio, sets back ~8 weeks of deposits)

**Expected annual loss:** 
- Assuming 10% failure rate per satellite position
- 5 satellites Ã— 10% = 50% probability of one failure per year
- Expected loss: 50% Ã— $496 = ~$248/year
- Acceptable if satellites generate >$248 additional yield annually

---

## Satellite Selection Criteria

### Must Have (Hard Requirements)

| Criteria | Threshold | Rationale |
|----------|-----------|-----------|
| **APY (organic)** | â‰¥7% | Must beat core meaningfully |
| **TVL** | â‰¥$5M | Minimum liquidity/validation |
| **Organic %** | â‰¥85% | Sustainable yield |
| **History** | â‰¥60 days | Track record required |
| **Volatility** | <3.0 | Limit erratic behavior |
| **TVL trend** | Not declining >30% | Capital exodus = red flag |

### Diversification Requirements

- Max 2 positions from same protocol family
- Max 2 positions from same chain
- Different mechanisms preferred (lending, vaults, savings)
- Different stablecoins acceptable

### Research Checklist (Per Candidate)

- [ ] Protocol age and team background
- [ ] Audit history (minimum 2 audits)
- [ ] Community activity (Discord/Twitter)
- [ ] TVL trend (growth/stable vs declining)
- [ ] Exploit history (any unresolved incidents = reject)
- [ ] Correlation with existing positions

---

## Candidates Under Research

**Status:** Gathering initial list from DeFiLlama

### Ethereum/L2 Candidates

| Pool | Protocol | Chain | APY | TVL | Organic | Status |
|------|----------|-------|-----|-----|---------|--------|
| - | - | - | - | - | - | Not started |

### Solana Candidates

| Pool | Protocol | Chain | APY | TVL | Organic | Status |
|------|----------|-------|-----|-----|---------|--------|
| USDC | loopscale | Solana | 8.72% | $6.3M | 94% | Research needed |
| USDC | save | Solana | 6.97% | $4.1M | 100% | Research needed |
| SUSDU | unitas | Solana | 13.97% | $22.3M | 100% | Research needed |

**Next step:** Expand search to 10-15 candidates, filter to best 4-6

---

## Deployment Plan

### Phase 1: Complete Core Buildout (Weeks 1-2)

**Goal:** Core reaches 80% of portfolio

| Action | Amount | Timeline |
|--------|--------|----------|
| Continue weekly deposits to core | Â£1,200/week | 2 weeks |
| Portfolio grows to ~$14,500 | +$2,100 | By Dec 21 |
| Core = 80%, Satellite = 0% | - | Ready for Phase 2 |

### Phase 2: Initial Satellite Deployment (Weeks 3-8)

**Goal:** Deploy satellites at $413-620 each (depending on 4-6 position choice)

**Weekly allocation (Â£1,500):**
- Â£750 (50%) â†’ Core stablecoin positions
- Â£300 (20%) â†’ Satellite deployment
- Â£450 (30%) â†’ stETH (maintains growth engine)

**Result:** 70/30 stable/stETH split maintained

**Deployment approach:**
- Start each satellite with Â£200-300 test amount
- Monitor for 2-3 weeks
- Scale to Â£400-500 if stable
- One satellite at a time (sequential, not parallel)

**Timeline:**
- 4 satellites: 5-6 weeks to deploy
- 6 satellites: 8-9 weeks to deploy

---

## Risk Management Rules

### Exit Triggers (Immediate)

- TVL drops >30% in 30 days
- Organic % falls below 70%
- Unexplained APY spike >5% in 7 days
- Security incident or exploit
- Team goes silent >2 weeks

### Monitoring Cadence

**Monthly review (satellites only):**
- Check all exit triggers
- Calculate actual APY earned
- Review community sentiment
- Update this document

**Action on failure:**
- Exit to core (Aave) immediately
- Don't try to "fix" failing satellites
- Log lesson learned

### Position Sizing Discipline

- If satellite grows beyond 5.5% of portfolio â†’ trim to 5%
- If satellite yield drops to core levels â†’ exit and redeploy
- Never exceed 20% total in satellites (hard rule)

---

## Deployment Checklist

### Before First Satellite Deployment

- [ ] Core allocation at 80%+ of portfolio
- [ ] 4-6 satellites researched and approved
- [ ] Test amounts calculated (Â£200-300 per satellite)
- [ ] Monthly monitoring workflow established
- [ ] Exit criteria clearly understood

### Per Satellite Deployment

- [ ] Research completed (checklist above)
- [ ] Protocol URLs and contract addresses verified
- [ ] Initial test deposit (Â£200-300)
- [ ] Position visible in DeBank
- [ ] Added to monthly monitoring list
- [ ] 2-week observation period begins

---

## Success Metrics

### Month 1 (Post-deployment)

- [ ] All satellites deployed at target amounts
- [ ] No exit triggers hit
- [ ] Blended APY >5.5%
- [ ] Monthly monitoring workflow smooth

### Month 3

- [ ] Blended APY consistently >6%
- [ ] Zero or one satellite failure (acceptable)
- [ ] Core remains stable at 80%
- [ ] Documented lessons learned

### Month 6

- [ ] Blended APY trend toward 6-8%
- [ ] Satellite strategy validated or adjusted
- [ ] Clear ROI vs additional monitoring time
- [ ] Strategy documented for scaling

---

## Open Questions

**Resolved:**

1. **Satellite allocation basis: 20% of total portfolio** âœ“
   - Decision: 20% of total ($2,478) rather than 20% of stables only
   - Rationale: Larger satellites ($413-620 each) create meaningful yield impact
   - stETH remains 30% - this is the growth engine, non-negotiable
   - 70/30 stable/stETH split maintained (50% core + 20% satellite = 70% stables)

**To resolve before Phase 2:**

1. **Final satellite count:** 4, 5, or 6 positions?
   - 4 = simpler to monitor, larger positions ($620 each)
   - 6 = more diversified, smaller loss per failure ($413 each)
   - Decision: TBD based on candidate quality

2. **Network split:** How much Solana vs Ethereum ecosystem?
   - Pure Ethereum: Protocol risk only
   - Include Solana: Network diversification, but adds complexity
   - Decision: TBD after candidate research

3. **Deployment pace:** Sequential or parallel?
   - Sequential: One satellite at a time, slower but careful
   - Parallel: Deploy 2-3 simultaneously, faster but riskier
   - Decision: Start sequential, accelerate if confident

---

## Next Actions

**Immediate (Week of Dec 8):**
- [ ] Expand DeFiLlama search (7-15% APY, $5M+ TVL)
- [ ] Export 10-15 candidates for evaluation
- [ ] Begin protocol research on top 6-8 candidates
- [ ] Decide final satellite count (4, 5, or 6)

**Week of Dec 15:**
- [ ] Complete research on finalists
- [ ] Rank candidates by risk/reward
- [ ] Select final 4-6 satellites
- [ ] Verify core at 80% allocation
- [ ] Prepare for first test deployment

**Week of Dec 22:**
- [ ] Deploy first satellite (Â£200-300 test)
- [ ] Begin 2-week monitoring period
- [ ] Continue core deposits (Â£1,200/week)

---

## Document Updates

| Date | Change | Notes |
|------|--------|-------|
| Dec 8, 2025 | Initial draft | Framework established, research phase |
| Dec 8, 2025 | Allocation decision | 20% of total portfolio ($2,478), maintains 70/30 split |

---

**Document Version:** 0.2 (WIP)  
**Status:** Allocation model finalized, entering candidate research phase  
**Next Update:** After candidate research complete  
**Related Docs:** RISK_FRAMEWORK.md, STRATEGY_4.md, DEPLOYMENT_PLAN_3.md
