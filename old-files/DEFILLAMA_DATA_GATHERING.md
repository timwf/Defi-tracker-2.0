# DefiLlama Yield Data Gathering

**Purpose:** Extract pool data and historical yields from DeFiLlama  
**Time Required:** ~5 minutes total  
**Stages:** 3 (Discovery → Historical Fetch → Validation)  
**Output:** Validated JSON files for analysis  
**Updated:** November 30, 2025

---

## ⚠️ CRITICAL: Who Does What

### YOU Run ALL JavaScript

**CLAUDE CANNOT ACCESS DEFILLAMA API**

All data fetching happens in **YOUR browser console**. Claude only generates the scripts for you to run.

| Stage | Claude Does | You Do |
|-------|-------------|--------|
| **1. Discovery** | Generate script with positions | Run JS in console → Upload JSON |
| **2. Historical Fetch** | Generate script | Copy script → Run in console → Upload JSON |
| **3. Validation** | Verify data completeness | Review report → Proceed or retry |
| **4. Analysis** | Analyze data | Review results |

**If Claude tries to run fetch commands:** Remind it that only YOU can access DeFiLlama in browser.

---

## Stage 1: Discovery

### What It Does

Filters DeFiLlama pools by:
- Chains: Ethereum, Arbitrum, Optimism, Base
- Protocols: Aave, Morpho, Euler, Fluid, Compound, Spark, Silo, Gearbox
- Stablecoins only
- TVL > $3M
- APY 4.0-15.0%
- **Always includes your current positions** (even if below 4%)

### Claude's Action

**When you say "Run yield tool", Claude will:**
1. **Read CURRENT_STATUS.md** to get your current position pool IDs
2. Generate Stage 1 script with those IDs embedded
3. Provide the script for you to run

**CRITICAL:** Claude must ALWAYS check CURRENT_STATUS.md first - never use stale pool IDs from this doc.

### Your Action

1. Say: **"Run yield tool"**
2. Claude generates custom Stage 1 script with your positions
3. Copy the script
4. Open browser (any page)
5. Press F12 → Go to Console tab
6. Paste script and press Enter
7. Review console output (shows protocol/chain breakdown)
8. Script downloads `pool-ids-YYYY-MM-DD.json`
9. Upload JSON to Claude with message: **"Stage 1 complete"**

### Script Template

Claude generates a script based on this template, embedding your current positions from CURRENT_STATUS.md:

```javascript
fetch('https://yields.llama.fi/pools')
  .then(r => r.json())
  .then(d => {
    // Your current positions (from CURRENT_STATUS.md)
    const KNOWN_POSITIONS = [
      'aa70268e-4b52-42bf-a116-608b370f9501',
      'c47d5b9a-b2c4-4948-8a64-82ad8e6a6d0d',
      'a0f53224-c152-416e-8599-4563e70c6040'
    ];
    
    // Filter for high-yield pools (4-15%)
    const highYieldPools = d.data.filter(p => 
      ['Ethereum', 'Arbitrum', 'Optimism', 'Base'].includes(p.chain) &&
      ['aave-v3', 'morpho-v1', 'euler-v2', 'fluid-lending', 'compound-v3', 'sparklend', 'silo-v2', 'gearbox-v3'].includes(p.project) &&
      p.stablecoin &&
      p.tvlUsd > 3000000 &&
      p.apy >= 4.0 &&
      p.apy <= 15.0
    );
    
    // Also grab your current positions (regardless of APY)
    const yourPositions = d.data.filter(p => KNOWN_POSITIONS.includes(p.pool));
    
    // Merge and dedupe
    const allPools = [...highYieldPools, ...yourPositions]
      .filter((pool, index, self) => 
        index === self.findIndex(p => p.pool === pool.pool)
      )
      .map(p => ({
        id: p.pool,
        name: p.symbol,
        project: p.project,
        chain: p.chain,
        tvl_m: (p.tvlUsd/1e6).toFixed(1),
        apy: p.apy.toFixed(2)
      }));
    
    // Generate summary report
    const byProtocol = {};
    const byChain = {};
    
    allPools.forEach(p => {
      byProtocol[p.project] = (byProtocol[p.project] || 0) + 1;
      byChain[p.chain] = (byChain[p.chain] || 0) + 1;
    });
    
    console.log(`\n📊 Found ${allPools.length} pools total\n`);
    console.log('By Protocol:');
    Object.entries(byProtocol).sort((a,b) => b[1] - a[1]).forEach(([protocol, count]) => {
      console.log(`  - ${protocol}: ${count} pools`);
    });
    
    console.log('\nBy Chain:');
    Object.entries(byChain).forEach(([chain, count]) => {
      console.log(`  - ${chain}: ${count} pools`);
    });
    
    console.log('\nYour positions included:');
    yourPositions.forEach(p => {
      const wasFiltered = p.apy < 4.0 || p.apy > 15.0;
      const status = wasFiltered ? '✅ (outside 4-15% range - forced include)' : '✅ (within 4-15% range)';
      console.log(`  ${p.symbol} - ${p.apy.toFixed(2)}% ${status}`);
    });
    
    const output = {
      extracted: new Date().toISOString(),
      pool_count: allPools.length,
      apy_floor: 4.0,
      apy_cap: 15.0,
      tvl_floor_usd: 3000000,
      pools: allPools
    };
    
    const blob = new Blob([JSON.stringify(output, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pool-ids-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    
    console.log('\n✅ Download started: pool-ids-' + new Date().toISOString().split('T')[0] + '.json');
    console.log('Filters: 4-15% APY, $3M+ TVL, 8 protocols, 4 chains');
  });
```

