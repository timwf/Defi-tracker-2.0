import type { SavedView } from '../types/pool';

const STORAGE_KEY = 'defi-tracker-views';

export function getSavedViews(): SavedView[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveView(view: SavedView): SavedView[] {
  const views = getSavedViews();
  const existingIndex = views.findIndex((v) => v.name === view.name);

  if (existingIndex >= 0) {
    views[existingIndex] = view;
  } else {
    views.push(view);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  return views;
}

export function deleteView(name: string): SavedView[] {
  const views = getSavedViews().filter((v) => v.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  return views;
}
