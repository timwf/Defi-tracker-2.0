import type { HeldPosition } from '../types/pool';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'defi-tracker-positions';

// localStorage functions
export function getLocalPositions(): HeldPosition[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const positions = JSON.parse(stored);
    return positions.map((p: HeldPosition) => ({
      ...p,
      amountUsd: p.amountUsd ?? 0,
    }));
  } catch {
    return [];
  }
}

export function clearLocalPositions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function saveLocalPositions(positions: HeldPosition[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

function addLocalPosition(params: {
  poolId: string;
  amountUsd: number;
  entryDate?: string;
  notes?: string;
  fixedApy?: number;
  source?: 'manual' | 'wallet';
  walletAddress?: string;
  tokenAddress?: string;
  tokenBalance?: number;
  tokenSymbol?: string | null;
}): HeldPosition {
  const positions = getLocalPositions();
  const newPosition: HeldPosition = {
    poolId: params.poolId,
    amountUsd: params.amountUsd,
    addedAt: Date.now(),
    entryDate: params.entryDate,
    notes: params.notes,
    fixedApy: params.fixedApy,
    source: params.source,
    walletAddress: params.walletAddress,
    tokenAddress: params.tokenAddress,
    tokenBalance: params.tokenBalance,
    tokenSymbol: params.tokenSymbol || undefined,
  };
  positions.unshift(newPosition);
  saveLocalPositions(positions);
  return newPosition;
}

function removeLocalPosition(poolId: string): boolean {
  const positions = getLocalPositions();
  const filtered = positions.filter(p => p.poolId !== poolId);
  if (filtered.length === positions.length) return false;
  saveLocalPositions(filtered);
  return true;
}

function updateLocalPosition(
  poolId: string,
  updates: Partial<Omit<HeldPosition, 'poolId' | 'addedAt'>>
): boolean {
  const positions = getLocalPositions();
  const index = positions.findIndex(p => p.poolId === poolId);
  if (index === -1) return false;
  positions[index] = { ...positions[index], ...updates };
  saveLocalPositions(positions);
  return true;
}

// Supabase functions (with localStorage fallback for unauthenticated users)
export async function fetchPositions(): Promise<HeldPosition[]> {
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, use localStorage
  if (!user) {
    return getLocalPositions();
  }

  const { data, error } = await supabase
    .from('positions')
    .select('*')
    .order('added_at', { ascending: false });

  if (error) {
    console.error('Error fetching positions:', error);
    return [];
  }

  return data.map((row) => ({
    poolId: row.pool_id,
    amountUsd: Number(row.amount_usd) || 0,
    addedAt: new Date(row.added_at).getTime(),
    entryDate: row.entry_date || undefined,
    notes: row.notes || undefined,
    fixedApy: row.fixed_apy ?? undefined,
    source: row.source || 'manual',
    walletAddress: row.wallet_address || undefined,
    tokenAddress: row.token_address || undefined,
    tokenBalance: row.token_balance ? Number(row.token_balance) : undefined,
    tokenSymbol: row.token_symbol || undefined,
    firstAcquiredAt: row.first_acquired_at ? new Date(row.first_acquired_at).getTime() : undefined,
    entryPriceUsd: row.entry_price_usd ? Number(row.entry_price_usd) : undefined,
    initialAmountUsd: row.initial_amount_usd ? Number(row.initial_amount_usd) : undefined,
    initialTokenBalance: row.initial_token_balance ? Number(row.initial_token_balance) : undefined,
    transactions: row.transactions || undefined,
    totalCostBasis: row.total_cost_basis ? Number(row.total_cost_basis) : undefined,
    avgEntryPrice: row.avg_entry_price ? Number(row.avg_entry_price) : undefined,
    isShareBased: row.is_share_based ?? undefined,
    underlyingValue: row.underlying_value ? Number(row.underlying_value) : undefined,
    actualDepositedUsd: row.actual_deposited_usd ? Number(row.actual_deposited_usd) : undefined,
  }));
}

export async function addPositionToDb(params: {
  poolId: string;
  amountUsd: number;
  entryDate?: string;
  notes?: string;
  fixedApy?: number;
  source?: 'manual' | 'wallet';
  walletAddress?: string;
  tokenAddress?: string;
  tokenBalance?: number;
  tokenSymbol?: string | null;
}): Promise<HeldPosition | null> {
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, use localStorage
  if (!user) {
    return addLocalPosition(params);
  }

  const { data, error } = await supabase
    .from('positions')
    .insert({
      user_id: user.id,
      pool_id: params.poolId,
      amount_usd: params.amountUsd,
      entry_date: params.entryDate || null,
      notes: params.notes || null,
      fixed_apy: params.fixedApy ?? null,
      source: params.source || 'manual',
      wallet_address: params.walletAddress || null,
      token_address: params.tokenAddress || null,
      token_balance: params.tokenBalance ?? null,
      token_symbol: params.tokenSymbol || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding position:', error);
    return null;
  }

  return {
    poolId: data.pool_id,
    amountUsd: Number(data.amount_usd) || 0,
    addedAt: new Date(data.added_at).getTime(),
    entryDate: data.entry_date || undefined,
    notes: data.notes || undefined,
    fixedApy: data.fixed_apy ?? undefined,
    source: data.source || 'manual',
    walletAddress: data.wallet_address || undefined,
    tokenAddress: data.token_address || undefined,
    tokenBalance: data.token_balance ? Number(data.token_balance) : undefined,
    tokenSymbol: data.token_symbol || undefined,
  };
}

export async function removePositionFromDb(poolId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, use localStorage
  if (!user) {
    return removeLocalPosition(poolId);
  }

  const { error } = await supabase
    .from('positions')
    .delete()
    .eq('pool_id', poolId);

  if (error) {
    console.error('Error removing position:', error);
    return false;
  }

  return true;
}

export async function updatePositionInDb(
  poolId: string,
  updates: Partial<Omit<HeldPosition, 'poolId' | 'addedAt'>>
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, use localStorage
  if (!user) {
    return updateLocalPosition(poolId, updates);
  }

  const updateData: Record<string, unknown> = {};
  if (updates.amountUsd !== undefined) updateData.amount_usd = updates.amountUsd;
  if (updates.entryDate !== undefined) updateData.entry_date = updates.entryDate || null;
  if (updates.notes !== undefined) updateData.notes = updates.notes || null;
  if ('fixedApy' in updates) updateData.fixed_apy = updates.fixedApy ?? null;
  if (updates.tokenBalance !== undefined) updateData.token_balance = updates.tokenBalance;
  if (updates.tokenSymbol !== undefined) updateData.token_symbol = updates.tokenSymbol || null;
  if (updates.firstAcquiredAt !== undefined) updateData.first_acquired_at = new Date(updates.firstAcquiredAt).toISOString();
  if (updates.entryPriceUsd !== undefined) updateData.entry_price_usd = updates.entryPriceUsd;
  if (updates.initialAmountUsd !== undefined) updateData.initial_amount_usd = updates.initialAmountUsd;
  if (updates.initialTokenBalance !== undefined) updateData.initial_token_balance = updates.initialTokenBalance;
  if (updates.transactions !== undefined) updateData.transactions = updates.transactions;
  if (updates.totalCostBasis !== undefined) updateData.total_cost_basis = updates.totalCostBasis;
  if (updates.avgEntryPrice !== undefined) updateData.avg_entry_price = updates.avgEntryPrice;
  if ('isShareBased' in updates) updateData.is_share_based = updates.isShareBased ?? null;
  if (updates.underlyingValue !== undefined) updateData.underlying_value = updates.underlyingValue;
  if (updates.actualDepositedUsd !== undefined) updateData.actual_deposited_usd = updates.actualDepositedUsd;

  console.log('[DB Update]', poolId, updateData);

  const { error } = await supabase
    .from('positions')
    .update(updateData)
    .eq('pool_id', poolId);

  if (error) {
    console.error('Error updating position:', error);
    return false;
  }

  return true;
}

export async function migrateLocalToSupabase(): Promise<number> {
  const localPositions = getLocalPositions();
  if (localPositions.length === 0) return 0;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  let migrated = 0;
  for (const pos of localPositions) {
    const { error } = await supabase
      .from('positions')
      .upsert({
        user_id: user.id,
        pool_id: pos.poolId,
        amount_usd: pos.amountUsd,
        entry_date: pos.entryDate || null,
        notes: pos.notes || null,
        fixed_apy: pos.fixedApy ?? null,
        added_at: new Date(pos.addedAt).toISOString(),
      }, {
        onConflict: 'user_id,pool_id',
      });

    if (!error) migrated++;
  }

  if (migrated > 0) {
    clearLocalPositions();
  }

  return migrated;
}

// Backwards-compatible sync functions (used by App.tsx)
export function getHeldPositions(): HeldPosition[] {
  // Return empty - actual data loaded async
  return [];
}

export interface AddPositionParams {
  poolId: string;
  amountUsd: number;
  entryDate?: string;
  notes?: string;
}

export function addHeldPosition(params: AddPositionParams): HeldPosition[] {
  // Trigger async add - caller should refresh state
  addPositionToDb(params);
  return [];
}

export function removeHeldPosition(poolId: string): HeldPosition[] {
  // Trigger async remove - caller should refresh state
  removePositionFromDb(poolId);
  return [];
}

export function isHeldPosition(_poolId: string): boolean {
  return false; // Can't check sync - use state instead
}

export function getHeldPoolIds(): string[] {
  return []; // Can't check sync - use state instead
}

export function updatePosition(
  poolId: string,
  updates: Partial<Omit<HeldPosition, 'poolId' | 'addedAt'>>
): HeldPosition[] {
  // Trigger async update - caller should refresh state
  updatePositionInDb(poolId, updates);
  return [];
}
