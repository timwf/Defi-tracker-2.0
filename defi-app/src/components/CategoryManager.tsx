import { useState } from 'react';
import type { Category } from '../utils/categories';
import { CATEGORY_COLORS, addCategoryToDb, updateCategoryInDb, removeCategoryFromDb } from '../utils/categories';

interface CategoryManagerProps {
  categories: Category[];
  onCategoriesChange: () => void;
  onClose: () => void;
}

export function CategoryManager({ categories, onCategoriesChange, onClose }: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0].value);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAddCategory = async () => {
    if (!newName.trim()) {
      setError('Category name is required');
      return;
    }

    if (categories.some(c => c.name.toLowerCase() === newName.trim().toLowerCase())) {
      setError('Category name already exists');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await addCategoryToDb({ name: newName.trim(), color: newColor });
      setNewName('');
      setNewColor(CATEGORY_COLORS[0].value);
      onCategoriesChange();
    } catch (err) {
      setError('Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
    setError('');
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      setError('Category name is required');
      return;
    }

    if (categories.some(c => c.id !== editingId && c.name.toLowerCase() === editName.trim().toLowerCase())) {
      setError('Category name already exists');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateCategoryInDb(editingId!, { name: editName.trim(), color: editColor });
      setEditingId(null);
      onCategoriesChange();
    } catch (err) {
      setError('Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Positions using it will become uncategorized.')) {
      return;
    }

    setSaving(true);
    try {
      await removeCategoryFromDb(id);
      onCategoriesChange();
    } catch (err) {
      setError('Failed to delete category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-medium text-white">Manage Categories</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add new category */}
          <div className="bg-slate-700/50 rounded-lg p-3 space-y-3">
            <div className="text-sm text-slate-300 font-medium">Add New Category</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name"
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <div className="relative">
                <select
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="appearance-none px-3 py-2 pr-8 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  style={{ borderLeftColor: newColor, borderLeftWidth: '4px' }}
                >
                  {CATEGORY_COLORS.map(color => (
                    <option key={color.value} value={color.value}>
                      {color.name}
                    </option>
                  ))}
                </select>
                <div
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full pointer-events-none"
                  style={{ backgroundColor: newColor }}
                />
              </div>
              <button
                onClick={handleAddCategory}
                disabled={saving || !newName.trim()}
                className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded">
              {error}
            </div>
          )}

          {/* Existing categories */}
          {categories.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              No categories yet. Create one above.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Your Categories ({categories.length})</div>
              {categories.map(category => (
                <div
                  key={category.id}
                  className="bg-slate-700/50 rounded-lg p-3 flex items-center gap-3"
                >
                  {editingId === category.id ? (
                    <>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        autoFocus
                      />
                      <select
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="appearance-none px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        style={{ borderLeftColor: editColor, borderLeftWidth: '3px' }}
                      >
                        {CATEGORY_COLORS.map(color => (
                          <option key={color.value} value={color.value}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="p-1.5 text-green-400 hover:text-green-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 text-slate-400 hover:text-slate-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="flex-1 text-white text-sm">{category.name}</span>
                      <button
                        onClick={() => handleStartEdit(category)}
                        className="p-1.5 text-slate-400 hover:text-slate-300"
                        title="Edit category"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={saving}
                        className="p-1.5 text-red-400 hover:text-red-300 disabled:opacity-50"
                        title="Delete category"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
