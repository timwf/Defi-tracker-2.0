# Weekly Workflow (Updated for Yield Tracker)

**Version:** 2.0  
**Updated:** December 13, 2025  
**Time Required:** 30-40 minutes per week  
**Schedule:** Every Saturday (or consistent day of choice)  
**Changes from v1.0:** Replaces DeBank-first approach with Yield Tracker as primary interface

---

## Weekly Deposit Workflow (30-40 minutes)

### Step 1: Portfolio Check (5 minutes)

**Tool:** DeFi Yield Tracker â†’ Portfolio Dashboard

1. **Open yield tracker app**
   - Navigate to Portfolio tab
   - Review summary metrics at top

2. **Record current values:**

   | Metric | Value |
   |--------|-------|
   | Total value | $_____ |
   | Stablecoins | $_____ (___%) |
   | wstETH | $_____ (___%) |
   | Weighted APY | ___% |

3. **Check circuit breakers:**
   - wstETH >55%? â†’ STOP, manual rebalance first
   - wstETH <15%? â†’ STOP, manual rebalance first
   - Normal (15-55%)? â†’ Proceed

4. **Scan alerts (if any red badges visible):**
   - APY drops (vs 90-day average)
   - TVL declines (>20% in 30 days)
   - Low organic yield (<80%)
   - High volatility (Ïƒ >3.0)

**Verification (optional):**
- Cross-check total value with DeBank (should match within 1-2%)
- Only needed if numbers seem off or first time using tracker

### Step 2: Calculate Deposit Split (5 minutes)

**70/30 Formula:**
```
Current portfolio: $T = _____
After deposit: $(T + 1,500) = _____

Target stables: (T + 1,500) Ã— 0.70 = _____
Target wstETH: (T + 1,500) Ã— 0.30 = _____

To stables: Target stables - Current stables = $_____
To wstETH: Target wstETH - Current wstETH = $_____
```

**Tool:** Portfolio dashboard shows current allocation  
**Verify:** Stables + wstETH portions = Â£1,500 (Â±Â£5 rounding OK)

### Step 3: Allocate Stablecoin Portion (5 minutes)

**Tool:** Yield Tracker â†’ Pools view

1. **Load saved view:** "Current Positions" or "Core Protocols"
2. **Check allocation drift:**

   | Protocol | Current $ | Current % | Target % | Underweight? |
   |----------|-----------|-----------|----------|--------------|
   | Pendle PT-sUSDai | $_____ | ___% | 15-20% | Yes / No |
   | Morpho GTUSDCP | $_____ | ___% | 15-20% | Yes / No |
   | Morpho STEAKUSDC | $_____ | ___% | 15-20% | Yes / No |
   | Spark SUSDS | $_____ | ___% | 15-20% | Yes / No |
   | Aave SGHO | $_____ | ___% | 10-15% | Yes / No |
   | Wildcat WMTUSDC | $_____ | ___% | 10-15% | Yes / No |
   | Euler V2 USDC | $_____ | ___% | 5-10% | Yes / No |

3. **Allocation decision:**
   - If one protocol significantly underweight â†’ majority to that protocol
   - If roughly balanced â†’ equal split across underweight protocols
   - If adding new protocol â†’ cap at Â£1,500 test amount
   - Respect concentration limits (none >25% at current scale)

4. **This week's stablecoin split:**

   | Protocol | Amount | Rationale |
   |----------|--------|-----------|
   | _______ | Â£_____ | (e.g., "grow Euler from 5% to 8%") |
   | _______ | Â£_____ | |
   | _______ | Â£_____ | |
   | **Total** | **Â£_____** | |

### Step 4: Quick Risk Check (2 minutes)

**Tool:** Yield Tracker alerts + Discord/Twitter scan

- [ ] Any protocol announcements this week?
- [ ] Discord/Twitter red flags?
- [ ] APY changes >2% from last week for any position?
- [ ] TVL stable (no major outflows in tracked positions)?

**If any concerns:** Note below, consider adjusting allocation

**Notes:** _________________________________________________

### Step 5: Execute Deposit (15-20 minutes)

**5a. Transfer to Kraken**
- [ ] Open Revolut/bank app
- [ ] Send Â£1,500 to Kraken GBP deposit
- [ ] Confirm transfer initiated
- [ ] (Wait 1-2 hours or continue while waiting)

