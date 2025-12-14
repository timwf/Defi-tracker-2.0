# sGHO (Savings GHO) - Reference Guide

**Last Updated:** December 14, 2025  
**Protocol:** Aave  
**Network:** Ethereum Mainnet  
**Token Type:** ERC-20 (share-based, non-rebasing)

---

## Executive Summary

sGHO is Aave's native savings product for GHO stablecoin holders. Deposit GHO, receive sGHO tokens that appreciate in value over time as yield accrues. No lockups, no slashing risk, no rehypothecation. Yield is funded by Aave protocol revenue and set by DAO governance.

**Key characteristics:**
- Instant deposits and withdrawals (no cooldown)
- No deposit or withdrawal fees
- No slashing risk (unlike stkGHO)
- Deposited GHO stays in contract (not lent out)
- Yield set by Aave DAO, not market forces

---

## How It Works

### The Mechanism

```
You deposit GHO
       â†“
Receive sGHO tokens (share-based receipt)
       â†“
sGHO appreciates vs GHO over time
       â†“
Redeem sGHO â†’ receive more GHO than deposited
```

### Share-Based Accounting

sGHO uses share-based accounting, not rebasing:

| Approach | How yield appears |
|----------|-------------------|
| **Rebasing** | Token balance increases, price stays $1 |
| **Share-based (sGHO)** | Token balance constant, redemption value increases |

**Example:**
- Day 1: Deposit 1,000 GHO â†’ receive 1,000 sGHO
- Day 365 (at 5% APY): 1,000 sGHO redeems for 1,050 GHO
- Your sGHO balance never changed; its GHO-equivalent value increased

This is the same model used by other yield-bearing tokens like Compound's cTokens or Yearn's yVault tokens.

### Deposit Process

1. Acquire GHO (borrow on Aave, buy on DEX, or bridge from Arbitrum)
2. Go to app.aave.com â†’ sGHO section
3. Approve GHO spending (first time only)
4. Deposit GHO amount
5. Receive sGHO tokens to wallet

### Withdrawal Process

1. Go to app.aave.com â†’ sGHO section
2. Enter sGHO amount to withdraw
3. Confirm transaction
4. Receive GHO to wallet (principal + accrued yield)

**Withdrawal time:** Instant (no cooldown, no queue)

---

## Yield Source

### Where the Yield Comes From

sGHO yield is funded through the **Aave Savings Rate (ASR)**, which draws from multiple sources:

| Source | Description |
|--------|-------------|
| **GHO borrow revenue** | Partial allocation of interest paid by GHO borrowers |
| **USDC native yield** | Linked to Aave V3 USDC lending rates on Ethereum |
| **Protocol revenue** | Aave DAO treasury supplements to maintain competitive rates |

### Rate Setting Mechanism

The ASR is **governance-determined**, not algorithmically derived:

- Aave DAO votes on target rate
- Rate can be adjusted via governance proposals
- Currently set at premium to competitors (sUSDS, etc.) to drive GHO adoption
- Rate may fluctuate based on sGHO deposits (larger base = lower rate, or DAO increases funding)

### Why Aave Subsidizes the Rate

From Aave's perspective, GHO is highly profitable:

> "The revenue from 1 GHO borrowed on the protocol equals that of 10 USDC."
> â€” Marc Zeller, Aave Chan Initiative

Growing GHO adoption benefits Aave disproportionately, so they're willing to offer premium savings rates funded by protocol revenue. This is a strategic growth subsidy, not pure market yield.

---

## sGHO vs stkGHO vs Holding GHO

### Comparison Table

| Feature | GHO (plain) | sGHO | stkGHO |
|---------|-------------|------|--------|
| **Yield** | 0% | ~5-6% APY | Higher (variable) |
| **Slashing risk** | None | None | Yes (bad debt coverage) |
| **Lockup** | None | None | Cooldown period |
| **Rehypothecation** | N/A | No | Yes (used for safety module) |
| **Risk level** | Lowest | Low | Medium |
| **Use case** | Liquidity, spending | Passive savings | Active staking, higher yield |

### When to Use Each

**Plain GHO:**
- Need immediate liquidity for DeFi operations
- Using as collateral elsewhere
- Short-term holding

**sGHO:**
- Passive savings with minimal risk
- Want yield without active management
- Conservative risk profile
- Need instant withdrawal capability

**stkGHO:**
- Willing to accept slashing risk for higher returns
- Supporting Aave safety module
- Longer time horizon
- Higher risk tolerance

---

## Risks

