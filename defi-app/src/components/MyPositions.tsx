import { useState } from 'react';
import type { Pool, HeldPosition } from '../types/pool';

interface MyPositionsProps {
  positions: HeldPosition[];
  pools: Pool[];
  onAddPosition: (poolId: string) => void;
  onRemovePosition: (poolId: string) => void;
}

export function MyPositions({
  positions,
  pools,
  onAddPosition,
  onRemovePosition,
}: MyPositionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newPoolId, setNewPoolId] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmed = newPoolId.trim();
    if (!trimmed) return;

    // Check if it's a valid pool ID
    const pool = pools.find(p => p.pool === trimmed);
    if (!pool) {
      setError('Pool ID not found in current data');
      return;
    }

    // Check if already added
    if (positions.some(p => p.poolId === trimmed)) {
      setError('Pool already in your positions');
      return;
    }

    onAddPosition(trimmed);
    setNewPoolId('');
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  // Get pool info for held positions
  const heldPoolsInfo = positions
    .map(pos => {
      const pool = pools.find(p => p.pool === pos.poolId);
      return pool ? { position: pos, pool } : null;
    })
    .filter((x): x is { position: HeldPosition; pool: Pool } => x !== null);

  return (
    <div className="bg-slate-800 p-3 rounded-lg mb-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-2"
        >
          <span>{isExpanded ? '▼' : '▶'}</span>
          My Positions ({positions.length})
        </button>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newPoolId}
            onChange={(e) => {
              setNewPoolId(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Paste pool ID..."
            className="px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 w-64 font-mono text-xs"
          />
          <button
            onClick={handleAdd}
            disabled={!newPoolId.trim()}
            className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Position
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}

      {isExpanded && (
        <div className="mt-3">
          {heldPoolsInfo.length > 0 ? (
            <div className="space-y-2">
              {heldPoolsInfo.map(({ position, pool }) => (
                <div
                  key={position.poolId}
                  className="flex items-center justify-between bg-slate-700/50 rounded px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-400 text-lg">★</span>
                    <div>
                      <div className="text-sm text-white font-medium">
                        {pool.symbol}
                        <span className="text-slate-400 font-normal ml-2">
                          {pool.project} · {pool.chain}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {position.poolId.substring(0, 20)}...
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-green-400">{pool.apy.toFixed(2)}% APY</div>
                      <div className="text-xs text-slate-400">
                        ${(pool.tvlUsd / 1_000_000).toFixed(1)}M TVL
                      </div>
                    </div>
                    <button
                      onClick={() => onRemovePosition(position.poolId)}
                      className="text-slate-400 hover:text-red-400 p-1"
                      title="Remove from positions"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No positions added yet. Paste a pool ID from DefiLlama to track it.
            </p>
          )}

          <p className="text-xs text-slate-500 mt-3">
            Tip: Copy the pool ID from the DefiLlama URL (e.g., aa70268e-4b52-42bf-a116-608b370f9501)
          </p>
        </div>
      )}
    </div>
  );
}
