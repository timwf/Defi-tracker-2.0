# PT-sUSDai Position Monitoring

**Version:** 1.0  
**Created:** December 11, 2025  
**Position:** $1,998 (18.5% of stablecoins)  
**Maturity:** February 19, 2026  
**Locked APY:** 14.94%

---

## Quick Context

**What you own:** PT-sUSDai on Pendle (Arbitrum)
- Principal Token that matures to sUSDai 1:1 on Feb 19, 2026
- sUSDai = yield-bearing stablecoin backed by GPU loans to AI companies
- Underlying protocol: USD.AI (GPU-backed lending)
- Current value: $1,998
- Days to maturity: **69 days** (as of Dec 11, 2025)

**Why monitoring matters:**
- Protocol <1 year old (launched June 2025)
- Novel mechanism (GPU collateral + AI lending)
- 18.5% allocation exceeds experimental tier limit
- Short maturity window = concentrated risk period
- First confirmed borrower payment happened (Compute Labs - proof of concept working)

**Goal:** Catch red flags early, exit if deterioration occurs, hold to maturity if healthy.

---

## Daily Checks (5 minutes)

**When:** Every morning or every 3 days (your choice)  
**Where:** Pendle app, DeFiLlama, USD.AI Discord

### 1. PT-sUSDai Price (Pendle AMM)

**Check:** https://app.pendle.finance/trade/markets (search "sUSDai" on Arbitrum)

| Metric | Healthy Range | Concerning | Red Flag |
|--------|---------------|------------|----------|
| **PT discount to face value** | 2-4% | 5-7% | >7% |
| **Implied APY** | 14-15.5% | 12-14% or 16-18% | <12% or >18% |

**What it means:**
- PT should trade at small discount (~2-4%) as it approaches maturity
- Discount widens if market loses confidence or liquidity dries up
- If discount >7%, market is pricing in elevated default risk

**Example:**
- PT trading at $0.965, matures to $1.00 in 69 days = 3.5% discount âœ… Normal
- PT trading at $0.92, matures to $1.00 in 69 days = 8% discount ðŸš¨ Investigate

### 2. USD.AI Protocol TVL

**Check:** https://defillama.com/protocol/usd-ai

| Metric | Healthy | Concerning | Red Flag |
|--------|---------|------------|----------|
| **Current TVL** | $650M+ | $580-650M | <$580M |
| **7-day change** | +5% to -5% | -5% to -10% | >-10% |
| **30-day change** | Growing or flat | -10% to -20% | <-20% |

**Current baseline (Dec 11):** $656.98M

**What it means:**
- TVL = total value locked in USD.AI protocol
- Growing TVL = confidence increasing
- Stable TVL = healthy operation
- Declining TVL = capital flight, potential issues

### 3. Discord/Twitter Announcements

**Check:** 
- USD.AI Discord: https://discord.gg/usdai (if available)
- USD.AI Twitter: https://twitter.com/USDai_Official
- Pendle Discord: https://discord.gg/pendle

| Signal | Status |
|--------|--------|
| âœ… No concerning announcements | Normal operation |
| âš ï¸ Planned maintenance/upgrades | Monitor, usually fine |
| ðŸš¨ Security incident, borrower default, protocol pause | Investigate immediately |

**What to look for:**
- Any mention of borrower payment issues
- Security incidents or exploits
- Changes to redemption mechanics
- Major protocol updates

---

## Weekly Checks (15 minutes)

**When:** Saturday mornings with portfolio review

### 1. Borrower Payment Status

**Check:** USD.AI Discord, Twitter, or Medium blog

| Signal | Status |
|--------|--------|
| âœ… Compute Labs payment confirmed this month | Healthy |
| âš ï¸ No payment mentioned but not overdue | Monitor |
| ðŸš¨ Payment delayed or borrower default announced | Exit consideration |

**Baseline:** Compute Labs made first payment (confirmed Nov 2025). Expect monthly payments.

