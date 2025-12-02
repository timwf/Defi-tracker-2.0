# DefiLlama Yield Analysis Scripts

**Purpose:** Python scripts for risk-adjusted yield analysis  
**Created:** November 30, 2025  
**Updated:** December 1, 2025 (v2.0 - expected value framework, protocol multipliers, research-validated)  
**Usage:** Copy and run in `/home/claude/` after uploading yield history JSON

---

## Script 1: analyze_yields.py

**Purpose:** Calculate risk-adjusted yields from historical data using expected value framework  
**Input:** `/mnt/user-data/uploads/yield-history-YYYY-MM-DD.json`  
**Output:** `/home/claude/analysis_results.json`  
**Time:** ~5 seconds

### Version 2.0 Changes

**Major update:** Expected value calculation framework
- Models protocol failure as 100% capital loss (not just yield loss)
- Protocol-specific risk multipliers based on empirical data
- Non-linear volatility penalty for extreme cases
- Incentive dependency risk modeling

**Research-validated additions:**
- B.Protocol added to premium curators (clean track record)
- Protocol multipliers: Aave/Compound (0.9x), Euler V2 (1.1x), Morpho (0.95x)
- Flow and TVL risk adjustments

### When to Update

**CURRENT_POSITIONS** (lines 37-41):
- Update when your portfolio positions change
- Add/remove pool IDs as you enter/exit protocols

**MORPHO_CURATORS** (lines 12-22):
- Add new curator prefixes if they emerge
- Rare - maybe quarterly

**PROTOCOL_TIERS** (lines 8-13):
- Update if risk framework tier definitions change
- Very rare - annually or less

**PROTOCOL_MULTIPLIERS** (lines 24-32):
- Add new protocols as you research them
- Update multipliers based on exploit history or major upgrades

### Full Script

