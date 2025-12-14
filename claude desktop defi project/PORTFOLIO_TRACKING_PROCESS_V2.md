# Portfolio Tracking Process (Updated for Yield Tracker)

**Version:** 2.0  
**Updated:** December 13, 2025  
**Time Required:** 5 minutes (weekly), 15 minutes (monthly)  
**Frequency:** Weekly monitoring, monthly deep analysis  
**Tools:** DeFi Yield Tracker (primary), DeBank (verification)

---

## Overview

This process provides dual-layer portfolio tracking:

1. **Real-time tracking:** DeFi Yield Tracker (live positions, APY analytics, AI export)
2. **Blockchain verification:** DeBank (CSV audit trail, transaction history)

**Accuracy:** 99%+ when both tools align

**Key change from v1.0:** Yield Tracker replaces manual calculations. DeBank becomes verification layer rather than primary data source.

---

## Weekly Monitoring (5 minutes)

### Step 1: Check Portfolio Dashboard

**Tool:** DeFi Yield Tracker â†’ Portfolio tab

**What to review:**

1. **Summary metrics** (top of page):
   - Total value (should match your mental model Â±2%)
   - Weighted APY (target: 6-8%)
   - Allocation split (target: 70/30 stables/growth)

2. **Alert badges** (if any):
   - Red: Immediate investigation needed
   - Yellow: Monitor closely
   - Green/none: All healthy

3. **Individual positions:**
   - Scan for unexpected value changes (>5% without deposits)
   - Check APY drift (>2% drop from last week = investigate)

**Action:**
- If all green: Done, move on
- If alerts present: Click position â†’ review historical data â†’ check protocol Discord

### Step 2: Verify Key Positions (if needed)

**When to verify:**
- First time using tracker
- Large value discrepancy (>5% vs expected)
- After protocol upgrade or migration
- Monthly (spot check)

**Tool:** DeBank app or web

**Quick verification:**
1. Open DeBank
2. Check total portfolio value
3. Compare to yield tracker
4. If match within 1-2%: âœ… All good
5. If >5% difference: Investigate (wallet scan refresh, unmapped positions, price lag)

**Common discrepancies:**
- Price lag: 1-2 minutes between tracker and DeBank = normal
- Unmapped positions: Tracker won't show tokens not linked to pools
- Rebasing tokens: May calculate differently (rare)

### Step 3: Optional - Export Snapshot

**Tool:** Yield Tracker â†’ Export for AI

**Use cases:**
- Weekly record keeping (save JSON file dated)
- Quick AI check-in ("What changed this week?")
- Building historical comparison dataset

**Frequency:** Your choice (daily, weekly, or skip)

---

## Monthly Deep Analysis (15 minutes)

### Step 1: AI-Powered Portfolio Review

**Tool:** Yield Tracker â†’ Export for AI

1. **Click "Export for AI"**
2. **Select "Review Portfolio"**
3. **Copy JSON to clipboard**
4. **Paste into Claude conversation**

**What Claude analyzes:**
- Allocation vs targets (70/30 split, concentration limits)
- APY performance vs goals (6-8% blended)
- Individual position health (entry APY vs current)
- Risk metrics (diversification, protocol count)
- Rebalancing recommendations

**Time:** 2-3 minutes for Claude to process, instant results

**Example output:**
```
Portfolio Health: âœ… Strong

Allocation: 69.4/30.6 (target 70/30) - on target
Concentration: Largest 17.9% (limit 25%) - compliant
Weighted APY: 6.13% (target 6-8%) - in range
Protocol count: 7 (target 4-6) - slightly high

Performance vs Entry:
- PT-sUSDai: 15.0% current vs 14.94% entry (+0.06%) âœ…
- GTUSDCP: 5.61% current vs 5.80% entry (-0.19%) âš ï¸
  Note: Market-wide Morpho compression, not position-specific

Recommendations:
1. No urgent actions needed
2. Consider consolidating Morpho vaults (2 positions, same mechanism)
3. Monitor GTUSDCP APY trend (if drops <5%, investigate)

Next steps: Continue weekly deposits, reassess satellite #3 in January
```

