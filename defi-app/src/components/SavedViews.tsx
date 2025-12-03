import { useState } from 'react';
import type { SavedView } from '../types/pool';

interface SavedViewsProps {
  views: SavedView[];
  onLoadView: (view: SavedView) => void;
  onSaveView: (name: string) => void;
  onDeleteView: (name: string) => void;
}

export function SavedViews({ views, onLoadView, onSaveView, onDeleteView }: SavedViewsProps) {
  const [newViewName, setNewViewName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = () => {
    if (newViewName.trim()) {
      onSaveView(newViewName.trim());
      setNewViewName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="bg-slate-800 p-3 rounded-lg mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-2"
        >
          <span>{isExpanded ? '▼' : '▶'}</span>
          Saved Views ({views.length})
        </button>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="View name..."
            className="px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-28 sm:w-32"
          />
          <button
            onClick={handleSave}
            disabled={!newViewName.trim()}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Save
          </button>
        </div>
      </div>

      {isExpanded && views.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {views.map((view) => (
            <div
              key={view.name}
              className="flex items-center gap-1 bg-slate-700 rounded-full pl-3 pr-1 py-1"
            >
              <button
                onClick={() => onLoadView(view)}
                className="text-sm text-slate-200 hover:text-white"
              >
                {view.name}
              </button>
              <button
                onClick={() => onDeleteView(view.name)}
                className="text-slate-400 hover:text-red-400 p-1 text-xs"
                title="Delete view"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {isExpanded && views.length === 0 && (
        <p className="mt-3 text-sm text-slate-500">No saved views yet. Apply filters and save a view.</p>
      )}
    </div>
  );
}