```python
#!/usr/bin/env python3
"""
DefiLlama Yield Analysis - v2.0 Expected Value Framework
Implements risk-adjusted yield framework from DEFILLAMA_ANALYSIS.md
Updated with empirical research from December 2025
"""

import json
import statistics
from datetime import datetime, timedelta
from typing import Dict, List, Tuple

# Protocol tier definitions (research-validated Dec 2025)
PROTOCOL_TIERS = {
    'aave-v3': ('Anchor', 0.005),      # 0.5% annual failure rate
    'compound-v3': ('Anchor', 0.005),
    'morpho-v1': ('Established', 0.02),  # 2% annual failure rate
    'euler-v2': ('Established', 0.02),
    'sparklend': ('Established', 0.02),
    'fluid-lending': ('Emerging', 0.05),  # 5% annual failure rate
}

# Morpho curator prefixes (research-validated + B.Protocol added)
MORPHO_CURATORS = {
    'GT': ('Gauntlet', 1.0),
    'STEAK': ('Steakhouse', 1.0),
    'BB': ('Block Analitica', 1.0),
    'BBQ': ('Block Analitica', 1.0),
    'BPROT': ('B.Protocol', 1.0),  # Added Dec 2025 - clean track record
    'RE7': ('RE7 Labs', 1.0),
    'MEV': ('MEV Capital', 1.0),
    'USUAL': ('Usual', 1.0),
}

# Protocol-specific risk multipliers (research-based Dec 2025)
PROTOCOL_MULTIPLIERS = {
    'aave-v3': 0.9,       # 8+ years, no core exploits
    'compound-v3': 0.9,   # V3 redesign, 7+ years combined
    'euler-v2': 1.1,      # V1 exploit history, comprehensive V2 overhaul
    'morpho-v1': 0.95,    # Matching engine, inherits base protocol risk
    'sparklend': 1.0,     # Aave fork (base rate, but correlation risk)
    'fluid-lending': 1.0, # Base Emerging rate appropriate
    'silo-v2': 1.0,       # Insufficient data for adjustment
    'gearbox-v3': 1.0,    # Insufficient data for adjustment
}

# Current positions - UPDATE THIS WHEN YOUR POSITIONS CHANGE
CURRENT_POSITIONS = [
    'a0f53224-c152-416e-8599-4563e70c6040',  # Euler EVK Vault eUSDC-2
    'c47d5b9a-b2c4-4948-8a64-82ad8e6a6d0d',  # Morpho GTUSDCC Arb
    'aa70268e-4b52-42bf-a116-608b370f9501',  # Aave V3 USDC L1
]

def identify_curator(symbol: str, project: str) -> Tuple[str, float]:
    """Identify Morpho curator from symbol prefix"""
    if project != 'morpho-v1':
        return '-', 1.0
    
    for prefix, (name, mult) in MORPHO_CURATORS.items():
        if symbol.upper().startswith(prefix):
            return name, mult
    
    return 'Unknown', 0.8

def calculate_base90(history: List[Dict], cutoff_date: datetime) -> Tuple[float, int]:
    """Calculate 90-day average base APY"""
    ninety_days_ago = cutoff_date - timedelta(days=90)
    
    # Filter to last 90 days
    recent = [
        h for h in history 
        if datetime.fromisoformat(h['timestamp'].replace('Z', '+00:00')) >= ninety_days_ago
    ]
    
    if not recent:
        return 0.0, 0
    
    # Extract apyBase values (use apy if apyBase is None)
    base_values = []
    for h in recent:
        base = h.get('apyBase')
        if base is None:
            base = h.get('apy', 0)
        base_values.append(base)
    
    if not base_values:
        return 0.0, 0
    
    avg = statistics.mean(base_values)
    return round(avg, 4), len(base_values)

def calculate_volatility(history: List[Dict], cutoff_date: datetime) -> float:
    """Calculate standard deviation of apyBase over 90 days"""
    ninety_days_ago = cutoff_date - timedelta(days=90)
    
    recent = [
        h for h in history 
        if datetime.fromisoformat(h['timestamp'].replace('Z', '+00:00')) >= ninety_days_ago
    ]
    
    if len(recent) < 2:
        return 0.0
    
    base_values = []
    for h in recent:
        base = h.get('apyBase')
        if base is None:
            base = h.get('apy', 0)
        base_values.append(base)
    
    if len(base_values) < 2:
        return 0.0
    
    return round(statistics.stdev(base_values), 4)

def calculate_organic_pct(history: List[Dict], cutoff_date: datetime) -> float:
    """Calculate average organic percentage over 90 days"""
    ninety_days_ago = cutoff_date - timedelta(days=90)
    
    recent = [
        h for h in history 
        if datetime.fromisoformat(h['timestamp'].replace('Z', '+00:00')) >= ninety_days_ago
    ]
    
    if not recent:
        return 100.0
    
    organic_pcts = []
    for h in recent:
        base = h.get('apyBase')
        total = h.get('apy')
        
        if base is None or total is None or total == 0:
            organic_pcts.append(100.0)
        else:
            pct = (base / total) * 100 if total > 0 else 100.0
            organic_pcts.append(min(100.0, pct))
    
    if not organic_pcts:
        return 100.0
    
    return round(statistics.mean(organic_pcts), 0)

def calculate_tvl_change(history: List[Dict], cutoff_date: datetime) -> float:
    """Calculate 30-day TVL change percentage"""
    thirty_days_ago = cutoff_date - timedelta(days=30)
    
    # Get current TVL (most recent)
    if not history:
        return 0.0
    current_tvl = history[-1].get('tvlUsd', 0)
    
    # Find TVL from 30 days ago
    old_data = [
        h for h in history
        if datetime.fromisoformat(h['timestamp'].replace('Z', '+00:00')) <= thirty_days_ago
    ]
    
    if not old_data:
        return 0.0
    
    old_tvl = old_data[-1].get('tvlUsd', current_tvl)
    
    if old_tvl == 0:
        return 0.0
    
    change = ((current_tvl - old_tvl) / old_tvl) * 100
    return round(change, 1)

def get_volatility_flag(sigma: float) -> str:
    """Get volatility emoji flag"""
    if sigma < 1.5:
        return 'ðŸŸ¢'
    elif sigma < 3.0:
        return 'ðŸŸ¡'
    else:
        return 'ðŸ”´'

def get_organic_flag(organic_pct: float) -> str:
    """Get organic percentage emoji flag"""
    if organic_pct >= 95:
        return 'ðŸŸ¢'
    elif organic_pct >= 80:
        return 'ðŸŸ¡'
    elif organic_pct >= 50:
        return 'ðŸŸ '
    else:
        return 'ðŸ”´'

def get_tvl_flag(tvl_usd: float) -> str:
    """Get TVL size emoji flag"""
    tvl_m = tvl_usd / 1_000_000
    if tvl_m >= 50:
        return 'ðŸŸ¢'
    elif tvl_m >= 10:
        return 'ðŸŸ¡'
    else:
        return 'ðŸŸ '

def get_flow_flag(change_pct: float, days: int) -> str:
    """Get TVL flow emoji flag"""
    if days < 30:
        return 'âš ï¸'
    if change_pct >= -10:
        return 'ðŸŸ¢'
    elif change_pct >= -25:
        return 'ðŸŸ¡'
    else:
        return 'ðŸ”´'

def calculate_confidence(sigma: float, organic_pct: float, tvl_usd: float, 
                        days: int, flow_change: float, curator: str, 
                        project: str) -> int:
    """Calculate confidence score 0-100"""
    score = 100
    
    # Volatility penalties
    if sigma > 3.0:
        score -= 20
    elif sigma >= 1.5:
        score -= 10
    
    # Organic penalties
    if organic_pct < 80:
        score -= 15
    elif organic_pct < 95:
        score -= 5
    
    # TVL penalties
    if tvl_usd < 10_000_000:
        score -= 10
    
    # Historical data penalties
    if days < 60:
        score -= 10
    
    # Flow penalties
    if days >= 30 and flow_change < -30:
        score -= 15
    
    # Curator penalties
    if project == 'morpho-v1' and curator == 'Unknown':
        score -= 15
    
    return max(0, score)

def calculate_risk_adj_yield_v2(base90: float, tier_loss: float, protocol_mult: float,
                                curator_adj: float, sigma: float, tvl_usd: float, 
                                organic_pct: float, flow_change: float, days: int) -> float:
    """
    Expected value model (v2.0):
    RiskAdj = (Base90 Ã— P(success)) - (100% Ã— P(failure)) - Volatility_penalty - Incentive_decay
    
    Where P(failure) is adjusted by:
    - Protocol tier (base failure rate)
    - Protocol-specific multiplier (exploit history, maturity)
    - Curator quality (Morpho only)
    - TVL size (larger = safer attack economics)
    - Flow trends (exodus = higher risk)
    - Data quality (less history = less confidence)
    """
    
    # Base failure rate from tier
    base_failure_rate = tier_loss
    
    # TVL adjustment (larger pools are safer)
    # $10M â†’ 1.2x failure rate
    # $50M â†’ 1.0x failure rate  
    # $200M â†’ 0.8x failure rate
    tvl_m = tvl_usd / 1_000_000
    if tvl_m >= 200:
        tvl_adj = 0.8
    elif tvl_m >= 50:
        tvl_adj = 1.0
    else:
        # Linear interpolation between 1.2 (at $10M) and 1.0 (at $50M)
        tvl_adj = max(0.8, min(1.2, 1.0 + (50 - tvl_m) / 200))
    
    # Flow adjustment (capital exodus = higher risk)
    # Stable/growing â†’ 1.0x
    # -10 to -25% â†’ 1.2x failure rate
    # <-25% â†’ 1.5x failure rate
    if flow_change >= -10:
        flow_adj = 1.0
    elif flow_change >= -25:
        flow_adj = 1.2
    else:
        flow_adj = 1.5
    
    # Data quality adjustment (less history = less confidence in failure rate)
    data_adj = 1.0 if days >= 90 else 1.2
    
    # Combined failure probability
    # curator_adj: premium = 0.8 (20% reduction), unknown = 1.0 (no reduction)
    failure_prob = base_failure_rate * protocol_mult * curator_adj * tvl_adj * flow_adj * data_adj
    failure_prob = min(0.5, failure_prob)  # Cap at 50% (sanity check)
    success_prob = 1.0 - failure_prob
    
    # Expected yield accounting for protocol failure
    # If pool fails, you lose 100% of capital (not just this year's yield)
    expected_yield = (base90 * success_prob) - (100 * failure_prob)
    
    # Volatility penalty (non-linear)
    # Low volatility: minor penalty
    # High volatility: exponential penalty
    vol_penalty = sigma * 0.1 + (max(0, sigma - 3.0) ** 1.5)
    
    # Incentive decay penalty
    # Pools with <80% organic yield may lose incentives
    incentive_risk = base90 * (1 - organic_pct / 100) * 0.5
    
    risk_adj = expected_yield - vol_penalty - incentive_risk
    
    return round(risk_adj, 2)

def analyze_pool(pool: Dict, cutoff_date: datetime) -> Dict:
    """Analyze a single pool and return metrics"""
    pool_id = pool['pool_id']
    symbol = pool['symbol']
    project = pool['project']
    chain = pool['chain']
    tvl_usd = pool['tvl_usd']
    current_apy = pool['current_apy']
    history = pool['history']
    
    # Calculate metrics
    base90, days = calculate_base90(history, cutoff_date)
    sigma = calculate_volatility(history, cutoff_date)
    organic_pct = calculate_organic_pct(history, cutoff_date)
    flow_change = calculate_tvl_change(history, cutoff_date)
    
    # Identify tier and curator
    tier_name, tier_loss = PROTOCOL_TIERS.get(project, ('Experimental', 0.10))
    curator, curator_mult = identify_curator(symbol, project)
    
    # Get protocol-specific multiplier
    protocol_mult = PROTOCOL_MULTIPLIERS.get(project, 1.0)
    
    # Curator adjustment for failure rate calculation
    # Premium curators reduce failure rate by 20%
    curator_adj = 0.8 if curator_mult == 1.0 else 1.0
    
    # Calculate risk-adjusted yield using expected value framework
    risk_adj = calculate_risk_adj_yield_v2(
        base90, tier_loss, protocol_mult, curator_adj, 
        sigma, tvl_usd, organic_pct, flow_change, days
    )
    
    # Calculate confidence
    conf = calculate_confidence(sigma, organic_pct, tvl_usd, days, flow_change, 
                               curator, project)
    
    # Flags
    sigma_flag = get_volatility_flag(sigma)
    org_flag = get_organic_flag(organic_pct)
    tvl_flag = get_tvl_flag(tvl_usd)
    flow_flag = get_flow_flag(flow_change, days)
    
    return {
        'pool_id': pool_id,
        'symbol': symbol,
        'project': project,
        'chain': chain,
        'tier': tier_name,
        'curator': curator,
        'tvl_usd': tvl_usd,
        'tvl_m': round(tvl_usd / 1_000_000, 1),
        'current_apy': round(current_apy, 2),
        'base90': round(base90, 2),
        'sigma': round(sigma, 2),
        'organic_pct': organic_pct,
        'flow_change': flow_change,
        'risk_adj': round(risk_adj, 2),
        'conf': conf,
        'days': days,
        'sigma_flag': sigma_flag,
        'org_flag': org_flag,
        'tvl_flag': tvl_flag,
        'flow_flag': flow_flag,
        'is_current_position': pool_id in CURRENT_POSITIONS,
    }

def main():
    # Load data
    with open('/mnt/user-data/uploads/yield-history-2025-11-30.json', 'r') as f:
        data = json.load(f)
    
    cutoff_date = datetime.fromisoformat(data['extracted'].replace('Z', '+00:00'))
    pools = data['pools']
    
    print(f"Analyzing {len(pools)} pools...")
    print(f"Data extracted: {cutoff_date.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print(f"Framework: Expected Value v2.0 (protocol multipliers, research-validated)")
    
    # Analyze all pools
    analyzed = []
    for pool in pools:
        try:
            result = analyze_pool(pool, cutoff_date)
            # Filter: TVL >= $5M OR current position (always include your positions)
            if result['tvl_m'] >= 5.0 or result['is_current_position']:
                analyzed.append(result)
        except Exception as e:
            print(f"Error analyzing {pool.get('symbol', 'unknown')}: {e}")
    
    # Sort by risk-adjusted yield descending, then TVL descending
    analyzed.sort(key=lambda x: (-x['risk_adj'], -x['tvl_m']))
    
    print(f"Filtered to {len(analyzed)} pools with TVL >= $5M")
    
    # Save results
    with open('/home/claude/analysis_results.json', 'w') as f:
        json.dump({
            'analyzed_date': cutoff_date.isoformat(),
            'pool_count': len(analyzed),
            'framework_version': '2.0',
            'pools': analyzed
        }, f, indent=2)
    
    print("\nâœ… Analysis complete!")
    print(f"Results saved to: /home/claude/analysis_results.json")
    
    # Print summary stats
    print(f"\nTop 5 by Risk-Adjusted Yield:")
    for i, pool in enumerate(analyzed[:5], 1):
        print(f"{i}. {pool['symbol']} ({pool['project']}, {pool['chain']}): {pool['risk_adj']:.2f}%")

if __name__ == '__main__':
    main()
```