### Example Console Output

```
📊 Found 51 pools total

By Protocol:
  - morpho-v1: 15 pools
  - aave-v3: 10 pools
  - sparklend: 8 pools
  - compound-v3: 8 pools
  - fluid-lending: 6 pools
  - euler-v2: 4 pools

By Chain:
  - Ethereum: 35 pools
  - Arbitrum: 16 pools
  - Optimism: 8 pools
  - Base: 12 pools

Your positions included:
  GTUSDCC - 5.01% ✅ (within 4-15% range)
  USDC - 3.38% ✅ (outside 4-15% range - forced include)
  EVK Vault eUSDC-2 - 3.66% ✅ (outside 4-15% range - forced include)

✅ Download started: pool-ids-2025-11-30.json
Filters: 4-15% APY, $3M+ TVL, 8 protocols, 4 chains
```

### Output

**File:** `pool-ids-YYYY-MM-DD.json`

**Contains:**
- List of pool IDs meeting criteria
- Pool names and protocols
- Current APY and TVL
- Timestamp of extraction

---

## Stage 2: Historical Fetch

### What It Does

Fetches time-series yield data from DeFiLlama for all verified pools. Grabs all available historical data (daily snapshots).

### Claude's Action

When you upload Stage 1 JSON, Claude will:
1. Extract all pool IDs
2. Generate historical fetch script with embedded IDs (see template below)
3. Include retry logic for rate limits

### Script Template

Claude generates a script based on this template. The pool IDs are embedded from your Stage 1 discovery file.

