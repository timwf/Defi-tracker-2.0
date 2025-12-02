import type { HeldPosition } from '../types/pool';

const STORAGE_KEY = 'defi-tracker-positions';

export function getHeldPositions(): HeldPosition[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const positions = JSON.parse(stored);
    // Migration: add amountUsd if missing (for legacy data)
    return positions.map((p: HeldPosition) => ({
      ...p,
      amountUsd: p.amountUsd ?? 0,
    }));
  } catch {
    return [];
  }
}

export interface AddPositionParams {
  poolId: string;
  amountUsd: number;
  entryDate?: string;
  notes?: string;
}

export function addHeldPosition(params: AddPositionParams): HeldPosition[] {
  const positions = getHeldPositions();

  // Check if already exists
  if (positions.some(p => p.poolId === params.poolId)) {
    return positions;
  }

  positions.push({
    poolId: params.poolId,
    amountUsd: params.amountUsd,
    addedAt: Date.now(),
    entryDate: params.entryDate,
    notes: params.notes,
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  return positions;
}

export function removeHeldPosition(poolId: string): HeldPosition[] {
  const positions = getHeldPositions().filter(p => p.poolId !== poolId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  return positions;
}

export function isHeldPosition(poolId: string): boolean {
  return getHeldPositions().some(p => p.poolId === poolId);
}

export function getHeldPoolIds(): string[] {
  return getHeldPositions().map(p => p.poolId);
}

export function updatePosition(
  poolId: string,
  updates: Partial<Omit<HeldPosition, 'poolId' | 'addedAt'>>
): HeldPosition[] {
  const positions = getHeldPositions();
  const position = positions.find(p => p.poolId === poolId);
  if (position) {
    if (updates.amountUsd !== undefined) position.amountUsd = updates.amountUsd;
    if (updates.entryDate !== undefined) position.entryDate = updates.entryDate;
    if (updates.notes !== undefined) position.notes = updates.notes;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  return positions;
}