### Step 2: Historical Performance Analysis

**Tool:** Yield Tracker â†’ Individual position pages

**For each major position (>10% of portfolio):**

1. **Click position card**
2. **Review metrics:**
   - APY sparkline (trend over time)
   - TVL 30-day change
   - Volatility indicator
   - Organic yield percentage

3. **Check against targets:**

| Position | Current APY | Target Range | Status |
|----------|-------------|--------------|--------|
| PT-sUSDai | 15.0% | 14-16% (fixed) | âœ… Locked |
| GTUSDCP | 5.61% | 5-8% | âœ… In range |
| STEAKUSDC | 5.61% | 5-8% | âœ… In range |
| SUSDS | 4.25% | 4-6% | âœ… In range |
| SGHO | 5.76% | 5-8% | âœ… In range |
| WMTUSDC | 10.50% | 10-12% | âœ… In range |
| Euler USDC | 5.80% | 5-8% | âœ… In range |
| wstETH | 2.53% | 2.5-3.5% | âœ… In range |

4. **Flag concerns:**
   - APY below target range >2 weeks
   - TVL declining >20%
   - Volatility spiked (Ïƒ >3.0)

### Step 3: DeBank CSV Export (Verification Audit)

**Tool:** DeBank Pro â†’ Transaction History â†’ Download CSV

**Purpose:** 
- Create blockchain audit trail
- Verify all transactions accounted for
- Catch any transactions you forgot about
- Tax record keeping

**Process:**
1. Download CSV for current month
2. Open in Excel/Sheets
3. **Verify transaction count:**
   - Count deposits (should match weekly deposits)
   - Count withdrawals (should match your records)
   - Check for unexpected transactions

4. **Calculate actual interest earned:**
   ```
   Ending Balance - Starting Balance - Deposits + Withdrawals = Interest Earned
   ```

5. **Compare to yield tracker projection:**
   - Tracker shows: "Projected $X/month"
   - Actual from CSV: $Y earned
   - Variance: (Y - X) / X = ___% difference

**Acceptable variance:** Â±5% (price fluctuations, compounding timing)  
**Investigate if:** >10% difference (possible missing transactions or calculation error)

### Step 4: Update Documentation

**If any changes occurred:**

1. **Current_Status.md:**
   - Update position values
   - Update APY if significantly changed
   - Update network allocation if changed

2. **Monitoring logs:**
   - Record monthly health check results
   - Note any protocol issues encountered
   - Document decisions made (e.g., "Skipped Euler deposit due to high allocation")

**Time:** 5 minutes

---

## Quarterly Audit (30 minutes)

### Full Reconciliation Process

**Every 3 months (March, June, September, December):**

1. **Export all data:**
   - Yield tracker: Full portfolio JSON
   - DeBank: 90-day CSV
   - Protocol dashboards: Screenshot each position

2. **Three-way verification:**

   | Position | Yield Tracker | DeBank | Protocol Dashboard | Match? |
   |----------|---------------|--------|-------------------|--------|
   | PT-sUSDai | $2,057 | $2,058 | 2,052.33 PT-sUSDai | âœ… ~same |
   | GTUSDCP | $1,902 | $1,901 | 1.77K gtUSDCp | âœ… ~same |
   | wstETH | $5,056 | $5,057 | 1.338 wstETH | âœ… ~same |

   **Note:** Small differences ($1-5) are normal due to:
   - Timing of price fetches
   - Interest accrual between checks
   - Rounding differences

3. **Calculate actual returns:**

   ```
   Starting portfolio (3 months ago): $X
   Ending portfolio (today): $Y
   Total deposits (3 months): $Z
   Total withdrawals (3 months): $W
   
   Net change: (Y - X - Z + W) = Actual returns
   Expected returns: (Weighted APY / 4) * Average portfolio value
   
   Variance: (Actual - Expected) / Expected
   ```

