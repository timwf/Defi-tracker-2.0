# Risk Framework

**Version:** 1.0  
**Finalized:** November 28, 2025  
**Purpose:** Protocol diversification and risk management rules

---

## Core Thesis

**Diversification paradox:** More protocols = higher probability of experiencing a loss, but lower severity per loss. Accept this tradeoff deliberately.

**Early-stage risk logic:** Take calculated risks when absolute stakes are low (Ã‚Â£10k loss is recoverable), de-risk as portfolio scales (Ã‚Â£100k loss is devastating). Learn cheap lessons now, not expensive ones later.

**Expected loss assumption:** Build the model assuming 1 protocol failure over the 15-year strategy lifetime. This isn't pessimism Ã¢â‚¬â€ it's realistic planning. Budget for it, don't be surprised by it.

---

## Risk Layers

### Layer 0: Systemic (Accept and Monitor)

| Risk | Mitigation | Action |
|------|------------|--------|
| ETH ecosystem collapse | None within DeFi | Monitor macro, accept exposure |
| USDC depeg | Could diversify stables | Accepting USDC concentration for simplicity |
| Ethereum consensus failure | None | Probability ~0, ignore |
| L1 gas spike return | L2 fallback exists | Monitor post-Fusaka, adapt if needed |

**Position:** Layer 0 risks are unavoidable while in ETH DeFi. Monitor but don't optimise for apocalypse.

### Layer 1: Protocol Risk (Mitigate via Diversification)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Smart contract exploit | 1-5% per protocol over 15 years | Total loss of position | Multiple protocols |
| Governance attack | <1% for established | Partial to total loss | Tier system, concentration limits |
| Oracle manipulation | <1% for Chainlink | Variable | Diversified oracle exposure |
| Economic attack | 1-3% for newer protocols | Variable | Tier system, TVL requirements |

**Position:** Protocol risk is the primary controllable risk. Mitigate through diversification and tier-based allocation.

### Layer 2: Position Risk (Mitigate via Allocation Rules)

| Risk | Mitigation |
|------|------------|
| Overconcentration | Scale-based max per protocol |
| Insufficient diversification | Minimum protocol counts |
| Chasing yield | Tier system caps exposure to riskier protocols |
| Emotional decisions | Mechanical rules, weekly enforcement |

---

## Protocol Tiers

### Anchor Tier (0.5% failure estimate)

**Criteria:**
- 5+ years operational
- $1B+ TVL
- No exploits in history
- 10+ security audits
- Battle-tested through multiple market cycles

**Protocols:** Aave, Compound

**Allocation:** 
- Minimum 15% of stablecoins (sleep-at-night money)
- No maximum (but opportunity cost if too high)

### Established Tier (2% failure estimate)

**Criteria:**
- 2+ years operational
- $100M+ TVL
- Clean security record (no unresolved exploits)
- 5+ security audits
- Institutional adoption signals

**Protocols:** Morpho (curated vaults), Euler V2 (established vaults), Spark

**Allocation:**
- Maximum 25% each (at current scale)
- Combined with Anchor can be up to 85%

### Emerging Tier (5% failure estimate)

**Criteria:**
- 1-2 years operational
- $20M+ TVL
- Strong audit coverage (3+ audits)
- Institutional backing preferred
- Active development and responsive team

**Protocols:** Fluid, newer Morpho/Euler vaults, Silo V2

**Allocation:**
- Maximum 15% each
- Combined Emerging + Experimental maximum 40%

### Experimental Tier (10% failure estimate)

**Criteria:**
- <1 year operational
- $10M+ TVL minimum
- At least 2 reputable audits
- Strong team/backing required
- High APY typically (compensation for risk)

**Protocols:** Case-by-case evaluation

**Allocation:**
- Maximum 10% each
- Maximum 20% total in Experimental
- Requires monthly monitoring

---

## Allocation Rules

### Scale-Based Concentration Limits

| Portfolio Size | Max per Protocol | Min Protocols | Rationale |
|----------------|------------------|---------------|-----------|
| <Ã‚Â£20k | 25% | 3 | Learning phase, simplicity matters |
| Ã‚Â£20-50k | 20% | 4 | Building diversification |
| Ã‚Â£50-100k | 15% | 5 | Meaningful absolute amounts |
| >Ã‚Â£100k | 12% | 6+ | Tail risk becomes critical |

**Current status:** <Ã‚Â£20k Ã¢â€ â€™ 25% max, 3-4 protocols

### Tier Allocation Constraints

| Constraint | Rule | Rationale |
|------------|------|-----------|
| Anchor minimum | Ã¢â€°Â¥15% of stablecoins | Sleep-at-night money, instant liquidity |
| Emerging + Experimental cap | Ã¢â€°Â¤40% combined | Limits tail risk exposure |
| Single protocol max | Per scale table above | No catastrophic single failure |
| Protocol floor | 10% minimum once added | Maintains meaningful diversification |

### Target Structure (4-5 Protocols)