---

## Script 2: generate_tables.py

**Purpose:** Format analysis results for chat display and save as markdown file  
**Input:** `/home/claude/analysis_results.json`  
**Output:** Formatted markdown tables printed to stdout + `/mnt/user-data/outputs/yield-analysis-YYYY-MM-DD.md`  
**Time:** <1 second

**No changes to this script** - it just formats the output from analyze_yields.py

### Full Script

```python
#!/usr/bin/env python3
"""
Generate formatted MARKDOWN tables for DeFiLlama yield analysis
Output to stdout for chat display
Save to /mnt/user-data/outputs/ as markdown file
"""

import json

def format_flags(pool):
    """Format flag string for compact display"""
    return f"Ïƒ{pool['sigma_flag']} Org{pool['org_flag']} TVL{pool['tvl_flag']} Flow{pool['flow_flag']}"

def get_status(pool):
    """Determine pool status"""
    conf = pool['conf']
    flags = [pool['sigma_flag'], pool['org_flag'], pool['tvl_flag'], pool['flow_flag']]
    red_count = flags.count('ðŸ”´')
    
    if conf >= 70 and red_count == 0:
        return 'âœ…', 'Healthy'
    elif conf >= 50 or red_count == 1:
        return 'ðŸŸ¡', 'Monitor'
    else:
        return 'ðŸ”´', 'Exit recommended'

def print_header(title):
    """Print section header"""
    print(f"\n## {title}\n")

def table_top30(pools):
    """Top 30 overall regardless of chain"""
    print_header("TOP 30 POOLS (All Chains)")
    
    # Print markdown table
    print("| # | Symbol | Protocol | Chain | Tier | Curator | TVL($M) | Curr% | Base90% | RiskAdj% | Conf | Ïƒ | Org | TVL | Flow | Days | Link |")
    print("|---|--------|----------|-------|------|---------|---------|-------|---------|----------|------|---|-----|-----|------|------|------|")
    
    for i, p in enumerate(pools[:30], 1):
        # Bold entire row if current position
        symbol = f"**{p['symbol']}**" if p['is_current_position'] else p['symbol']
        project = f"**{p['project']}**" if p['is_current_position'] else p['project']
        chain = f"**{p['chain']}**" if p['is_current_position'] else p['chain']
        link = f"[view](https://defillama.com/yields/pool/{p['pool_id']})"
        
        print(f"| {i} | {symbol} | {project} | {chain} | {p['tier']} | {p['curator']} | {p['tvl_m']:.1f} | {p['current_apy']:.2f} | {p['base90']:.2f} | {p['risk_adj']:.2f} | {p['conf']} | {p['sigma_flag']} | {p['org_flag']} | {p['tvl_flag']} | {p['flow_flag']} | {p['days']} | {link} |")

def table_per_chain(pools, chain_name):
    """Top 5 for specific chain"""
    chain_pools = [p for p in pools if p['chain'] == chain_name][:5]
    
    if not chain_pools:
        return
    
    print_header(f"TOP 5: {chain_name.upper()}")
    
    print("| # | Symbol | Protocol | Curator | TVL($M) | Curr% | Base90% | RiskAdj% | Conf | Flags |")
    print("|---|--------|----------|---------|---------|-------|---------|----------|------|-------|")
    
    for i, p in enumerate(chain_pools, 1):
        print(f"| {i} | {p['symbol']} | {p['project']} | {p['curator']} | {p['tvl_m']:.1f} | {p['current_apy']:.2f} | {p['base90']:.2f} | {p['risk_adj']:.2f} | {p['conf']} | {format_flags(p)} |")

def table_current_positions(pools):
    """Current positions health check"""
    current = [p for p in pools if p['is_current_position']]
    
    print_header("CURRENT POSITIONS STATUS")
    
    if not current:
        print("âš ï¸ No current positions found in dataset\n")
        return
    
    print("| Symbol | Protocol | Chain | TVL($M) | Curr% | Base90% | Conf | Flags | Status | Action | Link |")
    print("|--------|----------|-------|---------|-------|---------|------|-------|--------|--------|------|")
    
    for p in current:
        status_emoji, action = get_status(p)
        symbol = f"**{p['symbol']}**"
        link = f"[view](https://defillama.com/yields/pool/{p['pool_id']})"
        print(f"| {symbol} | {p['project']} | {p['chain']} | {p['tvl_m']:.1f} | {p['current_apy']:.2f} | {p['base90']:.2f} | {p['conf']} | {format_flags(p)} | {status_emoji} | {action} | {link} |")

def table_recommendations(pools):
    """Top recommendations"""
    print_header("TOP RECOMMENDATIONS")
    
    # Filter criteria
    candidates = []
    for p in pools[:20]:
        if p['conf'] >= 70:
            flags = [p['sigma_flag'], p['org_flag'], p['tvl_flag'], p['flow_flag']]
            if 'ðŸ”´' not in flags:
                candidates.append(p)
    
    # Limit to 2 per protocol
    recommendations = []
    protocol_count = {}
    
    for p in candidates:
        project = p['project']
        if protocol_count.get(project, 0) < 2:
            recommendations.append(p)
            protocol_count[project] = protocol_count.get(project, 0) + 1
        
        if len(recommendations) >= 10:
            break
    
    if not recommendations:
        print("âš ï¸ No pools meet recommendation criteria (Confâ‰¥70, no red flags)\n")
        return
    
    print("| # | Symbol | Protocol | Chain | Curator | TVL($M) | RiskAdj% | Conf | Flags | Rationale | Link |")
    print("|---|--------|----------|-------|---------|---------|----------|------|-------|-----------|------|")
    
    for i, p in enumerate(recommendations, 1):
        # Generate rationale
        rationale_parts = []
        if p['curator'] != '-' and p['curator'] != 'Unknown':
            rationale_parts.append(f"{p['curator']}")
        rationale_parts.append(f"${p['tvl_m']:.0f}M")
        if p['flow_change'] > 0:
            rationale_parts.append("growing")
        elif p['flow_change'] > -10:
            rationale_parts.append("stable")
        rationale = ', '.join(rationale_parts)
        link = f"[view](https://defillama.com/yields/pool/{p['pool_id']})"
        
        print(f"| {i} | {p['symbol']} | {p['project']} | {p['chain']} | {p['curator']} | {p['tvl_m']:.1f} | {p['risk_adj']:.2f} | {p['conf']} | {format_flags(p)} | {rationale} | {link} |")

def main():
    import sys
    from datetime import datetime
    
    # Load results
    with open('/home/claude/analysis_results.json', 'r') as f:
        data = json.load(f)
    
    pools = data['pools']
    framework_version = data.get('framework_version', '1.x')
    
    # Generate filename with date
    date_str = data['analyzed_date'][:10]
    output_file = f'/mnt/user-data/outputs/yield-analysis-{date_str}.md'
    
    # Capture output to both file and stdout
    class TeeOutput:
        def __init__(self, *files):
            self.files = files
        def write(self, text):
            for f in self.files:
                f.write(text)
        def flush(self):
            for f in self.files:
                f.flush()
    
    # Save to file and print to console
    with open(output_file, 'w') as f:
        original_stdout = sys.stdout
        sys.stdout = TeeOutput(sys.stdout, f)
        
        print("\n# DEFILLAMA YIELD ANALYSIS RESULTS")
        print(f"\n**Date:** {data['analyzed_date'][:10]}  ")
        print(f"**Pools Analyzed:** {len(pools)}  ")
        print(f"**TVL Floor:** $5M  ")
        print(f"**Framework:** Expected Value v{framework_version}")
        
        # Generate all tables
        table_top30(pools)
        
        # Top 5 per chain
        chains = ['Ethereum', 'Arbitrum', 'Base', 'Optimism']
        for chain in chains:
            table_per_chain(pools, chain)
        
        table_current_positions(pools)
        table_recommendations(pools)
        
        print("\n---\n")
        print("**END OF ANALYSIS**")
        
        # Restore stdout
        sys.stdout = original_stdout
    
    # Print confirmation
    print(f"\nâœ… Analysis saved to: {output_file}")

if __name__ == '__main__':
    main()
```

