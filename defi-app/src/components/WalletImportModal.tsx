import { useState, useEffect, useRef } from 'react';
import type { ScannedToken } from '../types/pool';
import { scanWalletTokens, isValidEthAddress, SUPPORTED_CHAINS } from '../utils/walletScanner';
import { addUnmappedPositions } from '../utils/unmappedPositions';

interface WalletImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

type ScanStatus = 'idle' | 'scanning' | 'done' | 'error';

export function WalletImportModal({ isOpen, onClose, onImportComplete }: WalletImportModalProps) {
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedChains, setSelectedChains] = useState<string[]>(SUPPORTED_CHAINS);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [chainStatuses, setChainStatuses] = useState<Record<string, 'pending' | 'scanning' | 'done' | 'error' | 'fetching_prices'>>({});
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);
  const [scannedTokens, setScannedTokens] = useState<ScannedToken[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

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
    setWalletAddress('');
    setSelectedChains(SUPPORTED_CHAINS);
    setScanStatus('idle');
    setChainStatuses({});
    setScannedTokens([]);
    setSelectedTokens(new Set());
    setError(null);
    setIsImporting(false);
    setIsFetchingPrices(false);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleChainToggle = (chain: string) => {
    setSelectedChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain]
    );
  };

  const handleScan = async () => {
    if (!isValidEthAddress(walletAddress)) {
      setError('Please enter a valid Ethereum address (0x...)');
      return;
    }

    if (selectedChains.length === 0) {
      setError('Please select at least one chain to scan');
      return;
    }

    setError(null);
    setScanStatus('scanning');
    setScannedTokens([]);
    setSelectedTokens(new Set());

    // Initialize chain statuses
    const initialStatuses: Record<string, 'pending' | 'scanning' | 'done' | 'error'> = {};
    selectedChains.forEach((chain) => {
      initialStatuses[chain] = 'pending';
    });
    setChainStatuses(initialStatuses);

    try {
      const tokens = await scanWalletTokens(walletAddress, selectedChains, (chain, status) => {
        if (status === 'fetching_prices') {
          setIsFetchingPrices(true);
        } else {
          setChainStatuses((prev) => ({ ...prev, [chain]: status }));
        }
      });

      setScannedTokens(tokens);
      // Select all tokens by default
      setSelectedTokens(new Set(tokens.map((t) => `${t.chain}-${t.tokenAddress}`)));
      setScanStatus('done');
    } catch (err) {
      console.error('Scan error:', err);
      setError(err instanceof Error ? err.message : 'Failed to scan wallet');
      setScanStatus('error');
    }
  };

  const handleTokenToggle = (token: ScannedToken) => {
    const key = `${token.chain}-${token.tokenAddress}`;
    setSelectedTokens((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedTokens(new Set(scannedTokens.map((t) => `${t.chain}-${t.tokenAddress}`)));
  };

  const handleSelectNone = () => {
    setSelectedTokens(new Set());
  };

  const handleImport = async () => {
    const tokensToImport = scannedTokens.filter((t) =>
      selectedTokens.has(`${t.chain}-${t.tokenAddress}`)
    );

    if (tokensToImport.length === 0) {
      setError('Please select at least one token to import');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      await addUnmappedPositions(walletAddress, tokensToImport);
      onImportComplete();
      onClose();
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to import tokens');
    } finally {
      setIsImporting(false);
    }
  };

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) return `${(balance / 1000000).toFixed(2)}M`;
    if (balance >= 1000) return `${(balance / 1000).toFixed(2)}K`;
    if (balance >= 1) return balance.toFixed(2);
    if (balance >= 0.0001) return balance.toFixed(4);
    return balance.toExponential(2);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-lg max-w-2xl w-full border border-slate-600 shadow-xl animate-in fade-in duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 shrink-0">
          <h3 className="text-lg font-semibold text-white">Import from Wallet</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Wallet Address Input */}
          <div>
            <label htmlFor="walletAddress" className="block text-sm font-medium text-slate-300 mb-1">
              Wallet Address
            </label>
            <input
              type="text"
              id="walletAddress"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value.trim())}
              placeholder="0x..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              autoFocus
              disabled={scanStatus === 'scanning'}
            />
          </div>

          {/* Chain Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Chains to Scan
            </label>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_CHAINS.map((chain) => (
                <button
                  key={chain}
                  type="button"
                  onClick={() => handleChainToggle(chain)}
                  disabled={scanStatus === 'scanning'}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedChains.includes(chain)
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  } ${scanStatus === 'scanning' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {chain}
                  {chainStatuses[chain] === 'scanning' && (
                    <span className="ml-1.5 inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {chainStatuses[chain] === 'done' && <span className="ml-1.5 text-green-400">✓</span>}
                  {chainStatuses[chain] === 'error' && <span className="ml-1.5 text-red-400">✗</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Scan Button */}
          {scanStatus !== 'done' && (
            <button
              type="button"
              onClick={handleScan}
              disabled={scanStatus === 'scanning' || !walletAddress}
              className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {scanStatus === 'scanning' ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isFetchingPrices ? 'Fetching prices...' : 'Scanning...'}
                </>
              ) : (
                'Scan Wallet'
              )}
            </button>
          )}

          {/* Scanned Tokens */}
          {scanStatus === 'done' && scannedTokens.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">
                  Found Tokens ({scannedTokens.length})
                </label>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={handleSelectNone}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    Select None
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg border border-slate-700 max-h-64 overflow-y-auto">
                {scannedTokens.map((token) => {
                  const key = `${token.chain}-${token.tokenAddress}`;
                  const isSelected = selectedTokens.has(key);

                  return (
                    <div
                      key={key}
                      onClick={() => handleTokenToggle(token)}
                      className={`flex items-center gap-3 p-3 border-b border-slate-700/50 last:border-0 cursor-pointer transition-colors ${
                        isSelected ? 'bg-purple-900/20' : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTokenToggle(token)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {token.tokenSymbol || 'Unknown'}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">
                            {token.chain}
                          </span>
                        </div>
                        {token.tokenName && (
                          <div className="text-xs text-slate-500 truncate">{token.tokenName}</div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-white font-medium">
                          {formatBalance(token.balanceFormatted)}
                        </div>
                        {token.usdValue !== null && (
                          <div className="text-xs text-green-400">
                            ${token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Tokens Found */}
          {scanStatus === 'done' && scannedTokens.length === 0 && (
            <div className="p-6 text-center text-slate-400">
              <div className="text-4xl mb-2">🔍</div>
              <div>No tokens found in this wallet on the selected chains.</div>
            </div>
          )}
        </div>

        {/* Footer */}
        {scanStatus === 'done' && scannedTokens.length > 0 && (
          <div className="p-4 border-t border-slate-700 shrink-0">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setScanStatus('idle');
                  setScannedTokens([]);
                }}
                className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Scan Again
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={selectedTokens.size === 0 || isImporting}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import ${selectedTokens.size} Token${selectedTokens.size !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Imported tokens will appear as unmapped positions. You'll link each to a DeFiLlama pool.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