**5b. Buy on Kraken**
- [ ] Verify Â£1,500 arrived
- [ ] Buy Â£_____ USDC (stablecoin portion)
- [ ] Buy Â£_____ ETH (wstETH portion, if applicable)
- [ ] Confirm purchases complete

**5c. Withdraw to Wallet**
- [ ] Go to Funding â†’ Withdraw
- [ ] Select USDC
- [ ] **âš ï¸ VERIFY: Network = Ethereum (ERC20) or correct L2**
- [ ] Enter Wallet 1 address (0x661c...a27f)
- [ ] Enter amount
- [ ] Confirm withdrawal
- [ ] Repeat for ETH (if applicable)
- [ ] Wait 5-15 minutes for arrival
- [ ] Verify on Etherscan/Arbiscan/Basescan

**5d. Deploy to Protocols**

For each stablecoin protocol:
- [ ] Go to protocol dashboard (Aave, Morpho, Spark, etc.)
- [ ] **Verify: Correct network selected** (Ethereum/Base/Arbitrum)
- [ ] Click Supply/Deposit
- [ ] Enter amount
- [ ] Approve (if first time)
- [ ] Confirm supply transaction
- [ ] Verify position updated

For wstETH (if applicable):
- [ ] Go to lido.fi or DEX
- [ ] Swap ETH â†’ wstETH
- [ ] Confirm transaction
- [ ] Verify wstETH in wallet

### Step 6: Verify and Update (5 minutes)

**Verification:**
- [ ] All transactions confirmed on block explorer
- [ ] Positions showing correctly in protocol dashboards
- [ ] Yield tracker wallet scan (if used wallet import feature)

**Update tracker:**
1. **If manual positions:** Edit each position with new amounts
2. **If wallet-imported:** Click "Scan Wallet" to refresh balances
3. **Verify totals match:** Portfolio value should increase by ~Â£1,500

**Export portfolio snapshot:**
- [ ] Click "Export for AI"
- [ ] Select "Custom" prompt: "Record this deposit"
- [ ] Save JSON to file (for monthly comparison)

**Record:**

| Metric | Before | After |
|--------|--------|-------|
| Total portfolio | Â£_____ | Â£_____ |
| Stables | Â£_____ | Â£_____ |
| wstETH | Â£_____ | Â£_____ |

| Protocol | Before | Deposited | After | % of Stables |
|----------|--------|-----------|-------|--------------|
| _______ | Â£_____ | Â£_____ | Â£_____ | ___% |
| _______ | Â£_____ | Â£_____ | Â£_____ | ___% |
| _______ | Â£_____ | Â£_____ | Â£_____ | ___% |
| _______ | Â£_____ | Â£_____ | Â£_____ | ___% |

---

## Monthly Review (Additional 30 minutes)

**First Saturday of each month, add:**

### Performance Analysis (15 minutes)

**Tool:** Yield Tracker â†’ Export for AI

1. **Export portfolio with "Review Portfolio" prompt**
2. **Paste into Claude**
3. **Claude provides:**
   - Health assessment (allocation, concentration, APY vs target)
   - Performance vs entry APYs
   - Rebalancing recommendations
   - Risk analysis

**Manual checks:**

| Protocol | Current APY | Last Month | Trend | vs Target |
|----------|-------------|------------|-------|-----------|
| PT-sUSDai | ___% | ___% | â†‘/â†’/â†“ | âœ…/âš ï¸/âŒ |
| GTUSDCP | ___% | ___% | â†‘/â†’/â†“ | âœ…/âš ï¸/âŒ |
| STEAKUSDC | ___% | ___% | â†‘/â†’/â†“ | âœ…/âš ï¸/âŒ |
| SUSDS | ___% | ___% | â†‘/â†’/â†“ | âœ…/âš ï¸/âŒ |
| SGHO | ___% | ___% | â†‘/â†’/â†“ | âœ…/âš ï¸/âŒ |
| WMTUSDC | ___% | ___% | â†‘/â†’/â†“ | âœ…/âš ï¸/âŒ |
| Euler USDC | ___% | ___% | â†‘/â†’/â†“ | âœ…/âš ï¸/âŒ |
| wstETH | 2.5-3.5% | ___% | â†‘/â†’/â†“ | âœ…/âš ï¸/âŒ |