### 2. sUSDai APY Stability

**Check:** DeFiLlama yields page or Pendle market page

| Metric | Healthy | Concerning | Red Flag |
|--------|---------|------------|----------|
| **sUSDai APY** | 10-16% | 8-10% or 16-20% | <8% or >20% |
| **7-day change** | Â±1-2% | Â±3-4% | >Â±5% |

**What it means:**
- sUSDai underlying APY should be stable (interest from GPU loans)
- Sudden spike >20% = potential distress (protocol offering high rate to attract capital)
- Sudden drop <8% = yield compression, borrowers leaving

### 3. Community Sentiment

**Check:** Discord general channels, Twitter mentions

| Signal | Status |
|--------|--------|
| âœ… Normal discussion, feature requests, yield talk | Healthy |
| âš ï¸ Concerns about redemptions, questions on borrowers | Monitor closely |
| ðŸš¨ Multiple users reporting issues, "I'm exiting" posts | Red flag |

**Red flags:**
- Posts about stuck withdrawals
- Reports of redemption queue issues
- Concerns about specific borrowers defaulting
- Team unresponsive to questions

### 4. PT-sUSDai Liquidity

**Check:** Pendle market depth (liquidity section on market page)

| Metric | Healthy | Concerning | Red Flag |
|--------|---------|------------|----------|
| **Market depth** | >$500k | $200-500k | <$200k |
| **Slippage for $2k** | <2% | 2-5% | >5% |

