# Wildcat Protocol - Private Credit Markets

**Version:** 1.0  
**Created:** December 10, 2025  
**Category:** Satellite Strategy - Emerging Tier  
**Mechanism:** Undercollateralized private credit  
**Status:** Research complete, deployment pending

---

## Executive Summary

**What it is:** DeFi marketplace enabling undercollateralized lending between institutional borrowers and lenders. You lend USDC/USDT directly to specific entities (market makers, funds), not to anonymous pooled borrowers.

**Key distinction:** Risk is **borrower default**, not protocol exploit. You're making a credit decision on the entity, similar to corporate bond investing.

**Target APY:** 13-16% (organic, sustainable)  
**Risk level:** Medium-High (Emerging tier)  
**Satellite allocation:** 2-3 vaults @ Â£400-500 each = Â£1,200-1,500 total

---

## Protocol Overview

### The Problem Wildcat Solves

**Traditional DeFi lending (Aave, Compound):**
- Requires 150%+ overcollateralization
- Capital inefficient for borrowers
- Anonymous borrowers, pooled risk

**TradFi private credit:**
- Slow (weeks to deploy)
- Requires banking relationships
- Opaque terms
- Restricted to institutions

**Wildcat solution:**
- Undercollateralized (0-50% collateral)
- Instant deployment
- Transparent terms (all onchain)
- Direct borrower-lender relationship

### How It Works

```
Borrower Side:
1. KYC verification through Wildcat
2. Create lending vault with custom parameters:
   - Interest rate (e.g., 14%)
   - Maximum capacity (e.g., $50M)
   - Reserve ratio (% kept liquid)
   - Withdrawal cycle length
   - Whitelisted lenders
   - Optional legal agreement
3. Lenders deposit â†’ Borrower withdraws
4. Pay interest + maintain reserves
5. Eventually repay principal

Lender Side (You):
1. Get whitelisted by borrower (or open market)
2. Deposit USDC/USDT
3. Receive rebasing vault token (e.g., "WildcatHyper_USDC")
4. Earn interest (auto-compounds via rebase)
5. Request withdrawal â†’ queue â†’ receive funds
```

### What Makes It "Wildcat"

