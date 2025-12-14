# Deployment Plan - Weekly Strategy

**Version:** 3.0  
**Updated:** November 28, 2025  
**Timeline:** November 2025 - July 2026 (~8-9 months)  
**Deployment:** Ã‚Â£1,500/week from bank capital  
**Stop condition:** Bank balance reaches Ã‚Â£10k minimum buffer  
**Network:** Ethereum L1 (primary), Arbitrum (legacy Morpho position)

---

## Strategic Change (November 28, 2025)

### From Monthly to Weekly Deployment

**Previous plan:** Ã‚Â£8,000/month for 5 months  
**New plan:** Ã‚Â£1,500/week until bank hits Ã‚Â£10k buffer

### Why Weekly is Better

| Factor | Monthly Ã‚Â£8k | Weekly Ã‚Â£1,500 |
|--------|-------------|---------------|
| Rebalancing | Once per month | Natural weekly correction |
| Protocol testing | Large commitment upfront | Ã‚Â£1,500 test before scaling |
| Concentration risk | Can build up between deposits | Corrects within 1-2 weeks |
| Flexibility | Locked into large chunks | Adjust pace as needed |
| Risk management | Larger position sizes while learning | Smaller mistakes while learning L1 |
| Timeline | 5 months | 8-9 months (acceptable tradeoff) |

### Capital Flow

```
Bank account (current: ~Ã‚Â£35k above buffer)
    Ã¢â€ â€œ
Ã‚Â£1,500/week withdrawal
    Ã¢â€ â€œ
Deploy to protocols
    Ã¢â€ â€œ
STOP when bank = Ã‚Â£10k buffer

Plus: Ã‚Â£1,500/month savings continues accumulating
```

**Estimated deployment capacity:** ~Ã‚Â£25-30k over 8-9 months before hitting buffer

---

## Current Status (November 28, 2025)

### Deployed Capital

| Protocol | Network | Value | % of Stables | Notes |
|----------|---------|-------|--------------|-------|
| Euler V2 Prime | L1 | $3,248 | 57% | Over limit, fixing |
| Morpho Gauntlet | Arbitrum | $1,872 | 33% | Holding |
| Aave V3 | L1 | $569 | 10% | Anchor position |
| **Total Stables** | | **$5,689** | | |
| wstETH | Bridging to L1 | $2,646 | - | Arriving ~Dec 3 |
| **Total Portfolio** | | **~$8,335** | | Ã‚Â£6,563 |

### Deployment Progress

| Metric | Value |
|--------|-------|
| Total target | Ã‚Â£40,000 |
| Deployed | Ã‚Â£6,563 (16.4%) |
| Remaining | Ã‚Â£33,437 |
| Weekly rate | Ã‚Â£1,500 |
| Weeks to complete | ~22 weeks |
| Expected completion | ~April-May 2026 |

---

## Weekly Deployment Schedule

### Phase 1: Fix Concentration (Weeks 1-4)

**Goal:** Get Euler under 25%, add 4th protocol

| Week | Date | Amount | Allocation | Euler % After |
|------|------|--------|------------|---------------|
| 1 | Nov 30 | Ã‚Â£1,500 | Morpho + Aave (50/50) | ~45% |
| 2 | Dec 7 | Ã‚Â£1,500 | Morpho + Aave + research | ~38% |
| 3 | Dec 14 | Ã‚Â£1,500 | Add 4th protocol (Compound?) | ~32% |
| 4 | Dec 21 | Ã‚Â£1,500 | Balance across 4 protocols | ~28% Ã¢Å“â€¦ |

**End of Phase 1:** 
- Euler compliant (<25%)
- 4 stablecoin protocols active
- ~Ã‚Â£12,500 deployed

### Phase 2: Build Diversification (Weeks 5-12)

**Goal:** Reach target allocation across 4-5 protocols

| Week | Allocation Strategy |
|------|---------------------|
| 5-8 | Equal split across 4 protocols |
| 9-12 | Add 5th protocol if compelling opportunity |