### 1. Smart Contract Risk

**What it is:** Bug or exploit in sGHO contract leads to loss of funds

**Severity:** Medium-Low

**Mitigations:**
- Aave has 8+ years operational history
- 70+ security audits across protocol
- sGHO contract is relatively simple (deposit/withdraw/accrue)
- No rehypothecation reduces attack surface
- Deposited GHO stays in contract, not deployed elsewhere

**Residual risk:** Non-zero. All smart contracts carry exploit risk regardless of audits.

### 2. GHO Peg Risk

**What it is:** GHO depegs from $1.00, making your sGHO worth less in USD terms

**Severity:** Medium

**How GHO maintains peg:**
- Overcollateralized borrowing (150%+ collateral required to mint)
- Arbitrage incentives (borrow cheap when >$1, repay cheap when <$1)
- Aave DAO can adjust borrow rates to influence supply/demand
- Facilitator caps limit total GHO supply

**Historical performance:**
- GHO launched July 2023
- Has experienced minor deviations (Â±2-3%)
- No major depeg events to date
- Smaller market cap ($200-300M) than USDC/USDT means less battle-tested

**Comparison to other stablecoins:**
| Stablecoin | Backing | Peg mechanism |
|------------|---------|---------------|
| USDC | 1:1 USD reserves | Redemption guarantee |
| DAI/USDS | Overcollateralized crypto + RWA | Liquidations + PSM |
| GHO | Overcollateralized crypto on Aave | Borrower collateral + rate adjustments |

GHO is more similar to DAI than USDCâ€”crypto-collateralized, not fiat-backed.

### 3. Rate Risk (Governance)

**What it is:** Aave DAO reduces sGHO yield via governance vote

**Severity:** Low-Medium

**Why it could happen:**
- sGHO deposits grow faster than expected, diluting yield
- Aave decides subsidy is too expensive
- Market conditions change (rates rise elsewhere)
- GHO adoption goals achieved, less need for premium rates

**What you can do:**
- Monitor Aave governance forum for rate proposals
- No lockup means you can exit instantly if rate becomes uncompetitive
- Compare to alternatives (sUSDS, other savings products) regularly

**Current situation:** Aave is in "aggressive growth mode" for GHO, so rate cuts unlikely near-term. But this is strategic, not guaranteed.

### 4. Aave Protocol Risk

**What it is:** Catastrophic failure of Aave protocol affects GHO and sGHO

**Severity:** Low (but non-zero)

**Considerations:**
- Aave is largest DeFi lending protocol ($10B+ TVL)
- Has survived multiple market crashes (2022 bear market, UST collapse)
- Battle-tested risk management (handled $210M liquidations in Feb 2025 with zero bad debt)
- GHO is native to Aaveâ€”if Aave fails catastrophically, GHO likely fails too

**Mitigating factor:** sGHO holders have no slashing exposure. Even if Aave experiences bad debt, sGHO depositors are not directly liable (unlike stkGHO stakers who cover shortfalls).

### 5. Regulatory Risk

**What it is:** Regulatory action affects GHO, Aave, or DeFi savings products

**Severity:** Unknown

**Considerations:**
- GHO is decentralized (no single issuer to sanction)
- Aave DAO is distributed governance
- DeFi regulation still evolving globally
- US regulatory clarity remains uncertain

**Practical impact:** If you're in a jurisdiction that restricts DeFi, access to sGHO could become complicated. Protocol itself is permissionless.

---

## Risk Summary Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Smart contract exploit | Low | High (total loss) | Audits, simple design, no rehypothecation |
| GHO depeg (minor, 2-5%) | Medium | Low | Arbitrage mechanisms, overcollateralization |
| GHO depeg (major, >10%) | Low | High | Exit to USDC if early signs |
| Rate reduction | Medium | Low | Exit instantly, no lockup |
| Aave protocol failure | Very Low | High | Diversify across protocols |
| Regulatory action | Unknown | Variable | Decentralized architecture |

---

## Practical Considerations

### Tax Considerations

**Note:** This is general information, not tax advice. Consult a tax professional.

**Potential tax events:**
- Depositing GHO for sGHO: May be considered a taxable swap in some jurisdictions
- Yield accrual: May be taxable as income as it accrues (share price increase)
- Withdrawal: Capital gains on appreciation since deposit

**Record-keeping:**
- Track deposit date and GHO amount
- Track sGHO tokens received
- Track withdrawal date and GHO received
- Calculate yield earned for income reporting

### Acquiring GHO

**Methods to get GHO:**