**Blended APY:** ___%

### Protocol Health Check (10 minutes)

**Tool:** Yield Tracker â†’ Pools view with "Current Positions" filter

1. **Fetch historical data** (if not done recently)
2. **Review metrics for each position:**

| Protocol | TVL Trend | APY Stability | Organic % | Volatility | Status |
|----------|-----------|---------------|-----------|------------|--------|
| PT-sUSDai | â†‘/â†’/â†“ | Stable/Variable | ___% | Ïƒ ___ | âœ…/âš ï¸/âŒ |
| GTUSDCP | â†‘/â†’/â†“ | Stable/Variable | ___% | Ïƒ ___ | âœ…/âš ï¸/âŒ |
| STEAKUSDC | â†‘/â†’/â†“ | Stable/Variable | ___% | Ïƒ ___ | âœ…/âš ï¸/âŒ |
| SUSDS | â†‘/â†’/â†“ | Stable/Variable | ___% | Ïƒ ___ | âœ…/âš ï¸/âŒ |
| SGHO | â†‘/â†’/â†“ | Stable/Variable | ___% | Ïƒ ___ | âœ…/âš ï¸/âŒ |
| WMTUSDC | â†‘/â†’/â†“ | Stable/Variable | ___% | Ïƒ ___ | âœ…/âš ï¸/âŒ |
| Euler USDC | â†‘/â†’/â†“ | Stable/Variable | ___% | Ïƒ ___ | âœ…/âš ï¸/âŒ |

3. **Action items from health check:**
   - Any protocols need investigation?
   - Exit triggers approaching?
   - Rebalancing needed?

### Strategic Decisions (5 minutes)

- [ ] Add new protocol? (if opportunity identified)
- [ ] Adjust allocations? (based on performance)
- [ ] Satellite strategy update? (if positions 1-2 mature)
- [ ] Document updates needed?

---

## Quarterly Review (Additional 1-2 hours)

**End of Q1, Q2, Q3, Q4:**

### Framework Effectiveness

**Tool:** Multiple exports from different dates, compare

| Metric | Target | Actual | Notes |
|--------|--------|--------|-------|
| Average APY | 6-8% | ___% | |
| Protocol failures | 0 | ___ | |
| Concentration breaches | 0 | ___ | |
| Gas spent | <Â£50/quarter | Â£___ | |

### Tier Assessment

**Review each protocol's tier assignment:**

| Protocol | Current Tier | Still Appropriate? | Notes |
|----------|--------------|-------------------|-------|
| PT-sUSDai | Experimental | Yes/No | (matures Feb 2026) |
| GTUSDCP | Established | Yes/No | |
| STEAKUSDC | Established | Yes/No | |
| SUSDS | Anchor | Yes/No | |
| SGHO | Anchor | Yes/No | |
| WMTUSDC | Emerging | Yes/No | |
| Euler USDC | Established | Yes/No | |

### Scale Check

| Metric | Value | Implication |
|--------|-------|-------------|
| Current portfolio | Â£_____ | |
| Max per protocol (scale-based) | ___% | |
| Min protocols (scale-based) | ___ | |
| Action needed? | Yes/No | |

### Strategy Refinement

- Framework working? _____
- Rule changes needed? _____
- Protocol changes needed? _____
- Next quarter focus: _____

---

## Tool Comparison: Yield Tracker vs DeBank

### Primary Use Cases

| Task | Primary Tool | Secondary/Verification |
|------|--------------|------------------------|
| Weekly portfolio check | **Yield Tracker** | DeBank (spot check) |
| Deposit allocation planning | **Yield Tracker** | - |
| APY monitoring | **Yield Tracker** | Protocol dashboards |
| Historical analysis | **Yield Tracker** | - |
| Transaction verification | **Block explorers** | DeBank activity feed |
| Audit trail | **DeBank CSV export** | Yield tracker JSON |

### When to Use DeBank

**Still valuable for:**
- Cross-verification of total portfolio value (monthly)
- Transaction history audit (quarterly)
- Network activity monitoring (if issues suspected)
- Mobile quick-check (DeBank app vs desktop tracker)

**Not needed for:**
- Daily/weekly APY checks (tracker has this)
- Allocation calculations (tracker automates)
- Historical trend analysis (tracker has 90 days)
- Export for AI analysis (tracker optimized)

