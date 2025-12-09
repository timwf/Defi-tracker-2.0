import { useState, useEffect, useRef } from 'react';
import type { Pool, Filters, HeldPosition } from '../types/pool';
import { ANALYSIS_OPTIONS, type AnalysisType, exportPoolsForAI, downloadExport } from '../utils/exportData';
import { isCacheValid } from '../utils/historicalData';

interface AIExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  visiblePools: Pool[];
  visiblePoolIds: string[];
  filters: Filters;
  heldPositions: HeldPosition[];
}

export function AIExportModal({
  isOpen,
  onClose,
  visiblePools,
  visiblePoolIds,
  filters,
  heldPositions,
}: AIExportModalProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisType>('find-opportunities');
  const [customPrompt, setCustomPrompt] = useState('');

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

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const cachedCount = visiblePoolIds.filter(id => isCacheValid(id)).length;
  const missingCount = visiblePoolIds.length - cachedCount;

  const handleExport = () => {
    const selectedOption = ANALYSIS_OPTIONS.find(o => o.id === selectedAnalysis);
    const prompt = selectedAnalysis === 'custom' ? customPrompt : selectedOption?.prompt || '';

    const data = exportPoolsForAI(visiblePools, filters, heldPositions, prompt);
    downloadExport(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-lg max-w-lg w-full border border-slate-600 shadow-xl animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Export for AI Analysis</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Data Summary */}
          <div className="bg-slate-700/50 rounded-lg p-3 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Pools to export:</span>
              <span className="text-white font-medium">{visiblePools.length}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>With historical data:</span>
              <span className={cachedCount === visiblePoolIds.length ? 'text-green-400' : 'text-yellow-400'}>
                {cachedCount}/{visiblePoolIds.length}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Held positions:</span>
              <span className="text-white font-medium">{heldPositions.length}</span>
            </div>
            {missingCount > 0 && (
              <p className="text-xs text-yellow-400 mt-2">
                {missingCount} pools missing historical data. Fetch first for better analysis.
              </p>
            )}
          </div>

          {/* Analysis Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Analysis Type
            </label>
            <div className="space-y-2">
              {ANALYSIS_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedAnalysis === option.id
                      ? 'bg-blue-600/20 border border-blue-500'
                      : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="analysisType"
                    value={option.id}
                    checked={selectedAnalysis === option.id}
                    onChange={() => setSelectedAnalysis(option.id)}
                    className="mt-1 accent-blue-500"
                  />
                  <div>
                    <div className="text-white font-medium">{option.label}</div>
                    <div className="text-sm text-slate-400">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Prompt Textarea */}
          {selectedAnalysis === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Your Prompt
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Enter your analysis prompt..."
                rows={5}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                Tip: Include instructions for web searches if data is missing
              </p>
            </div>
          )}

          {/* Selected Prompt Preview (for non-custom) */}
          {selectedAnalysis !== 'custom' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Prompt Preview
              </label>
              <div className="bg-slate-900 rounded-lg p-3 text-xs text-slate-400 max-h-32 overflow-y-auto font-mono whitespace-pre-wrap">
                {ANALYSIS_OPTIONS.find(o => o.id === selectedAnalysis)?.prompt}
              </div>
            </div>
          )}

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
              onClick={handleExport}
              disabled={visiblePools.length === 0}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download JSON
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            Open the downloaded JSON in Claude, ChatGPT, or your preferred AI assistant
          </p>
        </div>
      </div>
    </div>
  );
}
