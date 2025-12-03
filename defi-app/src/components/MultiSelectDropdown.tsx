import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  available: boolean;
}

interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  colorClass?: string;
}

export function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  colorClass = 'blue',
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.value.toLowerCase().includes(search.toLowerCase())
  );

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  const toggleAll = () => {
    const availableValues = options.filter((o) => o.available).map((o) => o.value);
    if (selectedValues.length === availableValues.length) {
      onChange([]);
    } else {
      onChange(availableValues);
    }
  };

  const buttonColorClass = selectedValues.length > 0
    ? colorClass === 'green'
      ? 'border-green-500 text-green-400'
      : 'border-blue-500 text-blue-400'
    : 'border-slate-600 text-slate-300';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 bg-slate-700 border rounded-md text-sm hover:bg-slate-600 transition-colors ${buttonColorClass}`}
      >
        <span>{label}</span>
        {selectedValues.length > 0 && (
          <span className={`px-1.5 py-0.5 text-xs rounded ${colorClass === 'green' ? 'bg-green-600' : 'bg-blue-600'} text-white`}>
            {selectedValues.length}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-xl">
          {/* Search */}
          <div className="p-2 border-b border-slate-700">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1.5 text-sm bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between px-3 py-2 border-b border-slate-700 text-xs">
            <button
              onClick={clearAll}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Clear
            </button>
            <button
              onClick={toggleAll}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Toggle all
            </button>
          </div>

          {/* Options list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => option.available && toggleValue(option.value)}
                  disabled={!option.available && !isSelected}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                    !option.available && !isSelected
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isSelected
                        ? colorClass === 'green'
                          ? 'bg-green-600 border-green-600'
                          : 'bg-blue-600 border-blue-600'
                        : 'border-slate-500'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span>{option.value}</span>
                </button>
              );
            })}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-4 text-sm text-slate-500 text-center">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