**End of Phase 2:**
- ~Ã‚Â£18,500 deployed
- 4-5 protocols at near-equal allocation
- Framework tested and validated

### Phase 3: Scale to Target (Weeks 13-22+)

**Goal:** Complete Ã‚Â£40k deployment maintaining diversification

| Week | Allocation Strategy |
|------|---------------------|
| 13-22+ | Maintain equal splits, weekly rebalancing |

**End of Phase 3:**
- Ã‚Â£40k deployed
- 4-5 protocols, each 15-25% of stables
- 70/30 stable/wstETH split
- Framework operating smoothly

---

## Weekly Execution Checklist

### Before Each Deposit (10 minutes)

1. **Check portfolio status**
   - [ ] Open DeBank, record current values
   - [ ] Calculate current allocation percentages
   - [ ] Check for circuit breakers (wstETH 15-55% range)

2. **Calculate deposit split**
   - [ ] Apply 70/30 formula for stable/wstETH split
   - [ ] Identify underweight stablecoin protocols
   - [ ] Determine allocation per protocol

3. **Quick risk check**
   - [ ] Any protocol red flags this week?
   - [ ] APY changes significant?
   - [ ] Community sentiment OK?

### Execution (20-30 minutes)

1. **Transfer to Kraken**
   - [ ] Ã‚Â£1,500 from bank to Kraken
   - [ ] Wait for arrival (1-2 hours, can do other steps)

2. **Buy crypto**
   - [ ] Buy USDC (stablecoin portion)
   - [ ] Buy ETH (wstETH portion)

3. **Withdraw to wallet**
   - [ ] **VERIFY: Ethereum Mainnet selected**
   - [ ] Withdraw USDC to Wallet 1
   - [ ] Withdraw ETH to Wallet 1

4. **Deploy to protocols**
   - [ ] Supply USDC to target protocols per allocation
   - [ ] Swap ETH Ã¢â€ â€™ wstETH (if wstETH portion)
   - [ ] Verify all transactions on Etherscan

### After Deposit (5 minutes)

- [ ] Screenshot DeBank for records
- [ ] Update tracking
- [ ] Note any observations

**Total time:** 35-45 minutes per week

---

## Protocol Selection

### Current Protocols (3)

| Protocol | Tier | Network | Role |
|----------|------|---------|------|
| Aave V3 | Anchor | L1 | Safety, instant liquidity |
| Morpho Gauntlet | Established | Arbitrum | Yield optimization |
| Euler V2 | Established | L1 | Yield optimization |

### 4th Protocol Candidates

| Protocol | Tier | Pros | Cons | Correlation |
|----------|------|------|------|-------------|
| **Compound V3** | Anchor | Different codebase, 7+ years | Lower APY | Ã¢Å“â€¦ Independent |
| Spark | Established | MakerDAO backing | Aave fork | Ã¢ÂÅ’ Correlated |
| Fluid | Emerging | Know it, good APY | Exited recently | Ã¢Å“â€¦ Independent |
| Silo V2 | Emerging | Isolated pools | Newer | Ã¢Å“â€¦ Independent |

**Recommendation:** Compound V3 for 4th slot (different codebase, Anchor tier, adds diversification)

### 5th Protocol (Future)

Evaluate after 4-protocol structure stable. Consider:
- Higher APY Emerging tier option
- Only if compelling risk/reward
- Keep Emerging + Experimental Ã¢â€°Â¤40% combined

---

## Target Allocation (at Ã‚Â£40k)

### Stablecoins (70% = Ã‚Â£28,000)

| Protocol | Tier | Target % | Target Ã‚Â£ |
|----------|------|----------|----------|
| Aave V3 | Anchor | 15% | Ã‚Â£4,200 |
| Morpho | Established | 20% | Ã‚Â£5,600 |
| Euler V2 | Established | 20% | Ã‚Â£5,600 |
| Compound V3 | Anchor | 15% | Ã‚Â£4,200 |
| Protocol 5 (TBD) | Emerging | 0-15% | Ã‚Â£0-4,200 |