4. **Performance assessment:**

   | Metric | Expected | Actual | Variance | Status |
   |--------|----------|--------|----------|--------|
   | Portfolio growth | 1.5-2% | ___% | ___% | âœ…/âš ï¸/âŒ |
   | Weighted APY | 6-8% | ___% | ___% | âœ…/âš ï¸/âŒ |
   | Protocol failures | 0 | ___ | ___ | âœ…/âš ï¸/âŒ |

5. **Risk framework review:**
   - Concentration limits still appropriate?
   - Protocol tier assignments still valid?
   - Scale-based rules need adjustment?
   - Strategy refinements needed?

---

## Data Sources Comparison

### DeFi Yield Tracker

**Strengths:**
- Real-time APY tracking
- Historical analytics (90 days)
- AI-optimized exports
- Portfolio analytics (weighted APY, allocations)
- Risk alerts

**Limitations:**
- Dependent on DeFiLlama data accuracy
- Requires manual linking for unmapped positions
- No native transaction history (uses wallet scan)

**Best for:**
- Daily/weekly monitoring
- APY comparison and research
- Allocation planning
- AI-assisted analysis

### DeBank

**Strengths:**
- Direct blockchain reads (100% accurate balances)
- Complete transaction history
- CSV export for audit trail
- Mobile app for quick checks

**Limitations:**
- No historical APY data
- No yield projections
- Manual calculations required
- Less useful for research

**Best for:**
- Monthly verification
- Transaction audit
- Tax record keeping
- Quick mobile check

### Protocol Dashboards

**Strengths:**
- Source of truth for positions
- Real-time APY (no API lag)
- Withdrawal mechanics visible
- Full transaction history

**Limitations:**
- Must check each protocol separately
- No portfolio-level analytics
- No export functionality

**Best for:**
- Final verification before large actions
- Troubleshooting position issues
- Understanding protocol-specific features

---

## Workflow Decision Tree

```
Need to check portfolio value?
â”œâ”€ Quick check â†’ Yield Tracker (2 min)
â”œâ”€ Detailed analysis â†’ Yield Tracker + AI export (10 min)
â””â”€ Full verification â†’ Tracker + DeBank + Protocol dashboards (30 min)

Need APY data?
â”œâ”€ Current APY â†’ Yield Tracker
â”œâ”€ Historical trends â†’ Yield Tracker historical data
â””â”€ Verify suspicious APY â†’ Protocol dashboard

Need transaction history?
â”œâ”€ Quick review â†’ DeBank activity feed
â””â”€ Full audit â†’ DeBank CSV export

Making deposit decision?
â”œâ”€ Which protocol? â†’ Yield Tracker pools view + allocation
â”œâ”€ How much? â†’ Yield Tracker 70/30 calculator
â””â”€ Risk check â†’ Yield Tracker historical metrics

Monthly review?
â””â”€ Yield Tracker AI export â†’ "Review Portfolio"

Quarterly audit?
â””â”€ All three tools (Tracker + DeBank + Dashboards)
```

---

## Troubleshooting

### "Yield tracker and DeBank show different values"

**Step 1: Identify variance**
```
Tracker: $16,543
DeBank: $16,521
Difference: $22 (0.13%)
```

**Step 2: Determine cause**

| Variance | Likely Cause | Action |
|----------|--------------|--------|
| <2% | Price timing lag | Normal, ignore |
| 2-5% | Unmapped position or stale wallet scan | Refresh wallet scan |
| 5-10% | Position not linked to pool | Check unmapped positions list |
| >10% | Missing position or data error | Full audit needed |

**Step 3: Resolution**
1. Refresh wallet scan in tracker
2. Check unmapped positions
3. Verify all positions linked to pools
4. Cross-check with protocol dashboards (ultimate truth)

### "APY in tracker doesn't match protocol dashboard"

**Common causes:**
1. **DeFiLlama lag:** Up to 5-minute delay
2. **Calculation difference:** Tracker uses base APY, dashboard may show total (base + rewards)
3. **Fixed APY override:** You set manual rate (e.g., for PT tokens)

**Fix:**
- Check DeFiLlama directly for that pool
- Use protocol dashboard as source of truth for critical decisions
- Update fixed APY override if needed

### "Historical data shows 0 days"

**Cause:** Pool is very new or not on DeFiLlama

