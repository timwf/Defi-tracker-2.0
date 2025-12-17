import type { Category } from '../utils/categories';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string | undefined;
  onSelect: (categoryId: string | undefined) => void;
  onManageCategories: () => void;
  className?: string;
}

export function CategorySelector({
  categories,
  selectedCategoryId,
  onSelect,
  onManageCategories,
  className = '',
}: CategorySelectorProps) {
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <select
          value={selectedCategoryId || ''}
          onChange={(e) => onSelect(e.target.value || undefined)}
          className="flex-1 appearance-none px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
          style={selectedCategory ? { borderLeftColor: selectedCategory.color, borderLeftWidth: '4px' } : {}}
        >
          <option value="">No category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onManageCategories}
          className="px-2 py-2 bg-slate-700 border border-slate-600 rounded text-slate-400 hover:text-white hover:bg-slate-600 text-sm transition-colors"
          title="Manage categories"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Badge component to display category on cards
interface CategoryBadgeProps {
  category: Category | undefined;
  className?: string;
}

export function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  if (!category) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${category.color}20`,
        color: category.color,
        border: `1px solid ${category.color}40`,
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: category.color }}
      />
      {category.name}
    </span>
  );
}