---

## Usage Instructions

### Step 1: Upload Historical Data

Upload `yield-history-YYYY-MM-DD.json` to Claude (from data gathering process)

### Step 2: Run Analysis Script

```bash
cd /home/claude
python3 analyze_yields.py
```

**Output:** `/home/claude/analysis_results.json` (5-10 seconds)

### Step 3: Generate Tables

```bash
python3 generate_tables.py
```

**Output:** 
- Formatted markdown tables in chat window (<1 second)
- Saved markdown file: `/mnt/user-data/outputs/yield-analysis-YYYY-MM-DD.md`

---

## What Changed in v2.0

### Expected Value Framework

**Old formula (v1.x):**
```python
RiskAdj = (Base90 Ã— CuratorMult) - (Base90 Ã— TierLoss) - (Volatility Ã— 0.1)
```

**New formula (v2.0):**
```python
failure_prob = TierLoss Ã— ProtocolMult Ã— CuratorAdj Ã— TVLAdj Ã— FlowAdj Ã— DataAdj
success_prob = 1.0 - failure_prob

expected_yield = (Base90 Ã— success_prob) - (100% Ã— failure_prob)
vol_penalty = sigma Ã— 0.1 + (max(0, sigma - 3.0) ** 1.5)
incentive_risk = Base90 Ã— (1 - organic_pct / 100) Ã— 0.5

RiskAdj = expected_yield - vol_penalty - incentive_risk
```