### When to Use Protocol Dashboards

**Critical for:**
- Final verification before large deposits (>Â£5,000)
- Checking redemption/withdrawal mechanics
- Confirming APY if tracker shows anomaly
- Troubleshooting position issues

**Examples:**
- Pendle: Verify PT maturity date, check if auto-redeem
- Wildcat: Check reserve ratio, withdrawal queue status
- Morpho: Confirm curator hasn't changed strategy

---

## Quick Reference

### Deposit Split Formula

```
To stables: (T + 1,500) Ã— 0.70 - Current Stables
To wstETH: (T + 1,500) Ã— 0.30 - Current wstETH
```

### Concentration Limits (Current Scale <Â£20k)

| Rule | Limit |
|------|-------|
| Max per protocol | 25% |
| Min protocols | 4 |
| Anchor minimum | 15% |

### Circuit Breakers

| Trigger | Action |
|---------|--------|
| wstETH >55% | Sell wstETH â†’ USDC before deposit |
| wstETH <15% | Sell USDC â†’ wstETH before deposit |
| Protocol >30% | 100% of next 2 deposits elsewhere |

### Network Verification (CRITICAL)

**ALWAYS verify before every transaction:**
- Yield tracker: Shows correct chain per position
- MetaMask: Check network dropdown matches
- Kraken withdrawal: Select correct network (Ethereum/Arbitrum/Base)

**Wrong network = permanently lost funds**

### Protocol URLs

Access via yield tracker links or directly:

| Protocol | URL |
|----------|-----|
| Pendle | app.pendle.finance |
| Wildcat | app.wildcat.finance |
| Aave V3 | app.aave.com |
| Spark | app.spark.fi |
| Morpho | app.morpho.org |
| Euler V2 | app.euler.finance |
| Lido (wstETH) | stake.lido.fi |

---

## Troubleshooting

### "Yield tracker value doesn't match DeBank"

**Common causes:**
1. Price lag (1-2 minute difference) - normal if <2% variance
2. Wallet scan needs refresh - click "Scan Wallet" again
3. Position not linked to pool - check unmapped positions
4. DeBank showing different network - verify chain filters match

**Fix:** 
- Refresh wallet scan in tracker
- Export portfolio, check if amounts match what you expect
- Cross-reference with protocol dashboards (ultimate source of truth)

### "APY shows 0% for my position"

**Causes:**
1. Position not linked to DeFiLlama pool
2. Pool has no historical data yet (new protocol)
3. DefiLlama API issue

**Fix:**
- Link position to correct pool (search in pools view)
- Use "Fixed APY Override" if you know the rate (e.g., PT tokens)
- Check DeFiLlama directly to confirm pool exists

### "Can't find my protocol in pools list"

**Causes:**
1. Not on DeFiLlama (very rare for major protocols)
2. Different symbol/name than expected
3. Protocol on unsupported chain

**Fix:**
- Search by project name instead of symbol
- Check if protocol is Ethereum vs L2
- Manually add position without pool link (you'll need to update value manually)

---

## Emergency Procedures

### Protocol Issue Detected

**If yield tracker shows red alerts:**

1. **Check Discord/Twitter immediately**
2. **Verify on protocol dashboard**
3. **If confirmed issue:**
   - Exit to Aave (safest option)
   - Update position in tracker after exit
   - Document what happened

### Wallet Compromised

**If you suspect wallet breach:**

1. **DO NOT use yield tracker (it might trigger more transactions)**
2. **Immediately withdraw all funds to Wallet 2** (if you have one set up)
3. **Use protocol dashboards directly, not tracker**
4. **After funds safe:**
   - Create new Wallet 1 with entirely new seed phrase
   - Update tracker with new wallet address
   - Re-import positions

---

**Document Version:** 2.0  
**Last Updated:** December 13, 2025  
**Major Changes:**
- Integrated DeFi Yield Tracker as primary tool
- Simplified portfolio check process (5 min vs 10-15 min)
- Added AI export workflow for monthly reviews
- DeBank relegated to verification role
- Added troubleshooting for tracker-specific issues

**Supersedes:** WEEKLY_WORKFLOW.md v1.0  
**Next Review:** March 2026 (after full quarter using tracker)  
**Related:** YIELD_TRACKER_PRODUCT.md, YIELD_TRACKER_DATA_SOURCES.md