| Method | Pros | Cons |
|--------|------|------|
| **Borrow on Aave** | Native, competitive rates | Need collateral, interest cost |
| **Buy on DEX** | Simple, no collateral needed | Slippage on large amounts |
| **Bridge from Arbitrum** | Access Arbitrum GHO liquidity | Bridge fees, time delay |
| **Swap from other stables** | Use existing holdings | DEX fees, slippage |

**Best approach for most users:** Swap USDC â†’ GHO on Uniswap or Curve, then deposit to sGHO.

---

## Monitoring and Management

### What to Monitor

| Metric | Where to Check | Frequency | Action Trigger |
|--------|----------------|-----------|----------------|
| sGHO APY | app.aave.com | Weekly | <4% sustained = review alternatives |
| GHO peg | CoinGecko, DEX prices | Weekly | <$0.98 or >$1.02 = investigate |
| Governance proposals | governance.aave.com | Monthly | Rate change proposals = assess impact |
| Alternative rates | DeFiLlama yields | Monthly | Better risk-adjusted options = consider reallocation |

### Red Flags (Consider Exiting)

- GHO trades below $0.95 for more than 24 hours
- Aave governance proposes significant rate cut (>2%)
- Smart contract vulnerability disclosed
- Major Aave protocol incident (bad debt event, exploit)
- Regulatory action targeting Aave or GHO specifically

### Green Flags (Confidence Signals)

- GHO market cap growing steadily
- sGHO TVL increasing (adoption signal)
- Aave maintains or increases ASR rate
- No security incidents over extended period
- GHO peg stability during market volatility

---

## Frequently Asked Questions

### Is sGHO safe?

sGHO is designed as Aave's lowest-risk yield product. No slashing, no rehypothecation, instant withdrawals. However, "safe" is relativeâ€”you're still exposed to smart contract risk, GHO peg risk, and Aave protocol risk. It's low-risk within DeFi, not risk-free.

### What's the difference between sGHO and stkGHO?

stkGHO is Aave's staking product where your GHO backs the safety module and you accept slashing risk in exchange for higher yields. sGHO is purely a savings productâ€”your GHO sits in a contract earning yield with no slashing exposure. sGHO = lower risk, lower yield. stkGHO = higher risk, higher yield.

### Can I lose money with sGHO?

Yes, in several scenarios:
- Smart contract exploit (your sGHO becomes worthless)
- GHO depeg (your sGHO is worth less in USD terms)
- Opportunity cost (better yields available elsewhere)

You cannot lose money from slashing or bad debtâ€”that risk is isolated to stkGHO holders.

### How is the yield rate determined?

The Aave Savings Rate (ASR) is set by Aave DAO governance, not by market forces. The DAO can vote to increase or decrease the rate. Currently, Aave is subsidizing a premium rate to grow GHO adoption.

### Is the yield sustainable?

Partially. Some yield comes from organic protocol revenue (GHO borrow interest, USDC lending). Some is subsidized from Aave treasury to offer competitive rates. If Aave decides the subsidy is too expensive, rates could decrease.

### Can I use sGHO as collateral?

As of December 2025, sGHO is primarily a savings token. Check Aave documentation for current collateral eligibility, as this may change via governance.

### What happens if Aave gets hacked?

If the sGHO contract specifically is exploited, you could lose your deposit. If broader Aave infrastructure is compromised, GHO itself could be affected. sGHO's simple design (no lending, no rehypothecation) reduces attack surface compared to more complex DeFi products.

### How do I track my earnings?

Your sGHO token balance stays constant. To see earnings:
1. Check the sGHO/GHO exchange rate on app.aave.com
2. Multiply your sGHO balance by current rate
3. Compare to your original deposit

Or simply withdrawâ€”you'll receive more GHO than you deposited.

---

## Resources

**Official:**
- Aave App: https://app.aave.com
- Aave Documentation: https://docs.aave.com
- Aave Governance: https://governance.aave.com
- GHO Documentation: https://docs.gho.xyz

**Monitoring:**
- DeFiLlama (yield comparison): https://defillama.com/yields
- CoinGecko (GHO price): https://coingecko.com/en/coins/gho

**Community:**
- Aave Discord: https://aave.com/discord
- Aave Governance Forum: https://governance.aave.com

---

**Document Version:** 1.0  
**Last Updated:** December 14, 2025  
**Disclaimer:** This document is for informational purposes only. It is not financial advice. DeFi carries significant risks including total loss of funds. Do your own research before depositing funds into any protocol.