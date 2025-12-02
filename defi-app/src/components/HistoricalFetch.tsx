import { useState } from 'react';
import type { Pool, Filters, HeldPosition } from '../types/pool';
import type { FetchProgress } from '../utils/historicalData';
import { getCacheStats } from '../utils/historicalData';
import { exportPoolsForAI, downloadExport, copyExportToClipboard } from '../utils/exportData';

interface HistoricalFetchProps {
  visiblePoolIds: string[];
  visiblePools: Pool[];
  filters: Filters;
  heldPositions: HeldPosition[];
  onFetchStart: () => void;
  onFetchComplete: () => void;
  onFetchPools: (poolIds: string[], onProgress: (p: FetchProgress) => void) => Promise<void>;
  isFetching: boolean;
}

export function HistoricalFetch({
  visiblePoolIds,
  visiblePools,
  filters,
  heldPositions,
  onFetchStart,
  onFetchComplete,
  onFetchPools,
  isFetching,
}: HistoricalFetchProps) {
  const [progress, setProgress] = useState<FetchProgress | null>(null);
  const [copied, setCopied] = useState(false);
  const cacheStats = getCacheStats();

  const handleFetchVisible = async () => {
    if (visiblePoolIds.length === 0) return;

    onFetchStart();
    setProgress({ current: 0, total: visiblePoolIds.length, poolId: '', status: 'fetching' });

    await onFetchPools(visiblePoolIds, (p) => {
      setProgress(p);
    });

    setProgress(null);
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

  const estimatedTime = Math.ceil((visiblePoolIds.length * 1.5) / 60);

  return (
    <div className="bg-slate-800 p-3 rounded-lg mb-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">
            Historical Data
          </span>
          <span className="text-xs text-slate-500">
            {cacheStats.valid} pools cached
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isFetching && progress && (
            <div className="flex items-center gap-2">
              <div className="w-32 bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-400">
                {progress.current}/{progress.total}
                {progress.status === 'cached' && ' (cached)'}
              </span>
            </div>
          )}

          <button
            onClick={handleFetchVisible}
            disabled={isFetching || visiblePoolIds.length === 0}
            className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isFetching ? (
              <>
                <span className="animate-spin">...</span>
                Fetching...
              </>
            ) : (
              <>
                Fetch Historical ({visiblePoolIds.length} pools)
              </>
            )}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={handleExportCopy}
              disabled={visiblePools.length === 0}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-l hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy JSON to clipboard for AI analysis"
            >
              {copied ? 'Copied!' : 'Export for AI'}
            </button>
            <button
              onClick={handleExportDownload}
              disabled={visiblePools.length === 0}
              className="px-2 py-1.5 text-sm bg-green-700 text-white rounded-r hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download as JSON file"
            >
              ↓
            </button>
          </div>
        </div>
      </div>

      {!isFetching && visiblePoolIds.length > 10 && (
        <p className="text-xs text-slate-500 mt-2">
          Est. time: ~{estimatedTime} min (1.5s delay per request to avoid rate limits)
        </p>
      )}
    </div>
  );
}