- **Undercollateralized:** Borrower puts up 0-50% collateral (vs Aave's 150%+)
- **Borrower sets all terms:** They control every parameter
- **Protocol doesn't underwrite:** Wildcat provides rails, doesn't vouch for borrowers
- **Free market:** If terms are bad, no one lends
- **Each vault = different borrower:** Independent credit decisions

---

## Team & Backing

### Founders

| Person | Role | Background |
|--------|------|------------|
| **Laurence Day** | CEO | "Crypto Twitter" figure, vocal post-FTX on credit opacity |
| **Dillon Kellar** | Co-founder | Indexed Finance founder |
| **Evgeny Gaevoy** | Silent partner | Wintermute CEO |

### Funding History

| Round | Amount | Date | Investors |
|-------|--------|------|-----------|
| Pre-seed | $750k | May 2023 | Wintermute Ventures |
| Seed | $1.1M | Aug 2024 | Cobie's Echo platform |
| Seed extension | $3.5M | Sep 2025 | Robot Ventures (lead), Polygon Ventures, Safe Foundation, Hyperithm, Kronos Research |

**Total raised:** $5.3M  
**Valuation:** $35M post-money (Sep 2025)  
**Status:** Profitable (per CEO, Sep 2025)

**Angel investors:** Joey Santoro (Fei), Charles Cooper (Vyper core), Andrew Koller (Ink)

### Thesis

*"Capital leverage is the heart of the modern world, and credit expansion fuels growth. Wildcat was created to allow the world the opportunity to participate in private credit markets typically restricted to inner circles, on terms visible to all."*

---

## Security Status

### Audit History

| Date | Auditor | Scope | Findings | Status |
|------|---------|-------|----------|--------|
| Oct 2023 | Code4rena | V1 Protocol | 6 High, 10 Medium | âœ… Fixed |
| Aug 2024 | Code4rena | V2 Protocol | 1 High, 8 Medium | âœ… Fixed + mitigation review |
| Aug 2024 | Geistermeister | Independent | 2 Medium, 2 Low | âœ… Fixed |

**Total:** 3 comprehensive audits, all findings addressed

### Exploit History

**Zero exploits** since mainnet launch (December 2023, ~1 year live)

Verified across:
- CertiK hack database
- Rekt News
- DeFi exploit trackers
- Code4rena reports

### Bug Bounty

Active on **Immunefi** platform (live bug bounty program signals ongoing security commitment)

### Known Issues (Resolved)

From V1 audit, edge cases around:
- Sanctioned address handling (Chainalysis integration)
- Market parameter validation
- All flagged pre-launch, fixed before deployment

**Assessment:** Strong security posture for 1-year-old protocol. Clean production record.

---

## Available Vaults

### Current Landscape (Dec 2025)

**14 vaults available** across different borrowers. Key options:

| Borrower | Vault | APY | TVL | Volatility | Status |
|----------|-------|-----|-----|------------|--------|
| **Hyperithm** | HyperWildcatUSDT | 16.0% | $10M | 0.0 Ïƒ | âœ… Stable |
| **Hyperithm** | HyperWildcatUSDC | 16.0% | $9M | 0.0 Ïƒ | âœ… Stable |
| **Hyperithm** | HyperPrivateUSDC | 14.2% | $30M | 3.4 Ïƒ | âœ… Largest |
| **AUROS** | AUROS_USDC | 14.3% | $7-12M | 0.9 Ïƒ | âœ… Market maker |
| **ELK Finance** | ELK_USDC | 13.1% | $10M | - | âœ… Lower rate |

**Note:** Each vault = different borrower = independent credit risk

### Confirmed Borrowers (Public)

| Entity | Type | Size | Reputation |
|--------|------|------|------------|
| **Wintermute** | Market maker | $2B+ AUM | âœ… Top-tier |
| **Amber Group** | Trading firm | Institutional | âœ… Established |
| **Hyperithm** | DeFi fund | - | âœ… Known |
| **Selini Capital** | Hedge fund | - | âœ… Known |
| **Keyrock** | Market maker | - | âœ… Known |

**Scale (Sep 2025):**
- $368M total loans originated
- ~$150M currently outstanding
- Protocol is profitable

---

## Why Yields Make Sense

### TradFi Context

**Corporate credit spreads:**
- AAA bonds: ~6-7% total (Treasury + 0.5-1%)
- BBB bonds: ~8-9% total (Treasury + 2-3%)
- High-yield: ~10-14% total (Treasury + 4-7%)

**Private credit (non-traded):**
- Direct lending: 10-15%
- Special situations: 15-25%
- Premium for: illiquidity, negotiation leverage, direct relationship

### Wildcat's 13-16% APY Reflects

| Factor | Impact |
|--------|--------|
| **Undercollateralized** | +4-6% vs overcollateralized DeFi |
| **Crypto entity risk** | +2-3% vs TradFi equivalent |
| **Limited recourse** | +1-2% (can sue, but recovery uncertain) |
| **Market maker/fund** | +1-2% (not investment-grade public company) |

**Why borrowers pay it:**
- **Speed:** Deploy capital instantly vs months for TradFi credit
- **No bank:** Avoid traditional relationships/reporting
- **Flexible terms:** Set their own parameters
- **Crypto-native:** Lenders understand the model
- **Reputation:** Onchain transparency, can't hide defaults

**Comparison:**
- Aave: 3-5% â†’ overcollateralized, protocol risk
- Morpho: 5-8% â†’ optimized overcollateralized
- Wildcat: 13-16% â†’ undercollateralized, credit risk

**Bottom line:** Not a yield hack or temporary incentive. This is the market price for unsecured crypto credit.

---

## Risk Analysis

### 1. Borrower Default Risk (Highest Priority)

**What it means:** Borrower (e.g., Hyperithm) goes bankrupt, can't repay

**Impact:** Lose 100% of your position in that specific vault

**Probability estimate:** 
- Private credit typically sees 2-5% annual default rates
- Crypto entities likely higher: 5-10% range
- Use 7% as planning assumption

**Mitigation:**
- Diversify across 3 borrowers (not 1 vault with 100%)
- Prefer recognizable names (Wintermute > unknown entity)
- Monitor borrower health via TVL trends, community sentiment
- Accept risk as part of private credit allocation

**Reality check:** If deploying Â£1,500 across 3 vaults @ Â£500 each:
- 7% annual default Ã— Â£500 = Â£35 expected loss per vault
- 3 vaults = ~Â£105 total expected annual loss
- 15% APY on Â£1,500 = Â£225 yield
- Net: Â£120/year after expected defaults

**Math works if you accept the risk.**

### 2. Protocol Age (Medium-High)

**Issue:** Only 1 year live (Dec 2023 launch)

**Concern:** 
- Untested in severe market stress
- No track record through bear market
- Withdrawal mechanics unproven at scale

**Mitigation:**
- Start small (Â£400-500 per vault)
- Monitor first 2-3 months closely
- Scale only if stable
- Treat as Emerging tier (higher risk tolerance)

**Timeline:** Move to Established tier if survives 18+ months with no major incidents

### 3. Opaque Borrower Information (Medium)

**Issue:** No standardized financial disclosure requirements

**Concern:**
- Can't assess borrower creditworthiness like TradFi bond
- Limited public information on financial health
- Asymmetric information (borrower knows more than you)

**Mitigation:**
- Lend to recognizable entities with public presence
- Watch TVL as proxy for market confidence
- Monitor social channels for warning signs
- Treat higher APY as compensation for opacity

**Comparison:**
- TradFi private credit: quarterly financials, covenants, monitoring
- Wildcat: onchain transparency only, limited recourse

### 4. Withdrawal Queue Risk (Medium)

**Issue:** If vault has insufficient reserves, withdrawals enter queue

**Scenario:**
- Vault has $10M deposits, $8M borrowed out
- Reserve ratio = 20% â†’ should have $2M liquid
- If $3M withdrawal requests â†’ queue forms
- Wait for borrower to repay or new deposits

**Typical wait:** Unknown (protocol untested under stress)

**Mitigation:**
- Don't rely on instant liquidity (this is satellites, not emergency fund)
- Monitor reserve ratios before depositing
- Prefer vaults with lower utilization

### 5. Smart Contract Risk (Lower Priority vs Default Risk)

**Issue:** Any DeFi protocol can have exploits

**Assessment:**
- 3 audits completed
- 1 year with no incidents
- Bug bounty active
- Founders have industry reputation

**Mitigation:**
- Already covered by diversification (not putting Â£10k into one vault)
- Monitor security channels
- Exit if any incident occurs

**Priority:** Lower than borrower default risk (the bigger concern)

### 6. Regulatory Risk (Unknown)

**Issue:** Undercollateralized lending might attract scrutiny

**Concerns:**
- SEC could view as unregistered securities
- KYC requirements might expand
- Jurisdiction uncertainty

**Mitigations in place:**
- Borrowers must KYC (not anonymous)
- Institutional-only borrowing (no retail)
- Legal agreements optional (adds formality)

**Action:** Monitor but don't block deployment. Regulation could go either way.

---

## Comparison Matrix

### Wildcat vs Core Protocols

| Factor | Aave | Morpho | Wildcat |
|--------|------|--------|---------|
| **Mechanism** | Pooled lending | Optimized pooled | Direct private credit |
| **Collateral** | 150%+ | 150%+ | 0-50% |
| **Primary risk** | Smart contract | Smart contract + curator | Borrower default |
| **Secondary risk** | Oracle manipulation | Vault strategy | Smart contract |
| **APY range** | 3-5% | 5-8% | 13-16% |
| **Default scenario** | Protocol socializes | Vault-specific loss | Lender loses 100% |
| **Borrower** | Anonymous | Anonymous | Known entity (KYC'd) |
| **Recourse** | Liquidation bot | Liquidation + curator | Legal (sue borrower) |
| **Maturity** | 8+ years | 2+ years | 1 year |
| **Tier** | Anchor | Established | Emerging |

**Key insight:** Core protocols = betting math works. Wildcat = betting borrower doesn't default.

### Why Different Vaults Have Different Rates

**HyperWildcat 16% vs ELK Finance 13.1%:**

Factors determining rate:

| Factor | Impact on Rate |
|--------|----------------|
| **Credit quality** | Lower risk borrower â†’ lower rate |
| **Collateral** | Some vaults may have partial collateral â†’ lower rate |
| **Market competition** | More lenders want in â†’ rate drops |
| **Reserve ratio** | Higher reserve = less capital efficiency â†’ borrower pays more |
| **Borrower urgency** | Need capital fast â†’ willing to pay premium |

**Each vault = separate credit decision.** You're not picking "Wildcat"â€”you're picking "lend to Hyperithm at 16%" vs "lend to AUROS at 14%."

---

## How to Use Wildcat

### Prerequisites

- Ethereum wallet (MetaMask, etc.)
- USDC or USDT on Ethereum mainnet
- ETH for gas (~Â£5-10 for deposit + withdrawal)

### Deposit Process

1. **Go to app.wildcat.finance**
2. **Connect wallet**
3. **Browse available markets**
   - Filter by asset (USDC, USDT)
   - Review borrower profile
   - Check APY, capacity, reserve ratio
4. **Select vault to lend to**
5. **Review terms:**
   - Interest rate
   - Reserve ratio
   - Withdrawal cycle length
   - Any legal agreement required
6. **Deposit**
   - Approve USDC/USDT (first time only)
   - Enter amount
   - Confirm transaction
7. **Receive vault token**
   - Token rebases to reflect interest
   - Balance increases automatically

**Gas cost:** ~Â£2-5 for approval + deposit

### Withdrawal Process

1. **Request withdrawal**
   - Specify amount
   - Enters withdrawal cycle
2. **Wait for cycle completion**
   - Typical: 1-7 days depending on vault settings
   - If insufficient reserves, enters queue
3. **Execute withdrawal**
   - Claim USDC/USDT to wallet
   - Pay gas (~Â£2-3)

**Timeline:** Usually 1-7 days, potentially longer if queue forms

### Monitoring Your Position

**Check regularly:**
- Vault token balance (should increase with interest)
- Reserve ratio (low reserves = potential withdrawal delays)
- Borrower activity (are they still engaged?)
- TVL trends (exodus = warning sign)

**Where to check:**
- app.wildcat.finance dashboard
- DeBank (may show position)
- Etherscan (vault token contract)

---

## Integration with Satellite Strategy

### Allocation Framework

**Recommended:** 2-3 vaults @ Â£400-500 each = Â£1,200-1,500 total

| Metric | Value |
|--------|-------|
| % of total portfolio | 8-10% |
| % of satellites | 48-60% |
| % of stablecoins | 13-17% |
| Risk per vault | Â£400-500 max loss |

**Rationale:**
- Large enough to meaningfully boost blended APY
- Small enough that single vault failure is recoverable
- Diversified across multiple borrowers

### Recommended Vault Combinations

**Option A: Conservative Mix (Prefer this)**

| Vault | Amount | APY | Rationale |
|-------|--------|-----|-----------|
| **AUROS USDC** | Â£400 | 14.3% | Market maker, lower rate = higher perceived quality |
| **ELK Finance USDC** | Â£400 | 13.1% | Lowest APY = likely most creditworthy |
| **HyperPrivateUSDC** | Â£400 | 14.2% | Largest vault ($30M), most liquidity |
| **Total** | **Â£1,200** | **13.9%** | 3 independent borrowers |

**Option B: Aggressive Mix**

| Vault | Amount | APY | Rationale |
|-------|--------|-----|-----------|
| **HyperWildcatUSDC** | Â£500 | 16.0% | Premium yield, zero volatility |
| **HyperWildcatUSDT** | Â£500 | 16.0% | Stablecoin diversification |
| **AUROS USDC** | Â£500 | 14.3% | Balance with known market maker |
| **Total** | **Â£1,500** | **15.4%** | Higher yield, more concentration in Hyperithm |

**My recommendation:** Option A. Spread across 3 different borrowers, lower concentration risk.

### Deployment Sequence

**Week 1: Research (Â£300 total)**
1. Deploy Â£100 to AUROS vault
2. Deploy Â£100 to ELK Finance vault
3. Deploy Â£100 to HyperPrivate vault
4. Monitor for 2-3 weeks

**Validation checklist:**
- All deposits executed smoothly
- Vault tokens received correctly
- Interest accruing as expected
- No withdrawal queue issues reported
- Borrowers still active

**Week 4-5: Scale (if validated)**
- Scale AUROS to Â£400
- Scale ELK to Â£400
- Scale HyperPrivate to Â£400
- Total: Â£1,200 deployed

**Timeline:** 4-5 weeks from first test to full deployment

---

## Monthly Monitoring Checklist

### Vault Health (Each Position)

- [ ] **APY stable?**
  - >5% drop sustained â†’ investigate
  - Sudden spike â†’ potential distress signal

- [ ] **TVL stable or growing?**
  - >20% decline in 30 days â†’ yellow flag
  - >30% decline â†’ red flag, consider exit

- [ ] **Reserve ratio healthy?**
  - At or above vault minimum â†’ âœ… healthy
  - Below minimum â†’ borrower in penalty phase

- [ ] **Withdrawal queue status**
  - No queue â†’ âœ… normal
  - Queue present â†’ monitor size and wait time

### Borrower Health

- [ ] **Protocol announcements**
  - Check Wildcat Discord/Twitter
  - Any borrower communications?

- [ ] **Market activity**
  - Are they still actively borrowing?
  - Any position changes?

- [ ] **Community sentiment**
  - Discord discussions about specific borrowers
  - Any concerns being raised?

### Performance Tracking

- [ ] **Actual APY earned**
  - Compare to expected
  - Calculate monthly rate
  - Update tracking spreadsheet

- [ ] **Interest accrual**
  - Vault token balance increasing as expected?
  - Compounding working correctly?

### Action Triggers

| Signal | Action |
|--------|--------|
| APY drops to <10% sustained | Investigate, consider reallocation |
| TVL drops >30% in 30 days | Exit to Aave, research cause |
| Withdrawal queue >7 days | Monitor closely, pause new deposits |
| Borrower goes silent >2 weeks | Yellow flag, prepare to exit |
| Any security incident | Immediate exit to Aave |

---

## Exit Strategy

### Normal Rebalancing

**Scenario:** Better opportunity elsewhere, or vault underperforming

**Process:**
1. Request withdrawal from vault
2. Wait for withdrawal cycle
3. Execute withdrawal
4. Redeploy to new target

**Timeline:** 1-7 days + transaction time

### Emergency Exit

**Triggers:**
- Security incident (protocol or borrower)
- Borrower bankruptcy/insolvency
- Unexpected regulatory action
- Extreme market stress

**Process:**
1. Request withdrawal immediately
2. Accept any queue delay
3. DO NOT panic-sell vault tokens on secondary market (likely poor pricing)
4. Wait for withdrawal to complete
5. Move to Aave for safety

**Important:** Wildcat vault tokens may not have liquid secondary markets. Don't expect to "sell" your position quickly.

### Partial Exit

**Scenario:** Reduce exposure but maintain position

**Process:**
1. Request partial withdrawal (e.g., reduce from Â£500 to Â£300)
2. Complete withdrawal cycle
3. Keep remaining position active

**Use case:** Rebalancing satellites, reducing single vault concentration

---

## Expected Performance

### Baseline Scenario (Conservative)

**Assumptions:**
- 3 vaults @ Â£400 each = Â£1,200
- Blended APY: 13.9%
- Annual default probability: 7% per vault

**Math:**
```
Annual yield: Â£1,200 Ã— 13.9% = Â£167
Expected loss: 3 vaults Ã— 7% Ã— Â£400 = Â£84
Net expected: Â£167 - Â£84 = Â£83/year

Net APY: Â£83 / Â£1,200 = 6.9%
```

**Result:** 6.9% net APY after expected defaults. Beats core stablecoin yield (4-5%) by ~2-3%.

### Optimistic Scenario

**Assumptions:**
- No defaults in Year 1
- Full 13.9% APY earned

**Math:**
```
Annual yield: Â£1,200 Ã— 13.9% = Â£167/year
Monthly passive: Â£14/month from Wildcat alone
```

### Pessimistic Scenario

**Assumptions:**
- 1 vault defaults (100% loss)
- Other 2 vaults perform normally

**Math:**
```
Loss: Â£400 (one vault)
Gain: Â£800 Ã— 13.9% = Â£111
Net: Â£111 - Â£400 = -Â£289

Net annual return: -24%
```

**Recovery time:** ~2 weeks of total portfolio deposits to replace lost capital

### Impact on Total Portfolio

**Current portfolio:** Â£12,389  
**After Wildcat deployment:** Â£12,389 + Â£1,200 = Â£13,589

**Blended APY shift:**
```
Without Wildcat:
- Core stables: Â£8,832 @ 4.98% = Â£440/year
- stETH: Â£3,558 @ 2.6% = Â£92/year
- Total: Â£532/year = 4.3% blended

With Wildcat (optimistic):
- Core stables: Â£7,632 @ 4.98% = Â£380/year
- Wildcat: Â£1,200 @ 13.9% = Â£167/year
- stETH: Â£3,558 @ 2.6% = Â£92/year
- Total: Â£639/year = 5.2% blended

Gain: +0.9% blended APY
```

**Key insight:** Wildcat alone would boost total portfolio APY by ~1%, even after budgeting for defaults.

---

## Questions to Answer Before Deploying

### Critical Information

1. **Who exactly is behind HyperWildcat vaults?**
   - Confirm Hyperithm entity details
   - Check public presence, reputation
   - Any other DeFi activity?

2. **What legal agreements exist?**
   - Do these vaults require signing loan agreements?
   - What jurisdiction governs?
   - What recourse in default?

3. **How do withdrawal queues actually work?**
   - Typical wait time when queue forms?
   - Priority system (FIFO)?
   - Can borrower force extensions?

4. **Collateral status per vault:**
   - Does AUROS post any collateral?
   - Are any vaults partially collateralized?
   - Or all 0%?

5. **Historical performance:**
   - Has any vault had payment delays?
   - Any withdrawal issues to date?
   - Any borrower disputes?

### Where to Find Answers

- **Wildcat Discord:** Community discussions, team responses
- **Borrower profiles:** app.wildcat.finance market pages
- **DeFi forums:** Reddit r/DeFi, Bankless Discord
- **Direct outreach:** Message Wildcat team on Discord/Telegram

---

## Pros & Cons Summary

### Pros âœ…

- **Novel mechanism:** Genuine diversification from Aave/Morpho/Euler
- **Sustainable yields:** Not temporary incentives, actual credit spreads
- **Multiple borrowers:** Can spread across 3+ independent entities
- **Institutional borrowers:** Wintermute, Amber, etc. = recognizable
- **Clean track record:** 1 year, no exploits, $368M originated
- **Organic APY:** 100% organic, zero token rewards
- **Strong backing:** $5.3M raised, Robot Ventures, Polygon, etc.
- **Multiple audits:** 3 comprehensive security reviews
- **Profitable:** Protocol generating revenue, sustainable model

### Cons âŒ

- **Borrower default risk:** If entity fails, lose 100% of that vault
- **Newer protocol:** Only 1 year live, untested in stress
- **Opaque credit assessment:** No standardized borrower disclosures
- **Withdrawal queues:** Can form if low reserves, uncertain wait times
- **Limited recourse:** Suing crypto entity is messy, recovery uncertain
- **No secondary market:** Can't quickly sell vault tokens for exit
- **Regulatory unknown:** Undercollateralized lending may face scrutiny
- **Requires research:** Each vault = independent credit decision

---

## Final Assessment

### Verdict: âœ… Fits Satellite Strategy

**Wildcat Protocol qualifies for satellites** with conditions:

**Strengths:**
- Legitimate private credit infrastructure
- Institutional backing and borrowers
- Clean security record
- Sustainable yield economics (13-16% APY)
- Novel mechanism (true diversification)

**Requirements for inclusion:**
- Diversify across 3 borrowers (not 1-2)
- Start small (Â£100 tests first)
- Accept borrower default risk as part of strategy
- Monitor monthly (not quarterly like core)
- Position size discipline (Â£400-500 max per vault)

**If comfortable with private credit risk:** Deploy Â£1,200 across 3 vaults
**If prefer pure stablecoin exposure:** Skip Wildcat, use other satellites

### Next Actions

**Before deployment:**
1. [ ] Research Hyperithm, AUROS, ELK Finance entities
2. [ ] Join Wildcat Discord, read recent discussions
3. [ ] Check if any vaults require legal agreement signing
4. [ ] Verify withdrawal mechanics and typical timelines
5. [ ] Review any recent borrower communications

**Week 1 deployment:**
1. [ ] Deploy Â£100 to AUROS
2. [ ] Deploy Â£100 to ELK
3. [ ] Deploy Â£100 to HyperPrivate
4. [ ] Monitor for 2-3 weeks

**Week 4-5 scaling:**
1. [ ] If validated, scale to Â£400 each
2. [ ] Total: Â£1,200 deployed
3. [ ] Add to monthly monitoring checklist

---

## Related Documents

| Document | Relevance |
|----------|-----------|
| **RISK_FRAMEWORK.md** | Tier definitions, Emerging tier allocation rules |
| **SATELLITE_STRATEGY_WIP.md** | Overall satellite strategy and allocation |
| **STRATEGY_4.md** | Total portfolio context |
| **WEEKLY_WORKFLOW.md** | How satellites integrate with weekly deposits |

---

## Document Updates

| Date | Change | Notes |
|------|--------|-------|
| Dec 10, 2025 | Initial creation | Research complete, deployment pending |

---

**Document Version:** 1.0  
**Status:** Research complete, ready for deployment decision  
**Review cadence:** Monthly after deployment  
**Next review:** After first deployment (or if no deployment, delete this doc)
