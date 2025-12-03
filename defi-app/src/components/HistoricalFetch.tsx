import { useState, useEffect, useMemo, useRef } from 'react';
import type { Pool, Filters, HeldPosition } from '../types/pool';
import type { FetchProgress } from '../utils/historicalData';
import { isCacheValid, getUncachedPoolIds } from '../utils/historicalData';
import { exportPoolsForAI, downloadExport, copyExportToClipboard } from '../utils/exportData';

// Custom hook to track previous value
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

interface HistoricalFetchProps {
  visiblePoolIds: string[];
  visiblePools: Pool[];
  filters: Filters;
  heldPositions: HeldPosition[];
  onFetchStart: () => void;
  onFetchComplete: () => void;
  onFetchPools: (poolIds: string[]) => Promise<void>;
  onCancelFetch: () => void;
  isFetching: boolean;
  progress: FetchProgress | null;
  historicalDataVersion: number;
}

export function HistoricalFetch({
  visiblePoolIds,
  visiblePools,
  filters,
  heldPositions,
  onFetchStart,
  onFetchComplete,
  onFetchPools,
  onCancelFetch,
  isFetching,
  progress,
  historicalDataVersion,
}: HistoricalFetchProps) {
  const [copied, setCopied] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  // Count how many visible pools have cached data (recalculate when version changes)
  const cachedVisibleCount = useMemo(() =>
    visiblePoolIds.filter(id => isCacheValid(id)).length,
    [visiblePoolIds, historicalDataVersion]
  );

  // Get uncached pool IDs
  const uncachedPoolIds = useMemo(() =>
    getUncachedPoolIds(visiblePoolIds),
    [visiblePoolIds, historicalDataVersion]
  );

  const needsFetching = uncachedPoolIds.length;
  const allLoaded = needsFetching === 0 && visiblePoolIds.length > 0;

  // Show completion message briefly
  const prevIsFetching = usePrevious(isFetching);
  useEffect(() => {
    if (prevIsFetching && !isFetching) {
      setJustCompleted(true);
      const timer = setTimeout(() => setJustCompleted(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isFetching, prevIsFetching]);

  const handleFetchVisible = async () => {
    if (uncachedPoolIds.length === 0) return;

    onFetchStart();
    await onFetchPools(uncachedPoolIds);
    onFetchComplete();
  };

  const handleExportDownload = () => {
    const data = exportPoolsForAI(visiblePools, filters, heldPositions);
    downloadExport(data);
  };

  const handleExportCopy = async () => {
    const data = exportPoolsForAI(visiblePools, filters, heldPositions);
    await copyExportToClipboard(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Only estimate time for uncached pools (3 parallel + 300ms between batches)
  const estimatedSeconds = Math.ceil(needsFetching / 3) * 0.6; // ~0.6s per batch of 3
  const estimatedTime = Math.ceil(estimatedSeconds / 60);

  return (
    <div className="bg-slate-800 p-3 rounded-lg mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-sm text-slate-300">
            Historical
          </span>

          {/* Status: loaded count or progress */}
          {isFetching && progress ? (
            <div className="flex items-center gap-2">
              <div className="w-20 sm:w-32 bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-400">
                {progress.current}/{progress.total}
              </span>
            </div>
          ) : (
            <span className={`text-xs ${justCompleted ? 'text-green-400' : 'text-slate-500'}`}>
              {cachedVisibleCount}/{visiblePoolIds.length} loaded
              {justCompleted && ' ✓'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {isFetching ? (
            <button
              onClick={() => {
                onCancelFetch();
                onFetchComplete();
              }}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-red-600 text-white rounded hover:bg-red-500 flex items-center gap-1 sm:gap-2"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={handleFetchVisible}
              disabled={allLoaded || visiblePoolIds.length === 0}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-purple-600 text-white rounded hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2"
            >
              {allLoaded ? (
                'All Loaded'
              ) : (
                <>
                  <span className="hidden sm:inline">Fetch</span>
                  <span>({needsFetching})</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center">
            <button
              onClick={handleExportCopy}
              disabled={visiblePools.length === 0}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-green-600 text-white rounded-l hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy JSON to clipboard for AI analysis"
            >
              {copied ? 'Copied!' : <><span className="hidden sm:inline">Export</span><span className="sm:hidden">Copy</span></>}
            </button>
            <button
              onClick={handleExportDownload}
              disabled={visiblePools.length === 0}
              className="px-2 py-1.5 text-xs sm:text-sm bg-green-700 text-white rounded-r hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download as JSON file"
            >
              ↓
            </button>
          </div>
        </div>
      </div>

      {!isFetching && needsFetching > 5 && (
        <p className="text-xs text-slate-500 mt-2 hidden sm:block">
          Est. time: ~{estimatedSeconds < 60 ? `${Math.ceil(estimatedSeconds)}s` : `${estimatedTime} min`}
        </p>
      )}
    </div>
  );
}
