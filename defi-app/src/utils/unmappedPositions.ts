import type { UnmappedPosition, ScannedToken } from '../types/pool';
import { supabase } from '../lib/supabase';
import { addPositionToDb } from './heldPositions';

const STORAGE_KEY = 'defi-tracker-unmapped-positions';

// localStorage functions for non-authenticated users
function getLocalUnmappedPositions(): UnmappedPosition[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalUnmappedPositions(positions: UnmappedPosition[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

export function clearLocalUnmappedPositions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Clean up orphaned unmapped positions (linked to positions that no longer exist)
export async function cleanupOrphanedUnmappedPositions(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // localStorage cleanup
    try {
      const unmapped = getLocalUnmappedPositions();
      const positionsStored = localStorage.getItem('defi-tracker-positions');
      const positions = positionsStored ? JSON.parse(positionsStored) : [];
      const positionPoolIds = new Set(positions.map((p: { poolId: string }) => p.poolId));

      const cleaned = unmapped.map((p) => {
        if (p.linkedPoolId && !positionPoolIds.has(p.linkedPoolId)) {
          return { ...p, linkedPoolId: null, linkedAt: null };
        }
        return p;
      });
      saveLocalUnmappedPositions(cleaned);
    } catch {
      // Ignore errors
    }
    return;
  }

  // For Supabase: Find unmapped positions with linked_pool_id that don't have matching positions
  const { data: orphaned } = await supabase
    .from('unmapped_positions')
    .select('id, linked_pool_id')
    .not('linked_pool_id', 'is', null);

  if (!orphaned || orphaned.length === 0) return;

  // Check which linked pools still exist
  const linkedPoolIds = [...new Set(orphaned.map(o => o.linked_pool_id))];
  const { data: existingPositions } = await supabase
    .from('positions')
    .select('pool_id')
    .in('pool_id', linkedPoolIds);

  const existingPoolIds = new Set(existingPositions?.map(p => p.pool_id) || []);
  const orphanedIds = orphaned
    .filter(o => !existingPoolIds.has(o.linked_pool_id))
    .map(o => o.id);

  if (orphanedIds.length > 0) {
    await supabase
      .from('unmapped_positions')
      .update({ linked_pool_id: null, linked_at: null })
      .in('id', orphanedIds);
    console.log(`Cleaned up ${orphanedIds.length} orphaned unmapped positions`);
  }
}

// Fetch all unmapped positions
export async function fetchUnmappedPositions(): Promise<UnmappedPosition[]> {
  const { data: { user } } = await supabase.auth.getUser();

  // Clean up any orphaned positions first
  await cleanupOrphanedUnmappedPositions();

  if (!user) {
    // Only return unmapped ones (no linked_pool_id)
    return getLocalUnmappedPositions().filter(p => !p.linkedPoolId);
  }

  const { data, error } = await supabase
    .from('unmapped_positions')
    .select('*')
    .is('linked_pool_id', null) // Only get unmapped ones
    .order('imported_at', { ascending: false });

  if (error) {
    console.error('Error fetching unmapped positions:', error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    walletAddress: row.wallet_address,
    chain: row.chain,
    tokenAddress: row.token_address,
    tokenSymbol: row.token_symbol,
    tokenName: row.token_name,
    balanceRaw: row.balance_raw,
    balanceFormatted: Number(row.balance_formatted) || 0,
    usdValue: row.usd_value ? Number(row.usd_value) : null,
    linkedPoolId: row.linked_pool_id,
    importedAt: new Date(row.imported_at).getTime(),
    linkedAt: row.linked_at ? new Date(row.linked_at).getTime() : null,
  }));
}

// Add scanned tokens as unmapped positions
export async function addUnmappedPositions(
  walletAddress: string,
  tokens: ScannedToken[]
): Promise<UnmappedPosition[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // localStorage fallback
    const existing = getLocalUnmappedPositions();
    const newPositions: UnmappedPosition[] = tokens.map((token) => ({
      id: `${token.chain}-${token.tokenAddress}-${Date.now()}`,
      walletAddress,
      chain: token.chain,
      tokenAddress: token.tokenAddress,
      tokenSymbol: token.tokenSymbol,
      tokenName: token.tokenName,
      balanceRaw: token.balanceRaw,
      balanceFormatted: token.balanceFormatted,
      usdValue: token.usdValue,
      linkedPoolId: null,
      importedAt: Date.now(),
      linkedAt: null,
    }));

    // Merge, avoiding duplicates by chain+tokenAddress
    const merged = [...existing];
    for (const newPos of newPositions) {
      const existingIndex = merged.findIndex(
        (p) => p.chain === newPos.chain && p.tokenAddress === newPos.tokenAddress
      );
      if (existingIndex >= 0) {
        // Update existing
        merged[existingIndex] = { ...merged[existingIndex], ...newPos };
      } else {
        merged.push(newPos);
      }
    }

    saveLocalUnmappedPositions(merged);
    return newPositions;
  }

  // Supabase insert with upsert to handle duplicates
  const insertData = tokens.map((token) => ({
    user_id: user.id,
    wallet_address: walletAddress,
    chain: token.chain,
    token_address: token.tokenAddress,
    token_symbol: token.tokenSymbol,
    token_name: token.tokenName,
    balance_raw: token.balanceRaw,
    balance_formatted: token.balanceFormatted,
    usd_value: token.usdValue,
  }));

  const { data, error } = await supabase
    .from('unmapped_positions')
    .upsert(insertData, {
      onConflict: 'user_id,chain,token_address',
    })
    .select();

  if (error) {
    console.error('Error adding unmapped positions:', error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    walletAddress: row.wallet_address,
    chain: row.chain,
    tokenAddress: row.token_address,
    tokenSymbol: row.token_symbol,
    tokenName: row.token_name,
    balanceRaw: row.balance_raw,
    balanceFormatted: Number(row.balance_formatted) || 0,
    usdValue: row.usd_value ? Number(row.usd_value) : null,
    linkedPoolId: row.linked_pool_id,
    importedAt: new Date(row.imported_at).getTime(),
    linkedAt: row.linked_at ? new Date(row.linked_at).getTime() : null,
  }));
}

