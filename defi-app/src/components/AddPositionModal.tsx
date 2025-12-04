import { useState, useEffect, useRef } from 'react';
import type { Pool } from '../types/pool';

interface AddPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (amountUsd: number, entryDate: string) => void;
  pool: Pool | null;
}

export function AddPositionModal({ isOpen, onClose, onAdd, pool }: AddPositionModalProps) {
  const [amountUsd, setAmountUsd] = useState('');
  const [entryDate, setEntryDate] = useState(() => {
    // Default to today's date
    return new Date().toISOString().split('T')[0];
  });

  // Use ref to avoid recreating the handler
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    // Reset form when opening
    setAmountUsd('');
    setEntryDate(new Date().toISOString().split('T')[0]);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountUsd) || 0;
    onAdd(amount, entryDate);
    onClose();
  };

  if (!isOpen || !pool) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-lg max-w-md w-full border border-slate-600 shadow-xl animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Add Position</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Pool Info */}
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-white font-medium">{pool.symbol}</div>
            <div className="text-sm text-slate-400">
              {pool.project} on {pool.chain}
            </div>
            <div className="text-sm text-green-400 mt-1">
              Current APY: {pool.apy?.toFixed(2)}%
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1">
              Position Value (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                id="amount"
                value={amountUsd}
                onChange={(e) => setAmountUsd(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-7 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              How much USD value do you have in this position?
            </p>
          </div>

          {/* Entry Date Input */}
          <div>
            <label htmlFor="entryDate" className="block text-sm font-medium text-slate-300 mb-1">
              Entry Date
            </label>
            <input
              type="date"
              id="entryDate"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">
              When did you enter this position?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium"
            >
              Add Position
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
