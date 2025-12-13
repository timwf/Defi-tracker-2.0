import { useState } from 'react';
import type { Pool, UnmappedPosition } from '../types/pool';
import { PoolSearchInput } from './PoolSearchInput';
import { linkUnmappedToPool, deleteUnmappedPosition } from '../utils/unmappedPositions';

interface UnmappedPositionsListProps {
  unmappedPositions: UnmappedPosition[];
  pools: Pool[];
  heldPoolIds: string[];
  onPositionLinked: () => void;
  onPositionDeleted: () => void;
}

export function UnmappedPositionsList({
  unmappedPositions,
  pools,
  heldPoolIds,
  onPositionLinked,
  onPositionDeleted,
}: UnmappedPositionsListProps) {
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (unmappedPositions.length === 0) {
    return null;
  }

  const handleStartLink = (position: UnmappedPosition) => {
    setLinkingId(position.id);
    setSelectedPool(null);
    setError(null);
  };

  const handleCancelLink = () => {
    setLinkingId(null);
    setSelectedPool(null);
    setError(null);
  };

  const handleConfirmLink = async (position: UnmappedPosition) => {
    if (!selectedPool) {
      setError('Please select a pool');
      return;
    }

    // Use USD value if available, otherwise use balance as placeholder (user can edit later)
    const amount = position.usdValue ?? position.balanceFormatted;

    setIsSaving(true);
    setError(null);

    try {
      const success = await linkUnmappedToPool(position.id, selectedPool.pool, amount);
      if (success) {
        handleCancelLink();
        onPositionLinked();
      } else {
        setError('Failed to link position');
      }
    } catch (err) {
      console.error('Link error:', err);
      setError(err instanceof Error ? err.message : 'Failed to link position');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (position: UnmappedPosition) => {
    if (!confirm(`Remove ${position.tokenSymbol || 'this token'} from unmapped positions?`)) {
      return;
    }

    try {
      const success = await deleteUnmappedPosition(position.id);
      if (success) {
        onPositionDeleted();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) return `${(balance / 1000000).toFixed(2)}M`;
    if (balance >= 1000) return `${(balance / 1000).toFixed(2)}K`;
    if (balance >= 1) return balance.toFixed(2);
    if (balance >= 0.0001) return balance.toFixed(4);
    return balance.toExponential(2);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        <h3 className="text-lg font-semibold text-white">
          Unmapped Positions ({unmappedPositions.length})
        </h3>
      </div>

      <div className="bg-slate-800/50 rounded-lg border border-yellow-600/30">
        <div className="p-3 border-b border-slate-700 bg-yellow-900/10">
          <p className="text-sm text-yellow-200/80">
            These tokens were imported from your wallet. Link each to a DeFiLlama pool to track yield.
          </p>
        </div>

        <div className="divide-y divide-slate-700">
          {unmappedPositions.map((position) => {
            const isLinking = linkingId === position.id;

            return (
              <div key={position.id} className="p-4">
                {/* Token Info Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-white">
                      {(position.tokenSymbol || '?')[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {position.tokenSymbol || 'Unknown Token'}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">
                          {position.chain}
                        </span>
                      </div>
                      {position.tokenName && (
                        <div className="text-xs text-slate-500">{position.tokenName}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {formatBalance(position.balanceFormatted)} {position.tokenSymbol || ''}
                      </div>
                      {position.usdValue !== null && (
                        <div className="text-xs text-slate-400">
                          ~${position.usdValue.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {!isLinking && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartLink(position)}
                          className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-500 transition-colors"
                        >
                          Link to Pool
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(position)}
                          className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Linking UI */}
                {isLinking && (
                  <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Select DeFiLlama Pool
                      </label>
                      <PoolSearchInput
                        pools={pools}
                        onSelect={setSelectedPool}
                        selectedPool={selectedPool}
                        onClear={() => setSelectedPool(null)}
                        excludePoolIds={[]}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Search for the pool where this token is deposited
                      </p>
                    </div>

                    {error && (
                      <div className="text-sm text-red-400">{error}</div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCancelLink}
                        className="flex-1 px-3 py-2 bg-slate-700 text-slate-300 text-sm rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmLink(position)}
                        disabled={!selectedPool || isSaving}
                        className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Linking...
                          </>
                        ) : (
                          'Confirm Link'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
