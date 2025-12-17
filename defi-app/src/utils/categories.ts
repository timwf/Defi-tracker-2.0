import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'defi-tracker-categories';

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

// Available colors for categories
export const CATEGORY_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
];

// Generate a unique ID
function generateId(): string {
  return `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// localStorage functions
export function getLocalCategories(): Category[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function clearLocalCategories(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function saveLocalCategories(categories: Category[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

function addLocalCategory(params: { name: string; color: string }): Category {
  const categories = getLocalCategories();
  const newCategory: Category = {
    id: generateId(),
    name: params.name,
    color: params.color,
    createdAt: Date.now(),
  };
  categories.push(newCategory);
  saveLocalCategories(categories);
  return newCategory;
}

function updateLocalCategory(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): boolean {
  const categories = getLocalCategories();
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return false;
  categories[index] = { ...categories[index], ...updates };
  saveLocalCategories(categories);
  return true;
}

function removeLocalCategory(id: string): boolean {
  const categories = getLocalCategories();
  const filtered = categories.filter(c => c.id !== id);
  if (filtered.length === categories.length) return false;
  saveLocalCategories(filtered);
  return true;
}

// Supabase functions (with localStorage fallback for unauthenticated users)
export async function fetchCategories(): Promise<Category[]> {
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, use localStorage
  if (!user) {
    return getLocalCategories();
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    // Fall back to localStorage if table doesn't exist yet
    return getLocalCategories();
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: new Date(row.created_at).getTime(),
  }));
}

export async function addCategoryToDb(params: {
  name: string;
  color: string;
}): Promise<Category | null> {
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, use localStorage
  if (!user) {
    return addLocalCategory(params);
  }

  const id = generateId();
  const { data, error } = await supabase
    .from('categories')
    .insert({
      id,
      user_id: user.id,
      name: params.name,
      color: params.color,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding category:', error);
    // Fall back to localStorage if table doesn't exist
    return addLocalCategory(params);
  }

  return {
    id: data.id,
    name: data.name,
    color: data.color,
    createdAt: new Date(data.created_at).getTime(),
  };
}

export async function updateCategoryInDb(
  id: string,
  updates: Partial<Omit<Category, 'id' | 'createdAt'>>
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, use localStorage
  if (!user) {
    return updateLocalCategory(id, updates);
  }

  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.color !== undefined) updateData.color = updates.color;

  const { error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating category:', error);
    return updateLocalCategory(id, updates);
  }

  return true;
}

export async function removeCategoryFromDb(id: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, use localStorage
  if (!user) {
    return removeLocalCategory(id);
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error removing category:', error);
    return removeLocalCategory(id);
  }

  return true;
}

export async function migrateLocalCategoriesToSupabase(): Promise<number> {
  const localCategories = getLocalCategories();
  if (localCategories.length === 0) return 0;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  let migrated = 0;
  for (const cat of localCategories) {
    const { error } = await supabase
      .from('categories')
      .upsert({
        id: cat.id,
        user_id: user.id,
        name: cat.name,
        color: cat.color,
        created_at: new Date(cat.createdAt).toISOString(),
      }, {
        onConflict: 'id',
      });

    if (!error) migrated++;
  }

  if (migrated > 0) {
    clearLocalCategories();
  }

  return migrated;
}