// Link an unmapped position to a DeFiLlama pool
export async function linkUnmappedToPool(
  unmappedId: string,
  poolId: string,
  amountUsd: number
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // localStorage fallback
    const positions = getLocalUnmappedPositions();
    const position = positions.find((p) => p.id === unmappedId);
    if (!position) return false;

    // Create the linked position
    const newPosition = {
      poolId,
      amountUsd,
      source: 'wallet' as const,
      walletAddress: position.walletAddress,
      tokenAddress: position.tokenAddress,
      tokenBalance: position.balanceFormatted,
      tokenSymbol: position.tokenSymbol,
    };

    // Add to held positions (localStorage)
    const heldPositions = JSON.parse(localStorage.getItem('defi-tracker-positions') || '[]');
    heldPositions.unshift({
      ...newPosition,
      addedAt: Date.now(),
    });
    localStorage.setItem('defi-tracker-positions', JSON.stringify(heldPositions));

    // Remove from unmapped
    const filtered = positions.filter((p) => p.id !== unmappedId);
    saveLocalUnmappedPositions(filtered);

    return true;
  }

  // Get the unmapped position details first
  const { data: unmapped, error: fetchError } = await supabase
    .from('unmapped_positions')
    .select('*')
    .eq('id', unmappedId)
    .single();

  if (fetchError || !unmapped) {
    console.error('Error fetching unmapped position:', fetchError);
    return false;
  }

  // Create the position in the positions table
  const result = await addPositionToDb({
    poolId,
    amountUsd,
    source: 'wallet',
    walletAddress: unmapped.wallet_address,
    tokenAddress: unmapped.token_address,
    tokenBalance: unmapped.balance_formatted,
    tokenSymbol: unmapped.token_symbol,
  });

  if (!result) {
    console.error('Error creating linked position');
    return false;
  }

  // Update the unmapped position to mark it as linked
  const { error: updateError } = await supabase
    .from('unmapped_positions')
    .update({
      linked_pool_id: poolId,
      linked_at: new Date().toISOString(),
    })
    .eq('id', unmappedId);

  if (updateError) {
    console.error('Error updating unmapped position:', updateError);
    return false;
  }

  return true;
}

// Delete an unmapped position
export async function deleteUnmappedPosition(unmappedId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const positions = getLocalUnmappedPositions();
    const filtered = positions.filter((p) => p.id !== unmappedId);
    if (filtered.length === positions.length) return false;
    saveLocalUnmappedPositions(filtered);
    return true;
  }

  const { error } = await supabase
    .from('unmapped_positions')
    .delete()
    .eq('id', unmappedId);

  if (error) {
    console.error('Error deleting unmapped position:', error);
    return false;
  }

  return true;
}
