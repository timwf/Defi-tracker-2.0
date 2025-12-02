# DefiLlama Yield Analysis - User Guide

**Purpose:** Interpret risk-adjusted yield analysis results  
**Implementation:** See DEFILLAMA_SCRIPTS.md for Python code  
**Updated:** November 30, 2025

---

## ⚠️ CRITICAL: Display Protocol

**When running yield analysis, Claude MUST:**

1. **Execute scripts** (`analyze_yields.py` then `generate_tables.py`)
2. **Display tables FIRST** - paste raw markdown output with ZERO commentary before it
3. **Add commentary AFTER** - analysis, recommendations, interpretations come after tables

**Example correct flow:**

```
[tables displayed]

## Analysis

[commentary here]
```

**Example WRONG flow:**

```
Running analysis...

[commentary about what the tables will show]

[tables displayed]
```

**Rationale:** Tables are the primary output. User needs to see data immediately, not buried after analysis.

---

## Quick Start

1. Upload `yield-history-YYYY-MM-DD.json` from data gathering
2. Say: **"Run yield analysis"**
3. Claude will:
   - Copy scripts from DEFILLAMA_SCRIPTS.md to `/home/claude/`
   - Execute `analyze_yields.py` (calculates risk-adjusted yields)
   - Execute `generate_tables.py` (formats results for display)
   - **Display all 4 tables first**
   - Add analysis/commentary after tables
4. Review recommendations

**⚠️ CRITICAL:** Claude must use the scripts from DEFILLAMA_SCRIPTS.md, not generate new ones. The scripts in that doc are the source of truth for calculation logic.

---

## What the Analysis Does

Takes historical yield data from DeFiLlama and calculates **risk-adjusted yields** by:

1. **Base90** - 90-day average organic APY (filters out temporary incentives)
2. **Volatility penalty** - Stable yields preferred over erratic ones
3. **Protocol tier adjustment** - Accounts for smart contract risk by tier
4. **Curator quality** - Morpho vaults weighted by institutional curator
5. **Confidence score** - Data quality and risk flags (0-100)

**Formula implemented in scripts:**
```
RiskAdj = (Base90 × CuratorMult) - (Base90 × TierLoss) - (Volatility × 0.1)
```

See `analyze_yields.py` in DEFILLAMA_SCRIPTS.md for full implementation details.

---

## Output Tables Explained

### Table 1: Full Dataset (Top 30)

All pools with TVL ≥ $5M, sorted by RiskAdj descending.

**Key columns:**
- **RiskAdj %** - The score to optimize for (balances yield vs risk)
- **Conf** - Confidence score (aim for ≥70)
- **Flags** - Quick health check (green good, red bad)

**What to look for:**
- High RiskAdj with high Conf = compelling opportunity
- Red flags = investigate before deploying
- Your current positions for comparison

### Table 2: Top 5 Per Chain

Same data, filtered by network. Useful if you prefer specific chains.

### Table 3: Current Positions Status

Health check on your existing 3 positions:
- ✅ Healthy: Keep holding
- 🟡 Monitor: Watch closely
- 🔴 Exit recommended: Consider migration

### Table 4: Top Recommendations

Claude's top 5-10 picks based on:
- RiskAdj in top 20
- Conf ≥ 70
- No red flags
- Diversified across protocols (max 2 per protocol)

**Use this table for deployment decisions.**

---

## Understanding Flags

**Volatility (σ):**
- 🟢 <1.5 - Stable (preferred)
- 🟡 1.5-3.0 - Moderate
- 🔴 >3.0 - Erratic (penalty applied)

**Organic (Org):**
- 🟢 ≥95% - Sustainable yield from protocol operations
- 🟡 80-94% - Some incentive dependency
- 🟠 50-79% - Heavy incentive dependency
- 🔴 <50% - Mostly temporary rewards

**TVL:**
- 🟢 ≥$50M - Large, established
- 🟡 $10-50M - Medium
- 🟠 $5-10M - Smaller (higher risk)

**Flow (30-day TVL change):**
- 🟢 ≥-10% - Stable or growing
- 🟡 -10 to -25% - Declining
- 🔴 <-25% - Capital exodus (red flag)

---

## Protocol Tiers (from RISK_FRAMEWORK.md)

Tiers affect RiskAdj calculation:

| Tier | Loss Rate | Examples |
|------|-----------|----------|
| Anchor | 0.5% | Aave, Compound |
| Established | 2% | Morpho, Euler, Spark |
| Emerging | 5% | Fluid, Silo |
| Experimental | 10% | Case-by-case |

**Higher tier = larger penalty in RiskAdj formula**

---

## Morpho Curator Bonuses

Premium curators get 1.0x multiplier (no penalty):
- Gauntlet (GT prefix)
- Steakhouse (STEAK)
- Block Analitica (BB, BBQ)
- RE7 Labs (RE7)
- MEV Capital (MEV)
- Usual (USUAL)

Unknown curators get 0.8x multiplier (20% haircut).

See `MORPHO_CURATORS` dict in `analyze_yields.py` for full list.

---

## Decision Framework

**For weekly £1,500 deposits:**

1. Check Table 3 (Current Positions)
   - Any 🔴 status? Plan migration
   - All ✅? Consider expanding