| Slot | Tier | Target Allocation | Example |
|------|------|-------------------|---------|
| 1 | Anchor | 15-20% | Aave L1 |
| 2 | Established | 20-25% | Morpho (Arbitrum or L1) |
| 3 | Established | 20-25% | Euler V2 |
| 4 | Established/Emerging | 15-20% | Compound V3 or similar |
| 5 | Emerging (optional) | 10-15% | Higher APY option |

**wstETH:** Fixed 30% of total portfolio, exempt from stablecoin protocol limits.

---

## Expected Loss Budget

### Annual Loss Expectation

| Tier | Allocation | Failure Rate | Expected Loss |
|------|------------|--------------|---------------|
| Anchor | 15% | 0.5% | 0.075% |
| Established | 50% | 2% | 1.0% |
| Emerging | 20% | 5% | 1.0% |
| Experimental | 0% | 10% | 0% |
| **Total** | **85%** | - | **~2.1%** |

**Budgeted annual loss:** 1.5-2.5% of stablecoin portfolio from protocol failures

**Net expected return:** 6-8% gross APY - 2% expected loss = 4-6% net on stablecoins

**15-year expectation:** 1-2 protocol failures totaling 10-25% of one year's stablecoin value. Painful but not catastrophic.

### Loss Response Framework

| Actual Loss | Response |
|-------------|----------|
| <1% annual | On track, continue as planned |
| 1-3% annual | Within budget, review tier assignments |
| 3-5% annual | Concerning, reduce Emerging/Experimental exposure |
| >5% annual | Framework failure, comprehensive review |

---

## Weekly Deployment Integration

### How Weekly Ã‚Â£1,500 Deposits Enforce Rules

**Natural rebalancing:** Each deposit is allocated to maintain targets, not retrospectively fix drift. Concentration issues resolve within 2-3 weeks without selling.

**Protocol onboarding:** New protocols can be tested with single Ã‚Â£1,500 deposit before scaling. Low-risk way to expand to 4-5 protocols.

**Flexibility:** Weekly cadence allows rapid response to opportunities or concerns.

### Deposit Allocation Process

```
Weekly Ã‚Â£1,500 deposit Ã¢â€ â€™

1. Calculate 70/30 split (stables/wstETH)
   Ã¢â€ â€™ Ã‚Â£X to stablecoins, Ã‚Â£Y to wstETH

2. Check current protocol allocations against targets
   Ã¢â€ â€™ Identify underweight protocols

3. Allocate stablecoin portion to underweight protocols
   Ã¢â€ â€™ Prioritize: furthest below target first
   Ã¢â€ â€™ Respect tier constraints
   Ã¢â€ â€™ New protocol? Cap at Ã‚Â£1,500 initial test

4. Execute and verify

5. Update tracking
```

### Rebalancing via Deposits (Not Selling)

**Principle:** Use incoming capital to correct drift. Only sell when:
- Circuit breaker triggered (wstETH >55% or <15%)
- Protocol emergency (security incident)
- Concentration exceeds 2x target with no deposits planned

**Cost saving:** Avoids swap fees, slippage, and gas for rebalancing. Deposits are "free" rebalancing.

### Protocol Addition Process

**Week 1:** Research and due diligence (use Risk Research Protocol)
**Week 2:** Ã‚Â£1,500 test deposit
**Week 3-4:** Monitor, verify yields match expectations
**Week 5+:** Scale to target allocation via subsequent deposits

---

## 70/30 Portfolio Split

### Rule

Maintain 70% stablecoins / 30% wstETH across total portfolio.

### Weekly Calculation

```
Current portfolio: Ã‚Â£T
After deposit: Ã‚Â£(T + 1,500)

To stables: (T + 1,500) Ãƒâ€” 0.70 - [Current Stables]
To wstETH: (T + 1,500) Ãƒâ€” 0.30 - [Current wstETH]
```

### Circuit Breakers

| Trigger | Action | Urgency |
|---------|--------|---------|
| wstETH >55% | Sell wstETH Ã¢â€ â€™ USDC, restore 30% | Before next deposit |
| wstETH <15% | Sell USDC Ã¢â€ â€™ wstETH, restore 30% | Before next deposit |

**Note:** Circuit breakers are rare. ETH would need to ~2x or crash ~70% to trigger.

---

## Correlation Requirements

### Before Adding Any Protocol

```
Protocol: _______________
Tier: _______________
Proposed allocation: ___%

INDEPENDENCE CHECKS:
[ ] Different codebase than existing positions
[ ] Different oracle setup (or acceptable Chainlink concentration)
[ ] Different team/governance
[ ] Different primary auditors (nice-to-have)

EXISTING POSITION OVERLAP:
- Shares codebase with: _______________
- Shares oracle with: _______________
- Shares team with: _______________

VERDICT:
[ ] Truly independent Ã¢â‚¬â€ proceed
[ ] Partial overlap Ã¢â‚¬â€ acceptable because: _______________
[ ] Too correlated Ã¢â‚¬â€ reject or replace existing position
```

### Correlation Red Flags

| Overlap Type | Concern Level | Action |
|--------------|---------------|--------|
| Same codebase (fork) | High | Generally reject (e.g., Spark = Aave fork) |
| Same oracle | Medium | Accept if different codebase |
| Same auditor | Low | Accept, note for awareness |
| Same team | High | Treat as single protocol for limits |