**Fix:**
- Wait for DeFiLlama to collect data (usually 24-48 hours for new pools)
- Use "Fixed APY Override" if you know the rate
- Mark position as "Manual tracking" if pool isn't on DeFiLlama

### "Can't find my transaction in DeBank CSV"

**Causes:**
1. Transaction on different chain than filtered
2. Transaction pending (not confirmed yet)
3. Internal protocol transaction (not shown in CSV)

**Fix:**
- Check all chains in DeBank filter
- Verify transaction confirmed on block explorer
- Some transactions (like Morpho vault rebalancing) don't appear in user CSV

---

## Best Practices

### Data Verification Cadence

| Action | Tool | Frequency |
|--------|------|-----------|
| Quick value check | Yield Tracker | Daily (if desired) |
| Portfolio health | Yield Tracker | Weekly |
| Full verification | Tracker + DeBank | Monthly |
| Complete audit | All 3 tools | Quarterly |

### When to Trust Which Tool

**For allocation decisions:**
- Trust: Yield Tracker (real-time, accurate percentages)
- Verify: DeBank (if first time or numbers seem off)

**For APY comparisons:**
- Trust: Yield Tracker (historical data, multi-pool comparison)
- Verify: Protocol dashboard (if planning large deposit)

**For transaction verification:**
- Trust: DeBank CSV or block explorer
- Cross-check: Yield tracker position updates

**For total value:**
- Trust: Any tool if they agree within 2%
- Verify: All three if variance >5%

### Export Best Practices

**Daily export (if you do this):**
- Use "Custom" prompt: "What changed today?"
- Keep last 7 days of exports for comparison
- Useful for catching issues early

**Weekly export:**
- Save JSON with date in filename
- Use "Find Opportunities" when planning deposits
- Keep for monthly comparison

**Monthly export:**
- Use "Review Portfolio"
- Save full analysis from Claude
- Update Current_Status.md based on findings

**Quarterly export:**
- Comprehensive data dump
- Include DeBank CSV
- Create performance report

### File Organization

```
/defi-tracking/
  /exports/
    /daily/
      portfolio-2025-12-13.json
      portfolio-2025-12-14.json
    /weekly/
      weekly-2025-12-08.json
      weekly-2025-12-15.json
    /monthly/
      monthly-2025-12.json
      monthly-2025-12-claude-analysis.md
  /debank-csv/
    debank-2025-12.csv
  /screenshots/
    euler-position-2025-12-13.png
```

---

## Performance Metrics

### What to Track Monthly

| Metric | Source | Target | Notes |
|--------|--------|--------|-------|
| **Total value** | Yield Tracker | Growing | Includes deposits + returns |
| **Weighted APY** | Yield Tracker | 6-8% | Blended across all positions |
| **Allocation drift** | Yield Tracker | Within Â±5% of 70/30 | Stables vs growth |
| **Largest position** | Yield Tracker | <25% | Concentration limit |
| **Protocol count** | Yield Tracker | 5-7 | Diversification |
| **Gas spent** | DeBank CSV | <Â£20/month | Efficiency check |
| **Actual vs projected** | DeBank CSV vs Tracker | Within Â±10% | Accuracy check |

### Red Flags

**Investigate immediately if:**
- Total value drops >10% without withdrawals
- Weighted APY drops >2% in one week
- Any position shows 0% APY unexpectedly
- DeBank and Tracker differ by >10%
- Position value differs from protocol dashboard by >5%

---

**Document Version:** 2.0  
**Last Updated:** December 13, 2025  
**Major Changes:**
- Integrated DeFi Yield Tracker as primary tool
- Simplified monitoring process (5 min vs 30 min weekly)
- DeBank CSV relegated to monthly verification
- Added AI export workflow for analysis
- Removed manual calculation requirements

**Supersedes:** PORTFOLIO_TRACKING_PROCESS.md v1.0  
**Next Review:** March 2026  
**Related:** YIELD_TRACKER_PRODUCT.md, YIELD_TRACKER_DATA_SOURCES.md, WEEKLY_WORKFLOW_V2.md
