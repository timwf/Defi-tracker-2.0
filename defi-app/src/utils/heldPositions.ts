import type { HeldPosition } from '../types/pool';

const STORAGE_KEY = 'defi-tracker-positions';

export function getHeldPositions(): HeldPosition[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addHeldPosition(poolId: string, notes?: string): HeldPosition[] {
  const positions = getHeldPositions();

  // Check if already exists
  if (positions.some(p => p.poolId === poolId)) {
    return positions;
  }

  positions.push({
    poolId,
    addedAt: Date.now(),
    notes,
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

export function updatePositionNotes(poolId: string, notes: string): HeldPosition[] {
  const positions = getHeldPositions();
  const position = positions.find(p => p.poolId === poolId);
  if (position) {
    position.notes = notes;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  return positions;
}
