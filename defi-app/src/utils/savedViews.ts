import type { SavedView } from '../types/pool';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'defi-tracker-views';

// Legacy localStorage functions (for migration)
export function getLocalViews(): SavedView[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function clearLocalViews(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Supabase functions
export async function fetchViews(): Promise<SavedView[]> {
  const { data, error } = await supabase
    .from('saved_views')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching views:', error);
    return [];
  }

  return data.map((row) => ({
    name: row.name,
    filters: row.filters,
    sortField: row.sort_field,
    sortDirection: row.sort_direction,
    createdAt: new Date(row.created_at).getTime(),
  }));
}

export async function saveViewToDb(view: SavedView): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('saved_views')
    .upsert({
      user_id: user.id,
      name: view.name,
      filters: view.filters,
      sort_field: view.sortField,
      sort_direction: view.sortDirection,
      created_at: new Date(view.createdAt).toISOString(),
    }, {
      onConflict: 'user_id,name',
    });

  if (error) {
    console.error('Error saving view:', error);
    return false;
  }

  return true;
}

export async function deleteViewFromDb(name: string): Promise<boolean> {
  const { error } = await supabase
    .from('saved_views')
    .delete()
    .eq('name', name);

  if (error) {
    console.error('Error deleting view:', error);
    return false;
  }

  return true;
}

export async function migrateLocalViewsToSupabase(): Promise<number> {
  const localViews = getLocalViews();
  if (localViews.length === 0) return 0;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  let migrated = 0;
  for (const view of localViews) {
    const { error } = await supabase
      .from('saved_views')
      .upsert({
        user_id: user.id,
        name: view.name,
        filters: view.filters,
        sort_field: view.sortField,
        sort_direction: view.sortDirection,
        created_at: new Date(view.createdAt).toISOString(),
      }, {
        onConflict: 'user_id,name',
      });

    if (!error) migrated++;
  }

  if (migrated > 0) {
    clearLocalViews();
  }

  return migrated;
}

// Backwards-compatible sync functions (used by App.tsx)
export function getSavedViews(): SavedView[] {
  // Return empty - actual data loaded async
  return [];
}

export function saveView(view: SavedView): SavedView[] {
  // Trigger async save - caller should refresh state
  saveViewToDb(view);
  return [];
}

export function deleteView(name: string): SavedView[] {
  // Trigger async delete - caller should refresh state
  deleteViewFromDb(name);
  return [];
}