---

## Emergency Procedures

### Graduated Response

| Signal | Response | Timeline |
|--------|----------|----------|
| APY drops significantly | Monitor, no action | - |
| Negative community sentiment | Pause new deposits | Immediate |
| TVL declining >20% | Reduce position 50% | Within 1 week |
| Unconfirmed exploit rumor | Pause deposits, prepare exit | Same day |
| Confirmed exploit | Full exit | Immediate |
| Team goes silent | Reduce to floor (10%) | Within 2 weeks |

### Immediate Exit Triggers

**Exit fully and immediately if:**
- Confirmed smart contract exploit
- Funds frozen or inaccessible
- Protocol team rugs or disappears
- Regulatory action freezing assets

**Don't wait for confirmation on:**
- Emerging/Experimental tier protocols
- Any protocol where you have >20% allocation

### Post-Exit Reallocation

1. Move to Anchor tier (Aave) temporarily
2. Assess what happened
3. Research replacement protocol
4. Reallocate over 2-4 weeks

---

## Network Diversification

### Current Approach

| Network | Allocation | Rationale |
|---------|------------|-----------|
| Ethereum L1 | ~75-80% | Primary deployment, lowest risk |
| Arbitrum | ~20-25% | Legacy Morpho position, genuine diversification |

### Why Keep Arbitrum Exposure

- Different sequencer infrastructure
- Different failure modes than L1
- Morpho Arbitrum yields remain competitive
- Not worth migration cost/risk to consolidate

### Network Risk Acceptance

- L1: Ethereum consensus risk (negligible)
- Arbitrum: Sequencer risk, bridge risk (low but non-zero)

---

## Current Implementation (November 28, 2025)

### Active Positions

| Protocol | Network | Value | % of Stables | Tier | Status |
|----------|---------|-------|--------------|------|--------|
| Euler V2 Prime | L1 | ~$3,248 | 57% | Established | Ã¢Å¡Â Ã¯Â¸Â Over limit |
| Morpho Gauntlet | Arbitrum | ~$1,872 | 33% | Established | Ã¢Å“â€¦ OK |
| Aave V3 | L1 | ~$569 | 10% | Anchor | Ã¢Å“â€¦ At floor |
| **Total Stables** | | **~$5,689** | 100% | | |
| wstETH | Bridging to L1 | ~$2,646 | - | Growth | Ã¢Å“â€¦ OK |

### Compliance Status

| Rule | Target | Current | Status |
|------|--------|---------|--------|
| Max per protocol | 25% | 57% (Euler) | Ã¢ÂÅ’ Fix in progress |
| Min protocols | 3 | 3 | Ã¢Å“â€¦ Met (add 4th soon) |
| Anchor minimum | 15% | 10% | Ã°Å¸Å¸Â¡ Below target, acceptable during buildout |
| 70/30 split | 70/30 | 68/32 | Ã¢Å“â€¦ Within tolerance |

### Remediation Plan

| Week | Action | Result |
|------|--------|--------|
| Week 1 (Nov 30) | Ã‚Â£1,500 Ã¢â€ â€™ 100% to Morpho + Aave | Euler drops to ~45% |
| Week 2 (Dec 7) | Ã‚Â£1,500 Ã¢â€ â€™ Morpho + Aave + research 4th | Euler drops to ~38% |
| Week 3 (Dec 14) | Ã‚Â£1,500 Ã¢â€ â€™ Add 4th protocol (Compound?) | Euler drops to ~32% |
| Week 4 (Dec 21) | Ã‚Â£1,500 Ã¢â€ â€™ Balance across 4 | Euler at ~28%, compliant |

---

## Monitoring Schedule

### Weekly (During Deposit)

- [ ] Check all protocol dashboards for anomalies
- [ ] Verify positions match tracking
- [ ] Calculate allocation percentages
- [ ] Allocate deposit to maintain targets
- [ ] Quick Discord/Twitter scan for red flags

**Time:** 15-20 minutes

### Monthly

- [ ] Full APY comparison across protocols
- [ ] Review if any protocol approaching tier change
- [ ] Check TVL trends (DeFiLlama)
- [ ] Assess if 4th/5th protocol should be added
- [ ] Update tracking spreadsheet

**Time:** 30-45 minutes

### Quarterly

- [ ] Framework effectiveness review
- [ ] Tier assignment validation
- [ ] Scale-based limit review (portfolio grown?)
- [ ] Correlation check (any new overlaps?)
- [ ] Expected vs actual loss comparison

**Time:** 1-2 hours

---

## Document History

| Date | Change |
|------|--------|
| Nov 27, 2025 | Initial WIP draft |
| Nov 28, 2025 | Finalized v1.0 Ã¢â‚¬â€ incorporated weekly deployment, scale-based limits, tier system |

---

## Review Schedule

**Next review:** December 28, 2025 (after 4 weeks of weekly deployment)

**Promote to v2.0:** After Q1 2026 (framework tested over full quarter)

---

**Document Version:** 1.0  
**Last Updated:** November 28, 2025  
**Supersedes:** REBALANCING_RULES.md (archived)