2. Review Table 4 (Recommendations)
   - Pick from top 5-10
   - Diversify across protocols
   - Respect concentration limits (<25% per protocol)

3. If adding new protocol:
   - Start with £1,500 test
   - Monitor for 2 weeks
   - Scale if no issues

**For migration decisions:**

1. Compare current position vs recommendations
2. Migration only justified if:
   - RiskAdj difference >1.5%
   - High confidence alternative (≥80)
   - Gas cost <0.5% of position size

---

## Customization Options

Tell Claude:

**Change TVL floor:**
"Use $10M TVL floor" (default: $5M)

**Higher confidence threshold:**
"Only show pools with Conf ≥ 80" (default: ≥70)

**Filter by tier:**
"Only Anchor and Established" or "Include Emerging"

**Filter by chain:**
"Ethereum only" or "Arbitrum only"

**Filter by APY:**
"Only show pools with Base90 > 6%"

---

## Example Interpretation

```
| # | Symbol | RiskAdj% | Conf | Flags |
|---|--------|----------|------|-------|
| 1 | GTUSDCC | 6.25 | 100 | σ🟢 Org🟢 TVL🟢 Flow🟢 |
```

**Reading:**
- GTUSDCC = Morpho Gauntlet USDC Core (Arbitrum)
- 6.25% risk-adjusted yield (after all penalties)
- 100 confidence (perfect score)
- All green flags (stable, organic, large TVL, growing)

**Action:** Strong candidate for deployment

---

```
| # | Symbol | RiskAdj% | Conf | Flags |
|---|--------|----------|------|-------|
| 15 | VOLATILE | 7.65 | 65 | σ🔴 Org🟢 TVL🟡 Flow🟡 |
```

**Reading:**
- 7.65% risk-adjusted (higher gross yield)
- 65 confidence (below preferred 70)
- High volatility (🔴) = erratic yields
- Medium TVL, declining deposits

**Action:** Pass—too unstable despite higher nominal yield

---

## Verification

To verify calculations match the code:

1. Pick a pool from results
2. Check its raw data in `yield-history-YYYY-MM-DD.json`
3. Run calculation manually using formulas in `analyze_yields.py`
4. Compare to table output

**Code is the specification.** If there's a discrepancy, the Python implementation is correct.

---

## Common Questions

### "Why is Base90 different from Current APY?"

Base90 is the 90-day historical average, smoothing out temporary spikes/drops. Current APY is today's snapshot. We use Base90 for decisions because it's more stable.

### "Why does a higher APY pool rank lower?"

RiskAdj accounts for volatility, protocol tier risk, and data quality. A 9% pool with high volatility on an Emerging protocol might score lower than a stable 6% Anchor protocol.

### "Should I always pick the #1 recommendation?"

Not necessarily. Consider:
- Diversification (don't overweight one protocol)
- Chain preference (L1 vs L2)
- Your current allocation (might need specific protocol)

Use recommendations as a starting point, apply your allocation rules.

### "What if my current position shows 🔴?"

1. Check why (volatility spike? TVL exodus? Both?)
2. Compare to alternatives in recommendations
3. Calculate migration cost (gas + slippage)
4. Migrate if new pool is materially better (>1.5% RiskAdj spread)

Don't panic-exit on single red flag—investigate first.

### "Can I trust pools with Conf <70?"

Depends on the reason:
- Low confidence due to <60 days data? Acceptable if protocol is established
- Low confidence due to volatility + unknown curator? Pass
- Low confidence due to declining TVL? Red flag

Check the individual flags to understand why confidence is low.

---

## Trigger Phrases

| You Say | Claude Does |
|---------|-------------|
| "Run yield analysis" | Executes scripts, displays all 4 tables FIRST, then commentary |
| "Explain [pool name]" | Deep dive on specific pool metrics |
| "Compare [pool1] vs [pool2]" | Side-by-side comparison |
| "Show only [protocol]" | Filter to single protocol |
| "Show only [chain]" | Filter to single chain |
| "Update positions" | Modify CURRENT_POSITIONS in script and re-run |

---

## Maintenance

**When to update scripts:**

1. **Current positions change** (weekly during deployment)
   - Edit `CURRENT_POSITIONS` in `analyze_yields.py`
   - Re-run analysis

2. **Risk framework tiers change** (rare)
   - Edit `PROTOCOL_TIERS` in `analyze_yields.py`
   - Re-run analysis

3. **New Morpho curators emerge** (quarterly check)
   - Edit `MORPHO_CURATORS` in `analyze_yields.py`
   - Re-run analysis

4. **TVL floor changes** (when portfolio scales)
   - Edit TVL filter in `analyze_yields.py` main()
   - Current: $5M (for <£20k portfolio)
   - Future: $10M (for >£50k portfolio)

---

## Related Documents

- **DEFILLAMA_SCRIPTS.md** - Python implementation (source of truth for calculations)
- **DEFILLAMA_DATA_GATHERING.md** - How to fetch historical data
- **RISK_FRAMEWORK.md** - Protocol tiers and allocation rules
- **WEEKLY_WORKFLOW.md** - When to run analysis in weekly workflow

---

**Document Version:** 2.1  
**Last Updated:** November 30, 2025  
**Major Change:** Added "Display Protocol" - tables first, commentary after  
**Supersedes:** DEFILLAMA_ANALYSIS.md v2.0
