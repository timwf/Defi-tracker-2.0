import { useState, useEffect, useMemo, useRef } from 'react';
import type { Pool, Filters, HeldPosition } from '../types/pool';
import type { FetchProgress } from '../utils/historicalData';
import { isCacheValid, getUncachedPoolIds, clearCache, getCacheStats } from '../utils/historicalData';
import { exportPoolsForAI, downloadExport } from '../utils/exportData';

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
  onClearCache: () => void;
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
  onClearCache,
  isFetching,
  progress,
  historicalDataVersion,
}: HistoricalFetchProps) {
  const [justCompleted, setJustCompleted] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

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

  // Track errors during fetch
  useEffect(() => {
    if (progress?.status === 'error') {
      setErrorCount(c => c + 1);
    }
  }, [progress]);

  // Show completion message briefly and reset error count
  const prevIsFetching = usePrevious(isFetching);
  useEffect(() => {
    if (prevIsFetching && !isFetching) {
      setJustCompleted(true);
      const timer = setTimeout(() => {
        setJustCompleted(false);
        setErrorCount(0);
      }, 5000);
      return () => clearTimeout(timer);
    }
    if (!prevIsFetching && isFetching) {
      setErrorCount(0);
    }
  }, [isFetching, prevIsFetching]);

  // Get total cache size
  const cacheStats = useMemo(() => getCacheStats(), [historicalDataVersion]);

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

  const handleClearCache = () => {
    if (confirm(`Clear all cached historical data? (${cacheStats.total} pools)`)) {
      clearCache();
      onClearCache();
    }
  };

  // Estimate time: 1.5 seconds per pool (sequential)
  const estimatedSeconds = needsFetching * 1.5;
  const estimatedTime = Math.ceil(estimatedSeconds / 60);

  return (
    <div className="bg-slate-800 p-4 rounded-lg mb-4">
      {/* Main Fetch Section */}
      {!allLoaded && !isFetching && (
        <div className="mb-4">
          <p className="text-sm text-slate-300 mb-2">
            Load 90-day history to see Avg90, volatility, and TVL trends
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleFetchVisible}
              disabled={visiblePoolIds.length === 0}
              className="w-full sm:w-auto px-6 py-3 text-base font-semibold bg-yellow-500 text-slate-900 rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Fetch Historical Data ({needsFetching} pools)
            </button>
            {cacheStats.total > 0 && (
              <button
                onClick={handleClearCache}
                className="text-xs text-slate-500 hover:text-red-400 underline"
                title={`Clear all cached historical data (${cacheStats.total} pools)`}
              >
                Not fetching? Clear history cache
              </button>
            )}
          </div>
          {needsFetching > 5 && (
            <p className="text-xs text-slate-500 mt-2">
              Est. time: ~{estimatedSeconds < 60 ? `${Math.ceil(estimatedSeconds)}s` : `${estimatedTime} min`}
            </p>
          )}
        </div>
      )}

      {/* Progress bar when fetching */}
      {isFetching && progress && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Fetching historical data...</span>
            <span className="text-sm text-slate-400">
              {progress.current}/{progress.total}
              {errorCount > 0 && <span className="text-red-400 ml-1">({errorCount} failed)</span>}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 mb-3">
            <div
              className="bg-yellow-500 h-3 rounded-full transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <button
            onClick={() => {
              onCancelFetch();
              onFetchComplete();
            }}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-500"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Completion message */}
      {justCompleted && !isFetching && (
        <div className={`mb-4 p-3 rounded-lg ${errorCount > 0 ? 'bg-yellow-900/30 text-yellow-300' : 'bg-green-900/30 text-green-300'}`}>
          {errorCount > 0 ? `Completed with ${errorCount} errors` : 'Historical data loaded successfully!'}
        </div>
      )}

      {/* Status bar with export options */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className={`text-sm ${allLoaded ? 'text-green-400' : 'text-slate-400'}`}>
            {cachedVisibleCount}/{visiblePoolIds.length} pools have historical data
            {allLoaded && ' ✓'}
          </span>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1">
          <button
            onClick={handleExportDownload}
            disabled={visiblePools.length === 0}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download current filtered view with historical data as JSON - ideal for AI analysis"
          >
            Export JSON
          </button>
          <span className="text-xs text-slate-500">Current view + historical data (for AI)</span>
        </div>
      </div>
    </div>
  );
}