**Note:** Allocations will flex based on APY optimization rules. Above is baseline.

### Growth (30% = Ã‚Â£12,000)

| Asset | Target % | Target Ã‚Â£ |
|-------|----------|----------|
| wstETH | 30% | Ã‚Â£12,000 |

---

## Risk Guardrails

### Concentration Limits (Current Scale <Ã‚Â£20k)

| Rule | Limit | Current | Status |
|------|-------|---------|--------|
| Max per protocol | 25% | 57% (Euler) | Ã¢ÂÅ’ Fixing |
| Min protocols | 3 | 3 | Ã¢Å“â€¦ OK |
| Anchor minimum | 15% | 10% | Ã°Å¸Å¸Â¡ Building |

### Enforcement

**If any protocol exceeds 25%:**
- Next 2 deposits go 100% elsewhere
- No new capital to overweight protocol until compliant

**If adding new protocol:**
- Maximum Ã‚Â£1,500 initial deposit (1 week)
- Scale only after 2+ weeks of monitoring

---

## On-Ramp Process

### Revolut Ã¢â€ â€™ Kraken Ã¢â€ â€™ L1 Wallet

**Step 1: Bank to Kraken**
- Transfer Ã‚Â£1,500 from bank account
- Wait 1-2 hours for arrival
- Cost: Free

**Step 2: Buy on Kraken**
- Buy USDC for stablecoin portion
- Buy ETH for wstETH portion
- Cost: ~0.16-0.26% fee

**Step 3: Withdraw to L1**
- **CRITICAL: Select "Ethereum (ERC20)" network**
- Enter Wallet 1 address
- Confirm withdrawal
- Cost: ~$2-5 per withdrawal

**Total cost:** ~0.3-0.8% + $2-5 per deployment (~Ã‚Â£8-15 per week)

---

## Key Dates

| Date | Event | Action |
|------|-------|--------|
| Nov 30, 2025 | Week 1 deposit | Fix Euler concentration |
| Dec 3, 2025 | wstETH arrives | Claim from bridge |
| Dec 3, 2025 | Fusaka mainnet | Monitor L1 gas |
| Dec 7, 2025 | Week 2 deposit | Continue rebalancing |
| Dec 14, 2025 | Week 3 deposit | Add 4th protocol |
| Dec 28, 2025 | End of Phase 1 | Review framework |
| Apr-May 2026 | Target completion | Ã‚Â£40k deployed |

---

## Adjustment Triggers

### Pause Deployment If:

- Protocol security incident (any position)
- L1 gas spikes >20 gwei sustained
- Personal financial emergency
- Market conditions require reassessment

### Accelerate Deployment If:

- Exceptional yield opportunity (>10% sustainable)
- Tax-advantaged timing
- Strong conviction on market timing

### Extend Timeline If:

- Bank buffer approaching Ã‚Â£10k
- Need to slow capital outflow
- Life circumstances change

---

## Success Metrics

### Week 4 (End of Phase 1)

- [ ] Euler <25% of stablecoins
- [ ] 4 protocols active
- [ ] Weekly workflow smooth
- [ ] ~Ã‚Â£12,500 deployed

### Week 12 (End of Phase 2)

- [ ] All protocols within target ranges
- [ ] 4-5 protocols active
- [ ] Framework validated
- [ ] ~Ã‚Â£18,500 deployed

### Week 22+ (Completion)

- [ ] Ã‚Â£40,000 deployed
- [ ] 70/30 stable/wstETH
- [ ] 4-5 protocols, each 15-25%
- [ ] Generating Ã‚Â£200+/month passive

---

**Document Version:** 3.0  
**Last Updated:** November 28, 2025  
**Major Change:** Monthly Ã¢â€ â€™ Weekly deployment strategy  
**Supersedes:** DEPLOYMENT_PLAN_2.md  
**Next Review:** December 28, 2025