```javascript
(async () => {
  // Pool IDs from discovery stage
  const poolIds = [
    // Claude inserts your verified pool IDs here
    'aa70268e-4b52-42bf-a116-608b370f9501',
    'c47d5b9a-b2c4-4948-8a64-82ad8e6a6d0d',
    // ... more IDs
  ];

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  
  const results = [];
  const failed = [];
  
  console.log(`Starting historical fetch for ${poolIds.length} pools...`);
  console.log('Rate limit protection: 1.5 second delay between requests');
  
  for (let i = 0; i < poolIds.length; i++) {
    const poolId = poolIds[i];
    console.log(`Fetching ${i + 1}/${poolIds.length}: ${poolId}`);
    
    try {
      const response = await fetch(`https://yields.llama.fi/chart/${poolId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const chartData = await response.json();
      
      // Also get pool metadata
      const poolResponse = await fetch('https://yields.llama.fi/pools');
      const poolsData = await poolResponse.json();
      const poolInfo = poolsData.data.find(p => p.pool === poolId);
      
      results.push({
        pool_id: poolId,
        symbol: poolInfo?.symbol || 'Unknown',
        project: poolInfo?.project || 'Unknown',
        chain: poolInfo?.chain || 'Unknown',
        tvl_usd: poolInfo?.tvlUsd || 0,
        current_apy: poolInfo?.apy || 0,
        history: chartData.data || []
      });
      
      // 1.5 second delay between ALL requests
      if (i < poolIds.length - 1) {
        await delay(1500);
      }
      
    } catch (error) {
      console.error(`Failed to fetch ${poolId}:`, error.message);
      failed.push({ pool_id: poolId, error: error.message });
      
      // Extra delay after error
      await delay(2000);
    }
  }
  
  // Retry failed pools once
  if (failed.length > 0) {
    console.log(`\nRetrying ${failed.length} failed pools...`);
    
    for (let i = 0; i < failed.length; i++) {
      const { pool_id } = failed[i];
      console.log(`Retry ${i + 1}/${failed.length}: ${pool_id}`);
      
      try {
        const response = await fetch(`https://yields.llama.fi/chart/${pool_id}`);
        const chartData = await response.json();
        
        const poolResponse = await fetch('https://yields.llama.fi/pools');
        const poolsData = await poolResponse.json();
        const poolInfo = poolsData.data.find(p => p.pool === pool_id);
        
        results.push({
          pool_id: pool_id,
          symbol: poolInfo?.symbol || 'Unknown',
          project: poolInfo?.project || 'Unknown',
          chain: poolInfo?.chain || 'Unknown',
          tvl_usd: poolInfo?.tvlUsd || 0,
          current_apy: poolInfo?.apy || 0,
          history: chartData.data || []
        });
        
        await delay(1500);
        
      } catch (error) {
        console.error(`Retry failed for ${pool_id}:`, error.message);
      }
    }
  }
  
  // Prepare output
  const output = {
    extracted: new Date().toISOString(),
    pool_count: results.length,
    failed_count: failed.length,
    pools: results
  };
  
  // Health check summary
  const totalAttempted = poolIds.length;
  const successRate = ((results.length / totalAttempted) * 100).toFixed(0);
  
  // Data coverage stats
  const dataCounts = results.map(p => p.history.length).filter(n => n > 0);
  const avgDays = dataCounts.length > 0 ? Math.round(dataCounts.reduce((a, b) => a + b, 0) / dataCounts.length) : 0;
  const maxDays = dataCounts.length > 0 ? Math.max(...dataCounts) : 0;
  const minDays = dataCounts.length > 0 ? Math.min(...dataCounts) : 0;
  
  console.log(`\n✅ Historical fetch complete!\n`);
  console.log(`Success: ${results.length}/${totalAttempted} pools (${successRate}%)`);
  
  if (failed.length > 0) {
    console.log(`Failed: ${failed.length} pools`);
  } else {
    console.log('Failed: 0 pools');
  }
  
  if (dataCounts.length > 0) {
    console.log(`\nData coverage:`);
    console.log(`  - Average: ${avgDays} days of history`);
    console.log(`  - Range: ${minDays} to ${maxDays} days`);
  }
  
  if (failed.length > 0) {
    console.log('\nFailed pools:');
    failed.forEach(f => {
      console.log(`  - ${f.pool_id.substring(0, 8)}... (${f.error})`);
    });
  }
  
  console.log('\n⚠️ Upload to Claude for validation before analysis');
  
  // Download JSON
  const blob = new Blob([JSON.stringify(output, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'yield-history-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  
  console.log('Download started: yield-history-' + new Date().toISOString().split('T')[0] + '.json');
})();
```

**Key features:**
- **1.5 second delay** between every request (line 34-36)
- **2 second delay** after errors (line 42)
- **Retry logic** for failed pools (lines 46-77)
- **Progress logging** shows X/Y pools fetched
- **Metadata included** (symbol, project, chain, TVL, current APY)
- **Auto-download** JSON when complete

### Your Action

1. Upload `pool-ids-YYYY-MM-DD.json` to Claude
2. Say: **"Stage 1 complete"**
3. Claude provides historical fetch script
4. Copy the script
5. Paste in browser console (F12 → Console)
6. Press Enter
7. **Wait 1-3 minutes** (progress shown in console, 1.5s delay per pool)
8. Script downloads `yield-history-YYYY-MM-DD.json`
9. Upload to Claude with message: **"Stage 2 complete - validate"**

### What Happens During Fetch

The script:
- Fetches historical data for each pool ID
- **1.5 second delay between each request** (prevents rate limits)
- Shows progress: "Fetching 1/47... 2/47..."
- Retries on rate limits (with backoff)
- Combines all data into single JSON

**This is the longest stage** - be patient, let it complete. For 50 pools, expect ~90 seconds.

### Output

**File:** `yield-history-YYYY-MM-DD.json`

**Contains:**
- Pool metadata (name, protocol, chain, TVL)
- Daily historical APY data
- Data points typically go back 90-180+ days
- Timestamp of fetch

---

## Stage 3: Validation

### What It Does

Cross-checks the historical fetch output to ensure data completeness before analysis. Verifies all pools fetched successfully and have usable historical data.

### Claude's Action

When you upload Stage 2 JSON, Claude will:
1. **Compare pool counts** - Stage 2 output vs Stage 1 discovered list
2. **Check for missing pools** - Identify any that failed to fetch
3. **Verify data quality:**
   - Each pool has historical data points (not empty arrays)
   - Date ranges are reasonable (typically 60-180+ days)
   - No obvious data anomalies
4. **Generate validation report:**
   - ✅ Pools successfully fetched
   - ⚠️ Pools with missing/incomplete data
   - ❌ Pools that failed completely
   - Recommendation: Proceed or retry specific pools

### Your Action

1. Upload `yield-history-YYYY-MM-DD.json` to Claude
2. Say: **"Stage 2 complete - validate"**
3. Review Claude's validation report
4. **Decision point:**
   - If clean (all pools verified): Proceed to analysis
   - If issues: Choose to retry failed pools or proceed without them
5. When ready: Say **"Validation complete - run analysis"**

### Validation Criteria

| Check | Pass Criteria | Action if Fail |
|-------|---------------|----------------|
| Pool count match | Stage 2 ≥ 90% of Stage 1 pools | List missing, recommend retry |
| Historical data exists | Each pool has data[] with length > 0 | Flag pools, suggest exclude |
| Date range | Most recent data within 7 days | Flag stale data |
| Data points | Each pool has ≥ 30 days of data | Flag insufficient history |

### Example Validation Report

```
✅ VALIDATION COMPLETE

Pools verified: 47/50 (94%)

✅ Successfully fetched (47):
- Aave USDC L1: 156 days of data
- Morpho GTUSDCC Arb: 143 days of data
- Euler eUSDC-2: 89 days of data
... (44 more)

⚠️ Missing pools (3):
- Pool ID: abc123... (HTTP 404 - pool may be deprecated)
- Pool ID: def456... (Rate limit - recommend retry)
- Pool ID: ghi789... (No historical data available)

RECOMMENDATION: Proceed to analysis with 47 pools. 
Missing pools represent <5% of dataset and won't impact analysis.

Ready to proceed? Reply: "Validation complete - run analysis"
```

### Handling Failed Pools

**Any failed pools should be reviewed individually:**

- **Check the failure reason** (shown in Stage 2 console output)
- **Evaluate importance:**
  - Your current position? → Must retry
  - High-yield target pool? → Worth retrying
  - Low-yield/deprecated pool? → Can skip

**Common failure reasons:**
- `HTTP 404` - Pool deprecated/removed, safe to skip
- `Rate limit` - Temporary, retry recommended
- `Timeout` - Network issue, retry recommended
- `No data available` - Pool too new, safe to skip

**Your decision:**
- Retry specific failed pools (re-run Stage 2 with just those IDs)
- Skip failed pools and proceed to analysis
- Re-run entire Stage 2 if systemic issue (many rate limits)

**Stage 3 validation will flag all failures for your review - you decide next steps.**

---

## Handoff to Analysis

Once Stage 3 validation passes:

1. Upload `yield-history-YYYY-MM-DD.json` to Claude (if not already done)
2. Say: **"Validation complete - run analysis"**
3. Claude switches to Analysis mode (see DEFILLAMA_ANALYSIS.md)

---

## Quick Reference

### Trigger Phrases

| You Say | What Happens |
|---------|--------------|
| "Run yield tool" | Claude provides Stage 1 script |
| "Stage 1 complete" + JSON | Claude generates Stage 2 script |
| "Stage 2 complete - validate" + JSON | Claude runs validation checks |
| "Validation complete - run analysis" + JSON | Claude runs full analysis |

### Customization

**Change APY floor** (Stage 1):
```javascript
p.apy >= 4.0  // Change to 3.0, 5.0, etc.
```

**Change APY cap** (Stage 1):
```javascript
p.apy <= 15.0  // Change to 12.0, 20.0, etc.
```

**Change TVL floor** (Stage 1):
```javascript
p.tvlUsd > 3000000  // Change to 2M, 5M, etc.
```

**Change target chains** (Stage 1):
```javascript
['Ethereum', 'Arbitrum', 'Optimism', 'Base'].includes(p.chain)  // Add/remove chains
```

**Change target protocols** (Stage 1):
```javascript
['aave-v3', 'morpho-v1', ...].includes(p.project)  // Add/remove protocols
```

**Add known pool:**
Tell Claude: "Add pool [name] with ID [xxx] to known pools registry"

### Troubleshooting

**"Script not downloading file"**
- Check browser didn't block download
- Look in Downloads folder
- Try running script again

**"Fetch failed / Network error"**
- Check internet connection
- DeFiLlama might be rate limiting - wait 30 seconds and retry
- Stage 3 has built-in retry logic

**"Console shows errors"**
- Copy full error message
- Send to Claude for debugging
- Usually means DeFiLlama API changed

**"Stage 2 taking forever"**
- Normal for 40-50+ pools with 1.5s delay per request
- Should complete in 2-4 minutes maximum
- If >5 minutes, refresh page and try again

---

## Responsibilities Reminder

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  YOU = Browser console JavaScript execution                │
│  CLAUDE = Script generation and data analysis              │
│                                                             │
│  Claude CANNOT access DeFiLlama API directly               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**If Claude says "I'll fetch the data":**  
Reply: "You can't access DeFiLlama - generate the script for me to run"

---

## What's Next

After completing all 3 stages and uploading `yield-history-YYYY-MM-DD.json`:

→ See **DEFILLAMA_ANALYSIS.md** for how Claude processes the data

---

**Document Version:** 1.1  
**Last Updated:** December 1, 2025  
**Changes:** $3M TVL floor, 15% APY cap, added silo-v2 and gearbox-v3 protocols  
**Part of:** DefiLlama Yield Tool (2-part system)