### Key Improvements

**1. Models protocol failure correctly**
- Failure = lose 100% of capital, not just yield
- Validated by insurance pricing research
- Expected value calculation explicit

**2. Protocol-specific risk**
- Aave/Compound: 0.9x (8+ years, no core exploits)
- Euler V2: 1.1x (V1 history, elevated monitoring)
- Morpho: 0.95x (matching engine architecture)

**3. Non-linear volatility**
- Ïƒ < 3%: Linear penalty (0.1 per %)
- Ïƒ > 3%: Exponential penalty
- Extreme volatility appropriately penalized

**4. Incentive dependency risk**
- Pools with <80% organic yield get penalized
- Models risk of temporary incentives ending

**5. Research-validated curators**
- B.Protocol added to premium list (1.0x)
- Gauntlet, Steakhouse, Block Analitica validated

---

## Maintenance

**When positions change:**
1. Edit `analyze_yields.py` line 37-41
2. Update `CURRENT_POSITIONS` list
3. Re-run both scripts

**When risk framework updates:**
1. Edit `analyze_yields.py` line 12-32
2. Update `PROTOCOL_TIERS`, `MORPHO_CURATORS`, or `PROTOCOL_MULTIPLIERS`
3. Re-run both scripts

**When new protocols researched:**
1. Add to `PROTOCOL_MULTIPLIERS` with appropriate multiplier
2. Research-based: 0.9 (safer than tier), 1.0 (baseline), 1.1+ (riskier)