**What it means:**
- Can you exit your $1,998 position without major slippage?
- Low liquidity = harder to exit if needed
- Check by simulating a sell on Pendle (don't execute)

---

## Exit Triggers (Act Immediately)

**Do NOT wait for weekly check if you see these:**

### Hard Exit Triggers (Exit ASAP)

| Trigger | Action |
|---------|--------|
| ðŸš¨ USD.AI protocol exploit confirmed | Sell PT immediately on Pendle AMM |
| ðŸš¨ Major borrower default announced (>$50M loan) | Sell PT immediately |
| ðŸš¨ TVL drops >30% in 7 days | Sell PT immediately |
| ðŸš¨ PT discount >10% sustained (24 hours) | Sell PT immediately |
| ðŸš¨ Redemption issues reported widely | Sell PT immediately |
| ðŸš¨ Protocol pause or emergency shutdown | Sell PT immediately |

### Soft Exit Triggers (Investigate, Likely Exit)

| Trigger | Action |
|---------|--------|
| âš ï¸ PT discount 7-10% for 3+ days | Research cause, prepare to exit |
| âš ï¸ TVL declining 10-20% over 2 weeks | Monitor daily, exit if continues |
| âš ï¸ Borrower payment missed (not just delayed) | Research, consider exit |
| âš ï¸ Multiple community red flags | Assess severity, lean toward exit |
| âš ï¸ Team communication goes dark >7 days | Exit consideration |

### Exit Process

**If exit triggered:**

1. **Go to Pendle market:** https://app.pendle.finance/trade/markets
2. **Find your PT-sUSDai position** (Arbitrum chain)
3. **Simulate sell:** Enter $1,998, check slippage
4. **If slippage <5%:** Execute immediately
5. **If slippage >5%:** 
   - Try smaller amounts ($500 at a time)
   - Check liquidity in 1 hour
   - Accept slippage if hard trigger (loss <10% is acceptable vs potential 100% loss)
6. **Convert to USDC:** Swap sUSDai or other output to USDC
7. **Move to Aave immediately:** Safety position while reassessing

**Expected loss on exit:** 2-5% slippage + gas = ~$50-150 cost

---

## Maturity Plan (February 19, 2026)

**Timeline:**

### Feb 12, 2026 (7 days before maturity)

**Action:**
- [ ] Check PT price (should be ~$0.997-0.999, very close to $1)
- [ ] Verify no protocol issues in past 30 days
- [ ] Confirm redemption process on Pendle
- [ ] Check if auto-redemption or manual claim required

**Decision:**
- If healthy: Hold through maturity
- If any concerns: Sell PT now

### Feb 19, 2026 (Maturity Day)

**Action:**
- [ ] PT converts to sUSDai automatically (or claim on Pendle)
- [ ] Verify sUSDai balance received (should be ~$1,998 worth)
- [ ] DO NOT immediately redeem sUSDai (QEV queue = 30 days)

**Options:**
1. **Hold sUSDai:** Continue earning ~10-15% APY while in redemption queue
2. **Sell sUSDai on DEX:** Swap to USDC immediately (small slippage)
3. **Enter redemption queue:** 30-day QEV process to get USDC

**Recommendation:** Option 2 (sell sUSDai to USDC via DEX) unless yield is exceptional.

### Feb 19-28, 2026 (Week after maturity)

**Action:**
- [ ] Convert sUSDai to USDC (DEX or redemption queue)
- [ ] Move proceeds to core position (Aave or Morpho)
- [ ] Update Current_Status.md
- [ ] Archive this monitoring doc
- [ ] Evaluate satellite position #3 candidates

---

## Baseline Reference (Dec 11, 2025)

**Use this snapshot to compare future readings:**

| Metric | Baseline (Dec 11, 2025) |
|--------|-------------------------|
| USD.AI TVL | $656.98M |
| PT discount | ~3-4% (estimate, verify on Pendle) |
| PT-sUSDai price | ~$0.965 (estimate) |
| sUSDai APY | ~13-15% (target range) |
| Days to maturity | 69 days |
| Position value | $1,998 |
| Locked APY | 14.94% |
| Market sentiment | Healthy (Compute Labs payment confirmed) |

---

## Monitoring Log

**Template for each check:**

```
Date: YYYY-MM-DD
Days to maturity: XX
PT discount: X.X%
USD.AI TVL: $XXXm (change: +/-X%)
Announcements: [None / Details]
Community: [Healthy / Concerns]
Action: [None / Monitoring / Exit consideration]
Notes: [Any observations]
```

**Example:**

```
Date: 2025-12-11
Days to maturity: 69
PT discount: 3.5% (estimated)
USD.AI TVL: $656.98m (+13.2% from baseline)
Announcements: None
Community: Healthy, Compute Labs payment confirmed
Action: None - all green
Notes: First monitoring day, establish baseline
```

---

## Quick Decision Tree

**Use this for fast assessment:**

```
Is PT discount >7%?
â”œâ”€ Yes â†’ Investigate cause, prepare to exit
â””â”€ No â†’ Continue

Has TVL dropped >10% in 7 days?
â”œâ”€ Yes â†’ Monitor daily, consider exit
â””â”€ No â†’ Continue

Any exploit/default announcements?
â”œâ”€ Yes â†’ Exit immediately
â””â”€ No â†’ Continue

Is maturity <7 days away?
â”œâ”€ Yes â†’ Review maturity plan
â””â”€ No â†’ Continue normal monitoring

All checks green?
â””â”€ Yes â†’ Position healthy, hold to maturity âœ…
```

---

## Notes Section

**Use this space for ongoing observations:**

- Dec 11, 2025: Document created. Baseline established. First check showed healthy metrics.
- [Add future notes here]

---

**Document Purpose:** Systematic monitoring to catch deterioration early. This position has higher risk than core holdingsâ€”disciplined surveillance prevents larger losses. If consistently green for 30+ days, confidence increases. If red flags appear, exit promptly.

**Next Review:** After 30 days of monitoring or at maturity (whichever comes first)

---

**Document Version:** 1.0  
**Created:** December 11, 2025  
**Position Type:** Satellite #2 (Experimental tier)  
**Monitoring Frequency:** Daily or every 3 days (user preference)  
**Related Docs:** Current_Status.md, SATELLITE_STRATEGY_WIP.md, WILDCAT_PROTOCOL.md