---

## Interpreting v2.0 Results

### Risk-Adjusted Yield Can Be Negative

**This is intentional.** If a pool has:
- High failure probability (>5%)
- Low organic yield
- High volatility

The expected value can be negative, meaning you're statistically expected to lose money.

**Example:**
```
Pool: 6% APY, 8% failure rate, high volatility
Expected = (6% Ã— 92%) - (100% Ã— 8%) = 5.52% - 8% = -2.48%
```

This pool would show **negative risk-adjusted yield** â†’ avoid.

### Comparison to v1.x

Expect to see:
- **High-risk pools** rank lower (failure probability properly weighted)
- **Stable, mature protocols** rank higher (Aave/Compound get 0.9x boost)
- **Euler V2** may rank lower than v1.x (1.1x multiplier for V1 history)
- **Volatile pools** penalized more heavily (non-linear penalty)

### What Good Pools Look Like

```
Symbol: GTUSDCC
RiskAdj: 4.5%
Conf: 100
Flags: ÏƒðŸŸ¢ OrgðŸŸ¢ TVLðŸŸ¢ FlowðŸŸ¢
```

- Positive risk-adjusted yield
- High confidence (â‰¥80)
- All green flags
- Premium curator (Gauntlet)

---

**Document Version:** 2.0  
**Last Updated:** December 1, 2025  
**Major Changes:** 
- Expected value framework implementation
- Protocol-specific multipliers (research-validated)
- B.Protocol curator addition
- Non-linear volatility penalty
- Incentive dependency modeling  
**Supersedes:** v1.2  
**Companion:** DEFILLAMA_ANALYSIS.md, DEFILLAMA_DATA_GATHERING.md